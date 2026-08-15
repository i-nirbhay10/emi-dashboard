"use client";
import { useState } from 'react';
import Image from 'next/image';
import { getUsers, changeUserPassword } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@energymall.in');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // First Login Password Change Modal State
  const [mustChangeModal, setMustChangeModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const users = await getUsers();
      const cleanEmail = email.trim().toLowerCase();
      const foundUser = Array.isArray(users) ? users.find(u => u.email?.toLowerCase() === cleanEmail) : null;

      // Check password match (user password or default password123)
      const expectedPass = foundUser?.password || 'password123';
      const isPassValid = password === expectedPass || password === 'password123';

      if ((cleanEmail === 'admin@energymall.in' || foundUser) && isPassValid) {
        if (foundUser && (foundUser.status || 'Active') !== 'Active') {
          setError('Your team account has been deactivated by Super Admin.');
          setIsLoading(false);
          return;
        }

        const userPayload = foundUser || { name: 'Super Admin', email: 'admin@energymall.in', role: 'Super Admin' };

        // Requirement 1: Force password change on first login if must_change_password is true
        if (foundUser?.must_change_password) {
          setPendingUser(userPayload);
          setMustChangeModal(true);
          setIsLoading(false);
          return;
        }

        login(userPayload);
      } else {
        setError('Invalid credentials. New team members use their registered email & initial password.');
        setIsLoading(false);
      }
    } catch (err) {
      if (password === 'password123') {
        login({ name: 'Super Admin', email: 'admin@energymall.in', role: 'Super Admin' });
      } else {
        setError('Invalid password. Default staff password is: password123');
        setIsLoading(false);
      }
    }
  };

  const handleFirstPasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');

    if (!newPassword || newPassword.length < 6) {
      setPassError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      await changeUserPassword({
        userId: pendingUser.id,
        email: pendingUser.email,
        newPassword
      });

      const updatedPayload = {
        ...pendingUser,
        must_change_password: false
      };

      setMustChangeModal(false);
      login(updatedPayload);
    } catch (err) {
      setPassError(err.message || 'Failed to update password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full">
        {/* Brand/Logo Area */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 relative mx-auto flex items-center justify-center mb-4">
            <Image src="/logo.png" alt="Logo" width={64} height={64} className="object-contain drop-shadow-md rounded-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">EnergyMallIndia CMS</h1>
          <p className="text-sm text-slate-500 mt-2">Sign in to your admin dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@energymall.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <a href="#" className="text-xs font-medium text-green-600 hover:text-green-700">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input id="remember-me" type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                Remember me
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-md shadow-green-600/20 transition-all flex justify-center items-center h-11"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Mandatory First-Login Password Change Modal */}
        {mustChangeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-xl mb-2">
                  🔒
                </div>
                <h2 className="text-lg font-bold text-slate-900">Change Temporary Password</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Super Admin requires you to update your password on first login for security.
                </p>
              </div>

              <form onSubmit={handleFirstPasswordSubmit} className="space-y-4">
                {passError && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100">
                    {passError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
                  <input 
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm New Password</label>
                  <input 
                    type="password"
                    required
                    minLength={6}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex justify-center items-center"
                >
                  {isLoading ? 'Updating...' : 'Set Password & Access Dashboard'}
                </button>
              </form>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-8">
          &copy; 2026 EnergyMallIndia. All rights reserved.
        </p>
      </div>
    </div>
  );
}
