// src/pages/Rapports.tsx (version dynamique)
import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, Clock, Eye } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../auth/useAuth';
import { StatistiquesService } from '../services/statistiquesService';

export const RapportsPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Période par défaut : mois en cours
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await StatistiquesService.obtenirStatistiquesGlobales(period);
      setStats(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  // Vérifier le rôle (uniquement ADMIN)
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
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-8 h-8 text-yellow-400" />
                  <h1 className="text-3xl font-bold text-white">Rapports & Statistiques</h1>
                </div>
                <p className="text-slate-400">Données réelles du système de courriers</p>
              </div>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
            </div>

            {loading && <div className="text-white text-center py-10">Chargement...</div>}
            {error && <div className="text-red-400 text-center py-10">{error}</div>}

            {stats && !loading && (
              <>
                {/* KPI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                </div>

                {/* Tableau récapitulatif */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Synthèse ({period})</h2>
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
                      <span className="text-slate-300">En attente</span>
                      <span className="text-white font-bold">{stats.courriersEnAttente || 0}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Archivés</span>
                      <span className="text-white font-bold">{stats.courriersArchives || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Bouton export (à implémenter avec la même fonction que AdminDashboard) */}
                <div className="mt-6 text-right">
                  <button
                    onClick={() => alert('Export à implémenter via ExcelJS comme dans AdminDashboard')}
                    className="px-5 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white flex items-center gap-2 ml-auto"
                  >
                    <Download size={16} /> Exporter le rapport
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};