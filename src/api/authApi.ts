// src/api/authApi.ts
import axiosInstance from './axiosConfig';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RefreshTokenRequest, 
  ChangePasswordRequest, 
  RoleInfo 
} from '../types/Auth';

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/api/auth/login', credentials);
      
      if (response.data.success && response.data.access_token) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        localStorage.setItem('access_token', response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
        localStorage.setItem('user', JSON.stringify(response.data.utilisateur));
      }
      
      return response.data;
    } catch (error: any) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      let errorMessage = 'Erreur de connexion';
      if (error.response?.status === 401) errorMessage = 'Identifiants incorrects.';
      else if (error.response?.status === 403) errorMessage = 'Compte verrouillé ou désactivé.';
      else if (error.code === 'ERR_NETWORK') errorMessage = 'Serveur inaccessible.';
      else if (error.response?.data?.message) errorMessage = error.response.data.message;
      
      throw new Error(errorMessage);
    }
  },

  async register(userData: RegisterRequest): Promise<{ success: boolean; message: string; utilisateur?: any }> {
    try {
      const requestData = {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        motDePasse: userData.motDePasse
      };
      const response = await axiosInstance.post('/api/auth/register', requestData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  },

  async refreshToken(refreshToken: string): Promise<{ success: boolean; access_token: string }> {
    try {
      const response = await axiosInstance.post('/api/auth/refresh', { refreshToken });
      if (response.data.success) {
        localStorage.setItem('access_token', response.data.access_token);
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur rafraîchissement token');
    }
  },

  // src/api/authApi.ts
// src/api/authApi.ts - Méthode changePassword corrigée
async changePassword(passwordData: { 
  ancienMotDePasse: string; 
  nouveauMotDePasse: string; 
  confirmationMotDePasse: string 
}): Promise<{ success: boolean; message: string }> {
  try {
    console.log('📤 Envoi changement mot de passe:', passwordData);
    const response = await axiosInstance.post('/api/auth/change-password', passwordData);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur changement mot de passe:', error);
    
    let errorMessage = 'Erreur lors du changement de mot de passe';
    if (error.response?.status === 400) {
      errorMessage = error.response.data?.message || 'Mot de passe actuel incorrect ou nouveau mot de passe invalide';
    } else if (error.response?.status === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.';
    }
    
    throw new Error(errorMessage);
  }
},

  // ON RETOURNE DIRECTEMENT LES RÔLES CODÉS EN DUR (pas d'appel API)
  async getRoles(): Promise<{ success: boolean; roles: RoleInfo[] }> {
    return {
      success: true,
      roles: [
        { code: 'ADMIN', authority: 'ROLE_ADMIN', description: 'Administrateur système' },
        { code: 'DG', authority: 'ROLE_DG', description: 'Directeur Général' },
        { code: 'SECRETARIAT', authority: 'ROLE_SECRETARIAT', description: 'Secrétariat' },
        { code: 'DIRECTION', authority: 'ROLE_DIRECTION', description: 'Direction' },
        { code: 'DIVISION', authority: 'ROLE_DIVISION', description: 'Division' },
        { code: 'SERVICES', authority: 'ROLE_SERVICES', description: 'Services' }
      ]
    };
  },

  async checkHealth(): Promise<boolean> {
    try {
      await axiosInstance.get('/actuator/health', { timeout: 3000 });
      return true;
    } catch {
      try {
        await axiosInstance.get('/', { timeout: 3000 });
        return true;
      } catch {
        return false;
      }
    }
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch {
      console.warn('Logout API non disponible');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }
};