// src/pages/NouveauCourrierSortantPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowUpRight, Send, FileText, Plus, X, Check,
  Loader2, Building, User, Mail, Phone, MapPin, Hash,
  Calendar, Tag, AlertTriangle, Paperclip, Lock,
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
  { label: 'Priorité', color: '#ef4444', items: [{ name: 'tresUrgent', label: 'TRÈS URGENT', color: '#dc2626' }, { name: 'urgent', label: 'URGENT', color: '#ea580c' }] },
  { label: 'Actions principales', color: '#3b82f6', items: [{ name: 'pourAttribution', label: 'Pour attribution' }, { name: 'pourEtudeEtAvis', label: 'Pour étude et avis' }, { name: 'pourSuiteADonner', label: 'Pour suite à donner' }, { name: 'pourInformation', label: 'Pour information' }] },
  { label: 'Communications', color: '#16a34a', items: [{ name: 'menParler', label: "M'en parler" }, { name: 'meRepresenter', label: 'Me représenter' }, { name: 'copieA', label: 'Copie à' }, { name: 'notePourLeDG', label: 'Note pour le DG' }] },
  { label: 'Actions secondaires', color: '#d97706', items: [{ name: 'pourDisposition', label: 'Pour disposition à prendre' }, { name: 'elementDeReponse', label: 'Pour élément de réponse' }, { name: 'pourVisaPrealable', label: 'Pour visa préalable' }, { name: 'pourNecessaire', label: 'Pour le nécessaire à faire' }] },
  { label: 'Traitement', color: '#6366f1', items: [{ name: 'finRetour', label: 'Fin retour' }, { name: 'pourResumerSuccinct', label: 'Pour résumer succinct' }, { name: 'noteMinistre', label: 'Note au Ministre' }, { name: 'pourEtude', label: 'Pour étude en rapport avec' }] },
  { label: 'Classement', color: '#7c3aed', items: [{ name: 'lettreDeTransmission', label: 'Lettre de transmission à' }, { name: 'bordeauEnvoi', label: "Bordereau d'envoi" }, { name: 'enInstance', label: 'En instance' }, { name: 'aClasser', label: 'À classer' }, { name: 'courrierReserve', label: 'Courrier réservé' }, { name: 'aTouteFinUtile', label: 'À toute fin utile' }] },
];

