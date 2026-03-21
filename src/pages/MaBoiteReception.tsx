import React, { useState, useEffect } from 'react';
import { Mail, Search, Filter, Clock, CheckCircle, Archive, Download, Eye, FileText, Calendar, Building, User } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../auth/useAuth';
import { courrierApi } from '../api/courrierApi';
import type { Courrier } from '../types/Courrier';

export const MaBoiteReception: React.FC = () => {
  const { user } = useAuth();
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtres, setFiltres] = useState({
    statut: '',
    dateDebut: '',
    dateFin: ''
  });
  const [showFiltres, setShowFiltres] = useState(false);
  const [filteredCourriers, setFilteredCourriers] = useState<Courrier[]>([]);

  useEffect(() => {
    loadMesCourriers();
  }, [user]);

  useEffect(() => {
    // Appliquer les filtres quand les courriers ou les filtres changent
    filterCourriers();
  }, [courriers, searchTerm, filtres]);

  const loadMesCourriers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les courriers affectés à l'utilisateur connecté
      const response = await courrierApi.getMesCourriers();
      
      // ✅ CORRECTION : Extraire le tableau de courriers de la réponse
      let courriersData: Courrier[] = [];
      
      if (Array.isArray(response)) {
        // Si la réponse est directement un tableau
        courriersData = response;
      } else if (response && response.courriers && Array.isArray(response.courriers)) {
        // Si la réponse a une propriété "courriers" (format { courriers: [...] })
        courriersData = response.courriers;
      } else if (response && response.data && Array.isArray(response.data)) {
        // Si la réponse a une propriété "data"
        courriersData = response.data;
      } else {
        console.warn('Format de réponse inattendu:', response);
        courriersData = [];
      }
      
      setCourriers(courriersData);
      setFilteredCourriers(courriersData); // Initialiser les filtres
      
    } catch (err: any) {
      console.error('Erreur lors du chargement des courriers:', err);
      setError(err.message || 'Erreur lors du chargement des courriers affectés');
      setCourriers([]);
      setFilteredCourriers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCourriers = () => {
    // ✅ S'assurer que courriers est un tableau
    if (!Array.isArray(courriers)) {
      console.warn('courriers n\'est pas un tableau:', courriers);
      setFilteredCourriers([]);
      return;
    }

    // Filtrer les courriers selon les critères
    let filtered = [...courriers];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(courrier => 
        (courrier.objet || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (courrier.id_expediteur?.nom_de_structure || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (courrier.id_destinataire?.nom_de_structure || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (courrier.id_statut?.libelle_statut || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (filtres.statut) {
      filtered = filtered.filter(courrier => 
        courrier.id_statut?.libelle_statut === filtres.statut
      );
    }

    // Filtre par date
    if (filtres.dateDebut) {
      filtered = filtered.filter(courrier => 
        new Date(courrier.date_reception) >= new Date(filtres.dateDebut)
      );
    }

    if (filtres.dateFin) {
      filtered = filtered.filter(courrier => 
        new Date(courrier.date_reception) <= new Date(filtres.dateFin)
      );
    }

    setFilteredCourriers(filtered);
  };

  const handleDownloadFile = async (courrierId: number, fileId: number, nomFichier?: string) => {
    try {
      const blob = await courrierApi.telechargerFichier(courrierId, fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomFichier || `courrier-${courrierId}-fichier-${fileId}.bin`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
      alert('Erreur lors du téléchargement du fichier');
    }
  };

  const getTypeIcon = (typeCourrier: any) => {
    const isEntrant = typeCourrier?.libelle?.toUpperCase().includes('ENTRANT') || typeCourrier?.code === 'ENT';
    return isEntrant ? Mail : FileText;
  };

  const getTypeColor = (typeCourrier: any) => {
    const isEntrant = typeCourrier?.libelle?.toUpperCase().includes('ENTRANT') || typeCourrier?.code === 'ENT';
    return isEntrant
      ? 'text-purple-400 bg-purple-500/20'
      : 'text-blue-400 bg-blue-500/20';
  };

  const getTypeLabel = (typeCourrier: any) => {
    const isEntrant = typeCourrier?.libelle?.toUpperCase().includes('ENTRANT') || typeCourrier?.code === 'ENT';
    return isEntrant ? 'Entrant' : 'Sortant';
  };

  const getStatutIcon = (statut: string) => {
    switch (statut?.toUpperCase()) {
      case 'EN_ATTENTE':
        return Clock;
      case 'TRAITE':
        return CheckCircle;
      case 'ARCHIVE':
        return Archive;
      default:
        return Clock;
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut?.toUpperCase()) {
      case 'EN_ATTENTE':
        return 'text-orange-400 bg-orange-500/20';
      case 'TRAITE':
        return 'text-green-400 bg-green-500/20';
      case 'ARCHIVE':
        return 'text-slate-400 bg-slate-500/20';
      default:
        return 'text-orange-400 bg-orange-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  if (loading && courriers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Chargement de vos courriers...</p>
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

        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Ma Boîte de Réception</h1>
                <p className="text-slate-400">Courriers qui vous sont affectés</p>
              </div>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans vos courriers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={() => setShowFiltres(!showFiltres)}
                className={`p-3 rounded-lg transition-colors flex items-center gap-2 ${
                  showFiltres
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtres
              </button>
            </div>

            {/* Panneau de filtres avancés */}
            {showFiltres && (
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Statut</label>
                    <select
                      value={filtres.statut}
                      onChange={(e) => setFiltres(prev => ({ ...prev, statut: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Tous les statuts</option>
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="TRAITE">Traité</option>
                      <option value="ARCHIVE">Archivé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Date début</label>
                    <input
                      type="date"
                      value={filtres.dateDebut}
                      onChange={(e) => setFiltres(prev => ({ ...prev, dateDebut: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Date fin</label>
                    <input
                      type="date"
                      value={filtres.dateFin}
                      onChange={(e) => setFiltres(prev => ({ ...prev, dateFin: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Messages d'erreur */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Liste des courriers */}
            {filteredCourriers.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Aucun courrier affecté</h3>
                <p className="text-slate-400">
                  Vous n'avez actuellement aucun courrier affecté à vous.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourriers.map((courrier) => {
                  const TypeIcon = getTypeIcon(courrier.id_type_courrier);
                  const StatutIcon = getStatutIcon(courrier.id_statut?.libelle_statut);
                  
                  return (
                    <div key={courrier.id_courrier} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(courrier.id_type_courrier)}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(courrier.id_type_courrier)}`}>
                                {getTypeLabel(courrier.id_type_courrier)}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${getStatutColor(courrier.id_statut?.libelle_statut)}`}>
                                <StatutIcon className="w-3 h-3 inline mr-1" />
                                {courrier.id_statut?.libelle_statut || 'En attente'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              ID: {courrier.id_courrier} • Reçu le {formatDate(courrier.date_reception)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => window.location.href = `/courriers/${courrier.id_courrier}`}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Objet */}
                      <h3 className="text-white font-medium mb-3 line-clamp-2">
                        {courrier.objet}
                      </h3>

                      {/* Informations */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300">
                            Reçu le {formatDate(courrier.date_reception)}
                          </span>
                        </div>

                        {courrier.id_expediteur && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300 truncate">
                              Expéditeur: {courrier.id_expediteur.nom_de_structure}
                            </span>
                          </div>
                        )}

                        {courrier.id_destinataire && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300 truncate">
                              Destinataire: {courrier.id_destinataire.nom_de_structure}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Fichiers joints */}
     {/* Fichiers joints */}
{courrier.fichiers && courrier.fichiers.length > 0 && (
  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
        <Download className="w-5 h-5 text-purple-400" />
      </div>
      <div>
        <p className="text-white font-medium">Pièce(s) jointe(s)</p>
        <p className="text-xs text-slate-400">{courrier.fichiers.length} fichier(s)</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {courrier.fichiers.map((fichier) => {
        // Gérer différents formats possibles d'ID
        const fichierId = fichier.id_fichier || fichier.id;
        const nomFichier = fichier.nom_fichier || fichier.nomFichier || 'Fichier';
        
        return (
          <button
            key={fichierId} // ✅ Clé unique ajoutée
            onClick={() => handleDownloadFile(courrier.id_courrier, fichierId, nomFichier)}
            className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
            title={nomFichier}
          >
            {nomFichier.length > 15 ? nomFichier.substring(0, 12) + '...' : nomFichier}
          </button>
        );
      })}
    </div>
  </div>
)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};