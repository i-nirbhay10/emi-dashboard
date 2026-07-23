const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1/admin';

async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    const result = await res.json();
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error || result.message || 'API Request failed');
  } catch (err) {
    console.warn(`[API Call Failed: ${endpoint}]`, err.message);
    return null;
  }
}

// Overview & Analytics API
export async function getAnalyticsOverview() {
  return await apiRequest('/analytics');
}

// Products API
export async function getProducts() {
  return await apiRequest('/products');
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
export async function getOrders(status = 'All') {
  const query = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
  return await apiRequest(`/orders${query}`);
}

export async function updateOrderStatus(id, status) {
  return await apiRequest(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
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

// Users API
export async function getUsers() {
  return await apiRequest('/users');
}

export async function createUser(data) {
  return await apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
