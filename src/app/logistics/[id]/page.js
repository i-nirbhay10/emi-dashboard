"use client";
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getLogisticsHubDetails } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { hasPermission } from '../../../lib/rbac';

export default function WarehouseDetailsPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const hubId = params.id;
  const router = useRouter();
  
  const { user: currentUser } = useAuth();
  const currentRole = currentUser?.role || 'Super Admin';
  const isSuperAdmin = currentRole === 'Super Admin' || currentUser?.email === 'admin@energymall.in';
  const canView = isSuperAdmin || hasPermission(currentUser, 'logistics', 'view');

  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!canView) return;
    async function loadData() {
      const data = await getLogisticsHubDetails(hubId);
      if (data) {
        setHub(data);
      } else {
        router.push('/logistics');
      }
      setLoading(false);
    }
    loadData();
  }, [hubId, canView, router]);

  if (!canView) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 my-12">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center text-2xl font-bold">🛡️</div>
        <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          You do not have permission to view Warehouse Details.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hub) return null;

  // Deriving Alerts
  const lowStockThreshold = 5;
  const outOfStockItems = hub.hub_inventories?.filter(i => i.stock === 0) || [];
  const lowStockItems = hub.hub_inventories?.filter(i => i.stock > 0 && i.stock <= lowStockThreshold) || [];
  const delayedOrders = hub.orders?.filter(o => o.status === 'Delayed' || o.status === 'Failed') || [];
  
  const allAlerts = [
    ...outOfStockItems.map(i => ({ type: 'Critical', msg: `${i.product?.name} is Out of Stock!` })),
    ...lowStockItems.map(i => ({ type: 'Warning', msg: `${i.product?.name} is running low on stock (${i.stock} left).` })),
    ...delayedOrders.map(o => ({ type: 'Error', msg: `Order #${o.order_number} is ${o.status}.` }))
  ];

  const TABS = ['Overview', 'Inventory', 'Orders', 'Deliveries', 'Staff', 'Alerts'];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <Link href="/logistics" className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs flex items-center gap-1 mb-2">
          ← Back to Logistics & Hubs
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {hub.name}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${hub.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {hub.status}
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">{hub.hub_code} • {hub.address}, {hub.city}, {hub.state}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Inventory Items</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{hub.hub_inventories?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase">Active Orders</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{hub.orders?.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase">Assigned Staff</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{hub.users?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-500 uppercase">Serviceable Pincodes</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{hub.pincodes?.length || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-px">
        {TABS.map(tab => {
          let badge = null;
          if (tab === 'Alerts' && allAlerts.length > 0) {
            badge = <span className="ml-1.5 bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{allAlerts.length}</span>;
          }
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearch(''); }}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-bold transition-all border-b-2 flex items-center ${activeTab === tab ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab} {badge}
            </button>
          );
        })}
      </div>

      {/* Search Bar for specific tabs */}
      {['Inventory', 'Orders', 'Deliveries'].includes(activeTab) && (
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 font-bold text-lg">⌕</span>
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>
      )}

      {/* TAB CONTENTS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        
        {/* OVERVIEW */}
        {activeTab === 'Overview' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Operational Status</h3>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Contact</span><span className="font-semibold">{hub.contact_phone || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Service Zones</span><span className="font-semibold">{hub.supported_zones?.join(', ') || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Capacity</span><span className="font-semibold">Standard</span></div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Recent Alerts</h3>
              {allAlerts.length === 0 ? (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-sm font-semibold">
                  All systems operational. No alerts.
                </div>
              ) : (
                <div className="space-y-2">
                  {allAlerts.slice(0, 3).map((a, i) => (
                    <div key={i} className={`p-3 rounded-lg border text-xs font-semibold ${a.type === 'Critical' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                      {a.msg}
                    </div>
                  ))}
                  {allAlerts.length > 3 && (
                    <button onClick={() => setActiveTab('Alerts')} className="text-xs font-bold text-blue-600 hover:underline">View all {allAlerts.length} alerts →</button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* INVENTORY */}
        {activeTab === 'Inventory' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Product SKU</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Product Name</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Variant</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(hub.hub_inventories || [])
                  .filter(i => 
                    i.product?.name?.toLowerCase().includes(search.toLowerCase()) || 
                    i.product?.sku?.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600">{item.variant?.sku || item.product?.sku}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.product?.name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.variant?.name || 'Base'}</td>
                    <td className="px-4 py-3 font-extrabold text-slate-900">{item.stock}</td>
                    <td className="px-4 py-3">
                      {item.stock === 0 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">Out of Stock</span>
                      ) : item.stock <= lowStockThreshold ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">Low Stock</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">In Stock</span>
                      )}
                    </td>
                  </tr>
                ))}
                {(hub.hub_inventories || []).length === 0 && (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500 font-semibold">No inventory records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'Orders' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Order #</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(hub.orders || [])
                  .filter(o => o.order_number.toLowerCase().includes(search.toLowerCase()) || o.customer_name.toLowerCase().includes(search.toLowerCase()))
                  .map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600">{order.order_number}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{order.customer_name}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ['Pending', 'Processing'].includes(order.status) ? 'bg-amber-100 text-amber-800' :
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900">₹{order.total_amount?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                {(hub.orders || []).length === 0 && (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500 font-semibold">No orders assigned to this hub.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* DELIVERIES (PINCODES) */}
        {activeTab === 'Deliveries' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">PIN Code</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">City / Zone</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Est Delivery</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Features</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(hub.pincodes || [])
                  .filter(p => p.pincode.includes(search) || p.city.toLowerCase().includes(search.toLowerCase()))
                  .map((pin) => (
                  <tr key={pin.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600">{pin.pincode}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{pin.city} {pin.district ? `(${pin.district})` : ''}</td>
                    <td className="px-4 py-3 font-bold text-emerald-700">{pin.estimated_days}</td>
                    <td className="px-4 py-3 flex flex-col gap-1">
                      {pin.is_cod_available ? (
                        <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-bold border border-green-200">✓ COD Available</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">✕ No COD</span>
                      )}
                      {pin.is_express_available ? (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">✓ Express Available</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">✕ No Express</span>
                      )}
                    </td>
                  </tr>
                ))}
                {(hub.pincodes || []).length === 0 && (
                  <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-500 font-semibold">No service zones mapped to this hub.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* STAFF */}
        {activeTab === 'Staff' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Role</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(hub.users || []).map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{user.name}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">{user.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(hub.users || []).length === 0 && (
                  <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-500 font-semibold">No staff assigned to this hub.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ALERTS */}
        {activeTab === 'Alerts' && (
          <div className="p-6 space-y-3">
            {allAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 font-semibold">No pending alerts.</div>
            ) : (
              allAlerts.map((a, i) => (
                <div key={i} className={`p-4 rounded-xl border flex items-center gap-3 ${a.type === 'Critical' ? 'bg-rose-50 border-rose-200' : a.type === 'Error' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className={`w-2 h-2 rounded-full ${a.type === 'Critical' || a.type === 'Error' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                  <div>
                    <div className={`text-xs font-bold ${a.type === 'Critical' || a.type === 'Error' ? 'text-rose-800' : 'text-amber-800'}`}>{a.type}</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">{a.msg}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
