export interface Statistiques {
  totalCourriers: number;
  courriersEnAttente: number;
  courriersTraites: number;
  courriersArchives: number;
  courriersClasses: number; // Dossiers sans réponse requise
  courriersEntrants: number;
  courriersSortants: number;
  tauxTraitement: number;
  
  // Répartition par type de document
  repartitionParType: { [key: string]: number };
  
  // Répartition par direction/service
  repartitionParDirection: { [key: string]: number };
  repartitionParService: { [key: string]: number };
  
  // Délais de traitement
  delaiMoyenTraitement: number;
  courriersEnRetard: number;
  
  // Statistiques temporelles
  evolutionMensuelle: { mois: string; entrants: number; sortants: number; }[];
}