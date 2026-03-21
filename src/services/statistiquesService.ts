import axios from 'axios';
import type { Statistiques } from '../types/Statistiques';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8097';

// Configuration axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class StatistiquesService {
  
  /**
   * Obtenir les statistiques globales
   */
  static async obtenirStatistiquesGlobales(periode?: string): Promise<Statistiques> {
    try {
      const response = await apiClient.get('api/statistiques/globales', {
        params: { periode }
      });
      return response.data;
    } catch (error) {
      console.warn('⚠️ Backend non disponible, utilisation de données par défaut');
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

  /**
   * Obtenir les statistiques par direction
   */
  static async obtenirStatistiquesParDirection(periode?: string): Promise<{ [key: string]: number }> {
    try {
      const response = await apiClient.get('api/statistiques/directions', {
        params: { periode }
      });
      return response.data;
    } catch (error) {
      console.warn('⚠️ Backend non disponible pour les statistiques par direction');
      return {};
    }
  }

  /**
   * Obtenir les statistiques par type de document
   * → Mise à jour : le backend retourne maintenant un format enrichi
   */
  static async obtenirStatistiquesParType(periode?: string): Promise<{ [key: string]: unknown }> {
    try {
      const response = await apiClient.get('api/statistiques/types', {
        params: { periode }
      });
      // Le backend retourne maintenant un format enrichi
      return response.data;
    } catch (error) {
      console.warn('⚠️ Backend non disponible pour les statistiques par type');
      return {};
    }
  }

  /**
   * Obtenir l'évolution mensuelle
   */
  static async obtenirEvolutionMensuelle(annee?: number): Promise<{ mois: string; entrants: number; sortants: number; }[]> {
    try {
      const response = await apiClient.get('api/statistiques/evolution', {
        params: { annee }
      });
      return response.data;
    } catch (error) {
      console.warn('⚠️ Backend non disponible pour l\'évolution mensuelle');
      return [];
    }
  }

  /**
   * Obtenir les délais de traitement
   */
  static async obtenirDelaisTraitement(periode?: string): Promise<{
    delaiMoyen: number;
    courriersEnRetard: number;
    repartitionDelais: { tranche: string; nombre: number; }[];
  }> {
    try {
      const response = await apiClient.get('api/statistiques/delais', {
        params: { periode }
      });
      return response.data;
    } catch (error) {
      console.warn('⚠️ Backend non disponible pour les délais de traitement');
      return {
        delaiMoyen: 0,
        courriersEnRetard: 0,
        repartitionDelais: []
      };
    }
  }

  /**
   * Obtenir les courriers par statut avec détails
   */
  static async obtenirRepartitionStatuts(periode?: string): Promise<{
    statut: string;
    nombre: number;
    pourcentage: number;
    evolution: number;
  }[]> {
    try {
      const response = await apiClient.get('api/statistiques/statuts', {
        params: { periode }
      });
      return response.data;
    } catch (error) {
      console.warn('⚠️ Backend non disponible pour la répartition des statuts');
      return [];
    }
  }

  /**
   * Obtenir les activités récentes
   */
  static async obtenirActivitesRecentes(limite: number = 10): Promise<{
    id: number;
    type: string;
    courrier: string;
    utilisateur: string;
    direction?: string;
    dateAction: string;
    description: string;
  }[]> {
    try {
      const response = await apiClient.get('api/statistiques/activites', {
        params: { limite }
      });
      return response.data;
    } catch (error) {
      console.warn('⚠️ Backend non disponible pour les activités récentes');
      return [];
    }
  }
}