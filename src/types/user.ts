
export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
  last_sign_in_at?: string;
}
