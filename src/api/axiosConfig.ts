import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8097';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 secondes au lieu de 10
  withCredentials: false,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Default export for modules importing default instance
export default axiosInstance;

// Fonction pour vérifier si le token est expiré
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convertir en millisecondes
    // Ajouter une marge de 60 secondes pour éviter les problèmes de timing
    return Date.now() >= (exp - 60000);
  } catch {
    return true;
  }
};

// Intercepteur pour ajouter le token aux requêtes
axiosInstance.interceptors.request.use(
  (config) => {
    // Essayer d'abord 'token', puis 'access_token' pour compatibilité
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    if (token) {
      // Vérifier si le token est expiré
      if (isTokenExpired(token)) {
        console.warn('⚠️ Token expiré, redirection vers login');
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Ne rediriger que si on n'est pas déjà sur la page de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(new Error('Token expiré'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // CSRF header from cookie (Spring Security defaults to XSRF-TOKEN)
    try {
      const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
      const csrf = match ? decodeURIComponent(match[1]) : null;
      if (csrf) {
        (config.headers as any)['X-XSRF-TOKEN'] = csrf;
        (config.headers as any)['X-CSRF-TOKEN'] = csrf;
        (config.headers as any)['X-Requested-With'] = 'XMLHttpRequest';
      }
    } catch {}
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs 401 (Unauthorized) et 403 (Forbidden) liées à l'authentification
    if ((error.response?.status === 401 || error.response?.status === 403) && 
        !window.location.pathname.includes('/login')) {
      
      const errorMessage = error.response?.data?.message || error.message || '';
      
      // Si c'est une erreur JWT ou d'authentification
      if (errorMessage.includes('JWT') || errorMessage.includes('expired') || 
          errorMessage.includes('Token') || error.response?.status === 401) {
        console.log('🚫 Token expiré ou invalide, redirection vers login');
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);