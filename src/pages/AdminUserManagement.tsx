import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Plus, Edit, Trash2, Save, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { utilisateurApi } from '../api/utilisateurApi';
import type { RegisterRequest, UserRole } from '../types/Auth';
import { useAuth } from '../auth/useAuth';

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  actif: boolean;
}

export const AdminUserManagement: React.FC = () => {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulaire d'ajout/modification d'utilisateur
  const [formData, setFormData] = useState<RegisterRequest>({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    role: 'SERVICES'
  });

  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();

  // Charger la liste des utilisateurs
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      chargerUtilisateurs();
    }
  }, [user]);

  const chargerUtilisateurs = async () => {
    try {
      setLoading(true);
      // Pour le moment, on simule la liste des utilisateurs
      // En réalité, cette méthode devrait être implémentée dans l'API backend
      const mockUsers: Utilisateur[] = [
        { id: 1, nom: 'Admin', prenom: 'System', email: 'admin@system.com', role: 'ADMIN', actif: true },
        { id: 2, nom: 'Doe', prenom: 'John', email: 'john.doe@example.com', role: 'DG', actif: true },
        { id: 3, nom: 'Smith', prenom: 'Jane', email: 'jane.smith@example.com', role: 'DIRECTION', actif: true }
      ];
      setUtilisateurs(mockUsers);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des utilisateurs');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role' ? value as UserRole : value
    }));
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      motDePasse: '',
      role: 'SERVICES'
    });
    setIsEditing(false);
    setCurrentUserId(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  const validateForm = (): string | null => {
    if (!formData.nom.trim()) {
      return 'Le nom est requis';
    }
    if (formData.nom.trim().length < 2) {
      return 'Le nom doit contenir au moins 2 caractères';
    }
    if (formData.nom.trim().length > 50) {
      return 'Le nom ne doit pas dépasser 50 caractères';
    }
    
    if (!formData.prenom.trim()) {
      return 'Le prénom est requis';
    }
    if (formData.prenom.trim().length < 2) {
      return 'Le prénom doit contenir au moins 2 caractères';
    }
    if (formData.prenom.trim().length > 75) {
      return 'Le prénom ne doit pas dépasser 75 caractères';
    }
    
    if (!formData.email.trim()) {
      return 'L\'email est requis';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'L\'email est invalide';
    }
    
    if (!isEditing && !formData.motDePasse) {
      return 'Le mot de passe est requis';
    }
    
    if (!isEditing && formData.motDePasse.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (!isEditing && !/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/.test(formData.motDePasse)) {
      return 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial';
    }
    
    if (!formData.role) {
      return 'Le rôle est requis';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (isEditing && currentUserId) {
        // Mise à jour d'un utilisateur existant
        // Cela nécessite un endpoint backend spécifique
        console.log('Mise à jour de l\'utilisateur', { id: currentUserId, ...formData });
        // Pour l'instant, on simule l'opération
        const updatedUsers = utilisateurs.map(user => 
          user.id === currentUserId 
            ? { ...user, nom: formData.nom, prenom: formData.prenom, email: formData.email, role: formData.role as UserRole } 
            : user
        );
        setUtilisateurs(updatedUsers);
        setSuccess('Utilisateur mis à jour avec succès');
      } else {
        // Création d'un nouvel utilisateur
        await utilisateurApi.creerUtilisateur(formData);
        setSuccess('Utilisateur créé avec succès');
        
        // Recharger la liste des utilisateurs
        chargerUtilisateurs();
      }
      
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde de l\'utilisateur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (utilisateur: Utilisateur) => {
    setFormData({
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      motDePasse: '', // On ne pré-remplit pas le mot de passe pour des raisons de sécurité
      role: utilisateur.role
    });
    setIsEditing(true);
    setCurrentUserId(utilisateur.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    
    try {
      setLoading(true);
      // Suppression de l'utilisateur
      // Cela nécessite un endpoint backend spécifique
      await utilisateurApi.supprimerUtilisateur(id);
      setSuccess('Utilisateur supprimé avec succès');
      
      // Recharger la liste des utilisateurs
      const updatedUsers = utilisateurs.filter(user => user.id !== id);
      setUtilisateurs(updatedUsers);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de l\'utilisateur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Accès refusé</h2>
          <p className="text-slate-400">Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Gestion des utilisateurs</h1>
          <p className="text-slate-400">Gérer les comptes utilisateurs du système</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {/* Bouton pour afficher le formulaire d'ajout */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all"
          >
            <Plus className="w-5 h-5" />
            Ajouter un utilisateur
          </button>
        </div>

        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 mb-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                {isEditing ? 'Modifier l\'utilisateur' : 'Ajouter un nouvel utilisateur'}
              </h2>
              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom */}
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-slate-300 mb-2">
                  Nom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="Nom de famille"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Prénom */}
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-slate-300 mb-2">
                  Prénom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="Prénom"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="email@exemple.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {!isEditing && (
                /* Mot de passe - seulement pour la création */
                <div>
                  <label htmlFor="motDePasse" className="block text-sm font-medium text-slate-300 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="motDePasse"
                      name="motDePasse"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.motDePasse}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="Mot de passe"
                      required={!isEditing}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
                  </p>
                </div>
              )}

              {/* Rôle */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                  Rôle
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  disabled={loading}
                >
                  <option value="SERVICES">Services</option>
                  <option value="DIVISION">Division</option>
                  <option value="DIRECTION">Direction</option>
                  <option value="SECRETARIAT">Secrétariat</option>
                  <option value="DG">Directeur Général</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>

              {/* Boutons de soumission */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isEditing ? 'Mettre à jour' : 'Créer l\'utilisateur'}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="py-3 px-6 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des utilisateurs */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Liste des utilisateurs</h2>
          
          {loading && utilisateurs.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-3 px-4 text-left text-slate-300 font-medium">Nom</th>
                    <th className="py-3 px-4 text-left text-slate-300 font-medium">Email</th>
                    <th className="py-3 px-4 text-left text-slate-300 font-medium">Rôle</th>
                    <th className="py-3 px-4 text-left text-slate-300 font-medium">Statut</th>
                    <th className="py-3 px-4 text-right text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {utilisateurs.map((utilisateur) => (
                    <tr key={utilisateur.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{utilisateur.nom} {utilisateur.prenom}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{utilisateur.email}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                          {utilisateur.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          utilisateur.actif ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {utilisateur.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(utilisateur)}
                            className="p-2 text-slate-400 hover:text-purple-400 rounded-lg hover:bg-purple-500/10 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(utilisateur.id)}
                            className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {utilisateurs.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  Aucun utilisateur trouvé
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};