
import type { UserRole } from '../types/Auth';

export const roleUtils = {
  hasRole: (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
    return allowedRoles.includes(userRole);
  },

  isAdmin: (role: UserRole): boolean => {
    return role === 'ADMIN';
  },

  isDirecteur: (role: UserRole): boolean => {
    return role === 'DIRECTEUR';
  },

  isSecretaire: (role: UserRole): boolean => {
    return role === 'SECRETAIRE';
  },

  canAffecter: (role: UserRole): boolean => {
    return role === 'ADMIN' || role === 'DIRECTEUR';
  },

  canArchive: (role: UserRole): boolean => {
    return role === 'ADMIN' || role === 'SECRETAIRE';
  },

  getRoleLabel: (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      ADMIN: 'Administrateur',
      DIRECTEUR: 'Directeur Général',
      SECRETAIRE: 'Secrétaire',
      AGENT: 'Agent',
    };
    return labels[role];
  },

  getRoleColor: (role: UserRole): string => {
    const colors: Record<UserRole, string> = {
      ADMIN: 'red',
      DIRECTEUR: 'purple',
      SECRETAIRE: 'blue',
      AGENT: 'green',
    };
    return colors[role];
  },
};
