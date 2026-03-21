import axiosInstance from './axiosConfig';
import type { Destinataire } from '../types/Courrier';

export interface DestinataireCreateDTO {
  nom_de_structure: string;
  nom_du_responsable: string;
  adresse_geographique: string;
  adresse_email: string;
  tel: string;
}

export const destinataireApi = {
  // Récupérer tous les destinataires
  getAll: async (): Promise<Destinataire[]> => {
    try {
      const response = await axiosInstance.get('/api/destinataires/list');
      return response.data;
    } catch (error) {
      console.warn('API destinataires non disponible, utilisation des données mockées');
      return [
        {
          id_destinataire: 1,
          nom_de_structure: 'INSEED',
          nom_du_responsable: 'Non renseigne',
          adresse_geographique: 'Lome, Togo',
          adresse_email: 'contact@inseed.tg',
          tel: '+228 22 25 89 45'
        },
        {
          id_destinataire: 2,
          nom_de_structure: 'Direction Generale',
          nom_du_responsable: 'Non renseigne',
          adresse_geographique: 'INSEED, Lome',
          adresse_email: 'dg@inseed.tg',
          tel: '+228 22 25 89 46'
        }
      ];
    }
  },

  // Récupérer un destinataire par ID
  getById: async (id: number): Promise<Destinataire> => {
    try {
      const response = await axiosInstance.get(`/api/destinataires/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Destinataire avec l'ID ${id} non trouvé`);
    }
  },

  // Créer un nouveau destinataire
  create: async (destinataire: DestinataireCreateDTO): Promise<Destinataire> => {
    try {
      const response = await axiosInstance.post('/api/destinataires/ajouter', destinataire);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du destinataire');
    }
  },

  // Mettre à jour un destinataire
  update: async (id: number, destinataire: Partial<DestinataireCreateDTO>): Promise<Destinataire> => {
    try {
      const response = await axiosInstance.put(`/api/destinataires/${id}`, destinataire);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du destinataire');
    }
  },

  // Supprimer un destinataire
  delete: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/destinataires/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du destinataire');
    }
  }
};