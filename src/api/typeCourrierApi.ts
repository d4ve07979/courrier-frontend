import axiosInstance from './axiosConfig';
import type { TypeCourrier } from '../types/Courrier';

export interface TypeCourrierCreateDTO {
  libelle: string;
  description?: string;
}

export const typeCourrierApi = {
  // Récupérer tous les types de courrier
  getAll: async (): Promise<TypeCourrier[]> => {
    try {
      const response = await axiosInstance.get('/api/typecourriers/list');
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.message;
      throw new Error(`Types de courrier: HTTP ${status} - ${msg}`);
    }
  },

  // Récupérer un type de courrier par ID
  getById: async (id: number): Promise<TypeCourrier> => {
    try {
      const response = await axiosInstance.get(`/api/typecourriers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Type de courrier avec l'ID ${id} non trouvé`);
    }
  },

  // Créer un nouveau type de courrier
  create: async (typeCourrier: TypeCourrierCreateDTO): Promise<TypeCourrier> => {
    try {
      const response = await axiosInstance.post('/api/typecourriers', typeCourrier);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du type de courrier');
    }
  },

  // Mettre à jour un type de courrier
  update: async (id: number, typeCourrier: Partial<TypeCourrierCreateDTO>): Promise<TypeCourrier> => {
    try {
      const response = await axiosInstance.put(`/api/typecourriers/${id}`, typeCourrier);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du type de courrier');
    }
  },

  // Supprimer un type de courrier
  delete: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/typecourriers/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du type de courrier');
    }
  }
};