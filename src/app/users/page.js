"use client";
import React, { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser, getRoles, createRole, updateRole, deleteRole } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { MODULES, ACTIONS, getDefaultPermissionsForRole, hasPermission } from '../../lib/rbac';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const currentRole = currentUser?.role || 'Super Admin';
  const isSuperAdmin = currentRole === 'Super Admin' || currentUser?.email === 'admin@energymall.in';
  const isAdmin = isSuperAdmin || currentRole === 'Admin' || hasPermission(currentUser, 'users', 'create');
  const canAccessUsersModule = isSuperAdmin || isAdmin || hasPermission(currentUser, 'users', 'view');

  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'roles'
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // User Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [isUserPermModalOpen, setIsUserPermModalOpen] = useState(false);

  // Role Modals
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isDeleteRoleModalOpen, setIsDeleteRoleModalOpen] = useState(false);

  // Helper: Get permissions for a role, automatically populating default matrix if custom overrides are empty
  const getPermissionsForUserRole = (roleName, customPermissions = null) => {
    if (customPermissions && typeof customPermissions === 'object' && Object.keys(customPermissions).length > 0) {
      const hasActiveActions = Object.values(customPermissions).some(val => Array.isArray(val) && val.length > 0);
      if (hasActiveActions) {
        return customPermissions;
      }
    }

    // Load default matrix for assigned role from DB roles list or fallback role mapping
    const matchedRole = roles.find(r => r.name === roleName);
    if (matchedRole?.permissions && typeof matchedRole.permissions === 'object' && Object.keys(matchedRole.permissions).length > 0) {
      return matchedRole.permissions;
    }

    return getDefaultPermissionsForRole(roleName);
  };

  // User Form State
  const [formUser, setFormUser] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    role: 'Admin', // Default role is Admin
    status: 'Active',
    permissions: getDefaultPermissionsForRole('Admin')
  });

  // Role Form State
  const [formRole, setFormRole] = useState({
    id: '',
    name: '',
    description: '',
    permissions: getDefaultPermissionsForRole('Admin'),
    is_system: false
  });

  const loadData = async () => {
    setLoading(true);
    const [userData, roleData] = await Promise.all([getUsers(), getRoles()]);
    setUsers(userData || []);
    setRoles(roleData || []);
    setLoading(false);
  };

  useEffect(() => {
    if (canAccessUsersModule) {
      loadData();
    }
  }, [canAccessUsersModule]);

  // --- USER HANDLERS ---
  const handleUserRoleChange = (selectedRoleName) => {
    const assignedPerms = getPermissionsForUserRole(selectedRoleName);
    setFormUser(prev => ({
      ...prev,
      role: selectedRoleName,
      permissions: assignedPerms
    }));
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!formUser.name || !formUser.email) return;

    const assignedRole = formUser.role || 'Admin';
    const assignedPerms = formUser.permissions || getPermissionsForUserRole(assignedRole);

    await createUser({
      name: formUser.name,
      email: formUser.email,
      password: formUser.password ? formUser.password.trim() : null,
      role: assignedRole,
      status: formUser.status || 'Active',
      permissions: assignedPerms
    });

    setIsAddUserModalOpen(false);
    loadData();
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!formUser.id || !formUser.name) return;
    
    // Prepare update payload - Admin cannot modify permissions
    const updatePayload = {
      name: formUser.name,
      email: formUser.email,
      role: formUser.role,
      status: formUser.status
    };
    if (isSuperAdmin && formUser.permissions) {
      updatePayload.permissions = formUser.permissions;
    }

    await updateUser(formUser.id, updatePayload);
    setIsEditUserModalOpen(false);
    loadData();
  };

  const handleSaveUserPermissions = async () => {
    if (!formUser.id || !isSuperAdmin) return;
    await updateUser(formUser.id, { permissions: formUser.permissions });
    setIsUserPermModalOpen(false);
    loadData();
  };

  const handleResetUserPermsToRoleDefault = () => {
    const defaultPerms = getPermissionsForUserRole(formUser.role || 'Admin');
    setFormUser(prev => ({
      ...prev,
      permissions: defaultPerms
    }));
  };

  const handleDeleteUserSubmit = async () => {
    if (!formUser.id) return;
    await deleteUser(formUser.id);
    setIsDeleteUserModalOpen(false);
    loadData();
  };

  const handleToggleUserStatus = async (targetUser) => {
    const isTargetSuperAdmin = targetUser.role === 'Super Admin' || targetUser.email === 'admin@energymall.in';
    if (isTargetSuperAdmin && !isSuperAdmin) return;

    const nextStatus = targetUser.status === 'Active' ? 'Inactive' : 'Active';
    await updateUser(targetUser.id, { status: nextStatus });
    loadData();
  };

  // --- ROLE HANDLERS ---
  const handleCreateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!formRole.name || !isSuperAdmin) return;

    await createRole({
      name: formRole.name,
      description: formRole.description,
      permissions: formRole.permissions
    });

    setIsAddRoleModalOpen(false);
    loadData();
  };

  const handleEditRoleSubmit = async (e) => {
    e.preventDefault();
    if (!formRole.id || !formRole.name || !isSuperAdmin) return;

    await updateRole(formRole.id, {
      name: formRole.name,
      description: formRole.description,
      permissions: formRole.permissions
    });

    setIsEditRoleModalOpen(false);
    loadData();
  };

  const handleDeleteRoleSubmit = async () => {
    if (!formRole.id || !isSuperAdmin) return;
    await deleteRole(formRole.id);
    setIsDeleteRoleModalOpen(false);
    loadData();
  };

  const handleRolePermToggle = (moduleName, actionName) => {
    if (!isSuperAdmin) return;
    setFormRole(prev => {
      const currentPerms = { ...(prev.permissions || {}) };
      let moduleActions = Array.isArray(currentPerms[moduleName]) ? [...currentPerms[moduleName]] : [];

      if (moduleActions.includes(actionName)) {
        moduleActions = moduleActions.filter(a => a !== actionName);
      } else {
        moduleActions.push(actionName);
      }

      currentPerms[moduleName] = moduleActions;
      return { ...prev, permissions: currentPerms };
    });
  };

  const handleUserPermToggle = (moduleName, actionName) => {
    if (!isSuperAdmin) return;
    setFormUser(prev => {
      const currentPerms = { ...(prev.permissions || {}) };
      let moduleActions = Array.isArray(currentPerms[moduleName]) ? [...currentPerms[moduleName]] : [];

      if (moduleActions.includes(actionName)) {
        moduleActions = moduleActions.filter(a => a !== actionName);
      } else {
        moduleActions.push(actionName);
      }

      currentPerms[moduleName] = moduleActions;
      return { ...prev, permissions: currentPerms };
    });
  };

  // Dynamic Guard Check
  if (!canAccessUsersModule) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 my-12">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center text-2xl font-bold">
          🛡️
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          The Users Module requires <strong className="text-slate-800">Admin</strong> or <strong className="text-slate-800">Super Admin</strong> privileges.
        </p>
        <div className="inline-block px-4 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold font-mono">
          Your Current Role: {currentRole}
        </div>
      </div>
    );
  }

  // Filter selectable roles for Admin role creation (hides Super Admin option for non-superadmins)
  const selectableRoles = roles.filter(r => isSuperAdmin || r.name !== 'Super Admin');

  // Filtered lists
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
                          u.email?.toLowerCase().includes(search.toLowerCase()) ||
                          u.role?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (roleFilter === 'Active') return (u.status || 'Active') === 'Active';
    if (roleFilter !== 'All') return u.role === roleFilter;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Users & Dynamic RBAC Roles
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold border border-green-200">
              Database Driven
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Portal to configure team members, create custom dynamic roles, and set granular permission matrices.</p>
        </div>

        {/* Tab Switcher & Actions */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'members' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👥 Team Members ({users.length})
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('roles')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'roles' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🛡️ Dynamic Roles ({roles.length})
              </button>
            )}
          </div>

          {activeTab === 'members' && isAdmin && (
            <button 
              onClick={() => {
                const defaultRole = 'Admin';
                setFormUser({
                  id: '',
                  name: '',
                  email: '',
                  password: '',
                  role: defaultRole,
                  status: 'Active',
                  permissions: getPermissionsForUserRole(defaultRole)
                });
                setIsAddUserModalOpen(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all flex items-center gap-2 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Add User
            </button>
          )}

          {activeTab === 'roles' && isSuperAdmin && (
            <button 
              onClick={() => {
                setFormRole({
                  id: '',
                  name: '',
                  description: '',
                  permissions: getDefaultPermissionsForRole('Admin'),
                  is_system: false
                });
                setIsAddRoleModalOpen(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all flex items-center gap-2 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Create New Role
            </button>
          )}
        </div>
      </div>

      {/* --- TAB 1: TEAM MEMBERS --- */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Search & Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                type="text" 
                placeholder="Search team members by name or email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setRoleFilter('All')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  roleFilter === 'All' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Roles
              </button>
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRoleFilter(r.name)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    roleFilter === r.name ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r.name} {r.name === 'Admin' ? '(Default)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <svg className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Loading team members from PostgreSQL database...
              </div>
            ) : filteredUsers.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User Profile</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Password Policy</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredUsers.map(u => {
                    const isActive = (u.status || 'Active') === 'Active';
                    const roleName = u.role || 'Admin';
                    const isTargetSuperAdmin = roleName === 'Super Admin' || u.email === 'admin@energymall.in';
                    const canModifyThisUser = isAdmin && (isSuperAdmin || !isTargetSuperAdmin);

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-700">
                              {u.name ? u.name[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm">{u.name}</div>
                              <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-50 text-slate-800 border-slate-200">
                            {roleName} {roleName === 'Admin' ? '(Default)' : ''}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            disabled={!canModifyThisUser}
                            onClick={() => handleToggleUserStatus(u)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                              isActive 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            } ${!canModifyThisUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                          {u.must_change_password ? (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[11px]">
                              ⚠️ Change On 1st Login
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                              ✓ Verified Password
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                const effectivePerms = getPermissionsForUserRole(roleName, u.permissions);

                                setFormUser({
                                  id: u.id,
                                  name: u.name || '',
                                  email: u.email || '',
                                  role: roleName,
                                  status: u.status || 'Active',
                                  permissions: effectivePerms
                                });
                                setIsUserPermModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                              title="View User Specific Permission Matrix"
                            >
                              Matrix
                            </button>

                            {canModifyThisUser && (
                              <>
                                <button
                                  onClick={() => {
                                    setFormUser({
                                      id: u.id,
                                      name: u.name || '',
                                      email: u.email || '',
                                      password: '',
                                      role: roleName,
                                      status: u.status || 'Active',
                                      permissions: getPermissionsForUserRole(roleName, u.permissions)
                                    });
                                    setIsEditUserModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-all"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setFormUser({ id: u.id, name: u.name, email: u.email });
                                    setIsDeleteUserModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-all"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-500 text-sm">
                No users found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: DYNAMIC ROLES & PERMISSION MATRICES (Super Admin Only) --- */}
      {activeTab === 'roles' && isSuperAdmin && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(r => {
              const permCount = r.permissions ? Object.keys(r.permissions).reduce((acc, k) => acc + (Array.isArray(r.permissions[k]) ? r.permissions[k].length : 0), 0) : 0;
              return (
                <div key={r.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        {r.name}
                        {r.name === 'Admin' && (
                          <span className="text-[10px] bg-green-50 text-green-700 font-extrabold px-2 py-0.5 rounded border border-green-200 uppercase">
                            Default
                          </span>
                        )}
                      </h3>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase border ${
                        r.is_system ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {r.is_system ? 'System Role' : 'Custom Role'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{r.description || 'Custom dynamic role configured by Super Admin.'}</p>
                    <div className="pt-2 flex items-center gap-2 text-xs text-slate-600 font-mono">
                      <span className="font-bold text-slate-900">{permCount}</span> Granular Actions Allowed
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setFormRole({
                          id: r.id,
                          name: r.name,
                          description: r.description || '',
                          permissions: r.permissions || getDefaultPermissionsForRole(r.name),
                          is_system: r.is_system
                        });
                        setIsEditRoleModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 w-full justify-center"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      Configure Matrix
                    </button>

                    {!r.is_system && (
                      <button
                        onClick={() => {
                          setFormRole({ id: r.id, name: r.name });
                          setIsDeleteRoleModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-all"
                        title="Delete Custom Role"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE ROLE --- */}
      {isAddRoleModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <h2 className="text-lg font-bold text-slate-900">Create Dynamic Role & Permission Matrix</h2>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Role Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Regional Auditor"
                    value={formRole.name}
                    onChange={(e) => setFormRole({ ...formRole, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                  <input 
                    type="text"
                    placeholder="Brief description of responsibilities"
                    value={formRole.description}
                    onChange={(e) => setFormRole({ ...formRole, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 border-t border-slate-100 pt-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Granular Permission Matrix</label>
              <table className="min-w-full divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-700 uppercase">Module</th>
                    {ACTIONS.map(act => (
                      <th key={act} className="px-3 py-2.5 text-center font-bold text-slate-700 uppercase">{act}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {MODULES.map(mod => {
                    const modulePerms = formRole.permissions?.[mod] || [];
                    return (
                      <tr key={mod} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-bold text-slate-900 capitalize">{mod}</td>
                        {ACTIONS.map(act => {
                          const isChecked = modulePerms.includes(act) || modulePerms.includes('manage');
                          return (
                            <td key={act} className="px-3 py-2 text-center">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleRolePermToggle(mod, act)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 rounded cursor-pointer"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsAddRoleModalOpen(false)}
                className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleCreateRoleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT ROLE MATRIX --- */}
      {isEditRoleModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Configure Role Matrix: {formRole.name}</h2>
                <p className="text-xs text-slate-500">Database-driven permission mapping loaded dynamically.</p>
              </div>
              <button onClick={() => setIsEditRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Role Name</label>
                <input 
                  type="text"
                  disabled={formRole.is_system}
                  value={formRole.name}
                  onChange={(e) => setFormRole({ ...formRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <input 
                  type="text"
                  value={formRole.description}
                  onChange={(e) => setFormRole({ ...formRole, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 border-t border-slate-100 pt-3">
              <table className="min-w-full divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-700 uppercase">Module</th>
                    {ACTIONS.map(act => (
                      <th key={act} className="px-3 py-2.5 text-center font-bold text-slate-700 uppercase">{act}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {MODULES.map(mod => {
                    const modulePerms = formRole.permissions?.[mod] || [];
                    return (
                      <tr key={mod} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-bold text-slate-900 capitalize">{mod}</td>
                        {ACTIONS.map(act => {
                          const isChecked = formRole.name === 'Super Admin' || modulePerms.includes(act) || modulePerms.includes('manage');
                          return (
                            <td key={act} className="px-3 py-2 text-center">
                              <input 
                                type="checkbox"
                                disabled={formRole.name === 'Super Admin'}
                                checked={isChecked}
                                onChange={() => handleRolePermToggle(mod, act)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 rounded cursor-pointer disabled:opacity-50"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsEditRoleModalOpen(false)}
                className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleEditRoleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm"
              >
                Update Role Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: DELETE ROLE --- */}
      {isDeleteRoleModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Delete Custom Role?</h2>
            <p className="text-sm text-slate-500">
              Are you sure you want to delete custom role <strong className="text-slate-900">{formRole.name}</strong>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsDeleteRoleModalOpen(false)}
                className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDeleteRoleSubmit}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 shadow-sm"
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- USER CREATION MODAL --- */}
      {isAddUserModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add New Team User</h2>
            <form onSubmit={handleCreateUserSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Vikramaditya Singh"
                  value={formUser.name}
                  onChange={(e) => setFormUser({ ...formUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="vikram@energymall.in"
                  value={formUser.email}
                  onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Initial Password <span className="text-slate-400 font-normal">(Optional: Default 'password123')</span>
                </label>
                <input 
                  type="password" 
                  placeholder="Leave empty for default password123"
                  value={formUser.password}
                  onChange={(e) => setFormUser({ ...formUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Assigned Dynamic Role <span className="text-green-600 font-bold">(Default: Admin)</span>
                </label>
                <select 
                  value={formUser.role}
                  onChange={(e) => handleUserRoleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-white font-semibold"
                >
                  {selectableRoles.map(r => (
                    <option key={r.id} value={r.name}>
                      {r.name} {r.name === 'Admin' ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {isEditUserModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Edit User Details</h2>
            <form onSubmit={handleEditUserSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formUser.name}
                  onChange={(e) => setFormUser({ ...formUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formUser.email}
                  onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Dynamic Role</label>
                <select 
                  value={formUser.role}
                  onChange={(e) => handleUserRoleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-white font-semibold"
                >
                  {selectableRoles.map(r => (
                    <option key={r.id} value={r.name}>
                      {r.name} {r.name === 'Admin' ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Account Status</label>
                <select 
                  value={formUser.status}
                  onChange={(e) => setFormUser({ ...formUser, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- USER PERMISSION MATRIX MODAL --- */}
      {isUserPermModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">User Specific Permission Matrix</h2>
                <p className="text-xs text-slate-500">
                  Loaded matrix for <strong className="text-slate-900">{formUser.name}</strong> (Assigned Role: <span className="font-semibold text-green-700">{formUser.role}</span>)
                </p>
              </div>
              <div className="flex items-center gap-3">
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={handleResetUserPermsToRoleDefault}
                    className="px-3 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                    title="Reset to default permissions of assigned role"
                  >
                    ↺ Reset To Role Defaults
                  </button>
                )}
                <button onClick={() => setIsUserPermModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <table className="min-w-full divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-700 uppercase">Module</th>
                    {ACTIONS.map(act => (
                      <th key={act} className="px-3 py-2.5 text-center font-bold text-slate-700 uppercase">{act}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {MODULES.map(mod => {
                    const modulePerms = formUser.permissions?.[mod] || [];
                    return (
                      <tr key={mod} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-bold text-slate-900 capitalize">{mod}</td>
                        {ACTIONS.map(act => {
                          const isChecked = formUser.role === 'Super Admin' || modulePerms.includes(act) || modulePerms.includes('manage');
                          return (
                            <td key={act} className="px-3 py-2 text-center">
                              <input 
                                type="checkbox"
                                disabled={formUser.role === 'Super Admin' || !isSuperAdmin}
                                checked={isChecked}
                                onChange={() => handleUserPermToggle(mod, act)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 rounded cursor-pointer disabled:opacity-50"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsUserPermModalOpen(false)}
                className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Close
              </button>
              {isSuperAdmin && (
                <button 
                  type="button"
                  onClick={handleSaveUserPermissions}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm"
                >
                  Save User Permissions
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE USER MODAL --- */}
      {isDeleteUserModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Delete User Account?</h2>
            <p className="text-sm text-slate-500">
              Are you sure you want to delete <strong className="text-slate-900">{formUser.name}</strong> ({formUser.email})?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsDeleteUserModalOpen(false)}
                className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDeleteUserSubmit}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 shadow-sm"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
