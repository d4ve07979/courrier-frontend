// src/pages/ParametresPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Settings, Users, Plus, Edit, Trash2, User, 
  Bell, Mail, Moon, Sun, Monitor, Lock, Key,
  Save, X, Eye, EyeOff, RefreshCw, Shield,
  Globe, Clock, Database, Download, Upload
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../auth/useAuth';
import { utilisateurApi } from '../api/utilisateurApi';
import { authApi } from '../api/authApi';
import { notificationApi } from '../api/notificationApi';
import type { Utilisateur, UtilisateurCreateDTO } from '../types/Utilisateur';
import type { RoleInfo } from '../types/Auth';

// Types pour les préférences
interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  notifications: {
    push: boolean;
    email: boolean;
    desktop: boolean;
    sound: boolean;
  };
  language: 'fr' | 'en';
  timezone: string;
  itemsPerPage: number;
}

export const ParametresPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('section') || 'profil';
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ============================================================
  // 1. PROFIL UTILISATEUR
  // ============================================================
  const [profilData, setProfilData] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    bureau: user?.bureau || '',
    sexe: user?.sexe || '',
  });

  // ============================================================
  // 2. SÉCURITÉ - CHANGEMENT DE MOT DE PASSE
  // ============================================================
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  // ============================================================
  // 3. PRÉFÉRENCES
  // ============================================================
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('user-preferences');
    return saved ? JSON.parse(saved) : {
      theme: 'dark',
      notifications: {
        push: true,
        email: true,
        desktop: false,
        sound: true
      },
      language: 'fr',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      itemsPerPage: 20
    };
  });

  // ============================================================
  // 4. GESTION DES UTILISATEURS (ADMIN)
  // ============================================================
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Utilisateur | null>(null);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [userFormData, setUserFormData] = useState<UtilisateurCreateDTO>({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    role: 'SERVICES',
    telephone: '',
    bureau: '',
    sexe: ''
  });
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<Utilisateur | null>(null);

  // ============================================================
  // 5. STATISTIQUES & JOURNAUX (ADMIN)
  // ============================================================
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourriers: 0,
    lastBackup: null as string | null,
    databaseSize: ''
  });

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  useEffect(() => {
    if (user?.role === 'ADMIN' && activeSection === 'utilisateurs') {
      loadUtilisateurs();
      loadRoles();
    }
    if (activeSection === 'statistiques' && user?.role === 'ADMIN') {
      loadSystemStats();
    }
  }, [user, activeSection]);

  const loadRoles = async () => {
    try {
      const response = await authApi.getRoles();
      if (response.success) {
        setRoles(response.roles);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error);
    }
  };

  const loadUtilisateurs = async () => {
    try {
      setLoadingUsers(true);
      const data = await utilisateurApi.getAllUtilisateurs();
      setUtilisateurs(data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      showNotification('error', 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadSystemStats = async () => {
    // Simulation - à remplacer par de vraies données API
    setSystemStats({
      totalUsers: utilisateurs.length,
      activeUsers: utilisateurs.filter(u => u.actif).length,
      totalCourriers: 156,
      lastBackup: new Date().toISOString(),
      databaseSize: '24.5 MB'
    });
  };

  // ============================================================
  // GESTIONNAIRES
  // ============================================================

  const showNotification = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  // Sauvegarde du profil
  const handleSaveProfil = async () => {
    try {
      setSaveStatus('saving');
      setErrorMessage(null);
      
      // Appel API pour mettre à jour le profil
      await utilisateurApi.mettreAJourUtilisateur(user?.id!, profilData);
      
      setSaveStatus('success');
      showNotification('success', 'Profil mis à jour avec succès');
      
      // Mettre à jour le localStorage
      const updatedUser = { ...user, ...profilData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
    } catch (error: any) {
      setSaveStatus('error');
      showNotification('error', error.message || 'Erreur lors de la mise à jour');
    } finally {
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Changement de mot de passe
  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showNotification('error', 'Tous les champs sont obligatoires');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('error', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordStrength < 3) {
      showNotification('error', 'Le mot de passe est trop faible');
      return;
    }

    try {
      setSaveStatus('saving');
      await authApi.changePassword({
        ancienMotDePasse: passwordData.currentPassword,
        nouveauMotDePasse: passwordData.newPassword,
        confirmationMotDePasse: passwordData.confirmPassword
      });
      
      showNotification('success', 'Mot de passe modifié avec succès');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
    } catch (error: any) {
      showNotification('error', error.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setSaveStatus('idle');
    }
  };

  // Sauvegarde des préférences
  const handleSavePreferences = () => {
    localStorage.setItem('user-preferences', JSON.stringify(preferences));
    
    // Appliquer le thème
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (preferences.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    showNotification('success', 'Préférences sauvegardées');
  };

  // Évaluation de la force du mot de passe
  const evaluatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  // Gestion des utilisateurs
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaveStatus('saving');
      await utilisateurApi.creerUtilisateur(userFormData);
      setShowUserForm(false);
      setUserFormData({
        nom: '', prenom: '', email: '', motDePasse: '', role: 'SERVICES',
        telephone: '', bureau: '', sexe: ''
      });
      await loadUtilisateurs();
      showNotification('success', 'Utilisateur créé avec succès');
    } catch (error: any) {
      showNotification('error', error.message || 'Erreur lors de la création');
    } finally {
      setSaveStatus('idle');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await utilisateurApi.supprimerUtilisateur(id);
        await loadUtilisateurs();
        showNotification('success', 'Utilisateur supprimé');
      } catch (error: any) {
        showNotification('error', error.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUserForReset) return;
    try {
      await utilisateurApi.reinitialiserMotDePasse(selectedUserForReset.id_utilisateur);
      showNotification('success', `Mot de passe réinitialisé et envoyé à ${selectedUserForReset.email_utilisateur}`);
      setShowResetPasswordModal(false);
      setSelectedUserForReset(null);
    } catch (error: any) {
      showNotification('error', error.message || 'Erreur lors de la réinitialisation');
    }
  };

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8 pt-24">
          <div className="max-w-4xl mx-auto">
            {/* En-tête */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-8 h-8 text-purple-400" />
                <h1 className="text-3xl font-bold text-white">Paramètres</h1>
              </div>
              <p className="text-slate-400">Configurez votre application et vos préférences</p>
            </div>

            {/* Messages de notification */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-center">{successMessage}</p>
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-center">{errorMessage}</p>
              </div>
            )}

            {/* Navigation des sections */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveSection('profil')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeSection === 'profil'
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                Profil
              </button>
              
              <button
                onClick={() => setActiveSection('securite')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeSection === 'securite'
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                Sécurité
              </button>
              
              <button
                onClick={() => setActiveSection('preferences')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeSection === 'preferences'
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4" />
                Préférences
              </button>
              
              {user?.role === 'ADMIN' && (
                <>
                  <button
                    onClick={() => setActiveSection('utilisateurs')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      activeSection === 'utilisateurs'
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Utilisateurs
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('statistiques')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      activeSection === 'statistiques'
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    Système
                  </button>
                </>
              )}
            </div>

            {/* Contenu des sections */}
            <div className="space-y-6">
              {/* SECTION PROFIL */}
              {activeSection === 'profil' && (
                <>
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-400" />
                      Informations personnelles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 text-sm mb-2">Prénom</label>
                        <input
                          type="text"
                          value={profilData.prenom}
                          onChange={(e) => setProfilData({ ...profilData, prenom: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-sm mb-2">Nom</label>
                        <input
                          type="text"
                          value={profilData.nom}
                          onChange={(e) => setProfilData({ ...profilData, nom: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-sm mb-2">Email</label>
                        <input
                          type="email"
                          value={profilData.email}
                          onChange={(e) => setProfilData({ ...profilData, email: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-sm mb-2">Téléphone</label>
                        <input
                          type="tel"
                          value={profilData.telephone}
                          onChange={(e) => setProfilData({ ...profilData, telephone: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-sm mb-2">Bureau</label>
                        <input
                          type="text"
                          value={profilData.bureau}
                          onChange={(e) => setProfilData({ ...profilData, bureau: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-sm mb-2">Sexe</label>
                        <select
                          value={profilData.sexe}
                          onChange={(e) => setProfilData({ ...profilData, sexe: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="">Non spécifié</option>
                          <option value="M">Masculin</option>
                          <option value="F">Féminin</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfil}
                    disabled={saveStatus === 'saving'}
                    className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-800 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {saveStatus === 'saving' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </>
              )}

              {/* SECTION SÉCURITÉ */}
              {activeSection === 'securite' && (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-400" />
                    Changer le mot de passe
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Mot de passe actuel */}
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Mot de passe actuel</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPasswords.current ? 
                            <EyeOff className="w-4 h-4 text-slate-400" /> : 
                            <Eye className="w-4 h-4 text-slate-400" />
                          }
                        </button>
                      </div>
                    </div>

                    {/* Nouveau mot de passe */}
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Nouveau mot de passe</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => {
                            setPasswordData({ ...passwordData, newPassword: e.target.value });
                            evaluatePasswordStrength(e.target.value);
                          }}
                          className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPasswords.new ? 
                            <EyeOff className="w-4 h-4 text-slate-400" /> : 
                            <Eye className="w-4 h-4 text-slate-400" />
                          }
                        </button>
                      </div>
                      
                      {/* Indicateur de force */}
                      {passwordData.newPassword && (
                        <div className="mt-2">
                          <div className="flex gap-1 h-1">
                            {[1,2,3,4,5].map((i) => (
                              <div
                                key={i}
                                className={`flex-1 rounded-full transition-colors ${
                                  i <= passwordStrength 
                                    ? i <= 2 ? 'bg-red-500' 
                                    : i <= 4 ? 'bg-yellow-500' 
                                    : 'bg-green-500'
                                    : 'bg-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {passwordStrength <= 2 ? 'Faible' : 
                             passwordStrength <= 4 ? 'Moyen' : 'Fort'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirmation */}
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Confirmer le mot de passe</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPasswords.confirm ? 
                            <EyeOff className="w-4 h-4 text-slate-400" /> : 
                            <Eye className="w-4 h-4 text-slate-400" />
                          }
                        </button>
                      </div>
                      {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="text-red-400 text-xs mt-1">Les mots de passe ne correspondent pas</p>
                      )}
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={saveStatus === 'saving'}
                      className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-800 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {saveStatus === 'saving' ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Key className="w-4 h-4" />
                      )}
                      Changer le mot de passe
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION PRÉFÉRENCES */}
              {activeSection === 'preferences' && (
                <div className="space-y-6">
                  {/* Thème */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Moon className="w-5 h-5 text-purple-400" />
                      Apparence
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                        className={`p-4 bg-slate-700 border-2 rounded-lg transition-colors ${
                          preferences.theme === 'dark' ? 'border-purple-500' : 'border-slate-600 hover:border-purple-500'
                        }`}
                      >
                        <div className="w-full h-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded mb-2"></div>
                        <p className="text-white text-sm flex items-center justify-center gap-1">
                          <Moon className="w-4 h-4" /> Sombre
                        </p>
                      </button>
                      <button
                        onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                        className={`p-4 bg-slate-700 border-2 rounded-lg transition-colors ${
                          preferences.theme === 'light' ? 'border-purple-500' : 'border-slate-600 hover:border-purple-500'
                        }`}
                      >
                        <div className="w-full h-16 bg-gradient-to-br from-white to-slate-200 rounded mb-2"></div>
                        <p className="text-white text-sm flex items-center justify-center gap-1">
                          <Sun className="w-4 h-4" /> Clair
                        </p>
                      </button>
                      <button
                        onClick={() => setPreferences({ ...preferences, theme: 'system' })}
                        className={`p-4 bg-slate-700 border-2 rounded-lg transition-colors ${
                          preferences.theme === 'system' ? 'border-purple-500' : 'border-slate-600 hover:border-purple-500'
                        }`}
                      >
                        <div className="w-full h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded mb-2"></div>
                        <p className="text-white text-sm flex items-center justify-center gap-1">
                          <Monitor className="w-4 h-4" /> Système
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-purple-400" />
                      Notifications
                    </h2>
                    <div className="space-y-4">
                      {[
                        { key: 'push', label: 'Notifications push', desc: 'Recevoir des notifications en temps réel', icon: Bell },
                        { key: 'email', label: 'Notifications email', desc: 'Recevoir des résumés par email', icon: Mail },
                        { key: 'desktop', label: 'Notifications bureau', desc: 'Afficher des notifications sur le bureau', icon: Monitor },
                        { key: 'sound', label: 'Son', desc: 'Jouer un son lors des notifications', icon: Bell }
                      ].map(({ key, label, desc, icon: Icon }) => (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <Icon className="w-5 h-5 text-purple-400 mt-1" />
                            <div>
                              <p className="text-white">{label}</p>
                              <p className="text-slate-400 text-sm">{desc}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setPreferences({
                              ...preferences,
                              notifications: {
                                ...preferences.notifications,
                                [key]: !preferences.notifications[key as keyof typeof preferences.notifications]
                              }
                            })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              preferences.notifications[key as keyof typeof preferences.notifications] 
                                ? 'bg-purple-500' 
                                : 'bg-slate-600'
                            }`}
                          >
                            <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                              preferences.notifications[key as keyof typeof preferences.notifications] 
                                ? 'translate-x-6' 
                                : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Langue et régional */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-400" />
                      Langue et régional
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 text-sm mb-2">Langue</label>
                        <select
                          value={preferences.language}
                          onChange={(e) => setPreferences({ ...preferences, language: e.target.value as 'fr' | 'en' })}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 text-sm mb-2">Fuseau horaire</label>
                        <select
                          value={preferences.timezone}
                          onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="Africa/Lome">Afrique/Lomé (GMT+0)</option>
                          <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 text-sm mb-2">Éléments par page</label>
                        <select
                          value={preferences.itemsPerPage}
                          onChange={(e) => setPreferences({ ...preferences, itemsPerPage: Number(e.target.value) })}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSavePreferences}
                    className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder les préférences
                  </button>
                </div>
              )}

              {/* SECTION UTILISATEURS (ADMIN) */}
              {activeSection === 'utilisateurs' && user?.role === 'ADMIN' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      Gestion des utilisateurs
                    </h2>
                    <button
                      onClick={() => setShowUserForm(true)}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter
                    </button>
                  </div>

                  {/* Liste des utilisateurs */}
                  {loadingUsers ? (
                    <div className="text-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
                      <p className="text-slate-400 mt-2">Chargement...</p>
                    </div>
                  ) : utilisateurs.length === 0 ? (
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center">
                      <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Aucun utilisateur</h3>
                      <p className="text-slate-400 mb-4">Commencez par ajouter votre premier utilisateur</p>
                      <button
                        onClick={() => setShowUserForm(true)}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter un utilisateur
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-slate-700/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs text-slate-300 uppercase">Utilisateur</th>
                            <th className="px-6 py-3 text-left text-xs text-slate-300 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs text-slate-300 uppercase">Rôle</th>
                            <th className="px-6 py-3 text-left text-xs text-slate-300 uppercase">Statut</th>
                            <th className="px-6 py-3 text-right text-xs text-slate-300 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {utilisateurs.map((u) => (
                            <tr key={u.id_utilisateur} className="hover:bg-slate-700/30">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-purple-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">
                                      {u.prenom_utilisateur} {u.nom_utilisateur}
                                    </p>
                                    <p className="text-xs text-slate-500">ID: {u.id_utilisateur}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-white">{u.email_utilisateur}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role_utilisateur)}`}>
                                  {getRoleLabel(u.role_utilisateur)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  u.actif ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {u.actif ? 'Actif' : 'Inactif'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingUser(u);
                                      setShowUserForm(true);
                                    }}
                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                    title="Modifier"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUserForReset(u);
                                      setShowResetPasswordModal(true);
                                    }}
                                    className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                    title="Réinitialiser mot de passe"
                                  >
                                    <Key className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id_utilisateur)}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION STATISTIQUES (ADMIN) */}
              {activeSection === 'statistiques' && user?.role === 'ADMIN' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Database className="w-5 h-5 text-purple-400" />
                      Base de données
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-slate-400">Taille</span>
                        <span className="text-white font-medium">{systemStats.databaseSize}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-slate-400">Dernier backup</span>
                        <span className="text-white font-medium">
                          {systemStats.lastBackup ? new Date(systemStats.lastBackup).toLocaleString('fr-FR') : 'Jamais'}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" />
                          Backup
                        </button>
                        <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4" />
                          Restaurer
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      Utilisateurs
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-slate-400">Total</span>
                        <span className="text-white font-medium">{systemStats.totalUsers}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-slate-400">Actifs</span>
                        <span className="text-white font-medium">{systemStats.activeUsers}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-slate-400">Inactifs</span>
                        <span className="text-white font-medium">{systemStats.totalUsers - systemStats.activeUsers}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-purple-400" />
                      Courriers
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-slate-400">Total</span>
                        <span className="text-white font-medium">{systemStats.totalCourriers}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-400" />
                      Sécurité
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-slate-400">Comptes verrouillés</span>
                        <span className="text-white font-medium">0</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-slate-400">Tentatives échouées</span>
                        <span className="text-white font-medium">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Ajout/Modification Utilisateur */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">
              {editingUser ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
            </h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Prénom</label>
                  <input
                    type="text"
                    value={userFormData.prenom}
                    onChange={(e) => setUserFormData({ ...userFormData, prenom: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Nom</label>
                  <input
                    type="text"
                    value={userFormData.nom}
                    onChange={(e) => setUserFormData({ ...userFormData, nom: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Mot de passe temporaire</label>
                  <input
                    type="password"
                    value={userFormData.motDePasse}
                    onChange={(e) => setUserFormData({ ...userFormData, motDePasse: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required={!editingUser}
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 text-sm mb-2">Rôle</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                >
                  {roles.map((role) => (
                    <option key={role.code} value={role.code}>
                      {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={userFormData.telephone}
                  onChange={(e) => setUserFormData({ ...userFormData, telephone: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Bureau</label>
                <input
                  type="text"
                  value={userFormData.bureau}
                  onChange={(e) => setUserFormData({ ...userFormData, bureau: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Sexe</label>
                <select
                  value={userFormData.sexe}
                  onChange={(e) => setUserFormData({ ...userFormData, sexe: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Non spécifié</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="flex-1 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {editingUser ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
                    setUserFormData({
                      nom: '', prenom: '', email: '', motDePasse: '',
                      role: 'SERVICES', telephone: '', bureau: '', sexe: ''
                    });
                  }}
                  className="flex-1 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Réinitialisation de mot de passe */}
      {showResetPasswordModal && selectedUserForReset && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Réinitialiser le mot de passe</h3>
            <p className="text-slate-300 mb-6">
              Voulez-vous réinitialiser le mot de passe de <span className="font-semibold text-white">
                {selectedUserForReset.prenom_utilisateur} {selectedUserForReset.nom_utilisateur}
              </span> ?
            </p>
            <p className="text-sm text-slate-400 mb-6">
              Un nouveau mot de passe temporaire sera généré et envoyé par email à <span className="text-purple-400">
                {selectedUserForReset.email_utilisateur}
              </span>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleResetPassword}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setSelectedUserForReset(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};