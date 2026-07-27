"use client";
import React, { useEffect, useState } from 'react';
import { getCategories, createCategory, deleteCategory, uploadMediaFile } from '../../lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', description: '', image_url: '' });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const uploadedUrl = await uploadMediaFile(file, 'categories');
    if (uploadedUrl) {
      setNewCat(prev => ({ ...prev, image_url: uploadedUrl }));
    }
    setUploading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCat.name) return;
    await createCategory(newCat);
    setNewCat({ name: '', description: '', image_url: '' });
    setIsModalOpen(false);
    loadCategories();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this category?')) {
      await deleteCategory(id);
      loadCategories();
    }
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Categories Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">Organize solar products into categories with Supabase CDN icons & imagery.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading categories...</div>
          ) : filtered.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Products Count</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filtered.map(category => (
                  <tr key={category.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center border border-green-100 text-green-700 font-bold overflow-hidden">
                          {category.image_url ? (
                            <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                          ) : (
                            '📁'
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{category.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{category.description || 'No description'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-600">/{category.slug}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{category.products_count || 0} products</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="text-rose-600 hover:text-rose-900 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">No categories found.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add New Category</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Solar Inverters"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Upload Category Icon <span className="text-green-600 font-bold">(Supabase CDN)</span>
                </label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {uploading && <p className="text-[11px] text-green-600 mt-1 font-semibold animate-pulse">Uploading icon to Supabase Storage...</p>}
                {newCat.image_url && (
                  <div className="mt-2 text-[11px] text-slate-500 font-mono truncate">
                    Uploaded CDN: {newCat.image_url}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea 
                  rows={3}
                  placeholder="On-grid, off-grid and hybrid solar inverters..."
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
