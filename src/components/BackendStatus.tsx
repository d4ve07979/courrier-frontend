import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, WifiOff } from 'lucide-react';

interface Props {
  onRetry?: () => void;
  showRetryButton?: boolean;
}

export const BackendStatus: React.FC<Props> = ({ onRetry, showRetryButton = true }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérifier le statut du backend
    checkBackendStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkBackendStatus = async () => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8097';
    const paths = ['/api/health', '/actuator/health'];
    try {
      setBackendStatus('checking');
      for (const p of paths) {
        try {
          const res = await fetch(`${base}${p}`, { method: 'GET', credentials: 'include' });
          if (res.ok || res.status === 401 || res.status === 403) {
            setBackendStatus('online');
            return;
          }
        } catch {}
      }
      setBackendStatus('offline');
    } catch {
      setBackendStatus('offline');
    }
  };

  const handleRetry = () => {
    checkBackendStatus();
    onRetry?.();
  };

  if (!isOnline) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-red-400" />
          <div>
            <h3 className="text-red-400 font-medium">Pas de connexion Internet</h3>
            <p className="text-red-300 text-sm">Vérifiez votre connexion réseau</p>
          </div>
        </div>
      </div>
    );
  }

  if (backendStatus === 'offline') {
    return (
      <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="text-orange-400 font-medium">Backend non disponible</h3>
              <p className="text-orange-300 text-sm">
                Le serveur Spring Boot n'est pas accessible. Vérifiez qu'il est démarré sur {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8097'}.
              </p>
            </div>
          </div>
          {showRetryButton && (
            <button
              onClick={handleRetry}
              className="px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>
          )}
        </div>
      </div>
    );
  }

  if (backendStatus === 'checking') {
    return (
      <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
          <div>
            <h3 className="text-blue-400 font-medium">Vérification du backend...</h3>
            <p className="text-blue-300 text-sm">Connexion au serveur en cours</p>
          </div>
        </div>
      </div>
    );
  }

  if (backendStatus === 'online') {
    return (
      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <div>
            <h3 className="text-green-400 font-medium">Backend connecté</h3>
            <p className="text-green-300 text-sm">Toutes les fonctionnalités sont disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};