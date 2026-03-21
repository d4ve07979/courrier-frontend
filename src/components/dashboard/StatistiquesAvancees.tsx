import React, { useState, useEffect } from 'react';
import { 
  Clock, BarChart3, Users, FileText, Calendar,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { StatistiquesService } from '../../services/statistiquesService';

interface Props {
  periode: string;
}

export const StatistiquesAvancees: React.FC<Props> = ({ periode }) => {
  const [repartitionDirections, setRepartitionDirections] = useState<{ [key: string]: number }>({});
  const [repartitionTypes, setRepartitionTypes] = useState<{ [key: string]: any }>({});
  const [evolutionMensuelle, setEvolutionMensuelle] = useState<{ mois: string; entrants: number; sortants: number; }[]>([]);
  const [anneeAffichee, setAnneeAffichee] = useState<number>(new Date().getFullYear());
  const [delaisTraitement, setDelaisTraitement] = useState<any>(null);
  const [repartitionStatuts, setRepartitionStatuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerStatistiques();
  }, [periode]);

  const chargerStatistiques = async () => {
    try {
      setLoading(true);

      // Calcul de l'année intelligente pour l'évolution mensuelle
      const dateActuelle = new Date();
      const anneeCourante = dateActuelle.getFullYear();
      const moisCourant = dateActuelle.getMonth(); // 0 = janvier
      const anneeEvolution = moisCourant === 0 ? anneeCourante - 1 : anneeCourante;

      const [directions, types, evolution, delais, statuts] = await Promise.all([
        StatistiquesService.obtenirStatistiquesParDirection(periode),
        StatistiquesService.obtenirStatistiquesParType(periode),
        StatistiquesService.obtenirEvolutionMensuelle(anneeEvolution),
        StatistiquesService.obtenirDelaisTraitement(periode),
        StatistiquesService.obtenirRepartitionStatuts(periode)
      ]);

      setRepartitionDirections(directions);
      setRepartitionTypes(types);
      setEvolutionMensuelle(evolution);
      setAnneeAffichee(anneeEvolution); // Pour afficher dans le titre
      setDelaisTraitement(delais);
      setRepartitionStatuts(statuts);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEvolutionIcon = (evolution: number) => {
    if (evolution > 0) return <ArrowUp className="w-3 h-3 text-green-400" />;
    if (evolution < 0) return <ArrowDown className="w-3 h-3 text-red-400" />;
    return <Minus className="w-3 h-3 text-slate-400" />;
  };

  const getEvolutionColor = (evolution: number) => {
    if (evolution > 0) return 'text-green-400';
    if (evolution < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const getStatutLabel = (statut: string) => {
    const labels = {
      'EN_ATTENTE': 'En attente',
      'AFFECTE': 'Affecté',
      'EN_TRAITEMENT': 'En traitement',
      'TRAITE': 'Traité',
      'VALIDE': 'Validé',
      'ENVOYE': 'Envoyé',
      'CLASSE': 'Classé'
    };
    return labels[statut as keyof typeof labels] || statut;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'DEMANDE': 'Demandes',
      'FACTURE': 'Factures',
      'RAPPORT': 'Rapports',
      'COURRIER_OFFICIEL': 'Courriers officiels',
      'INVITATION': 'Invitations',
      'AUTRE': 'Autres'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-3 bg-slate-700 rounded"></div>
                <div className="h-3 bg-slate-700 rounded w-5/6"></div>
                <div className="h-3 bg-slate-700 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Répartition par Direction */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Répartition par Direction</h3>
        </div>
        
        <div className="space-y-3">
          {Object.entries(repartitionDirections)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6)
            .map(([direction, nombre]) => {
              const total = Object.values(repartitionDirections).reduce((sum, val) => sum + val, 0);
              const pourcentage = total > 0 ? (nombre / total) * 100 : 0;
              
              return (
                <div key={direction} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300 truncate">{direction}</span>
                      <span className="text-sm font-medium text-white">{nombre}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${pourcentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Répartition par Type */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Types de Documents</h3>
        </div>
        
        <div className="space-y-3">
          {Object.entries(repartitionTypes)
            .sort(([,a], [,b]) => {
              const countA = typeof a === 'object' && a !== null && 'nombre' in a ? a.nombre : a;
              const countB = typeof b === 'object' && b !== null && 'nombre' in b ? b.nombre : b;
              return countB - countA;
            })
            .map(([type, data]) => {
              const nombre = typeof data === 'object' && data !== null && 'nombre' in data 
                ? data.nombre 
                : data as number;

              const libelle = typeof data === 'object' && data !== null && 'libelle' in data 
                ? data.libelle 
                : getTypeLabel(type);

              const total = Object.entries(repartitionTypes).reduce((sum, [, d]) => {
                const val = typeof d === 'object' && d !== null && 'nombre' in d ? d.nombre : d;
                return sum + (val as number);
              }, 0);

              const pourcentage = total > 0 ? (nombre / total) * 100 : 0;

              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">{libelle}</span>
                      <span className="text-sm font-medium text-white">{nombre}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${pourcentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}

          {Object.keys(repartitionTypes).length === 0 && (
            <p className="text-center text-slate-500 py-4">Aucune donnée disponible</p>
          )}
        </div>
      </div>

      {/* Délais de Traitement */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Délais de Traitement</h3>
        </div>
        
        {delaisTraitement && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <div className="text-2xl font-bold text-orange-400">{delaisTraitement.delaiMoyen}</div>
                <div className="text-xs text-slate-400">jours en moyenne</div>
              </div>
              <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{delaisTraitement.courriersEnRetard}</div>
                <div className="text-xs text-slate-400">en retard</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {delaisTraitement.repartitionDelais?.map((tranche: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{tranche.tranche}</span>
                  <span className="text-white font-medium">{tranche.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Évolution Mensuelle → avec année dans le titre */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 lg:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">
            Évolution Mensuelle {anneeAffichee}
          </h3>
        </div>
        
        <div className="space-y-3">
          {evolutionMensuelle.slice(-6).map((mois, index) => {
            const maxValue = Math.max(...evolutionMensuelle.map(m => Math.max(m.entrants, m.sortants))) || 1;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 w-20">{mois.mois}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-purple-400">E: {mois.entrants}</span>
                    <span className="text-blue-400">S: {mois.sortants}</span>
                  </div>
                </div>
                
                <div className="flex gap-1 h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-l"
                    style={{ width: `${(mois.entrants / maxValue) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-r"
                    style={{ width: `${(mois.sortants / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-sm text-slate-300">Entrants</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-slate-300">Sortants</span>
          </div>
        </div>
      </div>

      {/* Répartition par Statut avec Évolution */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Statuts avec Évolution</h3>
        </div>
        
        <div className="space-y-3">
          {repartitionStatuts.map((statut, index) => (
            <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">{getStatutLabel(statut.statut)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{statut.nombre}</span>
                  <div className={`flex items-center gap-1 ${getEvolutionColor(statut.evolution)}`}>
                    {getEvolutionIcon(statut.evolution)}
                    <span className="text-xs">{Math.abs(statut.evolution)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="h-1 bg-slate-600 rounded-full flex-1 mr-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 transition-all duration-500"
                    style={{ width: `${statut.pourcentage}%` }}
                  ></div>
                </div>
                <span className="text-slate-400">{statut.pourcentage.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};