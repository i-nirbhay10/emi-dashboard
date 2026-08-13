"use client";
import React, { useState, useEffect } from 'react';
import { getAppVersions, updateAppVersion } from '../../../lib/api';

const compareVersions = (v1, v2) => {
  const parts1 = v1.replace(/^v/, '').split('.').map(Number);
  const parts2 = v2.replace(/^v/, '').split('.').map(Number);
  const length = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < length; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
};

export default function AppVersionsPage() {
  const [androidConfig, setAndroidConfig] = useState({ platform: 'android', latest_version: '', minimum_supported_version: '', force_update: false, store_url: '', title: '', message: '', is_active: true });
  const [iosConfig, setIosConfig] = useState({ platform: 'ios', latest_version: '', minimum_supported_version: '', force_update: false, store_url: '', title: '', message: '', is_active: true });
  
  const [loading, setLoading] = useState(true);
  const [savingAndroid, setSavingAndroid] = useState(false);
  const [savingIos, setSavingIos] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    const data = await getAppVersions();
    if (data && data.length > 0) {
      const android = data.find(c => c.platform === 'android');
      const ios = data.find(c => c.platform === 'ios');
      if (android) setAndroidConfig(android);
      if (ios) setIosConfig(ios);
    }
    setLoading(false);
  };

  const handleSave = async (platform, config, setSaving) => {
    setErrorMsg('');
    setSuccessMsg('');

    // Validation
    const versionRegex = /^v?\d+(\.\d+){1,2}$/;
    if (!versionRegex.test(config.latest_version) || !versionRegex.test(config.minimum_supported_version)) {
      setErrorMsg(`[${platform}] Invalid version format. Use e.g. 2.1.10`);
      return;
    }

    if (compareVersions(config.minimum_supported_version, config.latest_version) === 1) {
      setErrorMsg(`[${platform}] Minimum supported version cannot be greater than latest version.`);
      return;
    }

    // Confirmation if force update is ON or being turned ON
    if (config.force_update) {
      const confirmed = window.confirm(`WARNING: You are enforcing a mandatory update for ${platform.toUpperCase()}.\n\nUsers running versions below ${config.minimum_supported_version} will be BLOCKED from using the app until they update.\n\nAre you absolutely sure you want to proceed?`);
      if (!confirmed) return;
    }

    setSaving(true);
    const res = await updateAppVersion(platform, config);
    if (res) {
      setSuccessMsg(`Successfully updated ${platform.toUpperCase()} configuration.`);
      if (platform === 'android') setAndroidConfig(res);
      else setIosConfig(res);
    } else {
      setErrorMsg(`Failed to update ${platform.toUpperCase()} configuration.`);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading configurations...</div>;
  }

  const renderConfigForm = (platform, config, setConfig, saving, saveFn) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 capitalize">{platform} Application</h2>
          <p className="text-sm text-slate-500 mt-1">Control versioning and force updates for {platform} users.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Active</span>
          <button 
            onClick={() => setConfig(prev => ({ ...prev, is_active: !prev.is_active }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.is_active ? 'bg-green-500' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Latest Version</label>
            <input 
              type="text" 
              value={config.latest_version} 
              onChange={e => setConfig(prev => ({...prev, latest_version: e.target.value}))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
              placeholder="e.g. 2.1.12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Supported Version</label>
            <input 
              type="text" 
              value={config.minimum_supported_version} 
              onChange={e => setConfig(prev => ({...prev, minimum_supported_version: e.target.value}))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
              placeholder="e.g. 2.1.10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Store URL</label>
          <input 
            type="text" 
            value={config.store_url} 
            onChange={e => setConfig(prev => ({...prev, store_url: e.target.value}))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
            placeholder="https://play.google.com/store/apps/details?id=..."
          />
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex items-start gap-4">
          <div className="mt-1">
            <button 
              onClick={() => setConfig(prev => ({ ...prev, force_update: !prev.force_update }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.force_update ? 'bg-red-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.force_update ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-800">Mandatory Update</h3>
            <p className="text-xs text-red-600 mt-1">If enabled, users running a version below the Minimum Supported Version will be locked out until they update the app.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Update Screen Title</label>
          <input 
            type="text" 
            value={config.title} 
            onChange={e => setConfig(prev => ({...prev, title: e.target.value}))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
            placeholder="Update Required"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Update Screen Message</label>
          <textarea 
            value={config.message} 
            onChange={e => setConfig(prev => ({...prev, message: e.target.value}))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
            rows={3}
            placeholder="A new version of the app is available..."
          />
        </div>

      </div>
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
        <button 
          onClick={() => saveFn(platform, config, saving ? () => {} : setSavingAndroid)} // setSaving is dynamically bound below
          disabled={saving}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">App Version Management</h1>
        <p className="text-sm text-slate-500 mt-1">Manage minimum supported versions, force updates, and app store URLs.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {renderConfigForm('android', androidConfig, setAndroidConfig, savingAndroid, (p, c) => handleSave(p, c, setSavingAndroid))}
      {renderConfigForm('ios', iosConfig, setIosConfig, savingIos, (p, c) => handleSave(p, c, setSavingIos))}
    </div>
  );
}
