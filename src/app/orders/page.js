export default function OrdersPage() {
  const orders = [
    { id: '#ORD-001', customer: 'Rahul Sharma', amount: '₹14,500', status: 'Processing', date: 'Oct 24, 2023', items: 2 },
    { id: '#ORD-002', customer: 'Sneha Gupta', amount: '₹9,500', status: 'Shipped', date: 'Oct 23, 2023', items: 1 },
    { id: '#ORD-003', customer: 'Amit Patel', amount: '₹12,000', status: 'Delivered', date: 'Oct 21, 2023', items: 3 },
    { id: '#ORD-004', customer: 'Neha Singh', amount: '₹22,000', status: 'Processing', date: 'Oct 25, 2023', items: 4 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage customer orders and shipments.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            Filter
          </button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-all">Export</button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search orders..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
          </div>
          <div className="flex gap-2">
            {['All', 'Processing', 'Shipped', 'Delivered'].map((tab, i) => (
              <button key={i} className={`px-3 py-1.5 text-sm font-medium rounded-md ${i === 0 ? 'bg-white shadow-sm border border-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-blue-600 group-hover:text-blue-800">{order.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{order.customer}</div>
                    <div className="text-xs text-slate-500">{order.items} items</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' : 
                      order.status === 'Shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">{order.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-blue-600 hover:text-blue-800" title="Generate Invoice">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800" title="Issue Refund">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">4</span> of <span className="font-medium text-slate-900">24</span> results</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-md text-sm text-slate-600 bg-white hover:bg-slate-50 transition-colors">Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded-md text-sm text-slate-600 bg-white hover:bg-slate-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
