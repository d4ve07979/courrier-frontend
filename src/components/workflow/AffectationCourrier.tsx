import React, { useState, useEffect } from 'react';
import { Users, Send, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import type { Direction } from '../../types/Direction';
import type { Courrier } from '../../types/Courrier';
import { CourrierService } from '../../services/courrierService';

interface Props {
  courrier: Courrier;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AffectationCourrier: React.FC<Props> = ({ courrier, onSuccess, onCancel }) => {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [directionsSelectionnees, setDirectionsSelectionnees] = useState<number[]>([]);
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les directions depuis l'API
  useEffect(() => {
    const chargerDirections = async () => {
      try {
        // Ici vous devrez importer et utiliser votre API des directions
        // const directionsApi = await directionApi.getAll();
        // setDirections(directionsApi);
        
        // Pour l'instant, on utilise des données de base en attendant l'API
        const directionsDeBase: Direction[] = [
          { id: 1, code: 'DET', nom: 'Direction des Études', actif: true },
          { id: 2, code: 'DFO', nom: 'Direction de la Formation', actif: true },
          { id: 3, code: 'DAF', nom: 'Direction Administrative et Financière', actif: true },
          { id: 4, code: 'DRH', nom: 'Direction des Ressources Humaines', actif: true },
          { id: 5, code: 'DSI', nom: 'Direction des Systèmes d\'Information', actif: true },
          { id: 6, code: 'DPL', nom: 'Direction de la Planification', actif: true },
          { id: 7, code: 'DCO', nom: 'Direction de la Communication', actif: true },
          { id: 8, code: 'DJU', nom: 'Direction Juridique', actif: true },
        ];
        setDirections(directionsDeBase);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des directions:', error);
        setError('Impossible de charger les directions');
      }
    };

    chargerDirections();
  }, []);

  const toggleDirection = (directionId: number) => {
    setDirectionsSelectionnees(prev => {
      if (prev.includes(directionId)) {
        return prev.filter(id => id !== directionId);
      } else {
        // Limite de 10 directions selon le cahier de charge
        if (prev.length >= 10) {
          setError('Maximum 10 directions peuvent être sélectionnées');
          return prev;
        }
        setError(null);
        return [...prev, directionId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (directionsSelectionnees.length === 0) {
      setError('Veuillez sélectionner au moins une direction');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Pour chaque direction sélectionnée, affecter le courrier
      for (const directionId of directionsSelectionnees) {
        await CourrierService.affecterCourrier(courrier.id_courrier, directionId);
      }

      console.log('✅ Courrier affecté avec succès');
      onSuccess?.();
    } catch (err: any) {
      console.error('❌ Erreur affectation:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'affectation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Affectation du Courrier</h2>
          <p className="text-sm text-slate-400">
            Courrier: {courrier.id_courrier} - {courrier.objet}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sélection des directions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-medium text-white">
              Directions destinataires *
            </label>
            <span className="text-sm text-slate-400">
              {directionsSelectionnees.length}/10 sélectionnées
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {directions.map(direction => {
              const isSelected = directionsSelectionnees.includes(direction.id);
              return (
                <div
                  key={direction.id}
                  onClick={() => toggleDirection(direction.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">{direction.nom}</h3>
                      <p className="text-slate-400 text-sm">Code: {direction.code}</p>
                    </div>
                    
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Maximum 10 directions peuvent être sélectionnées selon le règlement
            </p>
          </div>
        </div>

        {/* Observations */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Instructions et observations
          </label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="Instructions particulières pour le traitement du courrier..."
          />
        </div>

        {/* Résumé de l'affectation */}
        {directionsSelectionnees.length > 0 && (
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <h3 className="text-white font-medium mb-3">Résumé de l'affectation</h3>
            <div className="space-y-2">
              <p className="text-slate-300 text-sm">
                <strong>Courrier:</strong> {courrier.id_courrier}
              </p>
              <p className="text-slate-300 text-sm">
                <strong>Directions sélectionnées:</strong>
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {directionsSelectionnees.map(id => {
                  const direction = directions.find(d => d.id === id);
                  return direction ? (
                    <span
                      key={id}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                    >
                      {direction.code}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}

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
            disabled={loading || directionsSelectionnees.length === 0}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Affectation...' : 'Affecter le courrier'}
          </button>
        </div>
      </form>
    </div>
  );
};