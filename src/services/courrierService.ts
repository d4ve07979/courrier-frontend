// src/services/courrierService.ts
import { courrierApi } from '../api/courrierApi';
import type { 
  Courrier, 
  CourrierCreateDTO, 
  CourrierUpdateDTO, 
  CourrierSearchParams,
  StatutCourrierEnum
} from '../types/Courrier';

export interface CourrierResponse {
  courriers: Courrier[];
  total: number;
  page: number;
  totalPages: number;
}

export class CourrierService {
  /**
   * Lister les courriers avec pagination et filtres
   */
  static async listerCourriers(params: CourrierSearchParams): Promise<any> {
    try {
      const response = await courrierApi.listerCourriers(params);
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des courriers:', error);
      return [];
    }
  }

  /**
   * Lister les courriers de l'utilisateur connecté (mes courriers)
   */
  static async listerMesCourriers(params: CourrierSearchParams): Promise<any> {
    try {
      const response = await courrierApi.getMesCourriers(params);
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de mes courriers:', error);
      return [];
    }
  }

  /**
   * Récupère les statistiques détaillées des courriers accessibles
   * @param params paramètres de filtre optionnels (recherche, statut, type, dateDebut, dateFin)
   */
  static async getMesStatistiques(params?: {
    recherche?: string;
    statut?: string;
    type?: string;
    dateDebut?: string;
    dateFin?: string;
  }): Promise<any> {
    try {
      const response = await courrierApi.getMesStatistiques(params);
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }

  /**
   * Obtenir un courrier par son ID
   */
  static async obtenirCourrierParId(id: number): Promise<Courrier> {
    try {
      return await courrierApi.obtenirParId(id);
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération du courrier ${id}:`, error);
      throw new Error(`Impossible de charger le courrier ${id}`);
    }
  }

  /**
   * Créer un nouveau courrier
   */
  static async creerCourrier(courrier: CourrierCreateDTO): Promise<Courrier> {
    try {
      return await courrierApi.creer(courrier);
    } catch (error) {
      console.error('❌ Erreur lors de la création du courrier:', error);
      throw new Error('Erreur lors de la création du courrier');
    }
  }

  /**
   * Créer un courrier avec fichier
   */
  static async creerCourrierAvecFichier(courrier: CourrierCreateDTO, file: File): Promise<Courrier> {
    try {
      return await courrierApi.creerAvecFichier(courrier, file);
    } catch (error) {
      console.error('❌ Erreur lors de la création du courrier avec fichier:', error);
      throw new Error('Erreur lors de la création du courrier avec fichier');
    }
  }

  /**
   * Mettre à jour un courrier
   */
  static async mettreAJourCourrier(id: number, courrier: CourrierUpdateDTO): Promise<Courrier> {
    try {
      return await courrierApi.mettreAJour(id, courrier);
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour du courrier ${id}:`, error);
      throw new Error(`Erreur lors de la mise à jour du courrier ${id}`);
    }
  }

  /**
   * Supprimer un courrier
   */
  static async supprimerCourrier(id: number): Promise<void> {
    try {
      await courrierApi.supprimer(id);
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression du courrier ${id}:`, error);
      throw new Error(`Erreur lors de la suppression du courrier ${id}`);
    }
  }

  /**
   * Affecter un courrier à un utilisateur
   */
  static async affecterCourrier(id: number, utilisateurId: number): Promise<Courrier> {
    try {
      return await courrierApi.affecter(id, utilisateurId);
    } catch (error) {
      console.error(`❌ Erreur lors de l'affectation du courrier ${id}:`, error);
      throw new Error(`Erreur lors de l'affectation du courrier ${id}`);
    }
  }

  /**
   * Changer le statut d'un courrier (en utilisant l'ID du statut)
   */
  static async changerStatut(id: number, idStatut: number): Promise<Courrier> {
    try {
      return await courrierApi.changerStatut(id, idStatut);
    } catch (error) {
      console.error(`❌ Erreur lors du changement de statut du courrier ${id}:`, error);
      throw new Error(`Erreur lors du changement de statut du courrier ${id}`);
    }
  }

  /**
   * Télécharger un fichier de courrier
   */
  static async telechargerFichier(courrierId: number, fichierId: number): Promise<Blob> {
    try {
      return await courrierApi.telechargerFichier(courrierId, fichierId);
    } catch (error) {
      console.error(`❌ Erreur lors du téléchargement du fichier ${fichierId}:`, error);
      throw new Error(`Erreur lors du téléchargement du fichier`);
    }
  }
}