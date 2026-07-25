"use client";
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ onMenuClick }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const userInfo = {
    name: user.name || 'User',
    email: user.email || '',
    role: user.role || 'Staff'
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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-xs relative z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* User Profile Dropdown */}
      <div className="relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
            {userInfo.name ? userInfo.name[0].toUpperCase() : 'U'}
          </div>
          <div className="text-left hidden lg:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">{userInfo.name}</span>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase border ${getRoleBadgeStyle(userInfo.role)}`}>
                {userInfo.role}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">{userInfo.email}</div>
          </div>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
            <div className="px-4 py-2 border-b border-slate-100 lg:hidden">
              <div className="font-bold text-slate-800">{userInfo.name}</div>
              <div className="text-slate-400 font-mono">{userInfo.email}</div>
              <div className="mt-1">
                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase border ${getRoleBadgeStyle(userInfo.role)}`}>
                  {userInfo.role}
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
