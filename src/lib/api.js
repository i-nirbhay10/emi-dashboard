const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1/admin';

async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      console.warn(`API HTTP error! status: ${res.status} for ${endpoint}`);
      return null;
    }
    const json = await res.json();
    return json.data || json;
  } catch (error) {
    console.error(`API Fetch Error (${endpoint}):`, error);
    return null;
  }
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
  return await apiRequest('/products');
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
  return await apiRequest('/categories');
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
export async function getOrders() {
  return await apiRequest('/orders');
}

export async function updateOrderStatus(id, status) {
  return await apiRequest(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function deleteOrder(id) {
  return await apiRequest(`/orders/${id}`, {
    method: 'DELETE',
  });
}

// Customers API
export async function getCustomers() {
  return await apiRequest('/customers');
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
  return await apiRequest('/offers');
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
  return await apiRequest('/banners');
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

// Content CMS API
export async function getContentPages() {
  return await apiRequest('/content');
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

// Users & Team API
export async function getUsers() {
  return await apiRequest('/users');
}

export async function createUser(data) {
  return await apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(id, data) {
  return await apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id) {
  return await apiRequest(`/users/${id}`, {
    method: 'DELETE',
  });
}
