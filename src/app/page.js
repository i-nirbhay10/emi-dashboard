export default function Home() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-all">Export Report</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Add Product
          </button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Total Revenue", value: "₹24,56,800", change: "+14.5%", up: true },
          { title: "Active Orders", value: "142", change: "+5.2%", up: true },
          { title: "Customers", value: "3,892", change: "+2.1%", up: true },
          { title: "Low Stock Items", value: "8", change: "-12.5%", up: false },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-slate-500 text-sm font-medium">{kpi.title}</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{kpi.value}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${kpi.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Chart Area placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-900">Revenue Overview</h2>
            <select className="text-sm border-slate-200 rounded-lg text-slate-600 bg-slate-50">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 w-full flex items-end gap-2 pt-4">
            {/* Mock bars */}
            {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-green-100 rounded-t-sm hover:bg-green-200 transition-colors relative group">
                <div className="absolute bottom-0 w-full bg-green-500 rounded-t-sm transition-all" style={{ height: `${h}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {[
              { title: "New order placed", desc: "Order #4092 from Amit Patel", time: "10 mins ago", color: "bg-blue-500" },
              { title: "Product out of stock", desc: "Exide 150Ah Battery", time: "2 hours ago", color: "bg-red-500" },
              { title: "Payment received", desc: "₹45,000 via Razorpay", time: "5 hours ago", color: "bg-green-500" },
              { title: "New customer registered", desc: "Sneha Gupta joined", time: "1 day ago", color: "bg-amber-500" },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 relative">
                {i !== 3 && <div className="absolute left-2 top-6 w-px h-8 bg-slate-100"></div>}
                <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${activity.color} ring-4 ring-slate-50`}></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{activity.desc}</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
