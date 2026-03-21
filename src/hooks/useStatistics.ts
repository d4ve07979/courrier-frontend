import { useState, useEffect } from 'react';
import { statistiquesApi } from '../api/statistiquesApi';
import type { Statistiques } from '../types/Statistiques';
import { apiLogger } from '../config/api';

export const useStatistics = (period?: string) => {
  const [stats, setStats] = useState<Statistiques | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      apiLogger.info(`Chargement des statistiques - Période: ${period || 'global'}`);
      
      const data = await statistiquesApi.getGlobal();
      setStats(data);
      
      apiLogger.info('Statistiques chargées avec succès');
    } catch (err) {
      const errorMessage = 'Les données de démonstration sont affichées';
      setError(errorMessage);
      apiLogger.warn(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [period]);

  return {
    stats,
    loading,
    error,
    refresh: () => loadStats(true)
  };
};