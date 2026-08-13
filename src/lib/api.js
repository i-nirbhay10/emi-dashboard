const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1/admin';

export async function apiRequest(endpoint, options = {}) {
  try {
    let authUser = null;
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('emi_admin_user') : null;
      if (stored) authUser = JSON.parse(stored);
    } catch(e){}

    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': authUser?.role || 'Super Admin',
        'x-user-email': authUser?.email || 'admin@energymall.in',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      console.warn(`API HTTP error! status: ${res.status} for ${endpoint}`);
      return null;
    }
    const json = await res.json().catch(() => null);
    if (!json) return null;
    return json.data !== undefined ? json.data : json;
  } catch (error) {
    console.error(`API Fetch Error (${endpoint}):`, error);
    return null;
  }
}

// Media Upload API (Supabase Storage)
export async function uploadMediaFile(file, bucket = 'products') {
  try {
    let authUser = null;
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('emi_admin_user') : null;
      if (stored) authUser = JSON.parse(stored);
    } catch(e){}

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'x-user-role': authUser?.role || 'Super Admin',
        'x-user-email': authUser?.email || 'admin@energymall.in',
      },
      body: formData,
    });

    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    return json?.data?.url || null;
  } catch (error) {
    console.error('Media upload error:', error);
    return null;
  }
}

// Dynamic Logistics Hubs & PIN Codes API
export async function getLogisticsHubs() {
  const data = await apiRequest('/logistics/hubs');
  return Array.isArray(data) ? data : [];
}

export async function getLogisticsHubDetails(id) {
  return await apiRequest(`/logistics/hubs/${id}/details`);
}

export async function createLogisticsHub(data) {
  return await apiRequest('/logistics/hubs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLogisticsHub(id, data) {
  return await apiRequest(`/logistics/hubs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteLogisticsHub(id) {
  return await apiRequest(`/logistics/hubs/${id}`, {
    method: 'DELETE',
  });
}

export async function getServiceablePincodes() {
  const data = await apiRequest('/logistics/pincodes');
  return Array.isArray(data) ? data : [];
}

export async function saveServiceablePincode(data) {
  return await apiRequest('/logistics/pincodes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteServiceablePincode(id) {
  return await apiRequest(`/logistics/pincodes/${id}`, {
    method: 'DELETE',
  });
}

// Overview KPI Analytics
export async function getDashboardStats() {
  const data = await apiRequest('/analytics');
  if (data) return data;
  return await apiRequest('/analytics/overview');
}

export async function getAnalyticsOverview() {
  const data = await apiRequest('/analytics');
  if (data) return data;
  return await apiRequest('/analytics/overview');
}

// Products API
export async function getProducts() {
  const data = await apiRequest('/products');
  return Array.isArray(data) ? data : [];
}

export async function getProductById(id) {
  return await apiRequest(`/products/${id}`);
}

export async function createProduct(data) {
  return await apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id, data) {
  return await apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id) {
  return await apiRequest(`/products/${id}`, {
    method: 'DELETE',
  });
}

// Categories API
export async function getCategories() {
  const data = await apiRequest('/categories');
  return Array.isArray(data) ? data : [];
}

export async function createCategory(data) {
  return await apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id, data) {
  return await apiRequest(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id) {
  return await apiRequest(`/categories/${id}`, {
    method: 'DELETE',
  });
}

// Orders API
export async function getOrders(status) {
  const query = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
  const data = await apiRequest(`/orders${query}`);
  return Array.isArray(data) ? data : [];
}

export async function updateOrderStatus(id, status, payment_status) {
  const body = typeof status === 'object' ? status : { status, payment_status };
  return await apiRequest(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteOrder(id) {
  return await apiRequest(`/orders/${id}`, {
    method: 'DELETE',
  });
}

export function getOrderInvoiceUrl(id) {
  return `${API_BASE}/orders/${id}/invoice`;
}

// Customers API
export async function getCustomers() {
  const data = await apiRequest('/customers');
  return Array.isArray(data) ? data : [];
}

export async function createCustomer(data) {
  return await apiRequest('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCustomer(id, data) {
  return await apiRequest(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCustomer(id) {
  return await apiRequest(`/customers/${id}`, {
    method: 'DELETE',
  });
}

// Offers API
export async function getOffers() {
  const data = await apiRequest('/offers');
  return Array.isArray(data) ? data : [];
}

export async function createOffer(data) {
  return await apiRequest('/offers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOffer(id, data) {
  return await apiRequest(`/offers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteOffer(id) {
  return await apiRequest(`/offers/${id}`, {
    method: 'DELETE',
  });
}

// Banners API
export async function getBanners() {
  const data = await apiRequest('/banners');
  return Array.isArray(data) ? data : [];
}

export async function createBanner(data) {
  return await apiRequest('/banners', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBanner(id, data) {
  return await apiRequest(`/banners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteBanner(id) {
  return await apiRequest(`/banners/${id}`, {
    method: 'DELETE',
  });
}

// Content Pages API
export async function getContentPages() {
  const data = await apiRequest('/content');
  return Array.isArray(data) ? data : [];
}

export async function createContentPage(data) {
  return await apiRequest('/content', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateContentPage(id, data) {
  return await apiRequest(`/content/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteContentPage(id) {
  return await apiRequest(`/content/${id}`, {
    method: 'DELETE',
  });
}

// Dynamic Roles API
export async function getRoles() {
  const data = await apiRequest('/roles');
  return Array.isArray(data) ? data : [];
}

export async function createRole(roleData) {
  return await apiRequest('/roles', {
    method: 'POST',
    body: JSON.stringify(roleData)
  });
}

export async function updateRole(roleId, roleData) {
  return await apiRequest(`/roles/${roleId}`, {
    method: 'PUT',
    body: JSON.stringify(roleData)
  });
}

export async function deleteRole(roleId) {
  return await apiRequest(`/roles/${roleId}`, {
    method: 'DELETE'
  });
}

// Users Management API
export async function getUsers() {
  const data = await apiRequest('/users');
  return Array.isArray(data) ? data : [];
}

export async function createUser(userData) {
  return await apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}

export async function updateUser(userId, userData) {
  return await apiRequest(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
}

export async function deleteUser(userId) {
  return await apiRequest(`/users/${userId}`, {
    method: 'DELETE'
  });
}

export async function changeUserPassword(payload) {
  return await apiRequest('/users/change-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// Payments API
export async function getPayments(status) {
  const query = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
  const data = await apiRequest(`/payments${query}`);
  return Array.isArray(data) ? data : [];
}

// Inventory Management API
export async function getInventoryHistory(product_id) {
  const query = product_id ? `?product_id=${encodeURIComponent(product_id)}` : '';
  const data = await apiRequest(`/inventory/history${query}`);
  return Array.isArray(data) ? data : [];
}

export async function adjustInventory(payload) {
  return await apiRequest('/inventory/adjust', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function transferInventory(payload) {
  return await apiRequest('/inventory/transfer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getLowStockItems() {
  const data = await apiRequest('/inventory/low-stock');
  return Array.isArray(data) ? data : [];
}

// Admin Notifications API
export async function getAdminNotifications() {
  const data = await apiRequest('/notifications');
  return Array.isArray(data) ? data : [];
}

// App Version Management
export async function getAppVersions() {
  const data = await apiRequest('/app-versions');
  return Array.isArray(data) ? data : [];
}

export async function updateAppVersion(platform, data) {
  return await apiRequest(`/app-versions/${platform}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
