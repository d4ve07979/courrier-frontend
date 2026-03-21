// src/pages/MesCourriersPage.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Filter, FileText, X, 
  Inbox, Send, Clock, CheckCircle, Archive,
  UserPlus, Users, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { CourrierService } from '../services/courrierService';
import type { CourrierSearchParams, Courrier } from '../types/Courrier';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { CourrierCard } from '../components/CourrierCard';
import { DetailsCourrier } from '../components/courriers/DetailsCourrier';
import { AffectationModal } from '../components/courriers/AffectationModal';
import { SendToUserModal } from '../components/courriers/SendToUserModal';
import { SendToDGModal } from '../components/courriers/SendToDGModal';
import { SearchBar } from '../components/SearchBar';

export const MesCourriersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // États
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Recherche (debounced via SearchBar)
  const [searchTerm, setSearchTerm] = useState('');

  // Filtres avancés
  const [filtresTemp, setFiltresTemp] = useState({
    statut: '',
    typeCourrier: '',
    dateDebut: '',
    dateFin: '',
  });
  const [filtresAppliques, setFiltresAppliques] = useState({
    statut: '',
    typeCourrier: '',
    dateDebut: '',
    dateFin: '',
  });
  const [showFiltres, setShowFiltres] = useState(false);

  // Statistiques détaillées (depuis le backend)
  const [detailedStats, setDetailedStats] = useState({
    total: 0,
    entrants: 0,
    sortants: 0,
    enAttente: 0,
    enCours: 0,
    traites: 0,
    archives: 0,
    classes: 0,
    rejetes: 0,
    urgents: 0,
    parStatut: {} as Record<string, number>,
    parType: {} as Record<string, number>,
  });

  // Modals
  const [courrierDetails, setCourrierDetails] = useState<Courrier | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [courrierAffecte, setCourrierAffecte] = useState<Courrier | null>(null);
  const [showAffectationModal, setShowAffectationModal] = useState(false);
  const [showSendToUser, setShowSendToUser] = useState(false);
  const [showSendToDG, setShowSendToDG] = useState(false);
  const [courrierToSend, setCourrierToSend] = useState<Courrier | null>(null);

  // Chargement des courriers avec les filtres appliqués
  const loadMesCourriers = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const params: CourrierSearchParams = {
        page,
        size,
        recherche: searchTerm || undefined,
        statut: filtresAppliques.statut || undefined,
        type: filtresAppliques.typeCourrier || undefined,
        dateDebut: filtresAppliques.dateDebut || undefined,
        dateFin: filtresAppliques.dateFin || undefined,
      };

      console.log('📡 Chargement des courriers avec params:', params);

      const response = await CourrierService.listerMesCourriers(params);

      if (response && typeof response === 'object') {
        setCourriers(response.courriers || []);
        setTotalElements(response.total || 0);
        setTotalPages(response.totalPages || 0);
      } else {
        setCourriers([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (err: any) {
      console.error('Erreur chargement mes courriers:', err);
      setError('Impossible de charger vos courriers.');
      setCourriers([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [user, page, size, searchTerm, filtresAppliques]);

  // Chargement des statistiques détaillées
  const loadMesStatistiques = useCallback(async () => {
    if (!user) return;

    try {
      const params = {
        recherche: searchTerm || undefined,
        statut: filtresAppliques.statut || undefined,
        type: filtresAppliques.typeCourrier || undefined,
        dateDebut: filtresAppliques.dateDebut || undefined,
        dateFin: filtresAppliques.dateFin || undefined,
      };

      console.log('📊 Chargement des statistiques avec params:', params);

      const data = await CourrierService.getMesStatistiques(params);
      if (data) {
        setDetailedStats(data);
      }
    } catch (err) {
      console.error('Erreur chargement statistiques détaillées:', err);
    }
  }, [user, searchTerm, filtresAppliques]);

  // Effet principal : charger les courriers ET les stats
  useEffect(() => {
    loadMesCourriers();
    loadMesStatistiques();
  }, [loadMesCourriers, loadMesStatistiques]);

  // Gestionnaires
  const handleFiltreChange = (key: keyof typeof filtresTemp, value: string) => {
    setFiltresTemp(prev => ({ ...prev, [key]: value }));
  };

  const appliquerFiltres = () => {
    setFiltresAppliques(filtresTemp);
    setPage(0);
    setShowFiltres(false);
  };

  const reinitialiserFiltres = () => {
    setFiltresTemp({ statut: '', typeCourrier: '', dateDebut: '', dateFin: '' });
    setFiltresAppliques({ statut: '', typeCourrier: '', dateDebut: '', dateFin: '' });
    setPage(0);
    setSearchTerm('');
  };

  // Actions courrier
  const handleViewCourrier = (courrier: Courrier) => {
    setCourrierDetails(courrier);
    setShowDetailsModal(true);
  };

  const handleAffecterCourrier = (courrier: Courrier) => {
    setCourrierAffecte(courrier);
    setShowAffectationModal(true);
  };

  const handleAffectationSuccess = () => {
    loadMesCourriers();
    loadMesStatistiques();
  };

  const handleSendToUser = (courrier: Courrier) => {
    setCourrierToSend(courrier);
    setShowSendToUser(true);
  };

  const handleSendToDG = (courrier: Courrier) => {
    setCourrierToSend(courrier);
    setShowSendToDG(true);
  };

  const handleSendSuccess = () => {
    loadMesCourriers();
    loadMesStatistiques();
  };

  const handleEditCourrier = (courrier: Courrier) => {
    navigate(`/modifier-courrier/${courrier.id_courrier}`);
  };

  const handleDeleteCourrier = async (courrier: Courrier) => {
    if (!window.confirm(`Supprimer "${courrier.objet}" ?`)) return;
    try {
      await CourrierService.supprimerCourrier(courrier.id_courrier);
      loadMesCourriers();
      loadMesStatistiques();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  // Pagination
  const handlePagePrecedente = () => setPage(p => Math.max(0, p - 1));
  const handlePageSuivante = () => setPage(p => Math.min(totalPages - 1, p + 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* En-tête */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  Mes courriers créés
                </h1>
                <p className="text-slate-400 text-sm">
                  Gérez les courriers que vous avez initiés
                </p>
              </div>
              <button
                onClick={() => navigate('/creer-courrier')}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
              >
                <FileText className="w-5 h-5" />
                Nouveau courrier
              </button>
            </div>

            {/* Barre de recherche et bouton filtres */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <SearchBar 
                  onSearch={setSearchTerm} 
                  placeholder="Rechercher par objet, expéditeur..."
                  debounceMs={500}
                />
              </div>
              <button
                onClick={() => setShowFiltres(!showFiltres)}
                className={`
                  px-5 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 min-w-[140px]
                  ${showFiltres 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                  }
                `}
              >
                <Filter className="w-5 h-5" />
                Filtres {showFiltres ? '▲' : '▼'}
              </button>
            </div>

            {/* Panneau de filtres */}
            {showFiltres && (
              <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-xl p-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-medium text-white">Filtres avancés</h3>
                  <button 
                    onClick={() => setShowFiltres(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Statut</label>
                    <select
                      value={filtresTemp.statut}
                      onChange={e => handleFiltreChange('statut', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Tous</option>
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="EN_COURS">En cours</option>
                      <option value="TRAITE">Traité</option>
                      <option value="CLASSE">Classé</option>
                      <option value="ARCHIVE">Archivé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Type</label>
                    <select
                      value={filtresTemp.typeCourrier}
                      onChange={e => handleFiltreChange('typeCourrier', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Tous</option>
                      <option value="ENT">Entrant</option>
                      <option value="SOR">Sortant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Date début</label>
                    <input
                      type="date"
                      value={filtresTemp.dateDebut}
                      onChange={e => handleFiltreChange('dateDebut', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Date fin</label>
                    <input
                      type="date"
                      value={filtresTemp.dateFin}
                      onChange={e => handleFiltreChange('dateFin', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={reinitialiserFiltres}
                    className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                  >
                    Réinitialiser
                  </button>
                  <button
                    onClick={appliquerFiltres}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}

            {/* Statistiques détaillées */}
           {!loading && !error && (
  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
    <StatCard 
      icon={<Mail className="w-5 h-5" />}
      label="Total"
      value={detailedStats.total}
      color="slate"
    />
    <StatCard 
      icon={<Inbox className="w-5 h-5" />}
      label="Entrants"
      value={detailedStats.entrants}
      color="indigo"
    />
    <StatCard 
      icon={<Send className="w-5 h-5" />}
      label="Sortants"
      value={detailedStats.sortants}
      color="cyan"
    />
    <StatCard 
      icon={<Clock className="w-5 h-5" />}
      label="En attente"
      value={detailedStats.enAttente}
      color="orange"
    />
    <StatCard 
      icon={<RefreshCw className="w-5 h-5" />}
      label="En cours"
      value={detailedStats.enCours}
      color="blue"
    />
    <StatCard 
      icon={<CheckCircle className="w-5 h-5" />}
      label="Traités"
      value={detailedStats.traites}
      color="green"
    />
    <StatCard 
      icon={<Archive className="w-5 h-5" />}
      label="Archivés"
      value={detailedStats.archives}
      color="slate"
    />
    <StatCard 
      icon={<AlertCircle className="w-5 h-5" />}
      label="Urgents"
      value={detailedStats.urgents}
      color="red"
    />
  </div>
)}

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-300 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Chargement */}
            {loading && (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}

            {/* Liste des courriers */}
            {!loading && !error && (
              <>
                {courriers.length === 0 ? (
                  <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                    <h3 className="text-xl text-white mb-2">Aucun courrier trouvé</h3>
                    <p className="text-slate-400 mb-6">
                      {searchTerm || filtresAppliques.statut || filtresAppliques.typeCourrier
                        ? "Aucun résultat ne correspond à vos critères"
                        : "Vous n'avez pas encore créé de courrier"}
                    </p>
                    {(searchTerm || filtresAppliques.statut || filtresAppliques.typeCourrier) && (
                      <button
                        onClick={reinitialiserFiltres}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Réinitialiser les filtres
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courriers.map(courrier => (
                      <CourrierCard
                        key={courrier.id_courrier}
                        courrier={courrier}
                        onView={handleViewCourrier}
                        onEdit={handleEditCourrier}
                        onDelete={handleDeleteCourrier}
                        onAffecter={handleAffecterCourrier}
                        showSendToUser={true}
                        showSendToDG={true}
                        onSendToUser={handleSendToUser}
                        onSendToDG={handleSendToDG}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-700/50">
                    <p className="text-sm text-slate-400">
                      Affichage de <span className="font-medium text-white">{page * size + 1}</span> à{' '}
                      <span className="font-medium text-white">
                        {Math.min((page + 1) * size, totalElements)}
                      </span>{' '}
                      sur <span className="font-medium text-white">{totalElements}</span> courriers
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePagePrecedente}
                        disabled={page === 0}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                      >
                        Précédent
                      </button>
                      <span className="text-white">
                        Page {page + 1} / {totalPages}
                      </span>
                      <button
                        onClick={handlePageSuivante}
                        disabled={page >= totalPages - 1}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showDetailsModal && courrierDetails && (
        <DetailsCourrier
          courrierId={courrierDetails.id_courrier}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
      {showAffectationModal && courrierAffecte && (
        <AffectationModal
          courrier={courrierAffecte}
          isOpen={showAffectationModal}
          onClose={() => setShowAffectationModal(false)}
          onSuccess={handleAffectationSuccess}
        />
      )}
      {showSendToUser && courrierToSend && (
        <SendToUserModal
          courrier={courrierToSend}
          isOpen={showSendToUser}
          onClose={() => {
            setShowSendToUser(false);
            setCourrierToSend(null);
          }}
          onSuccess={handleSendSuccess}
        />
      )}
      {showSendToDG && courrierToSend && (
        <SendToDGModal
          courrier={courrierToSend}
          isOpen={showSendToDG}
          onClose={() => {
            setShowSendToDG(false);
            setCourrierToSend(null);
          }}
          onSuccess={handleSendSuccess}
        />
      )}
    </div>
  );
};

// Composant pour les cartes de statistiques
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'slate' | 'purple' | 'blue' | 'indigo' | 'cyan' | 'orange' | 'green' | 'red';
}> = ({ icon, label, value, color }) => {
  const colorClasses = {
    slate: 'bg-slate-800 border-slate-600 text-slate-300',
    purple: 'bg-purple-900/30 border-purple-600/50 text-purple-300',
    blue: 'bg-blue-900/30 border-blue-600/50 text-blue-300',
    indigo: 'bg-indigo-900/30 border-indigo-600/50 text-indigo-300',
    cyan: 'bg-cyan-900/30 border-cyan-600/50 text-cyan-300',
    orange: 'bg-orange-900/30 border-orange-600/50 text-orange-300',
    green: 'bg-green-900/30 border-green-600/50 text-green-300',
    red: 'bg-red-900/30 border-red-600/50 text-red-300',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-xl p-4 transition-transform hover:scale-105 duration-200`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
};