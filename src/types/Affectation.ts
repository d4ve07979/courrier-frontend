import type { Courrier } from './Courrier';
import type { Direction } from './Direction';
import type { Utilisateur } from './Utilisateur';

export interface Affectation {
  id: number;
  courrier: Courrier;
  directionSource?: Direction;
  directionDestination: Direction;
  observations?: string;
  dateAffectation: string;
  dateReception?: string;
  affectePar: Utilisateur;
  receptionneParNom?: string;
}