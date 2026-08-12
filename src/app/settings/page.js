'use client';
import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    enable_cod: true,
    enable_upi: true,
    enable_emi: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Fetching from the new admin settings endpoint
      const res = await fetch('http://localhost:5000/api/v1/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // assuming token is here
        }
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings: ' + data.message);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your store preferences and configurations.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Payment Methods Control</h2>
            <p className="text-sm text-slate-500 mt-1">Toggle which payment methods are available in the mobile app.</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
              <div>
                <h3 className="font-medium text-slate-900">Cash on Delivery (COD)</h3>
                <p className="text-sm text-slate-500">Allow customers to pay when the product is delivered.</p>
              </div>
              <button 
                onClick={() => handleToggle('enable_cod')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enable_cod ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enable_cod ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
              <div>
                <h3 className="font-medium text-slate-900">UPI & Online Payments</h3>
                <p className="text-sm text-slate-500">Enable Razorpay integration for cards, UPI, and net banking.</p>
              </div>
              <button 
                onClick={() => handleToggle('enable_upi')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enable_upi ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enable_upi ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
              <div>
                <h3 className="font-medium text-slate-900">No-Cost EMI</h3>
                <p className="text-sm text-slate-500">Enable financing options for expensive products.</p>
              </div>
              <button 
                onClick={() => handleToggle('enable_emi')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enable_emi ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enable_emi ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

          </div>
          
          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm shadow-green-600/20 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
