// src/types/Courrier.ts
import type { Affectation } from './Affectation';

// Types correspondant exactement au backend Spring Boot
export interface Expediteur {
  id_expediteur: number;
  nom_de_structure: string;
  nom_du_responsable: string;
  adresse_geographique: string;
  adresse_email: string;
  tel: string;
  type_structure?: string;
  date_enregistrement?: string;
}

export interface Destinataire {
  id_destinataire: number;
  nom_de_structure: string;
  nom_du_responsable: string;
  adresse_geographique: string;
  adresse_email: string;
  tel: string;
}

export interface TypeCourrier {
  id_type_courrier: number;
  libelle: string; // Backend utilise libelle, pas nom_type_courrier
  description?: string;
}

export interface Statut {
  id_statut: number;
  libelle_statut: string; // Backend utilise libelle_statut, pas nom_statut
}

export interface FicheDeTransmission {
  id_fiche: number;
  nom_fiche: string;
  description_fiche: string;
}

export interface FichierCourrier {
  id_fichier: number;
  nom_fichier: string;
  chemin_fichier: string;
  courrier: Courrier;
}

export interface Courrier {
  id_courrier: number;
  objet: string;
  date_reception: string; // Format: YYYY-MM-DD
  id_expediteur: Expediteur;
  id_destinataire: Destinataire;
  id_type_courrier: TypeCourrier;
  id_statut: Statut;
  id_fiche: FicheDeTransmission;
  fichiers?: FichierCourrier[];
  affectations?: Affectation[];
}

export interface CourrierCreateDTO {
  objet: string;
  date_reception: string;
  id_expediteur: { id_expediteur: number } | number;
  id_destinataire: { id_destinataire: number } | number;
  id_type_courrier: { id_type_courrier: number } | number;
  id_statut: { id_statut: number } | number;
  id_fiche?: { id_fiche: number } | number;
}

// DTO pour le backend (format exact attendu)
export interface CourrierCreateBackendDTO {
  objet: string;
  date_reception: string;
  id_expediteur: { id_expediteur: number };
  id_destinataire: { id_destinataire: number };
  id_type_courrier: { id_type_courrier: number };
  id_statut: { id_statut: number };
  id_fiche?: { id_fiche: number };
}

export interface CourrierUpdateDTO {
  objet?: string;
  date_reception?: string;
  id_expediteur?: number;
  id_destinataire?: number;
  id_type_courrier?: number;
  id_statut?: number;
  id_fiche?: number;
}

export interface CourrierSearchParams {
  page?: number;
  size?: number;
  recherche?: string;
  statut?: string;
  type?: string;
  dateDebut?: string;
  dateFin?: string;
  directionId?: number;
}

// Types pour les nouveaux formulaires
export type TypeDocument = 
  | 'COURRIER_OFFICIEL'
  | 'DEMANDE'
  | 'FACTURE'
  | 'RAPPORT'
  | 'INVITATION'
  | 'AUTRE';

export type PrioriteCourrier = 
  | 'NORMALE'
  | 'URGENTE'
  | 'TRES_URGENTE';

export type TypeCourrierEnum = 
  | 'ENTRANT'
  | 'SORTANT';

export type StatutCourrierEnum = 
  | 'EN_ATTENTE'
  | 'AFFECTE'
  | 'EN_TRAITEMENT'
  | 'TRAITE'
  | 'VALIDE'
  | 'ENVOYE'
  | 'EN_PREPARATION'
  | 'CLASSE'
  | 'ARCHIVE';

export interface Structure {
  nom: string;
  nomResponsable: string;
  adresseEmail: string;
  adresseGeographique: string;
  telephone: string;
}

// ✅ NOUVELLE INTERFACE : Statistiques détaillées retournées par /api/courriers/mes-statistiques
export interface MesStatistiques {
  total: number;
  entrants: number;
  sortants: number;
  enAttente: number;
  enCours: number;
  traites: number;
  archives: number;
  classes: number;
  rejetes: number;
  urgents: number;
  parStatut: Record<string, number>;   // Répartition par code de statut
  parType: Record<string, number>;     // Répartition par code de type (ENT, SOR...)
}