"use client";
import React, { useEffect, useState } from 'react';
import { getProducts, updateProduct } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../lib/rbac';

export default function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Low' | 'Out' | 'Healthy'
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Check RBAC permission for inventory editing
  const canEditInventory = user?.role === 'Super Admin' || hasPermission(user, 'inventory', 'edit') || hasPermission(user, 'inventory', 'manage');

  const loadData = async () => {
    setLoading(true);
    const data = await getProducts();
    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockUpdate = async (productId, newStock, productName) => {
    if (newStock < 0) return;
    setUpdatingId(productId);
    
    const updated = await updateProduct(productId, { stock: parseInt(newStock, 10) });
    if (updated) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: parseInt(newStock, 10) } : p));
      setSuccessToast(`Stock updated for ${productName} (${newStock} units)`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
    setUpdatingId(null);
  };

  const handleQuickAddStock = async (product, addAmount) => {
    const nextStock = (product.stock || 0) + addAmount;
    await handleStockUpdate(product.id, nextStock, product.name);
  };

  // Metrics
  const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 15).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const healthyCount = products.filter(p => p.stock > 15).length;

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'Low') return p.stock > 0 && p.stock <= 15;
    if (activeFilter === 'Out') return p.stock <= 0;
    if (activeFilter === 'Healthy') return p.stock > 15;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Inventory Management
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold border border-green-200">
              Live Stock Engine
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Real-time stock tracking, threshold warnings, and instant warehouse restocking.</p>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {successToast}
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 font-bold hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Warehouse Units</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{totalUnits.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-slate-400 mt-1">Across {products.length} catalog SKUs</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Low Stock Alerts
          </span>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">{lowStockCount}</div>
          <span className="text-[11px] text-slate-400 mt-1">Items below 15 units threshold</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            Critical Out of Stock
          </span>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">{outOfStockCount}</div>
          <span className="text-[11px] text-slate-400 mt-1">Requires immediate supplier restock</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Healthy Inventory SKUs
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">{healthyCount}</div>
          <span className="text-[11px] text-slate-400 mt-1">Sufficient inventory levels</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar & Filter Tabs */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search inventory by product name or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setActiveFilter('All')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeFilter === 'All' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All SKUs ({products.length})
            </button>
            <button
              onClick={() => setActiveFilter('Low')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeFilter === 'Low' ? 'bg-amber-500 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              ⚠️ Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setActiveFilter('Out')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeFilter === 'Out' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              🚨 Out of Stock ({outOfStockCount})
            </button>
            <button
              onClick={() => setActiveFilter('Healthy')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeFilter === 'Healthy' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              ✅ Healthy ({healthyCount})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <svg className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Loading inventory stock data from PostgreSQL...
            </div>
          ) : filteredProducts.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Details / SKU</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Stock</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Threshold Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Price (₹)</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Restock Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredProducts.map(item => {
                  const isLow = item.stock > 0 && item.stock <= 15;
                  const isOut = item.stock <= 0;
                  const isUpdating = updatingId === item.id;
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 text-sm">{item.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                          <span>{item.sku}</span>
                          {item.brand && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                              {item.brand}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center min-w-[4rem] px-3 py-1.5 rounded-lg text-sm font-extrabold border ${
                          isOut ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          isLow ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-slate-50 text-slate-800 border-slate-200'
                        }`}>
                          {item.stock} Units
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          isOut 
                            ? 'bg-rose-100 text-rose-700 border-rose-200' 
                            : isLow 
                            ? 'bg-amber-100 text-amber-700 border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOut ? 'bg-rose-600' : isLow ? 'bg-amber-600' : 'bg-emerald-500'}`}></span>
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock Warning' : 'Healthy Stock'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        {canEditInventory ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={isUpdating}
                              onClick={() => handleQuickAddStock(item, 10)}
                              className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg font-bold transition-all disabled:opacity-50"
                              title="Restock +10 units"
                            >
                              +10
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleQuickAddStock(item, 50)}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold transition-all disabled:opacity-50"
                              title="Restock +50 units"
                            >
                              +50
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleQuickAddStock(item, 100)}
                              className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-bold transition-all disabled:opacity-50"
                              title="Restock +100 units"
                            >
                              +100
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">View Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              No inventory products found matching search or active filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
