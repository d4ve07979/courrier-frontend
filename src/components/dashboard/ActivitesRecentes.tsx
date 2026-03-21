import React, { useState, useEffect } from 'react';
import { 
  Activity, Mail, Send, Users, CheckCircle, Archive, 
  Clock, ExternalLink, MessageCircle, Phone, MapPin,
  Eye, ArrowRight
} from 'lucide-react';
import { StatistiquesService } from '../../services/statistiquesService';

interface ActiviteRecente {
  id: number;
  type: string;
  courrier: string;
  utilisateur: string;
  direction?: string;
  dateAction: string;
  description: string;
}

interface Props {
  limite?: number;
}

export const ActivitesRecentes: React.FC<Props> = ({ limite = 10 }) => {
  const [activites, setActivites] = useState<ActiviteRecente[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivite, setSelectedActivite] = useState<ActiviteRecente | null>(null);

  useEffect(() => {
    chargerActivites();
  }, [limite]);

  const chargerActivites = async () => {
    try {
      setLoading(true);
      const data = await StatistiquesService.obtenirActivitesRecentes(limite);
      setActivites(data);
    } catch (error) {
      console.error('Erreur chargement activités:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'CREATION': Mail,
      'AFFECTATION': Users,
      'TRAITEMENT': CheckCircle,
      'VALIDATION': CheckCircle,
      'ENVOI': Send,
      'RECEPTION': Mail,
      'ARCHIVAGE': Archive,
      'CLASSEMENT': Archive
    };
    const IconComponent = icons[type as keyof typeof icons] || Activity;
    return <IconComponent className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'CREATION': 'text-purple-400 bg-purple-500/20',
      'AFFECTATION': 'text-blue-400 bg-blue-500/20',
      'TRAITEMENT': 'text-green-400 bg-green-500/20',
      'VALIDATION': 'text-emerald-400 bg-emerald-500/20',
      'ENVOI': 'text-cyan-400 bg-cyan-500/20',
      'RECEPTION': 'text-orange-400 bg-orange-500/20',
      'ARCHIVAGE': 'text-gray-400 bg-gray-500/20',
      'CLASSEMENT': 'text-slate-400 bg-slate-500/20'
    };
    return colors[type as keyof typeof colors] || 'text-slate-400 bg-slate-500/20';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'CREATION': 'Création',
      'AFFECTATION': 'Affectation',
      'TRAITEMENT': 'Traitement',
      'VALIDATION': 'Validation',
      'ENVOI': 'Envoi',
      'RECEPTION': 'Réception',
      'ARCHIVAGE': 'Archivage',
      'CLASSEMENT': 'Classement'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatTempsEcoule = (dateAction: string) => {
    const now = new Date();
    const date = new Date(dateAction);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else {
      return `Il y a ${diffDays}j`;
    }
  };

  const ouvrirLienCommunication = (type: 'email' | 'whatsapp' | 'telephone', valeur: string) => {
    switch (type) {
      case 'email':
        window.open(`mailto:${valeur}`, '_blank');
        break;
      case 'whatsapp':
        // Format international requis pour WhatsApp
        const phoneNumber = valeur.replace(/\D/g, '');
        window.open(`https://wa.me/${phoneNumber}`, '_blank');
        break;
      case 'telephone':
        window.open(`tel:${valeur}`, '_blank');
        break;
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Activités Récentes</h3>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="w-8 h-8 bg-slate-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-600 rounded w-3/4"></div>
                <div className="h-2 bg-slate-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Activités Récentes</h3>
        </div>
        
        <button
          onClick={chargerActivites}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Actualiser
        </button>
      </div>

      {activites.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucune activité récente</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activites.map((activite) => (
            <div
              key={activite.id}
              className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
              onClick={() => setSelectedActivite(activite)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(activite.type)}`}>
                {getTypeIcon(activite.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-medium text-sm truncate">
                    {getTypeLabel(activite.type)} - {activite.courrier}
                  </h4>
                  <span className="text-slate-400 text-xs flex-shrink-0 ml-2">
                    {formatTempsEcoule(activite.dateAction)}
                  </span>
                </div>
                
                <p className="text-slate-300 text-sm mb-2">{activite.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Par: {activite.utilisateur}</span>
                    {activite.direction && <span>Direction: {activite.direction}</span>}
                  </div>
                  
                  {/* Liens de communication mockés */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        ouvrirLienCommunication('email', 'contact@inseed.td');
                      }}
                      className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                      title="Envoyer un email"
                    >
                      <Mail className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        ouvrirLienCommunication('whatsapp', '+23512345678');
                      }}
                      className="p-1 text-slate-400 hover:text-green-400 transition-colors"
                      title="Contacter via WhatsApp"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        ouvrirLienCommunication('telephone', '+23512345678');
                      }}
                      className="p-1 text-slate-400 hover:text-orange-400 transition-colors"
                      title="Appeler"
                    >
                      <Phone className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              
              <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Modal de détails d'activité */}
      {selectedActivite && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Détails de l'activité</h3>
              <button
                onClick={() => setSelectedActivite(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(selectedActivite.type)}`}>
                  {getTypeIcon(selectedActivite.type)}
                </div>
                <div>
                  <h4 className="text-white font-medium">{getTypeLabel(selectedActivite.type)}</h4>
                  <p className="text-slate-400 text-sm">{selectedActivite.courrier}</p>
                </div>
              </div>
              
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <p className="text-slate-300 text-sm">{selectedActivite.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Utilisateur:</span>
                  <p className="text-white">{selectedActivite.utilisateur}</p>
                </div>
                {selectedActivite.direction && (
                  <div>
                    <span className="text-slate-400">Direction:</span>
                    <p className="text-white">{selectedActivite.direction}</p>
                  </div>
                )}
                <div>
                  <span className="text-slate-400">Date:</span>
                  <p className="text-white">
                    {new Date(selectedActivite.dateAction).toLocaleDateString('fr-FR')} à{' '}
                    {new Date(selectedActivite.dateAction).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              
              {/* Moyens de communication */}
              <div className="border-t border-slate-600 pt-4">
                <h4 className="text-white font-medium mb-3">Moyens de communication</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => ouvrirLienCommunication('email', 'contact@inseed.td')}
                    className="p-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors flex flex-col items-center gap-1"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-xs">Email</span>
                  </button>
                  
                  <button
                    onClick={() => ouvrirLienCommunication('whatsapp', '+23512345678')}
                    className="p-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex flex-col items-center gap-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={() => ouvrirLienCommunication('telephone', '+23512345678')}
                    className="p-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors flex flex-col items-center gap-1"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-xs">Téléphone</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};