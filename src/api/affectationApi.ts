// src/api/affectationApi.ts
import axiosInstance from './axiosConfig';
import type { Affectation } from '../types/Affectation';

export interface AffectationCreateRequest {
  courrierId: number;
  utilisateurId: number;
  commentaire?: string;
}

// Nouveau DTO pour les affectations (tel que retourné par le backend)
export interface AffectationDTO {
  id: number;
  courrierId: number;
  objetCourrier: string;
  dateReceptionCourrier: string; // format ISO
  statutCourrier: string;
  utilisateurNom: string;
  utilisateurPrenom: string;
  directionNom?: string;
  dateAffectation: string;
  motif?: string;
}

export const affectationApi = {
  create: async (affectation: Partial<Affectation>): Promise<Affectation> => {
    const response = await axiosInstance.post('/api/affectations', affectation);
    return response.data;
  },

  // Récupère les affectations pour un courrier spécifique (en filtrant côté client)
  // Utilise le DTO maintenant
  getByCourrierId: async (courrierId: number): Promise<AffectationDTO[]> => {
    try {
      const response = await axiosInstance.get('/api/affectations/mes-affectations');
      const list: AffectationDTO[] = Array.isArray(response.data) ? response.data : [];
      return list.filter(a => a.courrierId === courrierId);
    } catch (error) {
      console.warn('Aucune affectation trouvée pour ce courrier ou erreur API:', error);
      return [];
    }
  },

  /**
   * Récupère les affectations de l'utilisateur connecté.
   * Retourne un tableau de DTO (AffectationDTO).
   */
  getMesAffectations: async (): Promise<AffectationDTO[]> => {
    try {
      const response = await axiosInstance.get('/api/affectations/mes-affectations');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des affectations:', error);
      return [];
    }
  },

  marquerReception: async (id: number): Promise<Affectation> => {
    const response = await axiosInstance.put(`/api/affectations/${id}/reception`);
    return response.data;
  },
  
  ajouter: async (payload: AffectationCreateRequest): Promise<Affectation> => {
    const response = await axiosInstance.post('/api/affectations/ajouter', payload);
    return response.data;
  },
};