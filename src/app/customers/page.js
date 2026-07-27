"use client";
import React, { useEffect, useState } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../lib/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Active, Inactive, Cart, Wishlist, HighSpender
  const [sortBy, setSortBy] = useState('latest'); // latest, spend, orders, name
  
  // Drawer & Modal States
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [drawerTab, setDrawerTab] = useState('overview'); // overview, cart, wishlist
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form states
  const [formCust, setFormCust] = useState({ id: '', name: '', email: '', phone: '', status: 'Active' });

  const loadCustomers = async () => {
    setLoading(true);
    const data = await getCustomers();
    setCustomers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formCust.name) return;
    await createCustomer({
      name: formCust.name,
      email: formCust.email || null,
      phone: formCust.phone || null,
      status: formCust.status || 'Active'
    });
    setFormCust({ id: '', name: '', email: '', phone: '', status: 'Active' });
    setIsAddModalOpen(false);
    loadCustomers();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formCust.id || !formCust.name) return;
    await updateCustomer(formCust.id, {
      name: formCust.name,
      email: formCust.email || null,
      phone: formCust.phone || null,
      status: formCust.status
    });
    setIsEditModalOpen(false);
    if (selectedCustomer && selectedCustomer.id === formCust.id) {
      setSelectedCustomer({ ...selectedCustomer, name: formCust.name, email: formCust.email, phone: formCust.phone, status: formCust.status });
    }
    loadCustomers();
  };

  const handleDeleteSubmit = async () => {
    if (!formCust.id) return;
    await deleteCustomer(formCust.id);
    setIsDeleteModalOpen(false);
    if (selectedCustomer && selectedCustomer.id === formCust.id) {
      setSelectedCustomer(null);
    }
    loadCustomers();
  };

  const openEditModal = (c) => {
    setFormCust({ id: c.id, name: c.name, email: c.email || '', phone: c.phone || '', status: c.status || 'Active' });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (c) => {
    setFormCust({ id: c.id, name: c.name, email: c.email || '', phone: c.phone || '', status: c.status });
    setIsDeleteModalOpen(true);
  };

  // Metrics calculation
  const totalCustomersCount = customers.length;
  const activeCount = customers.filter(c => c.status === 'Active').length;
  const totalCartItemsCount = customers.reduce((sum, c) => sum + (c.cart_count || 0), 0);
  const totalCartValueSum = customers.reduce((sum, c) => sum + (c.cart_total_value || 0), 0);
  const totalWishlistCount = customers.reduce((sum, c) => sum + (c.wishlist_count || 0), 0);

  // Filtering & Sorting
  const filtered = customers.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || 
                          c.email?.toLowerCase().includes(search.toLowerCase()) ||
                          c.phone?.includes(search);
    
    if (!matchesSearch) return false;

    if (statusFilter === 'Active') return c.status === 'Active';
    if (statusFilter === 'Inactive') return c.status === 'Inactive';
    if (statusFilter === 'Cart') return (c.cart_count || 0) > 0;
    if (statusFilter === 'Wishlist') return (c.wishlist_count || 0) > 0;
    if (statusFilter === 'HighSpender') return (c.total_spent || 0) >= 20000;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'spend') return (b.total_spent || 0) - (a.total_spent || 0);
    if (sortBy === 'orders') return (b.total_orders || 0) - (a.total_orders || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return new Date(b.last_active || b.created_at) - new Date(a.last_active || a.created_at);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Customers Directory
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {totalCustomersCount} Total
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Real-time management of customer accounts, active cart items, wishlists, and lifetime spend summaries.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadCustomers}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center"
            title="Refresh Directory"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
          <button 
            onClick={() => {
              setFormCust({ id: '', name: '', email: '', phone: '', status: 'Active' });
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Add Customer
          </button>
        </div>
      </div>

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Accounts</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalCustomersCount}</div>
            <div className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {activeCount} Active Accounts
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 text-green-600 flex items-center justify-center text-xl">
            👥
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Shopping Carts</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalCartItemsCount} <span className="text-xs text-slate-400 font-normal">items</span></div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              Est. Value: ₹{totalCartValueSum.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
            🛒
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Wishlisted Items</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalWishlistCount} <span className="text-xs text-slate-400 font-normal">products</span></div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Saved for later purchase
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center text-xl">
            ❤️
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Activity Pulse</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Connected to Supabase DB
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center text-xl">
            ⚡
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search by name, email, phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'All', label: 'All Customers' },
              { id: 'Active', label: 'Active Status' },
              { id: 'Cart', label: '🛒 Has Cart Items' },
              { id: 'Wishlist', label: '❤️ Has Wishlist' },
              { id: 'HighSpender', label: '💎 VIP (>₹20k)' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setStatusFilter(chip.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === chip.id 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="latest">Latest Activity</option>
              <option value="spend">Highest Spend</option>
              <option value="orders">Most Orders</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <svg className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Loading customer directory...
            </div>
          ) : filtered.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Cart</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Wishlist</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filtered.map(customer => {
                  const initials = customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  const isSelected = selectedCustomer?.id === customer.id;
                  return (
                    <tr 
                      key={customer.id} 
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isSelected ? 'bg-green-50/40' : ''}`}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setDrawerTab('overview');
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3.5">
                          <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 shadow-xs overflow-hidden">
                            {customer.avatar_url ? (
                              <img src={customer.avatar_url} alt={customer.name} className="w-full h-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 hover:text-green-600 transition-colors flex items-center gap-1.5">
                              {customer.name}
                              {(customer.total_spent || 0) >= 20000 && (
                                <span className="text-xs" title="VIP High Spender">💎</span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">{customer.email || customer.phone || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                        {customer.phone || 'N/A'}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          customer.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {customer.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs text-slate-600 font-medium">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {customer.last_active_formatted || 'Just now'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                            setDrawerTab('cart');
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 ${
                            (customer.cart_count || 0) > 0 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-slate-50 text-slate-400 border border-slate-100'
                          }`}
                        >
                          🛒 {customer.cart_count || 0}
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                            setDrawerTab('wishlist');
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 ${
                            (customer.wishlist_count || 0) > 0 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100' 
                              : 'bg-slate-50 text-slate-400 border border-slate-100'
                          }`}
                        >
                          ❤️ {customer.wishlist_count || 0}
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-600 font-semibold">
                        {customer.total_orders || 0}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                        ₹{Number(customer.total_spent || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setDrawerTab('overview');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Inspect Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          </button>
                          <button
                            onClick={() => openEditModal(customer)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                            title="Edit Customer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </button>
                          <button
                            onClick={() => openDeleteModal(customer)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Customer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              No customers found matching current search and filter rules.
            </div>
          )}
        </div>
      </div>

      {/* Advanced Customer Inspection Slide-Over Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-lg">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedCustomer.name}</h2>
                    <p className="text-xs text-slate-500 font-mono">{selectedCustomer.email || selectedCustomer.phone || 'No Email'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Drawer Navigation Tabs */}
              <div className="flex border-b border-slate-100 px-6 bg-white">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'cart', label: `🛒 Cart (${selectedCustomer.cart_count || 0})` },
                  { id: 'wishlist', label: `❤️ Wishlist (${selectedCustomer.wishlist_count || 0})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDrawerTab(tab.id)}
                    className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                      drawerTab === tab.id 
                        ? 'border-green-600 text-green-700' 
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Drawer Body Content */}
              <div className="p-6 space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto">
                {drawerTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Summary KPI Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs font-semibold text-slate-500">Total Lifetime Spend</div>
                        <div className="text-xl font-bold text-slate-900 mt-1">₹{Number(selectedCustomer.total_spent || 0).toLocaleString('en-IN')}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs font-semibold text-slate-500">Completed Orders</div>
                        <div className="text-xl font-bold text-slate-900 mt-1">{selectedCustomer.total_orders || 0} Orders</div>
                      </div>
                    </div>

                    {/* Customer Profile Attributes */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">Account ID:</span>
                        <span className="font-mono text-slate-800 font-semibold">{selectedCustomer.id}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">Phone Number:</span>
                        <span className="font-mono text-slate-800">{selectedCustomer.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">Account Status:</span>
                        <span className="font-semibold text-green-700">{selectedCustomer.status}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500 font-medium">Last Active Timestamp:</span>
                        <span className="font-mono text-slate-800">{selectedCustomer.last_active_formatted}</span>
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'cart' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                      <span>Items currently in active cart</span>
                      <span>Total Value: ₹{Number(selectedCustomer.cart_total_value || 0).toLocaleString('en-IN')}</span>
                    </div>

                    {selectedCustomer.cart_details && selectedCustomer.cart_details.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCustomer.cart_details.map((item, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                            <div>
                              <div className="font-bold text-slate-900">{item.product_name}</div>
                              <div className="text-slate-500 text-[11px]">{item.brand}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-slate-900">₹{Number(item.price).toLocaleString('en-IN')} × {item.quantity}</div>
                              <div className="text-green-600 font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No items currently in customer's shopping cart.
                      </div>
                    )}
                  </div>
                )}

                {drawerTab === 'wishlist' && (
                  <div className="space-y-4">
                    <div className="text-xs font-semibold text-slate-500">Saved Wishlist Products</div>
                    {selectedCustomer.wishlist_details && selectedCustomer.wishlist_details.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCustomer.wishlist_details.map((item, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                            <div>
                              <div className="font-bold text-slate-900">{item.product_name}</div>
                              <div className="text-slate-500 text-[11px]">{item.brand}</div>
                            </div>
                            <div className="font-bold text-slate-900">
                              ₹{Number(item.price).toLocaleString('en-IN')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No products currently wishlisted by this customer.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button
                onClick={() => openEditModal(selectedCustomer)}
                className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Edit Details
              </button>
              <button
                onClick={() => openDeleteModal(selectedCustomer)}
                className="py-2 px-4 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add New Customer</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Anish Kapoor"
                  value={formCust.name}
                  onChange={(e) => setFormCust({ ...formCust, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  placeholder="9876543210"
                  value={formCust.phone}
                  onChange={(e) => setFormCust({ ...formCust, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="anish@example.com"
                  value={formCust.email}
                  onChange={(e) => setFormCust({ ...formCust, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Edit Customer</h2>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formCust.name}
                  onChange={(e) => setFormCust({ ...formCust, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={formCust.phone}
                  onChange={(e) => setFormCust({ ...formCust, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formCust.email}
                  onChange={(e) => setFormCust({ ...formCust, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <select 
                  value={formCust.status}
                  onChange={(e) => setFormCust({ ...formCust, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Delete Account?</h2>
            <p className="text-sm text-slate-500">
              Are you sure you want to delete <strong className="text-slate-900">{formCust.name}</strong>? This action will permanently remove the customer record from the database.
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
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
