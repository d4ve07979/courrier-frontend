import React, { useState } from 'react';
import { Send, Save, X, FileText, Building, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import type { Structure, TypeDocument, PrioriteCourrier } from '../../types/Courrier';
import { CourrierService } from '../../services/courrierService';

interface Props {
  onSuccess?: (courrier: any) => void;
  onCancel?: () => void;
}

export const FormulaireCourrierSortant: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    objet: '',
    typeDocument: 'COURRIER_OFFICIEL' as TypeDocument,
    priorite: 'NORMALE' as PrioriteCourrier,
    serviceEmetteur: '',
    observations: '',
    dateRetourPrevue: '',
    destinataire: {
      nom: '',
      nomResponsable: '',
      adresseEmail: '',
      adresseGeographique: '',
      telephone: ''
    } as Structure
  });

  const typesDocument = [
    { value: 'COURRIER_OFFICIEL', label: 'Courrier officiel' },
    { value: 'DEMANDE', label: 'Demande' },
    { value: 'RAPPORT', label: 'Rapport' },
    { value: 'INVITATION', label: 'Invitation' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  const niveauxPriorite = [
    { value: 'NORMALE', label: 'Normale', color: 'text-green-400' },
    { value: 'URGENTE', label: 'Urgente', color: 'text-orange-400' },
    { value: 'TRES_URGENTE', label: 'Très urgente', color: 'text-red-400' }
  ];

  const servicesEmetteurs = [
    'Direction Générale',
    'Secrétariat Général',
    'Direction des Études',
    'Direction de la Formation',
    'Direction Administrative et Financière',
    'Service Informatique',
    'Service des Ressources Humaines'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const courrier = await CourrierService.creerCourrierSortant(formData);

      console.log('✅ Courrier sortant créé:', courrier);
      onSuccess?.(courrier);
    } catch (err: any) {
      console.error('❌ Erreur création courrier:', err);
      setError(err.message || 'Erreur lors de la création du courrier');
    } finally {
      setLoading(false);
    }
  };

  // Calculer la date minimale (aujourd'hui)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Send className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Nouveau Courrier Sortant</h2>
            <p className="text-sm text-slate-400">Numérotation automatique SOR-{new Date().getFullYear()}-XXXX</p>
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
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
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
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {typesDocument.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Priorité *
            </label>
            <select
              required
              value={formData.priorite}
              onChange={(e) => setFormData(prev => ({ ...prev, priorite: e.target.value as PrioriteCourrier }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {niveauxPriorite.map(priorite => (
                <option key={priorite.value} value={priorite.value}>{priorite.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Service émetteur *
            </label>
            <select
              required
              value={formData.serviceEmetteur}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceEmetteur: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Sélectionnez un service</option>
              {servicesEmetteurs.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date de retour prévue
            </label>
            <input
              type="date"
              value={formData.dateRetourPrevue}
              min={today}
              onChange={(e) => setFormData(prev => ({ ...prev, dateRetourPrevue: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Informations destinataire */}
        <div className="border-t border-slate-600 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">Informations Destinataire</h3>
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
                value={formData.destinataire.nom}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  destinataire: { ...prev.destinataire, nom: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                placeholder="Nom de l'organisation destinataire"
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
                value={formData.destinataire.nomResponsable}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  destinataire: { ...prev.destinataire, nomResponsable: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
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
                value={formData.destinataire.adresseEmail}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  destinataire: { ...prev.destinataire, adresseEmail: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
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
                value={formData.destinataire.telephone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  destinataire: { ...prev.destinataire, telephone: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
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
              value={formData.destinataire.adresseGeographique}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                destinataire: { ...prev.destinataire, adresseGeographique: e.target.value }
              }))}
              rows={3}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="Adresse complète du destinataire"
            />
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
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="Observations ou instructions particulières..."
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
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Enregistrement...' : 'Enregistrer le courrier'}
          </button>
        </div>
      </form>
    </div>
  );
};