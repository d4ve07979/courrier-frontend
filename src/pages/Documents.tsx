import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const DocumentsPage: React.FC = () => {
  const documents = [
    { id: 1, nom: 'Rapport Q1 2024', type: 'PDF', taille: '2.4 MB', dateModif: '2024-01-20', partage: 'Équipe' },
    { id: 2, nom: 'Contrat client ABC', type: 'DOCX', taille: '156 KB', dateModif: '2024-01-19', partage: 'Privé' },
    { id: 3, nom: 'Présentation projet', type: 'PPTX', taille: '5.1 MB', dateModif: '2024-01-18', partage: 'Public' },
    { id: 4, nom: 'Budget 2024', type: 'XLSX', taille: '892 KB', dateModif: '2024-01-17', partage: 'Finance' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-green-400" />
                <h1 className="text-3xl font-bold text-white">Documents</h1>
              </div>
              <p className="text-slate-400">Gérez tous vos documents</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition-all cursor-pointer">
                  <FileText className="w-12 h-12 text-purple-400 mb-4" />
                  <h3 className="text-white font-semibold mb-2">{doc.nom}</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-400">Type: {doc.type}</p>
                    <p className="text-slate-400">Taille: {doc.taille}</p>
                    <p className="text-slate-400">Modifié: {doc.dateModif}</p>
                    <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs mt-2">
                      {doc.partage}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm transition-colors">
                      Ouvrir
                    </button>
                    <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};