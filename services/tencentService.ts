import { SubmitResponse, QueryResponse } from '../types';

// Default values
const DEFAULT_TARGET_URL = 'https://api.ai3d.cloud.tencent.com/v1/ai3d';
// Default proxy URL kept for fallback if needed, but not used by default
const DEFAULT_PROXY_URL = 'https://corsproxy.io/?'; 
const DEFAULT_API_KEY = 'sk-YwszNKOaSPTnTGLc5QGQFH7EKNFevpRBIG5VP9v41tQqDLGJ';

interface SubmitPayload {
  Prompt?: string;
  ImageUrl?: {
    Url: string;
  };
  prompt?: string;
  image?: string; 
  model?: string;
}

export const getApiKey = (): string => localStorage.getItem('tencent_api_key') || DEFAULT_API_KEY;
export const setApiKey = (key: string) => localStorage.setItem('tencent_api_key', key);

export const getBaseUrl = (): string => localStorage.getItem('tencent_base_url') || DEFAULT_TARGET_URL;
export const setBaseUrl = (url: string) => localStorage.setItem('tencent_base_url', url);

// CHANGED: Default is now FALSE (Direct connection) unless explicitly set to 'true'
export const getUseProxy = (): boolean => localStorage.getItem('tencent_use_proxy') === 'true';
export const setUseProxy = (use: boolean) => localStorage.setItem('tencent_use_proxy', String(use));

export const getProxyUrl = (): string => localStorage.getItem('tencent_proxy_url') || DEFAULT_PROXY_URL;
export const setProxyUrl = (url: string) => localStorage.setItem('tencent_proxy_url', url);

// Helper to construct URL dynamically
const constructUrl = (endpoint: string, useProxy: boolean, proxyUrl: string, baseUrl: string) => {
  const cleanBase = baseUrl.replace(/\/+$/, ''); 
  const target = `${cleanBase}${endpoint}`;
  
  if (useProxy) {
    // Check if proxyUrl already has '?'
    const separator = proxyUrl.includes('?') ? '' : '?';
    return `${proxyUrl}${separator}${encodeURIComponent(target)}`;
  }
  return target;
};

// Internal fetch wrapper
const doFetch = async (url: string, payload: any, authHeader: string) => {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
       let errorMsg = `HTTP Error: ${response.status} ${response.statusText}`;
       try {
         const errData = await response.json();
         if (errData?.error?.message) {
            errorMsg = `API Error: ${errData.error.message}`;
         } else if (errData?.Response?.Error?.Message) {
            errorMsg = `API Error: ${errData.Response.Error.Message}`;
         }
       } catch (e) {}
       throw new Error(errorMsg);
    }

    return await response.json();
};

const normalizeSubmitResponse = (data: any): SubmitResponse => {
    // Support OpenAI style response { id: "..." }
    if (data.id && !data.JobId) {
        return { JobId: data.id };
    }
    // Support Tencent style response
    const result = data.Response || data;
    if (result.Error) throw new Error(result.Error.Message);
    if (!result.JobId) throw new Error('Invalid response: No JobId found');
    return result;
};

const normalizeQueryResponse = (data: any): QueryResponse => {
    const result = data.Response || data;
    if (result.Error) throw new Error(result.Error.Message);
    
    // Normalize fields
    if (!result.JobId && result.id) result.JobId = result.id;
    // Status normalization
    if (!result.Status && result.status) result.Status = result.status;
    if (result.Status) result.Status = result.Status.toUpperCase();
    
    // Result/Output normalization
    if (!result.Result && result.output) result.Result = result.output;
    
    // Handle OpenAI style "completed" vs Tencent "SUCCESS"
    if (result.Status === 'SUCCEEDED') result.Status = 'SUCCESS';

    return result;
};

export const submitTask = async (
  prompt: string,
  base64Image: string | null
): Promise<SubmitResponse> => {
  const apiKey = getApiKey();
  const authHeader = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
  const baseUrl = getBaseUrl();
  const proxyUrl = getProxyUrl();
  const useProxy = getUseProxy();

  const payload: SubmitPayload = {
     model: "hunyuan-3d-1.0",
  };
  
  if (base64Image) {
    payload.ImageUrl = { Url: base64Image };
    payload.image = base64Image;
  } else {
    payload.Prompt = prompt;
    payload.prompt = prompt;
  }

  // Primary attempt
  try {
    const url = constructUrl('/submit', useProxy, proxyUrl, baseUrl);
    const data = await doFetch(url, payload, authHeader);
    return normalizeSubmitResponse(data);
  } catch (error: any) {
    // Network error fallback logic
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        console.warn("Primary fetch failed. If this is a CORS error, please use a proxy or disable browser security.");
        
        // Only attempt fallback toggle if we haven't exhausted options. 
        // If user is forcing DIRECT (useProxy=false), we try PROXY once as backup in case of CORS.
        try {
            const fallbackUseProxy = !useProxy;
            const fallbackUrl = constructUrl('/submit', fallbackUseProxy, proxyUrl, baseUrl);
            console.log(`Attempting fallback to ${fallbackUseProxy ? 'Proxy' : 'Direct'} mode...`);
            
            const data = await doFetch(fallbackUrl, payload, authHeader);
            return normalizeSubmitResponse(data);
        } catch (fallbackError: any) {
             throw new Error(`Request Failed. If you are in a browser, this is likely a CORS error. Try enabling the Proxy in Settings. Original Error: ${error.message}`);
        }
    }
    throw error;
  }
};

export const queryTask = async (jobId: string): Promise<QueryResponse> => {
  const apiKey = getApiKey();
  const authHeader = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
  const baseUrl = getBaseUrl();
  const proxyUrl = getProxyUrl();
  const useProxy = getUseProxy();

  const payload = { JobId: jobId };

  try {
    const url = constructUrl('/query', useProxy, proxyUrl, baseUrl);
    const data = await doFetch(url, payload, authHeader);
    return normalizeQueryResponse(data);
  } catch (error: any) {
     if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        try {
            const fallbackUseProxy = !useProxy;
            const fallbackUrl = constructUrl('/query', fallbackUseProxy, proxyUrl, baseUrl);
            const data = await doFetch(fallbackUrl, payload, authHeader);
            return normalizeQueryResponse(data);
        } catch (e) {
             throw new Error("Connection failed. Check your network or CORS settings.");
        }
    }
    throw error;
  }
};