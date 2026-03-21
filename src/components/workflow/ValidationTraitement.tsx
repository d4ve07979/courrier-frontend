import React, { useState } from 'react';
import { CheckCircle, Upload, MessageSquare, FileText, AlertCircle, Send } from 'lucide-react';
import type { Courrier } from '../../types/Courrier';
import { CourrierService } from '../../services/courrierService';

interface Props {
  courrier: Courrier;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ValidationTraitement: React.FC<Props> = ({ courrier, onSuccess, onCancel }) => {
  const [observations, setObservations] = useState('');
  const [documentsJoints, setDocumentsJoints] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Vérifier les types de fichiers
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Certains fichiers ont un format non supporté. Utilisez PDF, JPG, PNG, DOC ou DOCX.');
      return;
    }
    
    // Vérifier la taille totale (max 50MB)
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 50 * 1024 * 1024) {
      setError('La taille totale des fichiers ne doit pas dépasser 50MB.');
      return;
    }
    
    setDocumentsJoints(files);
    setError(null);
  };

  const removeFile = (index: number) => {
    setDocumentsJoints(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!observations.trim()) {
      setError('Veuillez saisir des observations sur le traitement');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await CourrierService.validerTraitement(courrier.id, {
        observations: observations.trim(),
        documentsJoints: documentsJoints.length > 0 ? documentsJoints : undefined
      });

      console.log('✅ Traitement validé avec succès');
      onSuccess?.();
    } catch (err: any) {
      console.error('❌ Erreur validation:', err);
      setError(err.response?.data?.message || 'Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Validation du Traitement</h2>
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
        {/* Informations du courrier */}
        <div className="p-4 bg-slate-700/30 rounded-lg">
          <h3 className="text-white font-medium mb-3">Informations du courrier</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Numéro:</span>
              <span className="text-white ml-2">{courrier.numero}</span>
            </div>
            <div>
              <span className="text-slate-400">Type:</span>
              <span className="text-white ml-2">{courrier.type}</span>
            </div>
            <div>
              <span className="text-slate-400">Statut actuel:</span>
              <span className="text-white ml-2">{courrier.statut.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-slate-400">Priorité:</span>
              <span className="text-white ml-2">{courrier.priorite.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Observations sur le traitement */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Observations sur le traitement *
          </label>
          <textarea
            required
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
            placeholder="Décrivez le traitement effectué, les actions prises, les recommandations..."
          />
          <p className="text-slate-400 text-xs mt-1">
            Minimum 10 caractères - Décrivez précisément le traitement effectué
          </p>
        </div>

        {/* Documents joints */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Upload className="w-4 h-4 inline mr-1" />
            Documents joints (optionnel)
          </label>
          
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-6">
            <input
              type="file"
              id="documentsJoints"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="documentsJoints"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">
                  Cliquez pour sélectionner des fichiers
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  PDF, JPG, PNG, DOC, DOCX (max 50MB total)
                </p>
              </div>
            </label>
          </div>

          {/* Liste des fichiers sélectionnés */}
          {documentsJoints.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-slate-300">
                Fichiers sélectionnés ({documentsJoints.length})
              </h4>
              {documentsJoints.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-white text-sm">{file.name}</p>
                      <p className="text-slate-400 text-xs">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workflow suivant */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
            <Send className="w-4 h-4" />
            Étape suivante
          </h3>
          <p className="text-blue-300 text-sm">
            Après validation, le courrier sera retourné au Directeur Général pour approbation finale, 
            puis transmis au secrétariat du DG pour préparation de la réponse.
          </p>
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
            disabled={loading || !observations.trim()}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {loading ? 'Validation...' : 'Valider le traitement'}
          </button>
        </div>
      </form>
    </div>
  );
};