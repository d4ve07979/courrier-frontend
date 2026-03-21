import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { ArchivesPage } from '../pages/Archives';
import { DocumentsPage } from '../pages/Documents';
import { RapportsPage } from '../pages/Rapports';
import { ParametresPage } from '../pages/Parametres';
import { useAuth } from '../auth/useAuth';
import { CourriersPage } from '../pages/CourriersPage';
import { CourrierDetails } from '../pages/CourrierDetails';
import { NouveauCourrierPage } from '../pages/NouveauCourrierPage';
import { AdminUserManagement } from '../pages/AdminUserManagement';
import { UtilisateursPage } from '../pages/UtilisateursPage';
import { MaBoiteReception } from '../pages/MaBoiteReception';
import { NotificationsPage } from '../pages/NotificationsPage';
import { MesCourriersPage } from '../pages/MesCourriersPage'; // ← AJOUT DE L'IMPORT
import { ModifierCourrierPage } from '../pages/ModifierCourrierPage';
import { ChangePasswordPage } from '../pages/ChangePasswordPage';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Afficher un écran de chargement pendant la vérification de l'auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Routes publiques - Login et Inscription */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Routes protégées */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/notifications"
  element={
    <ProtectedRoute>
      <NotificationsPage />
    </ProtectedRoute>
  }
/>
        <Route
          path="/courriers"
          element={
            <ProtectedRoute>
              <CourriersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courriers/:id"
          element={
            <ProtectedRoute>
              <CourrierDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/archives"
          element={
            <ProtectedRoute>
              <ArchivesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <DocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nouveau-courrier"
          element={
            <ProtectedRoute>
              <NouveauCourrierPage />
            </ProtectedRoute>
          }
        />
        {/* ← NOUVELLE ROUTE AJOUTÉE */}
        <Route
          path="/mes-courriers"
          element={
            <ProtectedRoute>
              <MesCourriersPage />
            </ProtectedRoute>
          }
        />
        // Ajoutez cette route avec les autres routes protégées
        <Route
          path="/modifier-courrier/:id"
          element={
            <ProtectedRoute>
              <ModifierCourrierPage />
            </ProtectedRoute>
          }
        />

        // Ajoutez cette route avec les autres routes protégées
        <Route
          path="/changer-mot-de-passe"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rapports"
          element={
            <ProtectedRoute>
              <RapportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parametres"
          element={
            <ProtectedRoute>
              <ParametresPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UtilisateursPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ma-boite-reception"
          element={
            <ProtectedRoute>
              <MaBoiteReception />
            </ProtectedRoute>
          }
        />

        {/* Page non autorisée */}
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Accès non autorisé</h1>
                <p className="text-slate-400 mb-4">
                  Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                </p>
                <a
                  href="/dashboard"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  Retour au tableau de bord
                </a>
              </div>
            </div>
          }
        />

        {/* Redirection par défaut */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </Router>
  );
};