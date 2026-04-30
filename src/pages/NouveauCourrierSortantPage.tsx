// src/pages/NouveauCourrierSortantPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowUpRight, Send, FileText, Plus, X, Check,
  Loader2, Building, User, Mail, Phone, MapPin, Hash,
  Calendar, Tag, AlertTriangle, Paperclip, Info, Lock,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import axiosInstance from '../api/axiosConfig';
import { utilisateurApi } from '../api/utilisateurApi';
import { affectationApi } from '../api/affectationApi';
import { expediteurApi } from '../api/expediteurApi';
import { destinataireApi } from '../api/destinataireApi';
import { typeCourrierApi } from '../api/typeCourrierApi';
import { statutApi } from '../api/statutApi';

// ── Types ──────────────────────────────────────────────────────────────────────

type UserForAssign = { id: number; nom: string; prenom: string; email?: string; role?: string };

interface FicheState {
  reference: string; observation: string;
  tresUrgent: boolean; urgent: boolean; menParler: boolean;
  pourAttribution: boolean; pourEtudeEtAvis: boolean; pourDisposition: boolean;
  elementDeReponse: boolean; finRetour: boolean; pourSuiteADonner: boolean;
  pourVisaPrealable: boolean; pourNecessaire: boolean; notePourLeDG: boolean;
  pourResumerSuccinct: boolean; noteMinistre: boolean; copieA: boolean;
  meRepresenter: boolean; pourEtude: boolean; lettreDeTransmission: boolean;
  bordeauEnvoi: boolean; pourInformation: boolean; aTouteFinUtile: boolean;
  enInstance: boolean; aClasser: boolean; courrierReserve: boolean;
}

// ── Constantes ─────────────────────────────────────────────────────────────────

const MODES_ENVOI = ['', 'Poste recommandée', 'Email', 'Remis en main propre', 'Coursier', 'Fax'];
const CONFIDENTIALITES = ['PUBLIC', 'INTERNE', 'CONFIDENTIEL', 'SECRET'];
const TYPES_STRUCTURE = ['', 'Ministère', 'Direction nationale', 'Organisme public', 'ONG / Association', 'Entreprise privée', 'Ambassade / Consulat', 'Organisation internationale', 'Particulier', 'Autre'];

const FICHE_INITIALE: FicheState = {
  reference: '', observation: '',
  tresUrgent: false, urgent: false, menParler: false,
  pourAttribution: false, pourEtudeEtAvis: false, pourDisposition: false,
  elementDeReponse: false, finRetour: false, pourSuiteADonner: false,
  pourVisaPrealable: false, pourNecessaire: false, notePourLeDG: false,
  pourResumerSuccinct: false, noteMinistre: false, copieA: false,
  meRepresenter: false, pourEtude: false, lettreDeTransmission: false,
  bordeauEnvoi: false, pourInformation: false, aTouteFinUtile: false,
  enInstance: false, aClasser: false, courrierReserve: false,
};

const FICHE_SECTIONS = [
  { label: 'Priorité', color: 'bg-red-500', items: [{ name: 'tresUrgent', label: '🔴 TRÈS URGENT', color: 'text-red-600 font-semibold' }, { name: 'urgent', label: '🟠 URGENT', color: 'text-orange-600 font-semibold' }] },
  { label: 'Actions principales', color: 'bg-blue-500', items: [{ name: 'pourAttribution', label: 'Pour attribution' }, { name: 'pourEtudeEtAvis', label: 'Pour étude et avis' }, { name: 'pourSuiteADonner', label: 'Pour suite à donner' }, { name: 'pourInformation', label: 'Pour information' }] },
  { label: 'Communications', color: 'bg-green-500', items: [{ name: 'menParler', label: "M'en parler" }, { name: 'meRepresenter', label: 'Me représenter' }, { name: 'copieA', label: 'Copie à' }, { name: 'notePourLeDG', label: 'Note pour le DG' }] },
  { label: 'Actions secondaires', color: 'bg-yellow-500', items: [{ name: 'pourDisposition', label: 'Pour disposition à prendre' }, { name: 'elementDeReponse', label: 'Pour élément de réponse' }, { name: 'pourVisaPrealable', label: 'Pour visa préalable' }, { name: 'pourNecessaire', label: 'Pour le nécessaire à faire' }] },
  { label: 'Traitement', color: 'bg-indigo-500', items: [{ name: 'finRetour', label: 'Fin retour' }, { name: 'pourResumerSuccinct', label: 'Pour résumer succinct' }, { name: 'noteMinistre', label: "Note au Ministre" }, { name: 'pourEtude', label: 'Pour étude en rapport avec' }] },
  { label: 'Classement', color: 'bg-purple-500', items: [{ name: 'lettreDeTransmission', label: 'Lettre de transmission à' }, { name: 'bordeauEnvoi', label: "Bordereau d'envoi" }, { name: 'enInstance', label: 'En instance' }, { name: 'aClasser', label: 'À classer' }, { name: 'courrierReserve', label: 'Courrier réservé' }, { name: 'aTouteFinUtile', label: 'À toute fin utile' }] },
];

