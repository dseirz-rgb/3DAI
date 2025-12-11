import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, Settings, Globe, Shield, Server } from 'lucide-react';
import { 
  getApiKey, setApiKey, 
  getBaseUrl, setBaseUrl,
  getUseProxy, setUseProxy,
  getProxyUrl, setProxyUrl
} from '../services/tencentService';

export const ApiKeyConfig: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [key, setKey] = useState('');
  const [url, setUrl] = useState('');
  const [proxyUrl, setProxyUrlState] = useState('');
  const [useProxy, setUseProxyState] = useState(false); // Default false for UI init
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKey(getApiKey());
      setUrl(getBaseUrl());
      setUseProxyState(getUseProxy());
      setProxyUrlState(getProxyUrl());
    }
  }, [isOpen]);

  const handleSave = () => {
    setApiKey(key);
    setBaseUrl(url);
    setUseProxy(useProxy);
    setProxyUrl(proxyUrl);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm"
      >
        <Settings size={14} />
        <span>Settings</span>
      </button>
    );
  }

  return (
    <div className="absolute top-16 right-4 z-50 w-80 bg-white p-4 rounded-xl border border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Configuration</h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
          <span className="sr-only">Close</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* API Key Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Key size={12} /> API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              className="w-full pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Base URL Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Globe size={12} /> API Endpoint
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.ai3d.cloud.tencent.com/v1/ai3d"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-[10px] text-slate-400">
            The base URL for the API.
          </p>
        </div>

        {/* Proxy Toggle */}
        <div className="flex items-center justify-between pt-1">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1 cursor-pointer">
            <Shield size={12} /> Use CORS Proxy
          </label>
          <button
            onClick={() => setUseProxyState(!useProxy)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${useProxy ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <span
              className={`${
                useProxy ? 'translate-x-5' : 'translate-x-1'
              } inline-block h-3 w-3 transform rounded-full bg-white transition`}
            />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 -mt-2">
            Enable if you experience "Failed to fetch" errors due to browser CORS restrictions.
        </p>

        {/* Proxy URL Input (Conditional) */}
        {useProxy && (
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Server size={12} /> Proxy URL Prefix
            </label>
            <input
              type="text"
              value={proxyUrl}
              onChange={(e) => setProxyUrlState(e.target.value)}
              placeholder="https://corsproxy.io/?"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full mt-2 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Save size={16} />
          Save Configuration
        </button>
      </div>
    </div>
  );
};