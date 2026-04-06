// ═══════════════════════════════════════════
//  TALKATIV API CLIENT
//  Centralized API communication layer
// ═══════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || '';
const LOGIN_HASH = import.meta.env.VITE_AUTH_LOGIN_HASH;
const REGISTER_HASH = import.meta.env.VITE_AUTH_REGISTER_HASH;

// ─── Token Management ───────────────────────────────────────────────────────
let accessToken = null;

export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;
export const clearAccessToken = () => { accessToken = null; };

// ─── Auth Fetch (with auto-refresh) ─────────────────────────────────────────
async function authFetch(url, options = {}) {
  // Skip auth handling only for actual auth endpoints (login, register, etc.)
  // NOT for the page URL — onboarding pages still make authenticated API calls.
  const isAuthEndpoint = url.includes('/auth/login') ||
                         url.includes('/auth/register') ||
                         url.includes('/auth/refresh') ||
                         url.includes('/auth/forgot-password') ||
                         url.includes('/auth/reset-password') ||
                         url.includes('/auth/google') ||
                         url.includes('/auth/staff-login');

  // If no token in memory, try to restore it from the refresh cookie
  if (!accessToken && !isAuthEndpoint) {
    await refreshAccessToken();
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Remove Content-Type for FormData (file uploads)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_URL}${url}`, { ...options, headers, credentials: 'include' });

  // On 401, try once to refresh and retry (works during onboarding too)
  if (res.status === 401 && !isAuthEndpoint) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(`${API_URL}${url}`, { ...options, headers, credentials: 'include' });
    }
  }

  return res;
}

async function refreshAccessToken() {
  try {
    const res = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      accessToken = data.accessToken;
      return data; // truthy; includes fresh user data if available
    }
  } catch (err) {
    console.error('Token refresh failed:', err);
  }
  accessToken = null;
  return false;
}

// ─── Generic request helpers ────────────────────────────────────────────────
async function get(url) {
  const res = await authFetch(url);
  if (!res.ok) throw await buildError(res);
  return res.json();
}

async function post(url, body) {
  const res = await authFetch(url, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
  if (!res.ok) throw await buildError(res);
  return res.json();
}

async function put(url, body) {
  const res = await authFetch(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await buildError(res);
  return res.json();
}

async function del(url) {
  const res = await authFetch(url, { method: 'DELETE' });
  if (!res.ok) throw await buildError(res);
  return res.json();
}

async function buildError(res) {
  try {
    const data = await res.json();
    return new Error(data.message || data.error || `Request failed (${res.status})`);
  } catch {
    return new Error(`Request failed (${res.status})`);
  }
}

// ═══════════════════════════════════════════
//  API MODULES
// ═══════════════════════════════════════════

export const api = {
  // ─── Auth ───────────────────────────────────
  auth: {
    async login(email, password) {
      const res = await fetch(`${API_URL}/auth/login/${LOGIN_HASH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (!res.ok) throw await buildError(res);
      const data = await res.json();
      accessToken = data.accessToken;
      return data;
    },

    async staffLogin(businessName, username, password) {
      const res = await fetch(`${API_URL}/auth/staff-login/${LOGIN_HASH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, username, password }),
        credentials: 'include',
      });
      if (!res.ok) throw await buildError(res);
      const data = await res.json();
      accessToken = data.accessToken;
      return data;
    },

    googleLoginUrl(state = 'login') {
      return `${API_URL}/auth/google?state=${state}`;
    },

    async register(email, password, firstName, lastName, googleId) {
      const res = await fetch(`${API_URL}/auth/register/${REGISTER_HASH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, ...(googleId && { googleId }) }),
        credentials: 'include',
      });
      if (!res.ok) throw await buildError(res);
      const data = await res.json();
      accessToken = data.accessToken;
      return data;
    },

    async logout() {
      try {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
      } catch {}
      accessToken = null;
    },

    async refreshToken() {
      return refreshAccessToken();
    },

    async forgotPassword(email) {
      return post('/auth/forgot-password', { email });
    },

    async resetPassword(token, newPassword) {
      return post('/auth/reset-password', { token, newPassword });
    },
  },

  // ─── Dashboard ──────────────────────────────
  dashboard: {
    getStats: () => get('/api/dashboard/stats'),
    getRecentCalls: () => get('/api/dashboard/recent-calls'),
    getAgentStatus: () => get('/api/dashboard/agent-status'),
    getChartData: () => get('/api/dashboard/chart-data'),
  },

  // ─── Calls ──────────────────────────────────
  calls: {
    list: (params = '') => get(`/api/calls${params ? '?' + params : ''}`),
    getById: (id) => get(`/api/calls/${id}`),
    getStats: () => get('/api/calls/stats'),
  },

  // ─── Orders ─────────────────────────────────
  orders: {
    list: (params = '') => get(`/api/orders${params ? '?' + params : ''}`),
    getById: (id) => get(`/api/orders/${id}`),
    updateStatus: (id, status) => put(`/api/orders/${id}/status`, { status }),
    getStats: () => get('/api/orders/stats'),
  },

  // ─── Reservations ──────────────────────────
  reservations: {
    list: (params = '') => get(`/api/reservations${params ? '?' + params : ''}`),
    create: (data) => post('/api/reservations', data),
    update: (id, data) => put(`/api/reservations/${id}`, data),
    delete: (id) => del(`/api/reservations/${id}`),
    getStats: () => get('/api/reservations/stats'),
  },

  // ─── Agent ──────────────────────────────────
  agent: {
    get: () => get('/api/agent'),
    update: (data) => put('/api/agent', data),
    getTranscripts: () => get('/api/agent/transcripts'),
    testCall: () => post('/api/agent/test-call', {}),
    updateVoice: (data) => put('/api/agent/voice', data),
    updateScript: (data) => put('/api/agent/script', data),
    updateCallRules: (data) => put('/api/agent/call-rules', data),
    previewVoice: (data) => post('/api/agent/preview-voice', data),
    getSignedUrl: () => get('/api/agent/signed-url'),
    rebuildPrompt: () => post('/api/agent/rebuild-prompt', {}),
  },

  // ─── Voices ─────────────────────────────────
  voices: {
    list: () => get('/api/voices'),
  },

  // ─── Menu ───────────────────────────────────
  menu: {
    getCategories: () => get('/api/menu/categories'),
    getCategoryItems: (id) => get(`/api/menu/categories/${id}/items`),
    createCategory: (data) => post('/api/menu/categories', data),
    updateCategory: (id, data) => put(`/api/menu/categories/${id}`, data),
    deleteCategory: (id) => del(`/api/menu/categories/${id}`),
    createItem: (data) => post('/api/menu/items', data),
    updateItem: (id, data) => put(`/api/menu/items/${id}`, data),
    deleteItem: (id) => del(`/api/menu/items/${id}`),
    importFromUrl: (url) => post('/api/menu/import/url', { url }),
    importFromFile: (file) => {
      const fd = new FormData();
      fd.append('file', file);
      return post('/api/menu/import/file', fd);
    },
    importFromPdf: (file) => {
      const fd = new FormData();
      fd.append('file', file);
      return post('/api/menu/import/pdf', fd);
    },
    importFromImage: (file) => {
      const fd = new FormData();
      fd.append('file', file);
      return post('/api/menu/import/image', fd);
    },
    importFromPos: (posSystem, credentials) => post('/api/menu/import/pos', { posSystem, credentials }),
  },

  // ─── FAQ ────────────────────────────────────────
  faq: {
    list: () => get('/api/menu/faq'),
    create: (data) => post('/api/menu/faq', data),
    update: (id, data) => put(`/api/menu/faq/${id}`, data),
    delete: (id) => del(`/api/menu/faq/${id}`),
  },

  // ─── Integrations ──────────────────────────
  integrations: {
    list: () => get('/api/integrations'),
    connect: (name, category, config = {}) => post('/api/integrations/connect', { name, category, config }),
    disconnect: (id) => del(`/api/integrations/${id}/disconnect`),
  },

  // ─── Billing ────────────────────────────────
  billing: {
    get: () => get('/api/billing'),
    getInvoices: () => get('/api/billing/invoices'),
    subscribe: (data) => post('/api/billing/subscribe', data),
    changePlan: (data) => put('/api/billing/plan', data),
    cancel: () => post('/api/billing/cancel', {}),
    getPortal: () => get('/api/billing/portal'),
  },

  // ─── Settings ───────────────────────────────
  settings: {
    getBusiness: () => get('/api/settings/business'),
    updateBusiness: (data) => put('/api/settings/business', data),
    getNotifications: () => get('/api/settings/notifications'),
    updateNotifications: (data) => put('/api/settings/notifications', data),
    getPhone: () => get('/api/settings/phone'),
    updatePhone: (data) => put('/api/settings/phone', data),
    changePassword: (data) => put('/api/settings/password', data),
    getSessions: () => get('/api/settings/sessions'),
    revokeSession: (id) => del(`/api/settings/sessions/${id}`),
    getOrderingPolicy: () => get('/api/settings/ordering-policy'),
    updateOrderingPolicy: (data) => put('/api/settings/ordering-policy', data),
    getReservationPolicy: () => get('/api/settings/reservation-policy'),
    updateReservationPolicy: (data) => put('/api/settings/reservation-policy', data),
    getStaff: () => get('/api/settings/staff'),
    createStaff: (data) => post('/api/settings/staff', data),
    updateStaff: (id, data) => put(`/api/settings/staff/${id}`, data),
    deleteStaff: (id) => del(`/api/settings/staff/${id}`),
    sendOtp: () => post('/api/settings/send-otp', {}),
    verifyOtp: (code, enable) => post('/api/settings/verify-otp', { code, enable }),
  },

  // ─── Business ───────────────────────────────
  business: {
    get: () => get('/api/business'),
    update: (data) => put('/api/business', data),
    updateOnboarding: (data) => put('/api/business/onboarding', data),
    completeOnboarding: (data = {}) => post('/api/business/complete-onboarding', data),
    setupPhone: (mode, countryCode) => post('/api/business/setup-phone', { mode, countryCode }),
  },

  // ─── Upload ─────────────────────────────────
  upload: {
    menuPdf: (file) => {
      const fd = new FormData();
      fd.append('file', file);
      return post('/api/upload/menu-pdf', fd);
    },
    menuImage: (file) => {
      const fd = new FormData();
      fd.append('file', file);
      return post('/api/upload/menu-image', fd);
    },
  },
  // ─── Public (no auth) ────────────────────
  public: {
    async searchBusiness(query) {
      const res = await fetch(`${API_URL}/api/public/search-business?q=${encodeURIComponent(query)}`);
      if (!res.ok) return { results: [] };
      return res.json();
    },
    async demoCall(phoneNumber) {
      const res = await fetch(`${API_URL}/api/public/demo-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      if (!res.ok) throw await buildError(res);
      return res.json();
    },
  },
};

export default api;
