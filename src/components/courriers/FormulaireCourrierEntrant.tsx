import React, { useState } from 'react';
import { Upload, Save, X, FileText, Building, User, Mail, Phone, MapPin } from 'lucide-react';
import type { 
  Courrier, 
  TypeDocument, 
  PrioriteCourrier,
  Structure
} from '../../types/Courrier';
import { CourrierService } from '../../services/courrierService';

interface Props {
  onSuccess?: (courrier: Courrier) => void;
  onCancel?: () => void;
}

export const FormulaireCourrierEntrant: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    objet: '',
    typeDocument: 'COURRIER_OFFICIEL' as TypeDocument,
    priorite: 'NORMALE' as PrioriteCourrier,
    serviceDestinataire: '',
    observations: '',
    expediteur: {
      nom: '',
      nomResponsable: '',
      adresseEmail: '',
      adresseGeographique: '',
      telephone: ''
    } as Structure
  });
  
  const [fichierScan, setFichierScan] = useState<File | null>(null);

  const typesDocument = [
    { value: 'COURRIER_OFFICIEL', label: 'Courrier officiel' },
    { value: 'DEMANDE', label: 'Demande' },
    { value: 'FACTURE', label: 'Facture' },
    { value: 'RAPPORT', label: 'Rapport' },
    { value: 'INVITATION', label: 'Invitation' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  const niveauxPriorite = [
    { value: 'NORMALE', label: 'Normale', color: 'text-green-400' },
    { value: 'URGENTE', label: 'Urgente', color: 'text-orange-400' },
    { value: 'TRES_URGENTE', label: 'Très urgente', color: 'text-red-400' }
  ];



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const courrier = await CourrierService.creerCourrierEntrant({
        ...formData,
        dateReception: new Date().toISOString()
      });

      console.log('✅ Courrier entrant créé:', courrier);
      onSuccess?.(courrier);
    } catch (err: any) {
      console.error('❌ Erreur création courrier:', err);
      setError(err.message || 'Erreur lors de la création du courrier');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Format de fichier non supporté. Utilisez PDF, JPG ou PNG.');
        return;
      }
      
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 10MB).');
        return;
      }
      
      setFichierScan(file);
      setError(null);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Nouveau Courrier Entrant</h2>
            <p className="text-sm text-slate-400">Numérotation automatique ENT-{new Date().getFullYear()}-XXXX</p>
          </div>
        </div>
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Objet du courrier *
            </label>
            <input
              type="text"
              required
              value={formData.objet}
              onChange={(e) => setFormData(prev => ({ ...prev, objet: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              placeholder="Saisissez l'objet du courrier"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type de document *
            </label>
            <select
              required
              value={formData.typeDocument}
              onChange={(e) => setFormData(prev => ({ ...prev, typeDocument: e.target.value as TypeDocument }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {typesDocument.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Priorité *
            </label>
            <select
              required
              value={formData.priorite}
              onChange={(e) => setFormData(prev => ({ ...prev, priorite: e.target.value as PrioriteCourrier }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {niveauxPriorite.map(priorite => (
                <option key={priorite.value} value={priorite.value}>{priorite.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Service destinataire
            </label>
            <input
              type="text"
              value={formData.serviceDestinataire}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceDestinataire: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              placeholder="Service de destination"
            />
          </div>
        </div>

        {/* Informations expéditeur */}
        <div className="border-t border-slate-600 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-medium text-white">Informations Expéditeur</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                Nom de la structure *
              </label>
              <input
                type="text"
                required
                value={formData.expediteur.nom}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  expediteur: { ...prev.expediteur, nom: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                placeholder="Nom de l'organisation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Nom du responsable *
              </label>
              <input
                type="text"
                required
                value={formData.expediteur.nomResponsable}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  expediteur: { ...prev.expediteur, nomResponsable: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                placeholder="Nom et prénom du responsable"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Adresse email *
              </label>
              <input
                type="email"
                required
                value={formData.expediteur.adresseEmail}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  expediteur: { ...prev.expediteur, adresseEmail: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                placeholder="email@exemple.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Téléphone *
              </label>
              <input
                type="tel"
                required
                value={formData.expediteur.telephone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  expediteur: { ...prev.expediteur, telephone: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                placeholder="+235 XX XX XX XX"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Adresse géographique *
            </label>
            <textarea
              required
              value={formData.expediteur.adresseGeographique}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                expediteur: { ...prev.expediteur, adresseGeographique: e.target.value }
              }))}
              rows={3}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              placeholder="Adresse complète de la structure"
            />
          </div>
        </div>

        {/* Scan du document */}
        <div className="border-t border-slate-600 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-medium text-white">Scan du Document</h3>
          </div>

          <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
            <input
              type="file"
              id="fichierScan"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="fichierScan"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {fichierScan ? fichierScan.name : 'Cliquez pour sélectionner un fichier'}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  PDF, JPG, PNG (max 10MB)
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Observations */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Observations
          </label>
          <textarea
            value={formData.observations}
            onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            placeholder="Observations ou notes particulières..."
          />
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
            disabled={loading}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Enregistrement...' : 'Enregistrer le courrier'}
          </button>
        </div>
      </form>
    </div>
  );
};