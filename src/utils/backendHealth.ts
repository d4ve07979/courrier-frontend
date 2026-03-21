/**
 * Utilitaires pour vérifier l'état du backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089';

export interface BackendHealthStatus {
  isHealthy: boolean;
  message: string;
  details?: {
    database: boolean;
    authentication: boolean;
    apis: boolean;
  };
}

/**
 * Vérifier si le backend est accessible et fonctionnel
 */
export const checkBackendHealth = async (): Promise<BackendHealthStatus> => {
  try {
    console.log('🔍 Vérification de l\'état du backend...');
    
    // Test de base - ping du serveur
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000) // Timeout de 5 secondes
    });

    if (response.ok) {
      const healthData = await response.json();
      console.log('✅ Backend accessible:', healthData);
      
      return {
        isHealthy: true,
        message: 'Backend accessible et fonctionnel',
        details: healthData
      };
    } else {
      console.warn('⚠️ Backend répond mais avec erreur:', response.status);
      return {
        isHealthy: false,
        message: `Backend répond avec erreur: ${response.status}`
      };
    }
  } catch (error: any) {
    console.error('❌ Backend non accessible:', error);
    
    let message = 'Backend non accessible';
    
    if (error.name === 'TimeoutError') {
      message = 'Timeout - Le backend met trop de temps à répondre';
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Erreur réseau - Vérifiez que le backend est démarré sur le port 8089';
    } else if (error.message?.includes('fetch')) {
      message = 'Impossible de se connecter au backend';
    }
    
    return {
      isHealthy: false,
      message
    };
  }
};

/**
 * Vérifier spécifiquement l'API d'authentification
 */
export const checkAuthAPI = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(3000)
    });
    
    return response.ok;
  } catch (error) {
    console.warn('⚠️ API d\'authentification non accessible');
    return false;
  }
};

/**
 * Afficher un message d'aide pour la configuration du backend
 */
export const getBackendSetupHelp = (): string[] => {
  return [
    '1. Démarrez le backend Spring Boot sur le port 8089',
    '2. Vérifiez que la base de données est accessible',
    '3. Créez l\'utilisateur admin via SQL :',
    '   INSERT INTO utilisateurs (nom_utilisateur, prenom_utilisateur, email_utilisateur, mot_de_passe, role_utilisateur, actif) VALUES (\'Admin\', \'System\', \'admin@inseed.tg\', \'$2a$10$hashedPassword\', \'ADMIN\', true);',
    '4. Remplacez $hashedPassword par le hash BCrypt de votre mot de passe',
    '5. Rechargez cette page'
  ];
};