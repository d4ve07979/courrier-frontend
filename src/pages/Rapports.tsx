import React from 'react';
import { BarChart3, Download, Calendar, Clock, Eye } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../auth/useAuth';

export const RapportsPage: React.FC = () => {
  const { user } = useAuth();

  // Vérifier si l'utilisateur a le rôle ADMIN
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto text-center py-20">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-slate-600" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Accès refusé</h1>
              <p className="text-slate-400 mb-4">
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              </p>
              <p className="text-slate-500 text-sm">
                Les rapports et statistiques sont réservés aux administrateurs.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const rapports = [
    { id: 1, titre: 'Rapport mensuel - Janvier 2024', type: 'Statistiques', date: '2024-01-31', statut: 'Complété' },
    { id: 2, titre: 'Analyse des courriers', type: 'Analytique', date: '2024-01-28', statut: 'En cours' },
    { id: 3, titre: 'Performance équipe', type: 'RH', date: '2024-01-25', statut: 'Complété' },
  ];

  const generateDailyReport = () => {
    const now = new Date();
    const report = {
      titre: `Rapport quotidien - ${now.toLocaleDateString('fr-FR')}`,
      dateGeneration: now.toISOString(),
      generePar: `${user?.prenom} ${user?.nom}`,
      statistiques: {
        courriersTraites: 24,
        courriersEnAttente: 8,
        courriersArchives: 15,
        tempsTraitementMoyen: '2h 30min'
      },
      activites: [
        { heure: '09:00', action: 'Réception de 5 nouveaux courriers', utilisateur: 'Jean Dupont' },
        { heure: '10:30', action: 'Traitement de 12 courriers', utilisateur: 'Marie Martin' },
        { heure: '14:00', action: 'Envoi de 8 courriers sortants', utilisateur: 'Pierre Lambert' },
        { heure: '16:30', action: 'Archivage de 15 courriers', utilisateur: user?.prenom + ' ' + user?.nom },
      ],
      resume: {
        courriersRecus: 18,
        courriersEnvoyes: 12,
        tauxTraitement: '75%',
        tempsReponseMin: '45 min',
        tempsReponseMax: '4h 20min',
      }
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-quotidien-${now.toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ Rapport du jour généré et téléchargé');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-8 h-8 text-yellow-400" />
                  <h1 className="text-3xl font-bold text-white">Rapports</h1>
                </div>
                <p className="text-slate-400">Générez et consultez vos rapports d'activité</p>
              </div>
              <button 
                onClick={generateDailyReport}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                Générer rapport du jour
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
                <Calendar className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">15</h3>
                <p className="text-slate-300">Rapports ce mois</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
                <Clock className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">2h 30m</h3>
                <p className="text-slate-300">Temps moyen</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
                <BarChart3 className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">94%</h3>
                <p className="text-slate-300">Taux de complétion</p>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Rapports récents</h2>
              <div className="space-y-3">
                {rapports.map((rapport) => (
                  <div key={rapport.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      <div>
                        <h3 className="text-white font-medium">{rapport.titre}</h3>
                        <p className="text-slate-400 text-sm">{rapport.type} • {rapport.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        rapport.statut === 'Complété' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {rapport.statut}
                      </span>
                      <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-purple-400 hover:bg-purple-500/20 rounded transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};