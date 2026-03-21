import React, { useState } from 'react';
import { 
  ArrowRight, Users, CheckCircle, Send, Archive, FileX, 
  Clock, AlertCircle, Eye, MessageSquare 
} from 'lucide-react';
import type { Courrier } from '../../types/Courrier';
import { useAuth } from '../../auth/useAuth';
import { AffectationCourrier } from './AffectationCourrier';
import { ValidationTraitement } from './ValidationTraitement';
import { ClassementCourrier } from './ClassementCourrier';
import { EnvoiCourrier } from './EnvoiCourrier';

interface Props {
  courrier: Courrier;
  onWorkflowComplete?: () => void;
  onClose?: () => void;
}

type EtapeWorkflow = 'affectation' | 'validation' | 'classement' | 'envoi' | 'consultation';

export const GestionWorkflow: React.FC<Props> = ({ courrier, onWorkflowComplete, onClose }) => {
  const { user } = useAuth();
  const [etapeActive, setEtapeActive] = useState<EtapeWorkflow>('consultation');

  // Déterminer les actions possibles selon le rôle et le statut
  const getActionsDisponibles = () => {
    const actions: { etape: EtapeWorkflow; label: string; icon: any; color: string; description: string; }[] = [];

    // Consultation toujours disponible
    actions.push({
      etape: 'consultation',
      label: 'Consulter',
      icon: Eye,
      color: 'bg-slate-500',
      description: 'Voir les détails du courrier'
    });

    // Actions selon le rôle et le statut
    if (user?.role === 'DIRECTEUR_GENERAL' || user?.role === 'ADMIN') {
      if (courrier.statut === 'EN_ATTENTE') {
        actions.push({
          etape: 'affectation',
          label: 'Affecter',
          icon: Users,
          color: 'bg-blue-500',
          description: 'Affecter à une ou plusieurs directions'
        });
        
        actions.push({
          etape: 'classement',
          label: 'Classer',
          icon: FileX,
          color: 'bg-gray-500',
          description: 'Classer sans réponse (définitif)'
        });
      }
      
      if (courrier.statut === 'TRAITE') {
        actions.push({
          etape: 'validation',
          label: 'Valider',
          icon: CheckCircle,
          color: 'bg-green-500',
          description: 'Valider le traitement effectué'
        });
      }
    }

    if (user?.role === 'DIRECTEUR' || user?.role === 'ADMIN') {
      if (courrier.statut === 'AFFECTE' || courrier.statut === 'EN_TRAITEMENT') {
        actions.push({
          etape: 'validation',
          label: 'Traiter',
          icon: CheckCircle,
          color: 'bg-green-500',
          description: 'Marquer comme traité et renvoyer au DG'
        });
      }
    }

    if (user?.role === 'SECRETAIRE_DG' || user?.role === 'ADMIN') {
      if (courrier.statut === 'VALIDE' && courrier.type === 'SORTANT') {
        actions.push({
          etape: 'envoi',
          label: 'Envoyer',
          icon: Send,
          color: 'bg-cyan-500',
          description: 'Marquer comme envoyé avec décharge'
        });
      }
    }

    return actions;
  };

  const getStatutColor = (statut: string) => {
    const colors = {
      'EN_ATTENTE': 'text-orange-400 bg-orange-500/20',
      'AFFECTE': 'text-blue-400 bg-blue-500/20',
      'EN_TRAITEMENT': 'text-purple-400 bg-purple-500/20',
      'TRAITE': 'text-green-400 bg-green-500/20',
      'VALIDE': 'text-emerald-400 bg-emerald-500/20',
      'ENVOYE': 'text-cyan-400 bg-cyan-500/20',
      'CLASSE': 'text-slate-400 bg-slate-500/20',
      'ARCHIVE': 'text-gray-400 bg-gray-500/20'
    };
    return colors[statut as keyof typeof colors] || 'text-slate-400 bg-slate-500/20';
  };

  const getEtapesWorkflow = () => {
    const etapes = [
      { statut: 'EN_ATTENTE', label: 'En attente', description: 'Courrier reçu, en attente d\'affectation' },
      { statut: 'AFFECTE', label: 'Affecté', description: 'Affecté à une ou plusieurs directions' },
      { statut: 'EN_TRAITEMENT', label: 'En traitement', description: 'En cours de traitement par la direction' },
      { statut: 'TRAITE', label: 'Traité', description: 'Traité par la direction, en attente de validation DG' },
      { statut: 'VALIDE', label: 'Validé', description: 'Validé par le DG, prêt pour envoi' },
      { statut: 'ENVOYE', label: 'Envoyé', description: 'Envoyé au destinataire avec décharge' },
    ];

    // Ajouter les statuts alternatifs
    if (courrier.statut === 'CLASSE') {
      etapes.push({ statut: 'CLASSE', label: 'Classé', description: 'Classé sans réponse requise' });
    }
    if (courrier.statut === 'ARCHIVE') {
      etapes.push({ statut: 'ARCHIVE', label: 'Archivé', description: 'Archivé définitivement' });
    }

    return etapes;
  };

  const handleActionComplete = () => {
    setEtapeActive('consultation');
    onWorkflowComplete?.();
  };

  const actionsDisponibles = getActionsDisponibles();
  const etapesWorkflow = getEtapesWorkflow();

  return (
    <div className="space-y-6">
      {/* Header avec informations du courrier */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{courrier.numero}</h2>
            <p className="text-slate-400">{courrier.objet}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(courrier.statut)}`}>
              {courrier.statut.replace('_', ' ')}
            </span>
            <span className="text-slate-400 text-sm">
              {courrier.type === 'ENTRANT' ? 'Entrant' : 'Sortant'}
            </span>
          </div>
        </div>

        {/* Workflow visuel */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3">Progression du workflow</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {etapesWorkflow.map((etape, index) => {
              const isActive = etape.statut === courrier.statut;
              const isCompleted = etapesWorkflow.findIndex(e => e.statut === courrier.statut) > index;
              
              return (
                <React.Fragment key={etape.statut}>
                  <div className={`flex-shrink-0 p-3 rounded-lg border-2 transition-all ${
                    isActive 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-slate-600 bg-slate-700/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : isActive ? (
                        <Clock className="w-4 h-4 text-purple-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        isActive ? 'text-purple-400' : isCompleted ? 'text-green-400' : 'text-slate-400'
                      }`}>
                        {etape.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{etape.description}</p>
                  </div>
                  
                  {index < etapesWorkflow.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Actions disponibles */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Actions disponibles</h3>
          <div className="flex flex-wrap gap-3">
            {actionsDisponibles.map(action => (
              <button
                key={action.etape}
                onClick={() => setEtapeActive(action.etape)}
                className={`px-4 py-2 ${action.color} hover:opacity-80 text-white rounded-lg transition-all flex items-center gap-2 ${
                  etapeActive === action.etape ? 'ring-2 ring-white/20' : ''
                }`}
              >
                <action.icon className="w-4 h-4" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu de l'étape active */}
      <div>
        {etapeActive === 'affectation' && (
          <AffectationCourrier
            courrier={courrier}
            onSuccess={handleActionComplete}
            onCancel={() => setEtapeActive('consultation')}
          />
        )}

        {etapeActive === 'validation' && (
          <ValidationTraitement
            courrier={courrier}
            onSuccess={handleActionComplete}
            onCancel={() => setEtapeActive('consultation')}
          />
        )}

        {etapeActive === 'classement' && (
          <ClassementCourrier
            courrier={courrier}
            onSuccess={handleActionComplete}
            onCancel={() => setEtapeActive('consultation')}
          />
        )}

        {etapeActive === 'envoi' && (
          <EnvoiCourrier
            courrier={courrier}
            onSuccess={handleActionComplete}
            onCancel={() => setEtapeActive('consultation')}
          />
        )}

        {etapeActive === 'consultation' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="text-center py-8">
              <Eye className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Mode consultation</h3>
              <p className="text-slate-400 mb-6">
                Sélectionnez une action ci-dessus pour interagir avec ce courrier.
              </p>
              
              {actionsDisponibles.length === 1 && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                  <p className="text-yellow-400 text-sm">
                    Aucune action n'est disponible pour votre rôle sur ce courrier dans son état actuel.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};