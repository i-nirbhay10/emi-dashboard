"use client";
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    // Client-side only evaluation completely bypasses SSR hydration mismatches
    const checkLogin = window.location.pathname.startsWith('/login');
    setIsLogin(checkLogin);
    setMounted(true);
    
    if (!checkLogin) {
      const auth = localStorage.getItem('emi_admin_auth');
      if (auth !== 'true') {
        router.push('/login');
      }
    }
  }, [pathname, router]);

  return (
    <div className={`min-h-full flex text-slate-900 bg-slate-50 transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
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
          {children}
        </main>
      </div>
    </div>
  );
}
