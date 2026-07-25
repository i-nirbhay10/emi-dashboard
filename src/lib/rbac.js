/**
 * Dynamic Role-Based Access Control (RBAC) & Permission Engine for Frontend
 */

export const MODULES = [
  'dashboard',
  'analytics',
  'orders',
  'products',
  'categories',
  'inventory',
  'customers',
  'offers',
  'banners',
  'content',
  'users',
  'security',
  'settings'
];

export const ACTIONS = [
  'view',
  'create',
  'edit',
  'delete',
  'approve',
  'export',
  'import',
  'manage'
];

export const ROLE_DEFAULT_PERMISSIONS = {
  'Super Admin': {
    '*': ['view', 'create', 'edit', 'delete', 'approve', 'export', 'import', 'manage']
  },
  'Admin': {
    'dashboard': ['view', 'create', 'edit', 'delete', 'approve', 'export', 'import', 'manage'],
    'analytics': ['view', 'create', 'edit', 'delete', 'approve', 'export', 'import', 'manage'],
    'orders': ['view', 'create', 'edit', 'delete', 'approve', 'export', 'import', 'manage'],
    'products': ['view', 'create', 'edit', 'delete', 'approve', 'export', 'import', 'manage'],
    'categories': ['view', 'create', 'edit', 'delete', 'approve', 'export', 'import', 'manage'],
    'inventory': ['view', 'create', 'edit', 'delete', 'approve', 'export', 'import', 'manage'],
    'customers': ['view', 'create', 'edit', 'delete', 'approve', 'export', 'import', 'manage'],
    'offers': ['view', 'create', 'edit', 'delete', 'approve', 'export', 'import', 'manage'],
    'banners': ['view', 'create', 'edit', 'delete', 'approve', 'export', 'import', 'manage'],
    'content': ['view', 'create', 'edit', 'delete', 'approve', 'export', 'import', 'manage'],
    'users': ['view', 'create', 'edit', 'export']
  },
  'Store Manager': {
    'dashboard': ['view'],
    'orders': ['view', 'create', 'edit', 'approve', 'export'],
    'products': ['view', 'create', 'edit', 'export', 'import'],
    'categories': ['view', 'create', 'edit'],
    'inventory': ['view', 'edit', 'manage', 'import'],
    'customers': ['view']
  },
  'Support Agent': {
    'dashboard': ['view'],
    'orders': ['view', 'edit'],
    'customers': ['view', 'edit']
  },
  'Marketing Specialist': {
    'dashboard': ['view', 'export'],
    'analytics': ['view', 'export'],
    'customers': ['view'],
    'offers': ['view', 'create', 'edit', 'delete'],
    'banners': ['view', 'create', 'edit', 'delete'],
    'content': ['view', 'create', 'edit']
  }
};

export function getDefaultPermissionsForRole(role = 'Admin') {
  return ROLE_DEFAULT_PERMISSIONS[role] || ROLE_DEFAULT_PERMISSIONS['Admin'];
}

export function hasPermission(user, moduleName, actionName = 'view') {
  if (!user) return false;
  if ((user.status || 'Active') !== 'Active') return false;

  const role = user.role || 'Admin';
  if (role === 'Super Admin') return true;

  const userPerms = user.permissions || getDefaultPermissionsForRole(role);

  // Wildcard check
  if (userPerms['*'] && Array.isArray(userPerms['*']) && userPerms['*'].includes(actionName)) {
    return true;
  }

  const modulePerms = userPerms[moduleName];
  if (!modulePerms || !Array.isArray(modulePerms)) return false;

  return modulePerms.includes(actionName) || modulePerms.includes('manage');
}
