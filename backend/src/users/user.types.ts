import { AppRole } from '../auth/auth.types';

export interface Profile {
  id: string;
  email: string;
  role: AppRole;
}
