import { apiClient } from './apiClient';
import { API_CONFIG, apiLogger } from '../config/api';
import type { Statistiques } from '../types/Statistiques';

// Données mockées réalistes
const generateMockStats = (): Statistiques => {
  const baseStats = {
    totalCourriers: Math.floor(Math.random() * 200) + 100,
    courriersEnAttente: Math.floor(Math.random() * 30) + 10,
    courriersTraites: Math.floor(Math.random() * 100) + 50,
    courriersArchives: Math.floor(Math.random() * 80) + 20,
    courriersEntrants: Math.floor(Math.random() * 120) + 40,
    courriersSortants: Math.floor(Math.random() * 100) + 30,
  };

  return {
    ...baseStats,
    tauxTraitement: Math.round((baseStats.courriersTraites / baseStats.totalCourriers) * 100)
  };
};

let mockStats = generateMockStats();

export const statistiquesApi = {
  async getGlobal(): Promise<Statistiques> {
    try {
      apiLogger.info('🔄 Récupération des statistiques depuis le backend');
      const response = await apiClient.get('/statistiques/global');
      return response.data;
    } catch (error) {
      apiLogger.warn('⚠️ Backend non disponible, retour de statistiques par défaut');
      return {
        totalCourriers: 0,
        courriersEnAttente: 0,
        courriersTraites: 0,
        courriersArchives: 0,
        courriersEntrants: 0,
        courriersSortants: 0,
        tauxTraitement: 0
      };
    }
  },
  
  async getByPeriod(period: string): Promise<Statistiques> {
    try {
      const response = await apiClient.get(`/statistiques/period?period=${period}`);
      return response.data;
    } catch (error) {
      apiLogger.warn(`⚠️ Backend non disponible pour la période: ${period}`);
      return {
        totalCourriers: 0,
        courriersEnAttente: 0,
        courriersTraites: 0,
        courriersArchives: 0,
        courriersEntrants: 0,
        courriersSortants: 0,
        tauxTraitement: 0
      };
    }
  }
};