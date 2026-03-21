import React, { useState } from 'react';
import { Send, Upload, Calendar, MessageSquare, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import type { Courrier } from '../../types/Courrier';
import { CourrierService } from '../../services/courrierService';

interface Props {
  courrier: Courrier;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EnvoiCourrier: React.FC<Props> = ({ courrier, onSuccess, onCancel }) => {
  const [dateEnvoi, setDateEnvoi] = useState(new Date().toISOString().split('T')[0]);
  const [moyenEnvoi, setMoyenEnvoi] = useState('');
  const [decharge, setDecharge] = useState<File | null>(null);
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moyensEnvoi = [
    { value: 'COURRIER_PHYSIQUE', label: 'Courrier physique' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'FAX', label: 'Fax' },
    { value: 'REMISE_EN_MAIN_PROPRE', label: 'Remise en main propre' },
    { value: 'COURSIER', label: 'Coursier' },
    { value: 'POSTE', label: 'Poste' },
    { value: 'AUTRE', label: 'Autre (préciser)' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Format de fichier non supporté pour la décharge. Utilisez PDF, JPG ou PNG.');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier de décharge est trop volumineux (max 5MB).');
        return;
      }
      
      setDecharge(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!moyenEnvoi) {
      setError('Veuillez sélectionner un moyen d\'envoi');
      return;
    }

    if (!dateEnvoi) {
      setError('Veuillez saisir la date d\'envoi');
      return;
    }

    // Vérifier que la date n'est pas dans le futur
    const today = new Date().toISOString().split('T')[0];
    if (dateEnvoi > today) {
      setError('La date d\'envoi ne peut pas être dans le futur');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await CourrierService.marquerEnvoye(courrier.id, {
        dateEnvoi,
        moyenEnvoi: moyenEnvoi === 'AUTRE' ? observations : moyenEnvoi,
        decharge: decharge || undefined
      });

      console.log('✅ Courrier marqué comme envoyé');
      onSuccess?.();
    } catch (err: any) {
      console.error('❌ Erreur envoi:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
          <Send className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Envoi du Courrier</h2>
          <p className="text-sm text-slate-400">
            Courrier: {courrier.numero} - {courrier.objet}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations du destinataire */}
        <div className="p-4 bg-slate-700/30 rounded-lg">
          <h3 className="text-white font-medium mb-3">Destinataire</h3>
          {courrier.destinataire ? (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-400">Structure:</span>
                <span className="text-white ml-2">{courrier.destinataire.nom}</span>
              </div>
              <div>
                <span className="text-slate-400">Responsable:</span>
                <span className="text-white ml-2">{courrier.destinataire.nomResponsable}</span>
              </div>
              <div>
                <span className="text-slate-400">Email:</span>
                <span className="text-white ml-2">{courrier.destinataire.adresseEmail}</span>
              </div>
              <div>
                <span className="text-slate-400">Téléphone:</span>
                <span className="text-white ml-2">{courrier.destinataire.telephone}</span>
              </div>
              <div>
                <span className="text-slate-400">Adresse:</span>
                <span className="text-white ml-2">{courrier.destinataire.adresseGeographique}</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Informations destinataire non disponibles</p>
          )}
        </div>

        {/* Date d'envoi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date d'envoi *
            </label>
            <input
              type="date"
              required
              value={dateEnvoi}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDateEnvoi(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Moyen d'envoi *
            </label>
            <select
              required
              value={moyenEnvoi}
              onChange={(e) => setMoyenEnvoi(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">Sélectionnez un moyen</option>
              {moyensEnvoi.map(moyen => (
                <option key={moyen.value} value={moyen.value}>{moyen.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Observations (obligatoire si "Autre" sélectionné) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Observations {moyenEnvoi === 'AUTRE' && '*'}
          </label>
          <textarea
            required={moyenEnvoi === 'AUTRE'}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            placeholder={
              moyenEnvoi === 'AUTRE' 
                ? "Précisez le moyen d'envoi utilisé..." 
                : "Observations sur l'envoi (optionnel)..."
            }
          />
        </div>

        {/* Upload de la décharge */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Upload className="w-4 h-4 inline mr-1" />
            Décharge de réception (recommandé)
          </label>
          
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-6">
            <input
              type="file"
              id="decharge"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="decharge"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">
                  {decharge ? decharge.name : 'Cliquez pour sélectionner la décharge'}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  PDF, JPG, PNG (max 5MB)
                </p>
                {decharge && (
                  <p className="text-xs text-slate-500 mt-1">
                    Taille: {formatFileSize(decharge.size)}
                  </p>
                )}
              </div>
            </label>
          </div>

          <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <p className="text-cyan-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              La décharge confirme la réception du courrier par le destinataire
            </p>
          </div>
        </div>

        {/* Récapitulatif */}
        <div className="p-4 bg-slate-700/30 rounded-lg">
          <h3 className="text-white font-medium mb-3">Récapitulatif de l'envoi</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Courrier:</span>
              <span className="text-white">{courrier.numero}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date d'envoi:</span>
              <span className="text-white">
                {dateEnvoi ? new Date(dateEnvoi).toLocaleDateString('fr-FR') : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Moyen d'envoi:</span>
              <span className="text-white">
                {moyenEnvoi ? moyensEnvoi.find(m => m.value === moyenEnvoi)?.label || moyenEnvoi : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Décharge:</span>
              <span className="text-white">
                {decharge ? 'Oui' : 'Non'}
              </span>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-600">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading || !moyenEnvoi || !dateEnvoi}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Envoi...' : 'Marquer comme envoyé'}
          </button>
        </div>
      </form>
    </div>
  );
};