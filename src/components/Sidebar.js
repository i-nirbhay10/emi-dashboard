"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../lib/rbac';

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  if (!user || !user.role) {
    return null;
  }

  const userRole = user.role;

  const isActive = (path) => {
    if (path === '/' && pathname !== '/') return false;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return pathname === path;
  };

  const navItemClass = (path) => {
    return isActive(path)
      ? "flex items-center gap-3 px-3 py-2 rounded-lg bg-green-50 text-green-700 font-medium transition-colors"
      : "flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors";
  };

  const iconClass = (path) => {
    return isActive(path) ? "w-5 h-5 text-green-600" : "w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors";
  };

  // Dynamic RBAC Permission Check for Navigation Links
  const canAccess = (key) => {
    if (userRole === 'Super Admin' || user?.email === 'admin@energymall.in') return true;
    return hasPermission(user, key, 'view');
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 text-slate-700 flex flex-col h-full shadow-sm z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100 mb-4 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 w-full">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-green-600/20 shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-base font-extrabold tracking-tight text-slate-900 truncate">EnergyMall</span>
              <span className="text-[10px] font-extrabold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200 shrink-0">IN</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase truncate">
              {userRole} Portal
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
        
        {/* Overview Group */}
        {(canAccess('dashboard') || canAccess('analytics')) && (
          <>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4 px-2">Overview</div>
            {canAccess('dashboard') && (
              <Link href="/" onClick={onNavigate} className={`${navItemClass('/')} group`}>
                <svg className={iconClass('/')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Dashboard
              </Link>
            )}
            {canAccess('analytics') && (
              <Link href="/analytics" onClick={onNavigate} className={`${navItemClass('/analytics')} group`}>
                <svg className={iconClass('/analytics')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Analytics
              </Link>
            )}
          </>
        )}

        {/* E-Commerce Group */}
        {(canAccess('orders') || canAccess('products') || canAccess('categories') || canAccess('inventory')) && (
          <>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6 px-2">E-Commerce</div>
            {canAccess('orders') && (
              <Link href="/orders" onClick={onNavigate} className={`${navItemClass('/orders')} group`}>
                <svg className={iconClass('/orders')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Orders
              </Link>
            )}
            {canAccess('products') && (
              <Link href="/products" onClick={onNavigate} className={`${navItemClass('/products')} group`}>
                <svg className={iconClass('/products')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                Products
              </Link>
            )}
            {canAccess('categories') && (
              <Link href="/categories" onClick={onNavigate} className={`${navItemClass('/categories')} group`}>
                <svg className={iconClass('/categories')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg>
                Categories
              </Link>
            )}
            {canAccess('inventory') && (
              <Link href="/inventory" onClick={onNavigate} className={`${navItemClass('/inventory')} group`}>
                <svg className={iconClass('/inventory')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                Inventory
              </Link>
            )}
          </>
        )}

        {/* Marketing Group */}
        {(canAccess('customers') || canAccess('offers') || canAccess('banners')) && (
          <>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6 px-2">Marketing</div>
            {canAccess('customers') && (
              <Link href="/customers" onClick={onNavigate} className={`${navItemClass('/customers')} group`}>
                <svg className={iconClass('/customers')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Customers
              </Link>
            )}
            {canAccess('offers') && (
              <Link href="/offers" onClick={onNavigate} className={`${navItemClass('/offers')} group`}>
                <svg className={iconClass('/offers')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                Offers
              </Link>
            )}
            {canAccess('banners') && (
              <Link href="/banners" onClick={onNavigate} className={`${navItemClass('/banners')} group`}>
                <svg className={iconClass('/banners')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Banners
              </Link>
            )}
          </>
        )}

        {/* System Group */}
        {(canAccess('content') || canAccess('users')) && (
          <>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6 px-2">System</div>
            {canAccess('content') && (
              <Link href="/content" onClick={onNavigate} className={`${navItemClass('/content')} group`}>
                <svg className={iconClass('/content')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-.2-1l-3-6a2 2 0 00-1.8-1.5H15" /></svg>
                Content CMS
              </Link>
            )}
            {canAccess('users') && (
              <Link href="/users" onClick={onNavigate} className={`${navItemClass('/users')} group`}>
                <svg className={iconClass('/users')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Users & Roles
              </Link>
            )}
          </>
        )}
      </nav>

      {/* Footer / Settings */}
      {(canAccess('security') || canAccess('settings')) && (
        <div className="p-4 border-t border-slate-100 space-y-1 shrink-0">
          {canAccess('security') && (
            <Link href="/security" onClick={onNavigate} className={`${navItemClass('/security')} group`}>
              <svg className={iconClass('/security')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Security
            </Link>
          )}
          {canAccess('settings') && (
            <Link href="/settings" onClick={onNavigate} className={`${navItemClass('/settings')} group`}>
              <svg className={iconClass('/settings')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Settings
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
