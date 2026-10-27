/**
 * Unified API Client for Smart Crop Monitoring System.
 * Connects React frontend to Flask REST API running on port 5000.
 */

const API_BASE_URL = 'http://localhost:5000';

function getAuthHeader() {
  const token = localStorage.getItem('smart_agri_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || (data.errors && data.errors.join(', ')) || 'API request failed');
    }
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    login: (credentials) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    forgotPassword: (data) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
    getProfile: () => request('/api/auth/me'),
  },

  // Sensors
  sensors: {
    getLive: () => request('/api/sensors/live'),
    tick: () => request('/api/sensors/tick', { method: 'POST' }),
    getHistory: (limit = 48, days = 7) => request(`/api/sensors/history?limit=${limit}&days=${days}`),
    sendHardwareTelemetry: (payload) => request('/api/sensors/telemetry', { method: 'POST', body: JSON.stringify(payload) }),
  },

  // Irrigation
  irrigation: {
    getStatus: () => request('/api/irrigation/status'),
    setPump: (state, mode = 'MANUAL') => request('/api/irrigation/pump', { method: 'POST', body: JSON.stringify({ state, mode }) }),
    updateSettings: (settings) => request('/api/irrigation/settings', { method: 'POST', body: JSON.stringify(settings) }),
    getHistory: (limit = 20) => request(`/api/irrigation/history?limit=${limit}`),
  },

  // Prediction
  prediction: {
    predict: (data) => request('/api/prediction/predict', { method: 'POST', body: JSON.stringify(data) }),
    getHistory: () => request('/api/prediction/history'),
  },

  // GenAI Farmer Assistant
  genai: {
    chat: (message, language = 'en') => request('/api/genai/chat', { method: 'POST', body: JSON.stringify({ message, language }) }),
    getHistory: () => request('/api/genai/history'),
    clear: () => request('/api/genai/clear', { method: 'POST' }),
  },

  // Field & Crop Health
  field: {
    getOverview: () => request('/api/field/overview'),
    update: (data) => request('/api/field/update', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Device Management
  devices: {
    getAll: () => request('/api/devices'),
  },

  // Cloud & AWS Status
  cloud: {
    getAwsStatus: () => request('/api/cloud/aws-status'),
  },

  // CSV Export URL helper
  reports: {
    getExportUrl: (type = 'sensors') => `${API_BASE_URL}/api/reports/export-csv?type=${type}`,
  },
};
