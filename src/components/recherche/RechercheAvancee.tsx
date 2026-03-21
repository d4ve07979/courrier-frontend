import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, Building, User, FileText, 
  X, RotateCcw, Download, Eye, ChevronDown, ChevronUp
} from 'lucide-react';
import type { CriteresRecherche, ResultatRecherche } from '../../types/Recherche';
import type { TypeCourrierEnum, StatutCourrierEnum, PrioriteCourrier, TypeDocument } from '../../types/Courrier';
import { CourrierService } from '../../services/courrierService';

interface Props {
  onResultatsChange?: (resultats: ResultatRecherche) => void;
  onClose?: () => void;
}

export const RechercheAvancee: React.FC<Props> = ({ onResultatsChange, onClose }) => {
  const [criteres, setCriteres] = useState<CriteresRecherche>({
    page: 0,
    taille: 20,
    triPar: 'date',
    ordreDecroissant: true
  });
  
  const [resultats, setResultats] = useState<ResultatRecherche | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtresOuverts, setFiltresOuverts] = useState(true);
  const [rechercheEffectuee, setRechercheEffectuee] = useState(false);

  // Options pour les filtres
  const typesDocument: { value: TypeDocument; label: string }[] = [
    { value: 'DEMANDE', label: 'Demande' },
    { value: 'FACTURE', label: 'Facture' },
    { value: 'RAPPORT', label: 'Rapport' },
    { value: 'COURRIER_OFFICIEL', label: 'Courrier officiel' },
    { value: 'INVITATION', label: 'Invitation' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  const statutsCourrier: { value: StatutCourrierEnum; label: string }[] = [
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'AFFECTE', label: 'Affecté' },
    { value: 'EN_TRAITEMENT', label: 'En traitement' },
    { value: 'TRAITE', label: 'Traité' },
    { value: 'VALIDE', label: 'Validé' },
    { value: 'ENVOYE', label: 'Envoyé' },
    { value: 'CLASSE', label: 'Classé' },
    { value: 'ARCHIVE', label: 'Archivé' }
  ];

  const niveauxPriorite: { value: PrioriteCourrier; label: string }[] = [
    { value: 'NORMALE', label: 'Normale' },
    { value: 'URGENTE', label: 'Urgente' },
    { value: 'TRES_URGENTE', label: 'Très urgente' }
  ];

  const optionsTri = [
    { value: 'date', label: 'Date' },
    { value: 'numero', label: 'Numéro' },
    { value: 'objet', label: 'Objet' },
    { value: 'statut', label: 'Statut' }
  ];

  // Directions mockées
  const directions = [
    { id: 1, nom: 'Direction des Études' },
    { id: 2, nom: 'Direction de la Formation' },
    { id: 3, nom: 'Direction Administrative et Financière' },
    { id: 4, nom: 'Direction des Ressources Humaines' },
    { id: 5, nom: 'Direction des Systèmes d\'Information' }
  ];

  const effectuerRecherche = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const resultatsRecherche = await CourrierService.rechercherCourriers(criteres);
      setResultats(resultatsRecherche);
      setRechercheEffectuee(true);
      onResultatsChange?.(resultatsRecherche);
    } catch (err: any) {
      console.error('Erreur recherche:', err);
      setError('Erreur lors de la recherche. Données mockées affichées.');
      
      // Données mockées en cas d'erreur
      const resultatsFactices: ResultatRecherche = {
        courriers: [],
        totalElements: 0,
        totalPages: 0,
        pageActuelle: 0,
        taille: criteres.taille
      };
      setResultats(resultatsFactices);
      setRechercheEffectuee(true);
    } finally {
      setLoading(false);
    }
  };

  const reinitialiserCriteres = () => {
    setCriteres({
      page: 0,
      taille: 20,
      triPar: 'date',
      ordreDecroissant: true
    });
    setResultats(null);
    setRechercheEffectuee(false);
    setError(null);
  };

  const exporterResultats = () => {
    if (!resultats) return;
    
    const donneesExport = {
      criteres,
      resultats,
      dateExport: new Date().toISOString(),
      totalResultats: resultats.totalElements
    };
    
    const dataStr = JSON.stringify(donneesExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recherche-courriers-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const changerPage = (nouvellePage: number) => {
    setCriteres(prev => ({ ...prev, page: nouvellePage }));
  };

  useEffect(() => {
    if (rechercheEffectuee) {
      effectuerRecherche();
    }
  }, [criteres.page]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Recherche Avancée</h2>
              <p className="text-sm text-slate-400">
                Recherche multicritères dans tous les courriers
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltresOuverts(!filtresOuverts)}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {filtresOuverts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Formulaire de recherche */}
      {filtresOuverts && (
        <div className="p-6 border-b border-slate-700">
          <div className="space-y-6">
            {/* Recherche textuelle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Référence du courrier
                </label>
                <input
                  type="text"
                  value={criteres.reference || ''}
                  onChange={(e) => setCriteres(prev => ({ ...prev, reference: e.target.value || undefined }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="ENT-2024-0001, SOR-2024-0001..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Objet (mots-clés)
                </label>
                <input
                  type="text"
                  value={criteres.objet || ''}
                  onChange={(e) => setCriteres(prev => ({ ...prev, objet: e.target.value || undefined }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="Rechercher dans l'objet..."
                />
              </div>
            </div>

            {/* Filtres par type et statut */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                <select
                  value={criteres.type || ''}
                  onChange={(e) => setCriteres(prev => ({ ...prev, type: e.target.value as TypeCourrierEnum || undefined }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Tous les types</option>
                  <option value="ENTRANT">Entrant</option>
                  <option value="SORTANT">Sortant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type de document</label>
                <select
                  value={criteres.typeDocument || ''}
                  onChange={(e) => setCriteres(prev => ({ ...prev, typeDocument: e.target.value as TypeDocument || undefined }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Tous les documents</option>
                  {typesDocument.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Statut</label>
                <select
                  value={criteres.statut || ''}
                  onChange={(e) => setCriteres(prev => ({ ...prev, statut: e.target.value as StatutCourrierEnum || undefined }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  {statutsCourrier.map(statut => (
                    <option key={statut.value} value={statut.value}>{statut.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Priorité</label>
                <select
                  value={criteres.priorite || ''}
                  onChange={(e) => setCriteres(prev => ({ ...prev, priorite: e.target.value as PrioriteCourrier || undefined }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Toutes les priorités</option>
                  {niveauxPriorite.map(priorite => (
                    <option key={priorite.value} value={priorite.value}>{priorite.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtres temporels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date début réception
                  </label>
                  <input
                    type="date"
                    value={criteres.dateDebutReception || ''}
                    onChange={(e) => setCriteres(prev => ({ ...prev, dateDebutReception: e.target.value || undefined }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date fin réception
                  </label>
                  <input
                    type="date"
                    value={criteres.dateFinReception || ''}
                    onChange={(e) => setCriteres(prev => ({ ...prev, dateFinReception: e.target.value || undefined }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date début envoi
                  </label>
                  <input
                    type="date"
                    value={criteres.dateDebutEnvoi || ''}
                    onChange={(e) => setCriteres(prev => ({ ...prev, dateDebutEnvoi: e.target.value || undefined }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date fin envoi
                  </label>
                  <input
                    type="date"
                    value={criteres.dateFinEnvoi || ''}
                    onChange={(e) => setCriteres(prev => ({ ...prev, dateFinEnvoi: e.target.value || undefined }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Filtres par structure et direction */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Expéditeur (nom structure)
                </label>
                <input
                  type="text"
                  value={criteres.expediteurNom || ''}
                  onChange={(e) => setCriteres(prev => ({ ...prev, expediteurNom: e.target.value || undefined }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="Nom de la structure expéditrice"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Destinataire (nom structure)
                </label>
                <input
                  type="text"
                  value={criteres.destinataireNom || ''}
                  onChange={(e) => setCriteres(prev => ({ ...prev, destinataireNom: e.target.value || undefined }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="Nom de la structure destinataire"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Direction</label>
                <select
                  value={criteres.directionId || ''}
                  onChange={(e) => setCriteres(prev => ({ ...prev, directionId: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Toutes les directions</option>
                  {directions.map(direction => (
                    <option key={direction.id} value={direction.id}>{direction.nom}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Options de tri et pagination */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Trier par</label>
                <select
                  value={criteres.triPar || 'date'}
                  onChange={(e) => setCriteres(prev => ({ ...prev, triPar: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {optionsTri.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ordre</label>
                <select
                  value={criteres.ordreDecroissant ? 'desc' : 'asc'}
                  onChange={(e) => setCriteres(prev => ({ ...prev, ordreDecroissant: e.target.value === 'desc' }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="desc">Décroissant (récent → ancien)</option>
                  <option value="asc">Croissant (ancien → récent)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Résultats par page</label>
                <select
                  value={criteres.taille}
                  onChange={(e) => setCriteres(prev => ({ ...prev, taille: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-600">
              <button
                onClick={reinitialiserCriteres}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Réinitialiser
              </button>

              <div className="flex items-center gap-3">
                {resultats && (
                  <button
                    onClick={exporterResultats}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exporter
                  </button>
                )}

                <button
                  onClick={effectuerRecherche}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {loading ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Résultats */}
      {error && (
        <div className="p-4 bg-yellow-500/20 border-y border-yellow-500/50">
          <p className="text-yellow-400 text-sm">{error}</p>
        </div>
      )}

      {resultats && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Résultats de recherche ({resultats.totalElements})
            </h3>
            
            {resultats.totalElements > 0 && (
              <span className="text-sm text-slate-400">
                Page {resultats.pageActuelle + 1} sur {resultats.totalPages}
              </span>
            )}
          </div>

          {resultats.totalElements === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Aucun résultat trouvé</h3>
              <p className="text-slate-400">
                Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
              </p>
            </div>
          ) : (
            <>
              {/* Liste des résultats */}
              <div className="space-y-3 mb-6">
                {resultats.courriers.map((courrier: any, index) => (
                  <div key={index} className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{courrier.numero || `Courrier ${index + 1}`}</h4>
                      <span className="text-xs text-slate-400">
                        {courrier.type || 'ENTRANT'} • {courrier.statut || 'EN_ATTENTE'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">
                      {courrier.objet || 'Objet du courrier non disponible'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {courrier.expediteur?.nom || courrier.destinataire?.nom || 'Structure non renseignée'}
                      </span>
                      <button className="p-1 text-slate-400 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {resultats.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => changerPage(Math.max(0, resultats.pageActuelle - 1))}
                    disabled={resultats.pageActuelle === 0}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Précédent
                  </button>
                  
                  <span className="px-4 py-2 text-slate-400">
                    Page {resultats.pageActuelle + 1} sur {resultats.totalPages}
                  </span>

                  <button
                    onClick={() => changerPage(Math.min(resultats.totalPages - 1, resultats.pageActuelle + 1))}
                    disabled={resultats.pageActuelle >= resultats.totalPages - 1}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};