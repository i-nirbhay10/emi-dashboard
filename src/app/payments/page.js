"use client";
import React, { useEffect, useState } from 'react';
import { getPayments } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const loadPayments = async () => {
    setLoading(true);
    const data = await getPayments(activeTab);
    setPayments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, [activeTab]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Captured':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Created':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const filteredPayments = payments.filter(p => 
    p.payment_number?.toLowerCase().includes(search.toLowerCase()) ||
    p.razorpay_order_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.razorpay_payment_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
    p.customer_phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Payments Ledger
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">
              Razorpay Gateway Sync
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review customer transactions, inspect signatures, check webhook statuses, and trace orders.</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Received</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              ₹{payments.filter(p => p.status === 'Captured').reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Captured Charges</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {payments.filter(p => p.status === 'Captured').length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Orders</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
              {payments.filter(p => p.status === 'Created').length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200 self-start">
          {['All', 'Captured', 'Created', 'Failed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                activeTab === tab 
                  ? 'bg-white text-slate-800 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Search by Payment ID, Order ID, Phone or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-800"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {/* Main Table list */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-xs mt-3 font-semibold tracking-wide">Loading secure transactions...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto border border-slate-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <p className="text-slate-500 text-sm font-semibold">No payment transactions found</p>
            <p className="text-slate-400 text-xs max-w-xs mx-auto">Try refining your filter settings or search query parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Razorpay Order ID</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredPayments.map((payment) => (
                  <tr 
                    key={payment.id}
                    onClick={() => setSelectedPayment(payment)}
                    className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-700">{payment.payment_number}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono select-all">{payment.razorpay_order_id}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{payment.customer_email || 'No Email'}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{payment.customer_phone || 'No Phone'}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">₹{payment.amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusStyle(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium">
                      {new Date(payment.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide Drawer for details */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
          {/* Backdrop Touch Close */}
          <div className="absolute inset-0" onClick={() => setSelectedPayment(null)} />
          
          <div className="w-full max-w-md bg-white h-full relative shadow-2xl flex flex-col justify-between animate-slide-in">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">{selectedPayment.payment_number}</h3>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5 block">Transaction Details</span>
              </div>
              <button 
                onClick={() => setSelectedPayment(null)} 
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Summary card */}
              <div className="bg-teal-50/50 border border-teal-100 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Amount Paid</span>
                  <h4 className="text-2xl font-extrabold text-teal-800 mt-0.5">₹{selectedPayment.amount.toLocaleString('en-IN')}</h4>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full border text-xs font-bold ${getStatusStyle(selectedPayment.status)}`}>
                  {selectedPayment.status}
                </span>
              </div>

              {/* Data list */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Customer Phone</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{selectedPayment.customer_phone || 'None linked'}</p>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Customer Email</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{selectedPayment.customer_email || 'None linked'}</p>
                </div>
                <hr className="border-slate-100" />
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Razorpay Order ID</label>
                  <p className="text-xs font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-600 mt-1 select-all">{selectedPayment.razorpay_order_id}</p>
                </div>
                {selectedPayment.razorpay_payment_id && (
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Razorpay Payment ID</label>
                    <p className="text-xs font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-600 mt-1 select-all">{selectedPayment.razorpay_payment_id}</p>
                  </div>
                )}
                {selectedPayment.razorpay_signature && (
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Razorpay Cryptographic Signature</label>
                    <p className="text-[10px] font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 text-slate-400 mt-1 break-all select-all">{selectedPayment.razorpay_signature}</p>
                  </div>
                )}
                <hr className="border-slate-100" />
                {selectedPayment.order_id && (
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Linked Fulfillment Order ID</label>
                    <p className="text-xs font-mono text-slate-800 mt-1">{selectedPayment.order_id}</p>
                  </div>
                )}
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Transaction Created At</label>
                  <p className="text-xs font-semibold text-slate-600 mt-1">{new Date(selectedPayment.created_at).toString()}</p>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setSelectedPayment(null)} 
                className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
