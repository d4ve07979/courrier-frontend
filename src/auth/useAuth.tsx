import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/authApi';
import type { UserRole, LoginRequest, AuthResponse } from '../types/Auth';

interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user');
        
        if (accessToken && savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser({
              id: userData.id || userData.id_utilisateur,
              email: userData.email || userData.email_utilisateur,
              nom: userData.nom || userData.nom_utilisateur,
              prenom: userData.prenom || userData.prenom_utilisateur,
              role: userData.role || userData.role_utilisateur
            });
          } catch (parseError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      setLoading(true);
      
      const response = await authApi.login(credentials);
      
      if (response.success && response.access_token) {
        const userData: User = {
          id: response.utilisateur.id,
          email: response.utilisateur.email,
          nom: response.utilisateur.nom,
          prenom: response.utilisateur.prenom,
          role: response.utilisateur.role
        };

        // S'assurer que les données sont bien stockées avant de mettre à jour l'état
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.utilisateur));
        
        // Attendre un peu pour s'assurer que localStorage est mis à jour
        await new Promise(resolve => setTimeout(resolve, 50));
        
        setUser(userData);
        console.log('✅ Connexion réussie, utilisateur:', userData.email);
        console.log('💾 Données stockées:', {
          hasToken: !!localStorage.getItem('access_token'),
          hasUser: !!localStorage.getItem('user')
        });
      }
      
      return response;
      
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        throw new Error('Aucun refresh token disponible');
      }

      const response = await authApi.refreshToken(refreshTokenValue);
      
      if (response.success) {
        console.log('✅ Token rafraîchi avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement du token:', error);
      logout();
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Déconnexion de l\'utilisateur');
      await authApi.logout();
    } catch (error) {
      console.warn('Erreur lors de la déconnexion API:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const value: AuthContextType = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user && !!localStorage.getItem('access_token'),
    login,
    logout,
    loading,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};