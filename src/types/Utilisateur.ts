import type { UserRole } from './Auth';

export interface Utilisateur {
  id_utilisateur: number;
  nom_utilisateur: string;
  prenom_utilisateur: string;
  email_utilisateur: string;
  role_utilisateur: UserRole;
  actif: boolean;
  verrouille: boolean;
  tentatives_echec: number;
}

export interface UtilisateurCreateDTO {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: UserRole;
}

export interface UtilisateurUpdateDTO {
  nom?: string;
  prenom?: string;
  email?: string;
  role?: UserRole;
  actif?: boolean;
}

