// src/pages/Dashboard.tsx
import React from 'react';
import { 
  Mail, Clock, CheckCircle, Archive, 
  Download, ArrowUp, ArrowDown,
  RefreshCw, TrendingUp,
  BarChart3, Users, Send, FileText, AlertTriangle,
  Eye, EyeOff
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useAuth } from '../auth/useAuth';
import { StatistiquesService } from '../services/statistiquesService';
import { CourrierService } from '../services/courrierService';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { StatistiquesAvancees } from '../components/dashboard/StatistiquesAvancees';
import { ActivitesRecentes } from '../components/dashboard/ActivitesRecentes';
import { BackendStatus } from '../components/BackendStatus';
import { hasPermission, ROLES } from '../utils/permissions';
import logoInseed from '../assets/logo-inseed-officiel.jpg';
import { DGDashboard } from './dashboards/DGDashboard'; // Import du dashboard DG

const StatCard = React.memo(({ icon: Icon, title, value, change, color, loading, onClick, show }: any) => {
  if (show === false) return null;
  
  return (
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
  );
});

const DashboardContent: React.FC = () => {
  const { user } = useAuth();

  const [period, setPeriod] = React.useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customYear, setCustomYear] = React.useState<number>(new Date().getFullYear());

  const [stats, setStats] = React.useState<any>(null);
  const [directions, setDirections] = React.useState<{ [key: string]: number }>({});
  const [evolution, setEvolution] = React.useState<any[]>([]);
  const [mesCourriers, setMesCourriers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Vérifications de permissions
  const isAdmin = user?.role === 'ADMIN';
  const isDG = user?.role === 'DG';
  const isSecretariat = user?.role === 'SECRETARIAT';
  const isDirection = user?.role === 'DIRECTION';
  const isDivision = user?.role === 'DIVISION';
  const isServices = user?.role === 'SERVICES';

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentMonth = new Date().getMonth();
      const baseEvolutionYear = currentMonth === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
      const evolutionYear = period === 'custom' ? customYear : baseEvolutionYear;

      // Charger les données selon les permissions
      const promises = [];
      
      // Les admins voient toutes les stats
      if (isAdmin) {
        promises.push(
          StatistiquesService.obtenirStatistiquesGlobales(period),
          StatistiquesService.obtenirStatistiquesParDirection(period),
          StatistiquesService.obtenirEvolutionMensuelle(evolutionYear)
        );
      } else {
        // Les autres voient juste leurs stats
        promises.push(
          Promise.resolve({ totalCourriers: 0, courriersEnAttente: 0, courriersTraites: 0 }),
          Promise.resolve({}),
          Promise.resolve([])
        );
      }

      // Tout le monde voit ses courriers
      const mesCourriersData = await CourrierService.listerMesCourriers({ page: 0, size: 100 });
      const mesCourriersList = Array.isArray(mesCourriersData) 
        ? mesCourriersData 
        : mesCourriersData.courriers || [];
      
      setMesCourriers(mesCourriersList);

      const [globalStats, dirs, evol] = await Promise.all(promises);

      setStats(globalStats);
      setDirections(dirs);
      setEvolution(evol);

    } catch (err) {
      setError('Impossible de charger les statistiques du backend');
      setStats({
        totalCourriers: 0,
        courriersEnAttente: 0,
        courriersTraites: 0,
        courriersArchives: 0,
        courriersNonTraites: 0,
        courriersClasses: 0,
        courriersEntrants: 0,
        courriersSortants: 0,
        tauxTraitement: 0
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, [period, customYear]);

  const handlePeriodChange = (newPeriod: typeof period) => {
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setCustomYear(new Date().getFullYear());
    }
  };

  const isEmptyToday = period === 'today' && stats && stats.totalCourriers === 0;

  const handleExport = async () => {
    if (!stats) {
      alert('Aucune donnée à exporter');
      return;
    }

    // Seuls les admins peuvent exporter
    if (!isAdmin) {
      alert('Vous n\'avez pas les permissions pour exporter les données');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = `${user?.prenom} ${user?.nom}`;
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet('Tableau de bord', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    sheet.mergeCells('A1:K1');
    sheet.getCell('A1').value = 'RAPPORT STATISTIQUES COURRIERS - INSEED';
    sheet.getCell('A1').font = { size: 18, bold: true, color: { argb: 'FF1E40AF' } };
    sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 45;

    const periodLabel = {
      today: "Aujourd'hui",
      week: 'Cette semaine',
      month: 'Ce mois-ci',
      year: 'Cette année',
      custom: `Année ${customYear}`
    }[period];

    sheet.mergeCells('A2:K2');
    sheet.getCell('A2').value = `Période : ${periodLabel} | Généré le ${new Date().toLocaleDateString('fr-TG')} à ${new Date().toLocaleTimeString('fr-TG')} par ${user?.prenom} ${user?.nom}`;
    sheet.getCell('A2').font = { size: 11, italic: true };
    sheet.getCell('A2').alignment = { horizontal: 'center' };

    sheet.getRow(4).height = 25;

    sheet.addTable({
      name: 'Stats',
      ref: 'A5',
      headerRow: true,
      totalsRow: false,
      style: { theme: 'TableStyleMedium2', showRowStripes: true },
      columns: [
        { name: 'Indicateur', filterButton: true },
        { name: 'Nombre', filterButton: true },
        { name: 'Évolution (%)', filterButton: true },
      ],
      rows: [
        ['Total Courriers', stats.totalCourriers, formatEvolution(stats.evolutionTotal)],
        ['En attente', stats.courriersEnAttente, formatEvolution(stats.evolutionEnAttente)],
        ['Traités', stats.courriersTraites, formatEvolution(stats.evolutionTraites)],
        ['Archivés', stats.courriersArchives, formatEvolution(stats.evolutionArchives)],
        ['Non traités', stats.courriersNonTraites, formatEvolution(stats.evolutionNonTraites)],
        ['Classés', stats.courriersClasses, formatEvolution(stats.evolutionClasses)],
        ['Courriers Entrants', stats.courriersEntrants, '—'],
        ['Courriers Sortants', stats.courriersSortants, '—'],
        ['Taux de traitement', `${stats.tauxTraitement}%`, '—'],
      ],
    });

    sheet.getColumn('A').width = 35;
    sheet.getColumn('B').width = 18;
    sheet.getColumn('C').width = 18;

    if (Object.keys(directions).length > 0) {
      sheet.addRow([]);
      sheet.addRow(['Répartition par direction (nombre de courriers affectés)']);
      const dirHeaderRow = sheet.addRow(['Direction', 'Nombre de courriers']);
      dirHeaderRow.font = { bold: true };
      Object.entries(directions).forEach(([dir, count]) => {
        sheet.addRow([dir, count]);
      });
    }

    if (evolution.length > 0) {
      sheet.addRow([]);
      const currentMonth = new Date().getMonth();
      const evolutionYear = currentMonth === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
      const finalYear = period === 'custom' ? customYear : evolutionYear;
      sheet.addRow([`Évolution mensuelle ${finalYear}`]);
      const evolHeaderRow = sheet.addRow(['Mois', 'Entrants', 'Sortants']);
      evolHeaderRow.font = { bold: true };
      evolution.forEach(m => {
        sheet.addRow([m.mois, m.entrants, m.sortants]);
      });
    }

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `rapport-courriers-inseed-${period}${period === 'custom' ? `-${customYear}` : ''}-${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
    } catch (err) {
      console.error('Erreur export Excel', err);
      alert('Erreur lors de la génération du fichier Excel');
    }
  };

  const formatEvolution = (val: number | undefined): string => {
    if (val === undefined || val === null) return '—';
    return val > 0 ? `+${val}%` : `${val}%`;
  };

  const handleStatCardClick = (title: string) => {
    const filterMap: { [key: string]: string } = {
      'Total Courriers': '',
      'En attente': 'EN_ATTENTE',
      'Traités': 'TRAITE',
      'Archivés': 'ARCHIVE',
      'Non traités': 'NON_TRAITE',
      'Classés': 'CLASSE'
    };
    const filter = filterMap[title];
    if (filter !== undefined) {
      window.location.href = `/courriers${filter ? `?statut=${filter}` : ''}`;
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement des statistiques...</p>
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
                    Tableau de bord {user?.role === 'ADMIN' ? 'Administrateur' : user?.role === 'SECRETARIAT' ? 'Secrétariat' : user?.role}
                  </h1>
                  <p className="text-slate-400">
                    Bienvenue, {user?.prenom} {user?.nom}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Sélecteur de période - visible pour tous */}
                <select 
                  value={period}
                  onChange={(e) => handlePeriodChange(e.target.value as any)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                  <option value="custom">Année personnalisée...</option>
                </select>

                {period === 'custom' && (
                  <input
                    type="number"
                    value={customYear}
                    onChange={(e) => setCustomYear(parseInt(e.target.value) || new Date().getFullYear())}
                    min="2020"
                    max="2030"
                    className="w-28 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                )}

                <button 
                  onClick={loadStats}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Actualisation...' : 'Actualiser'}
                </button>

                {/* Bouton Exporter - seulement pour admin */}
                {isAdmin && (
                  <button 
                    onClick={handleExport}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Exporter
                  </button>
                )}
              </div>
            </div>

            <BackendStatus onRetry={loadStats} />

            {error && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-yellow-400">{error}</p>
              </div>
            )}

            {isEmptyToday && (
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-blue-300 mb-2">
                  Aucune activité enregistrée aujourd'hui
                </h3>
                <p className="text-blue-400 max-w-md mx-auto">
                  Les premiers courriers de {new Date().getFullYear()} apparaîtront ici dès leur enregistrement.
                </p>
              </div>
            )}

            {stats && !isEmptyToday && (
              <>
                {/* Cartes de statistiques - adaptées selon le rôle */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  <StatCard
                    icon={Mail}
                    title={isAdmin ? "Total Courriers" : "Mes courriers"}
                    value={isAdmin ? stats.totalCourriers : mesCourriers.length}
                    change={isAdmin ? (stats.evolutionTotal ?? 0) : undefined}
                    color="from-purple-500/20 to-purple-600/20 border-purple-500/30"
                    loading={loading}
                    onClick={() => isAdmin ? handleStatCardClick('Total Courriers') : window.location.href = '/mes-courriers'}
                    show={true}
                  />
                  
                  {/* En attente - visible pour tous */}
                  <StatCard
                    icon={Clock}
                    title="En attente"
                    value={isAdmin ? stats.courriersEnAttente : mesCourriers.filter(c => c.id_statut?.code_statut === 'EN_ATTENTE').length}
                    change={isAdmin ? (stats.evolutionEnAttente ?? 0) : undefined}
                    color="from-orange-500/20 to-orange-600/20 border-orange-500/30"
                    loading={loading}
                    onClick={() => handleStatCardClick('En attente')}
                    show={true}
                  />
                  
                  {/* Traités - visible pour tous */}
                  <StatCard
                    icon={CheckCircle}
                    title="Traités"
                    value={isAdmin ? stats.courriersTraites : mesCourriers.filter(c => ['TRAITE', 'VALIDE'].includes(c.id_statut?.code_statut)).length}
                    change={isAdmin ? (stats.evolutionTraites ?? 0) : undefined}
                    color="from-green-500/20 to-green-600/20 border-green-500/30"
                    loading={loading}
                    onClick={() => handleStatCardClick('Traités')}
                    show={true}
                  />
                  
                  {/* Archivés - seulement admin */}
                  <StatCard
                    icon={Archive}
                    title="Archivés"
                    value={stats.courriersArchives}
                    change={stats.evolutionArchives ?? 0}
                    color="from-blue-500/20 to-blue-600/20 border-blue-500/30"
                    loading={loading}
                    onClick={() => handleStatCardClick('Archivés')}
                    show={isAdmin}
                  />
                  
                  {/* Non traités - seulement admin */}
                  <StatCard
                    icon={AlertTriangle}
                    title="Non traités"
                    value={stats.courriersNonTraites}
                    change={stats.evolutionNonTraites ?? 0}
                    color="from-red-500/20 to-red-600/20 border-red-500/30"
                    loading={loading}
                    onClick={() => handleStatCardClick('Non traités')}
                    show={isAdmin}
                  />
                  
                  {/* Classés - seulement admin */}
                  <StatCard
                    icon={FileText}
                    title="Classés"
                    value={stats.courriersClasses}
                    change={stats.evolutionClasses ?? 0}
                    color="from-indigo-500/20 to-indigo-600/20 border-indigo-500/30"
                    loading={loading}
                    onClick={() => handleStatCardClick('Classés')}
                    show={isAdmin}
                  />
                </div>

                {/* Statistiques avancées - seulement admin */}
                {isAdmin && <StatistiquesAvancees periode={period} />}

                {/* Grille d'activités */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Activités récentes - adapté selon le rôle */}
                  <ActivitesRecentes limite={8} userId={isAdmin ? undefined : user?.id} />
                  
                  {/* Répartition Entrants/Sortants - visible pour tous mais avec données adaptées */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                        {isAdmin ? "Répartition Entrants/Sortants" : "Mes courriers par type"}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-400">Courriers Entrants</span>
                          <span className="text-sm font-medium text-white">
                            {isAdmin ? stats.courriersEntrants : mesCourriers.filter(c => c.id_type_courrier?.code === 'ENT').length}
                          </span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                            style={{ 
                              width: `${((isAdmin ? stats.courriersEntrants : mesCourriers.filter(c => c.id_type_courrier?.code === 'ENT').length) / 
                                Math.max((isAdmin ? stats.totalCourriers : mesCourriers.length), 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-400">Courriers Sortants</span>
                          <span className="text-sm font-medium text-white">
                            {isAdmin ? stats.courriersSortants : mesCourriers.filter(c => c.id_type_courrier?.code === 'SOR').length}
                          </span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                            style={{ 
                              width: `${((isAdmin ? stats.courriersSortants : mesCourriers.filter(c => c.id_type_courrier?.code === 'SOR').length) / 
                                Math.max((isAdmin ? stats.totalCourriers : mesCourriers.length), 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Taux de traitement - seulement admin */}
                      {isAdmin && (
                        <div className="pt-4 border-t border-slate-600">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-green-500/10 rounded-lg">
                              <div className="text-lg font-bold text-green-400">{stats.tauxTraitement}%</div>
                              <div className="text-xs text-green-300">Taux de traitement</div>
                            </div>
                            <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                              <div className="text-lg font-bold text-orange-400">5.2j</div>
                              <div className="text-xs text-orange-300">Délai moyen</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions rapides - adaptées selon le rôle */}
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
                    
                    {/* Gestion des utilisateurs - seulement admin */}
                    {isAdmin && (
                      <button 
                        onClick={() => window.location.href = '/parametres?section=utilisateurs'}
                        className="p-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-white transition-colors cursor-pointer text-center group"
                      >
                        <Users className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Utilisateurs</span>
                        <p className="text-xs text-slate-400 mt-1">Gérer les accès et rôles</p>
                      </button>
                    )}
                    
                    {/* Mes courriers - pour les non-admin */}
                    {!isAdmin && (
                      <button 
                        onClick={() => window.location.href = '/mes-courriers'}
                        className="p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-white transition-colors cursor-pointer text-center group"
                      >
                        <FileText className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Mes courriers</span>
                        <p className="text-xs text-slate-400 mt-1">Gérer vos courriers créés</p>
                      </button>
                    )}
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
//ici modification 5 mars 2026

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Si l'utilisateur est DG, afficher le dashboard spécifique
  if (user?.role === 'DG') {
    return <DGDashboard />;
  }

  // Sinon, afficher le dashboard standard (pour tous les autres rôles)
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
};