// src/api/notificationApi.ts
import axiosInstance from './axiosConfig';

export interface Notification {
  id: number;
  message: string;
  dateEnvoi: string;
  lue: boolean;
  idCourrier?: number;
}

export const notificationApi = {
  getMesNotifications: async (): Promise<{
    notifications: Notification[];
    total: number;
    non_lues: number;
  }> => {
    const response = await axiosInstance.get('/api/notifications/mes-notifications');
    // Si le backend retourne un objet avec .notifications
    if (response.data && response.data.notifications) {
      return {
        notifications: response.data.notifications,
        total: response.data.total || response.data.notifications.length,
        non_lues: response.data.non_lues || 0
      };
    }
    // Sécurité si jamais il retourne directement un tableau
    return {
      notifications: Array.isArray(response.data) ? response.data : [],
      total: Array.isArray(response.data) ? response.data.length : 0,
      non_lues: 0
    };
  },

  marquerCommeLue: async (id: number): Promise<void> => {
    await axiosInstance.put(`/api/notifications/${id}/lire`);
  },

  marquerToutCommeLu: async (): Promise<void> => {
    await axiosInstance.put('/api/notifications/tout-lire');
  },
};