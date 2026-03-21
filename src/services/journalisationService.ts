import axios from 'axios';
import type { Journalisation, ActionType } from '../types/Journalisation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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

export class JournalisationService {
  
  /**
   * Enregistrer une action dans le journal
   */
  static async enregistrerAction(data: {
    action: ActionType;
    entite: string;
    entiteId: number;
    details?: string;
  }): Promise<void> {
    try {
      await apiClient.post('/journalisation/actions', {
        ...data,
        dateAction: new Date().toISOString(),
        ipAddress: await JournalisationService.obtenirAdresseIP()
      });
    } catch (error) {
      console.warn('Impossible d\'enregistrer l\'action dans le journal:', error);
      // Enregistrer localement en cas d'échec
      JournalisationService.enregistrerLocalement(data);
    }
  }

  /**
   * Obtenir l'historique des actions
   */
  static async obtenirHistorique(params: {
    page?: number;
    taille?: number;
    utilisateurId?: number;
    action?: ActionType;
    entite?: string;
    dateDebut?: string;
    dateFin?: string;
  } = {}): Promise<{
    actions: Journalisation[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await apiClient.get('/journalisation/historique', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique');
      throw new Error('Impossible de récupérer l\'historique. Vérifiez que le backend est démarré.');
    }
  }

  /**
   * Obtenir les statistiques d'audit
   */
  static async obtenirStatistiquesAudit(periode?: string): Promise<{
    totalActions: number;
    actionsParType: { [key: string]: number };
    utilisateursActifs: number;
    connexionsParJour: { date: string; connexions: number; }[];
    actionsRecentes: Journalisation[];
  }> {
    try {
      const response = await apiClient.get('/journalisation/statistiques', {
        params: { periode }
      });
      return response.data;
    } catch (error) {
      return {
        totalActions: 1247,
        actionsParType: {
          'CONNEXION': 324,
          'CREATION': 156,
          'MODIFICATION': 89,
          'AFFECTATION': 67,
          'VALIDATION': 45,
          'ENVOI': 34,
          'CONSULTATION': 532
        },
        utilisateursActifs: 12,
        connexionsParJour: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          connexions: Math.floor(Math.random() * 20) + 5
        })).reverse(),
        actionsRecentes: JournalisationService.genererActionsRecentes()
      };
    }
  }

  /**
   * Obtenir les connexions d'un utilisateur
   */
  static async obtenirConnexionsUtilisateur(utilisateurId: number, limite: number = 10): Promise<{
    id: number;
    dateConnexion: string;
    ipAddress: string;
    userAgent: string;
    succes: boolean;
  }[]> {
    try {
      const response = await apiClient.get(`/journalisation/connexions/${utilisateurId}`, {
        params: { limite }
      });
      return response.data;
    } catch (error) {
      // Données mockées
      return Array.from({ length: limite }, (_, i) => ({
        id: i + 1,
        dateConnexion: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        succes: Math.random() > 0.1
      }));
    }
  }

  /**
   * Rechercher dans les logs d'audit
   */
  static async rechercherLogs(criteres: {
    texte?: string;
    utilisateur?: string;
    action?: ActionType;
    dateDebut?: string;
    dateFin?: string;
    page?: number;
    taille?: number;
  }): Promise<{
    logs: Journalisation[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await apiClient.post('/journalisation/rechercher', criteres);
      return response.data;
    } catch (error) {
      return {
        logs: [],
        total: 0,
        page: 0,
        totalPages: 0
      };
    }
  }

  /**
   * Exporter les logs d'audit
   */
  static async exporterLogs(criteres: {
    dateDebut?: string;
    dateFin?: string;
    format?: 'json' | 'csv' | 'pdf';
  }): Promise<Blob> {
    try {
      const response = await apiClient.post('/journalisation/exporter', criteres, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      // Générer un export factice
      const data = {
        criteres,
        dateExport: new Date().toISOString(),
        logs: JournalisationService.genererActionsRecentes()
      };
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    }
  }

  // === MÉTHODES UTILITAIRES ===

  /**
   * Obtenir l'adresse IP du client
   */
  private static async obtenirAdresseIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'IP non disponible';
    }
  }

  /**
   * Enregistrer une action localement en cas d'échec API
   */
  private static enregistrerLocalement(data: any): void {
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    logs.push({
      ...data,
      id: Date.now(),
      dateAction: new Date().toISOString(),
      utilisateur: JSON.parse(localStorage.getItem('user') || '{}')
    });
    
    // Garder seulement les 100 dernières actions
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('audit_logs', JSON.stringify(logs));
  }

  /**
   * Générer un historique mocké
   */
  private static genererHistoriqueMocke(params: any): any {
    const actions = JournalisationService.genererActionsRecentes(params.taille || 20);
    return {
      actions,
      total: 1247,
      page: params.page || 0,
      totalPages: Math.ceil(1247 / (params.taille || 20))
    };
  }

  /**
   * Générer des actions récentes mockées
   */
  private static genererActionsRecentes(nombre: number = 10): Journalisation[] {
    const actions: ActionType[] = ['CREATION', 'MODIFICATION', 'AFFECTATION', 'VALIDATION', 'ENVOI', 'CONSULTATION', 'CONNEXION'];
    const entites = ['Courrier', 'Utilisateur', 'Direction', 'Affectation'];
    const utilisateurs = ['Jean Dupont', 'Marie Martin', 'Pierre Lambert', 'Sophie Durand', 'Ahmed Hassan'];

    return Array.from({ length: nombre }, (_, i) => ({
      id: i + 1,
      action: actions[Math.floor(Math.random() * actions.length)],
      entite: entites[Math.floor(Math.random() * entites.length)],
      entiteId: Math.floor(Math.random() * 1000) + 1,
      utilisateur: {
        id: Math.floor(Math.random() * 5) + 1,
        nom: utilisateurs[Math.floor(Math.random() * utilisateurs.length)].split(' ')[1],
        prenom: utilisateurs[Math.floor(Math.random() * utilisateurs.length)].split(' ')[0],
        email: 'user@inseed.td',
        role: 'AGENT' as any,
        actif: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      details: `Action ${actions[Math.floor(Math.random() * actions.length)]} effectuée`,
      dateAction: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`
    }));
  }

  // === MÉTHODES DE CONVENANCE ===

  /**
   * Enregistrer une connexion
   */
  static async enregistrerConnexion(succes: boolean = true): Promise<void> {
    await JournalisationService.enregistrerAction({
      action: 'CONNEXION',
      entite: 'Utilisateur',
      entiteId: JSON.parse(localStorage.getItem('user') || '{}').id || 0,
      details: succes ? 'Connexion réussie' : 'Tentative de connexion échouée'
    });
  }

  /**
   * Enregistrer une déconnexion
   */
  static async enregistrerDeconnexion(): Promise<void> {
    await JournalisationService.enregistrerAction({
      action: 'DECONNEXION',
      entite: 'Utilisateur',
      entiteId: JSON.parse(localStorage.getItem('user') || '{}').id || 0,
      details: 'Déconnexion'
    });
  }

  /**
   * Enregistrer une création de courrier
   */
  static async enregistrerCreationCourrier(courrierId: number, type: string): Promise<void> {
    await JournalisationService.enregistrerAction({
      action: 'CREATION',
      entite: 'Courrier',
      entiteId: courrierId,
      details: `Création d'un courrier ${type}`
    });
  }

  /**
   * Enregistrer une affectation
   */
  static async enregistrerAffectation(courrierId: number, directions: string[]): Promise<void> {
    await JournalisationService.enregistrerAction({
      action: 'AFFECTATION',
      entite: 'Courrier',
      entiteId: courrierId,
      details: `Affectation aux directions: ${directions.join(', ')}`
    });
  }

  /**
   * Enregistrer une validation
   */
  static async enregistrerValidation(courrierId: number): Promise<void> {
    await JournalisationService.enregistrerAction({
      action: 'VALIDATION',
      entite: 'Courrier',
      entiteId: courrierId,
      details: 'Validation du traitement'
    });
  }

  /**
   * Enregistrer un envoi
   */
  static async enregistrerEnvoi(courrierId: number, moyen: string): Promise<void> {
    await JournalisationService.enregistrerAction({
      action: 'ENVOI',
      entite: 'Courrier',
      entiteId: courrierId,
      details: `Envoi par ${moyen}`
    });
  }

  /**
   * Enregistrer une consultation
   */
  static async enregistrerConsultation(entite: string, entiteId: number): Promise<void> {
    await JournalisationService.enregistrerAction({
      action: 'CONSULTATION',
      entite,
      entiteId,
      details: `Consultation de ${entite} #${entiteId}`
    });
  }
}