import type { TypeCourrierEnum, StatutCourrierEnum, PrioriteCourrier, TypeDocument } from './Courrier';

export interface CriteresRecherche {
  // Critères de base
  reference?: string;
  objet?: string;
  
  // Filtres par type et statut
  type?: TypeCourrierEnum;
  typeDocument?: TypeDocument;
  statut?: StatutCourrierEnum;
  priorite?: PrioriteCourrier;
  
  // Filtres temporels
  dateDebutReception?: string;
  dateFinReception?: string;
  dateDebutEnvoi?: string;
  dateFinEnvoi?: string;
  
  // Filtres par structure
  expediteurNom?: string;
  destinataireNom?: string;
  
  // Filtres par direction/service
  directionId?: number;
  serviceEmetteur?: string;
  serviceDestinataire?: string;
  
  // Pagination
  page: number;
  taille: number;
  
  // Tri
  triPar?: 'date' | 'numero' | 'objet' | 'statut';
  ordreDecroissant?: boolean;
}

export interface ResultatRecherche {
  courriers: any[]; // Sera typé avec le type Courrier complet
  totalElements: number;
  totalPages: number;
  pageActuelle: number;
  taille: number;
}

export interface FiltresAvances {
  periodes: { label: string; debut: string; fin: string; }[];
  directions: { id: number; nom: string; }[];
  services: string[];
  structures: { nom: string; type: 'expediteur' | 'destinataire'; }[];
}