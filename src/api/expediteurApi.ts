import axiosInstance from './axiosConfig';
import type { Expediteur } from '../types/Courrier';

export interface ExpediteurCreateDTO {
  nom_de_structure: string;
  nom_du_responsable: string;
  adresse_geographique: string;
  adresse_email: string;
  tel: string;
  type_structure?: string;
}

export const expediteurApi = {
  // Récupérer tous les expéditeurs
  getAll: async (): Promise<Expediteur[]> => {
    const forceRealAPI = import.meta.env.VITE_FORCE_REAL_API === 'true';
    
    try {
      console.log('🔄 Récupération des expéditeurs depuis le backend...');
      const response = await axiosInstance.get('/api/expediteurs/liste');
      console.log('✅ Expéditeurs récupérés depuis le backend:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur API expéditeurs:', error);
      
      // Si on force l'API réelle, ne pas utiliser les données mockées
      if (forceRealAPI) {
        throw new Error('Impossible de récupérer les expéditeurs. Vérifiez que le backend Spring Boot est démarré.');
      }
      
      console.warn('📋 API expéditeurs non disponible, utilisation des données mockées');
      return [
        {
          id_expediteur: 1,
          nom_de_structure: 'Ministere de l\'Education',
          nom_du_responsable: 'Non renseigne',
          adresse_geographique: 'Lome, Togo',
          adresse_email: 'contact@education.tg',
          tel: '+228 22 21 45 67'
        },
        {
          id_expediteur: 2,
          nom_de_structure: 'Ministere de la Sante',
          nom_du_responsable: 'Non renseigne',
          adresse_geographique: 'Lome, Togo',
          adresse_email: 'contact@sante.tg',
          tel: '+228 22 21 78 90'
        }
      ];
    }
  },

  // Récupérer un expéditeur par ID
  getById: async (id: number): Promise<Expediteur> => {
    try {
      const response = await axiosInstance.get(`/api/expediteurs/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Expéditeur avec l'ID ${id} non trouvé`);
    }
  },

  // Créer un nouvel expéditeur
  create: async (expediteur: ExpediteurCreateDTO): Promise<Expediteur> => {
    try {
      const response = await axiosInstance.post('/api/expediteurs/ajouter', expediteur);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'expéditeur');
    }
  },

  // Mettre à jour un expéditeur
  update: async (id: number, expediteur: Partial<ExpediteurCreateDTO>): Promise<Expediteur> => {
    try {
      const response = await axiosInstance.put(`/api/expediteurs/${id}`, expediteur);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'expéditeur');
    }
  },

  // Supprimer un expéditeur
  delete: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/expediteurs/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l\'expéditeur');
    }
  }
};