// src/pages/Rapports.tsx
import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, Clock, Eye, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../auth/useAuth';
import { StatistiquesService } from '../services/statistiquesService';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const RapportsPage: React.FC = () => {
  const { user } = useAuth();

  // États
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState<any>(null);
  const [directions, setDirections] = useState<{ [key: string]: number }>({});
  const [evolution, setEvolution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chargement des données
  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Année pour l'évolution : année en cours sauf si on est en janvier -> année précédente
      const currentMonth = new Date().getMonth();
      const evolutionYear = currentMonth === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();

      const [globalStats, dirs, evol] = await Promise.all([
        StatistiquesService.obtenirStatistiquesGlobales(period),
        StatistiquesService.obtenirStatistiquesParDirection(period),
        StatistiquesService.obtenirEvolutionMensuelle(evolutionYear),
      ]);

      setStats(globalStats);
      setDirections(dirs);
      setEvolution(evol);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les statistiques du backend');
      // Valeurs par défaut pour éviter la casse
      setStats({
        totalCourriers: 0,
        courriersEnAttente: 0,
        courriersTraites: 0,
        courriersArchives: 0,
        courriersNonTraites: 0,
        courriersClasses: 0,
        courriersEntrants: 0,
        courriersSortants: 0,
        tauxTraitement: 0,
      });
      setDirections({});
      setEvolution([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [period]);

  // Export Excel (copié depuis AdminDashboard et adapté)
  const handleExport = async () => {
    if (!stats) {
      alert('Aucune donnée à exporter');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = `${user?.prenom} ${user?.nom}`;
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet('Rapport statistiques', {
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
        ['Total Courriers', stats.totalCourriers, stats.evolutionTotal ? (stats.evolutionTotal > 0 ? `+${stats.evolutionTotal}%` : `${stats.evolutionTotal}%`) : '—'],
        ['En attente', stats.courriersEnAttente, stats.evolutionEnAttente ? (stats.evolutionEnAttente > 0 ? `+${stats.evolutionEnAttente}%` : `${stats.evolutionEnAttente}%`) : '—'],
        ['Traités', stats.courriersTraites, stats.evolutionTraites ? (stats.evolutionTraites > 0 ? `+${stats.evolutionTraites}%` : `${stats.evolutionTraites}%`) : '—'],
        ['Archivés', stats.courriersArchives, stats.evolutionArchives ? (stats.evolutionArchives > 0 ? `+${stats.evolutionArchives}%` : `${stats.evolutionArchives}%`) : '—'],
        ['Non traités', stats.courriersNonTraites, stats.evolutionNonTraites ? (stats.evolutionNonTraites > 0 ? `+${stats.evolutionNonTraites}%` : `${stats.evolutionNonTraites}%`) : '—'],
        ['Classés', stats.courriersClasses, stats.evolutionClasses ? (stats.evolutionClasses > 0 ? `+${stats.evolutionClasses}%` : `${stats.evolutionClasses}%`) : '—'],
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
      const year = new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
      sheet.addRow([`Évolution mensuelle ${year}`]);
      const evolHeaderRow = sheet.addRow(['Mois', 'Entrants', 'Sortants']);
      evolHeaderRow.font = { bold: true };
      evolution.forEach(m => {
        sheet.addRow([m.mois, m.entrants, m.sortants]);
      });
    }

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `rapport-courriers-inseed-${period}-${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
    } catch (err) {
      console.error('Erreur export Excel', err);
      alert('Erreur lors de la génération du fichier Excel');
    }
  };

  // Gestion des droits (admin uniquement)
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 pt-24 p-8">
            <div className="text-center py-20">
              <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white">Accès refusé</h1>
              <p className="text-slate-400">Réservé aux administrateurs.</p>
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
          <div className="max-w-7xl mx-auto">
            {/* En-tête */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-8 h-8 text-yellow-400" />
                  <h1 className="text-3xl font-bold text-white">Rapports & Statistiques</h1>
                </div>
                <p className="text-slate-400">Données réelles du système de courriers</p>
              </div>
              <div className="flex gap-3">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="year">Cette année</option>
                </select>
                <button
                  onClick={loadStats}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
              </div>
            </div>

            {/* Chargement / Erreur */}
            {loading && <div className="text-center text-white py-10">Chargement des statistiques...</div>}
            {error && <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-center">{error}</div>}

            {!loading && !error && stats && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
                    <Calendar className="w-8 h-8 text-purple-400 mb-3" />
                    <h3 className="text-2xl font-bold text-white mb-2">{stats.totalCourriers || 0}</h3>
                    <p className="text-slate-300">Total courriers</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
                    <Clock className="w-8 h-8 text-blue-400 mb-3" />
                    <h3 className="text-2xl font-bold text-white mb-2">{stats.tauxTraitement || 0}%</h3>
                    <p className="text-slate-300">Taux de traitement</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
                    <BarChart3 className="w-8 h-8 text-green-400 mb-3" />
                    <h3 className="text-2xl font-bold text-white mb-2">{stats.courriersTraites || 0}</h3>
                    <p className="text-slate-300">Courriers traités</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
                    <Clock className="w-8 h-8 text-orange-400 mb-3" />
                    <h3 className="text-2xl font-bold text-white mb-2">{stats.courriersEnAttente || 0}</h3>
                    <p className="text-slate-300">En attente</p>
                  </div>
                </div>

                {/* Tableau de synthèse */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8">
                  <h2 className="text-xl font-semibold text-white mb-4">Synthèse ({period})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300">Courriers entrants</span>
                        <span className="text-white font-bold">{stats.courriersEntrants || 0}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300">Courriers sortants</span>
                        <span className="text-white font-bold">{stats.courriersSortants || 0}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300">Archivés</span>
                        <span className="text-white font-bold">{stats.courriersArchives || 0}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300">Non traités</span>
                        <span className="text-white font-bold">{stats.courriersNonTraites || 0}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-slate-300">Classés</span>
                        <span className="text-white font-bold">{stats.courriersClasses || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Répartition par direction */}
                {Object.keys(directions).length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Répartition par direction</h2>
                    <div className="space-y-2">
                      {Object.entries(directions).map(([dir, count]) => (
                        <div key={dir} className="flex justify-between items-center p-2 border-b border-slate-700">
                          <span className="text-slate-300">{dir}</span>
                          <span className="text-white font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Évolution mensuelle (liste des rapports sauvegardés) */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Évolution mensuelle (entrants / sortants)
                  </h2>
                  {evolution.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">Aucune donnée d'évolution disponible</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="border-b border-slate-700">
                          <tr>
                            <th className="pb-2 text-slate-400">Mois</th>
                            <th className="pb-2 text-slate-400">Entrants</th>
                            <th className="pb-2 text-slate-400">Sortants</th>
                            <th className="pb-2 text-slate-400"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {evolution.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-700/50">
                              <td className="py-2 text-white">{item.mois}</td>
                              <td className="py-2 text-green-400">{item.entrants}</td>
                              <td className="py-2 text-blue-400">{item.sortants}</td>
                              <td className="py-2">
                                <button className="text-xs text-purple-400 hover:underline">Voir détail</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};