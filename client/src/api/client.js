// Resolves production API base URL from Vite environment, falling back to relative '/api'
const envBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';
let API_BASE = '/api';
if (envBase) {
  API_BASE = envBase.endsWith('/api') ? envBase : (envBase.endsWith('/') ? `${envBase}api` : `${envBase}/api`);
}

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('ai_qa_token') || '';
  }

  getBaseUrl() {
    return API_BASE;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('ai_qa_token', token);
    } else {
      localStorage.removeItem('ai_qa_token');
    }
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}, retries = (options.method === 'GET' || !options.method ? 1 : 0)) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE}${cleanEndpoint}`;
    const headers = this.getHeaders(options.headers);

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      // If 401 Unauthorized, notify or clear stale token
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        this.setToken('');
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }

      // Retry on server-side 502/503/504 errors on idempotent requests
      if ((response.status === 502 || response.status === 503 || response.status === 504) && retries > 0 && (options.method === 'GET' || !options.method)) {
        await new Promise(r => setTimeout(r, 600));
        return this.request(endpoint, options, retries - 1);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || data.error?.message || `Request failed with status ${response.status}`);
        }
        return data;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
      }

      return response;
    } catch (err) {
      // Auto-retry transient network drops on idempotent requests
      if (retries > 0 && (options.method === 'GET' || !options.method) && err.name !== 'AbortError') {
        await new Promise(r => setTimeout(r, 600));
        return this.request(endpoint, options, retries - 1);
      }
      console.error(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  }

  get(endpoint, params = {}, retries) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    const qs = query.toString();
    return this.request(qs ? `${endpoint}?${qs}` : endpoint, { method: 'GET' }, retries);
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
