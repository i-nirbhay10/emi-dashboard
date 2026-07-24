"use client";
import React, { useEffect, useState } from 'react';
import { getBanners, createBanner, updateBanner, deleteBanner } from '../../lib/api';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [placementFilter, setPlacementFilter] = useState('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form State
  const [formBanner, setFormBanner] = useState({
    id: '',
    title: '',
    subtitle: '',
    placement: 'Homepage Hero',
    link: '',
    image_url: '',
    status: 'Active'
  });

  const loadBanners = async () => {
    setLoading(true);
    const data = await getBanners();
    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formBanner.title) return;
    await createBanner({
      title: formBanner.title,
      subtitle: formBanner.subtitle || null,
      placement: formBanner.placement || 'Homepage Hero',
      link: formBanner.link || null,
      image_url: formBanner.image_url || null,
      status: formBanner.status || 'Active'
    });
    setFormBanner({ id: '', title: '', subtitle: '', placement: 'Homepage Hero', link: '', image_url: '', status: 'Active' });
    setIsAddModalOpen(false);
    loadBanners();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formBanner.id || !formBanner.title) return;
    await updateBanner(formBanner.id, {
      title: formBanner.title,
      subtitle: formBanner.subtitle || null,
      placement: formBanner.placement,
      link: formBanner.link || null,
      image_url: formBanner.image_url || null,
      status: formBanner.status
    });
    setIsEditModalOpen(false);
    loadBanners();
  };

  const handleDeleteSubmit = async () => {
    if (!formBanner.id) return;
    await deleteBanner(formBanner.id);
    setIsDeleteModalOpen(false);
    loadBanners();
  };

  const handleToggleStatus = async (banner) => {
    const nextStatus = banner.status === 'Active' ? 'Inactive' : 'Active';
    await updateBanner(banner.id, { status: nextStatus });
    loadBanners();
  };

  const openEditModal = (b) => {
    setFormBanner({
      id: b.id,
      title: b.title || '',
      subtitle: b.subtitle || '',
      placement: b.placement || 'Homepage Hero',
      link: b.link || '',
      image_url: b.image_url || '',
      status: b.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (b) => {
    setFormBanner({
      id: b.id,
      title: b.title || '',
      subtitle: b.subtitle || '',
      placement: b.placement,
      link: b.link,
      image_url: b.image_url,
      status: b.status
    });
    setIsDeleteModalOpen(true);
  };

  // KPI Calculations
  const totalBannersCount = banners.length;
  const activeCount = banners.filter(b => (b.status || 'Active') === 'Active').length;
  const heroCount = banners.filter(b => b.placement === 'Homepage Hero').length;
  const promoCount = banners.filter(b => b.placement === 'Promotional Drawer' || b.placement === 'Category Banner').length;

  // Filtered Banners
  const filtered = banners.filter(b => {
    const matchesSearch = b.title?.toLowerCase().includes(search.toLowerCase()) ||
                          b.subtitle?.toLowerCase().includes(search.toLowerCase()) ||
                          b.placement?.toLowerCase().includes(search.toLowerCase()) ||
                          b.link?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    if (placementFilter === 'Active') return (b.status || 'Active') === 'Active';
    if (placementFilter !== 'All') return b.placement === placementFilter;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Banner Management
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {totalBannersCount} Total Banners
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure mobile storefront slider banners, category heroes, and promotional placement banners.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadBanners}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center"
            title="Refresh Banners"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
          <button 
            onClick={() => {
              setFormBanner({ id: '', title: '', subtitle: '', placement: 'Homepage Hero', link: '', image_url: '', status: 'Active' });
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Add New Banner
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Banners</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalBannersCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Configured in DB</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-xl">
            🖼️
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Store Banners</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{activeCount}</div>
            <div className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Live on Mobile App
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 text-green-600 flex items-center justify-center text-xl">
            ⚡
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Homepage Hero Sliders</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{heroCount}</div>
            <div className="text-xs text-amber-600 font-medium mt-1">Top Hero Carousel</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center text-xl">
            🌟
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Promo & Category Placements</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{promoCount}</div>
            <div className="text-xs text-purple-600 font-medium mt-1">Targeted promotions</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center text-xl">
            🎁
          </div>
        </div>
      </div>

      {/* Search & Placement Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Search by title, subtitle, placement..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
          />
        </div>

        {/* Placement Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'All', label: 'All Placements' },
            { id: 'Active', label: '⚡ Active Only' },
            { id: 'Homepage Hero', label: '🌟 Homepage Hero' },
            { id: 'Category Banner', label: '📂 Category Banner' },
            { id: 'Promotional Drawer', label: '🎁 Promotional Drawer' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setPlacementFilter(chip.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                placementFilter === chip.id 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Banner Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
          <svg className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Loading marketing banners...
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(banner => {
            const isActive = (banner.status || 'Active') === 'Active';
            return (
              <div 
                key={banner.id} 
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      banner.placement === 'Homepage Hero' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      banner.placement === 'Category Banner' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {banner.placement}
                    </span>

                    {/* Status Toggle Switch */}
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      {isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{banner.title}</h3>
                    {banner.subtitle && <p className="text-sm text-slate-600 mt-1">{banner.subtitle}</p>}
                  </div>

                  {banner.link && (
                    <div className="text-xs text-blue-600 font-mono flex items-center gap-1">
                      <span>🔗 Target Redirect:</span>
                      <span className="font-semibold underline">{banner.link}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">ID: {banner.id.slice(0, 8)}...</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(banner)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(banner)}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-200">
          No banners found matching search or filter rules.
        </div>
      )}

      {/* Add Banner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add New Banner</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Banner Headline Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Switch to Clean Energy Today"
                  value={formBanner.title}
                  onChange={(e) => setFormBanner({ ...formBanner, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subtitle / Tagline</label>
                <input 
                  type="text" 
                  placeholder="e.g. Get up to 30% Government Subsidy on Roof Solar"
                  value={formBanner.subtitle}
                  onChange={(e) => setFormBanner({ ...formBanner, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Placement</label>
                <select 
                  value={formBanner.placement}
                  onChange={(e) => setFormBanner({ ...formBanner, placement: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
                >
                  <option value="Homepage Hero">Homepage Hero</option>
                  <option value="Category Banner">Category Banner</option>
                  <option value="Promotional Drawer">Promotional Drawer</option>
                  <option value="Checkout Slider">Checkout Slider</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Route Link</label>
                <input 
                  type="text" 
                  placeholder="e.g. /categories/solar-panels"
                  value={formBanner.link}
                  onChange={(e) => setFormBanner({ ...formBanner, link: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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

      {/* Edit Banner Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Edit Banner</h2>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Banner Headline Title</label>
                <input 
                  type="text" 
                  required
                  value={formBanner.title}
                  onChange={(e) => setFormBanner({ ...formBanner, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subtitle / Tagline</label>
                <input 
                  type="text" 
                  value={formBanner.subtitle}
                  onChange={(e) => setFormBanner({ ...formBanner, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Placement</label>
                <select 
                  value={formBanner.placement}
                  onChange={(e) => setFormBanner({ ...formBanner, placement: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
                >
                  <option value="Homepage Hero">Homepage Hero</option>
                  <option value="Category Banner">Category Banner</option>
                  <option value="Promotional Drawer">Promotional Drawer</option>
                  <option value="Checkout Slider">Checkout Slider</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <select 
                  value={formBanner.status}
                  onChange={(e) => setFormBanner({ ...formBanner, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Route Link</label>
                <input 
                  type="text" 
                  value={formBanner.link}
                  onChange={(e) => setFormBanner({ ...formBanner, link: e.target.value })}
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm"
                >
                  Update Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Delete Banner?</h2>
            <p className="text-sm text-slate-500">
              Are you sure you want to delete <strong className="text-slate-900">{formBanner.title}</strong>? This will remove the banner from storefront carousels.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDeleteSubmit}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 shadow-sm"
              >
                Delete Banner
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
