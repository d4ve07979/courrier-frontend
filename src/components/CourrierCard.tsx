// src/components/CourrierCard.tsx
import React from 'react';
import { 
  Mail, Send, Clock, CheckCircle, Archive, 
  Eye, Edit, Trash2, Users, Calendar,
  FileText, Building, User, Crown
} from 'lucide-react';
import type { Courrier } from '../types/Courrier';

interface Props {
  courrier: Courrier;
  onView?: (courrier: Courrier) => void;
  onEdit?: (courrier: Courrier) => void;
  onDelete?: (courrier: Courrier) => void;
  onAffecter?: (courrier: Courrier) => void;
  showSendToUser?: boolean;
  showSendToDG?: boolean;
  onSendToUser?: (courrier: Courrier) => void;
  onSendToDG?: (courrier: Courrier) => void;
}

export const CourrierCard: React.FC<Props> = ({ 
  courrier, 
  onView, 
  onEdit, 
  onDelete, 
  onAffecter,
  showSendToUser = false,
  showSendToDG = false,
  onSendToUser,
  onSendToDG
}) => {
  const getTypeIcon = () => {
    const isEntrant = courrier.id_expediteur ? true : false;
    return isEntrant ? Mail : Send;
  };

  const getTypeColor = () => {
    const isEntrant = courrier.id_expediteur ? true : false;
    return isEntrant 
      ? 'text-purple-400 bg-purple-500/20' 
      : 'text-blue-400 bg-blue-500/20';
  };

  const getTypeLabel = () => {
    const isEntrant = courrier.id_expediteur ? true : false;
    return isEntrant ? 'Entrant' : 'Sortant';
  };

  const getStatutIcon = () => {
    const statut = courrier.id_statut?.libelle_statut || '';
    switch (statut.toUpperCase()) {
      case 'EN_ATTENTE':
      case 'AFFECTE':
        return Clock;
      case 'TRAITE':
        return CheckCircle;
      case 'ARCHIVE':
        return Archive;
      default:
        return Clock;
    }
  };

  const getStatutColor = () => {
    const statut = courrier.id_statut?.libelle_statut || '';
    switch (statut.toUpperCase()) {
      case 'EN_ATTENTE':
      case 'AFFECTE':
        return 'text-orange-400 bg-orange-500/20';
      case 'TRAITE':
        return 'text-green-400 bg-green-500/20';
      case 'ARCHIVE':
        return 'text-slate-400 bg-slate-500/20';
      default:
        return 'text-orange-400 bg-orange-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  const TypeIcon = getTypeIcon();
  const StatutIcon = getStatutIcon();

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-200">
      {/* Header avec les badges et les actions */}
      <div className="flex items-start justify-between mb-4">
        {/* Badges à gauche */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor()}`}>
            <TypeIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor()}`}>
                {getTypeLabel()}
              </span>
              <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getStatutColor()}`}>
                <StatutIcon className="w-3 h-3" />
                {courrier.id_statut?.libelle_statut || 'En attente'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ID: {courrier.id_courrier}
            </p>
          </div>
        </div>

        {/* Actions en haut à droite - SEULEMENT les actions secondaires (pas "Voir") */}
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(courrier)}
              className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {onAffecter && (
            <button
              onClick={() => onAffecter(courrier)}
              className="p-2 text-slate-400 hover:text-orange-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Affecter à un utilisateur"
            >
              <Users className="w-4 h-4" />
            </button>
          )}

          {showSendToUser && onSendToUser && (
            <button
              onClick={() => onSendToUser(courrier)}
              className="p-2 text-slate-400 hover:text-purple-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Envoyer à un utilisateur"
            >
              <Users className="w-4 h-4" />
            </button>
          )}

          {showSendToDG && onSendToDG && (
            <button
              onClick={() => onSendToDG(courrier)}
              className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Envoyer au Directeur Général"
            >
              <Crown className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(courrier)}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Objet */}
      <h3 className="text-white font-medium mb-3 line-clamp-2 text-lg">
        {courrier.objet}
      </h3>

      {/* Informations */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300">
            Reçu le {formatDate(courrier.date_reception)}
          </span>
        </div>

        {courrier.id_expediteur && (
          <div className="flex items-center gap-2 text-sm">
            <Building className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 truncate">
              De : {courrier.id_expediteur.nom_de_structure}
            </span>
          </div>
        )}

        {courrier.id_destinataire && (
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 truncate">
              À : {courrier.id_destinataire.nom_de_structure}
            </span>
          </div>
        )}

        {courrier.id_type_courrier && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">
              {courrier.id_type_courrier.libelle}
            </span>
          </div>
        )}
      </div>

      {/* Fichiers */}
      {courrier.fichiers && courrier.fichiers.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
          <FileText className="w-3 h-3" />
          <span>{courrier.fichiers.length} fichier(s) joint(s)</span>
        </div>
      )}

      {/* Bouton Voir les détails - UN SEUL bouton en bas */}
      <div className="flex items-center justify-center pt-4 border-t border-slate-600">
        <button
          onClick={() => onView?.(courrier)}
          className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
        >
          <Eye className="w-4 h-4" />
          Voir les détails →
        </button>
      </div>
    </div>
  );
};