// ── Composant ──────────────────────────────────────────────────────────────────

export const NouveauCourrierSortantPage: React.FC = () => {
  const navigate = useNavigate();

  // Champs principaux
  const [objet, setObjet] = useState('');
  const [dateReception, setDateReception] = useState(new Date().toISOString().split('T')[0]);
  const [dateEnvoiPrevu, setDateEnvoiPrevu] = useState('');
  const [modeEnvoi, setModeEnvoi] = useState('');
  const [referenceInterne, setReferenceInterne] = useState('');
  const [delaiReponse, setDelaiReponse] = useState<number | ''>('');
  const [confidentialite, setConfidentialite] = useState('PUBLIC');
  const [dossierLie, setDossierLie] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Expéditeur (INSEED par défaut)
  const [expediteur, setExpediteur] = useState({
    nomDeStructure: 'INSEED',
    nomDuResponsable: '',
    adresseGeographique: 'Lomé, Togo',
    adresseEmail: 'contact@inseed.tg',
    tel: '+228 22 25 36 00',
    typeStructure: 'Organisme public',
  });

  // Destinataire
  const [destinataire, setDestinataire] = useState({
    nomDeStructure: '',
    nomDuResponsable: '',
    adresseGeographique: '',
    adresseEmail: '',
    tel: '',
  });

  // Fiche
  const [fiche, setFiche] = useState<FicheState>(FICHE_INITIALE);

  // Autres
  const [file, setFile] = useState<File | null>(null);
  const [affectations, setAffectations] = useState<{ utilisateurId: number; utilisateurNom: string; commentaire?: string }[]>([]);
  const [showAffectModal, setShowAffectModal] = useState(false);
  const [showFicheModal, setShowFicheModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [usersForAssign, setUsersForAssign] = useState<UserForAssign[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [assignComment, setAssignComment] = useState('');

  // Chargement utilisateurs
  useEffect(() => {
    if (!showAffectModal) return;
    setLoadingUsers(true);
    utilisateurApi.getUtilisateursAffectables()
      .then(res => setUsersForAssign(res.map((u: any) => ({ id: u.id_utilisateur, nom: u.nom_utilisateur, prenom: u.prenom_utilisateur, email: u.email_utilisateur, role: u.role_utilisateur }))))
      .catch(() => setUsersForAssign([]))
      .finally(() => setLoadingUsers(false));
  }, [showAffectModal]);

  // Handlers
  const handleFicheChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFiche(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(f.type)) { setError('Format non supporté. PDF, JPG ou PNG.'); return; }
    if (f.size > 10 * 1024 * 1024) { setError('Fichier trop volumineux (max 10 Mo).'); return; }
    setFile(f); setError(null);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tagList.includes(t)) setTagList(p => [...p, t]);
    setTagInput('');
  };

  const addAffectation = () => {
    if (!selectedUserId) { setError('Sélectionnez un utilisateur.'); return; }
    const u = usersForAssign.find(x => x.id === selectedUserId);
    if (!u) return;
    setAffectations(p => [...p, { utilisateurId: u.id, utilisateurNom: `${u.prenom} ${u.nom}`, commentaire: assignComment }]);
    setSelectedUserId(null); setAssignComment(''); setShowAffectModal(false); setError(null);
  };

  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!objet.trim()) return setError("L'objet est obligatoire.");
    if (!dateReception) return setError("La date d'émission est obligatoire.");
    if (!destinataire.nomDeStructure.trim()) return setError("Le nom de la structure destinataire est obligatoire.");

    setSending(true);
    try {
      // Expéditeur (INSEED)
      const allExp = await expediteurApi.getAll();
      let exp = allExp.find(e => e.nom_de_structure?.trim().toLowerCase() === expediteur.nomDeStructure.trim().toLowerCase());
      if (!exp) exp = await expediteurApi.create({ nom_de_structure: expediteur.nomDeStructure.trim(), nom_du_responsable: expediteur.nomDuResponsable.trim() || 'Non renseigné', adresse_geographique: expediteur.adresseGeographique.trim() || 'Lomé, Togo', adresse_email: expediteur.adresseEmail.trim() || 'contact@inseed.tg', tel: expediteur.tel.trim() || '+228 22 25 36 00', type_structure: expediteur.typeStructure || 'Organisme public' });

      // Destinataire
      const allDest = await destinataireApi.getAll();
      let dest = allDest.find(d => d.nom_de_structure?.trim().toLowerCase() === destinataire.nomDeStructure.trim().toLowerCase());
      if (!dest) dest = await destinataireApi.create({ nom_de_structure: destinataire.nomDeStructure.trim(), nom_du_responsable: destinataire.nomDuResponsable.trim() || 'Non renseigné', adresse_geographique: destinataire.adresseGeographique.trim() || 'Non renseignée', adresse_email: destinataire.adresseEmail.trim() || 'non-renseigne@example.com', tel: destinataire.tel.trim() || '00000000' });

      // Type & Statut
      const types = await typeCourrierApi.getAll();
      const typeMatch = types.find((t: any) => t.code?.toUpperCase() === 'SOR' || t.code?.toUpperCase() === 'SORTANT' || t.libelle?.toLowerCase().includes('sortant'));
      const statutsRaw = await statutApi.getAll();
      const statuts = Array.isArray(statutsRaw) ? statutsRaw : (statutsRaw as any)?.statuts || [];
      const statutMatch = statuts.find((s: any) => s.code_statut?.toUpperCase() === 'EN_ATTENTE' || s.libelle_statut?.toLowerCase().includes('attente'));

      if (!typeMatch) { setError(`Type "Sortant" introuvable. Types disponibles : ${types.map((t: any) => t.libelle).join(', ')}`); setSending(false); return; }
      if (!statutMatch) { setError('Statut "En attente" introuvable.'); setSending(false); return; }

      const ficheRemplie = !!(fiche.reference || fiche.observation || fiche.tresUrgent || fiche.urgent);

      const dto: any = {
        objet: objet.trim(),
        dateReception,
        idExpediteur: exp!.id_expediteur,
        idDestinataire: dest!.id_destinataire,
        idTypeCourrier: typeMatch.id_type_courrier,
        idStatut: statutMatch.id_statut,
        ...(referenceInterne && { referenceExterne: referenceInterne.trim() }),
        ...(modeEnvoi && { modeEnvoi }),
        ...(dateEnvoiPrevu && { dateEnvoiPrevu }),
        ...(delaiReponse !== '' && { delaiReponse: Number(delaiReponse) }),
        ...(confidentialite && { confidentialite }),
        ...(tagList.length > 0 && { tags: tagList.join(',') }),
        ...(dossierLie && { dossierLie: dossierLie.trim() }),
        ...(ficheRemplie && { reference: fiche.reference, observation: fiche.observation, tresUrgent: fiche.tresUrgent, urgent: fiche.urgent, menParler: fiche.menParler, pourAttribution: fiche.pourAttribution, pourEtudeEtAvis: fiche.pourEtudeEtAvis, pourDisposition: fiche.pourDisposition, elementDeReponse: fiche.elementDeReponse, finRetour: fiche.finRetour, pourSuiteADonner: fiche.pourSuiteADonner, pourVisaPrealable: fiche.pourVisaPrealable, pourNecessaire: fiche.pourNecessaire, notePourLeDG: fiche.notePourLeDG, pourResumerSuccinct: fiche.pourResumerSuccinct, noteMinistre: fiche.noteMinistre, copieA: fiche.copieA, meRepresenter: fiche.meRepresenter, pourEtude: fiche.pourEtude, lettreDeTransmission: fiche.lettreDeTransmission, bordeauEnvoi: fiche.bordeauEnvoi, pourInformation: fiche.pourInformation, aTouteFinUtile: fiche.aTouteFinUtile, enInstance: fiche.enInstance, aClasser: fiche.aClasser, courrierReserve: fiche.courrierReserve }),
      };

      const formData = new FormData();
      formData.append('courrier', JSON.stringify(dto));
      if (file) formData.append('file', file);

      const response = await axiosInstance.post('/api/courriers/creer-complet', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const created = response.data.courrier || response.data;

      if (affectations.length > 0) {
        const courrierId = created?.id || created?.idCourrier;
        for (const a of affectations) {
          try { await affectationApi.ajouter({ courrierId, utilisateurId: a.utilisateurId, commentaire: a.commentaire || '' }); } catch { /* non bloquant */ }
        }
      }

      setSuccessMsg('Courrier sortant enregistré avec succès !');
      setTimeout(() => navigate('/courriers'), 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création.');
    } finally {
      setSending(false);
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const inp = "w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm";
  const lbl = "block text-slate-300 text-xs font-semibold mb-1.5 uppercase tracking-wide";
  const sec = "bg-slate-800/40 border border-slate-700/60 rounded-xl p-5";
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => navigate('/nouveau-courrier')}
                className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white">Nouveau courrier sortant</h1>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20 tracking-wider">
                      DÉPART
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">Registre CD-{new Date().getFullYear()}-XXXX • Numérotation automatique</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAffectModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600/80 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" /> Affecter
                </button>
                <button type="button" onClick={() => setShowFicheModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-600/80 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-colors">
                  <Check className="w-4 h-4" /> Fiche
                  {(fiche.tresUrgent || fiche.urgent || fiche.reference) && (
                    <span className="w-2 h-2 bg-orange-400 rounded-full" />
                  )}
                </button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-5 flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-5 flex items-center gap-3 p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 text-sm">
                <Check className="w-4 h-4 flex-shrink-0" /> {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ── Section 1 : Informations ── */}
              <div className={sec}>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-blue-400" /> Informations du courrier
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className={lbl}>Objet *</label>
                    <input type="text" value={objet} onChange={e => setObjet(e.target.value)}
                      placeholder="Décrivez l'objet de ce courrier..." className={inp} required />
                  </div>
                  <div>
                    <label className={lbl}><Calendar className="w-3 h-3 inline mr-1" />Date d'émission *</label>
                    <input type="date" value={dateReception} onChange={e => setDateReception(e.target.value)} className={inp} required />
                  </div>
                  <div>
                    <label className={lbl}><Calendar className="w-3 h-3 inline mr-1" />Date d'envoi prévue</label>
                    <input type="date" value={dateEnvoiPrevu} min={today} onChange={e => setDateEnvoiPrevu(e.target.value)} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Mode d'envoi</label>
                    <select value={modeEnvoi} onChange={e => setModeEnvoi(e.target.value)} className={inp}>
                      {MODES_ENVOI.map(m => <option key={m} value={m}>{m || 'Sélectionner...'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}><Hash className="w-3 h-3 inline mr-1" />Référence interne</label>
                    <input type="text" value={referenceInterne} onChange={e => setReferenceInterne(e.target.value)}
                      placeholder="Ex : INSEED-DG-2026-015" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}><Calendar className="w-3 h-3 inline mr-1" />Délai de réponse (jours)</label>
                    <input type="number" min={1} max={365} value={delaiReponse}
                      onChange={e => setDelaiReponse(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ex : 30" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}><Lock className="w-3 h-3 inline mr-1" />Confidentialité</label>
                    <select value={confidentialite} onChange={e => setConfidentialite(e.target.value)} className={inp}>
                      {CONFIDENTIALITES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-4">
                  <label className={lbl}><Tag className="w-3 h-3 inline mr-1" />Mots-clés</label>
                  <div className="flex gap-2">
                    <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      placeholder="Ajoutez un mot-clé et appuyez sur Entrée" className={`${inp} flex-1`} />
                    <button type="button" onClick={addTag}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {tagList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tagList.map(t => (
                        <span key={t} className="flex items-center gap-1 px-3 py-1 bg-blue-500/15 border border-blue-500/25 rounded-full text-blue-300 text-xs font-medium">
                          {t}
                          <button type="button" onClick={() => setTagList(p => p.filter(x => x !== t))} className="hover:text-white ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dossier lié */}
                <div className="mt-4">
                  <label className={lbl}><FileText className="w-3 h-3 inline mr-1" />Dossier / Affaire lié(e)</label>
                  <input type="text" value={dossierLie} onChange={e => setDossierLie(e.target.value)}
                    placeholder="Ex : Projet statistiques 2026" className={inp} />
                </div>
              </div>

              {/* ── Section 2 : Expéditeur (INSEED) ── */}
              <div className={sec}>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <Building className="w-4 h-4 text-blue-400" /> Structure émettrice (INSEED)
                </h3>
                <div className="p-3 bg-blue-500/8 border border-blue-500/20 rounded-lg mb-4">
                  <p className="text-blue-300 text-xs">Les informations de l'INSEED sont pré-remplies. Modifiez si nécessaire.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}><Building className="w-3 h-3 inline mr-1" />Nom de la structure *</label>
                    <input value={expediteur.nomDeStructure}
                      onChange={e => setExpediteur(p => ({ ...p, nomDeStructure: e.target.value }))}
                      className={inp} required />
                  </div>
                  <div>
                    <label className={lbl}><User className="w-3 h-3 inline mr-1" />Signataire / Responsable</label>
                    <input value={expediteur.nomDuResponsable}
                      onChange={e => setExpediteur(p => ({ ...p, nomDuResponsable: e.target.value }))}
                      placeholder="Nom du signataire" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}><Mail className="w-3 h-3 inline mr-1" />Email</label>
                    <input type="email" value={expediteur.adresseEmail}
                      onChange={e => setExpediteur(p => ({ ...p, adresseEmail: e.target.value }))}
                      className={inp} />
                  </div>
                  <div>
                    <label className={lbl}><Phone className="w-3 h-3 inline mr-1" />Téléphone</label>
                    <input value={expediteur.tel}
                      onChange={e => setExpediteur(p => ({ ...p, tel: e.target.value }))}
                      className={inp} />
                  </div>
                </div>
              </div>

              {/* ── Section 3 : Destinataire ── */}
              <div className={sec}>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-blue-400" /> Destinataire externe
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}><Building className="w-3 h-3 inline mr-1" />Nom de la structure *</label>
                    <input value={destinataire.nomDeStructure}
                      onChange={e => setDestinataire(p => ({ ...p, nomDeStructure: e.target.value }))}
                      placeholder="Ex : Ministère de la Santé" className={inp} required />
                  </div>
                  <div>
                    <label className={lbl}><User className="w-3 h-3 inline mr-1" />Nom du responsable</label>
                    <input value={destinataire.nomDuResponsable}
                      onChange={e => setDestinataire(p => ({ ...p, nomDuResponsable: e.target.value }))}
                      placeholder="Nom et prénom" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}><Mail className="w-3 h-3 inline mr-1" />Email</label>
                    <input type="email" value={destinataire.adresseEmail}
                      onChange={e => setDestinataire(p => ({ ...p, adresseEmail: e.target.value }))}
                      placeholder="contact@structure.tg" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}><Phone className="w-3 h-3 inline mr-1" />Téléphone</label>
                    <input value={destinataire.tel}
                      onChange={e => setDestinataire(p => ({ ...p, tel: e.target.value }))}
                      placeholder="+228 XX XX XX XX" className={inp} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={lbl}><MapPin className="w-3 h-3 inline mr-1" />Adresse</label>
                    <input value={destinataire.adresseGeographique}
                      onChange={e => setDestinataire(p => ({ ...p, adresseGeographique: e.target.value }))}
                      placeholder="Ville, Pays" className={inp} />
                  </div>
                </div>
              </div>

              {/* ── Section 4 : Document joint ── */}
              <div className={sec}>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <Paperclip className="w-4 h-4 text-blue-400" /> Document joint
                </h3>
                <div
                  className="border-2 border-dashed border-slate-600 hover:border-blue-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                  onClick={() => document.getElementById('fileInputSortant')?.click()}
                >
                  <input id="fileInputSortant" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                      <Paperclip className="w-5 h-5 text-slate-400" />
                    </div>
                    {file ? (
                      <div>
                        <p className="text-white font-medium text-sm">{file.name}</p>
                        <p className="text-slate-400 text-xs">{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-slate-300 text-sm font-medium">Cliquez pour sélectionner</p>
                        <p className="text-slate-500 text-xs mt-0.5">PDF, JPG, PNG — max 10 Mo</p>
                      </div>
                    )}
                  </div>
                </div>
                {file && (
                  <button type="button" onClick={() => setFile(null)}
                    className="mt-2 text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                    <X className="w-3 h-3" /> Supprimer
                  </button>
                )}
              </div>

              {/* ── Section 5 : Affectations ── */}
              {affectations.length > 0 && (
                <div className={sec}>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-blue-400" /> Affectations ({affectations.length})
                  </h3>
                  <div className="space-y-2">
                    {affectations.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-900/50 px-4 py-3 rounded-lg border border-slate-700">
                        <div>
                          <p className="text-white text-sm font-medium">{a.utilisateurNom}</p>
                          {a.commentaire && <p className="text-slate-400 text-xs">{a.commentaire}</p>}
                        </div>
                        <button type="button" onClick={() => setAffectations(p => p.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-300 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Actions ── */}
              <div className="flex justify-end gap-3 pb-8">
                <button type="button" onClick={() => navigate('/nouveau-courrier')}
                  className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={sending}
                  className="flex items-center gap-2 px-7 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? 'Enregistrement...' : 'Enregistrer le courrier sortant'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* ═══ MODAL AFFECTATION ═══ */}
      {showAffectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h3 className="text-base font-semibold text-white">Affecter le courrier</h3>
              <button onClick={() => setShowAffectModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {loadingUsers ? (
                <div className="flex items-center gap-2 text-slate-300 text-sm justify-center py-4"><Loader2 className="w-4 h-4 animate-spin" /> Chargement...</div>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-auto">
                  {usersForAssign.map(u => (
                    <label key={u.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedUserId === u.id ? 'bg-blue-500/15 border border-blue-500/30' : 'hover:bg-slate-800 border border-transparent'}`}>
                      <input type="radio" checked={selectedUserId === u.id} onChange={() => setSelectedUserId(u.id)} className="accent-blue-500" />
                      <div>
                        <p className="text-white text-sm font-medium">{u.prenom} {u.nom}</p>
                        <p className="text-slate-400 text-xs">{u.email} · {u.role}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5 uppercase tracking-wide">Commentaire (facultatif)</label>
                <textarea value={assignComment} onChange={e => setAssignComment(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-700">
              <button onClick={() => setShowAffectModal(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors">Annuler</button>
              <button onClick={addAffectation} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white font-medium transition-colors flex items-center gap-2">
                <Check className="w-4 h-4" /> Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL FICHE ═══ */}
      {showFicheModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: '90vh' }}>
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5" />Fiche de transmission</h3>
              <div className="flex gap-2">
                <button onClick={() => setFiche(FICHE_INITIALE)} type="button" className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm">Réinitialiser</button>
                <button onClick={() => setShowFicheModal(false)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 bg-gray-50 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>
              <div className="mb-5 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Référence du document</label>
                <input name="reference" value={fiche.reference} onChange={handleFicheChange}
                  placeholder="Ex : N°2026/001/INSEED/DG"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FICHE_SECTIONS.map(section => (
                  <div key={section.label} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2 text-sm">
                      <span className={`w-2 h-2 ${section.color} rounded-full`}></span>{section.label}
                    </h4>
                    <div className="space-y-1.5">
                      {section.items.map(c => (
                        <label key={c.name} className="flex items-center gap-2.5 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <input type="checkbox" name={c.name} checked={(fiche as any)[c.name]} onChange={handleFicheChange}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                          <span className={`text-sm ${'color' in c ? c.color : 'text-gray-700'}`}>{c.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Observations</label>
                <textarea name="observation" value={fiche.observation} onChange={handleFicheChange} rows={4}
                  placeholder="Ajoutez vos observations..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button onClick={() => setShowFicheModal(false)} className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium">Annuler</button>
              <button onClick={() => setShowFicheModal(false)} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                <Check className="w-4 h-4" /> Associer la fiche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
