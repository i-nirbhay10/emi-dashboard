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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>
            <button className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors">View All Orders</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {[
                  { id: "ORD-9284", customer: "Amit Patel", status: "Processing", amount: "₹45,000", badge: "bg-blue-50 text-blue-700 border-blue-200" },
                  { id: "ORD-9283", customer: "Sneha Gupta", status: "Shipped", amount: "₹1,20,500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
                  { id: "ORD-9282", customer: "Rahul Sharma", status: "Delivered", amount: "₹8,500", badge: "bg-green-50 text-green-700 border-green-200" },
                  { id: "ORD-9281", customer: "Vikram Singh", status: "Delivered", amount: "₹34,200", badge: "bg-green-50 text-green-700 border-green-200" },
                ].map((order, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-slate-600">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${order.badge}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 text-right">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Low Stock Alerts
            </h2>
          </div>
          <div className="p-6 space-y-5 flex-1">
            {[
              { name: "Exide Tubular Battery 150Ah", sku: "ETB-150", left: 0, status: "Out of Stock" },
              { name: "Microtek Hybrid Inverter", sku: "MHI-200", left: 2, status: "Critical" },
              { name: "Solar Cable 4sqmm (100m)", sku: "CBL-004", left: 5, status: "Low" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-start pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-tight">{item.name}</p>
                  <p className="text-xs text-slate-500 font-mono mt-1">{item.sku}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${item.left === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {item.left} left
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Manage Inventory &rarr;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
