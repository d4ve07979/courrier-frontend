import type { Courrier } from './Courrier';
import type { Direction } from './Direction';
import type { Utilisateur } from './Utilisateur';

export interface FicheTransmission {
  id: number;
  numero: string;
  courrier: Courrier;
  directionSource?: Direction;
  directionsDestination: Direction[];
  observations?: string;
  dateCreation: string;
  creePar: Utilisateur;
  dateTransmission?: string;
  accuseReception?: AccuseReception[];
}

export interface AccuseReception {
  id: number;
  ficheTransmissionId: number;
  direction: Direction;
  receptionnePar?: string;
  dateReception?: string;
  observations?: string;
}