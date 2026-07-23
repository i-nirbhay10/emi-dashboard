"use client";
import React, { useEffect, useState } from 'react';
import { getBanners, createBanner } from '../../lib/api';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: '', subtitle: '', placement: 'Homepage Hero', link: '' });
  const [loading, setLoading] = useState(true);

  const loadBanners = async () => {
    setLoading(true);
    const data = await getBanners();
    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newBanner.title) return;
    await createBanner(newBanner);
    setNewBanner({ title: '', subtitle: '', placement: 'Homepage Hero', link: '' });
    setIsModalOpen(false);
    loadBanners();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Banner Management</h1>
          <p className="text-sm text-slate-500 mt-1">Configure mobile homepage slider banners and marketing heroes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Add Banner
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading marketing banners...</div>
      ) : banners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map(banner => (
            <div key={banner.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                  {banner.placement}
                </span>
                <span className="text-xs text-slate-500 font-medium">Status: {banner.status || 'Active'}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{banner.title}</h3>
                {banner.subtitle && <p className="text-sm text-slate-600 mt-1">{banner.subtitle}</p>}
              </div>
              {banner.link && (
                <div className="text-xs text-blue-600 font-mono">Link: {banner.link}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-200">No banners configured yet.</div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add New Banner</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Banner Headline</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Solar Monsoon Bonanza"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subtitle / Tagline</label>
                <input 
                  type="text" 
                  placeholder="e.g. Extra 10% cash back on all grid ties"
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Placement</label>
                <select 
                  value={newBanner.placement}
                  onChange={(e) => setNewBanner({ ...newBanner, placement: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
                >
                  <option value="Homepage Hero">Homepage Hero</option>
                  <option value="Category Banner">Category Banner</option>
                  <option value="Checkout Slider">Checkout Slider</option>
                </select>
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
