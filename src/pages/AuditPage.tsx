import React, { useState, useEffect } from 'react';
import { 
  Shield, Activity, Users, Search, Download, Filter, 
  Calendar, Eye, AlertTriangle, CheckCircle, Clock,
  BarChart3, TrendingUp, Database, RefreshCw
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { JournalisationService } from '../services/journalisationService';
import type { Journalisation, ActionType } from '../types/Journalisation';

export const AuditPage: React.FC = () => {
  const [statistiques, setStatistiques] = useState<any>(null);
  const [historique, setHistorique] = useState<Journalisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('month');
  const [filtres, setFiltres] = useState({
    action: '' as ActionType | '',
    utilisateur: '',
    dateDebut: '',
    dateFin: '',
    page: 0,
    taille: 20
  });

  useEffect(() => {
    chargerDonnees();
  }, [periode, filtres]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const [stats, hist] = await Promise.all([
        JournalisationService.obtenirStatistiquesAudit(periode),
        JournalisationService.obtenirHistorique(filtres)
      ]);
      
      setStatistiques(stats);
      setHistorique(hist.actions);
    } catch (error) {
      console.error('Erreur chargement audit:', error);
    } finally {
      setLoading(false);
    }
  };

  const exporterLogs = async () => {
    try {
      const blob = await JournalisationService.exporterLogs({
        dateDebut: filtres.dateDebut,
        dateFin: filtres.dateFin,
        format: 'json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export:', error);
    }
  };

  const getActionIcon = (action: string) => {
    const icons = {
      'CONNEXION': Users,
      'DECONNEXION': Users,
      'CREATION': CheckCircle,
      'MODIFICATION': Eye,
      'AFFECTATION': Users,
      'VALIDATION': CheckCircle,
      'ENVOI': TrendingUp,
      'CONSULTATION': Eye,
      'ARCHIVAGE': Database,
      'CLASSEMENT': Database
    };
    const IconComponent = icons[action as keyof typeof icons] || Activity;
    return <IconComponent className="w-4 h-4" />;
  };

  const getActionColor = (action: string) => {
    const colors = {
      'CONNEXION': 'text-green-400 bg-green-500/20',
      'DECONNEXION': 'text-orange-400 bg-orange-500/20',
      'CREATION': 'text-blue-400 bg-blue-500/20',
      'MODIFICATION': 'text-purple-400 bg-purple-500/20',
      'AFFECTATION': 'text-cyan-400 bg-cyan-500/20',
      'VALIDATION': 'text-emerald-400 bg-emerald-500/20',
      'ENVOI': 'text-pink-400 bg-pink-500/20',
      'CONSULTATION': 'text-slate-400 bg-slate-500/20',
      'ARCHIVAGE': 'text-gray-400 bg-gray-500/20',
      'CLASSEMENT': 'text-yellow-400 bg-yellow-500/20'
    };
    return colors[action as keyof typeof colors] || 'text-slate-400 bg-slate-500/20';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Audit et Journalisation</h1>
                  <p className="text-slate-400">Suivi des actions et sécurité du système</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select 
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                </select>

                <button 
                  onClick={chargerDonnees}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>

                <button 
                  onClick={exporterLogs}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
              </div>
            </div>

            {/* Statistiques d'audit */}
            {statistiques && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 text-blue-400" />
                    <span className="text-xs text-slate-400">Total</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{statistiques.totalActions}</h3>
                  <p className="text-sm text-slate-400">Actions enregistrées</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-green-400" />
                    <span className="text-xs text-slate-400">Actifs</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{statistiques.utilisateursActifs}</h3>
                  <p className="text-sm text-slate-400">Utilisateurs actifs</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle className="w-8 h-8 text-purple-400" />
                    <span className="text-xs text-slate-400">Créations</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{statistiques.actionsParType.CREATION || 0}</h3>
                  <p className="text-sm text-slate-400">Courriers créés</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Eye className="w-8 h-8 text-orange-400" />
                    <span className="text-xs text-slate-400">Consultations</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{statistiques.actionsParType.CONSULTATION || 0}</h3>
                  <p className="text-sm text-slate-400">Consultations</p>
                </div>
              </div>
            )}

            {/* Graphiques et analyses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Actions par type */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Actions par Type</h3>
                </div>
                
                {statistiques && (
                  <div className="space-y-3">
                    {Object.entries(statistiques.actionsParType).map(([type, nombre]) => {
                      const total = Object.values(statistiques.actionsParType).reduce((sum: number, val: any) => sum + val, 0);
                      const pourcentage = total > 0 ? (nombre as number / total) * 100 : 0;
                      
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">{type.replace('_', ' ')}</span>
                            <span className="text-sm font-medium text-white">{nombre as number}</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                              style={{ width: `${pourcentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Connexions par jour */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Connexions par Jour</h3>
                </div>
                
                {statistiques && (
                  <div className="space-y-3">
                    {statistiques.connexionsParJour.slice(-7).map((jour: any, index: number) => {
                      const maxConnexions = Math.max(...statistiques.connexionsParJour.map((j: any) => j.connexions));
                      const pourcentage = maxConnexions > 0 ? (jour.connexions / maxConnexions) * 100 : 0;
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">
                              {new Date(jour.date).toLocaleDateString('fr-FR', { 
                                weekday: 'short', 
                                day: 'numeric', 
                                month: 'short' 
                              })}
                            </span>
                            <span className="text-sm font-medium text-white">{jour.connexions}</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                              style={{ width: `${pourcentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Filtres de recherche */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Filtres de Recherche</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Action</label>
                  <select
                    value={filtres.action}
                    onChange={(e) => setFiltres(prev => ({ ...prev, action: e.target.value as ActionType | '' }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Toutes les actions</option>
                    <option value="CONNEXION">Connexion</option>
                    <option value="CREATION">Création</option>
                    <option value="MODIFICATION">Modification</option>
                    <option value="AFFECTATION">Affectation</option>
                    <option value="VALIDATION">Validation</option>
                    <option value="ENVOI">Envoi</option>
                    <option value="CONSULTATION">Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Utilisateur</label>
                  <input
                    type="text"
                    value={filtres.utilisateur}
                    onChange={(e) => setFiltres(prev => ({ ...prev, utilisateur: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="Nom utilisateur"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date début</label>
                  <input
                    type="date"
                    value={filtres.dateDebut}
                    onChange={(e) => setFiltres(prev => ({ ...prev, dateDebut: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date fin</label>
                  <input
                    type="date"
                    value={filtres.dateFin}
                    onChange={(e) => setFiltres(prev => ({ ...prev, dateFin: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Historique des actions */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">Historique des Actions</h3>
                </div>
                
                <span className="text-sm text-slate-400">
                  {historique.length} actions affichées
                </span>
              </div>

              {loading ? (
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
              ) : historique.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Aucune action trouvée</h3>
                  <p className="text-slate-400">Aucune action ne correspond aux critères sélectionnés.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {historique.map((action) => (
                    <div key={action.id} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(action.action)}`}>
                        {getActionIcon(action.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-white font-medium text-sm">
                            {action.action.replace('_', ' ')} - {action.entite} #{action.entiteId}
                          </h4>
                          <span className="text-slate-400 text-xs flex-shrink-0 ml-2">
                            {formatTempsEcoule(action.dateAction)}
                          </span>
                        </div>
                        
                        <p className="text-slate-300 text-sm mb-2">{action.details}</p>
                        
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Par: {action.utilisateur.prenom} {action.utilisateur.nom}</span>
                          <span>IP: {action.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};