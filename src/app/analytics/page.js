"use client";
import React, { useEffect, useState } from 'react';
import { getAnalyticsOverview, getCategories } from '../../lib/api';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getAnalyticsOverview();
      const catRes = await getCategories();
      if (res) setData(res);
      if (catRes) setCategories(catRes);
      setLoading(false);
    }
    load();
  }, []);

  const topProducts = data?.recentProducts || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Deep dive into live store metrics and catalog inventory breakdown.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Product Categories */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 md:col-span-2">
          <h2 className="text-base font-bold text-slate-900 mb-6">Product Distribution by Category</h2>
          {loading ? (
            <div className="p-4 text-slate-400 text-sm">Loading category breakdown...</div>
          ) : categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-36 text-sm text-slate-700 font-medium truncate">{item.name}</div>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (item.products_count || 1) * 25)}%` }}></div>
                  </div>
                  <div className="w-20 text-right text-sm font-bold text-slate-900">{item.products_count || 0} items</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-slate-500 text-sm">No categories defined in backend.</div>
          )}
        </div>

        {/* Recent Product Catalog Items */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-6">Recent Catalog Additions</h2>
          {loading ? (
            <div className="p-4 text-slate-400 text-sm">Loading products...</div>
          ) : topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold border border-green-100">#{i+1}</div>
                    <div className="text-sm font-medium text-slate-900 truncate w-36">{product.name}</div>
                  </div>
                  <div className="text-sm font-bold text-slate-900">₹{Number(product.price).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-slate-500 text-sm">No products found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
