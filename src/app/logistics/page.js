"use client";
import React, { useEffect, useState } from 'react';
import { 
  getLogisticsHubs, 
  createLogisticsHub, 
  updateLogisticsHub, 
  deleteLogisticsHub, 
  getServiceablePincodes, 
  saveServiceablePincode,
  deleteServiceablePincode 
} from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../lib/rbac';

export default function LogisticsPage() {
  const { user: currentUser } = useAuth();
  const currentRole = currentUser?.role || 'Super Admin';
  const isSuperAdmin = currentRole === 'Super Admin' || currentUser?.email === 'admin@energymall.in';

  const canView = isSuperAdmin || hasPermission(currentUser, 'logistics', 'view');
  const canCreate = isSuperAdmin || hasPermission(currentUser, 'logistics', 'create');
  const canEdit = isSuperAdmin || hasPermission(currentUser, 'logistics', 'edit');
  const canDelete = isSuperAdmin || hasPermission(currentUser, 'logistics', 'delete');

  const [hubs, setHubs] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [activeTab, setActiveTab] = useState('hubs'); // 'hubs' | 'pincodes'
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Modal States
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState(null);
  const [hubForm, setHubForm] = useState({
    name: '',
    city: '',
    state: '',
    address: '',
    contactPhone: '',
    status: 'Active',
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [fetchingPostal, setFetchingPostal] = useState(false);
  const [postalVerifiedInfo, setPostalVerifiedInfo] = useState(null);
  const [pinForm, setPinForm] = useState({
    pincode: '',
    city: '',
    district: '',
    state: '',
    hubId: '',
    days: '1-2 Days',
    cod: true,
    express: true,
  });

  const loadData = async () => {
    setLoading(true);
    const [hubsData, pinsData] = await Promise.all([
      getLogisticsHubs(),
      getServiceablePincodes(),
    ]);
    setHubs(hubsData || []);
    setPincodes(pinsData || []);
    setLoading(false);
  };

  useEffect(() => {
    if (canView) {
      loadData();
    }
  }, [canView]);

  // Real-time Indian Postal API Auto-Population in Modal
  useEffect(() => {
    let isMounted = true;
    const cleanPin = (pinForm.pincode || '').replace(/\D/g, '');

    async function autoFetchPostalDetails() {
      if (cleanPin.length === 6) {
        setFetchingPostal(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
          const json = await res.json();
          if (isMounted && Array.isArray(json) && json[0]?.Status === 'Success' && json[0]?.PostOffice?.length > 0) {
            const po = json[0].PostOffice[0];
            const cityVal = po.District || po.Block || po.Division || po.Name || '';
            const districtVal = po.District || po.Division || po.Name || '';
            const stateVal = po.State || '';

            setPinForm(prev => ({
              ...prev,
              city: cityVal,
              district: districtVal,
              state: stateVal,
            }));
            setPostalVerifiedInfo({
              city: cityVal,
              district: districtVal,
              state: stateVal,
              office: po.Name,
            });
          } else if (isMounted) {
            setPostalVerifiedInfo(null);
          }
        } catch (err) {
          console.warn('Postal API error:', err);
        } finally {
          if (isMounted) setFetchingPostal(false);
        }
      } else {
        if (isMounted) {
          setFetchingPostal(false);
          setPostalVerifiedInfo(null);
        }
      }
    }

    autoFetchPostalDetails();

    return () => { isMounted = false; };
  }, [pinForm.pincode]);

  const handleOpenAddHub = () => {
    if (!canCreate) return;
    setEditingHub(null);
    setHubForm({
      name: '',
      city: '',
      state: '',
      address: '',
      contactPhone: '',
      status: 'Active',
    });
    setIsHubModalOpen(true);
  };

  const handleOpenEditHub = (hub) => {
    if (!canEdit) return;
    setEditingHub(hub);
    setHubForm({
      name: hub.name,
      city: hub.city,
      state: hub.state,
      address: hub.address || '',
      contactPhone: hub.contactPhone || '',
      status: hub.status || 'Active',
    });
    setIsHubModalOpen(true);
  };

  const handleSaveHub = async (e) => {
    e.preventDefault();
    if (!hubForm.name || !hubForm.city || !hubForm.state) {
      alert('Please fill in Hub Name, City, and State.');
      return;
    }

    if (editingHub) {
      if (!canEdit) return;
      const res = await updateLogisticsHub(editingHub.id, hubForm);
      if (res) {
        setToast('Logistics Hub updated successfully!');
        loadData();
      }
    } else {
      if (!canCreate) return;
      const res = await createLogisticsHub(hubForm);
      if (res) {
        setToast('New Delivery Hub created successfully!');
        loadData();
      }
    }
    setIsHubModalOpen(false);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteHub = async (id) => {
    if (!canDelete) return;
    if (!confirm('Are you sure you want to remove this delivery hub?')) return;
    await deleteLogisticsHub(id);
    setToast('Delivery hub removed.');
    loadData();
    setTimeout(() => setToast(null), 3000);
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!canCreate && !canEdit) return;
    if (!pinForm.pincode || pinForm.pincode.length !== 6) {
      alert('Please enter a valid 6-digit PIN code.');
      return;
    }

    if (!pinForm.hubId) {
      alert('Please select an assigned delivery hub.');
      return;
    }

    const res = await saveServiceablePincode(pinForm);
    if (res) {
      setToast(`Serviceable PIN ${pinForm.pincode} mapped dynamically!`);
      loadData();
      setIsPinModalOpen(false);
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeletePin = async (id, pincode) => {
    if (!canDelete) return;
    if (!confirm(`Are you sure you want to remove PIN ${pincode} from serviceable network?`)) return;
    await deleteServiceablePincode(id);
    setToast(`Serviceable PIN ${pincode} removed.`);
    loadData();
    setTimeout(() => setToast(null), 3000);
  };

  // RBAC Access Guard Check
  if (!canView) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 my-12">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center text-2xl font-bold">
          🛡️
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          The Logistics & Hubs Module requires <strong className="text-slate-800">Logistics Permission</strong> or <strong className="text-slate-800">Super Admin</strong> privileges.
        </p>
        <div className="inline-block px-4 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold font-mono">
          Your Current Role: {currentRole}
        </div>
      </div>
    );
  }

  const filteredHubs = hubs.filter(h => 
    h.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.city?.toLowerCase().includes(search.toLowerCase()) ||
    h.state?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPins = pincodes.filter(p => 
    p.pincode?.includes(search) ||
    p.city?.toLowerCase().includes(search.toLowerCase()) ||
    p.state?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Logistics & Delivery Hubs
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Live Network Sync
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage regional solar equipment fulfillment depots, assigned delivery hubs, and PIN code serviceability.</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'hubs' ? (
            canCreate && (
              <button 
                onClick={handleOpenAddHub}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-extrabold hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>+ Add Delivery Hub</span>
              </button>
            )
          ) : (
            canCreate && (
              <button 
                onClick={() => {
                  setPinForm({ pincode: '', city: '', district: '', state: '', hubId: hubs[0]?.id || '', days: '1-2 Days', cod: true, express: true });
                  setPostalVerifiedInfo(null);
                  setIsPinModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>+ Add Serviceable PIN Code</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {toast}
          </div>
          <button onClick={() => setToast(null)} className="text-emerald-600 font-bold hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Navigation Tabs & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('hubs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'hubs' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Fulfillment Hubs ({hubs.length})
          </button>
          <button 
            onClick={() => setActiveTab('pincodes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'pincodes' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Serviceable PIN Codes ({pincodes.length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder={`Search ${activeTab === 'hubs' ? 'hub name, city or state...' : 'PIN code, city, state...'}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" 
          />
        </div>
      </div>

      {/* HUBS GRID */}
      {activeTab === 'hubs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHubs.map(hub => (
            <div key={hub.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase font-mono">
                      {hub.hub_code || hub.id}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-1">{hub.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{hub.city}, {hub.state}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                    hub.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {hub.status || 'Active'}
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                  <div><span className="font-semibold text-slate-400">Depot Address:</span> {hub.address || 'Solar Logistics Park'}</div>
                  <div><span className="font-semibold text-slate-400">Helpline:</span> {hub.contactPhone || 'N/A'}</div>
                  {Array.isArray(hub.supportedZones) && (
                    <div><span className="font-semibold text-slate-400">Service Coverage:</span> {hub.supportedZones.join(', ')}</div>
                  )}
                </div>
              </div>

              {(canEdit || canDelete) && (
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
                  {canEdit && (
                    <button 
                      onClick={() => handleOpenEditHub(hub)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold transition-all"
                    >
                      Edit Depot
                    </button>
                  )}
                  {canDelete && (
                    <button 
                      onClick={() => handleDeleteHub(hub.id)}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold transition-all border border-rose-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SERVICEABLE PINCODES TABLE */}
      {activeTab === 'pincodes' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">PIN Code</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">City / District</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">State</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Assigned Hub</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Est Delivery</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase">Payment Options</th>
                  {canDelete && <th className="px-4 py-3 text-right font-bold text-slate-600 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredPins.map((pin, idx) => {
                  const hub = hubs.find(h => h.id === pin.hubId || h.hub_code === pin.hubId);
                  return (
                    <tr key={pin.id || idx} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono font-bold text-blue-600 text-sm">{pin.pincode}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{pin.city} {pin.district ? `(${pin.district})` : ''}</td>
                      <td className="px-4 py-3 text-slate-600 font-semibold">{pin.state}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200 text-[11px]">
                          {hub?.name || pin.hubName || 'Assigned Hub'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-emerald-700 font-extrabold">{pin.days || '1-2 Days'}</td>
                      <td className="px-4 py-3 flex gap-1">
                        {pin.cod && <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-bold border border-green-200">COD Available</span>}
                        {pin.express && <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">Express Shipping</span>}
                      </td>
                      {canDelete && (
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeletePin(pin.id, pin.pincode)}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[11px] font-bold transition-all border border-rose-200"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT LOGISTICS HUB MODAL */}
      {isHubModalOpen && (canCreate || canEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-base font-extrabold text-slate-900">{editingHub ? 'Edit Logistics Hub' : 'Add New Logistics Hub'}</h2>
              <button onClick={() => setIsHubModalOpen(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveHub} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Hub / Depot Name *</label>
                <input 
                  type="text" 
                  value={hubForm.name} 
                  onChange={(e) => setHubForm({ ...hubForm, name: e.target.value })}
                  placeholder="e.g. Regional Solar Fulfillment Depot"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City *</label>
                  <input 
                    type="text" 
                    value={hubForm.city} 
                    onChange={(e) => setHubForm({ ...hubForm, city: e.target.value })}
                    placeholder="e.g. Patna"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State *</label>
                  <input 
                    type="text" 
                    value={hubForm.state} 
                    onChange={(e) => setHubForm({ ...hubForm, state: e.target.value })}
                    placeholder="e.g. Bihar"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address Location</label>
                <input 
                  type="text" 
                  value={hubForm.address} 
                  onChange={(e) => setHubForm({ ...hubForm, address: e.target.value })}
                  placeholder="e.g. Industrial Logistics Corridor"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsHubModalOpen(false)} className="px-4 py-2 border rounded-lg text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-extrabold rounded-lg hover:bg-emerald-700">Save Hub</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SERVICEABLE PINCODE MODAL WITH INDIAN POSTAL API AUTO-FETCH */}
      {isPinModalOpen && (canCreate || canEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Map Serviceable PIN Code</h2>
                <p className="text-[11px] text-slate-500">Auto-fetches official location from api.postalpincode.in</p>
              </div>
              <button onClick={() => setIsPinModalOpen(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSavePin} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">6-Digit PIN Code *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    maxLength={6}
                    value={pinForm.pincode} 
                    onChange={(e) => setPinForm({ ...pinForm, pincode: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 273015"
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  {fetchingPostal && (
                    <span className="absolute right-3 top-2.5 text-[10px] text-emerald-600 font-bold animate-pulse">
                      Fetching India Post...
                    </span>
                  )}
                </div>

                {/* Verified Postal Information Badge */}
                {postalVerifiedInfo && (
                  <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>✓ Verified India Post: <strong>{postalVerifiedInfo.city}</strong>, {postalVerifiedInfo.state} ({postalVerifiedInfo.office})</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City / District *</label>
                  <input 
                    type="text" 
                    value={pinForm.city} 
                    onChange={(e) => setPinForm({ ...pinForm, city: e.target.value })}
                    placeholder="Auto-fetched"
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State *</label>
                  <input 
                    type="text" 
                    value={pinForm.state} 
                    onChange={(e) => setPinForm({ ...pinForm, state: e.target.value })}
                    placeholder="Auto-fetched"
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Logistics Hub *</label>
                <select 
                  value={pinForm.hubId} 
                  onChange={(e) => setPinForm({ ...pinForm, hubId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-bold bg-white"
                  required
                >
                  <option value="">Select Delivery Hub</option>
                  {hubs.map(h => (
                    <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsPinModalOpen(false)} className="px-4 py-2 border rounded-lg text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-extrabold rounded-lg hover:bg-emerald-700">Save PIN Mapping</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
