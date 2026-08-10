"use client";
import React, { useEffect, useState } from 'react';
import { getProducts, getInventoryHistory, adjustInventory, getLogisticsHubs, transferInventory } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../lib/rbac';

export default function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [selectedHubId, setSelectedHubId] = useState('All');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('Stock'); // 'Stock' | 'History' | 'LowStock'
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState(null);
  const [errorToast, setErrorToast] = useState(null);

  // Adjust stock modal state
  const [adjustModal, setAdjustModal] = useState(null); // { product, variant? }
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustHubId, setAdjustHubId] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  // Stock Transfer modal state
  const [transferModal, setTransferModal] = useState(null); // { product, variant? }
  const [transferFromHubId, setTransferFromHubId] = useState('');
  const [transferToHubId, setTransferToHubId] = useState('');
  const [transferQty, setTransferQty] = useState('');
  const [transferSubmitting, setTransferSubmitting] = useState(false);

  // Movement log state
  const [movementLog, setMovementLog] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

  const canEditInventory = user?.role === 'Super Admin' || hasPermission(user, 'inventory', 'edit') || hasPermission(user, 'inventory', 'manage');

  const loadData = async () => {
    setLoading(true);
    const [productsData, hubsData] = await Promise.all([
      getProducts(),
      getLogisticsHubs()
    ]);
    if (productsData) setProducts(productsData);
    if (hubsData) {
      setHubs(hubsData);
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
    if (user && user.hub_id) {
      setSelectedHubId(user.hub_id);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'History') loadHistory();
  }, [activeTab]);

  /**
   * Compute stock for a product or variant based on selected hub filter.
   * Source of truth: hub_inventories relation (not cached stock field).
   */
  const getDisplayStock = (productOrVariant, isVariant = false) => {
    const inventories = productOrVariant.hub_inventories || [];
    if (selectedHubId === 'All') {
      // Sum all hub inventories
      return inventories.reduce((sum, hi) => sum + (hi.stock || 0), 0);
    }
    if (isVariant) {
      const match = inventories.find(hi => hi.hub_id === selectedHubId);
      return match ? match.stock : 0;
    } else {
      // For base products without variant, variant_id must be null
      const match = inventories.find(hi => hi.hub_id === selectedHubId && hi.variant_id === null);
      return match ? match.stock : 0;
    }
  };

  /**
   * Get stock at a specific hub for a given product/variant (for modals)
   */
  const getStockAtHub = (productOrVariant, hubId, isVariant = false) => {
    const inventories = productOrVariant.hub_inventories || [];
    if (isVariant) {
      const match = inventories.find(hi => hi.hub_id === hubId);
      return match ? match.stock : 0;
    } else {
      const match = inventories.find(hi => hi.hub_id === hubId && hi.variant_id === null);
      return match ? match.stock : 0;
    }
  };

  const handleAdjustSubmit = async () => {
    if (!adjustModal || !adjustQty || !adjustReason) return;
    const targetHub = adjustHubId || (hubs.length > 0 ? hubs[0].id : null);
    if (!targetHub) {
      setErrorToast('No hub selected for adjustment.');
      return;
    }

    setAdjustSubmitting(true);
    try {
      const payload = {
        product_id: adjustModal.product.id,
        qty_changed: parseInt(adjustQty, 10),
        reason: adjustReason,
        hub_id: targetHub
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

  const handleTransferSubmit = async () => {
    if (!transferModal || !transferFromHubId || !transferToHubId || !transferQty) return;
    if (transferFromHubId === transferToHubId) {
      setErrorToast('Source and Target Hubs must be different.');
      setTimeout(() => setErrorToast(null), 4000);
      return;
    }

    setTransferSubmitting(true);
    try {
      const payload = {
        product_id: transferModal.product.id,
        from_hub_id: transferFromHubId,
        to_hub_id: transferToHubId,
        quantity: parseInt(transferQty, 10)
      };
      if (transferModal.variant) {
        payload.variant_id = transferModal.variant.id;
      }
      const result = await transferInventory(payload);
      if (result) {
        setSuccessToast(`Inventory transferred successfully!`);
        setTimeout(() => setSuccessToast(null), 3000);
        setTransferModal(null);
        setTransferQty('');
        setTransferFromHubId('');
        setTransferToHubId('');
        loadData();
      } else {
        setErrorToast('Failed to transfer inventory.');
        setTimeout(() => setErrorToast(null), 4000);
      }
    } catch (err) {
      setErrorToast(err.message || 'Transfer failed.');
      setTimeout(() => setErrorToast(null), 4000);
    }
    setTransferSubmitting(false);
  };

  /**
   * Build a flat inventory rows list: one row per Product+Variant+Hub combination.
   * This is the core data structure for the flat table view.
   */
  const buildFlatRows = () => {
    const rows = [];
    products.forEach(product => {
      const variants = product.variants || [];
      const baseInventories = product.hub_inventories || [];

      if (variants.length === 0) {
        // Product without variants — one row per hub
        if (selectedHubId === 'All') {
          if (baseInventories.length > 0) {
            baseInventories.filter(hi => hi.variant_id === null).forEach(hi => {
              rows.push({
                product,
                variant: null,
                hub: hi.hub,
                hubId: hi.hub_id,
                hubName: hi.hub?.name || 'Unknown',
                stock: hi.stock || 0,
                sku: product.sku,
                price: product.price
              });
            });
          } else {
            // Product with no hub inventory records at all
            rows.push({
              product,
              variant: null,
              hub: null,
              hubId: null,
              hubName: 'No Hub Assigned',
              stock: 0,
              sku: product.sku,
              price: product.price
            });
          }
        } else {
          const match = baseInventories.find(hi => hi.hub_id === selectedHubId && hi.variant_id === null);
          rows.push({
            product,
            variant: null,
            hub: match?.hub || hubs.find(h => h.id === selectedHubId),
            hubId: selectedHubId,
            hubName: match?.hub?.name || hubs.find(h => h.id === selectedHubId)?.name || 'Unknown',
            stock: match ? match.stock : 0,
            sku: product.sku,
            price: product.price
          });
        }
      } else {
        // Product with variants — one row per variant + hub combination
        variants.forEach(variant => {
          const vInventories = variant.hub_inventories || [];
          if (selectedHubId === 'All') {
            if (vInventories.length > 0) {
              vInventories.forEach(hi => {
                rows.push({
                  product,
                  variant,
                  hub: hi.hub,
                  hubId: hi.hub_id,
                  hubName: hi.hub?.name || 'Unknown',
                  stock: hi.stock || 0,
                  sku: variant.sku,
                  price: variant.price || product.price
                });
              });
            } else {
              rows.push({
                product,
                variant,
                hub: null,
                hubId: null,
                hubName: 'No Hub Assigned',
                stock: 0,
                sku: variant.sku,
                price: variant.price || product.price
              });
            }
          } else {
            const match = vInventories.find(hi => hi.hub_id === selectedHubId);
            rows.push({
              product,
              variant,
              hub: match?.hub || hubs.find(h => h.id === selectedHubId),
              hubId: selectedHubId,
              hubName: match?.hub?.name || hubs.find(h => h.id === selectedHubId)?.name || 'Unknown',
              stock: match ? match.stock : 0,
              sku: variant.sku,
              price: variant.price || product.price
            });
          }
        });
      }
    });
    return rows;
  };

  const flatRows = buildFlatRows();

  // Metrics from flat rows (source of truth)
  const totalUnits = flatRows.reduce((acc, r) => acc + r.stock, 0);
  const LOW_THRESHOLD = 20;

  const lowStockRows = flatRows.filter(r => r.stock > 0 && r.stock <= LOW_THRESHOLD);
  const outOfStockRows = flatRows.filter(r => r.stock <= 0);
  const healthyRows = flatRows.filter(r => r.stock > LOW_THRESHOLD);

  // Filtered rows
  const filteredRows = flatRows.filter(r => {
    const searchLower = search.toLowerCase();
    const matchesSearch = !search ||
      r.product.name?.toLowerCase().includes(searchLower) ||
      r.sku?.toLowerCase().includes(searchLower) ||
      r.product.brand?.toLowerCase().includes(searchLower) ||
      r.hubName?.toLowerCase().includes(searchLower) ||
      (r.variant?.name || '').toLowerCase().includes(searchLower);
    if (!matchesSearch) return false;

    if (activeFilter === 'Low') return r.stock > 0 && r.stock <= LOW_THRESHOLD;
    if (activeFilter === 'Out') return r.stock <= 0;
    if (activeFilter === 'Healthy') return r.stock > LOW_THRESHOLD;
    return true;
  });

  // Unique product count for display
  const uniqueProductCount = new Set(products.map(p => p.id)).size;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Multi-Hub Inventory Management
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold border border-green-200">
              Distributed Stock Engine
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Monitor, adjust, and transfer solar product inventory across all delivery hubs independently.</p>
        </div>
      </div>

      {/* Toasts */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {successToast}
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 font-bold hover:text-emerald-900">✕</button>
        </div>
      )}
      {errorToast && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
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
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hub Stock Units</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{totalUnits.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-slate-400 mt-1">For {selectedHubId === 'All' ? 'All Hubs Combined' : hubs.find(h => h.id === selectedHubId)?.name || 'Selected Hub'}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Low Stock Alerts
          </span>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">{lowStockRows.length}</div>
          <span className="text-[11px] text-slate-400 mt-1">Items below {LOW_THRESHOLD} units at this filter</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            Critical Out of Stock
          </span>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">{outOfStockRows.length}</div>
          <span className="text-[11px] text-slate-400 mt-1">Needs immediate replenishment</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Healthy Inventory
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">{healthyRows.length}</div>
          <span className="text-[11px] text-slate-400 mt-1">Sufficient distributed stock</span>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {['Stock', 'History', 'LowStock'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab === 'LowStock' ? '⚠️ Alerts' : tab === 'History' ? '📋 Movement Logs' : '📦 Inventory Overview'}
            </button>
          ))}
        </div>

        {/* Hub Selector & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Inventory Location:</label>
            {user && user.hub_id ? (
              <select
                disabled
                value={user.hub_id}
                className="bg-slate-100 border border-slate-200 rounded-lg text-xs px-3 py-2 text-slate-500 font-bold cursor-not-allowed"
              >
                <option value={user.hub_id}>
                  {hubs.find(h => h.id === user.hub_id)?.name || 'Assigned Warehouse Hub'}
                </option>
              </select>
            ) : (
              <select
                value={selectedHubId}
                onChange={(e) => setSelectedHubId(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="All">All Hubs (Central Cumulative)</option>
                {hubs.map(hub => (
                  <option key={hub.id} value={hub.id}>
                    {hub.name} ({hub.hub_code})
                  </option>
                ))}
              </select>
            )}
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
      </div>

      {/* Tab: Stock Overview — Flat Table View */}
      {activeTab === 'Stock' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Toolbar Search & Filters */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <div className="relative w-full md:w-96">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Search by product, variant, SKU, brand, hub location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setActiveFilter('All')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeFilter === 'All' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                All Records ({flatRows.length})
              </button>
              <button
                onClick={() => setActiveFilter('Low')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeFilter === 'Low' ? 'bg-amber-500 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                ⚠️ Low Stock ({lowStockRows.length})
              </button>
              <button
                onClick={() => setActiveFilter('Out')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeFilter === 'Out' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                🚨 Out of Stock ({outOfStockRows.length})
              </button>
              <button
                onClick={() => setActiveFilter('Healthy')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeFilter === 'Healthy' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                ✅ Healthy ({healthyRows.length})
              </button>
            </div>
          </div>

          {/* Flat Inventory Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <svg className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Loading inventory stock data from PostgreSQL...
              </div>
            ) : filteredRows.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Variant / Specification</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-emerald-600 uppercase tracking-wider">📍 Hub Location</th>
                    <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Price (₹)</th>
                    <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredRows.map((row, idx) => {
                    const isLow = row.stock > 0 && row.stock <= LOW_THRESHOLD;
                    const isOut = row.stock <= 0;

                    return (
                      <tr key={`${row.product.id}-${row.variant?.id || 'base'}-${row.hubId || idx}`} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 text-sm">{row.product.name}</div>
                          {row.product.brand && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              {row.product.brand}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {row.variant ? (
                            <div>
                              <div className="font-medium text-blue-700 text-xs">{row.variant.name}</div>
                              {row.variant.size && (
                                <span className="text-[10px] text-slate-400">{row.variant.size}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No Variant</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="text-xs font-mono text-slate-500">{row.sku}</span>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border ${
                            row.hubId
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {row.hubName}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center justify-center min-w-[4rem] px-3 py-1.5 rounded-lg text-sm font-extrabold border ${
                            isOut ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            isLow ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-50 text-slate-800 border-slate-200'
                          }`}>
                            {row.stock}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isOut ? 'bg-rose-100 text-rose-700 border-rose-200' :
                            isLow ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOut ? 'bg-rose-600' : isLow ? 'bg-amber-600' : 'bg-emerald-500'}`}></span>
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                          ₹{Number(row.price).toLocaleString('en-IN')}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs space-x-2">
                          {canEditInventory ? (
                            <>
                              <button
                                onClick={() => {
                                  setAdjustModal({ product: row.product, variant: row.variant || null });
                                  setAdjustHubId(row.hubId || (selectedHubId === 'All' ? (hubs[0]?.id || '') : selectedHubId));
                                }}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-bold transition-all"
                              >
                                Adjust
                              </button>
                              {!(user && user.hub_id) && (
                                <button
                                  onClick={() => {
                                    setTransferModal({ product: row.product, variant: row.variant || null });
                                    setTransferFromHubId(row.hubId || (selectedHubId === 'All' ? (hubs[0]?.id || '') : selectedHubId));
                                    setTransferToHubId(hubs.find(h => h.id !== (row.hubId || selectedHubId))?.id || '');
                                  }}
                                  className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg font-bold transition-all"
                                >
                                  Transfer
                                </button>
                              )}
                            </>
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
                No inventory records found matching search or active filter.
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
            <p className="text-[11px] text-slate-500 mt-0.5">All stock changes — orders, cancellations, manual adjustments, transfers, and refunds.</p>
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
                        <span className={`text-xs font-extrabold px-2 py-0.5 rounded border ${log.qty_changed > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {log.qty_changed > 0 ? '+' : ''}{log.qty_changed}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-xs text-slate-500 font-mono">{log.prev_stock}</td>
                      <td className="px-5 py-3 text-center text-xs font-bold text-slate-800 font-mono">{log.new_stock}</td>
                      <td className="px-5 py-3 text-xs text-slate-600 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${log.reason.includes('Order') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            log.reason.includes('Cancel') || log.reason.includes('Refund') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              log.reason.includes('Transfer') ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                                'bg-purple-50 text-purple-700 border-purple-200'
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
            <p className="text-[11px] text-amber-600 mt-0.5">Products and variants that need immediate restocking attention at the current location filter.</p>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <svg className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Loading alerts...
              </div>
            ) : [...lowStockRows, ...outOfStockRows].length > 0 ? (
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Variant</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">SKU</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-emerald-600 uppercase">Hub Location</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Remaining Stock</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Threshold</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Severity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {[...lowStockRows, ...outOfStockRows].map((row, idx) => {
                    const isOut = row.stock <= 0;
                    return (
                      <tr key={`alert-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900">{row.product.name}</td>
                        <td className="px-5 py-3 text-xs text-blue-700 font-medium">{row.variant?.name || '—'}</td>
                        <td className="px-5 py-3 text-xs text-slate-500 font-mono">{row.sku}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                            {row.hubName}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-sm font-extrabold ${isOut ? 'text-rose-700' : 'text-amber-700'}`}>
                            {row.stock}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center text-xs text-slate-500">{LOW_THRESHOLD}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${isOut ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
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
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Adjust Stock</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {adjustModal.product.name}
                  {adjustModal.variant && ` › ${adjustModal.variant.name}`}
                </p>
              </div>
              <button onClick={() => { setAdjustModal(null); setAdjustQty(''); setAdjustReason(''); }} className="text-slate-400 hover:text-slate-600 font-bold font-mono">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Location (Hub)</label>
                <select
                  value={adjustHubId}
                  onChange={(e) => setAdjustHubId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {hubs.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              {/* Show current stock at selected hub */}
              {adjustHubId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <span className="text-xs font-bold text-blue-800">Current stock at {hubs.find(h => h.id === adjustHubId)?.name}: </span>
                  <span className="text-sm font-extrabold text-blue-900">
                    {adjustModal.variant
                      ? getStockAtHub(adjustModal.variant, adjustHubId, true)
                      : getStockAtHub(adjustModal.product, adjustHubId, false)
                    } units
                  </span>
                </div>
              )}

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

      {/* Stock Transfer Modal */}
      {transferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Inter-Hub Stock Transfer</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {transferModal.product.name}
                  {transferModal.variant && ` › ${transferModal.variant.name}`}
                </p>
              </div>
              <button onClick={() => { setTransferModal(null); setTransferQty(''); }} className="text-slate-400 hover:text-slate-600 font-bold font-mono">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Source Location (From)</label>
                <select
                  value={transferFromHubId}
                  onChange={(e) => setTransferFromHubId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select source hub...</option>
                  {hubs.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              {/* Show source hub available stock */}
              {transferFromHubId && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <span className="text-xs font-bold text-amber-800">Available at {hubs.find(h => h.id === transferFromHubId)?.name}: </span>
                  <span className="text-sm font-extrabold text-amber-900">
                    {transferModal.variant
                      ? getStockAtHub(transferModal.variant, transferFromHubId, true)
                      : getStockAtHub(transferModal.product, transferFromHubId, false)
                    } units
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Location (To)</label>
                <select
                  value={transferToHubId}
                  onChange={(e) => setTransferToHubId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select destination hub...</option>
                  {hubs.filter(h => h.id !== transferFromHubId).map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity to Transfer</label>
                <input
                  type="number"
                  value={transferQty}
                  onChange={(e) => setTransferQty(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => { setTransferModal(null); setTransferQty(''); }}
                className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferSubmit}
                disabled={!transferFromHubId || !transferToHubId || !transferQty || transferSubmitting}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {transferSubmitting ? 'Transferring...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
