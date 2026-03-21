// src/pages/UtilisateursPage.tsx
import React, { useState, useEffect } from 'react';
import { User, Edit, Trash2, Search, Filter, X, Check, Plus, Info, Key } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { utilisateurApi } from '../api/utilisateurApi';
import { directionApi } from '../api/directionApi';
import type { Utilisateur } from '../types/Utilisateur';
import { authApi } from '../api/authApi';
import type { RoleInfo } from '../types/Auth';

export const UtilisateursPage: React.FC = () => {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [directions, setDirections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtres, setFiltres] = useState({ role: '', actif: '' });
  const [showFiltres, setShowFiltres] = useState(false);
  const [roles, setRoles] = useState<RoleInfo[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<Utilisateur | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Utilisateur | null>(null);

  const [formData, setFormData] = useState({
    nom_utilisateur: '',
    prenom_utilisateur: '',
    email_utilisateur: '',
    role_utilisateur: '',
    sexe: '',
    telephone: '',
    bureau: '',
    id_direction: ''
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [showDirectionHelp, setShowDirectionHelp] = useState(false);

  useEffect(() => {
    loadUtilisateurs();
    loadRoles();
    loadDirections();
  }, []);

  const loadUtilisateurs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await utilisateurApi.getAllUtilisateurs();
      console.log('📋 Utilisateurs chargés:', data);
      setUtilisateurs(data);
    } catch (err: any) {
      setError(err.message || 'Erreur chargement');
      console.error('❌ Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const res = await authApi.getRoles();
      if (res.success) setRoles(res.roles);
    } catch (err) {
      setRoles([
        { code: 'ADMIN', description: 'Administrateur système' },
        { code: 'DG', description: 'Directeur Général' },
        { code: 'SECRETARIAT', description: 'Secrétariat' },
        { code: 'DIRECTION', description: 'Direction' },
        { code: 'DIVISION', description: 'Division' },
        { code: 'SERVICES', description: 'Services' }
      ]);
    }
  };

  const loadDirections = async () => {
    try {
      console.log('🔄 Chargement des directions...');
      const data = await directionApi.getAll();
      console.log('✅ Directions chargées:', data);
      setDirections(data);
    } catch (err) {
      console.error('❌ Erreur chargement directions:', err);
      setDirections([]);
    }
  };

  const filteredUtilisateurs = utilisateurs.filter(u => {
    const search = searchTerm.toLowerCase();
    return (
      search === '' ||
      (u.nom_utilisateur || '').toLowerCase().includes(search) ||
      (u.prenom_utilisateur || '').toLowerCase().includes(search) ||
      (u.email_utilisateur || '').toLowerCase().includes(search) ||
      (u.role_utilisateur || '').toLowerCase().includes(search)
    );
  }).filter(u => filtres.role === '' || u.role_utilisateur === filtres.role)
    .filter(u => filtres.actif === '' || u.actif === (filtres.actif === 'true'));

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      nom_utilisateur: '',
      prenom_utilisateur: '',
      email_utilisateur: '',
      role_utilisateur: '',
      sexe: '',
      telephone: '',
      bureau: '',
      id_direction: ''
    });
    setFormError(null);
  };

  // ✅ CRÉATION SANS MOT DE PASSE (le backend générera un mot de passe aléatoire)
  const handleCreate = async () => {
    setFormError(null);
    
    // Validations
    if (!formData.nom_utilisateur?.trim()) {
      setFormError('❌ Le nom est obligatoire');
      return;
    }
    
    if (!formData.prenom_utilisateur?.trim()) {
      setFormError('❌ Le prénom est obligatoire');
      return;
    }
    
    if (!formData.email_utilisateur?.trim()) {
      setFormError('❌ L\'email est obligatoire');
      return;
    }
    
    if (!formData.role_utilisateur) {
      setFormError('❌ Le rôle est obligatoire');
      return;
    }
    
    // Validation ID direction
    const directionId = parseInt(formData.id_direction, 10);
    if (!directionId || isNaN(directionId) || directionId <= 0) {
      setFormError('❌ Un ID de direction valide est obligatoire');
      return;
    }

    try {
      // ⚠️ FORMAT SNAKE_CASE - SANS mot de passe
      const dataToSend = {
        nom_utilisateur: formData.nom_utilisateur.trim(),
        prenom_utilisateur: formData.prenom_utilisateur.trim(),
        email_utilisateur: formData.email_utilisateur.trim(),
        role_utilisateur: formData.role_utilisateur,
        sexe: formData.sexe || null,
        telephone: formData.telephone || null,
        bureau: formData.bureau || null,
        direction: {
          id_direction: directionId
        }
      };
      
      console.log('📤 Envoi création (sans mot de passe):', dataToSend);
      
      const response = await utilisateurApi.creerUtilisateur(dataToSend);
      console.log('✅ Réponse:', response);
      
      // Succès
      setShowAddModal(false);
      resetForm();
      await loadUtilisateurs();
      
      // Message de succès
      alert('✅ Utilisateur créé avec succès ! Un email avec le mot de passe temporaire a été envoyé à l\'utilisateur.');
      
    } catch (err: any) {
      console.error('❌ Erreur création:', err);
      setFormError(err.message || 'Erreur lors de la création');
    }
  };

  // ✅ RÉINITIALISER LE MOT DE PASSE
  const handleResetPassword = async () => {
    if (!selectedUserForReset?.id_utilisateur) return;
    
    try {
      setLoading(true);
      const response = await utilisateurApi.reinitialiserMotDePasse(selectedUserForReset.id_utilisateur);
      console.log('✅ Mot de passe réinitialisé:', response);
      
      setResetPasswordResult(`✅ Mot de passe temporaire envoyé à ${selectedUserForReset.email_utilisateur}`);
      
      setTimeout(() => {
        setShowResetPasswordModal(false);
        setSelectedUserForReset(null);
        setResetPasswordResult(null);
      }, 3000);
      
    } catch (err: any) {
      console.error('❌ Erreur réinitialisation:', err);
      setError(err.message || 'Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  // ✅ MISE À JOUR
  const handleUpdate = async () => {
    if (!editingUser?.id_utilisateur) return;
    
    setFormError(null);
    
    // Validations
    if (!formData.email_utilisateur?.trim()) {
      setFormError("❌ L'email est obligatoire");
      return;
    }
    
    if (!formData.nom_utilisateur?.trim()) {
      setFormError("❌ Le nom est obligatoire");
      return;
    }
    
    if (!formData.prenom_utilisateur?.trim()) {
      setFormError("❌ Le prénom est obligatoire");
      return;
    }
    
    if (!formData.role_utilisateur) {
      setFormError("❌ Le rôle est obligatoire");
      return;
    }

    // Validation ID direction
    const directionId = parseInt(formData.id_direction, 10);
    if (!directionId || isNaN(directionId) || directionId <= 0) {
      setFormError('❌ Un ID de direction valide est obligatoire');
      return;
    }

    try {
      const dataToSend = {
        nom_utilisateur: formData.nom_utilisateur.trim(),
        prenom_utilisateur: formData.prenom_utilisateur.trim(),
        email_utilisateur: formData.email_utilisateur.trim(),
        role_utilisateur: formData.role_utilisateur,
        sexe: formData.sexe || null,
        telephone: formData.telephone || null,
        bureau: formData.bureau || null,
        actif: editingUser.actif,
        direction: {
          id_direction: directionId
        }
      };

      console.log('📤 Mise à jour:', dataToSend);
      
      await utilisateurApi.mettreAJourUtilisateur(editingUser.id_utilisateur, dataToSend);
      
      setShowEditModal(false);
      resetForm();
      await loadUtilisateurs();
      
    } catch (err: any) {
      console.error('❌ Erreur mise à jour:', err);
      setFormError(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const openEdit = async (user: Utilisateur) => {
    setEditingUser(user);
    
    if (directions.length === 0) {
      await loadDirections();
    }
    
    const userDirectionId = user.direction?.id_direction || user.direction?.idDirection || user.direction?.id;
    
    setFormData({
      nom_utilisateur: user.nom_utilisateur || '',
      prenom_utilisateur: user.prenom_utilisateur || '',
      email_utilisateur: user.email_utilisateur || '',
      role_utilisateur: user.role_utilisateur || '',
      sexe: user.sexe || '',
      telephone: user.telephone || '',
      bureau: user.bureau || '',
      id_direction: userDirectionId ? userDirectionId.toString() : ''
    });
    setShowEditModal(true);
  };

  const toggleStatus = async (user: Utilisateur) => {
    if (!user.id_utilisateur) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Changement de statut pour l'utilisateur ${user.id_utilisateur}...`);
      
      // Envoyer TOUTES les données de l'utilisateur, pas seulement actif
      await utilisateurApi.mettreAJourUtilisateur(user.id_utilisateur, {
        nom_utilisateur: user.nom_utilisateur,
        prenom_utilisateur: user.prenom_utilisateur,
        email_utilisateur: user.email_utilisateur,
        role_utilisateur: user.role_utilisateur,
        sexe: user.sexe,
        telephone: user.telephone,
        bureau: user.bureau,
        actif: !user.actif,
        direction: user.direction
      });
      
      console.log('✅ Statut modifié, rechargement de la liste...');
      await loadUtilisateurs();
      
    } catch (err: any) {
      console.error('❌ Erreur changement statut:', err);
      setError(err.message || 'Erreur lors du changement de statut');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🗑️ Tentative de suppression de l'utilisateur ${id}...`);
      await utilisateurApi.supprimerUtilisateur(id);
      
      console.log('✅ Utilisateur supprimé, rechargement de la liste...');
      await loadUtilisateurs();
      
    } catch (err: any) {
      console.error('❌ Erreur suppression:', err);
      
      const errorMessage = err.message || '';
      
      if (errorMessage.includes('clé étrangère') || errorMessage.includes('affectation')) {
        setError(
          '❌ Impossible de supprimer cet utilisateur car il est associé à des affectations de courriers. ' +
          'Vous pouvez le désactiver plutôt que de le supprimer.'
        );
      } else {
        setError(err.message || 'Erreur lors de la suppression');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && utilisateurs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pt-24 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* En-tête */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Gestion des Utilisateurs</h1>
                <p className="text-slate-400">Administration complète du personnel</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }} 
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
                <button 
                  onClick={() => setShowFiltres(!showFiltres)} 
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    showFiltres ? 'bg-purple-500 text-white' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filtres
                </button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Filtres */}
            {showFiltres && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Filtres</h3>
                  <button onClick={() => setShowFiltres(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select value={filtres.role} onChange={e => setFiltres({ ...filtres, role: e.target.value })} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                    <option value="">Tous les rôles</option>
                    {roles.map(r => (
                      <option key={r.code} value={r.code}>
                        {r.description}
                      </option>
                    ))}
                  </select>
                  <select value={filtres.actif} onChange={e => setFiltres({ ...filtres, actif: e.target.value })} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                    <option value="">Tous les statuts</option>
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                  </select>
                  <button onClick={() => setFiltres({ role: '', actif: '' })} className="px-4 py-2 text-slate-400 hover:text-white">
                    Réinitialiser
                  </button>
                </div>
              </div>
            )}

            {/* Messages d'erreur */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
                {error}
              </div>
            )}

            {/* Liste des utilisateurs */}
            {filteredUtilisateurs.length === 0 ? (
              <div className="text-center py-20">
                <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl text-white">Aucun utilisateur trouvé</h3>
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-slate-300 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs text-slate-300 uppercase">Nom Complet</th>
                      <th className="px-6 py-3 text-left text-xs text-slate-300 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs text-slate-300 uppercase">Rôle</th>
                      <th className="px-6 py-3 text-left text-xs text-slate-300 uppercase">Direction</th>
                      <th className="px-6 py-3 text-left text-xs text-slate-300 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs text-slate-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredUtilisateurs.map(u => (
                      <tr key={u.id_utilisateur} className="hover:bg-slate-700/30">
                        <td className="px-6 py-4 text-sm text-white">{u.id_utilisateur}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{u.nom_utilisateur || '—'}</p>
                              <p className="text-xs text-slate-400">{u.prenom_utilisateur || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-white">{u.email_utilisateur || '—'}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300">
                            {u.role_utilisateur || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {u.direction?.nomDirection || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${u.actif ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {u.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => openEdit(u)} 
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedUserForReset(u);
                                setShowResetPasswordModal(true);
                              }} 
                              className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded"
                              title="Réinitialiser le mot de passe"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => toggleStatus(u)} 
                              className={`p-2 ${u.actif ? 'text-red-400 hover:bg-red-500/20' : 'text-green-400 hover:bg-green-500/20'} rounded`}
                              title={u.actif ? 'Désactiver' : 'Activer'}
                            >
                              {u.actif ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => handleDelete(u.id_utilisateur)} 
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded"
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
        </main>
      </div>

      {/* Modale Ajouter - SANS CHAMP MOT DE PASSE */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 pt-20 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg my-8">
            <h3 className="text-xl font-bold text-white mb-6">Créer un utilisateur</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="nom_utilisateur"
                value={formData.nom_utilisateur}
                onChange={handleFormChange}
                placeholder="Nom *"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
                autoFocus
              />
              <input
                name="prenom_utilisateur"
                value={formData.prenom_utilisateur}
                onChange={handleFormChange}
                placeholder="Prénom *"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
              />
              <input
                name="email_utilisateur"
                value={formData.email_utilisateur}
                onChange={handleFormChange}
                placeholder="Email *"
                className="md:col-span-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
              />
              <select
                name="role_utilisateur"
                value={formData.role_utilisateur}
                onChange={handleFormChange}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Choisir un rôle *</option>
                {roles.map(r => (
                  <option key={r.code} value={r.code}>
                    {r.description}
                  </option>
                ))}
              </select>
              <select
                name="sexe"
                value={formData.sexe}
                onChange={handleFormChange}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Sexe</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
              <input
                name="telephone"
                value={formData.telephone}
                onChange={handleFormChange}
                placeholder="Téléphone"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
              />
              <input
                name="bureau"
                value={formData.bureau}
                onChange={handleFormChange}
                placeholder="Bureau"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
              />
              
              {/* CHAMP ID DIRECTION */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-300">
                    ID Direction *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDirectionHelp(!showDirectionHelp)}
                    className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
                  >
                    <Info className="w-4 h-4" />
                    Voir les directions
                  </button>
                </div>
                
                <input
                  name="id_direction"
                  type="number"
                  value={formData.id_direction}
                  onChange={handleFormChange}
                  placeholder="Ex: 1, 2, etc."
                  className={`w-full px-3 py-2 bg-slate-700 border ${
                    formError && !formData.id_direction ? 'border-red-500' : 'border-slate-600'
                  } rounded text-white focus:outline-none focus:border-purple-500`}
                  min="1"
                  required
                />
                
                {showDirectionHelp && (
                  <div className="mt-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <p className="text-sm text-slate-300 mb-3 font-medium">📋 Directions disponibles :</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {directions.map(d => (
                        <div key={d.id} className="flex items-center justify-between p-2 bg-slate-800/30 rounded hover:bg-slate-700/50">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs font-medium rounded min-w-[40px] text-center">
                              ID: {d.id}
                            </span>
                            <span className="text-sm text-white">{d.nom || d.nomDirection}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, id_direction: d.id.toString() }));
                              setShowDirectionHelp(false);
                            }}
                            className="px-3 py-1 text-xs bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded"
                          >
                            Utiliser
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {formError && (
              <p className="text-red-400 text-sm mt-4 text-center font-medium">{formError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreate}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Créer
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
            
            <p className="text-xs text-slate-500 text-center mt-4">
              ℹ️ Un email avec le mot de passe temporaire sera envoyé à l'utilisateur
            </p>
          </div>
        </div>
      )}

      {/* Modale Réinitialisation de mot de passe */}
      {showResetPasswordModal && selectedUserForReset && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 pt-20 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md my-8">
            <h3 className="text-xl font-bold text-white mb-4">Réinitialiser le mot de passe</h3>
            
            {resetPasswordResult ? (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
                <p className="text-green-400 text-center">{resetPasswordResult}</p>
              </div>
            ) : (
              <>
                <p className="text-slate-300 mb-6">
                  Voulez-vous réinitialiser le mot de passe de <span className="font-semibold text-white">{selectedUserForReset.prenom_utilisateur} {selectedUserForReset.nom_utilisateur}</span> ?
                </p>
                <p className="text-sm text-slate-400 mb-6">
                  Un nouveau mot de passe temporaire sera généré et envoyé par email à <span className="text-purple-400">{selectedUserForReset.email_utilisateur}</span>.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Traitement...' : 'Réinitialiser'}
                  </button>
                  <button
                    onClick={() => {
                      setShowResetPasswordModal(false);
                      setSelectedUserForReset(null);
                    }}
                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modale Modifier (inchangée) */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 pt-20 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg my-8">
            <h3 className="text-xl font-bold text-white mb-6">Modifier l'utilisateur</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="nom_utilisateur"
                value={formData.nom_utilisateur}
                onChange={handleFormChange}
                placeholder="Nom *"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
              />
              <input
                name="prenom_utilisateur"
                value={formData.prenom_utilisateur}
                onChange={handleFormChange}
                placeholder="Prénom *"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
              />
              <input
                name="email_utilisateur"
                value={formData.email_utilisateur}
                onChange={handleFormChange}
                placeholder="Email *"
                className="md:col-span-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
              />
              <select
                name="role_utilisateur"
                value={formData.role_utilisateur}
                onChange={handleFormChange}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Choisir un rôle *</option>
                {roles.map(r => (
                  <option key={r.code} value={r.code}>
                    {r.description}
                  </option>
                ))}
              </select>
              <select
                name="sexe"
                value={formData.sexe}
                onChange={handleFormChange}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Sexe</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
              <input
                name="telephone"
                value={formData.telephone}
                onChange={handleFormChange}
                placeholder="Téléphone"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
              />
              <input
                name="bureau"
                value={formData.bureau}
                onChange={handleFormChange}
                placeholder="Bureau"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
              />
              
              {/* CHAMP ID DIRECTION POUR ÉDITION */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-300">
                    ID Direction *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDirectionHelp(!showDirectionHelp)}
                    className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
                  >
                    <Info className="w-4 h-4" />
                    Voir les directions
                  </button>
                </div>
                
                <input
                  name="id_direction"
                  type="number"
                  value={formData.id_direction}
                  onChange={handleFormChange}
                  placeholder="Ex: 1, 2, etc."
                  className={`w-full px-3 py-2 bg-slate-700 border ${
                    formError && !formData.id_direction ? 'border-red-500' : 'border-slate-600'
                  } rounded text-white focus:outline-none focus:border-purple-500`}
                  min="1"
                  required
                />
                
                {showDirectionHelp && (
                  <div className="mt-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <p className="text-sm text-slate-300 mb-3 font-medium">📋 Directions disponibles :</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {directions.map(d => (
                        <div key={d.id} className="flex items-center justify-between p-2 bg-slate-800/30 rounded hover:bg-slate-700/50">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs font-medium rounded min-w-[40px] text-center">
                              ID: {d.id}
                            </span>
                            <span className="text-sm text-white">{d.nom || d.nomDirection}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, id_direction: d.id.toString() }));
                              setShowDirectionHelp(false);
                            }}
                            className="px-3 py-1 text-xs bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded"
                          >
                            Utiliser
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {formError && (
              <p className="text-red-400 text-sm mt-4 text-center font-medium">{formError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdate}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
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