// src/components/courriers/AffectationModal.tsx
import React, { useState, useEffect } from 'react';
import { X, User, Search, Users, Check } from 'lucide-react';
import { utilisateurApi } from '../../api/utilisateurApi';
import { affectationApi } from '../../api/affectationApi';
import type { Courrier } from '../../types/Courrier';
import type { Affectation } from '../../types/Affectation';

interface AffectationModalProps {
  courrier: Courrier;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (affectation: Affectation) => void;
}

export const AffectationModal: React.FC<AffectationModalProps> = ({ 
  courrier, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [commentaire, setCommentaire] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Chargement des utilisateurs...');
      
      // ✅ Utiliser la nouvelle méthode publique
      const users = await utilisateurApi.getUtilisateursAffectablesPublic();
      
      console.log('📋 Utilisateurs reçus dans le modal:', users);
      
      setUtilisateurs(users);
      
      if (users.length === 0) {
        console.warn('⚠️ Aucun utilisateur trouvé');
      }
    } catch (err: any) {
      console.error('❌ Erreur chargement utilisateurs:', err);
      setError(err.message || 'Erreur lors du chargement des utilisateurs');
      
      // Fallback : essayer l'ancienne méthode en cas d'erreur
      try {
        console.log('🔄 Tentative avec l\'ancienne méthode...');
        const fallbackUsers = await utilisateurApi.getUtilisateursAffectables();
        setUtilisateurs(fallbackUsers);
        setError(null); // Effacer l'erreur si le fallback réussit
      } catch (fallbackErr) {
        console.error('❌ Fallback également échoué:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAffecter = async () => {
    if (!selectedUser) {
      setError('Veuillez sélectionner un utilisateur');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Format attendu par l'API /api/affectations/ajouter
      const affectationData = {
        idCourrier: courrier.id_courrier,
        idUtilisateur: selectedUser,
        idDirection: 1, // À remplacer par la direction réelle si disponible
        motif: commentaire.trim() || `Courrier affecté à l'utilisateur ${selectedUser}`
      };

      console.log('📤 Envoi affectation:', affectationData);
      const result = await affectationApi.ajouter(affectationData);
      
      console.log('✅ Affectation réussie:', result);
      onSuccess(result);
      onClose();
    } catch (err: any) {
      console.error('❌ Erreur affectation:', err);
      setError(err.message || 'Erreur lors de l\'affectation du courrier');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs
  const filteredUtilisateurs = utilisateurs.filter(utilisateur => {
    if (!utilisateur) return false;
    
    const fullName = `${utilisateur.prenomUtilisateur || ''} ${utilisateur.nomUtilisateur || ''}`.toLowerCase();
    const email = (utilisateur.emailUtilisateur || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || email.includes(search);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Affecter le courrier</h2>
              <p className="text-sm text-slate-400">
                Courrier #{courrier.id_courrier}: {courrier.objet.substring(0, 50)}{courrier.objet.length > 50 ? '...' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Barre de recherche */}
          <div className="relative mb-4">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          {/* Messages d'erreur */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}

          {/* Liste des utilisateurs */}
          {!loading && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredUtilisateurs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Aucun utilisateur trouvé
                </div>
              ) : (
                filteredUtilisateurs.map(utilisateur => (
                  <div
                    key={utilisateur.idUtilisateur}
                    onClick={() => setSelectedUser(utilisateur.idUtilisateur)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedUser === utilisateur.idUtilisateur
                        ? 'bg-purple-500/20 border-purple-500 text-white'
                        : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {utilisateur.prenomUtilisateur} {utilisateur.nomUtilisateur}
                        </div>
                        <div className="text-sm text-slate-400">
                          {utilisateur.emailUtilisateur}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                            utilisateur.roleUtilisateur === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' :
                            utilisateur.roleUtilisateur === 'DG' ? 'bg-blue-500/20 text-blue-300' :
                            utilisateur.roleUtilisateur === 'DIRECTION' ? 'bg-green-500/20 text-green-300' :
                            utilisateur.roleUtilisateur === 'SECRETARIAT' ? 'bg-yellow-500/20 text-yellow-300' :
                            utilisateur.roleUtilisateur === 'DIVISION' ? 'bg-orange-500/20 text-orange-300' :
                            utilisateur.roleUtilisateur === 'SERVICES' ? 'bg-red-500/20 text-red-300' :
                            'bg-slate-500/20 text-slate-300'
                          }`}>
                            {utilisateur.roleUtilisateur}
                          </span>
                        </div>
                      </div>
                      {selectedUser === utilisateur.idUtilisateur && (
                        <Check className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Commentaire */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Commentaire (optionnel)
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Ajouter un commentaire pour l'utilisateur affecté..."
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-vertical"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={handleAffecter}
            disabled={loading || !selectedUser}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin w-4 h-4 border-t-2 border-b-2 border-white rounded-full"></div>
            ) : (
              <Users className="w-4 h-4" />
            )}
            Affecter
          </button>
        </div>
      </div>
    </div>
  );
};