"use client";
import React, { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, deleteOrder } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../lib/rbac';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  const canEditOrders = user?.role === 'Super Admin' || hasPermission(user, 'orders', 'edit') || hasPermission(user, 'orders', 'manage');
  const canDeleteOrders = user?.role === 'Super Admin' || hasPermission(user, 'orders', 'delete');

  const loadOrders = async () => {
    setLoading(true);
    const data = await getOrders(activeTab);
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await updateOrderStatus(orderId, newStatus);
    if (res) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      setSuccessToast(`Order status updated to "${newStatus}"`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    const currentStatus = selectedOrder?.status || 'Processing';
    const res = await updateOrderStatus(orderId, { status: currentStatus, payment_status: newPaymentStatus });
    if (res) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, payment_status: newPaymentStatus }));
      }
      setSuccessToast(`Payment status updated to "${newPaymentStatus}"`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    await deleteOrder(orderId);
    setIsModalOpen(false);
    loadOrders();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const filteredOrders = orders.filter(o => 
    (o.order_number || o.id).toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Orders Management
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold border border-green-200">
              Live Fulfillment & Delivery Sync
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track customer purchases, review shipping address deliverability tags, and manage fulfillment.</p>
        </div>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {successToast}
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 font-bold hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Orders Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar & Filter Tabs */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search order ID, customer name, or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === tab ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <svg className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Loading orders from database...
            </div>
          ) : filteredOrders.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fulfillment Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-blue-600 font-mono text-sm">{order.order_number || order.id}</span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                      {new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 text-sm">{order.customer_name}</div>
                      <div className="text-xs text-slate-500 font-mono">{order.customer_email || 'No email registered'}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold border ${
                        order.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {order.payment_status || 'Paid'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {canEditOrders ? (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${getStatusStyle(order.status)}`}
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-extrabold text-slate-900">
                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-semibold transition-all"
                        >
                          Invoice Details
                        </button>
                        {canDeleteOrders && (
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg font-semibold transition-all"
                            title="Delete Order"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              No orders found matching search or active status tab.
            </div>
          )}
        </div>
      </div>

      {/* --- INVOICE & ORDER DETAILS MODAL --- */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl p-6 space-y-5 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-extrabold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 uppercase">
                  Order Invoice Receipt
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 font-mono mt-1">
                  {selectedOrder.order_number || selectedOrder.id}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on {new Date(selectedOrder.created_at || Date.now()).toLocaleString('en-IN')}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>

            {/* Customer & Status Flow Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1 md:space-y-0">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Customer Details</span>
                <div className="font-bold text-slate-900 text-sm mt-1">{selectedOrder.customer_name}</div>
                <div className="text-slate-500 font-mono">{selectedOrder.customer_email || 'No email'}</div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Status & Payment</span>
                <div className="flex items-center gap-2 mt-1">
                  {canEditOrders ? (
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${getStatusStyle(selectedOrder.status)}`}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  )}

                  {canEditOrders ? (
                    <select
                      value={selectedOrder.payment_status || 'Paid'}
                      onChange={(e) => handlePaymentStatusChange(selectedOrder.id, e.target.value)}
                      className="text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                      {selectedOrder.payment_status || 'Paid'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address & Delivery Availability Status Tag */}
            {selectedOrder.shipping_address && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Shipping Address & Delivery Status</span>
                  {selectedOrder.shipping_address.isDeliverable !== false ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span>⚡</span> Deliverable Zone (PIN {selectedOrder.shipping_address.pincode})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <span>⚠️</span> Unserviceable Zone (PIN {selectedOrder.shipping_address.pincode})
                    </span>
                  )}
                </div>
                <div className="font-semibold text-slate-800">
                  {selectedOrder.shipping_address.house || ''} {selectedOrder.shipping_address.street || ''}, {selectedOrder.shipping_address.city || ''}, {selectedOrder.shipping_address.state || ''} - <span className="font-mono font-bold">{selectedOrder.shipping_address.pincode}</span>
                </div>
              </div>
            )}

            {/* Itemized Purchased Products */}
            <div className="flex-1 overflow-y-auto space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Itemized Purchased Products</span>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-bold text-slate-700">Product Name</th>
                      <th className="px-3 py-2.5 text-center font-bold text-slate-700">Qty</th>
                      <th className="px-3 py-2.5 text-right font-bold text-slate-700">Unit Price</th>
                      <th className="px-4 py-2.5 text-right font-bold text-slate-700">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2.5 font-bold text-slate-900">{item.product_name}</td>
                          <td className="px-3 py-2.5 text-center text-slate-700 font-semibold">{item.quantity}</td>
                          <td className="px-3 py-2.5 text-right text-slate-700 font-mono">₹{Number(item.price).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900 font-mono">
                            ₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-slate-400 italic">
                          Standard Solar Equipment Order Package
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-4">
              <div className="text-xs text-slate-500">
                Total Order Value: <span className="text-base font-extrabold text-slate-900 ml-1">₹{Number(selectedOrder.total_amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
