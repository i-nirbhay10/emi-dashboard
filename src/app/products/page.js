"use client";
import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, uploadMediaFile } from '../../lib/api';

const CAPACITY_PRESETS = [
  '1kW - 3kW',
  '3kW',
  '5kW',
  '5kW - 10kW',
  '10kW',
  '10kW+ Commercial',
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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
    image_url: '',
    description: '',
    features: ''
  });

  // Form State for Edit Product
  const [editProduct, setEditProduct] = useState(null);

  const loadProducts = async () => {
    const data = await getProducts();
    const catData = await getCategories();
    setProducts(data || []);
    if (catData) setCategories(catData);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleProductImageUpload = async (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const uploadedUrl = await uploadMediaFile(file, 'products');
    if (uploadedUrl) {
      if (isEdit) {
        setEditProduct(prev => ({ ...prev, image_url: uploadedUrl }));
      } else {
        setNewProduct(prev => ({ ...prev, image_url: uploadedUrl }));
      }
    }
    setUploading(false);
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
    if (!newProduct.name || !newProduct.sku || !newProduct.price) return;

    const featureList = newProduct.features 
      ? newProduct.features.split('\n').filter(f => f.trim() !== '')
      : [
          'High-efficiency solar technology built for maximum energy yield',
          'Heavy-duty weatherproof & corrosion resistant construction',
          'Eligible for PM Surya Ghar Yojana Government Subsidy'
        ];
    
    await createProduct({
      name: newProduct.name,
      brand: newProduct.brand || 'ENERGY MALL',
      category_id: newProduct.category_id || null,
      sku: newProduct.sku,
      capacity: newProduct.capacity || null,
      price: parseFloat(newProduct.price),
      original_price: newProduct.original_price ? parseFloat(newProduct.original_price) : parseFloat(newProduct.price) * 1.18,
      warranty: newProduct.warranty || '10-25 Years',
      stock: parseInt(newProduct.stock || 0, 10),
      image: newProduct.image_url || null,
      description: newProduct.description,
      features: featureList,
      is_active: true
    });

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
      image_url: '',
      description: '',
      features: ''
    });
    setIsModalOpen(false);
    loadProducts();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editProduct || !editProduct.id || !editProduct.name) return;

    const featureList = editProduct.features 
      ? editProduct.features.split('\n').filter(f => f.trim() !== '')
      : [];

    await updateProduct(editProduct.id, {
      name: editProduct.name,
      brand: editProduct.brand || 'ENERGY MALL',
      category_id: editProduct.category_id || null,
      sku: editProduct.sku,
      capacity: editProduct.capacity || null,
      price: parseFloat(editProduct.price),
      original_price: editProduct.original_price ? parseFloat(editProduct.original_price) : parseFloat(editProduct.price) * 1.18,
      warranty: editProduct.warranty,
      stock: parseInt(editProduct.stock || 0, 10),
      image: editProduct.image_url || null,
      description: editProduct.description,
      features: featureList
    });

    setIsEditModalOpen(false);
    setEditProduct(null);
    loadProducts();
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  const openEditModal = (product) => {
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
      image_url: product.image || product.image_url || '',
      description: product.description || '',
      features: Array.isArray(product.features) ? product.features.join('\n') : ''
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">Manage solar inventory, system kW capacities, technical specifications, and Supabase Storage product imagery.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Add Product
        </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Add New Solar Product</h2>
                <p className="text-xs text-slate-500">Fill in inventory specs, pricing, and system kW capacity.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
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
              <div className="space-y-2 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/60">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <span>📸</span> Product Media (Supabase Storage)
                </div>

                <div className="flex items-center gap-3">
                  {newProduct.image_url ? (
                    <div className="relative h-14 w-14 rounded-xl border border-emerald-300 overflow-hidden bg-white shrink-0">
                      <img src={newProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setNewProduct({ ...newProduct, image_url: '' })}
                        className="absolute top-0.5 right-0.5 bg-slate-900/80 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProductImageUpload(e, false)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200"
                    />
                    {uploading && <p className="text-[11px] text-emerald-600 mt-1 font-bold animate-pulse">Uploading to Supabase CDN...</p>}
                  </div>
                </div>
              </div>

              {/* Section 4: Pricing & Inventory */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">💰 Pricing & Stock</span>
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
                      required
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

                <div className="grid grid-cols-2 gap-3">
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

              {/* Modal Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-md disabled:opacity-50"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Edit Solar Product</h2>
                <p className="text-xs text-slate-500">Update product specifications, capacity, and catalog details.</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
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
              <div className="space-y-2 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/60">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <span>📸</span> Product Media (Supabase Storage)
                </div>

                <div className="flex items-center gap-3">
                  {editProduct.image_url ? (
                    <div className="relative h-14 w-14 rounded-xl border border-emerald-300 overflow-hidden bg-white shrink-0">
                      <img src={editProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setEditProduct({ ...editProduct, image_url: '' })}
                        className="absolute top-0.5 right-0.5 bg-slate-900/80 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProductImageUpload(e, true)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200"
                    />
                    {uploading && <p className="text-[11px] text-emerald-600 mt-1 font-bold animate-pulse">Uploading to Supabase CDN...</p>}
                  </div>
                </div>
              </div>

              {/* Section 4: Pricing & Inventory */}
              <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">💰 Pricing & Stock</span>
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
                      required
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

                <div className="grid grid-cols-2 gap-3">
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Technical Highlights (1 per line)</label>
                <textarea 
                  rows={2}
                  value={editProduct.features}
                  onChange={(e) => setEditProduct({ ...editProduct, features: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-md disabled:opacity-50"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
