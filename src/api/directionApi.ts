// src/api/directionApi.ts
import axiosInstance from './axiosConfig';
import type { Direction } from '../types/Direction';
import type { Courrier } from '../types/Courrier';

export const directionApi = {
  /**
   * Récupérer toutes les directions avec mapping
   */
  getAll: async (): Promise<Direction[]> => {
    const response = await axiosInstance.get('/api-directions/list');
    const rawData = response.data;
    
    console.log('📥 Directions brutes:', rawData);
    
    // Mapping simple et fiable
    return rawData.map((dir: any, index: number) => {
      // Essayer toutes les propriétés possibles pour l'ID
      const id = dir.id_direction || dir.id || (index + 1);
      const nom = dir.nomDirection || dir.nom || `Direction ${id}`;
      
      return {
        id: id,
        nom: nom,
        code: (nom || 'DIR').substring(0, 3).toUpperCase(),
        actif: true,
        description: dir.descriptionDirection || dir.description || '',
        // Propriétés originales pour référence
        id_direction: dir.id_direction,
        nomDirection: dir.nomDirection,
        descriptionDirection: dir.descriptionDirection,
        responsable: dir.responsable,
        contact_telephone: dir.contact_telephone,
        email_direction: dir.email_direction,
      };
    });
  },

  /**
   * Récupérer une direction par ID
   */
  getById: async (id: number): Promise<Direction> => {
    const response = await axiosInstance.get(`/api-directions/${id}`);
    const dir = response.data;
    
    return {
      id: dir.id_direction || dir.id || id,
      nom: dir.nomDirection || dir.nom || `Direction ${id}`,
      code: (dir.nomDirection || dir.nom || 'DIR').substring(0, 3).toUpperCase(),
      actif: true,
      description: dir.descriptionDirection || dir.description || '',
      id_direction: dir.id_direction,
      nomDirection: dir.nomDirection,
      descriptionDirection: dir.descriptionDirection,
      responsable: dir.responsable,
      contact_telephone: dir.contact_telephone,
      email_direction: dir.email_direction,
    };
  },

  /**
   * Créer une nouvelle direction
   */
  create: async (direction: Partial<Direction>): Promise<Direction> => {
    const dataToSend = {
      nomDirection: direction.nom,
      descriptionDirection: direction.description,
      ...direction
    };
    
    const response = await axiosInstance.post('/api-directions/ajouter', dataToSend);
    const created = response.data;
    
    return {
      id: created.id_direction || created.id,
      nom: created.nomDirection || created.nom,
      code: (created.nomDirection || created.nom || 'DIR').substring(0, 3).toUpperCase(),
      actif: true,
      description: created.descriptionDirection || created.description || '',
      id_direction: created.id_direction,
      nomDirection: created.nomDirection,
      descriptionDirection: created.descriptionDirection,
      responsable: created.responsable,
      contact_telephone: created.contact_telephone,
      email_direction: created.email_direction,
    };
  },

  /**
   * Mettre à jour une direction
   */
  update: async (id: number, direction: Partial<Direction>): Promise<Direction> => {
    const dataToSend = {
      nomDirection: direction.nom,
      descriptionDirection: direction.description,
      ...direction
    };
    
    const response = await axiosInstance.put(`/api-directions/update/${id}`, dataToSend);
    const updated = response.data;
    
    return {
      id: updated.id_direction || updated.id || id,
      nom: updated.nomDirection || updated.nom,
      code: (updated.nomDirection || updated.nom || 'DIR').substring(0, 3).toUpperCase(),
      actif: true,
      description: updated.descriptionDirection || updated.description || '',
      id_direction: updated.id_direction,
      nomDirection: updated.nomDirection,
      descriptionDirection: updated.descriptionDirection,
      responsable: updated.responsable,
      contact_telephone: updated.contact_telephone,
      email_direction: updated.email_direction,
    };
  },

  /**
   * Supprimer une direction
   */
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api-directions/delete/${id}`);
  },

  /**
   * Récupérer les courriers d'une direction
   */
  getCourriers: async (id: number): Promise<Courrier[]> => {
    const response = await axiosInstance.get(`/api-directions/${id}/courriers`);
    return response.data;
  },
};