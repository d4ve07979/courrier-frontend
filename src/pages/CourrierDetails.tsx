// src/pages/CourrierDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Download, Edit, Archive, Share2, Eye, X, 
  FileText, Calendar, User, Building, Tag, ChevronDown, ChevronUp, CheckCircle
} from 'lucide-react';
import { courrierApi } from '../api/courrierApi';
import { affectationApi } from '../api/affectationApi';
import type { Courrier } from '../types/Courrier';
import type { Affectation } from '../types/Affectation';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { formatUtils } from '../utils/formatUtils';
import { DechargeModal } from '../components/decharge/DechargeModal';
import { ListeDecharges } from '../components/decharge/ListeDecharges';

export const CourrierDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [courrier, setCourrier] = useState<Courrier | null>(null);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'doc' | 'other' | null>(null);
  const [showFullFiche, setShowFullFiche] = useState(false);
  const [showDechargeModal, setShowDechargeModal] = useState(false);
  const [dechargeRefresh, setDechargeRefresh] = useState(0);

  useEffect(() => {
    if (id) {
      loadCourrierDetails();
    }
  }, [id]);

  const loadCourrierDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const courrierData = await courrierApi.obtenirParId(Number(id));
      setCourrier(courrierData);

      // Charger les affectations
      try {
        const affectationsData = await affectationApi.getByCourrierId(Number(id));
        setAffectations(affectationsData);
      } catch (affectationError) {
        console.warn('Affectations non disponibles:', affectationError);
        setAffectations([]);
      }
    } catch (error: any) {
      console.error('Error loading courrier details:', error);
      if (error.response?.status === 403) {
        setError('Accès non autorisé à ce courrier');
      } else if (error.message?.includes('non trouvé')) {
        setError('Courrier introuvable');
      } else {
        setError('Impossible de charger les détails du courrier');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewFile = async (fichierId: number, nomFichier: string) => {
    try {
      if (!courrier) return;
      
      console.log('🔄 Téléchargement du fichier pour prévisualisation:', nomFichier);
      const blob = await courrierApi.telechargerFichier(courrier.id_courrier, fichierId);
      
      const extension = nomFichier.split('.').pop()?.toLowerCase();
      
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
      
      if (extension === 'pdf') {
        setPreviewType('pdf');
        setPreviewUrl(url);
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
        setPreviewType('image');
        setPreviewUrl(url);
      } else if (['doc', 'docx'].includes(extension || '')) {
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
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

  const handleDownloadFile = async (fichierId: number, nomFichier: string) => {
    try {
      if (!courrier) return;
      
      console.log('📥 Téléchargement du fichier:', nomFichier);
      const blob = await courrierApi.telechargerFichier(courrier.id_courrier, fichierId);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nomFichier;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewType(null);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 pt-24">
            <div className="max-w-5xl mx-auto text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Chargement des détails...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !courrier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 pt-24">
            <div className="max-w-5xl mx-auto text-center">
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-8">
                <p className="text-red-400 text-xl mb-4">{error || 'Courrier non trouvé'}</p>
                <button
                  onClick={() => navigate('/courriers')}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  Retour à la liste
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const fichiers = courrier.fichiers || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 pt-24">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Header retour + actions */}
            <div className="flex items-center justify-between">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
                Retour
              </button>
              <div className="flex gap-3">
                <button 
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 flex items-center gap-2"
                  onClick={() => navigate(`/modifier-courrier/${courrier.id_courrier}`)}
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 flex items-center gap-2">
                  <Archive className="w-4 h-4" />
                  Archiver
                </button>
              </div>
            </div>

            {/* Carte principale */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              {/* Titre + type + statut */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{courrier.objet || 'Sans objet'}</h1>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Tag className="w-4 h-4" />
                    <span>{courrier.id_type_courrier?.libelle || 'Type inconnu'}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="w-4 h-4" />
                    <span>Reçu le {formatUtils.date(courrier.date_reception)}</span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  courrier.id_statut?.libelle_statut === 'EN_ATTENTE' ? 'bg-orange-500/20 text-orange-400' :
                  courrier.id_statut?.libelle_statut === 'AFFECTE' ? 'bg-blue-500/20 text-blue-400' :
                  courrier.id_statut?.libelle_statut === 'TRAITE' ? 'bg-green-500/20 text-green-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {courrier.id_statut?.libelle_statut || 'Statut inconnu'}
                </span>
              </div>

              {/* Expéditeur et Destinataire - Style DetailsCourrier */}
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

              {/* Fiche de transmission - Style DetailsCourrier */}
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

              {/* Pièces jointes - Style amélioré de DetailsCourrier */}
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

              {/* Historique des affectations - Style amélioré */}
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

              {/* Section Décharges */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Décharges de réception
                  </h2>
                  <button
                    onClick={() => setShowDechargeModal(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Enregistrer une décharge
                  </button>
                </div>
                <ListeDecharges
                  idCourrier={Number(id)}
                  refresh={dechargeRefresh}
                />
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Modal décharge */}
      {showDechargeModal && courrier && (
        <DechargeModal
          idCourrier={Number(id)}
          objetCourrier={courrier.objet || 'Sans objet'}
          onClose={() => setShowDechargeModal(false)}
          onSuccess={() => setDechargeRefresh(r => r + 1)}
        />
      )}

      {/* Modale de prévisualisation améliorée */}
      {previewUrl && previewType === 'image' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
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
              <button onClick={closePreview} className="p-2 hover:bg-gray-200 rounded-full">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-auto bg-gray-100 flex items-center justify-center">
              <img src={previewUrl} alt="Prévisualisation" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg" />
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Fichier image</span> • Cliquez sur télécharger pour sauvegarder
              </div>
              <button onClick={() => {
                const a = document.createElement('a');
                a.href = previewUrl;
                a.download = 'image.png';
                a.click();
              }} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                <Download className="w-4 h-4" />
                Télécharger
              </button>
            </div>
          </div>
        </div>
      )}

      {previewUrl && previewType === 'pdf' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col shadow-2xl">
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
              <button onClick={closePreview} className="p-2 hover:bg-gray-200 rounded-full">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 p-2">
              <iframe src={previewUrl} className="w-full h-full rounded-lg border-0" title="Prévisualisation PDF" />
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
              <button onClick={closePreview} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {previewUrl && previewType === 'doc' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
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
                <button onClick={closePreview} className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium">
                  Annuler
                </button>
                <button onClick={() => {
                  const fichierWord = fichiers.find(f => 
                    f.nomFichier?.includes('doc') || f.nom_fichier?.includes('doc')
                  );
                  if (fichierWord) {
                    const id = fichierWord.id_fichier || fichierWord.id;
                    const nom = fichierWord.nomFichier || fichierWord.nom_fichier || 'document.docx';
                    handleDownloadFile(id, nom);
                  }
                  closePreview();
                }} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};