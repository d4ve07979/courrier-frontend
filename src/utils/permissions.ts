// src/utils/permissions.ts
export const ROLES = {
  ADMIN: 'ADMIN',
  DG: 'DG',
  SECRETARIAT: 'SECRETARIAT',
  DIRECTION: 'DIRECTION',
  DIVISION: 'DIVISION',
  SERVICES: 'SERVICES'
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const hasPermission = (userRole: string | undefined, allowedRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as UserRole);
};