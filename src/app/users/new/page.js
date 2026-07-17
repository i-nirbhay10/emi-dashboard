import React from 'react';
import Link from 'next/link';

export default function InviteUserPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/users" className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invite New User</h1>
          <p className="text-sm text-slate-500 mt-1">Send an invitation to join the EnergyMallIndia admin dashboard.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">User Details</h2>
          <p className="text-sm text-slate-500 mt-1">Basic information for the new team member.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">First Name</label>
              <input type="text" placeholder="e.g. Ramesh" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Last Name</label>
              <input type="text" placeholder="e.g. Kumar" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Address <span className="text-red-500">*</span></label>
            <input type="email" placeholder="ramesh@energymall.in" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all" />
            <p className="text-xs text-slate-500">We will send the invitation link to this email.</p>
          </div>
        </div>
      </div>

      {/* Role Assignment */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Role & Access Level</h2>
          <p className="text-sm text-slate-500 mt-1">Select a predefined role or create custom permissions.</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {[
              { id: 'super-admin', title: 'Super Admin', desc: 'Full access to all dashboard features, including billing, roles, and dangerous settings.', icon: 'shield-check', color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-600 ring-1 ring-purple-600' },
              { id: 'inventory-manager', title: 'Inventory Manager', desc: 'Can manage products, categories, stock levels, and view supplier data.', icon: 'cube', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-slate-200 hover:border-blue-300' },
              { id: 'support-agent', title: 'Customer Support', desc: 'Access to customer profiles, orders, and refund processing. Cannot modify catalog.', icon: 'user-group', color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-slate-200 hover:border-emerald-300' },
              { id: 'marketing', title: 'Marketing Specialist', desc: 'Manage banners, promotional codes, and view sales analytics.', icon: 'speakerphone', color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-slate-200 hover:border-amber-300' },
            ].map((role, i) => (
              <label key={i} className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none ${role.border} transition-all`}>
                <input type="radio" name="role" value={role.id} className="sr-only" defaultChecked={i === 0} />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg ${role.bg}`}>
                        <svg className={`w-4 h-4 ${role.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {role.icon === 'shield-check' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>}
                          {role.icon === 'cube' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>}
                          {role.icon === 'user-group' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>}
                          {role.icon === 'speakerphone' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>}
                        </svg>
                      </span>
                      <span className="block text-sm font-bold text-slate-900">{role.title}</span>
                    </span>
                    <span className="mt-2 text-sm text-slate-500 pl-9">{role.desc}</span>
                  </span>
                </span>
                {i === 0 && (
                  <svg className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                )}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions Preview */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 border-dashed">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Effective Permissions for Super Admin:</h3>
        <div className="flex flex-wrap gap-2">
          {['Manage Orders', 'Manage Products', 'Manage Inventory', 'Manage Users', 'Manage Settings', 'Delete Records', 'Issue Refunds'].map((perm, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
              {perm}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Link href="/users" className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-all">
          Cancel
        </Link>
        <button className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          Send Invitation
        </button>
      </div>
    </div>
  );
}
