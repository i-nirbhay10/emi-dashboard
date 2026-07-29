"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAnalyticsOverview } from '../lib/api';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getAnalyticsOverview();
      if (res) {
        setData(res);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const kpis = data?.kpis || [];
  const counts = data?.counts || {};
  const recentOrders = data?.recentOrders || [];
  const lowStockItems = data?.lowStockProducts || (data?.recentProducts ? data.recentProducts.filter(p => p.stock <= 15) : []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Dashboard Overview
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Live PostgreSQL Sync
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Live metrics and store performance directly from Supabase PostgreSQL database.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/products" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Add Product
          </Link>
          <Link href="/logistics" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-extrabold hover:bg-slate-800 shadow-sm transition-all flex items-center gap-2">
            Manage Logistics & Hubs
          </Link>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))
        ) : kpis.length > 0 ? (
          kpis.map((kpi, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{kpi.title}</h3>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl font-extrabold text-slate-900">{kpi.value}</span>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${kpi.up ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                  {kpi.change}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-4 bg-white p-5 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
            No KPI metrics available.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Database Quick Counts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Database System Metrics</h2>
              <p className="text-xs text-slate-500">Live entity records stored in Supabase PostgreSQL tables.</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full border border-slate-200">
              Database Live
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Fulfillment Hubs</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{counts.hubs || 0}</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Depots Active</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Serviceable PINs</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{counts.pincodes || 0}</p>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">PIN Codes Mapped</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Active Catalog</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{counts.products || 0}</p>
              <p className="text-[11px] text-slate-600 font-semibold mt-1">Solar Equipment</p>
            </div>
          </div>
        </div>

        {/* Live System Status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">Backend API & Database</h2>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
              <div>
                <p className="text-xs font-extrabold text-emerald-900">PostgreSQL Database Connected</p>
                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Prisma ORM engine running</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Database Engine:</span>
                <span className="font-bold text-slate-900">Supabase PostgreSQL</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>API Gateway:</span>
                <span className="font-bold text-slate-900 font-mono text-[11px]">http://localhost:3002</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-base font-extrabold text-slate-900">Recent Orders</h2>
            <Link href="/orders" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors">
              View All Orders &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto text-xs">
            {loading ? (
              <div className="p-6 text-center text-slate-400 font-semibold">Loading recent orders from database...</div>
            ) : recentOrders.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-5 py-3 text-left font-bold text-slate-600 uppercase">Order ID</th>
                    <th className="px-5 py-3 text-left font-bold text-slate-600 uppercase">Customer</th>
                    <th className="px-5 py-3 text-left font-bold text-slate-600 uppercase">Status</th>
                    <th className="px-5 py-3 text-right font-bold text-slate-600 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {recentOrders.map((order, i) => (
                    <tr key={order.id || i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-blue-600">{order.order_number || order.id}</td>
                      <td className="px-5 py-3 font-bold text-slate-900">{order.customer_name}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                          order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          order.status === 'Shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-extrabold text-slate-900 text-right">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-500 font-semibold">No orders found in database.</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              Low Stock Alerts
            </h2>
            <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {lowStockItems.length} Warnings
            </span>
          </div>
          <div className="p-5 space-y-3 flex-1 overflow-y-auto max-h-80 text-xs">
            {loading ? (
              <div className="text-center text-slate-400 font-semibold py-4">Checking inventory stock...</div>
            ) : lowStockItems.length > 0 ? (
              lowStockItems.map((item, i) => (
                <div key={item.id || i} className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.sku || 'SKU-GENERAL'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-extrabold border ${
                      item.stock === 0 
                        ? 'bg-rose-100 text-rose-700 border-rose-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 font-semibold py-4">No low stock warnings. All items in stock!</div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
            <Link href="/inventory" className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 transition-colors">
              Manage Inventory & Restock &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
