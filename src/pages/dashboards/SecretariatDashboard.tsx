// src/pages/dashboards/SecretariatDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, FileText, Clock, CheckCircle, 
  TrendingUp, BarChart3, Download, RefreshCw, User,
  ArrowUp, ArrowDown, Users, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { CourrierService } from '../../services/courrierService';
import { StatistiquesService } from '../../services/statistiquesService';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { ActivitesRecentes } from '../../components/dashboard/ActivitesRecentes';
import { BackendStatus } from '../../components/BackendStatus';
import { formatUtils } from '../../utils/formatUtils';
import logoInseed from '../../assets/logo-inseed-officiel.jpg';

// Version améliorée de StatCard avec les mêmes props que Dashboard.tsx
const StatCard = React.memo(({ icon: Icon, title, value, change, color, loading, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full bg-gradient-to-br ${color} backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer`}
  >
    <div className="flex items-center justify-between mb-4">
      <Icon className="w-8 h-8 text-white" />
      {change !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
      )}
    </div>
    <h3 className="text-3xl font-bold text-white mb-1">
      {loading ? '...' : (value || 0)}
    </h3>
    <p className="text-sm text-slate-300">{title}</p>
  </button>
));

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Statistiques globales
      const globalStats = await StatistiquesService.obtenirStatistiquesGlobales(period);
      
      // Récupérer MES courriers
      const mesCourriersData = await CourrierService.listerMesCourriers({ page: 0, size: 100 });
      
      const mesCourriersList = Array.isArray(mesCourriersData) 
        ? mesCourriersData 
        : mesCourriersData.courriers || [];
      
      const mesStats = {
        total: mesCourriersList.length,
        enAttente: mesCourriersList.filter((c: any) => c.id_statut?.code_statut === 'EN_ATTENTE').length,
        traites: mesCourriersList.filter((c: any) => ['TRAITE', 'VALIDE'].includes(c.id_statut?.code_statut)).length,
        entrants: mesCourriersList.filter((c: any) => c.id_type_courrier?.code === 'ENT').length,
        sortants: mesCourriersList.filter((c: any) => c.id_type_courrier?.code === 'SOR').length,
      };

      // Calcul des évolutions (simulées pour l'instant)
      const evolution = {
        total: Math.floor(Math.random() * 20) - 10,
        enAttente: Math.floor(Math.random() * 20) - 10,
        traites: Math.floor(Math.random() * 20) - 10,
      };

      setStats({
        global: globalStats,
        personnel: mesStats,
        evolution,
        courriers: mesCourriersList.slice(0, 10)
      });

    } catch (err) {
      console.error('❌ Erreur chargement données:', err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const handlePeriodChange = (newPeriod: typeof period) => {
    setPeriod(newPeriod);
  };

  const handleStatCardClick = (title: string, filter?: string) => {
    if (filter) {
      window.location.href = `/mes-courriers?statut=${filter}`;
    } else {
      window.location.href = '/mes-courriers';
    }
  };

  const handleExport = () => {
    alert('Export des statistiques (à implémenter)');
  };

  const isEmpty = stats?.personnel?.total === 0;

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 pt-24 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Chargement de votre tableau de bord...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 pt-24 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* En-tête comme dans Dashboard.tsx */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-xl p-2 border-2 border-green-600 shadow-md">
                  <img
                    src={logoInseed}
                    alt="Logo officiel INSEED - République Togolaise"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    Tableau de bord Secrétariat
                  </h1>
                  <p className="text-slate-400 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {user?.prenom} {user?.nom} • {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select 
                  value={period}
                  onChange={(e) => handlePeriodChange(e.target.value as any)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                </select>

                <button 
                  onClick={loadData}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Actualisation...' : 'Actualiser'}
                </button>

                <button 
                  onClick={handleExport}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
              </div>
            </div>

            <BackendStatus onRetry={loadData} />

            {error && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-yellow-400">{error}</p>
              </div>
            )}

            {isEmpty && (
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-blue-300 mb-2">
                  Aucune activité enregistrée
                </h3>
                <p className="text-blue-400 max-w-md mx-auto">
                  Vous n'avez pas encore créé de courriers. Commencez par en créer un !
                </p>
              </div>
            )}

            {stats && !isEmpty && (
              <>
                {/* Statistiques personnelles - style Dashboard.tsx */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <StatCard
                    icon={Mail}
                    title="Mes courriers"
                    value={stats.personnel.total}
                    change={stats.evolution.total}
                    color="from-purple-500/20 to-purple-600/20 border-purple-500/30"
                    loading={loading}
                    onClick={() => handleStatCardClick('Mes courriers')}
                  />
                  <StatCard
                    icon={Clock}
                    title="En attente"
                    value={stats.personnel.enAttente}
                    change={stats.evolution.enAttente}
                    color="from-orange-500/20 to-orange-600/20 border-orange-500/30"
                    loading={loading}
                    onClick={() => handleStatCardClick('En attente', 'EN_ATTENTE')}
                  />
                  <StatCard
                    icon={CheckCircle}
                    title="Traités"
                    value={stats.personnel.traites}
                    change={stats.evolution.traites}
                    color="from-green-500/20 to-green-600/20 border-green-500/30"
                    loading={loading}
                    onClick={() => handleStatCardClick('Traités', 'TRAITE')}
                  />
                  <StatCard
                    icon={Send}
                    title="Entrants"
                    value={stats.personnel.entrants}
                    color="from-blue-500/20 to-blue-600/20 border-blue-500/30"
                    loading={loading}
                    onClick={() => handleStatCardClick('Entrants')}
                  />
                  <StatCard
                    icon={FileText}
                    title="Sortants"
                    value={stats.personnel.sortants}
                    color="from-indigo-500/20 to-indigo-600/20 border-indigo-500/30"
                    loading={loading}
                    onClick={() => handleStatCardClick('Sortants')}
                  />
                </div>

                {/* Grille à 2 colonnes comme dans Dashboard.tsx */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Activités récentes */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      Activités récentes
                    </h3>
                    <ActivitesRecentes limite={8} />
                  </div>

                  {/* Statistiques globales */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      Aperçu global
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-400">Total courriers</span>
                          <span className="text-sm font-medium text-white">{stats.global?.totalCourriers || 0}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-600">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                            <div className="text-lg font-bold text-purple-400">{stats.global?.courriersEntrants || 0}</div>
                            <div className="text-xs text-purple-300">Entrants</div>
                          </div>
                          <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                            <div className="text-lg font-bold text-blue-400">{stats.global?.courriersSortants || 0}</div>
                            <div className="text-xs text-blue-300">Sortants</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-green-500/10 rounded-lg">
                            <div className="text-lg font-bold text-green-400">{stats.global?.tauxTraitement || 0}%</div>
                            <div className="text-xs text-green-300">Taux traitement</div>
                          </div>
                          <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                            <div className="text-lg font-bold text-orange-400">{stats.global?.courriersEnAttente || 0}</div>
                            <div className="text-xs text-orange-300">En attente</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mes derniers courriers - Section supplémentaire */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Mes derniers courriers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.courriers && stats.courriers.length > 0 ? (
                      stats.courriers.map((courrier: any) => (
                        <div
                          key={courrier.id_courrier}
                          className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                          onClick={() => window.location.href = `/courriers/${courrier.id_courrier}`}
                        >
                          <p className="text-white font-medium text-sm truncate mb-2">
                            {courrier.objet}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              courrier.id_statut?.code_statut === 'EN_ATTENTE' 
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                              {courrier.id_statut?.libelle_statut}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatUtils.date(courrier.date_reception)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-4 col-span-3">
                        Aucun courrier créé
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions rapides - style Dashboard.tsx */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Actions rapides</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button 
                      onClick={() => window.location.href = '/courriers?mode=nouveau-entrant'}
                      className="p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-white transition-colors cursor-pointer text-center group"
                    >
                      <Mail className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Courrier Entrant</span>
                      <p className="text-xs text-slate-400 mt-1">Enregistrer un nouveau courrier reçu</p>
                    </button>
                    
                    <button 
                      onClick={() => window.location.href = '/courriers?mode=nouveau-sortant'}
                      className="p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-white transition-colors cursor-pointer text-center group"
                    >
                      <Send className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Courrier Sortant</span>
                      <p className="text-xs text-slate-400 mt-1">Préparer un courrier à envoyer</p>
                    </button>

                    <button
                      onClick={() => window.location.href = '/nouveau-courrier'}
                      className="p-4 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-white transition-colors cursor-pointer text-center group"
                    >
                      <FileText className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Nouveau Courrier</span>
                      <p className="text-xs text-slate-400 mt-1">Créer avec fichier et affectations</p>
                    </button>
                    
                    <button 
                      onClick={() => window.location.href = '/mes-courriers'}
                      className="p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-white transition-colors cursor-pointer text-center group"
                    >
                      <Users className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Mes courriers</span>
                      <p className="text-xs text-slate-400 mt-1">Gérer vos courriers créés</p>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export const SecretariatDashboard: React.FC = () => {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
};