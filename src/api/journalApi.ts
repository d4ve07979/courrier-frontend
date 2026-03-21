
import axiosInstance from './axiosConfig';
import { Journalisation, ActionType } from '../types/Journalisation';

export interface JournalSearchParams {
  action?: ActionType;
  entite?: string;
  utilisateurId?: number;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  size?: number;
}

export const journalApi = {
  getAll: async (params?: JournalSearchParams): Promise<{ content: Journalisation[]; totalElements: number }> => {
    const response = await axiosInstance.get('/journal', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Journalisation> => {
    const response = await axiosInstance.get(`/journal/${id}`);
    return response.data;
  },
};

