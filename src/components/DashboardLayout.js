"use client";
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { hasPermission, getModuleForPath } from '../lib/rbac';

function ForbiddenView({ moduleName, userRole }) {
  return (
    <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-5 my-12 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center text-3xl font-extrabold shadow-xs">
        🛡️
      </div>
      <div>
        <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 uppercase">
          403 Forbidden
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">Access Restricted</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto mt-1">
          You do not have permission to access the <strong className="text-slate-800 capitalize">{moduleName}</strong> module. Route-level access control is enforced for your role.
        </p>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
        <div className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold font-mono border border-slate-200">
          Your Current Role: <span className="text-slate-900 font-bold">{userRole}</span>
        </div>
        <div className="px-3 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold font-mono border border-amber-200">
          Required Permission: <span className="font-bold">{moduleName}:view</span>
        </div>
      </div>

      <div className="pt-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

function InnerDashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, syncAuthFromStorage } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const checkLogin = window.location.pathname.startsWith('/login');
    setIsLogin(checkLogin);
    setMounted(true);
    
    if (!checkLogin) {
      const auth = localStorage.getItem('emi_admin_auth');
      if (auth !== 'true') {
        router.replace('/login');
      } else {
        syncAuthFromStorage();
      }
    }
  }, [pathname, router]);

  // Determine target RBAC module for current route
  const targetModule = getModuleForPath(pathname);
  const userRole = user?.role || '';
  const isSuperAdmin = userRole === 'Super Admin' || user?.email === 'admin@energymall.in';

  // Evaluate Route-Level Authorization
  const isAuthorized = isLogin || !targetModule || isSuperAdmin || (user && hasPermission(user, targetModule, 'view'));

  // Prevent flash of superadmin interface when unauthenticated or during logout
  const isUnauthenticated = !isLogin && (!isAuthenticated || !user || typeof window !== 'undefined' && localStorage.getItem('emi_admin_auth') !== 'true');

  if (isUnauthenticated && mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-full flex text-slate-900 bg-slate-50 transition-opacity duration-200 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${isLogin ? 'hidden' : 'block'}`}>
        <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full min-w-0">
        
        <div className={isLogin ? 'hidden' : 'block'}>
          <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        </div>
        
        <main className={`flex-1 overflow-auto ${isLogin ? '' : 'p-4 md:p-8'}`}>
          {isAuthorized ? (
            children
          ) : (
            <ForbiddenView moduleName={targetModule} userRole={userRole} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <InnerDashboardLayout>{children}</InnerDashboardLayout>
    </AuthProvider>
  );
}
