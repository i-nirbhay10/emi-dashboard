import React from 'react';

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Deep dive into your store's performance metrics.</p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-all focus:outline-none">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sales by Category */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 md:col-span-2">
          <h2 className="text-base font-bold text-slate-900 mb-6">Sales by Category</h2>
          <div className="space-y-4">
            {[
              { label: 'Solar Panels', value: 45, color: 'bg-green-500' },
              { label: 'Inverters', value: 30, color: 'bg-blue-500' },
              { label: 'Batteries', value: 15, color: 'bg-amber-500' },
              { label: 'Accessories', value: 10, color: 'bg-purple-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-32 text-sm text-slate-600 font-medium">{item.label}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }}></div>
                </div>
                <div className="w-12 text-right text-sm font-bold text-slate-900">{item.value}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-6">Top Selling Products</h2>
          <div className="space-y-4">
            {[
              { name: 'Luminous Solar Panel 330W', sales: 124 },
              { name: 'Microtek Hybrid Inverter', sales: 89 },
              { name: 'Exide Tubular Battery 150Ah', sales: 67 },
            ].map((product, i) => (
              <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">#{i+1}</div>
                  <div className="text-sm font-medium text-slate-700 truncate w-32">{product.name}</div>
                </div>
                <div className="text-sm font-bold text-slate-900">{product.sales}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
