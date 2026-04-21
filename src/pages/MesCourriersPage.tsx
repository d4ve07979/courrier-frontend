// src/pages/MesCourriersPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
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

  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');

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

  const [courrierDetails, setCourrierDetails] = useState<Courrier | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [courrierAffecte, setCourrierAffecte] = useState<Courrier | null>(null);
  const [showAffectationModal, setShowAffectationModal] = useState(false);
  const [showSendToUser, setShowSendToUser] = useState(false);
  const [showSendToDG, setShowSendToDG] = useState(false);
  const [courrierToSend, setCourrierToSend] = useState<Courrier | null>(null);

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
      setError('Impossible de charger vos courriers.');
      setCourriers([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [user, page, size, searchTerm, filtresAppliques]);

  useEffect(() => {
    loadMesCourriers();
  }, [loadMesCourriers]);

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
  };

  const handleEditCourrier = (courrier: Courrier) => {
    navigate(`/modifier-courrier/${courrier.id_courrier}`);
  };

  const handleDeleteCourrier = async (courrier: Courrier) => {
    if (!window.confirm(`Supprimer "${courrier.objet}" ?`)) return;
    try {
      await CourrierService.supprimerCourrier(courrier.id_courrier);
      loadMesCourriers();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handlePagePrecedente = () => setPage(p => Math.max(0, p - 1));
  const handlePageSuivante = () => setPage(p => Math.min(totalPages - 1, p + 1));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-24 min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* En-tête */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  Mes courriers créés
                </h1>
                <p className="text-gray-500 text-sm">
                  Gérez les courriers que vous avez initiés
                </p>
              </div>
              <button
                onClick={() => navigate('/creer-courrier')}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
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
                  px-5 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 min-w-[140px] border
                  ${showFiltres
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <Filter className="w-5 h-5" />
                Filtres {showFiltres ? '▲' : '▼'}
              </button>
            </div>

            {/* Panneau de filtres */}
            {showFiltres && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-semibold text-gray-900">Filtres avancés</h3>
                  <button
                    onClick={() => setShowFiltres(false)}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <select
                      value={filtresTemp.statut}
                      onChange={e => handleFiltreChange('statut', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={filtresTemp.typeCourrier}
                      onChange={e => handleFiltreChange('typeCourrier', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                    >
                      <option value="">Tous</option>
                      <option value="ENT">Entrant</option>
                      <option value="SOR">Sortant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
                    <input
                      type="date"
                      value={filtresTemp.dateDebut}
                      onChange={e => handleFiltreChange('dateDebut', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
                    <input
                      type="date"
                      value={filtresTemp.dateFin}
                      onChange={e => handleFiltreChange('dateFin', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={reinitialiserFiltres}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                  >
                    Réinitialiser
                  </button>
                  <button
                    onClick={appliquerFiltres}
                    className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Chargement */}
            {loading && (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-900" />
              </div>
            )}

            {/* Liste des courriers */}
            {!loading && !error && (
              <>
                {courriers.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <Mail className="w-14 h-14 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun courrier trouvé</h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || filtresAppliques.statut || filtresAppliques.typeCourrier
                        ? 'Aucun résultat ne correspond à vos critères'
                        : "Vous n'avez pas encore créé de courrier"}
                    </p>
                    {(searchTerm || filtresAppliques.statut || filtresAppliques.typeCourrier) && (
                      <button
                        onClick={reinitialiserFiltres}
                        className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
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
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Affichage de{' '}
                      <span className="font-semibold text-gray-900">{page * size + 1}</span> à{' '}
                      <span className="font-semibold text-gray-900">
                        {Math.min((page + 1) * size, totalElements)}
                      </span>{' '}
                      sur{' '}
                      <span className="font-semibold text-gray-900">{totalElements}</span> courriers
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePagePrecedente}
                        disabled={page === 0}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Précédent
                      </button>
                      <span className="text-gray-600 text-sm">
                        Page {page + 1} / {totalPages}
                      </span>
                      <button
                        onClick={handlePageSuivante}
                        disabled={page >= totalPages - 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
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
          onClose={() => { setShowSendToUser(false); setCourrierToSend(null); }}
          onSuccess={handleSendSuccess}
        />
      )}
      {showSendToDG && courrierToSend && (
        <SendToDGModal
          courrier={courrierToSend}
          isOpen={showSendToDG}
          onClose={() => { setShowSendToDG(false); setCourrierToSend(null); }}
          onSuccess={handleSendSuccess}
        />
      )}
    </div>
  );
};