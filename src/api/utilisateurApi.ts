// src/api/utilisateurApi.ts
import axiosInstance from './axiosConfig';

export const utilisateurApi = {
  /**
   * ✅ CRÉATION SIMPLIFIÉE
   */
  async creerUtilisateur(userData: any): Promise<{ success: boolean; message: string; utilisateur?: any }> {
    try {
      console.log('📤 Envoi au backend (snake_case):', userData);
      
      const response = await axiosInstance.post('/api/utilisateurs/ajouter', userData);
      
      return {
        success: true,
        message: response.data.message || "✅ Utilisateur créé",
        utilisateur: response.data.utilisateur
      };
      
    } catch (error: any) {
      console.error('❌ Erreur création:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  /**
   * Récupérer tous les utilisateurs
   */
  async getAllUtilisateurs(): Promise<any[]> {
    try {
      const response = await axiosInstance.get('/api/utilisateurs/all');
      return response.data;
    } catch (error: any) {
      console.error('Erreur récupération utilisateurs:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs');
    }
  },

  /**
   * Mise à jour
   */
  async mettreAJourUtilisateur(id: number, updates: Partial<any>): Promise<any> {
    try {
      // Convertir camelCase en snake_case pour le backend
      const dataToSend: any = {};
      
      // Mapper les champs
      if (updates.nomUtilisateur !== undefined) dataToSend.nom_utilisateur = updates.nomUtilisateur;
      if (updates.nom_utilisateur !== undefined) dataToSend.nom_utilisateur = updates.nom_utilisateur;
      
      if (updates.prenomUtilisateur !== undefined) dataToSend.prenom_utilisateur = updates.prenomUtilisateur;
      if (updates.prenom_utilisateur !== undefined) dataToSend.prenom_utilisateur = updates.prenom_utilisateur;
      
      if (updates.emailUtilisateur !== undefined) dataToSend.email_utilisateur = updates.emailUtilisateur;
      if (updates.email_utilisateur !== undefined) dataToSend.email_utilisateur = updates.email_utilisateur;
      
      if (updates.roleUtilisateur !== undefined) dataToSend.role_utilisateur = updates.roleUtilisateur;
      if (updates.role_utilisateur !== undefined) dataToSend.role_utilisateur = updates.role_utilisateur;
      
      if (updates.sexe !== undefined) dataToSend.sexe = updates.sexe;
      if (updates.telephone !== undefined) dataToSend.telephone = updates.telephone;
      if (updates.bureau !== undefined) dataToSend.bureau = updates.bureau;
      if (updates.actif !== undefined) dataToSend.actif = updates.actif;
      
      // Gestion de la direction
      if (updates.direction) {
        const dirId = updates.direction.id_direction || updates.direction.idDirection;
        if (dirId) {
          dataToSend.direction = { id_direction: dirId };
        } else {
          dataToSend.direction = null;
        }
      }

      console.log('📤 Mise à jour (snake_case):', dataToSend);
      
      const response = await axiosInstance.put(`/api/utilisateurs/update/${id}`, dataToSend);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Erreur mise à jour:', error.response?.data || error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  /**
   * Suppression
   */
  async supprimerUtilisateur(id: number): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🗑️ Suppression de l'utilisateur ${id}...`);
      const response = await axiosInstance.delete(`/api/utilisateurs/delete/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur suppression:', error.response?.data || error);
      
      const errorData = error.response?.data;
      let message = 'Erreur lors de la suppression de l\'utilisateur';
      
      if (errorData?.message) {
        message = errorData.message;
      } else if (errorData?.includes('clé étrangère') || errorData?.includes('affectation')) {
        message = 'Impossible de supprimer cet utilisateur car il est associé à des affectations';
      }
      
      throw new Error(message);
    }
  },

  /**
   * ✅ NOUVEAU : Utilisateurs affectables (pour tous les utilisateurs authentifiés)
   * Utilise le nouvel endpoint public
   */
  async getUtilisateursAffectablesPublic(): Promise<any[]> {
    try {
      console.log('🔄 Appel à /api/utilisateurs/public/list...');
      const response = await axiosInstance.get('/api/utilisateurs/public/list');
      
      if (Array.isArray(response.data)) {
        console.log('✅ Tableau reçu,', response.data.length, 'utilisateurs');
        return response.data;
      }
      
      console.warn('⚠️ Format inattendu:', response.data);
      return [];
      
    } catch (error: any) {
      console.error('❌ Erreur chargement utilisateurs publics:', error);
      return []; // Retourner tableau vide pour éviter les crashes
    }
  },

  /**
   * ✅ NOUVEAU : Récupérer les utilisateurs par rôle (pour tous)
   */
  async getUtilisateursByRolePublic(role: string): Promise<any[]> {
    try {
      console.log(`🔄 Appel à /api/utilisateurs/public/role/${role}...`);
      const response = await axiosInstance.get(`/api/utilisateurs/public/role/${role}`);
      
      if (Array.isArray(response.data)) {
        console.log(`✅ ${response.data.length} utilisateur(s) avec le rôle ${role}`);
        return response.data;
      }
      
      return [];
      
    } catch (error: any) {
      console.error(`❌ Erreur chargement utilisateurs rôle ${role}:`, error);
      return [];
    }
  },

  /**
   * ✅ NOUVEAU : Récupérer les Directeurs Généraux (pour tous)
   */
  async getDirecteursGenerauxPublic(): Promise<any[]> {
    return this.getUtilisateursByRolePublic('DG');
  },

  /**
   * ✅ ANCIENNE MÉTHODE (conservée pour compatibilité)
   * Utilise /api/utilisateurs/list (réservé ADMIN)
   * @deprecated Utilisez getUtilisateursAffectablesPublic() à la place
   */
  async getUtilisateursAffectables(): Promise<any[]> {
    try {
      console.log('🔄 Appel à /api/utilisateurs/list...');
      const response = await axiosInstance.get('/api/utilisateurs/list');
      
      if (Array.isArray(response.data)) {
        console.log('✅ Tableau reçu,', response.data.length, 'utilisateurs');
        return response.data;
      }
      
      if (response.data.utilisateurs && Array.isArray(response.data.utilisateurs)) {
        console.log('✅ Utilisateurs trouvés dans .utilisateurs');
        return response.data.utilisateurs;
      }
      
      console.warn('⚠️ Format inattendu:', response.data);
      return [];
      
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      return []; // Retourner tableau vide au lieu de throw pour éviter les crashes
    }
  },

  /**
   * Réinitialiser le mot de passe
   */
  async reinitialiserMotDePasse(id: number): Promise<any> {
    try {
      const response = await axiosInstance.put(`/api/utilisateurs/${id}/reinitialiser-mot-de-passe`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur réinitialisation mot de passe:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la réinitialisation');
    }
  }
};