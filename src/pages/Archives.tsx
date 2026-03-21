import React, { useState } from 'react';
import { 
  Archive, Search, Download, Eye, Filter
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const ArchivesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  
  const archives = [
    { id: 1, reference: 'ARC-2024-001', titre: 'Courrier administratif', type: 'Entrant', date: '2024-01-15', auteur: 'Jean Dupont' },
    { id: 2, reference: 'ARC-2024-002', titre: 'Demande de documents', type: 'Sortant', date: '2024-01-14', auteur: 'Marie Martin' },
    { id: 3, reference: 'ARC-2024-003', titre: 'Réponse mairie', type: 'Entrant', date: '2024-01-13', auteur: 'Pierre Lambert' },
    { id: 4, reference: 'ARC-2024-004', titre: 'Rapport annuel', type: 'Document', date: '2024-01-12', auteur: 'Sophie Dubois' },
    { id: 5, reference: 'ARC-2024-005', titre: 'Contrat signé', type: 'Document', date: '2024-01-10', auteur: 'Luc Bernard' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Archive className="w-8 h-8 text-blue-400" />
                <h1 className="text-3xl font-bold text-white">Archives</h1>
              </div>
              <p className="text-slate-400">Consultez tous les courriers et documents archivés</p>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher dans les archives..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
                
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="tous">Tous les types</option>
                  <option value="entrant">Entrants</option>
                  <option value="sortant">Sortants</option>
                  <option value="document">Documents</option>
                </select>

                <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Exporter tout
                </button>
              </div>
            </div>

            {/* Liste des archives */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left p-4 text-slate-300 font-medium">Référence</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Titre</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Type</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Date</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Auteur</th>
                    <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {archives.map((item) => (
                    <tr key={item.id} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 text-slate-300 font-mono text-sm">{item.reference}</td>
                      <td className="p-4 text-white">{item.titre}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          item.type === 'Entrant' ? 'bg-green-500/20 text-green-400' :
                          item.type === 'Sortant' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{item.date}</td>
                      <td className="p-4 text-slate-400">{item.auteur}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-purple-400 hover:bg-purple-500/20 rounded transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};