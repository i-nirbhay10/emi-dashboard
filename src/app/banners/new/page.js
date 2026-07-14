import React from 'react';
import Link from 'next/link';

export default function NewBannerPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/banners" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Banner</h1>
          <p className="text-sm text-slate-500 mt-1">Upload a new promotional banner to display on your storefront.</p>
        </div>
      </div>

      <form className="space-y-6">
        {/* Image Upload Area */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Banner Image</h2>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
            <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
            <p className="text-xs text-slate-400 mt-2">Recommended aspect ratio: 16:9 for Desktop, 1:1 for Mobile</p>
          </div>
        </div>

        {/* Banner Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Banner Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Banner Title</label>
              <input type="text" placeholder="e.g. Summer Solar Sale" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" />
              <p className="text-xs text-slate-500 mt-1">For internal identification only.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Link (URL)</label>
              <input type="url" placeholder="https://energymall.in/offers/summer" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" />
              <p className="text-xs text-slate-500 mt-1">Where the user is redirected when they click the banner.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Placement Location</label>
                <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all">
                  <option value="home-hero">Homepage Hero</option>
                  <option value="home-middle">Homepage Middle Banner</option>
                  <option value="category-top">Category Page Top</option>
                  <option value="checkout">Checkout Promotions</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all">
                  <option value="active">Active (Visible immediately)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Link href="/banners" className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all">
            Cancel
          </Link>
          <button type="button" className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all">
            Save Banner
          </button>
        </div>
      </form>
    </div>
  );
}
