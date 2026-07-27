"use client";
import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, uploadMediaFile } from '../../lib/api';

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
    setLoading(true);
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

  const filtered = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">Manage solar inventory, technical specifications, and Supabase Storage product imagery.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search products by name, brand, SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
            />
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price (₹)</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filtered.map(product => {
                  const hasStock = (product.stock || 0) > 0;
                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 font-bold overflow-hidden">
                            {product.image || product.image_url ? (
                              <img src={product.image || product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              '☀️'
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{product.name}</div>
                            <div className="text-xs text-slate-400 font-medium">{product.brand || 'ENERGY MALL'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                        {product.sku}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">₹{Number(product.price).toLocaleString('en-IN')}</div>
                        {product.original_price && Number(product.original_price) > Number(product.price) && (
                          <div className="text-xs text-slate-400 line-through">₹{Number(product.original_price).toLocaleString('en-IN')}</div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          hasStock ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {product.stock || 0} in stock
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-all"
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
            <div className="p-8 text-center text-slate-500 text-sm">No products found.</div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900">Add New Product to Catalog</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Waaree 540W Mono PERC Panel"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Product Image <span className="text-green-600 font-bold">(Supabase CDN Upload)</span>
                </label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleProductImageUpload(e, false)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {uploading && <p className="text-[11px] text-green-600 mt-1 font-semibold animate-pulse">Uploading product image to Supabase Storage...</p>}
                {newProduct.image_url && (
                  <div className="mt-2 text-[11px] text-slate-500 font-mono truncate">
                    Uploaded CDN: {newProduct.image_url}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Brand Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. WAAREE, LUMINOUS"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select 
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">SKU *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="WMP-540"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Selling Price (₹) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="16800"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Original MSRP (₹)</label>
                  <input 
                    type="number" 
                    placeholder="19800"
                    value={newProduct.original_price}
                    onChange={(e) => setNewProduct({ ...newProduct, original_price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Quantity</label>
                  <input 
                    type="number" 
                    placeholder="25"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Warranty Term</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 25 Years Output Warranty"
                    value={newProduct.warranty}
                    onChange={(e) => setNewProduct({ ...newProduct, warranty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea 
                  rows={3}
                  placeholder="Detailed product overview..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Technical Highlights (1 per line)</label>
                <textarea 
                  rows={3}
                  placeholder="Monocrystalline PERC cell design&#10;IP68 waterproof rating"
                  value={newProduct.features}
                  onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900">Edit Product</h2>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name *</label>
                <input 
                  type="text" 
                  required
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Product Image <span className="text-green-600 font-bold">(Supabase CDN Upload)</span>
                </label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleProductImageUpload(e, true)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {uploading && <p className="text-[11px] text-green-600 mt-1 font-semibold animate-pulse">Uploading product image to Supabase Storage...</p>}
                {editProduct.image_url && (
                  <div className="mt-2 text-[11px] text-slate-500 font-mono truncate">
                    Uploaded CDN: {editProduct.image_url}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Brand Name</label>
                  <input 
                    type="text" 
                    value={editProduct.brand}
                    onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select 
                    value={editProduct.category_id}
                    onChange={(e) => setEditProduct({ ...editProduct, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">SKU *</label>
                  <input 
                    type="text" 
                    required
                    value={editProduct.sku}
                    onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Selling Price (₹) *</label>
                  <input 
                    type="number" 
                    required
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Original MSRP (₹)</label>
                  <input 
                    type="number" 
                    value={editProduct.original_price}
                    onChange={(e) => setEditProduct({ ...editProduct, original_price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Quantity</label>
                  <input 
                    type="number" 
                    value={editProduct.stock}
                    onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Warranty Term</label>
                  <input 
                    type="text" 
                    value={editProduct.warranty}
                    onChange={(e) => setEditProduct({ ...editProduct, warranty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={editProduct.description}
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Technical Highlights (1 per line)</label>
                <textarea 
                  rows={3}
                  value={editProduct.features}
                  onChange={(e) => setEditProduct({ ...editProduct, features: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm disabled:opacity-50"
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
