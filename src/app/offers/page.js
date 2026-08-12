"use client";
import React, { useEffect, useState } from 'react';
import { getOffers, createOffer, updateOffer, deleteOffer } from '../../lib/api';

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newOffer, setNewOffer] = useState({ title: '', code: '', discount: '', type: 'Percentage', status: 'Active', min_order_value: '', max_discount: '' });
  const [loading, setLoading] = useState(true);

  const loadOffers = async () => {
    setLoading(true);
    const data = await getOffers();
    setOffers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newOffer.title || !newOffer.code || !newOffer.discount) return;
    
    if (editingId) {
      await updateOffer(editingId, newOffer);
    } else {
      await createOffer(newOffer);
    }
    
    setNewOffer({ title: '', code: '', discount: '', type: 'Percentage', status: 'Active', min_order_value: '', max_discount: '' });
    setEditingId(null);
    setIsModalOpen(false);
    loadOffers();
  };

  const handleEditClick = (offer) => {
    setNewOffer({
      title: offer.title,
      code: offer.code,
      discount: offer.discount,
      type: offer.type || 'Percentage',
      status: offer.status || 'Active',
      min_order_value: offer.min_order_value || '',
      max_discount: offer.max_discount || ''
    });
    setEditingId(offer.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      await deleteOffer(id);
      loadOffers();
    }
  };

  const filtered = offers.filter(o => 
    o.title?.toLowerCase().includes(search.toLowerCase()) || 
    o.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Offers & Promotions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage discount coupon codes, flash sales, and campaign terms.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setNewOffer({ title: '', code: '', discount: '', type: 'Percentage', status: 'Active', min_order_value: '', max_discount: '' });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Create Offer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search promotions by title or code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading offers...</div>
          ) : filtered.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Promotion Title / Code</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rules</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Uses</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filtered.map(offer => (
                  <tr key={offer.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600 font-bold">
                          🏷️
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{offer.title}</div>
                          <div className="text-xs text-indigo-600 font-mono font-bold mt-0.5">{offer.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{offer.discount}</div>
                      <div className="text-xs text-slate-500">{offer.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-slate-600">Min Order: <span className="font-semibold text-slate-900">₹{offer.min_order_value || 0}</span></div>
                      <div className="text-xs text-slate-600 mt-0.5">Max Discount: <span className="font-semibold text-slate-900">{offer.max_discount ? `₹${offer.max_discount}` : 'None'}</span></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        offer.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {offer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-600 font-medium">{offer.uses_count || 0} times</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEditClick(offer)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                      <button onClick={() => handleDelete(offer.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">No promotional offers found.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Offer' : 'Create New Offer'}</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Campaign Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Festival Solar Special"
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Coupon Code</label>
                  <input 
                    type="text" 
                    required
                    placeholder="FESTIVAL20"
                    value={newOffer.code}
                    onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Discount Value</label>
                  <input 
                    type="text" 
                    required
                    placeholder="20 or 1000"
                    value={newOffer.discount}
                    onChange={(e) => setNewOffer({ ...newOffer, discount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Min Order Value (₹)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={newOffer.min_order_value}
                    onChange={(e) => setNewOffer({ ...newOffer, min_order_value: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Max Discount (₹)</label>
                  <input 
                    type="number" 
                    placeholder="Optional limit"
                    value={newOffer.max_discount}
                    onChange={(e) => setNewOffer({ ...newOffer, max_discount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Discount Type</label>
                  <select 
                    value={newOffer.type}
                    onChange={(e) => setNewOffer({ ...newOffer, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select 
                    value={newOffer.status}
                    onChange={(e) => setNewOffer({ ...newOffer, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm shadow-green-600/20"
                >
                  {editingId ? 'Save Changes' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
