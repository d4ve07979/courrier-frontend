import React, { useState } from 'react';
import { Archive, MessageSquare, AlertCircle, FileX, Info } from 'lucide-react';
import type { Courrier } from '../../types/Courrier';
import { CourrierService } from '../../services/courrierService';

interface Props {
  courrier: Courrier;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ClassementCourrier: React.FC<Props> = ({ courrier, onSuccess, onCancel }) => {
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirmation) {
      setError('Veuillez confirmer que ce courrier ne nécessite pas de réponse');
      return;
    }

    if (!observations.trim()) {
      setError('Veuillez saisir la raison du classement');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await CourrierService.classerCourrier(courrier.id, observations.trim());

      console.log('✅ Courrier classé avec succès');
      onSuccess?.();
    } catch (err: any) {
      console.error('❌ Erreur classement:', err);
      setError(err.response?.data?.message || 'Erreur lors du classement');
    } finally {
      setLoading(false);
    }
  };

  const raisonsClassement = [
    'Courrier d\'information uniquement',
    'Accusé de réception simple',
    'Document de référence',
    'Invitation déjà passée',
    'Demande non recevable',
    'Doublon d\'un courrier déjà traité',
    'Courrier hors compétence de l\'INSEED',
    'Autre (préciser dans les observations)'
  ];

  const selectionnerRaison = (raison: string) => {
    if (raison === 'Autre (préciser dans les observations)') {
      setObservations('');
    } else {
      setObservations(raison);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
          <Archive className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Classement du Courrier</h2>
          <p className="text-sm text-slate-400">
            Courrier: {courrier.numero} - {courrier.objet}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Information sur le classement */}
      <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h3 className="text-yellow-400 font-medium mb-2">Qu'est-ce que le classement ?</h3>
            <p className="text-yellow-300 text-sm mb-2">
              Le classement est destiné aux courriers qui ne nécessitent pas de réponse de la part de l'INSEED.
            </p>
            <ul className="text-yellow-300 text-sm space-y-1">
              <li>• Le courrier sera archivé définitivement</li>
              <li>• Aucune réponse ne sera envoyée</li>
              <li>• Cette action est irréversible</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations du courrier */}
        <div className="p-4 bg-slate-700/30 rounded-lg">
          <h3 className="text-white font-medium mb-3">Informations du courrier</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Numéro:</span>
              <span className="text-white ml-2">{courrier.numero}</span>
            </div>
            <div>
              <span className="text-slate-400">Type:</span>
              <span className="text-white ml-2">{courrier.type}</span>
            </div>
            <div>
              <span className="text-slate-400">Expéditeur:</span>
              <span className="text-white ml-2">
                {courrier.expediteur?.nom || 'Non renseigné'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Date de réception:</span>
              <span className="text-white ml-2">
                {courrier.dateReception ? new Date(courrier.dateReception).toLocaleDateString('fr-FR') : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Raisons prédéfinies */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Raison du classement
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {raisonsClassement.map((raison, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectionnerRaison(raison)}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  observations === raison
                    ? 'border-gray-500 bg-gray-500/10 text-white'
                    : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="text-sm">{raison}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Observations détaillées */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Observations détaillées *
          </label>
          <textarea
            required
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-gray-500"
            placeholder="Précisez la raison du classement et toute information pertinente..."
          />
          <p className="text-slate-400 text-xs mt-1">
            Justifiez clairement pourquoi ce courrier ne nécessite pas de réponse
          </p>
        </div>

        {/* Confirmation */}
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmation}
              onChange={(e) => setConfirmation(e.target.checked)}
              className="mt-1 w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
            />
            <div>
              <p className="text-red-400 font-medium">Confirmation de classement</p>
              <p className="text-red-300 text-sm mt-1">
                Je confirme que ce courrier ne nécessite pas de réponse de la part de l'INSEED 
                et peut être classé définitivement. Cette action est irréversible.
              </p>
            </div>
          </label>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-600">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading || !observations.trim() || !confirmation}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-500/50 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <FileX className="w-4 h-4" />
            {loading ? 'Classement...' : 'Classer le courrier'}
          </button>
        </div>
      </form>
    </div>
  );
};