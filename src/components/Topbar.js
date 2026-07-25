"use client";
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ onMenuClick }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();

  const userInfo = {
    name: user?.name || 'Super Admin',
    email: user?.email || 'admin@energymall.in',
    role: user?.role || 'Super Admin'
  };

  const handleLogout = () => {
    logout();
  };

  const getRoleBadgeStyle = (role) => {
    if (role === 'Super Admin' || role === 'Admin') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (role === 'Store Manager') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (role === 'Support Agent') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  return (
    <header className="h-16 bg-white flex items-center justify-between px-4 md:px-8 border-b border-slate-100 z-10 shadow-sm shrink-0">
      <div className="flex-1 flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="relative w-full max-w-md hidden sm:block">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search orders, customers, or products..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="relative">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 group-hover:ring-2 ring-green-500 ring-offset-2 transition-all">
              {userInfo.name ? userInfo.name[0].toUpperCase() : 'A'}
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-800">{userInfo.name}</p>
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getRoleBadgeStyle(userInfo.role)}`}>
                  {userInfo.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{userInfo.email}</p>
            </div>
            <svg className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">{userInfo.name}</p>
                <p className="text-xs text-slate-500 font-mono truncate">{userInfo.email}</p>
                <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded border font-semibold ${getRoleBadgeStyle(userInfo.role)}`}>
                  {userInfo.role}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
