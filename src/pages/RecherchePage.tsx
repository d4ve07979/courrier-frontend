// src/pages/RecherchePage.tsx
import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Search, Mail, Users, FileText, AlertCircle } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import { useLocation, useNavigate } from 'react-router-dom';

interface ResultatRecherche {
  id: number;
  title: string;
  type: 'courrier' | 'contact' | 'document';
  status?: string;
  description: string;
  date: string;
}

export const RecherchePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q') || '';

  const [resultats, setResultats] = useState<ResultatRecherche[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResultats([]);
      setLoading(false);
      return;
    }

    const rechercher = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get('/api/courriers/rechercher', {
          params: { q: query }
        });

        if (response.data.success) {
          setResultats(response.data.resultats);
        } else {
          setResultats([]);
        }
      } catch (err) {
        setError('Erreur lors de la recherche');
        console.error(err);
        setResultats([]);
      } finally {
        setLoading(false);
      }
    };

    rechercher();
  }, [query]);

  const renderIcon = (type: string) => {
    switch (type) {
      case 'courrier': return <Mail className="w-5 h-5 text-purple-400" />;
      case 'contact': return <Users className="w-5 h-5 text-blue-400" />;
      case 'document': return <FileText className="w-5 h-5 text-green-400" />;
      default: return <Search className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleResultClick = (result: ResultatRecherche) => {
    if (result.type === 'courrier') {
      navigate(`/courriers/${result.id}`);
    }
    // À étendre plus tard pour contacts/documents
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Search className="w-8 h-8 text-purple-400" />
              Résultats de recherche
            </h1>
            <p className="text-slate-400 mb-8">
              Recherche pour : <span className="text-purple-300 font-medium">"{query}"</span>
              {resultats.length > 0 && ` · ${resultats.length} résultat${resultats.length > 1 ? 's' : ''}`}
            </p>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400">{error}</p>
              </div>
            ) : resultats.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-slate-600" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Aucun résultat trouvé</h3>
                <p className="text-slate-400">Essayez avec d'autres termes de recherche.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resultats.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left p-6 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                        {renderIcon(result.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-white">{result.title}</h3>
                          {result.status && (
                            <span className={`px-3 py-1 rounded-full text-xs text-white ${
                              result.status === 'en_attente' ? 'bg-orange-500' :
                              result.status === 'traité' ? 'bg-green-500' :
                              result.status === 'archivé' ? 'bg-blue-500' :
                              'bg-slate-500'
                            }`}>
                              {result.status.replace('_', ' ').charAt(0).toUpperCase() + result.status.slice(1)}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-1">{result.description}</p>
                        <p className="text-slate-500 text-xs">{result.date}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};