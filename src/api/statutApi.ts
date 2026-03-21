import axiosInstance from './axiosConfig';
import type { Statut } from '../types/Courrier';

export interface StatutCreateDTO {
  libelle_statut: string;
}

export const statutApi = {
  // Récupérer tous les statuts
  getAll: async (): Promise<Statut[]> => {
    try {
      const response = await axiosInstance.get('/api/statuts/lister');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statuts');
      throw new Error('Impossible de récupérer les statuts. Vérifiez que le backend est démarré.');
    }
  },

  // Récupérer un statut par ID
  getById: async (id: number): Promise<Statut> => {
    try {
      const response = await axiosInstance.get(`/api/statuts/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Statut avec l'ID ${id} non trouvé`);
    }
  },

  // Créer un nouveau statut
  create: async (statut: StatutCreateDTO): Promise<Statut> => {
    try {
      const response = await axiosInstance.post('/api/statuts', statut);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du statut');
    }
  },

  // Mettre à jour un statut
  update: async (id: number, statut: Partial<StatutCreateDTO>): Promise<Statut> => {
    try {
      const response = await axiosInstance.put(`/api/statuts/${id}`, statut);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  },

  // Supprimer un statut
  delete: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/statuts/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du statut');
    }
  }
};