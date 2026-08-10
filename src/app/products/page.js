"use client";
import React, { useEffect, useState, useRef } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, uploadMediaFile, getLogisticsHubs } from '../../lib/api';

const CAPACITY_PRESETS = [
  '1kW - 3kW',
  '3kW',
  '5kW',
  '5kW - 10kW',
  '10kW',
  '10kW+ Commercial',
];

const parseSpecificationsText = (text) => {
  if (!text) return [];
  return text.split('\n')
    .filter(line => line.includes(':'))
    .map(line => {
      const idx = line.indexOf(':');
      return {
        label: line.slice(0, idx).trim(),
        value: line.slice(idx + 1).trim()
      };
    })
    .filter(spec => spec.label && spec.value);
};

const formatSpecificationsJson = (specs) => {
  if (!specs) return '';
  const arr = Array.isArray(specs) ? specs : [];
  return arr.map(spec => `${spec.label}: ${spec.value}`).join('\n');
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [replaceIndex, setReplaceIndex] = useState(null);
  const replaceInputRef = useRef(null);
  
  const [actionStatus, setActionStatus] = useState(null);

  // Form State for Add Product
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category_id: '',
    sku: '',
    capacity: '',
    price: '',
    original_price: '',
    warranty: '10-25 Years Warranty',
    stock: '',
    hub_id: '',
    image_url: '',
    images: [],
    description: '',
    features: '',
    delivery_time: '2-4 Business Days',
    specifications: '',
    variants: []
  });

  const [variantInput, setVariantInput] = useState({ name: '', sku: '', price: '', original_price: '', size: '', stock: '', hub_id: '', specifications: '' });

  // Form State for Edit Product
  const [editProduct, setEditProduct] = useState(null);

  const loadProducts = async () => {
    const [data, catData, hubsData] = await Promise.all([
      getProducts(),
      getCategories(),
      getLogisticsHubs()
    ]);
    setProducts(data || []);
    if (catData) setCategories(catData);
    if (hubsData) setHubs(hubsData);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleProductImageUpload = async (e, isEdit = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    
    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadedUrl = await uploadMediaFile(file, 'products');
      if (uploadedUrl) {
        uploadedUrls.push(uploadedUrl);
      }
    }

    if (uploadedUrls.length > 0) {
      if (isEdit) {
        setEditProduct(prev => {
          const currentImages = Array.isArray(prev.images) ? prev.images : (prev.image_url ? [prev.image_url] : []);
          const updatedImages = [...currentImages, ...uploadedUrls];
          return {
            ...prev,
            images: updatedImages,
            image_url: prev.image_url || updatedImages[0] || ''
          };
        });
      } else {
        setNewProduct(prev => {
          const currentImages = Array.isArray(prev.images) ? prev.images : (prev.image_url ? [prev.image_url] : []);
          const updatedImages = [...currentImages, ...uploadedUrls];
          return {
            ...prev,
            images: updatedImages,
            image_url: prev.image_url || updatedImages[0] || ''
          };
        });
      }
    }
    setUploading(false);
  };

  const triggerReplaceImage = (index) => {
    setReplaceIndex(index);
    setTimeout(() => {
      if (replaceInputRef.current) {
        replaceInputRef.current.value = ""; // clear selector cache to trigger onChange every time
        replaceInputRef.current.click();
      }
    }, 50);
  };

  const handleReplaceImageUpload = async (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file || replaceIndex === null) return;
    setUploading(true);
    const uploadedUrl = await uploadMediaFile(file, 'products');
    if (uploadedUrl) {
      const setProduct = isEdit ? setEditProduct : setNewProduct;
      setProduct(prev => {
        const currentImages = Array.isArray(prev.images) ? [...prev.images] : [];
        const oldUrl = currentImages[replaceIndex];
        currentImages[replaceIndex] = uploadedUrl;
        
        let newPrimary = prev.image_url;
        if (prev.image_url === oldUrl) {
          newPrimary = uploadedUrl;
        }
        return {
          ...prev,
          images: currentImages,
          image_url: newPrimary
        };
      });
    }
    setReplaceIndex(null);
    setUploading(false);
  };

  const moveImage = (index, direction, isEdit = false) => {
    const setProduct = isEdit ? setEditProduct : setNewProduct;
    setProduct(prev => {
      const currentImages = Array.isArray(prev.images) ? [...prev.images] : [];
      if (currentImages.length === 0) return prev;
      
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= currentImages.length) return prev;
      
      const temp = currentImages[index];
      currentImages[index] = currentImages[newIndex];
      currentImages[newIndex] = temp;
      
      return {
        ...prev,
        images: currentImages
      };
    });
  };

  const removeProductImage = (index, isEdit = false) => {
    const setProduct = isEdit ? setEditProduct : setNewProduct;
    setProduct(prev => {
      const currentImages = Array.isArray(prev.images) ? [...prev.images] : [];
      const imageToRemove = currentImages[index];
      const updatedImages = currentImages.filter((_, idx) => idx !== index);
      
      let updatedImageUrl = prev.image_url;
      if (prev.image_url === imageToRemove) {
        updatedImageUrl = updatedImages[0] || '';
      }
      
      return {
        ...prev,
        images: updatedImages,
        image_url: updatedImageUrl
      };
    });
  };

  const setPrimaryProductImage = (imageUrl, isEdit = false) => {
    const setProduct = isEdit ? setEditProduct : setNewProduct;
    setProduct(prev => ({
      ...prev,
      image_url: imageUrl
    }));
  };

  const autoGenerateSku = (isEdit = false) => {
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const generated = `EMI-${randomCode}`;
    if (isEdit) {
      setEditProduct(prev => ({ ...prev, sku: generated }));
    } else {
      setNewProduct(prev => ({ ...prev, sku: generated }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const hasVariants = newProduct.variants && newProduct.variants.length > 0;
    
    // Auto-add pending variant if they filled it out but forgot to click Add
    const hasPendingVariant = variantInput.name || variantInput.sku || variantInput.price;
    if (hasPendingVariant) {
      alert("You have unsaved variant data! Please click '+ Add Variant to List' before saving the product or clear the variant inputs.");
      return;
    }

    if (!newProduct.name || !newProduct.sku) {
      alert("Please provide the Product Name and SKU.");
      return;
    }
    
    if (!hasVariants && !newProduct.price) {
      alert("Please provide a Selling Price since there are no variants.");
      return;
    }

    setActionStatus({ type: 'loading', message: 'Creating solar product...' });

    const featureList = newProduct.features 
      ? newProduct.features.split('\n').filter(f => f.trim() !== '')
      : [
          'High-efficiency solar technology built for maximum energy yield',
          'Heavy-duty weatherproof & corrosion resistant construction',
          'Eligible for PM Surya Ghar Yojana Government Subsidy'
        ];
    
    try {
      await createProduct({
        name: newProduct.name,
        brand: newProduct.brand || 'ENERGY MALL',
        category_id: newProduct.category_id || null,
        sku: newProduct.sku,
        capacity: newProduct.capacity || null,
        price: parseFloat(newProduct.price),
        original_price: (newProduct.original_price && newProduct.original_price !== '') ? parseFloat(newProduct.original_price) : null,
        warranty: newProduct.warranty || '10-25 Years',
        stock: parseInt(newProduct.stock || 0, 10),
        hub_id: newProduct.hub_id || null,
        image: newProduct.image_url || null,
        images: Array.isArray(newProduct.images) ? newProduct.images : (newProduct.image_url ? [newProduct.image_url] : []),
        description: newProduct.description,
        features: featureList,
        delivery_time: newProduct.delivery_time || '2-4 Business Days',
        specifications: parseSpecificationsText(newProduct.specifications),
        is_active: true,
        variants: (newProduct.variants || []).map(v => ({ 
          ...v, 
          hub_id: v.hub_id || newProduct.hub_id || null,
          specifications: v.specifications ? parseSpecificationsText(v.specifications) : null
        }))
      });

      setActionStatus({ type: 'success', message: `Product "${newProduct.name}" created successfully!` });
      setTimeout(() => setActionStatus(null), 3000);

      setNewProduct({
        name: '',
        brand: '',
        category_id: '',
        sku: '',
        capacity: '',
        price: '',
        original_price: '',
        warranty: '10-25 Years Warranty',
        stock: '',
        hub_id: '',
        image_url: '',
        images: [],
        description: '',
        features: '',
        delivery_time: '2-4 Business Days',
        specifications: '',
        variants: []
      });
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Failed to create product: ' + err.message });
      setTimeout(() => setActionStatus(null), 5000);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editProduct || !editProduct.id || !editProduct.name) return;

    const hasVariants = editProduct.variants && editProduct.variants.length > 0;
    
    const hasPendingVariant = variantInput.name || variantInput.sku || variantInput.price;
    if (hasPendingVariant) {
      alert("You have unsaved variant data! Please click '+ Add Variant to List' before saving the product or clear the variant inputs.");
      return;
    }

    if (!hasVariants && !editProduct.price) {
      alert("Please provide a Selling Price since there are no variants.");
      return;
    }

    setActionStatus({ type: 'loading', message: 'Saving product updates & synchronizing media assets...' });

    const featureList = editProduct.features 
      ? editProduct.features.split('\n').filter(f => f.trim() !== '')
      : [];

    try {
      await updateProduct(editProduct.id, {
        name: editProduct.name,
        brand: editProduct.brand || 'ENERGY MALL',
        category_id: editProduct.category_id || null,
        sku: editProduct.sku,
        capacity: editProduct.capacity || null,
        price: parseFloat(editProduct.price),
        original_price: (editProduct.original_price && editProduct.original_price !== '') ? parseFloat(editProduct.original_price) : null,
        warranty: editProduct.warranty,
        stock: parseInt(editProduct.stock || 0, 10),
        hub_id: editProduct.hub_id || null,
        image: editProduct.image_url || null,
        images: Array.isArray(editProduct.images) ? editProduct.images : (editProduct.image_url ? [editProduct.image_url] : []),
        description: editProduct.description,
        features: featureList,
        delivery_time: editProduct.delivery_time || '2-4 Business Days',
        specifications: parseSpecificationsText(editProduct.specifications),
        variants: (editProduct.variants || []).map(v => ({ 
          ...v, 
          hub_id: v.hub_id || editProduct.hub_id || null,
          specifications: v.specifications ? parseSpecificationsText(v.specifications) : null
        }))
      });

      setActionStatus({ type: 'success', message: `Product "${editProduct.name}" saved successfully!` });
      setTimeout(() => setActionStatus(null), 3000);

      setIsEditModalOpen(false);
      setEditProduct(null);
      loadProducts();
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Failed to update product: ' + err.message });
      setTimeout(() => setActionStatus(null), 5000);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  const openEditModal = (product) => {
    // Extract base product hub_id if available
    const baseInventory = (product.hub_inventories || []).find(hi => hi.variant_id === null);
    
    setEditProduct({
      id: product.id,
      name: product.name || '',
      brand: product.brand || '',
      category_id: product.category_id || '',
      sku: product.sku || '',
      capacity: product.capacity || '',
      price: product.price ? String(product.price) : '',
      original_price: product.original_price ? String(product.original_price) : '',
      warranty: product.warranty || '10-25 Years Warranty',
      stock: product.stock !== undefined ? String(product.stock) : '',
      hub_id: baseInventory ? baseInventory.hub_id : '',
      image_url: product.image || product.image_url || '',
      images: Array.isArray(product.images) ? product.images : (product.image || product.image_url ? [product.image || product.image_url] : []),
      description: product.description || '',
      features: Array.isArray(product.features) ? product.features.join('\n') : '',
      delivery_time: product.delivery_time || '2-4 Business Days',
      specifications: formatSpecificationsJson(product.specifications || product.specs),
      variants: product.variants ? product.variants.map(v => {
         const vInv = (v.hub_inventories || []).find(hi => hi.hub_id);
         return {
           ...v,
           hub_id: vInv ? vInv.hub_id : '',
           specifications: formatSpecificationsJson(v.specifications)
         };
      }) : []
    });
    setIsEditModalOpen(true);
  };

  const calculateDiscount = (price, originalPrice) => {
    const p = parseFloat(price);
    const op = parseFloat(originalPrice);
    if (p > 0 && op > p) {
      return Math.round(((op - p) / op) * 100);
    }
    return 0;
  };

  const filtered = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()) ||
    p.capacity?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {actionStatus && (
        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between border transition-all ${
          actionStatus.type === 'loading' ? 'bg-slate-50 border-slate-200 text-slate-700 animate-pulse' :
          actionStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="flex items-center gap-2">
            {actionStatus.type === 'loading' ? '⏳' : actionStatus.type === 'success' ? '✅' : '❌'}
            {actionStatus.message}
          </span>
          {actionStatus.type !== 'loading' && (
            <button onClick={() => setActionStatus(null)} className="text-slate-400 hover:text-slate-600 font-bold ml-2">✕</button>
          )}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">Manage solar inventory, system kW capacities, technical specifications, and Supabase Storage product imagery.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center"
            title="Refresh Products"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-80">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search by name, brand, SKU, capacity (e.g. 3kW)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
            />
          </div>
          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            Total Products: <span className="text-emerald-600 font-bold">{filtered.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading products...</div>
          ) : filtered.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name / Brand</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price (₹)</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filtered.map(product => {
                  const hasStock = (product.stock || 0) > 0;
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 font-bold overflow-hidden shadow-xs">
                            {product.image || product.image_url ? (
                              <img src={product.image || product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              '☀️'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{product.name}</div>
                            <div className="text-xs text-slate-400 font-medium">{product.brand || 'ENERGY MALL'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono font-medium">
                        {product.sku}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.capacity ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            ⚡ {product.capacity}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Standard</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-extrabold text-slate-900">₹{Number(product.price).toLocaleString('en-IN')}</div>
                        {product.original_price && Number(product.original_price) > Number(product.price) && (
                          <div className="text-xs text-slate-400 line-through font-medium">₹{Number(product.original_price).toLocaleString('en-IN')}</div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                          hasStock ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {product.stock || 0} in stock
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">No products found matching search.</div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/60 w-full max-w-3xl flex flex-col max-h-[95vh] overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white/80 backdrop-blur-sm z-10">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">➕</span>
                  Add New Solar Product
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">Fill in inventory specs, pricing, and system kW capacity.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto px-6 py-6 bg-slate-50/30">
              <form id="add-product-form" onSubmit={handleCreate} className="space-y-6">
              {/* Section 1: Basic Information */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span>📌</span> Basic Information
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Waaree 540W Mono PERC Solar Panel"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. WAAREE, LUMINOUS"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select 
                      value={newProduct.category_id}
                      onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SKU and Auto-Generate */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">SKU Code *</label>
                    <button 
                      type="button"
                      onClick={() => autoGenerateSku(false)}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      + Auto-Generate
                    </button>
                  </div>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. WMP-540"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Section 2: Solar Capacity */}
              <div className="space-y-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <span>⚡</span> Solar System Capacity (kW)
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Capacity Rating</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 3kW, 5kW, 10kW or 5kW - 10kW"
                    value={newProduct.capacity}
                    onChange={(e) => setNewProduct({ ...newProduct, capacity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-sm font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <div className="text-[11px] font-semibold text-amber-700 mb-1.5">Quick Presets:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {CAPACITY_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setNewProduct({ ...newProduct, capacity: preset })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          newProduct.capacity === preset 
                            ? 'bg-amber-600 text-white shadow-xs' 
                            : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Product Image Upload */}
              <div className="space-y-3 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/60">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">📸 Product Media ({(newProduct.images || []).length} images)</span>
                  <span className="text-[10px] text-emerald-600 font-normal">Click ★ to set as featured</span>
                </div>

                {newProduct.images && newProduct.images.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {newProduct.images.map((imgUrl, index) => {
                      const isPrimary = newProduct.image_url === imgUrl;
                      return (
                        <div key={index} className={`relative rounded-lg border overflow-hidden bg-white p-1 group ${isPrimary ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'}`}>
                          <img src={imgUrl} alt={`Preview ${index}`} className="w-full h-14 object-cover rounded" />
                          
                          <div className="absolute top-1 left-1 flex gap-1">
                            <button
                              type="button"
                              onClick={() => setPrimaryProductImage(imgUrl, false)}
                              title={isPrimary ? "Featured Image" : "Set as Featured"}
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${isPrimary ? 'bg-amber-400 text-white' : 'bg-slate-900/60 text-amber-200 hover:bg-slate-900'}`}
                            >
                              ★
                            </button>
                          </div>

                          <div className="absolute top-1 right-1 flex gap-1">
                            <button
                              type="button"
                              onClick={() => triggerReplaceImage(index)}
                              title="Replace Image"
                              className="w-5 h-5 rounded-md bg-slate-900/60 text-white hover:bg-emerald-600 flex items-center justify-center text-[10px]"
                            >
                              ↻
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProductImage(index, false)}
                              title="Delete Image"
                              className="w-5 h-5 rounded-md bg-slate-900/60 text-white hover:bg-red-600 flex items-center justify-center text-xs"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="absolute bottom-1 left-0 right-0 flex justify-between px-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/70 py-0.5">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveImage(index, -1, false)}
                              className="text-[9px] font-bold text-white disabled:text-slate-500 hover:text-emerald-400"
                            >
                              ◀ L
                            </button>
                            <button
                              type="button"
                              disabled={index === newProduct.images.length - 1}
                              onClick={() => moveImage(index, 1, false)}
                              className="text-[9px] font-bold text-white disabled:text-slate-500 hover:text-emerald-400"
                            >
                              R ▶
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input 
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleProductImageUpload(e, false)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                      💡 Recommended: Square ratio (e.g., 800x800 px) up to 5MB (JPG, PNG, WEBP).
                    </p>
                    {uploading && <p className="text-[11px] text-emerald-600 mt-1 font-bold animate-pulse">Uploading to Supabase CDN...</p>}
                    
                    {/* Hidden replace input */}
                    <input 
                      type="file" 
                      ref={replaceInputRef} 
                      style={{ display: 'none' }} 
                      accept="image/*" 
                      onChange={(e) => handleReplaceImageUpload(e, false)} 
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Pricing, Stock & Hub Location */}
              {(!newProduct.variants || newProduct.variants.length === 0) && (
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">💰 Pricing, Stock & Hub Location</span>
                  {newProduct.price && newProduct.original_price && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {calculateDiscount(newProduct.price, newProduct.original_price)}% OFF
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                    <input 
                      type="number" 
                      placeholder="16800"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Original MSRP (₹)</label>
                    <input 
                      type="number" 
                      placeholder="19800"
                      value={newProduct.original_price}
                      onChange={(e) => setNewProduct({ ...newProduct, original_price: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity</label>
                    <input 
                      type="number" 
                      placeholder="25"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 mb-1">📍 Hub Location *</label>
                    <select
                      value={newProduct.hub_id}
                      onChange={(e) => setNewProduct({ ...newProduct, hub_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                    >
                      <option value="">Select Hub...</option>
                      {hubs.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-emerald-600 mt-0.5 font-semibold">Stock will be assigned to this hub</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Warranty Term</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 25 Years Output Warranty"
                      value={newProduct.warranty}
                      onChange={(e) => setNewProduct({ ...newProduct, warranty: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Section 4.5: Product Variants (Optional) */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">📦 Product Variants</span>
                  <span className="text-[10px] text-slate-400 capitalize">Optionally add sizes/capacities with hub location</span>
                </div>

                {/* Variant List Table */}
                {newProduct.variants && newProduct.variants.length > 0 && (
                  <div className="border border-slate-100 rounded-lg bg-white overflow-hidden text-xs">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-slate-500">Name</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-500">SKU</th>
                          <th className="px-3 py-2 text-right font-semibold text-slate-500">Price</th>
                          <th className="px-3 py-2 text-center font-semibold text-slate-500">Stock</th>
                          <th className="px-3 py-2 text-left font-semibold text-emerald-600">Hub</th>
                          <th className="px-3 py-2 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {newProduct.variants.map((v, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-1.5 font-medium text-slate-900">{v.name}</td>
                            <td className="px-3 py-1.5 font-mono text-slate-500">{v.sku}</td>
                            <td className="px-3 py-1.5 text-right font-semibold text-slate-900">₹{parseFloat(v.price).toLocaleString('en-IN')}</td>
                            <td className="px-3 py-1.5 text-center font-semibold text-slate-700">{v.stock}</td>
                            <td className="px-3 py-1.5 text-left">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                                {hubs.find(h => h.id === v.hub_id)?.name || hubs.find(h => h.id === newProduct.hub_id)?.name || 'Default Hub'}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = newProduct.variants.filter((_, idx) => idx !== i);
                                  setNewProduct({ ...newProduct, variants: updated });
                                }}
                                className="text-rose-500 hover:text-rose-700 font-bold"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add Variant Form Fields */}
                <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Variant Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. 540W Mono"
                        value={variantInput.name}
                        onChange={(e) => setVariantInput({ ...variantInput, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Variant SKU *</label>
                      <input 
                        type="text"
                        placeholder="e.g. MONO-540W"
                        value={variantInput.sku}
                        onChange={(e) => setVariantInput({ ...variantInput, sku: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Price (₹) *</label>
                      <input 
                        type="number"
                        placeholder="14200"
                        value={variantInput.price}
                        onChange={(e) => setVariantInput({ ...variantInput, price: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">MSRP (₹)</label>
                      <input 
                        type="number"
                        placeholder="15000"
                        value={variantInput.original_price}
                        onChange={(e) => setVariantInput({ ...variantInput, original_price: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Stock *</label>
                      <input 
                        type="number"
                        placeholder="75"
                        value={variantInput.stock}
                        onChange={(e) => setVariantInput({ ...variantInput, stock: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Size/Cap.</label>
                      <input 
                        type="text"
                        placeholder="e.g. 540W"
                        value={variantInput.size}
                        onChange={(e) => setVariantInput({ ...variantInput, size: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-600 mb-0.5">📍 Hub Location</label>
                      <select
                        value={variantInput.hub_id}
                        onChange={(e) => setVariantInput({ ...variantInput, hub_id: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50/50 border border-emerald-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold"
                      >
                        <option value="">Same as product</option>
                        {hubs.map(h => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-3">
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Variant Specifications (Optional)</label>
                      <textarea
                        placeholder="Label: Value&#10;Capacity: 350W&#10;Color: Black"
                        value={variantInput.specifications}
                        onChange={(e) => setVariantInput({ ...variantInput, specifications: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none h-16 resize-y font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!variantInput.sku || !variantInput.price || !variantInput.stock) {
                        alert('SKU, Price, and Stock are required to add a variant!');
                        return;
                      }
                      setNewProduct({
                        ...newProduct,
                        variants: [...(newProduct.variants || []), { ...variantInput }]
                      });
                      setVariantInput({ name: '', sku: '', price: '', original_price: '', size: '', stock: '', hub_id: '', specifications: '' });
                    }}
                    className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold transition-all"
                  >
                    + Add Variant to List
                  </button>
                </div>
              </div>

              {/* Section 5: Description & Highlights */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea 
                  rows={2}
                  placeholder="Detailed product overview..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Estimate</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2-4 Business Days"
                    value={newProduct.delivery_time}
                    onChange={(e) => setNewProduct({ ...newProduct, delivery_time: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Technical Highlights (1 per line)</label>
                <textarea 
                  rows={2}
                  placeholder="Monocrystalline PERC cell design&#10;IP68 waterproof rating"
                  value={newProduct.features}
                  onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Specifications (Format: label: value, 1 per line)</label>
                <textarea 
                  rows={3}
                  placeholder="SKU / Model: WAAREE-530W&#10;Certifications: BIS MNRE Approved&#10;Installation: Free Doorstep Delivery"
                  value={newProduct.specifications}
                  onChange={(e) => setNewProduct({ ...newProduct, specifications: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-bold transition-colors"
              >
                ← Back
              </button>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="add-product-form"
                  disabled={uploading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
                      Creating...
                    </span>
                  ) : (
                    "Save Product"
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/60 w-full max-w-3xl flex flex-col max-h-[95vh] overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white/80 backdrop-blur-sm z-10">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">✏️</span>
                  Edit Product Details
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">Review and update information for <span className="font-bold text-slate-700">{editProduct.name}</span></p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto px-6 py-6 bg-slate-50/30">
              <form id="edit-product-form" onSubmit={handleUpdate} className="space-y-6">
              {/* Section 1: Basic Information */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span>📌</span> Basic Information
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                  <input 
                    type="text" 
                    required
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
                    <input 
                      type="text" 
                      value={editProduct.brand}
                      onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select 
                      value={editProduct.category_id}
                      onChange={(e) => setEditProduct({ ...editProduct, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">SKU Code *</label>
                    <button 
                      type="button"
                      onClick={() => autoGenerateSku(true)}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      + Auto-Generate
                    </button>
                  </div>
                  <input 
                    type="text" 
                    required
                    value={editProduct.sku}
                    onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Section 2: Solar Capacity */}
              <div className="space-y-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <span>⚡</span> Solar System Capacity (kW)
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Capacity Rating</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 3kW, 5kW, 10kW or 5kW - 10kW"
                    value={editProduct.capacity}
                    onChange={(e) => setEditProduct({ ...editProduct, capacity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-sm font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-amber-700 mb-1.5">Quick Presets:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {CAPACITY_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setEditProduct({ ...editProduct, capacity: preset })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          editProduct.capacity === preset 
                            ? 'bg-amber-600 text-white shadow-xs' 
                            : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Product Image Upload */}
              <div className="space-y-3 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/60">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">📸 Product Media ({(editProduct.images || []).length} images)</span>
                  <span className="text-[10px] text-emerald-600 font-normal">Click ★ to set as featured</span>
                </div>

                {editProduct.images && editProduct.images.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {editProduct.images.map((imgUrl, index) => {
                      const isPrimary = editProduct.image_url === imgUrl;
                      return (
                        <div key={index} className={`relative rounded-lg border overflow-hidden bg-white p-1 group ${isPrimary ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'}`}>
                          <img src={imgUrl} alt={`Preview ${index}`} className="w-full h-14 object-cover rounded" />
                          
                          <div className="absolute top-1 left-1 flex gap-1">
                            <button
                              type="button"
                              onClick={() => setPrimaryProductImage(imgUrl, true)}
                              title={isPrimary ? "Featured Image" : "Set as Featured"}
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${isPrimary ? 'bg-amber-400 text-white' : 'bg-slate-900/60 text-amber-200 hover:bg-slate-900'}`}
                            >
                              ★
                            </button>
                          </div>

                          <div className="absolute top-1 right-1 flex gap-1">
                            <button
                              type="button"
                              onClick={() => triggerReplaceImage(index)}
                              title="Replace Image"
                              className="w-5 h-5 rounded-md bg-slate-900/60 text-white hover:bg-emerald-600 flex items-center justify-center text-[10px]"
                            >
                              ↻
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProductImage(index, true)}
                              title="Delete Image"
                              className="w-5 h-5 rounded-md bg-slate-900/60 text-white hover:bg-red-600 flex items-center justify-center text-xs"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="absolute bottom-1 left-0 right-0 flex justify-between px-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/70 py-0.5">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveImage(index, -1, true)}
                              className="text-[9px] font-bold text-white disabled:text-slate-500 hover:text-emerald-400"
                            >
                              ◀ L
                            </button>
                            <button
                              type="button"
                              disabled={index === editProduct.images.length - 1}
                              onClick={() => moveImage(index, 1, true)}
                              className="text-[9px] font-bold text-white disabled:text-slate-500 hover:text-emerald-400"
                            >
                              R ▶
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input 
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleProductImageUpload(e, true)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                      💡 Recommended: Square ratio (e.g., 800x800 px) up to 5MB (JPG, PNG, WEBP).
                    </p>
                    {uploading && <p className="text-[11px] text-emerald-600 mt-1 font-bold animate-pulse">Uploading to Supabase CDN...</p>}
                    
                    {/* Hidden replace input */}
                    <input 
                      type="file" 
                      ref={replaceInputRef} 
                      style={{ display: 'none' }} 
                      accept="image/*" 
                      onChange={(e) => handleReplaceImageUpload(e, true)} 
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Pricing, Stock & Hub Location */}
              {(!editProduct.variants || editProduct.variants.length === 0) && (
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">💰 Pricing, Stock & Hub Location</span>
                  {editProduct.price && editProduct.original_price && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {calculateDiscount(editProduct.price, editProduct.original_price)}% OFF
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                    <input 
                      type="number" 
                      value={editProduct.price}
                      onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Original MSRP (₹)</label>
                    <input 
                      type="number" 
                      value={editProduct.original_price}
                      onChange={(e) => setEditProduct({ ...editProduct, original_price: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity</label>
                    <input 
                      type="number" 
                      value={editProduct.stock}
                      onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 mb-1">📍 Hub Location</label>
                    <select
                      value={editProduct.hub_id}
                      onChange={(e) => setEditProduct({ ...editProduct, hub_id: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                    >
                      <option value="">Select Hub...</option>
                      {hubs.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-emerald-600 mt-0.5 font-semibold">Stock changes apply to this hub</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Warranty Term</label>
                    <input 
                      type="text" 
                      value={editProduct.warranty}
                      onChange={(e) => setEditProduct({ ...editProduct, warranty: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Section 4.5: Product Variants (Optional) */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">📦 Product Variants</span>
                  <span className="text-[10px] text-slate-400 capitalize">Manage sizes/capacities</span>
                </div>

                {/* Variant List Table */}
                {editProduct.variants && editProduct.variants.length > 0 && (
                  <div className="border border-slate-100 rounded-lg bg-white overflow-hidden text-xs">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-slate-500">Name</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-500">SKU</th>
                          <th className="px-3 py-2 text-right font-semibold text-slate-500">Price</th>
                          <th className="px-3 py-2 text-center font-semibold text-slate-500">Stock</th>
                          <th className="px-3 py-2 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {editProduct.variants.map((v, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-1.5 font-medium text-slate-900">{v.name}</td>
                            <td className="px-3 py-1.5 font-mono text-slate-500">{v.sku}</td>
                            <td className="px-3 py-1.5 text-right font-semibold text-slate-900">₹{parseFloat(v.price).toLocaleString('en-IN')}</td>
                            <td className="px-3 py-1.5 text-center font-semibold text-slate-700">{v.stock}</td>
                            <td className="px-3 py-1.5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = editProduct.variants.filter((_, idx) => idx !== i);
                                  setEditProduct({ ...editProduct, variants: updated });
                                }}
                                className="text-rose-500 hover:text-rose-700 font-bold"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add Variant Form Fields */}
                <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Variant Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. 540W Mono"
                        value={variantInput.name}
                        onChange={(e) => setVariantInput({ ...variantInput, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Variant SKU *</label>
                      <input 
                        type="text"
                        placeholder="e.g. MONO-540W"
                        value={variantInput.sku}
                        onChange={(e) => setVariantInput({ ...variantInput, sku: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Price (₹) *</label>
                      <input 
                        type="number"
                        placeholder="14200"
                        value={variantInput.price}
                        onChange={(e) => setVariantInput({ ...variantInput, price: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">MSRP (₹)</label>
                      <input 
                        type="number"
                        placeholder="15000"
                        value={variantInput.original_price}
                        onChange={(e) => setVariantInput({ ...variantInput, original_price: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Stock *</label>
                      <input 
                        type="number"
                        placeholder="75"
                        value={variantInput.stock}
                        onChange={(e) => setVariantInput({ ...variantInput, stock: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Size/Cap. (Optional)</label>
                      <input 
                        type="text"
                        placeholder="e.g. 540W"
                        value={variantInput.size}
                        onChange={(e) => setVariantInput({ ...variantInput, size: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="mt-3">
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Variant Specifications (Optional)</label>
                      <textarea
                        placeholder="Label: Value&#10;Capacity: 350W&#10;Color: Black"
                        value={variantInput.specifications}
                        onChange={(e) => setVariantInput({ ...variantInput, specifications: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none h-16 resize-y font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!variantInput.sku || !variantInput.price || !variantInput.stock) {
                        alert('SKU, Price, and Stock are required to add a variant!');
                        return;
                      }
                      setEditProduct({
                        ...editProduct,
                        variants: [...(editProduct.variants || []), { ...variantInput }]
                      });
                      setVariantInput({ name: '', sku: '', price: '', original_price: '', size: '', stock: '', hub_id: '', specifications: '' });
                    }}
                    className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold transition-all"
                  >
                    + Add Variant to List
                  </button>
                </div>
              </div>

              {/* Section 5: Description & Highlights */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea 
                  rows={2}
                  value={editProduct.description}
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Estimate</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2-4 Business Days"
                    value={editProduct.delivery_time}
                    onChange={(e) => setEditProduct({ ...editProduct, delivery_time: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Technical Highlights (1 per line)</label>
                <textarea 
                  rows={2}
                  value={editProduct.features}
                  onChange={(e) => setEditProduct({ ...editProduct, features: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Specifications (Format: label: value, 1 per line)</label>
                <textarea 
                  rows={3}
                  placeholder="SKU / Model: WAAREE-530W&#10;Certifications: BIS MNRE Approved&#10;Installation: Free Doorstep Delivery"
                  value={editProduct.specifications}
                  onChange={(e) => setEditProduct({ ...editProduct, specifications: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-bold transition-colors"
              >
                ← Back
              </button>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="edit-product-form"
                  disabled={uploading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
                      Updating...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
