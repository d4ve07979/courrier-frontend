// src/components/courriers/SendToUserModal.tsx
import React, { useState, useEffect } from 'react';
import { X, User, Search, Users, Check, Building } from 'lucide-react';
import { utilisateurApi } from '../../api/utilisateurApi';
import { affectationApi } from '../../api/affectationApi';
import { directionApi } from '../../api/directionApi';
import type { Courrier } from '../../types/Courrier';

interface Props {
  courrier: Courrier;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SendToUserModal: React.FC<Props> = ({ courrier, isOpen, onClose, onSuccess }) => {
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [directions, setDirections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<number | null>(null);
  const [motif, setMotif] = useState('');
  const [step, setStep] = useState<'user' | 'direction'>('user'); // Étape 1: choix user, Étape 2: choix direction

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadDirections();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des utilisateurs pour envoi...');
      const users = await utilisateurApi.getUtilisateursAffectables();
      console.log('📋 Utilisateurs reçus:', users);
      
      setUtilisateurs(users);
    } catch (err: any) {
      console.error('❌ Erreur chargement utilisateurs:', err);
      setError('Erreur chargement utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const loadDirections = async () => {
    try {
      console.log('🔄 Chargement des directions...');
      const data = await directionApi.getAll();
      console.log('📋 Directions reçues:', data);
      setDirections(data);
    } catch (err: any) {
      console.error('❌ Erreur chargement directions:', err);
    }
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setStep('direction'); // Passer à l'étape de sélection de direction
  };

  const handleBackToUsers = () => {
    setStep('user');
    setSelectedDirection(null);
  };

  const handleSend = async () => {
    if (!selectedUser) {
      setError('Sélectionnez un utilisateur');
      return;
    }

    if (!selectedDirection) {
      setError('Sélectionnez une direction');
      return;
    }

    if (!motif.trim()) {
      setError('Saisissez un motif');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ Format attendu par l'API /api/affectations/ajouter
      const data = {
        idCourrier: courrier.id_courrier,
        idUtilisateur: selectedUser.idUtilisateur,
        idDirection: selectedDirection, // ← Maintenant obligatoire et non null
        motif: motif.trim()
      };

      console.log('📤 Envoi de l\'affectation:', data);
      await affectationApi.ajouter(data);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('❌ Erreur envoi:', err);
      setError(err.message || 'Erreur lors de l\'affectation');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs selon le terme de recherche
  const filteredUsers = utilisateurs.filter(u => {
    if (!u) return false;
    
    const fullName = `${u.prenomUtilisateur || ''} ${u.nomUtilisateur || ''}`.toLowerCase();
    const email = (u.emailUtilisateur || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || email.includes(search);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1050] p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {step === 'user' ? 'Choisir un utilisateur' : 'Choisir une direction'}
              </h2>
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
          {/* Barre de progression */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'user' ? 'bg-purple-500 text-white' : 'bg-green-500 text-white'
            }`}>
              1
            </div>
            <div className={`h-1 w-12 ${
              step === 'direction' ? 'bg-green-500' : 'bg-slate-600'
            }`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'direction' ? 'bg-purple-500 text-white' : 'bg-slate-600 text-slate-300'
            }`}>
              2
            </div>
          </div>

          {/* Étape 1: Sélection de l'utilisateur */}
          {step === 'user' && (
            <>
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
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
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-slate-400 mt-2">Chargement des utilisateurs...</p>
                </div>
              )}

              {/* Liste des utilisateurs */}
              {!loading && filteredUsers.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  Aucun utilisateur trouvé
                </div>
              )}

              {!loading && filteredUsers.length > 0 && (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {filteredUsers.map(u => (
                    <div
                      key={u.idUtilisateur}
                      onClick={() => handleUserSelect(u)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedUser?.idUtilisateur === u.idUtilisateur
                          ? 'bg-purple-500/20 border-purple-500'
                          : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {u.prenomUtilisateur} {u.nomUtilisateur}
                          </div>
                          <div className="text-sm text-slate-400">
                            {u.emailUtilisateur}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                              u.roleUtilisateur === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' :
                              u.roleUtilisateur === 'DG' ? 'bg-blue-500/20 text-blue-300' :
                              u.roleUtilisateur === 'DIRECTION' ? 'bg-green-500/20 text-green-300' :
                              u.roleUtilisateur === 'SECRETARIAT' ? 'bg-yellow-500/20 text-yellow-300' :
                              u.roleUtilisateur === 'DIVISION' ? 'bg-orange-500/20 text-orange-300' :
                              u.roleUtilisateur === 'SERVICES' ? 'bg-red-500/20 text-red-300' :
                              'bg-slate-500/20 text-slate-300'
                            }`}>
                              {u.roleUtilisateur}
                            </span>
                          </div>
                        </div>
                        {selectedUser?.idUtilisateur === u.idUtilisateur && (
                          <Check className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Étape 2: Sélection de la direction */}
          {step === 'direction' && selectedUser && (
            <>
              <div className="mb-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <p className="text-white text-sm">
                  <span className="font-semibold">Utilisateur sélectionné :</span>{' '}
                  {selectedUser.prenomUtilisateur} {selectedUser.nomUtilisateur}
                </p>
                <p className="text-slate-400 text-xs mt-1">{selectedUser.emailUtilisateur}</p>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {directions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Aucune direction disponible
                  </div>
                ) : (
                  directions.map(dir => (
                    <div
                      key={dir.id}
                      onClick={() => setSelectedDirection(dir.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedDirection === dir.id
                          ? 'bg-purple-500/20 border-purple-500'
                          : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {dir.nomDirection || dir.nom}
                          </div>
                          {dir.responsable && (
                            <p className="text-sm text-slate-400">Resp: {dir.responsable}</p>
                          )}
                        </div>
                        {selectedDirection === dir.id && (
                          <Check className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Motif (toujours visible) */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Motif (obligatoire)
            </label>
            <textarea
              value={motif}
              onChange={e => setMotif(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-vertical"
              rows={3}
              placeholder="Précisez le motif de l'affectation..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
          {step === 'direction' && (
            <button
              onClick={handleBackToUsers}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Retour
            </button>
          )}
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !selectedUser || !selectedDirection || !motif.trim()}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loading && <div className="animate-spin w-4 h-4 border-t-2 border-b-2 border-white rounded-full"></div>}
            Affecter
          </button>
        </div>
      </div>
    </div>
  );
};