// src/pages/CourriersPage.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Mail, Send, Filter, Download, Search, FileText, 
  Clock, CheckCircle, Archive, X, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { CourrierService } from '../services/courrierService';
import type { CourrierSearchParams, Courrier, TypeCourrierEnum, StatutCourrierEnum } from '../types/Courrier';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { CourrierCard } from '../components/CourrierCard';
import { FormulaireCourrierEntrant } from '../components/courriers/FormulaireCourrierEntrant';
import { FormulaireCourrierSortant } from '../components/courriers/FormulaireCourrierSortant';
import { DetailsCourrier } from '../components/courriers/DetailsCourrier';
import { AffectationModal } from '../components/courriers/AffectationModal';
import { SendToUserModal } from '../components/courriers/SendToUserModal';
import { SendToDGModal } from '../components/courriers/SendToDGModal';
import type { Affectation } from '../types/Affectation';

type ModeAffichage = 'liste' | 'nouveau-entrant' | 'nouveau-sortant';

export const CourriersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ──────────────────────────────────────────────
  // ÉTATS PRINCIPAUX
  // ──────────────────────────────────────────────
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);

  // Recherche & Pagination
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [recherche, setRecherche] = useState('');

  // Recherche live (dropdown)
  const [searchResultsDropdown, setSearchResultsDropdown] = useState<Courrier[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filtres avancés
  const [filtresTemp, setFiltresTemp] = useState<{
    type: TypeCourrierEnum | '';
    statut: StatutCourrierEnum | '';
    dateDebut: string;
    dateFin: string;
  }>({
    type: '',
    statut: '',
    dateDebut: '',
    dateFin: '',
  });

  const [filtresAppliques, setFiltresAppliques] = useState<{
    type: TypeCourrierEnum | '';
    statut: StatutCourrierEnum | '';
    dateDebut: string;
    dateFin: string;
  }>({
    type: '',
    statut: '',
    dateDebut: '',
    dateFin: '',
  });

  const [showFiltres, setShowFiltres] = useState(false);

  // Modals & mode
  const [mode, setMode] = useState<ModeAffichage>('liste');
  const [courrierDetails, setCourrierDetails] = useState<Courrier | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [courrierAffecte, setCourrierAffecte] = useState<Courrier | null>(null);
  const [showAffectationModal, setShowAffectationModal] = useState(false);
  const [showSendToUser, setShowSendToUser] = useState(false);
  const [showSendToDG, setShowSendToDG] = useState(false);
  const [courrierToSend, setCourrierToSend] = useState<Courrier | null>(null);

  // ──────────────────────────────────────────────
  // CHARGEMENT LISTE COMPLÈTE (paginated)
  // ──────────────────────────────────────────────
  const loadCourriers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: CourrierSearchParams = {
        page,
        size,
        recherche: recherche.trim() || undefined,
        statut: filtresAppliques.statut || undefined,
        type: filtresAppliques.type || undefined,
        dateDebut: filtresAppliques.dateDebut || undefined,
        dateFin: filtresAppliques.dateFin || undefined,
      };

      console.log('📡 Chargement liste complète avec params:', params);

      const response = await CourrierService.listerCourriers(params);

      let allCourriers: Courrier[] = [];
      let total = 0;

      if (response && typeof response === 'object' && !Array.isArray(response)) {
        allCourriers = response.courriers || [];
        total = response.total || allCourriers.length;
      } else if (Array.isArray(response)) {
        allCourriers = response;
        total = response.length;
      }

      setCourriers(allCourriers);
      setTotalElements(total);
    } catch (err: any) {
      console.error('Erreur chargement:', err);
      setError('Impossible de charger les courriers');
      setCourriers([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, size, recherche, filtresAppliques]);

  useEffect(() => {
    loadCourriers();
  }, [loadCourriers]);

  // ──────────────────────────────────────────────
  // RECHERCHE LIVE (dropdown rapide comme Navbar)
  // ──────────────────────────────────────────────
  const handleSearchLive = async (query: string) => {
    if (!query.trim()) {
      setSearchResultsDropdown([]);
      setShowSearchDropdown(false);
      return;
    }

    setSearchLoading(true);
    setShowSearchDropdown(true);

    try {
      // Recherche rapide (limite à 10 résultats)
      const response = await CourrierService.listerCourriers({
        recherche: query,
        size: 10,
      });

      const results = response.courriers || (Array.isArray(response) ? response : []);
      setSearchResultsDropdown(results);
    } catch (err) {
      console.error('Erreur recherche live:', err);
      setSearchResultsDropdown([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Fermeture dropdown quand clic dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ──────────────────────────────────────────────
  // FILTRES AVANCÉS
  // ──────────────────────────────────────────────
  const handleFiltreChange = (key: keyof typeof filtresTemp, value: string) => {
    setFiltresTemp(prev => ({ ...prev, [key]: value }));
  };

  const appliquerFiltres = () => {
    setFiltresAppliques(filtresTemp);
    setPage(0);
    setShowFiltres(false);
  };

  const reinitialiserFiltres = () => {
    setFiltresTemp({ type: '', statut: '', dateDebut: '', dateFin: '' });
    setFiltresAppliques({ type: '', statut: '', dateDebut: '', dateFin: '' });
    setPage(0);
    setShowFiltres(false);
  };

  // ──────────────────────────────────────────────
  // ACTIONS COURRIER
  // ──────────────────────────────────────────────
  const handleViewCourrier = (courrier: Courrier) => {
    setCourrierDetails(courrier);
    setShowDetailsModal(true);
  };

  const handleEditCourrier = (courrier: Courrier) => {
    navigate(`/modifier-courrier/${courrier.id_courrier}`);
  };

  const handleDeleteCourrier = async (courrier: Courrier) => {
    if (!window.confirm(`Supprimer "${courrier.objet}" ?`)) return;

    try {
      await CourrierService.supprimerCourrier(courrier.id_courrier);
      loadCourriers();
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  const handleAffecterCourrier = (courrier: Courrier) => {
    setCourrierAffecte(courrier);
    setShowAffectationModal(true);
  };

  const handleAffectationSuccess = () => {
    loadCourriers();
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
    loadCourriers();
  };

  const handleCourrierCreated = () => {
    setMode('liste');
    navigate('/courriers');
    loadCourriers();
  };

  // ──────────────────────────────────────────────
  // RENDU
  // ──────────────────────────────────────────────
  if (mode === 'nouveau-entrant') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 pt-24">
            <FormulaireCourrierEntrant
              onSuccess={handleCourrierCreated}
              onCancel={() => setMode('liste')}
            />
          </main>
        </div>
      </div>
    );
  }

  if (mode === 'nouveau-sortant') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 pt-24">
            <FormulaireCourrierSortant
              onSuccess={handleCourrierCreated}
              onCancel={() => setMode('liste')}
            />
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
        <main className="flex-1 p-6 md:p-8 pt-20 md:pt-24">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Gestion des Courriers</h1>
                <p className="text-slate-400 mt-1">Tous les courriers de l’application</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMode('nouveau-entrant')}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Entrant
                </button>
                <button
                  onClick={() => setMode('nouveau-sortant')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Sortant
                </button>
              </div>
            </div>

            {/* Recherche + Filtres */}
            <div className="flex flex-col gap-4">
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={recherche}
                  onChange={(e) => {
                    setRecherche(e.target.value);
                    handleSearchLive(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Rechercher par objet, numéro, expéditeur..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                />

                {/* Dropdown résultats rapides */}
                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-6 text-center text-slate-400">Recherche...</div>
                    ) : searchResultsDropdown.length === 0 ? (
                      <div className="p-6 text-center text-slate-400">Aucun résultat</div>
                    ) : (
                      searchResultsDropdown.map(c => (
                        <button
                          key={c.id_courrier}
                          onClick={() => {
                            navigate(`/courriers/${c.id_courrier}`);
                            setShowSearchDropdown(false);
                            setRecherche('');
                          }}
                          className="w-full px-5 py-4 text-left hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-none flex items-center gap-4"
                        >
                          <FileText className="w-6 h-6 text-purple-400 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-white truncate">{c.objet}</p>
                            <p className="text-sm text-slate-400">
                              {c.date_reception} • {c.id_statut?.libelle_statut}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Bouton filtres */}
              <button
                onClick={() => setShowFiltres(!showFiltres)}
                className={`
                  px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2
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

            {/* Filtres avancés */}
            {showFiltres && (
              <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-xl p-6">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-medium text-white">Filtres avancés</h3>
                  <button onClick={() => setShowFiltres(false)}>
                    <X className="w-6 h-6 text-slate-400 hover:text-white" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Type</label>
                    <select
                      value={filtresTemp.type}
                      onChange={e => setFiltresTemp(prev => ({ ...prev, type: e.target.value as TypeCourrierEnum | '' }))}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="">Tous</option>
                      <option value="ENTRANT">Entrant</option>
                      <option value="SORTANT">Sortant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Statut</label>
                    <select
                      value={filtresTemp.statut}
                      onChange={e => setFiltresTemp(prev => ({ ...prev, statut: e.target.value as StatutCourrierEnum | '' }))}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="">Tous</option>
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="TRAITE">Traité</option>
                      {/* Ajoute tes statuts */}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Du</label>
                    <input
                      type="date"
                      value={filtresTemp.dateDebut}
                      onChange={e => setFiltresTemp(prev => ({ ...prev, dateDebut: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Au</label>
                    <input
                      type="date"
                      value={filtresTemp.dateFin}
                      onChange={e => setFiltresTemp(prev => ({ ...prev, dateFin: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={reinitialiserFiltres}
                    className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg"
                  >
                    Réinitialiser
                  </button>
                  <button
                    onClick={appliquerFiltres}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}

            {/* Stats simples et lisibles */}
            {!loading && !error && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <div className="bg-slate-800 border border-slate-600 rounded-xl p-5 text-center">
                  <p className="text-sm text-slate-300">Total</p>
                  <p className="text-3xl font-bold text-white">{totalElements}</p>
                </div>
                {/* Ajoute d'autres stats si besoin */}
              </div>
            )}

            {/* Liste des courriers */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/20 border border-red-500 rounded-xl p-6 text-center text-red-300">
                {error}
              </div>
            ) : courriers.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl text-white mb-2">Aucun courrier</h3>
                <p>Aucun résultat ne correspond à vos critères.</p>
              </div>
            ) : (
              <>
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

                {/* Pagination */}
                {totalElements > size && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className={`
                        px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2
                        ${page === 0 ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}
                      `}
                    >
                      ← Précédent
                    </button>

                    <div className="flex items-center gap-2 flex-wrap">
                      {Array.from({ length: Math.min(7, Math.ceil(totalElements / size)) }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          className={`
                            px-4 py-2.5 rounded-lg font-medium min-w-[40px]
                            ${page === i ? 'bg-purple-600 text-white' : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300'}
                          `}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= Math.ceil(totalElements / size) - 1}
                      className={`
                        px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2
                        ${page >= Math.ceil(totalElements / size) - 1 ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}
                      `}
                    >
                      Suivant →
                    </button>
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
          onClose={() => setShowSendToUser(false)}
          onSuccess={() => {
            setShowSendToUser(false);
            loadCourriers();
          }}
        />
      )}

      {showSendToDG && courrierToSend && (
        <SendToDGModal
          courrier={courrierToSend}
          isOpen={showSendToDG}
          onClose={() => setShowSendToDG(false)}
          onSuccess={() => {
            setShowSendToDG(false);
            loadCourriers();
          }}
        />
      )}
    </div>
  );
};