// src/pages/dashboards/DGDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Clock, CheckCircle, XCircle, Archive,
  ChevronRight, Calendar, User, Download, Eye,
  Filter, Search, FileText, MessageSquare, X,
  AlertCircle, RefreshCw, PauseCircle
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useNotifications } from '../../hooks/useNotifications'; // ← Import du hook
import { CourrierService } from '../../services/courrierService';
import { affectationApi } from '../../api/affectationApi';
import type { AffectationDTO } from '../../api/affectationApi';
import { statutApi } from '../../api/statutApi';
import { formatUtils } from '../../utils/formatUtils';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import type { Courrier } from '../../types/Courrier';
import type { Affectation } from '../../types/Affectation';
import type { Statut } from '../../types/Courrier';

interface CourrierAvecAffectation extends Courrier {
  affectation?: Affectation;
}

export const DGDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications } = useNotifications(); // ← Récupération des notifications

  const [courriers, setCourriers] = useState<CourrierAvecAffectation[]>([]);
  const [filteredCourriers, setFilteredCourriers] = useState<CourrierAvecAffectation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourrier, setSelectedCourrier] = useState<CourrierAvecAffectation | null>(null);
  const [showStatutModal, setShowStatutModal] = useState(false);
  const [showFiltres, setShowFiltres] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null);
  const [filtres, setFiltres] = useState({
    statut: '',
    dateDebut: '',
    dateFin: ''
  });

  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [loadingStatuts, setLoadingStatuts] = useState(false);

  // Chargement initial
  useEffect(() => {
    loadCourriers();
    loadStatuts();
  }, []);

  // Recharger les courriers à chaque nouvelle notification (optionnel)
  useEffect(() => {
    if (notifications.length > 0) {
      // Vous pouvez filtrer pour ne recharger que si la notification concerne un courrier
      loadCourriers();
    }
  }, [notifications]);

  // Filtrage local
  useEffect(() => {
    filterCourriers();
  }, [courriers, searchTerm, filtres]);

  const loadStatuts = async () => {
    try {
      setLoadingStatuts(true);
      const response = await statutApi.getAll();
      const statutsList = response.statuts || (Array.isArray(response) ? response : []);
      setStatuts(statutsList);
    } catch (err) {
      console.error('Erreur chargement statuts:', err);
    } finally {
      setLoadingStatuts(false);
    }
  };

  const loadCourriers = async () => {
    try {
      setLoading(true);
      const affectations = await affectationApi.getMesAffectations();
      console.log('📥 Affectations reçues (DTO):', affectations);

      const courriersData: CourrierAvecAffectation[] = affectations.map(aff => ({
        id_courrier: aff.courrierId,
        objet: aff.objetCourrier,
        date_reception: aff.dateReceptionCourrier,
        id_statut: { 
          libelle_statut: aff.statutCourrier,
          code_statut: aff.statutCourrier
        },
        id_expediteur: null,
        id_destinataire: null,
        fichiers: [],
        affectation: {
          id: aff.id,
          utilisateur: {
            prenomUtilisateur: aff.utilisateurPrenom,
            nomUtilisateur: aff.utilisateurNom
          },
          motif: aff.motif,
          dateAffectation: aff.dateAffectation,
          direction: aff.directionNom ? { nomDirection: aff.directionNom } : null
        } as any
      }));

      const uniqueCourriers = Array.from(
        new Map(courriersData.map(c => [c.id_courrier, c])).values()
      );

      setCourriers(uniqueCourriers);
    } catch (err) {
      console.error('Erreur chargement courriers:', err);
      setError('Impossible de charger les courriers');
    } finally {
      setLoading(false);
    }
  };

  const filterCourriers = () => {
    let filtered = [...courriers];
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.objet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.affectation?.utilisateur?.nomUtilisateur?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filtres.statut) {
      filtered = filtered.filter(c => c.id_statut?.libelle_statut === filtres.statut);
    }
    if (filtres.dateDebut) {
      filtered = filtered.filter(c => new Date(c.date_reception) >= new Date(filtres.dateDebut));
    }
    if (filtres.dateFin) {
      filtered = filtered.filter(c => new Date(c.date_reception) <= new Date(filtres.dateFin));
    }
    setFilteredCourriers(filtered);
  };

  const handleChangerStatut = async (courrierId: number, nouveauStatutCode: string) => {
    const statut = statuts.find(s => s.code_statut === nouveauStatutCode);
    if (!statut) {
      alert(`Statut ${nouveauStatutCode} non trouvé`);
      return;
    }

    try {
      await CourrierService.changerStatut(courrierId, statut.id_statut);
      await loadCourriers(); // recharger après modification
      setShowStatutModal(false);
      setSelectedCourrier(null);
      setCommentaire('');
    } catch (err) {
      console.error('Erreur changement statut:', err);
      alert('Erreur lors du changement de statut');
    }
  };

  const handlePreviewFile = async (fichierId: number, nomFichier: string) => {
    try {
      if (!selectedCourrier) return;
      const blob = await CourrierService.telechargerFichier(selectedCourrier.id_courrier, fichierId);
      const extension = nomFichier.split('.').pop()?.toLowerCase();
      const mimeType = extension === 'pdf' ? 'application/pdf' : 'image/jpeg';
      const fileBlob = new Blob([blob], { type: mimeType });
      const url = URL.createObjectURL(fileBlob);
      if (extension === 'pdf') {
        setPreviewType('pdf');
        setPreviewUrl(url);
      } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
        setPreviewType('image');
        setPreviewUrl(url);
      } else {
        alert('Prévisualisation non disponible pour ce type de fichier');
      }
    } catch (error) {
      console.error('Erreur prévisualisation:', error);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewType(null);
  };

  const getStatutBadge = (statut?: string) => {
    const classes: Record<string, string> = {
      'EN_ATTENTE': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'EN_COURS': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'AFFECTE': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'TRAITE': 'bg-green-500/20 text-green-400 border-green-500/30',
      'URGENT': 'bg-red-500/20 text-red-400 border-red-500/30',
      'CLASSE': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'REJETE': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      'EN_INSTANCE': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    return classes[statut || ''] || classes['EN_ATTENTE'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 pt-24">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
        <main className="flex-1 p-8 pt-24">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Tableau de bord du Directeur Général</h1>
              <p className="text-slate-400">Gérez les courriers qui vous sont affectés</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un courrier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={() => setShowFiltres(!showFiltres)}
                className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                  showFiltres ? 'bg-purple-500 text-white' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtres
              </button>
            </div>

            {showFiltres && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Statut</label>
                    <select
                      value={filtres.statut}
                      onChange={(e) => setFiltres({ ...filtres, statut: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Tous</option>
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="EN_COURS">En cours</option>
                      <option value="AFFECTE">Affecté</option>
                      <option value="TRAITE">Traité</option>
                      <option value="URGENT">Urgent</option>
                      <option value="CLASSE">Classé</option>
                      <option value="REJETE">Rejeté</option>
                      <option value="EN_INSTANCE">En instance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Date début</label>
                    <input
                      type="date"
                      value={filtres.dateDebut}
                      onChange={(e) => setFiltres({ ...filtres, dateDebut: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Date fin</label>
                    <input
                      type="date"
                      value={filtres.dateFin}
                      onChange={(e) => setFiltres({ ...filtres, dateFin: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {filteredCourriers.length === 0 ? (
              <div className="text-center py-20">
                <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl text-white mb-2">Aucun courrier trouvé</h3>
                <p className="text-slate-400">Aucun courrier ne correspond à vos critères.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourriers.map((courrier) => (
                  <div
                    key={courrier.id_courrier}
                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{courrier.objet}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatutBadge(courrier.id_statut?.libelle_statut)}`}>
                            {courrier.id_statut?.libelle_statut}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatUtils.date(courrier.date_reception)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {courrier.affectation?.utilisateur?.prenomUtilisateur} {courrier.affectation?.utilisateur?.nomUtilisateur}
                          </span>
                        </div>
                        {courrier.affectation?.motif && (
                          <p className="text-sm text-slate-500 italic mb-3">Motif: {courrier.affectation.motif}</p>
                        )}
                        {courrier.fichiers && courrier.fichiers.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {courrier.fichiers.map((f) => (
                              <button
                                key={f.id_fichier}
                                onClick={() => {
                                  setSelectedCourrier(courrier);
                                  handlePreviewFile(f.id_fichier, f.nom_fichier);
                                }}
                                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                {f.nom_fichier.length > 20 ? f.nom_fichier.substring(0, 17) + '...' : f.nom_fichier}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/courriers/${courrier.id_courrier}`)}
                          className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourrier(courrier);
                            setCommentaire('');
                            setShowStatutModal(true);
                          }}
                          className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                          title="Changer le statut"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de changement de statut */}
      {showStatutModal && selectedCourrier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">Changer le statut</h2>
              <button onClick={() => setShowStatutModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-300 mb-2">{selectedCourrier.objet}</p>
            <p className="text-sm text-slate-400 mb-4">
              Affecté par {selectedCourrier.affectation?.utilisateur?.prenomUtilisateur}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Commentaire (optionnel)</label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Ajoutez un commentaire..."
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              <button
                onClick={() => handleChangerStatut(selectedCourrier.id_courrier, 'EN_ATTENTE')}
                className="w-full p-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-white font-medium">En attente</p>
                    <p className="text-sm text-slate-400">Remettre en attente</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleChangerStatut(selectedCourrier.id_courrier, 'EN_COURS')}
                className="w-full p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">En cours</p>
                    <p className="text-sm text-slate-400">Marquer comme en cours</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleChangerStatut(selectedCourrier.id_courrier, 'AFFECTE')}
                className="w-full p-4 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-white font-medium">Affecté</p>
                    <p className="text-sm text-slate-400">Affecter à nouveau</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleChangerStatut(selectedCourrier.id_courrier, 'TRAITE')}
                className="w-full p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Traité</p>
                    <p className="text-sm text-slate-400">Marquer comme traité</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleChangerStatut(selectedCourrier.id_courrier, 'URGENT')}
                className="w-full p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-white font-medium">Urgent</p>
                    <p className="text-sm text-slate-400">Marquer comme urgent</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleChangerStatut(selectedCourrier.id_courrier, 'CLASSE')}
                className="w-full p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Archive className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Classé</p>
                    <p className="text-sm text-slate-400">Classer le courrier</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleChangerStatut(selectedCourrier.id_courrier, 'REJETE')}
                className="w-full p-4 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <div>
                    <p className="text-white font-medium">Rejeté</p>
                    <p className="text-sm text-slate-400">Rejeter le courrier</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleChangerStatut(selectedCourrier.id_courrier, 'EN_INSTANCE')}
                className="w-full p-4 bg-slate-500/20 hover:bg-slate-500/30 border border-slate-500/30 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <PauseCircle className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-white font-medium">En instance</p>
                    <p className="text-sm text-slate-400">Mettre en attente temporaire</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales de prévisualisation (inchangées) */}
      {previewUrl && previewType === 'image' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Prévisualisation</h3>
              <button onClick={closePreview} className="p-2 hover:bg-gray-200 rounded-full">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto bg-gray-100 flex items-center justify-center">
              <img src={previewUrl} alt="Prévisualisation" className="max-w-full max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      )}
      {previewUrl && previewType === 'pdf' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Prévisualisation PDF</h3>
              <button onClick={closePreview} className="p-2 hover:bg-gray-200 rounded-full">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <iframe src={previewUrl} className="flex-1 w-full border-0" title="Prévisualisation PDF" />
          </div>
        </div>
      )}
    </div>
  );
};