import type { Utilisateur } from './Utilisateur';

export type ActionType = 'CREATION' | 'MODIFICATION' | 'AFFECTATION' | 'TRANSMISSION' | 'VALIDATION' | 'ENVOI' | 'RECEPTION' | 'ARCHIVAGE' | 'CLASSEMENT' | 'CONSULTATION' | 'CONNEXION' | 'DECONNEXION';

export interface Journalisation {
  id: number;
  action: ActionType;
  entite: string;
  entiteId: number;
  utilisateur: Utilisateur;
  details?: string;
  dateAction: string;
  ipAddress?: string;
}

