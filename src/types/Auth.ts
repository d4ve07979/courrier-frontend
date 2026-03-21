// Types correspondant exactement au backend Spring Boot
export type UserRole = 'ADMIN' | 'DG' | 'DIRECTION' | 'SECRETARIAT' | 'DIVISION' | 'SERVICES';

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  access_token: string;
  refresh_token: string;
  token_type: string;
  message?: string;
  utilisateur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: UserRole;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
  confirmationMotDePasse: string;
}

export interface DecodedToken {
  sub: string;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

export interface RoleInfo {
  code: string;
  authority: string;
  description: string;
}