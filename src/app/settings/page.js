import React from 'react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your store preferences and configurations.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Store Details</h2>
          <p className="text-sm text-slate-500 mt-1">Information about your business.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Store Name</label>
              <input type="text" defaultValue="EnergyMallIndia" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Contact Email</label>
              <input type="email" defaultValue="support@energymall.in" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <input type="tel" defaultValue="+91 98765 43210" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Currency</label>
              <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all">
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Danger Zone</h2>
          <p className="text-sm text-slate-500 mt-1">Irreversible and destructive actions.</p>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-900">Pause Storefront</h3>
            <p className="text-xs text-slate-500 mt-1">Temporarily disable checkout while you update inventory.</p>
          </div>
          <button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-all">
            Pause Store
          </button>
        </div>
      </div>
    </div>
  );
}
