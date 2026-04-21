// src/components/courriers/SendToDGModal.tsx
import React, { useState, useEffect } from 'react';
import { X, User, Search, Crown, Check } from 'lucide-react';  // ← Ajout de Check
import axiosInstance from '../../api/axiosConfig';
import { affectationApi } from '../../api/affectationApi';
import type { Courrier } from '../../types/Courrier';

interface Props {
  courrier: Courrier;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SendToDGModal: React.FC<Props> = ({ courrier, isOpen, onClose, onSuccess }) => {
  const [dgs, setDgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDG, setSelectedDG] = useState<any | null>(null);
  const [motif, setMotif] = useState('');

  useEffect(() => {
    if (isOpen) loadDGs();
  }, [isOpen]);

  const loadDGs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/utilisateurs/role/DG');
      setDgs(res.data.utilisateurs || []);
    } catch (err: any) {
      setError('Erreur chargement des DG');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedDG || !motif.trim()) {
      setError('Sélectionnez un DG et saisissez un motif');
      return;
    }

    try {
      setLoading(true);
      const data = {
        idCourrier: courrier.id_courrier,
        idUtilisateur: selectedDG.idUtilisateur,
        idDirection: selectedDG.directionUtilisateur?.id_direction || 1,
        motif: motif.trim()
      };
      await affectationApi.ajouter(data);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur envoi');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1050] p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Envoyer au Directeur Général</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {loading && (
            <div className="text-center py-8 text-slate-500">
              Chargement des DG...
            </div>
          )}

          {!loading && dgs.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Aucun DG trouvé
            </div>
          )}

          {!loading && (
            <div className="space-y-3">
              {dgs.map(dg => (
                <label
                  key={dg.idUtilisateur}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedDG?.idUtilisateur === dg.idUtilisateur
                      ? 'bg-yellow-500/20 border-yellow-500'
                      : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                  }`}
                >
                  <input
                    type="radio"
                    checked={selectedDG?.idUtilisateur === dg.idUtilisateur}
                    onChange={() => setSelectedDG(dg)}
                    className="text-yellow-500 focus:ring-yellow-500"
                  />
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{dg.prenomUtilisateur} {dg.nomUtilisateur}</div>
                    <div className="text-sm text-slate-400">{dg.emailUtilisateur}</div>
                    <div className="text-xs text-slate-500">{dg.directionUtilisateur}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Motif (obligatoire)</label>
            <textarea
              value={motif}
              onChange={e => setMotif(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white resize-vertical"
              rows={3}
              placeholder="Motif de l'envoi au DG..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Annuler</button>
          <button
            onClick={handleSend}
            disabled={loading || !selectedDG || !motif.trim()}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="animate-spin w-4 h-4 border-t-2 border-b-2 border-black rounded-full"></div>}
            Envoyer au DG
          </button>
        </div>
      </div>
    </div>
  );
};