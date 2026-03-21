import { createContext } from 'react';

export type UserRole = 'ADMIN' | 'DIRECTEUR' | 'SECRETAIRE' | 'AGENT';

export interface Utilisateur {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  directionId?: number;
  telephone?: string;
}

export interface AuthContextType {
  user: Utilisateur | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);