const S = {
  page: { minHeight: '100vh', display: 'flex', background: '#f7f8fa', fontFamily: "'Segoe UI', system-ui, sans-serif" } as React.CSSProperties,
  main: { flex: 1, overflowY: 'auto', padding: '80px 40px 32px 40px' } as React.CSSProperties,
  wrap: { maxWidth: 900, margin: '0 auto' } as React.CSSProperties,
  section: { background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '24px 28px', marginBottom: 16 } as React.CSSProperties,
  sectionTitle: { fontSize: 13, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' } as React.CSSProperties,
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as React.CSSProperties,
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 } as React.CSSProperties,
  lbl: { display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 } as React.CSSProperties,
  inp: { width: '100%', background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 7, padding: '9px 12px', fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' } as React.CSSProperties,
  sel: { width: '100%', background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 7, padding: '9px 12px', fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box' } as React.CSSProperties,
};

export const NouveauCourrierSortantPage: React.FC = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [objet, setObjet] = useState('');
  const [dateReception, setDateReception] = useState(today);
  const [dateEnvoiPrevu, setDateEnvoiPrevu] = useState('');
  const [modeEnvoi, setModeEnvoi] = useState('');
  const [referenceInterne, setReferenceInterne] = useState('');
  const [delaiReponse, setDelaiReponse] = useState<number | ''>('');
  const [confidentialite, setConfidentialite] = useState('PUBLIC');
  const [dossierLie, setDossierLie] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [expediteur, setExpediteur] = useState({ nomDeStructure: 'INSEED', nomDuResponsable: '', adresseGeographique: 'Lomé, Togo', adresseEmail: 'contact@inseed.tg', tel: '+228 22 25 36 00', typeStructure: 'Organisme public' });
  const [destinataire, setDestinataire] = useState({ nomDeStructure: '', nomDuResponsable: '', adresseGeographique: '', adresseEmail: '', tel: '' });
  const [fiche, setFiche] = useState<FicheState>(FICHE_INITIALE);
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

  useEffect(() => {
    if (!showAffectModal) return;
    setLoadingUsers(true);
    utilisateurApi.getUtilisateursAffectables()
      .then(res => setUsersForAssign(res.map((u: any) => ({ id: u.id_utilisateur, nom: u.nom_utilisateur, prenom: u.prenom_utilisateur, email: u.email_utilisateur, role: u.role_utilisateur }))))
      .catch(() => setUsersForAssign([]))
      .finally(() => setLoadingUsers(false));
  }, [showAffectModal]);

  const handleFicheChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFiche(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(f.type)) { setError('Format non supporté. PDF, JPG ou PNG uniquement.'); return; }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!objet.trim()) return setError("L'objet est obligatoire.");
    if (!dateReception) return setError("La date d'émission est obligatoire.");
    if (!destinataire.nomDeStructure.trim()) return setError("Le nom du destinataire est obligatoire.");
    setSending(true);
    try {
      const allExp = await expediteurApi.getAll();
      let exp = allExp.find(e => e.nom_de_structure?.trim().toLowerCase() === expediteur.nomDeStructure.trim().toLowerCase());
      if (!exp) exp = await expediteurApi.create({ nom_de_structure: expediteur.nomDeStructure.trim(), nom_du_responsable: expediteur.nomDuResponsable.trim() || 'Non renseigné', adresse_geographique: expediteur.adresseGeographique.trim() || 'Lomé, Togo', adresse_email: expediteur.adresseEmail.trim() || 'contact@inseed.tg', tel: expediteur.tel.trim() || '+228 22 25 36 00', type_structure: expediteur.typeStructure || 'Organisme public' });

      const allDest = await destinataireApi.getAll();
      let dest = allDest.find(d => d.nom_de_structure?.trim().toLowerCase() === destinataire.nomDeStructure.trim().toLowerCase());
      if (!dest) dest = await destinataireApi.create({ nom_de_structure: destinataire.nomDeStructure.trim(), nom_du_responsable: destinataire.nomDuResponsable.trim() || 'Non renseigné', adresse_geographique: destinataire.adresseGeographique.trim() || 'Non renseignée', adresse_email: destinataire.adresseEmail.trim() || 'non-renseigne@example.com', tel: destinataire.tel.trim() || '00000000' });

      const types = await typeCourrierApi.getAll();
      const typeMatch = types.find((t: any) => t.code?.toUpperCase() === 'SOR' || t.code?.toUpperCase() === 'SORTANT' || t.libelle?.toLowerCase().includes('sortant'));
      const statutsRaw = await statutApi.getAll();
      const statuts = Array.isArray(statutsRaw) ? statutsRaw : (statutsRaw as any)?.statuts || [];
      const statutMatch = statuts.find((s: any) => s.code_statut?.toUpperCase() === 'EN_ATTENTE' || s.libelle_statut?.toLowerCase().includes('attente'));

      if (!typeMatch) { setError(`Type "Sortant" introuvable. Types: ${types.map((t: any) => t.libelle).join(', ')}`); setSending(false); return; }
      if (!statutMatch) { setError('Statut "En attente" introuvable.'); setSending(false); return; }

      const ficheRemplie = !!(fiche.reference || fiche.observation || fiche.tresUrgent || fiche.urgent);
      const dto: any = {
        objet: objet.trim(), dateReception,
        idExpediteur: exp!.id_expediteur, idDestinataire: dest!.id_destinataire,
        idTypeCourrier: typeMatch.id_type_courrier, idStatut: statutMatch.id_statut,
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
          try { await affectationApi.ajouter({ courrierId, utilisateurId: a.utilisateurId, commentaire: a.commentaire || '' }); } catch { }
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

  const F = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.target.style.borderColor = '#2563eb'; e.target.style.background = 'white'; },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#fafafa'; },
  };

  return (
    <div style={S.page}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={S.main}>
          <div style={S.wrap}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <button onClick={() => navigate('/nouveau-courrier')} style={{ width: 34, height: 34, border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', flexShrink: 0 }}>
                <ArrowLeft size={15} />
              </button>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUpRight size={18} color="#2563eb" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Nouveau courrier sortant</h1>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', letterSpacing: '1px' }}>DÉPART</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Registre CD-{new Date().getFullYear()}-XXXX — Numérotation automatique</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setShowAffectModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, color: '#1d4ed8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <Plus size={14} /> Affecter
                </button>
                <button type="button" onClick={() => setShowFicheModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, color: '#16a34a', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <FileText size={14} /> Fiche
                  {(fiche.tresUrgent || fiche.urgent || fiche.reference) && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316' }} />}
                </button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, marginBottom: 16 }}>
                <AlertTriangle size={15} color="#dc2626" />
                <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
              </div>
            )}
            {successMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, marginBottom: 16 }}>
                <Check size={15} color="#2563eb" />
                <span style={{ fontSize: 13, color: '#2563eb' }}>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Section 1 : Informations */}
              <div style={S.section}>
                <div style={S.sectionTitle}>
                  <div style={{ width: 6, height: 16, background: '#2563eb', borderRadius: 3 }} />
                  Informations du courrier
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.lbl}>Objet du courrier *</label>
                  <input style={{ ...S.inp, width: '100%' }} value={objet} onChange={e => setObjet(e.target.value)} placeholder="Décrivez l'objet de ce courrier..." required {...F} />
                </div>
                <div style={S.grid3}>
                  <div>
                    <label style={S.lbl}>Date d'émission *</label>
                    <input type="date" style={S.inp} value={dateReception} onChange={e => setDateReception(e.target.value)} required {...F} />
                  </div>
                  <div>
                    <label style={S.lbl}>Date d'envoi prévue</label>
                    <input type="date" style={S.inp} value={dateEnvoiPrevu} min={today} onChange={e => setDateEnvoiPrevu(e.target.value)} {...F} />
                  </div>
                  <div>
                    <label style={S.lbl}>Mode d'envoi</label>
                    <select style={S.sel} value={modeEnvoi} onChange={e => setModeEnvoi(e.target.value)} {...F}>
                      {MODES_ENVOI.map(m => <option key={m} value={m}>{m || 'Sélectionner...'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.lbl}>Référence interne</label>
                    <input style={S.inp} value={referenceInterne} onChange={e => setReferenceInterne(e.target.value)} placeholder="Ex : INSEED-DG-2026-015" {...F} />
                  </div>
                  <div>
                    <label style={S.lbl}>Délai de réponse (jours)</label>
                    <input type="number" min={1} max={365} style={S.inp} value={delaiReponse} onChange={e => setDelaiReponse(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ex : 30" {...F} />
                  </div>
                  <div>
                    <label style={S.lbl}>Confidentialité</label>
                    <select style={S.sel} value={confidentialite} onChange={e => setConfidentialite(e.target.value)} {...F}>
                      {CONFIDENTIALITES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <label style={S.lbl}>Dossier / Affaire lié(e)</label>
                  <input style={{ ...S.inp, width: '100%' }} value={dossierLie} onChange={e => setDossierLie(e.target.value)} placeholder="Ex : Projet statistiques 2026" {...F} />
                </div>
                <div style={{ marginTop: 14 }}>
                  <label style={S.lbl}>Mots-clés</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input style={{ ...S.inp, flex: 1 }} value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      placeholder="Tapez un mot-clé et appuyez sur Entrée" {...F} />
                    <button type="button" onClick={addTag} style={{ padding: '9px 14px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 7, cursor: 'pointer', color: '#374151' }}>
                      <Plus size={15} />
                    </button>
                  </div>
                  {tagList.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                      {tagList.map(t => (
                        <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, fontSize: 12, color: '#2563eb', fontWeight: 500 }}>
                          {t}
                          <button type="button" onClick={() => setTagList(p => p.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', padding: 0, display: 'flex' }}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2 : Expéditeur INSEED */}
              <div style={S.section}>
                <div style={S.sectionTitle}>
                  <div style={{ width: 6, height: 16, background: '#2563eb', borderRadius: 3 }} />
                  Structure émettrice (INSEED)
                </div>
                <div style={{ padding: '10px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 7, marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: '#1d4ed8', margin: 0 }}>Les informations de l'INSEED sont pré-remplies. Modifiez si nécessaire.</p>
                </div>
                <div style={S.grid2}>
                  <div>
                    <label style={S.lbl}>Nom de la structure *</label>
                    <input style={S.inp} value={expediteur.nomDeStructure} onChange={e => setExpediteur(p => ({ ...p, nomDeStructure: e.target.value }))} required {...F} />
                  </div>
                  <div>
                    <label style={S.lbl}>Signataire / Responsable</label>
                    <input style={S.inp} value={expediteur.nomDuResponsable} onChange={e => setExpediteur(p => ({ ...p, nomDuResponsable: e.target.value }))} placeholder="Nom du signataire" {...F} />
                  </div>
                  <div>
                    <label style={S.lbl}>Email</label>
                    <input type="email" style={S.inp} value={expediteur.adresseEmail} onChange={e => setExpediteur(p => ({ ...p, adresseEmail: e.target.value }))} {...F} />
                  </div>
                  <div>
                    <label style={S.lbl}>Téléphone</label>
                    <input style={S.inp} value={expediteur.tel} onChange={e => setExpediteur(p => ({ ...p, tel: e.target.value }))} {...F} />
                  </div>
                </div>
              </div>

              {/* Section 3 : Destinataire */}
              <div style={S.section}>
                <div style={S.sectionTitle}>
                  <div style={{ width: 6, height: 16, background: '#2563eb', borderRadius: 3 }} />
                  Destinataire externe
                </div>
                <div style={S.grid2}>
                  <div>
                    <label style={S.lbl}>Nom de la structure *</label>
                    <input style={S.inp} value={destinataire.nomDeStructure} onChange={e => setDestinataire(p => ({ ...p, nomDeStructure: e.target.value }))} placeholder="Ex : Ministère de la Santé" required {...F} />
                  </div>
                  <div>
                    <label style={S.lbl}>Nom du responsable</label>
                    <input style={S.inp} value={destinataire.nomDuResponsable} onChange={e => setDestinataire(p => ({ ...p, nomDuResponsable: e.target.value }))} placeholder="Nom et prénom" {...F} />
                  </div>
                  <div>
                    <label style={S.lbl}>Email</label>
                    <input type="email" style={S.inp} value={destinataire.adresseEmail} onChange={e => setDestinataire(p => ({ ...p, adresseEmail: e.target.value }))} placeholder="contact@structure.tg" {...F} />
                  </div>
                  <div>
                    <label style={S.lbl}>Téléphone</label>
                    <input style={S.inp} value={destinataire.tel} onChange={e => setDestinataire(p => ({ ...p, tel: e.target.value }))} placeholder="+228 XX XX XX XX" {...F} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={S.lbl}>Adresse géographique</label>
                    <input style={S.inp} value={destinataire.adresseGeographique} onChange={e => setDestinataire(p => ({ ...p, adresseGeographique: e.target.value }))} placeholder="Ville, Pays" {...F} />
                  </div>
                </div>
              </div>

              {/* Section 4 : Document joint */}
              <div style={S.section}>
                <div style={S.sectionTitle}>
                  <div style={{ width: 6, height: 16, background: '#2563eb', borderRadius: 3 }} />
                  Document joint
                </div>
                <div style={{ border: '1.5px dashed #d1d5db', borderRadius: 8, padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}
                  onClick={() => document.getElementById('fileSortant')?.click()}>
                  <input id="fileSortant" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: 'none' }} />
                  <Paperclip size={22} color="#9ca3af" style={{ margin: '0 auto 8px' }} />
                  {file ? (
                    <div>
                      <p style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{file.name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>Cliquez pour sélectionner un fichier</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>PDF, JPG, PNG — max 10 Mo</p>
                    </div>
                  )}
                </div>
                {file && (
                  <button type="button" onClick={() => setFile(null)} style={{ marginTop: 8, background: 'none', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <X size={13} /> Supprimer le fichier
                  </button>
                )}
              </div>

              {/* Section 5 : Affectations */}
              {affectations.length > 0 && (
                <div style={S.section}>
                  <div style={S.sectionTitle}>
                    <div style={{ width: 6, height: 16, background: '#2563eb', borderRadius: 3 }} />
                    Affectations ({affectations.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {affectations.map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                        <div>
                          <p style={{ fontSize: 13, color: '#111827', fontWeight: 600, margin: 0 }}>{a.utilisateurNom}</p>
                          {a.commentaire && <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{a.commentaire}</p>}
                        </div>
                        <button type="button" onClick={() => setAffectations(p => p.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingBottom: 40, paddingTop: 8 }}>
                <button type="button" onClick={() => navigate('/nouveau-courrier')} style={{ padding: '10px 20px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" disabled={sending} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: sending ? '#93c5fd' : '#2563eb', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: 'white', cursor: sending ? 'not-allowed' : 'pointer' }}>
                  {sending ? <Loader2 size={15} style={{ animation: 'spin 0.75s linear infinite' }} /> : <Send size={15} />}
                  {sending ? 'Enregistrement...' : 'Enregistrer le courrier sortant'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Modal Affectation */}
      {showAffectModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 480, background: 'white', borderRadius: 14, border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Affecter le courrier</h3>
              <button onClick={() => setShowAffectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {loadingUsers ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '20px 0', color: '#6b7280', fontSize: 13 }}>
                  <Loader2 size={15} style={{ animation: 'spin 0.75s linear infinite' }} /> Chargement...
                </div>
              ) : (
                <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                  {usersForAssign.map(u => (
                    <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${selectedUserId === u.id ? '#bfdbfe' : 'transparent'}`, background: selectedUserId === u.id ? '#eff6ff' : 'transparent' }}>
                      <input type="radio" checked={selectedUserId === u.id} onChange={() => setSelectedUserId(u.id)} style={{ accentColor: '#2563eb' }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{u.prenom} {u.nom}</p>
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{u.email} · {u.role}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <label style={S.lbl}>Commentaire (facultatif)</label>
              <textarea value={assignComment} onChange={e => setAssignComment(e.target.value)}
                style={{ width: '100%', background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 7, padding: '9px 12px', fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 80 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid #f3f4f6' }}>
              <button onClick={() => setShowAffectModal(false)} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Annuler</button>
              <button onClick={addAffectation} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: '#2563eb', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                <Check size={14} /> Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Fiche */}
      {showFicheModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 860, background: 'white', borderRadius: 14, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} color="#2563eb" />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Fiche de transmission</h3>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setFiche(FICHE_INITIALE)} type="button" style={{ padding: '6px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, color: '#374151', cursor: 'pointer' }}>Réinitialiser</button>
                <button onClick={() => setShowFicheModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}><X size={18} /></button>
              </div>
            </div>
            <div style={{ padding: 24, overflowY: 'auto', flex: 1, background: '#f9fafb' }}>
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <label style={S.lbl}>Référence du document</label>
                <input name="reference" value={fiche.reference} onChange={handleFicheChange} placeholder="Ex : N°2026/001/INSEED/DG" style={{ ...S.inp, width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {FICHE_SECTIONS.map(section => (
                  <div key={section.label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: section.color }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{section.label}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {section.items.map(c => (
                        <label key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 6px', borderRadius: 5, cursor: 'pointer' }}>
                          <input type="checkbox" name={c.name} checked={(fiche as any)[c.name]} onChange={handleFicheChange} style={{ accentColor: section.color, width: 14, height: 14, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: 'color' in c ? c.color : '#374151', fontWeight: 'color' in c ? 600 : 400 }}>{c.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginTop: 12 }}>
                <label style={S.lbl}>Observations</label>
                <textarea name="observation" value={fiche.observation} onChange={handleFicheChange} rows={4} placeholder="Ajoutez vos observations..."
                  style={{ width: '100%', background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 7, padding: '9px 12px', fontSize: 13, color: '#111827', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid #e5e7eb', background: 'white' }}>
              <button onClick={() => setShowFicheModal(false)} style={{ padding: '9px 18px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => setShowFicheModal(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#2563eb', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                <Check size={14} /> Associer la fiche
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
