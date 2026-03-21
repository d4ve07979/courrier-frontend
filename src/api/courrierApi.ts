// src/api/courrierApi.ts
import axiosInstance from './axiosConfig';
import type { 
  Courrier, 
  CourrierCreateDTO, 
  CourrierUpdateDTO, 
  CourrierSearchParams
} from '../types/Courrier';

export interface CourrierResponse {
  courriers: Courrier[];
  total: number;
  page: number;
  totalPages: number;
}

export const courrierApi = {
  // Lister les courriers (admin ou recherche globale)
  listerCourriers: async (params?: CourrierSearchParams): Promise<CourrierResponse | any> => {
    try {
      console.log('🔄 Récupération des courriers depuis le backend...', params);
      const response = await axiosInstance.get('/api/courriers/afficher', { params });
      console.log('✅ Courriers récupérés depuis le backend:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur API courriers:', error);
      throw error;
    }
  },

  // Récupérer un courrier par ID
  obtenirParId: async (id: number): Promise<Courrier> => {
    try {
      const response = await axiosInstance.get(`/api/courriers/${id}`);
      if (response.data && response.data.courrier) {
        return response.data.courrier as Courrier;
      }
      return response.data as Courrier;
    } catch (error: any) {
      console.error('Erreur chargement courrier ID ' + id + ':', error);
      throw new Error(`Courrier avec l'ID ${id} non trouvé`);
    }
  },

  // Récupérer les courriers de l'utilisateur connecté
  getMesCourriers: async (params?: CourrierSearchParams): Promise<CourrierResponse | any> => {
    try {
      console.log('🔄 Récupération de mes courriers depuis le backend...', params);
      const response = await axiosInstance.get('/api/courriers/mes-courriers', { params });
      console.log('✅ Mes courriers récupérés depuis le backend:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur API mes courriers:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques détaillées des courriers de l'utilisateur connecté
   * @param params paramètres de filtre optionnels (recherche, statut, type, dateDebut, dateFin)
   */
  getMesStatistiques: async (params?: {
    recherche?: string;
    statut?: string;
    type?: string;
    dateDebut?: string;
    dateFin?: string;
  }): Promise<any> => {
    try {
      console.log('📊 Récupération des statistiques détaillées...', params);
      const response = await axiosInstance.get('/api/courriers/mes-statistiques', { params });
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur API statistiques:', error);
      throw error;
    }
  },

  // Créer un nouveau courrier simple
  creer: async (courrier: CourrierCreateDTO): Promise<Courrier> => {
    try {
      const backendDTO = {
        objet: courrier.objet,
        date_reception: courrier.date_reception,
        id_expediteur: typeof courrier.id_expediteur === 'number' 
          ? { id_expediteur: courrier.id_expediteur }
          : courrier.id_expediteur,
        id_destinataire: typeof courrier.id_destinataire === 'number'
          ? { id_destinataire: courrier.id_destinataire }
          : courrier.id_destinataire,
        id_type_courrier: typeof courrier.id_type_courrier === 'number'
          ? { id_type_courrier: courrier.id_type_courrier }
          : courrier.id_type_courrier,
        id_statut: typeof courrier.id_statut === 'number'
          ? { id_statut: courrier.id_statut }
          : courrier.id_statut,
        id_fiche: courrier.id_fiche 
          ? (typeof courrier.id_fiche === 'number'
            ? { id_fiche: courrier.id_fiche }
            : courrier.id_fiche)
          : undefined
      };
      const response = await axiosInstance.post('/api/courriers/creer', backendDTO);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du courrier');
    }
  },

  // Créer un courrier avec fichier
  creerAvecFichier: async (courrier: CourrierCreateDTO, file: File): Promise<Courrier> => {
    try {
      const backendDTO = {
        objet: courrier.objet,
        date_reception: courrier.date_reception,
        id_expediteur: typeof courrier.id_expediteur === 'number' 
          ? { id_expediteur: courrier.id_expediteur }
          : courrier.id_expediteur,
        id_destinataire: typeof courrier.id_destinataire === 'number'
          ? { id_destinataire: courrier.id_destinataire }
          : courrier.id_destinataire,
        id_type_courrier: typeof courrier.id_type_courrier === 'number'
          ? { id_type_courrier: courrier.id_type_courrier }
          : courrier.id_type_courrier,
        id_statut: typeof courrier.id_statut === 'number'
          ? { id_statut: courrier.id_statut }
          : courrier.id_statut,
        id_fiche: courrier.id_fiche 
          ? (typeof courrier.id_fiche === 'number'
            ? { id_fiche: courrier.id_fiche }
            : courrier.id_fiche)
          : undefined
      };
      const formData = new FormData();
      formData.append('courrier', JSON.stringify(backendDTO));
      formData.append('file', file);
      const response = await axiosInstance.post('/api/courriers/creer-avec-fichier', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du courrier avec fichier');
    }
  },

  // Mettre à jour un courrier
  mettreAJour: async (id: number, courrier: CourrierUpdateDTO): Promise<Courrier> => {
    try {
      const response = await axiosInstance.put(`/api/courriers/${id}`, courrier);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du courrier');
    }
  },

  // Supprimer un courrier
  supprimer: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/courriers/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du courrier');
    }
  },

  // Télécharger un fichier joint
  telechargerFichier: async (courrierId: number, fichierId: number): Promise<Blob> => {
    try {
      const response = await axiosInstance.get(`/api/courriers/fichier/${fichierId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error('Erreur lors du téléchargement du fichier');
    }
  },

  // Upload d'un fichier pour un courrier existant
  uploadFile: async (id: number, file: File): Promise<{ message: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosInstance.post(`/api/courriers/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'upload du fichier');
    }
  },

  // ✅ Changer le statut d'un courrier (envoie l'id du statut)
  changerStatut: async (id: number, idStatut: number): Promise<Courrier> => {
    try {
      const response = await axiosInstance.put(`/api/courriers/${id}/statut`, { id_statut: idStatut });
      return response.data.courrier || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du changement de statut');
    }
  },
};