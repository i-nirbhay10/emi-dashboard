import React from 'react';

export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security & Audits</h1>
        <p className="text-sm text-slate-500 mt-1">Manage authentication, API keys, and view audit logs.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Authentication Settings</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Two-Factor Authentication (2FA)</h3>
              <p className="text-sm text-slate-500 mt-1">Require a secondary code for all admin logins.</p>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all">
              Enable 2FA
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Active Sessions</h3>
              <p className="text-sm text-slate-500 mt-1">You are currently logged in on 1 device.</p>
            </div>
            <button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-all">
              Sign out all other sessions
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Recent Audit Logs</h2>
          <button className="text-sm font-medium text-green-600 hover:text-green-700">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <tbody className="bg-white divide-y divide-slate-100">
              {[
                { action: 'Updated product pricing', user: 'Admin User', ip: '192.168.1.1', time: '10 mins ago' },
                { action: 'Logged in successfully', user: 'Ravi Tech', ip: '10.0.0.45', time: '2 hours ago' },
                { action: 'Exported Orders CSV', user: 'Admin User', ip: '192.168.1.1', time: '1 day ago' },
              ].map((log, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{log.user}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">{log.ip}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
