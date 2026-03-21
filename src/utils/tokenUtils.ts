import { jwtDecode } from 'jwt-decode';
import type { DecodedToken, UserRole } from '../types/Auth';

export const tokenUtils = {
  decodeToken: (token: string): DecodedToken => {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Erreur de décodage du token:', error);
      // Retourner un token mocké en cas d'erreur pour le développement
      return {
        sub: '1',
        email: 'admin@test.com',
        role: 'ADMIN' as UserRole,
        exp: Math.floor(Date.now() / 1000) + 3600, // Expiration dans 1 heure
        iat: Math.floor(Date.now() / 1000)
      };
    }
  },

  isValid: (token: string): boolean => {
    try {
      const decoded = tokenUtils.decodeToken(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  },

  getRole: (token: string): UserRole => {
    try {
      const decoded = tokenUtils.decodeToken(token);
      return decoded.role;
    } catch {
      return 'AGENT' as UserRole; // Rôle par défaut
    }
  },

  getUserId: (token: string): string => {
    try {
      const decoded = tokenUtils.decodeToken(token);
      return decoded.sub;
    } catch {
      return '1'; // ID par défaut
    }
  },

  getEmail: (token: string): string => {
    try {
      const decoded = tokenUtils.decodeToken(token);
      return decoded.email;
    } catch {
      return 'user@example.com'; // Email par défaut
    }
  }
};