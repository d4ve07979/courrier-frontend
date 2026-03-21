// src/components/courriers/DetailsCourrier.tsx
import React, { useState, useEffect } from 'react';
import { Download, Edit, Archive, Share2, X, Eye, FileText, Calendar, User, Building, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { courrierApi } from '../../api/courrierApi';
import { affectationApi } from '../../api/affectationApi';
import type { Courrier } from '../../types/Courrier';
import type { Affectation } from '../../types/Affectation';
import { formatUtils } from '../../utils/formatUtils';

interface Props {
  courrierId: number;
  onClose: () => void;
  onEdit?: (courrier: Courrier) => void;
  onArchive?: (courrierId: number) => void;
}

export const DetailsCourrier: React.FC<Props> = ({ courrierId, onClose, onEdit, onArchive }) => {
  const [courrier, setCourrier] = useState<Courrier | null>(null);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'doc' | 'other' | null>(null);
  const [showFullFiche, setShowFullFiche] = useState(false);

  // Charger les détails du courrier au montage du composant
  useEffect(() => {
    loadCourrierDetails();
  }, [courrierId]);

  // Fonction pour charger les détails du courrier depuis l'API
  const loadCourrierDetails = async () => {
    try {
      setLoading(true);
      setLoadingError(null);

      // Charger le courrier
      const courrierData = await courrierApi.obtenirParId(courrierId);
      setCourrier(courrierData);

      // Charger les affectations (optionnel)
      try {
        const affectationsData = await affectationApi.getByCourrierId(courrierId);
        setAffectations(affectationsData);
      } catch (affectationError) {
        console.warn('Affectations non disponibles:', affectationError);
        setAffectations([]);
      }
    } catch (error: any) {
      console.error('Error loading courrier details:', error);
      if (error.response?.status === 403) {
        setLoadingError('Accès non autorisé à ce courrier');
      } else if (error.message?.includes('non trouvé')) {
        setLoadingError('Courrier introuvable');
      } else {
        setLoadingError('Impossible de charger les détails du courrier');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour prévisualiser un fichier
  const handlePreviewFile = async (fichierId: number, nomFichier: string) => {
    try {
      if (!courrier) return;
      
      console.log('🔄 Téléchargement du fichier pour prévisualisation:', nomFichier);
      const blob = await courrierApi.telechargerFichier(courrier.id_courrier, fichierId);
      
      const extension = nomFichier.split('.').pop()?.toLowerCase();
      
      // Types MIME supportés
      const mimeTypes: Record<string, string> = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'txt': 'text/plain',
        'csv': 'text/csv',
        'html': 'text/html',
        'htm': 'text/html',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      
      const mimeType = mimeTypes[extension || ''] || 'application/octet-stream';
      const fileBlob = new Blob([blob], { type: mimeType });
      const url = URL.createObjectURL(fileBlob);
      
      // Déterminer le type pour l'affichage
      if (extension === 'pdf') {
        setPreviewType('pdf');
        setPreviewUrl(url);
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
        setPreviewType('image');
        setPreviewUrl(url);
      } else if (['doc', 'docx'].includes(extension || '')) {
        // Pour les documents Word, ouvrir dans un nouvel onglet
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        // Autres types non supportés
        const confirmDownload = window.confirm(
          `La prévisualisation n'est pas disponible pour ce type de fichier (${extension || 'inconnu'}). Voulez-vous le télécharger ?`
        );
        if (confirmDownload) {
          await handleDownloadFile(fichierId, nomFichier);
        }
        URL.revokeObjectURL(url);
      }
      
    } catch (error) {
      console.error('❌ Erreur prévisualisation:', error);
      alert('Impossible de prévisualiser ce fichier. Veuillez utiliser le téléchargement.');
    }
  };

  // Fonction pour télécharger un fichier
  const handleDownloadFile = async (fichierId: number, nomFichier: string) => {
    try {
      if (!courrier) return;
      
      console.log('📥 Téléchargement du fichier:', nomFichier);
      const blob = await courrierApi.telechargerFichier(courrier.id_courrier, fichierId);
      
      // Créer l'URL et déclencher le téléchargement
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomFichier;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Nettoyer l'URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  // Fermer la prévisualisation
  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewType(null);
    }
  };

  // Obtenir l'icône selon le type de fichier
  const getFileIcon = (fileName: string) => {
    if (!fileName) return '📄';
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp': return '🖼️';
      case 'txt': return '📃';
      case 'zip':
      case 'rar':
      case '7z': return '🗜️';
      default: return '📎';
    }
  };

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-40 pt-24">
        <div className="bg-slate-800 rounded-xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto mt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-center text-slate-400 mt-4">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si le chargement a échoué
  if (loadingError || !courrier) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-40 pt-24">
        <div className="bg-slate-800 rounded-xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto relative mt-16">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-red-400 text-xl mb-4">{loadingError || 'Courrier non trouvé'}</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fichiers = courrier.fichiers || [];

  return (
    <>
      {/* Overlay semi-transparent - z-index: 30 (en dessous du header/sidebar) */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30" onClick={onClose} />
      
      {/* Modal principal - z-index: 35 (entre overlay et header/sidebar) */}
      <div className="fixed inset-0 flex items-start justify-center z-35 p-4 overflow-y-auto pt-24">
        <div className="bg-slate-800 rounded-xl p-8 max-w-4xl w-full shadow-2xl mt-16">
          {/* Header avec titre et boutons d'action */}
          <div className="sticky top-0 bg-slate-800 pt-2 pb-4 border-b border-slate-700 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">{courrier.objet || 'Sans objet'}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-400 flex-wrap">
                  <Tag className="w-4 h-4 flex-shrink-0" />
                  <span>{courrier.id_type_courrier?.libelle || 'Type inconnu'}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Créé le {formatUtils.date(courrier.date_reception)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <span className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  courrier.id_statut?.libelle_statut === 'EN_ATTENTE' ? 'bg-orange-500/20 text-orange-400' :
                  courrier.id_statut?.libelle_statut === 'AFFECTE' ? 'bg-blue-500/20 text-blue-400' :
                  courrier.id_statut?.libelle_statut === 'TRAITE' ? 'bg-green-500/20 text-green-400' :
                  courrier.id_statut?.libelle_statut === 'ARCHIVE' ? 'bg-slate-500/20 text-slate-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {courrier.id_statut?.libelle_statut || 'Statut inconnu'}
                </span>
                
                {onEdit && (
                  <button
                    onClick={() => onEdit(courrier)}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                
                {onArchive && (
                  <button
                    onClick={() => onArchive(courrier.id_courrier)}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    title="Archiver"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  title="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expéditeur et Destinataire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-purple-400 mb-3">
                <Building className="w-4 h-4" />
                <h3 className="font-medium">Expéditeur</h3>
              </div>
              <p className="text-white text-lg mb-1 break-words">{courrier.id_expediteur?.nom_de_structure || 'Inconnu'}</p>
              {courrier.id_expediteur?.nom_du_responsable && (
                <p className="text-sm text-slate-400 break-words">Resp: {courrier.id_expediteur.nom_du_responsable}</p>
              )}
              {courrier.id_expediteur?.adresse_email && (
                <p className="text-sm text-slate-400 break-words">{courrier.id_expediteur.adresse_email}</p>
              )}
              {courrier.id_expediteur?.tel && (
                <p className="text-sm text-slate-400">Tél: {courrier.id_expediteur.tel}</p>
              )}
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-blue-400 mb-3">
                <User className="w-4 h-4" />
                <h3 className="font-medium">Destinataire</h3>
              </div>
              <p className="text-white text-lg mb-1 break-words">{courrier.id_destinataire?.nom_de_structure || 'Inconnu'}</p>
              {courrier.id_destinataire?.nom_du_responsable && (
                <p className="text-sm text-slate-400 break-words">Resp: {courrier.id_destinataire.nom_du_responsable}</p>
              )}
              {courrier.id_destinataire?.adresse_email && (
                <p className="text-sm text-slate-400 break-words">{courrier.id_destinataire.adresse_email}</p>
              )}
              {courrier.id_destinataire?.tel && (
                <p className="text-sm text-slate-400">Tél: {courrier.id_destinataire.tel}</p>
              )}
            </div>
          </div>

          {/* Fiche de transmission */}
          {courrier.id_fiche && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Fiche de transmission
                </h2>
                <button
                  onClick={() => setShowFullFiche(!showFullFiche)}
                  className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showFullFiche ? 'Voir moins' : 'Voir plus'}
                  {showFullFiche ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                {courrier.id_fiche.reference && (
                  <div className="mb-3">
                    <span className="text-sm text-slate-400 block">Référence:</span>
                    <p className="text-white break-words">{courrier.id_fiche.reference}</p>
                  </div>
                )}
                
                {courrier.id_fiche.observation && (
                  <div className="mb-3">
                    <span className="text-sm text-slate-400 block">Observation:</span>
                    <p className="text-white break-words">{courrier.id_fiche.observation}</p>
                  </div>
                )}

                {showFullFiche && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <h4 className="text-white font-medium mb-3">Options détaillées</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(courrier.id_fiche).map(([key, value]) => {
                        if (['reference', 'observation', 'id_fiche', 'dateEnvoi', 'courrier', 'idFiche', 'dateEnvoie'].includes(key) || typeof value !== 'boolean') {
                          return null;
                        }
                        if (value === true) {
                          const formattedKey = key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase())
                            .replace(/_/g, ' ');
                          
                          return (
                            <div key={key} className="flex items-center gap-2 text-sm">
                              <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                              <span className="text-slate-300 break-words">{formattedKey}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pièces jointes */}
          {fichiers.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Pièces jointes ({fichiers.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fichiers.map((fichier) => {
                  const nomFichier = fichier.nomFichier || fichier.nom_fichier || `Fichier ${fichier.id || fichier.id_fichier || ''}`;
                  const fichierId = fichier.id_fichier || fichier.id;
                  const extension = nomFichier.split('.').pop()?.toLowerCase();
                  
                  return (
                    <div key={fichierId} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-purple-500/50 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl flex-shrink-0">{getFileIcon(nomFichier)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate" title={nomFichier}>
                            {nomFichier}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {extension?.toUpperCase() || 'Fichier'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePreviewFile(fichierId, nomFichier)}
                          className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
                          title={extension === 'docx' ? 'Ouvrir dans un nouvel onglet' : 'Prévisualiser'}
                        >
                          <Eye className="w-4 h-4" />
                          {extension === 'docx' ? 'Ouvrir' : 'Prévisualiser'}
                        </button>
                        <button
                          onClick={() => handleDownloadFile(fichierId, nomFichier)}
                          className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm flex items-center justify-center gap-1 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Télécharger
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Historique des affectations */}
          {affectations.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Historique des affectations
              </h2>
              <div className="space-y-3">
                {affectations.map((affectation) => (
                  <div key={affectation.id_affectation || affectation.id} className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Share2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium break-words">
                        {affectation.direction?.nomDirection || affectation.directionDestination?.nom || 'Direction inconnue'}
                      </p>
                      <p className="text-sm text-slate-400">
                        Affecté le {formatUtils.datetime(affectation.date_affectation || affectation.dateAffectation)}
                      </p>
                      {(affectation.motif || affectation.observations || affectation.commentaire) && (
                        <p className="text-sm text-slate-300 mt-2 bg-slate-800/50 p-2 rounded break-words">
                          {affectation.motif || affectation.observations || affectation.commentaire}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de prévisualisation pour les images - Version améliorée avec z-index élevé */}
      {previewUrl && previewType === 'image' && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transform transition-all duration-300 scale-100">
            {/* En-tête du modal */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Prévisualisation</h3>
                  <p className="text-sm text-gray-500">Aperçu de l'image</p>
                </div>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors group"
                title="Fermer"
              >
                <X className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              </button>
            </div>
            
            {/* Corps du modal avec l'image */}
            <div className="flex-1 p-6 overflow-auto bg-gray-100 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Prévisualisation"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
            
            {/* Pied du modal avec informations et bouton de téléchargement */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Fichier image</span> • Cliquez sur télécharger pour sauvegarder
              </div>
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = previewUrl;
                  a.download = 'image.png';
                  a.click();
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-md"
              >
                <Download className="w-4 h-4" />
                Télécharger l'image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de prévisualisation PDF - Version améliorée avec z-index élevé */}
      {previewUrl && previewType === 'pdf' && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col shadow-2xl transform transition-all duration-300 scale-100">
            {/* En-tête du modal */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Prévisualisation PDF</h3>
                  <p className="text-sm text-gray-500">Document PDF</p>
                </div>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors group"
                title="Fermer"
              >
                <X className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              </button>
            </div>
            
            {/* Corps du modal avec le PDF */}
            <div className="flex-1 bg-gray-100 p-2">
              <iframe
                src={previewUrl}
                className="w-full h-full rounded-lg border-0"
                title="Prévisualisation PDF"
              />
            </div>
            
            {/* Pied du modal */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
              <button
                onClick={closePreview}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message pour les fichiers non prévisualisables */}
      {previewUrl && previewType === 'doc' && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Document Word</h3>
                  <p className="text-sm text-gray-500">Prévisualisation non disponible</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Les fichiers Word ne peuvent pas être prévisualisés directement. 
                Veuillez télécharger le fichier pour l'ouvrir avec votre application.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={closePreview}
                  className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (courrier && previewUrl) {
                      const fichierId = fichiers.find(f => 
                        f.nomFichier?.includes('doc') || f.nom_fichier?.includes('doc')
                      )?.id_fichier;
                      if (fichierId) {
                        handleDownloadFile(fichierId, 'document.docx');
                      }
                    }
                    closePreview();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};