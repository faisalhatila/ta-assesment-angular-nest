export type AppRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: AppRole;
  token: string;
}
