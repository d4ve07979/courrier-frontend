
import React, { useState, useEffect } from 'react'; 
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextType } from './AuthContext';
import { authApi } from '../api/authApi';
import { tokenUtils } from '../utils/tokenUtils';
import type { Utilisateur } from '../types/Utilisateur';
import type { UserRole } from '../types/Auth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          if (tokenUtils.isValid(storedToken)) {
            const decoded = tokenUtils.decodeToken(storedToken);
            setRole(decoded.role);
            
            // Création d'un utilisateur à partir du token
            // Note: Votre JWT doit contenir nom, prenom dans le payload
            setUser({
              id: parseInt(decoded.sub) || 1,
              email: decoded.email,
              nom: decoded.nom || 'Utilisateur',
              prenom: decoded.prenom || 'Connecté',
              role: decoded.role
            });
            
            setToken(storedToken);
          } else {
            // Token invalide
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setRole(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (newToken: string) => {
    try {
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      const decoded = tokenUtils.decodeToken(newToken);
      setRole(decoded.role);

      // Création de l'utilisateur à partir du token
      setUser({
        id: parseInt(decoded.sub) || Date.now(),
        email: decoded.email,
        nom: decoded.nom || 'Utilisateur',
        prenom: decoded.prenom || 'Connecté',
        role: decoded.role
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    authApi.logout().catch(console.error);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const value: AuthContextType = {
    user,
    token,
    role,
    isAuthenticated: !!token, // Simplifié - seul le token suffit
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};