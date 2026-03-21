export const API_CONFIG = {
  useMockData: false,
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8097',
  timeout: 10000,
};

// Logger pour les appels API
export const apiLogger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`🔵 ${message}`, data || '');
    }
  },
  warn: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.warn(`🟡 ${message}`, data || '');
    }
  },
  error: (message: string, data?: any) => {
    console.error(`🔴 ${message}`, data || '');
  }
};