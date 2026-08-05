"use client";
import React, { useEffect, useState } from 'react';
import { getProducts, getInventoryHistory, adjustInventory } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../lib/rbac';

export default function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('Stock'); // 'Stock' | 'History' | 'LowStock'
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const [errorToast, setErrorToast] = useState(null);

  // Adjust stock modal state
  const [adjustModal, setAdjustModal] = useState(null); // { product, variant? }
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  // Movement log state
  const [movementLog, setMovementLog] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

  const canEditInventory = user?.role === 'Super Admin' || hasPermission(user, 'inventory', 'edit') || hasPermission(user, 'inventory', 'manage');

  const loadData = async () => {
    setLoading(true);
    const data = await getProducts();
    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const loadHistory = async () => {
    setLogLoading(true);
    const data = await getInventoryHistory();
    setMovementLog(data || []);
    setLogLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'History') loadHistory();
  }, [activeTab]);

  const handleAdjustSubmit = async () => {
    if (!adjustModal || !adjustQty || !adjustReason) return;
    setAdjustSubmitting(true);
    try {
      const payload = {
        product_id: adjustModal.product.id,
        qty_changed: parseInt(adjustQty, 10),
        reason: adjustReason,
      };
      if (adjustModal.variant) {
        payload.variant_id = adjustModal.variant.id;
      }
      const result = await adjustInventory(payload);
      if (result) {
        setSuccessToast(`Stock adjusted for ${adjustModal.product.name}${adjustModal.variant ? ` (${adjustModal.variant.name})` : ''}`);
        setTimeout(() => setSuccessToast(null), 3000);
        setAdjustModal(null);
        setAdjustQty('');
        setAdjustReason('');
        loadData();
      } else {
        setErrorToast('Failed to adjust stock. Please try again.');
        setTimeout(() => setErrorToast(null), 4000);
      }
    } catch (err) {
      setErrorToast(err.message || 'Adjustment failed.');
      setTimeout(() => setErrorToast(null), 4000);
    }
    setAdjustSubmitting(false);
  };

  // Metrics
  const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);

  const lowStockCount = products.filter(p => {
    const threshold = Math.max(p.low_stock_threshold || 0, 20);
    const variants = p.variants || [];
    if (variants.length > 0) {
      return variants.some(v => v.stock > 0 && v.stock <= threshold);
    }
    return p.stock > 0 && p.stock <= threshold;
  }).length;

  const outOfStockCount = products.filter(p => {
    const variants = p.variants || [];
    if (variants.length > 0) {
      return variants.some(v => v.stock <= 0);
    }
    return p.stock <= 0;
  }).length;

  const healthyCount = products.filter(p => {
    const threshold = Math.max(p.low_stock_threshold || 0, 20);
    const variants = p.variants || [];
    if (variants.length > 0) {
      return variants.every(v => v.stock > threshold);
    }
    return p.stock > threshold;
  }).length;

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    const threshold = Math.max(p.low_stock_threshold || 0, 20);
    const variants = p.variants || [];

    if (activeFilter === 'Low') {
      if (variants.length > 0) {
        return variants.some(v => v.stock > 0 && v.stock <= threshold);
      }
      return p.stock > 0 && p.stock <= threshold;
    }
    if (activeFilter === 'Out') {
      if (variants.length > 0) {
        return variants.some(v => v.stock <= 0);
      }
      return p.stock <= 0;
    }
    if (activeFilter === 'Healthy') {
      if (variants.length > 0) {
        return variants.every(v => v.stock > threshold);
      }
      return p.stock > threshold;
    }
    return true;
  });

  // Derive variant-level low stock alerts directly from the main products list (Dashboard Approach)
  const derivedLowStockAlerts = [];
  products.forEach(p => {
    const threshold = Math.max(p.low_stock_threshold || 0, 20);
    const variants = p.variants || [];
    if (variants.length > 0) {
      variants.forEach(v => {
        if (v.stock <= threshold) {
          derivedLowStockAlerts.push({
            id: v.id,
            name: `${p.name} (${v.name})`,
            sku: v.sku,
            stock: v.stock,
            low_stock_threshold: threshold
          });
        }
      });
    } else {
      if (p.stock <= threshold) {
        derivedLowStockAlerts.push({
          id: p.id,
          name: p.name,
          sku: p.sku,
          stock: p.stock,
          low_stock_threshold: threshold
        });
      }
    }
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

      {/* Toasts */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {successToast}
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 font-bold hover:text-emerald-900">✕</button>
        </div>
      )}
      {errorToast && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            {errorToast}
          </div>
          <button onClick={() => setErrorToast(null)} className="text-rose-600 font-bold hover:text-rose-900">✕</button>
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
          <span className="text-[11px] text-slate-400 mt-1">Items below configured threshold</span>
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

      {/* Tab Navigation: Stock / History / Low Stock */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {['Stock', 'History', 'LowStock'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab === 'LowStock' ? '⚠️ Low Stock Alerts' : tab === 'History' ? '📋 Movement Log' : '📦 Stock Overview'}
            </button>
          ))}
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
          title="Refresh Inventory"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      {/* Tab: Stock Overview */}
      {activeTab === 'Stock' && (
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
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeFilter === 'All' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                All SKUs ({products.length})
              </button>
              <button
                onClick={() => setActiveFilter('Low')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeFilter === 'Low' ? 'bg-amber-500 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                ⚠️ Low Stock ({lowStockCount})
              </button>
              <button
                onClick={() => setActiveFilter('Out')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeFilter === 'Out' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                🚨 Out of Stock ({outOfStockCount})
              </button>
              <button
                onClick={() => setActiveFilter('Healthy')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeFilter === 'Healthy' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
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
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Variants</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Threshold Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Price (₹)</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredProducts.map(item => {
                    const threshold = Math.max(item.low_stock_threshold || 0, 20);
                    const isLow = item.stock > 0 && item.stock <= threshold;
                    const isOut = item.stock <= 0;
                    const variants = item.variants || [];

                    return (
                      <React.Fragment key={item.id}>
                        <tr className="hover:bg-slate-50/80 transition-colors group">
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
                            <span className={`inline-flex items-center justify-center min-w-[4rem] px-3 py-1.5 rounded-lg text-sm font-extrabold border ${isOut ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                isLow ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-slate-50 text-slate-800 border-slate-200'
                              }`}>
                              {item.stock} Units
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {variants.length > 0 ? (
                              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold">
                                {variants.length} variant{variants.length > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${isOut
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
                              <button
                                onClick={() => setAdjustModal({ product: item })}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-bold transition-all"
                              >
                                Adjust Stock
                              </button>
                            ) : (
                              <span className="text-slate-400 text-xs italic">View Only</span>
                            )}
                          </td>
                        </tr>

                        {/* Variant Rows */}
                        {variants.length > 0 && variants.map(variant => {
                          const vIsLow = variant.stock > 0 && variant.stock <= threshold;
                          const vIsOut = variant.stock <= 0;
                          return (
                            <tr key={variant.id} className="bg-blue-50/30 hover:bg-blue-50/60 transition-colors">
                              <td className="px-6 py-3 pl-12 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-blue-400 text-xs">↳</span>
                                  <div>
                                    <div className="font-medium text-slate-700 text-xs">{variant.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">SKU: {variant.sku}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-center">
                                <span className={`inline-flex items-center justify-center min-w-[3.5rem] px-2.5 py-1 rounded-lg text-xs font-extrabold border ${vIsOut ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                    vIsLow ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                      'bg-slate-50 text-slate-800 border-slate-200'
                                  }`}>
                                  {variant.stock}
                                </span>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-center text-[10px] text-slate-400">
                                —
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${vIsOut
                                    ? 'bg-rose-100 text-rose-700 border-rose-200'
                                    : vIsLow
                                      ? 'bg-amber-100 text-amber-700 border-amber-200'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}>
                                  {vIsOut ? 'Out' : vIsLow ? 'Low' : 'OK'}
                                </span>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-right text-xs font-semibold text-slate-600">
                                {variant.price ? `₹${Number(variant.price).toLocaleString('en-IN')}` : '—'}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-right text-xs">
                                {canEditInventory && (
                                  <button
                                    onClick={() => setAdjustModal({ product: item, variant })}
                                    className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg font-bold transition-all text-[11px]"
                                  >
                                    Adjust
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
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
      )}

      {/* Tab: Movement Log History */}
      {activeTab === 'History' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800">Inventory Movement Audit Log</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">All stock changes — orders, cancellations, manual adjustments, and refunds.</p>
          </div>
          <div className="overflow-x-auto">
            {logLoading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <svg className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Loading movement logs...
              </div>
            ) : movementLog.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Variant</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Change</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Previous</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">New Stock</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {movementLog.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-3 text-xs font-semibold text-slate-800 whitespace-nowrap">
                        {log.product?.name || '—'}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600 whitespace-nowrap">
                        {log.variant?.name || '—'}
                      </td>
                      <td className="px-5 py-3 text-center whitespace-nowrap">
                        <span className={`text-xs font-extrabold px-2 py-0.5 rounded border ${log.qty_changed > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                          {log.qty_changed > 0 ? '+' : ''}{log.qty_changed}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-xs text-slate-500 font-mono">{log.prev_stock}</td>
                      <td className="px-5 py-3 text-center text-xs font-bold text-slate-800 font-mono">{log.new_stock}</td>
                      <td className="px-5 py-3 text-xs text-slate-600 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${log.reason === 'Order' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            log.reason === 'Cancellation' || log.reason === 'Refund' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              log.reason === 'Manual' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                          {log.reason}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                        {log.reference_id || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-500 text-sm">
                No inventory movements recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Low Stock Alerts */}
      {activeTab === 'LowStock' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-amber-50/50">
            <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Low Stock & Out of Stock Alerts
            </h3>
            <p className="text-[11px] text-amber-600 mt-0.5">Products and variants that need immediate restocking attention.</p>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <svg className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Loading alerts...
              </div>
            ) : derivedLowStockAlerts.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">SKU</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Remaining Stock</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Threshold</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Severity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {derivedLowStockAlerts.map(item => {
                    const isOut = item.stock <= 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900">{item.name}</td>
                        <td className="px-5 py-3 text-xs text-slate-500 font-mono">{item.sku}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-sm font-extrabold ${isOut ? 'text-rose-700' : 'text-amber-700'}`}>
                            {item.stock}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center text-xs text-slate-500">{item.low_stock_threshold}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${isOut ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                            }`}>
                            {isOut ? '🚨 OUT OF STOCK' : '⚠️ LOW STOCK'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-emerald-600 text-sm font-semibold">
                ✅ All inventory levels are healthy. No low stock alerts.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Adjust Stock</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {adjustModal.product.name}
                  {adjustModal.variant && ` › ${adjustModal.variant.name}`}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Current: {adjustModal.variant ? adjustModal.variant.stock : adjustModal.product.stock} units
                </p>
              </div>
              <button onClick={() => { setAdjustModal(null); setAdjustQty(''); setAdjustReason(''); }} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Change</label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="e.g. +50 or -10"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Positive to add stock, negative to deduct</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Adjustment</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Supplier restock, Damaged goods, Audit correction"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => { setAdjustModal(null); setAdjustQty(''); setAdjustReason(''); }}
                className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustSubmit}
                disabled={!adjustQty || !adjustReason || adjustSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {adjustSubmitting ? 'Adjusting...' : 'Confirm Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
