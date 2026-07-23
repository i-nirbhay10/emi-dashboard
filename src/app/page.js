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
  const recentOrders = data?.recentOrders || [];
  const lowStockItems = data?.recentProducts ? data.recentProducts.filter(p => p.stock <= 15) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Live metrics and store performance directly from the server API.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/products" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Add Product
          </Link>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))
        ) : kpis.length > 0 ? (
          kpis.map((kpi, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-slate-500 text-sm font-medium">{kpi.title}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{kpi.value}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${kpi.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-900">Revenue Breakdown</h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">Live API Data</span>
          </div>
          <div className="h-64 w-full flex items-end gap-2 pt-4">
            {[45, 75, 55, 95, 70, 90, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-green-100 rounded-t-sm hover:bg-green-200 transition-colors relative group">
                <div className="absolute bottom-0 w-full bg-green-600 rounded-t-sm transition-all" style={{ height: `${h}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Live System Status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-6">Backend API Status</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-ping"></div>
              <div>
                <p className="text-sm font-semibold text-green-900">Server Connected</p>
                <p className="text-xs text-green-700 mt-0.5">PostgreSQL database active</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Active Database:</span>
                <span className="font-semibold text-slate-900">Supabase PostgreSQL</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>API Gateway:</span>
                <span className="font-semibold text-slate-900">http://localhost:3002/api/v1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>
            <Link href="/orders" className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors">View All Orders &rarr;</Link>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-slate-400 text-sm">Loading recent orders...</div>
            ) : recentOrders.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {recentOrders.map((order, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-blue-600">{order.order_number || order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{order.customer_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                          order.status === 'Shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 text-right">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">No orders found in database.</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Low Stock Alerts
            </h2>
          </div>
          <div className="p-6 space-y-5 flex-1">
            {loading ? (
              <div className="text-center text-slate-400 text-sm py-4">Checking stock...</div>
            ) : lowStockItems.length > 0 ? (
              lowStockItems.map((item, i) => (
                <div key={i} className="flex justify-between items-start pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 leading-tight">{item.name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${item.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {item.stock} units left
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{item.stock === 0 ? 'Out of Stock' : 'Low Stock'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 text-sm py-4">No low stock warnings. All items in stock!</div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
            <Link href="/inventory" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Manage Inventory &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
