import React, { useState, useEffect } from 'react';
import { User, Mail, Building, UserCheck, Edit, Trash2, Search, Filter, X, Check, X as CloseIcon } from 'lucide-react';
import { utilisateurApi } from '../../api/utilisateurApi';
import type { Utilisateur } from '../../types/Utilisateur';
import { authApi } from '../../api/authApi';
import type { RoleInfo } from '../../types/Auth';

interface ListeUtilisateursProps {
  showFiltres?: boolean;
  setShowFiltres?: (show: boolean) => void;
}

export const ListeUtilisateurs: React.FC<ListeUtilisateursProps> = ({ showFiltres = false, setShowFiltres: parentSetShowFiltres }) => {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtres, setFiltres] = useState({
    role: '',
    actif: ''
  });
  const [showLocalFiltres, setShowLocalFiltres] = useState(showFiltres);
  const [roles, setRoles] = useState<RoleInfo[]>([]);

  useEffect(() => {
    loadUtilisateurs();
    loadRoles();
  }, []);

  useEffect(() => {
    // Synchroniser l'état local avec la prop si fournie
    if (parentSetShowFiltres) {
      parentSetShowFiltres(showLocalFiltres);
    }
  }, [showLocalFiltres, parentSetShowFiltres]);

  useEffect(() => {
    filterUtilisateurs();
  }, [searchTerm, filtres, utilisateurs]);

  const loadUtilisateurs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Utiliser l'API utilisateur pour récupérer la liste
      const allUtilisateurs = await utilisateurApi.getAllUtilisateurs();
      setUtilisateurs(allUtilisateurs);
    } catch (err: any) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError(err.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await authApi.getRoles();
      if (response.success) {
        setRoles(response.roles);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des rôles:', err);
    }
  };

  const filterUtilisateurs = () => {
    // Filtrer les utilisateurs selon les critères de recherche et de filtre
    let filtered = [...utilisateurs];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(utilisateur =>
        utilisateur.nom_utilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        utilisateur.prenom_utilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        utilisateur.email_utilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        utilisateur.role_utilisateur.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par rôle
    if (filtres.role) {
      filtered = filtered.filter(utilisateur =>
        utilisateur.role_utilisateur === filtres.role
      );
    }

    // Filtre par statut actif
    if (filtres.actif) {
      const isActive = filtres.actif === 'true';
      filtered = filtered.filter(utilisateur =>
        utilisateur.actif === isActive
      );
    }

    return filtered;
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await utilisateurApi.supprimerUtilisateur(id);
        loadUtilisateurs(); // Recharger la liste
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const toggleUserStatus = async (user: Utilisateur) => {
    try {
      // Pour l'instant, on fait une mise à jour simple
      // En pratique, vous voudrez peut-être un endpoint spécifique pour activer/désactiver
      await utilisateurApi.mettreAJourUtilisateur(user.id_utilisateur, {
        ...user,
        actif: !user.actif
      });
      loadUtilisateurs(); // Recharger la liste
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du statut de l\'utilisateur');
    }
  };

  const filteredUtilisateurs = filterUtilisateurs();

  const toggleFiltres = () => {
    if (parentSetShowFiltres) {
      parentSetShowFiltres(!showLocalFiltres);
    } else {
      setShowLocalFiltres(!showLocalFiltres);
    }
  };

  if (loading && utilisateurs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestion des Utilisateurs</h2>
          <p className="text-slate-400">Tous les utilisateurs du système</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleFiltres}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              (parentSetShowFiltres ? showFiltres : showLocalFiltres)
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtres
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Panneau de filtres */}
      {(parentSetShowFiltres ? showFiltres : showLocalFiltres) && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Filtres avancés</h3>
            <button
              onClick={toggleFiltres}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Rôle</label>
              <select
                value={filtres.role}
                onChange={(e) => setFiltres(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Tous les rôles</option>
                {roles.map(role => (
                  <option key={role.code} value={role.code}>
                    {role.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Statut</label>
              <select
                value={filtres.actif}
                onChange={(e) => setFiltres(prev => ({ ...prev, actif: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Tous</option>
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFiltres({ role: '', actif: '' })}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Liste des utilisateurs */}
      {filteredUtilisateurs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-slate-400">
            {searchTerm || filtres.role || filtres.actif
              ? 'Aucun utilisateur ne correspond à vos critères de recherche.'
              : 'Aucun utilisateur enregistré dans le système.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Nom Complet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Verrouillé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Échecs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredUtilisateurs.map((utilisateur) => (
                  <tr key={utilisateur.id_utilisateur} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {utilisateur.id_utilisateur}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {utilisateur.nom_utilisateur || utilisateur.name || utilisateur.nom || utilisateur.nomUtilisateur}
                          </div>
                          <div className="text-sm text-slate-400">
                            {utilisateur.prenom_utilisateur || utilisateur.firstName || utilisateur.prenom || utilisateur.prenomUtilisateur}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-slate-400 mr-2" />
                        <div className="text-sm text-white truncate max-w-xs">
                          {utilisateur.email_utilisateur || utilisateur.email || utilisateur.emailUtilisateur}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (utilisateur.role_utilisateur || utilisateur.authority || utilisateur.role || utilisateur.roleUtilisateur) === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' :
                        (utilisateur.role_utilisateur || utilisateur.authority || utilisateur.role || utilisateur.roleUtilisateur) === 'DG' ? 'bg-blue-500/20 text-blue-300' :
                        (utilisateur.role_utilisateur || utilisateur.authority || utilisateur.role || utilisateur.roleUtilisateur) === 'DIRECTION' ? 'bg-green-500/20 text-green-300' :
                        (utilisateur.role_utilisateur || utilisateur.authority || utilisateur.role || utilisateur.roleUtilisateur) === 'SECRETARIAT' ? 'bg-yellow-500/20 text-yellow-300' :
                        (utilisateur.role_utilisateur || utilisateur.authority || utilisateur.role || utilisateur.roleUtilisateur) === 'DIVISION' ? 'bg-orange-500/20 text-orange-300' :
                        (utilisateur.role_utilisateur || utilisateur.authority || utilisateur.role || utilisateur.roleUtilisateur) === 'SERVICES' ? 'bg-red-500/20 text-red-300' :
                        'bg-slate-500/20 text-slate-300'
                      }`}>
                        {utilisateur.role_utilisateur || utilisateur.authority || utilisateur.role || utilisateur.roleUtilisateur}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        utilisateur.actif ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {utilisateur.actif ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Actif
                          </>
                        ) : (
                          <>
                            <CloseIcon className="w-3 h-3 mr-1" />
                            Inactif
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        utilisateur.verrouille ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                      }`}>
                        {utilisateur.verrouille ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {utilisateur.tentatives_echec}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleUserStatus(utilisateur)}
                          className={`p-2 rounded-lg transition-colors ${
                            utilisateur.actif
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20'
                              : 'text-green-400 hover:text-green-300 hover:bg-green-500/20'
                          }`}
                          title={utilisateur.actif ? "Désactiver l'utilisateur" : "Activer l'utilisateur"}
                        >
                          {utilisateur.actif ? <CloseIcon className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(utilisateur.id_utilisateur)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Supprimer l'utilisateur"
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

          <div className="px-6 py-4 bg-slate-700/50 border-t border-slate-600 text-sm text-slate-400">
            {filteredUtilisateurs.length} utilisateur(s) trouvé(s)
          </div>
        </div>
      )}
    </div>
  );
};