import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Send, ArrowLeft, FileText, Plus, X, Check, Loader2 } from 'lucide-react';
import axiosInstance from '../api/axiosConfig';
import { utilisateurApi } from '../api/utilisateurApi';
import { affectationApi } from '../api/affectationApi';
import { expediteurApi } from '../api/expediteurApi';
import { destinataireApi } from '../api/destinataireApi';
import { typeCourrierApi } from '../api/typeCourrierApi';
import { statutApi } from '../api/statutApi';

// ============================================================
// TYPES
// ============================================================

type UserForAssign = {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
  role?: string;
};

interface CourrierCompletRequest {
  objet: string;
  dateReception: string;
  idExpediteur: number;
  idDestinataire: number;
  idTypeCourrier: number;
  idStatut: number;
  // Fiche de transmission (tous optionnels)
  reference?: string;
  observation?: string;
  tresUrgent?: boolean;
  urgent?: boolean;
  menParler?: boolean;
  pourAttribution?: boolean;
  pourEtudeEtAvis?: boolean;
  pourDisposition?: boolean;
  elementDeReponse?: boolean;
  finRetour?: boolean;
  pourSuiteADonner?: boolean;
  pourVisaPrealable?: boolean;
  pourNecessaire?: boolean;
  notePourLeDG?: boolean;
  pourResumerSuccinct?: boolean;
  noteMinistre?: boolean;
  copieA?: boolean;
  meRepresenter?: boolean;
  pourEtude?: boolean;
  lettreDeTransmission?: boolean;
  bordeauEnvoi?: boolean;
  pourInformation?: boolean;
  aTouteFinUtile?: boolean;
  enInstance?: boolean;
  aClasser?: boolean;
  courrierReserve?: boolean;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export const NouveauCourrierPage: React.FC = () => {
  const navigate = useNavigate();

  // États du formulaire
  const [objet, setObjet] = useState('');
  const [dateReception, setDateReception] = useState('');
  const [typeCourrier, setTypeCourrier] = useState('entrant');
  const [statut, setStatut] = useState('En attente');

  // Expéditeur
  const [expediteur, setExpediteur] = useState({
    nomDeStructure: '',
    nomDuResponsable: '',
    adresseGeographique: '',
    adresseEmail: '',
    tel: '',
    typeStructure: '',
  });

  // Destinataire
  const [destinataire, setDestinataire] = useState({
    nomDeStructure: '',
    nomDuResponsable: '',
    adresseGeographique: '',
    adresseEmail: '',
    tel: '',
  });

  // Fiche de transmission
  const initialFiche = {
    dateEnvoi: '',
    reference: '',
    tresUrgent: false,
    urgent: false,
    menParler: false,
    pourAttribution: false,
    pourEtudeEtAvis: false,
    pourDisposition: false,
    elementDeReponse: false,
    finRetour: false,
    pourSuiteADonner: false,
    pourVisaPrealable: false,
    pourNecessaire: false,
    notePourLeDG: false,
    pourResumerSuccinct: false,
    noteMinistre: false,
    copieA: false,
    meRepresenter: false,
    pourEtude: false,
    lettreDeTransmission: false,
    BordereauEnvoi: false,
    pourInformation: false,
    bordeauEnvoi: false,
    aTouteFinUtile: false,
    enInstance: false,
    aClasser: false,
    courrierReserve: false,
    observation: '',
  };
  const [fiche, setFiche] = useState(initialFiche);

  // Fichier joint
  const [file, setFile] = useState<File | null>(null);

  // Affectations locales
  const [affectations, setAffectations] = useState<
    { utilisateurId: number; utilisateurNom: string; commentaire?: string }[]
  >([]);

  // Modals
  const [showAffectModal, setShowAffectModal] = useState(false);
  const [showFicheModal, setShowFicheModal] = useState(false);

  // Loading / feedback
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Users assignables
  const [usersForAssign, setUsersForAssign] = useState<UserForAssign[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Selection modal affectation
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [assignComment, setAssignComment] = useState('');

  // ============================================================
  // RÉCUPÉRATION DES UTILISATEURS AFFECTABLES
  // ============================================================

  useEffect(() => {
    if (!showAffectModal) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await utilisateurApi.getUtilisateursAffectables();
        const formattedUsers = res.map((user: any) => ({
          id: user.id_utilisateur,
          nom: user.nom_utilisateur,
          prenom: user.prenom_utilisateur,
          email: user.email_utilisateur,
          role: user.role_utilisateur
        }));
        setUsersForAssign(formattedUsers);
      } catch (err) {
        console.error('Erreur chargement utilisateurs:', err);
        setUsersForAssign([
          { id: 1, nom: 'Admin', prenom: 'Système', email: 'admin@inseed.tg', role: 'ADMIN' },
          { id: 2, nom: 'Directeur', prenom: 'Général', email: 'dg@inseed.tg', role: 'DG' },
        ]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [showAffectModal]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleExpediteurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExpediteur((p) => ({ ...p, [name]: value }));
  };

  const handleDestinataireChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDestinataire((p) => ({ ...p, [name]: value }));
  };

  const handleFicheChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    if (type === 'checkbox') {
      setFiche((p) => ({ ...p, [name]: checked }));
    } else {
      setFiche((p) => ({ ...p, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
  };

  const openAffectModal = () => {
    setSelectedUserId(null);
    setAssignComment('');
    setShowAffectModal(true);
  };
  
  const closeAffectModal = () => setShowAffectModal(false);

  const addAffectation = () => {
    if (!selectedUserId) {
      setError('Sélectionnez un utilisateur pour affecter.');
      return;
    }
    const u = usersForAssign.find((x) => x.id === selectedUserId);
    if (!u) {
      setError('Utilisateur introuvable.');
      return;
    }
    setAffectations((prev) => [
      ...prev,
      {
        utilisateurId: u.id,
        utilisateurNom: `${u.prenom} ${u.nom}`,
        commentaire: assignComment,
      },
    ]);
    setSelectedUserId(null);
    setAssignComment('');
    setShowAffectModal(false);
    setError(null);
  };

  const removeAffectation = (index: number) => {
    setAffectations((p) => p.filter((_, i) => i !== index));
  };

  const openFicheModal = () => setShowFicheModal(true);
  const closeFicheModal = () => setShowFicheModal(false);
  const resetFiche = () => setFiche(initialFiche);

  // ============================================================
  // FONCTION DE SOUMISSION CORRIGÉE
  // ============================================================

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validations
    if (!objet.trim()) return setError("L'objet du courrier est obligatoire.");
    if (!dateReception) return setError('La date de réception est obligatoire.');
    if (!expediteur.nomDeStructure.trim())
      return setError('Nom de la structure expéditeur requis.');
    if (!destinataire.nomDeStructure.trim())
      return setError('Nom de la structure destinataire requis.');

    setSending(true);

    try {
      // ============================================================
      // 1️⃣ RÉCUPÉRER OU CRÉER L'EXPÉDITEUR
      // ============================================================
      
      console.log('🔍 Recherche expéditeur:', expediteur.nomDeStructure);
      
      const allExp = await expediteurApi.getAll();
      let exp = allExp.find((e) =>
        e.nom_de_structure?.trim().toLowerCase() === expediteur.nomDeStructure.trim().toLowerCase()
      );
      
      if (!exp) {
        console.log('📝 Création expéditeur...');
        exp = await expediteurApi.create({
          nom_de_structure: expediteur.nomDeStructure.trim(),
          nom_du_responsable: expediteur.nomDuResponsable.trim() || 'Non renseigné',
          adresse_geographique: expediteur.adresseGeographique.trim() || 'Non renseignée',
          adresse_email: expediteur.adresseEmail.trim() || 'non-renseigne@example.com',
          tel: expediteur.tel.trim() || '00000000',
          type_structure: expediteur.typeStructure.trim() || 'Autre'
        });
        console.log('✅ Expéditeur créé:', exp);
      }
      
      // ============================================================
      // 2️⃣ RÉCUPÉRER OU CRÉER LE DESTINATAIRE
      // ============================================================
      
      console.log('🔍 Recherche destinataire:', destinataire.nomDeStructure);
      
      const allDest = await destinataireApi.getAll();
      let dest = allDest.find((d) =>
        d.nom_de_structure?.trim().toLowerCase() === destinataire.nomDeStructure.trim().toLowerCase()
      );
      
      if (!dest) {
        console.log('📝 Création destinataire...');
        dest = await destinataireApi.create({
          nom_de_structure: destinataire.nomDeStructure.trim(),
          nom_du_responsable: destinataire.nomDuResponsable.trim() || 'Non renseigné',
          adresse_geographique: destinataire.adresseGeographique.trim() || 'Non renseignée',
          adresse_email: destinataire.adresseEmail.trim() || 'non-renseigne@example.com',
          tel: destinataire.tel.trim() || '00000000'
        });
        console.log('✅ Destinataire créé:', dest);
      }

      // ============================================================
      // 3️⃣ RÉCUPÉRER LES TYPES ET STATUTS
      // ============================================================
      
      console.log('🔍 Récupération référentiels...');
      
      const typeMap: Record<string, string> = {
        'entrant': 'ENTRANT',
        'sortant': 'SORTANT',
        'note_interne': 'NOTE_INTERNE',
      };
      
      // Récupérer les types de courrier
      const types = await typeCourrierApi.getAll();
      console.log('📋 Types récupérés:', types);
      
      const desiredTypeCode = typeMap[typeCourrier] || typeCourrier.toUpperCase();
      const typeMatch = types.find((t: any) =>
        t.code?.toUpperCase() === desiredTypeCode ||
        t.libelle?.toUpperCase().includes(desiredTypeCode.replace('_', ' '))
      );
      
      // Récupérer les statuts - CORRECTION IMPORTANTE
      const statutsResponse = await statutApi.getAll();
      console.log('📋 Statuts reçus:', statutsResponse);
      
      // Extraire le tableau de statuts (peut être dans .statuts ou directement le tableau)
      const statuts = Array.isArray(statutsResponse) 
        ? statutsResponse 
        : statutsResponse?.statuts || [];
      
      console.log('📋 Statuts extraits:', statuts);
      
      const statutMatch = statuts.find((s: any) =>
        s.code_statut?.toUpperCase() === 'EN_ATTENTE' ||
        s.libelle_statut?.toUpperCase().includes('ATTENTE')
      );

      if (!typeMatch) {
        setError(`Type "${typeCourrier}" introuvable. Types: ${types.map((t: any) => t.libelle).join(', ')}`);
        setSending(false);
        return;
      }

      if (!statutMatch) {
        setError(`Statut "En attente" introuvable. Statuts: ${statuts.map((s: any) => s.libelle_statut).join(', ')}`);
        setSending(false);
        return;
      }

      console.log('✅ Type:', typeMatch.libelle, '| Statut:', statutMatch.libelle_statut);

      // ============================================================
      // 4️⃣ PRÉPARER LE DTO COMPLET
      // ============================================================
      
      // Vérifier si la fiche est remplie
      const ficheEstRemplie = fiche.reference || 
                              fiche.observation || 
                              fiche.tresUrgent ||
                              fiche.urgent;
      
      const courrierDTO: CourrierCompletRequest = {
        objet: objet.trim(),
        dateReception: dateReception,
        idExpediteur: exp.id_expediteur,
        idDestinataire: dest.id_destinataire,
        idTypeCourrier: typeMatch.id_type_courrier,
        idStatut: statutMatch.id_statut,
        // Ajouter la fiche si remplie
        ...(ficheEstRemplie && {
          reference: fiche.reference || "",
          observation: fiche.observation || "",
          tresUrgent: fiche.tresUrgent,
          urgent: fiche.urgent,
          menParler: fiche.menParler,
          pourAttribution: fiche.pourAttribution,
          pourEtudeEtAvis: fiche.pourEtudeEtAvis,
          pourDisposition: fiche.pourDisposition,
          elementDeReponse: fiche.elementDeReponse,
          finRetour: fiche.finRetour,
          pourSuiteADonner: fiche.pourSuiteADonner,
          pourVisaPrealable: fiche.pourVisaPrealable,
          pourNecessaire: fiche.pourNecessaire,
          notePourLeDG: fiche.notePourLeDG,
          pourResumerSuccinct: fiche.pourResumerSuccinct,
          noteMinistre: fiche.noteMinistre,
          copieA: fiche.copieA,
          meRepresenter: fiche.meRepresenter,
          pourEtude: fiche.pourEtude,
          lettreDeTransmission: fiche.lettreDeTransmission,
          bordeauEnvoi: fiche.bordeauEnvoi || fiche.BordereauEnvoi,
          pourInformation: fiche.pourInformation,
          aTouteFinUtile: fiche.aTouteFinUtile,
          enInstance: fiche.enInstance,
          aClasser: fiche.aClasser,
          courrierReserve: fiche.courrierReserve
        })
      };

      console.log('📤 Envoi courrier...', { courrierDTO, hasFile: !!file });

      // ============================================================
      // 5️⃣ CRÉER LE COURRIER VIA /creer-complet
      // ============================================================
      
      const formData = new FormData();
      formData.append('courrier', JSON.stringify(courrierDTO));
      
      if (file) {
        formData.append('file', file);
        console.log('📎 Fichier joint:', file.name);
      }
      
      const response = await axiosInstance.post('/api/courriers/creer-complet', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('✅ Réponse backend:', response.data);
      
      const created = response.data.courrier;

      // ============================================================
      // 6️⃣ CRÉER LES AFFECTATIONS (APRÈS création)
      // ============================================================
      
      if (created?.id || created?.idCourrier && affectations.length > 0) {
        const courrierId = created.id || created.idCourrier;
        console.log(`📋 Création de ${affectations.length} affectation(s)...`);
        
        for (const a of affectations) {
          try {
            await affectationApi.ajouter({
              courrierId: courrierId,
              utilisateurId: a.utilisateurId,
              commentaire: a.commentaire || ""
            });
            console.log(`✅ Affectation créée pour ${a.utilisateurNom}`);
          } catch (afErr: any) {
            console.warn('⚠️ Erreur affectation:', afErr.message);
          }
        }
      }

      setSuccessMsg('✅ Courrier créé avec succès !');
      setTimeout(() => navigate('/dashboard'), 1500);
      
    } catch (err: any) {
      console.error('❌ Erreur:', err);
      
      let errorMessage = 'Erreur lors de la création du courrier.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Sidebar />
      <div className="flex-1 p-6 md:p-10">
        <Navbar />

        <div className="max-w-4xl mx-auto mt-10 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-6 h-6" /> Nouveau Courrier
            </h1>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>

              <button
                onClick={openAffectModal}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm"
              >
                <Plus className="w-4 h-4" /> Affecter
              </button>

              <button
                onClick={openFicheModal}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-md text-sm"
              >
                <Check className="w-4 h-4" /> Associer fiche
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded text-red-300">{error}</div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-600/20 border border-green-600/30 rounded text-green-300">{successMsg}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Objet + Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-1">Objet du courrier</label>
                <input
                  type="text"
                  value={objet}
                  onChange={(e) => setObjet(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Date de réception</label>
                <input
                  type="date"
                  value={dateReception}
                  onChange={(e) => setDateReception(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            {/* Type + Statut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1">Type de courrier</label>
                <select
                  value={typeCourrier}
                  onChange={(e) => setTypeCourrier(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value="entrant">Entrant</option>
                  <option value="sortant">Sortant</option>
                  <option value="note_interne">Note interne</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Statut</label>
                <select
                  value={statut}
                  onChange={(e) => setStatut(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option>En attente</option>
                  <option>Traité</option>
                  <option>Archivé</option>
                </select>
              </div>
            </div>

            {/* Expéditeur */}
            <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-700">
              <h3 className="text-white font-semibold mb-2">Informations Expéditeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 text-sm">Nom de la structure</label>
                  <input
                    name="nomDeStructure"
                    value={expediteur.nomDeStructure}
                    onChange={handleExpediteurChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Nom du responsable</label>
                  <input
                    name="nomDuResponsable"
                    value={expediteur.nomDuResponsable}
                    onChange={handleExpediteurChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Adresse géographique</label>
                  <input
                    name="adresseGeographique"
                    value={expediteur.adresseGeographique}
                    onChange={handleExpediteurChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Adresse email</label>
                  <input
                    name="adresseEmail"
                    value={expediteur.adresseEmail}
                    onChange={handleExpediteurChange}
                    type="email"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Téléphone</label>
                  <input
                    name="tel"
                    value={expediteur.tel}
                    onChange={handleExpediteurChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Type structure</label>
                  <input
                    name="typeStructure"
                    value={expediteur.typeStructure}
                    onChange={handleExpediteurChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Destinataire */}
            <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-700">
              <h3 className="text-white font-semibold mb-2">Informations Destinataire</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 text-sm">Nom de la structure</label>
                  <input
                    name="nomDeStructure"
                    value={destinataire.nomDeStructure}
                    onChange={handleDestinataireChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Nom du responsable</label>
                  <input
                    name="nomDuResponsable"
                    value={destinataire.nomDuResponsable}
                    onChange={handleDestinataireChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Adresse géographique</label>
                  <input
                    name="adresseGeographique"
                    value={destinataire.adresseGeographique}
                    onChange={handleDestinataireChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Adresse email</label>
                  <input
                    name="adresseEmail"
                    value={destinataire.adresseEmail}
                    onChange={handleDestinataireChange}
                    type="email"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm">Téléphone</label>
                  <input
                    name="tel"
                    value={destinataire.tel}
                    onChange={handleDestinataireChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Fichier */}
            <div>
              <label className="block text-slate-300 mb-1">Fichier associé</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              />
            </div>

            {/* Affectations */}
            <div>
              <h4 className="text-white font-medium mb-2">Affectations</h4>
              {affectations.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucune affectation. Utilisez "Affecter" pour ajouter.</p>
              ) : (
                <div className="space-y-2">
                  {affectations.map((a, idx) => (
                    <div key={idx} className="flex items-start justify-between bg-slate-900/20 p-3 rounded">
                      <div>
                        <p className="text-white font-medium">{a.utilisateurNom}</p>
                        {a.commentaire && (
                          <p className="text-slate-300 text-sm">{a.commentaire}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeAffectation(idx)}
                        className="text-red-400 hover:text-red-300"
                        type="button"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setObjet('');
                  setDateReception('');
                  setTypeCourrier('entrant');
                  setStatut('En attente');
                  setExpediteur({
                    nomDeStructure: '',
                    nomDuResponsable: '',
                    adresseGeographique: '',
                    adresseEmail: '',
                    tel: '',
                    typeStructure: '',
                  });
                  setDestinataire({
                    nomDeStructure: '',
                    nomDuResponsable: '',
                    adresseGeographique: '',
                    adresseEmail: '',
                    tel: '',
                  });
                  setFile(null);
                  setFiche(initialFiche);
                  setAffectations([]);
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={sending}
                className={`flex items-center gap-2 bg-purple-600 hover:bg-purple-700 transition-colors px-5 py-2 rounded-md font-medium ${
                  sending ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sending ? 'Envoi...' : 'Créer le courrier'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Affectation */}
      {showAffectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-slate-900 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Affecter le courrier</h3>
              <button onClick={closeAffectModal} className="text-slate-400 hover:text-white">
                <X />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-slate-300 text-sm mb-2">
                Sélectionnez un utilisateur
              </p>

              {loadingUsers ? (
                <div className="flex items-center gap-2 text-slate-300">
                  <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-auto">
                  {usersForAssign.map((u) => (
                    <label
                      key={u.id}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-slate-800 ${
                        selectedUserId === u.id ? 'bg-slate-800 border border-purple-500' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="userAssign"
                        checked={selectedUserId === u.id}
                        onChange={() => setSelectedUserId(u.id)}
                        className="accent-purple-500"
                      />
                      <div>
                        <div className="text-white font-medium">{u.prenom} {u.nom}</div>
                        <div className="text-slate-400 text-xs">{u.email} • {u.role}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-slate-300 mb-1 text-sm">Commentaire (facultatif)</label>
              <textarea
                value={assignComment}
                onChange={(e) => setAssignComment(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={closeAffectModal} className="px-3 py-2 bg-slate-700 rounded">Annuler</button>
              <button onClick={addAffectation} className="px-4 py-2 bg-blue-600 rounded">Affecter</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Fiche de transmission - Version améliorée */}
{showFicheModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
    <div
      className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden"
      style={{ maxHeight: '90vh' }}
    >
      {/* En-tête avec fond coloré */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Fiche de transmission
          </h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={resetFiche} 
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition flex items-center gap-1"
            >
              <span>Réinitialiser</span>
            </button>
            <button 
              onClick={closeFicheModal} 
              className="text-white/80 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Corps du modal avec scroll */}
      <div className="p-6 bg-gray-50 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>
        
        {/* Section Référence */}
        <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Référence du document
          </label>
          <input
            name="reference"
            value={fiche.reference}
            onChange={handleFicheChange}
            placeholder="Ex: N°2024/001/MATD/CAB"
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Grille d'options en 3 colonnes pour mieux aérer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Colonne 1 - Priorité */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Priorité
            </h4>
            <div className="space-y-2">
              {[
                { name: 'tresUrgent', label: '🔴 TRÈS URGENT', color: 'text-red-700' },
                { name: 'urgent', label: '🟠 URGENT', color: 'text-orange-700' },
              ].map((c) => (
                <label key={c.name} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name={c.name}
                    checked={(fiche as any)[c.name]}
                    onChange={handleFicheChange as any}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className={`text-sm font-medium ${c.color}`}>{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Colonne 2 - Actions principales */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Actions principales
            </h4>
            <div className="space-y-2">
              {[
                { name: 'pourAttribution', label: 'Pour attribution' },
                { name: 'pourEtudeEtAvis', label: 'Pour étude et avis' },
                { name: 'pourSuiteADonner', label: 'Pour suite à donner' },
                { name: 'pourInformation', label: 'Pour information' },
              ].map((c) => (
                <label key={c.name} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name={c.name}
                    checked={(fiche as any)[c.name]}
                    onChange={handleFicheChange as any}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Colonne 3 - Communications */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Communications
            </h4>
            <div className="space-y-2">
              {[
                { name: 'menParler', label: "M'en parler" },
                { name: 'meRepresenter', label: 'Me représenter' },
                { name: 'copieA', label: 'Copie à' },
                { name: 'notePourLeDG', label: 'Note pour le DG' },
              ].map((c) => (
                <label key={c.name} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name={c.name}
                    checked={(fiche as any)[c.name]}
                    onChange={handleFicheChange as any}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Deuxième ligne - Actions secondaires */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Actions secondaires
            </h4>
            <div className="space-y-2">
              {[
                { name: 'pourDisposition', label: 'Pour disposition à prendre' },
                { name: 'elementDeReponse', label: 'Pour élément de réponse' },
                { name: 'pourVisaPrealable', label: 'Pour visa préalable' },
                { name: 'pourNecessaire', label: 'Pour le nécessaire à faire' },
              ].map((c) => (
                <label key={c.name} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name={c.name}
                    checked={(fiche as any)[c.name]}
                    onChange={handleFicheChange as any}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              Traitement
            </h4>
            <div className="space-y-2">
              {[
                { name: 'finRetour', label: 'Fin retour' },
                { name: 'pourResumerSuccinct', label: 'Pour résumer succinct' },
                { name: 'noteMinistre', label: "Note à l'attention du Ministre" },
                { name: 'pourEtude', label: 'Pour étude en rapport avec' },
              ].map((c) => (
                <label key={c.name} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name={c.name}
                    checked={(fiche as any)[c.name]}
                    onChange={handleFicheChange as any}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Classement
            </h4>
            <div className="space-y-2">
              {[
                { name: 'lettreDeTransmission', label: 'Lettre de transmission à' },
                { name: 'bordeauEnvoi', label: "Bordereau d'envoi" },
                { name: 'enInstance', label: 'En instance' },
                { name: 'aClasser', label: 'À classer' },
                { name: 'courrierReserve', label: 'Courrier réservé' },
                { name: 'aTouteFinUtile', label: 'À toute fin utile' },
              ].map((c) => (
                <label key={c.name} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    name={c.name}
                    checked={(fiche as any)[c.name]}
                    onChange={handleFicheChange as any}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{c.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Section Observation avec meilleur style */}
        <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Observations
          </label>
          <textarea
            value={fiche.observation}
            onChange={handleFicheChange as any}
            name="observation"
            rows={4}
            placeholder="Ajoutez vos observations ici..."
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Pied du modal avec actions */}
      <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
        <button
          onClick={closeFicheModal}
          className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300 transition font-medium"
        >
          Annuler
        </button>
        <button
          onClick={() => setShowFicheModal(false)}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition font-medium shadow-md flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Associer la fiche
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};
