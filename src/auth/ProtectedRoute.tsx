import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { UserRole } from '../types/Auth';

// Utilitaires de rôle (version simplifiée)
export const roleUtils = {
  hasRole: (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
    return allowedRoles.includes(userRole);
  }
};

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  // Pendant le chargement, afficher un spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Si non authentifié, rediriger vers login
  if (!isAuthenticated) {
    console.log('🚫 Accès non autorisé - Redirection vers /login');
    return <Navigate to="/login" replace />;
  }

  // Vérifier les rôles si spécifiés
  if (roles && role && !roleUtils.hasRole(role, roles)) {
    console.log('🚫 Rôle insuffisant - Redirection vers /unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  // Si tout est bon, afficher le contenu
  console.log('✅ Accès autorisé au contenu protégé');
  return <>{children}</>;
};