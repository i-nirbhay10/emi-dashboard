"use client";
import React, { useEffect, useState } from 'react';
import { getAnalyticsOverview, getCategories } from '../../lib/api';

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const res = await getAnalyticsOverview();
    const catRes = await getCategories();
    if (res) setAnalyticsData(res);
    if (catRes) setCategories(catRes);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = analyticsData?.kpis || [];
  const counts = analyticsData?.counts || {};
  const recentProducts = analyticsData?.recentProducts || [];
  const lowStockProducts = analyticsData?.lowStockProducts || [];
  const recentOrders = analyticsData?.recentOrders || [];

  // Calculate total products to show accurate relative percentage bars
  const totalProductsInCategoryBreakdown = categories.reduce((sum, c) => sum + (c.products_count || 0), 0) || 1;

  const getStatusBadgeClass = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (statusLower === 'processing' || statusLower === 'shipped' || statusLower === 'out for delivery') {
      return 'bg-blue-50 text-blue-700 border-blue-100';
    }
    if (statusLower === 'cancelled' || statusLower === 'returned' || statusLower === 'failed') {
      return 'bg-rose-50 text-rose-700 border-rose-100';
    }
    return 'bg-slate-50 text-slate-700 border-slate-100';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Reports</h1>
            <p className="text-sm text-slate-500 mt-1">Deep dive into live store metrics and catalog inventory breakdown.</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-semibold">Generating analytics overview...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Analytics & Reports
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Live Overview
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Deep dive into live store metrics and catalog inventory breakdown.</p>
        </div>
        <button
          onClick={loadData}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center self-start sm:self-center"
          title="Refresh Reports"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        </button>
      </div>

      {/* Top KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.title}</div>
              <div className="text-2xl font-black text-slate-900 mt-2">{kpi.value}</div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                kpi.up ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
              }`}>
                {kpi.change}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Core Split Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Distribution by Category */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <span>📊</span> Product Distribution by Category
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">Inventory split relative to entire active catalog size.</p>
            {categories.length > 0 ? (
              <div className="space-y-4">
                {categories.map((item, i) => {
                  const pct = Math.round(((item.products_count || 0) / totalProductsInCategoryBreakdown) * 100);
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-32 text-xs text-slate-700 font-bold truncate">{item.name}</div>
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="w-24 text-right text-xs font-extrabold text-slate-800">
                        {item.products_count || 0} items ({pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">No category distribution data.</div>
            )}
          </div>
          <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between text-xs text-slate-500 font-semibold">
            <span>Total Catalog Abstraction Size:</span>
            <span className="font-extrabold text-slate-900">{totalProductsInCategoryBreakdown} Products</span>
          </div>
        </div>

        {/* Recent Product Additions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 flex items-center gap-2 mb-2">
            <span>⚡</span> Recent Additions
          </h2>
          <p className="text-xs text-slate-500 mb-6">Newly added products in the catalog list.</p>
          {recentProducts.length > 0 ? (
            <div className="space-y-3">
              {recentProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between pb-3.5 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center text-xs font-black">
                      #{i + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 truncate w-36">{product.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{product.brand || 'No Brand'}</span>
                    </div>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900">₹{Number(product.price).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">No new additions recently.</div>
          )}
        </div>
      </div>

      {/* Grid: Low Stock Inventory & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders table */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-950 flex items-center gap-2 mb-2">
            <span>📦</span> Recent Transactions
          </h2>
          <p className="text-xs text-slate-500 mb-5">Latest customer purchases awaiting fulfillment processing.</p>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.map((order, i) => (
                    <tr key={i}>
                      <td className="py-3 font-bold text-emerald-700">{order.order_number}</td>
                      <td className="py-3 font-semibold text-slate-800">{order.customer_name}</td>
                      <td className="py-3 font-extrabold text-slate-900">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">No transactions registered.</div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-950 flex items-center gap-2 mb-2 text-rose-700">
            <span>⚠️</span> Critical Inventory Monitor
          </h2>
          <p className="text-xs text-slate-500 mb-6">Catalog items matching low stock limits (≤ 15 units).</p>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-3.5">
              {lowStockProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 truncate w-40">{product.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{product.brand || 'No brand'} • SKU: {product.sku}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                    product.stock <= 0 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">All products are adequately stocked.</div>
          )}
        </div>
      </div>
    </div>
  );
}
