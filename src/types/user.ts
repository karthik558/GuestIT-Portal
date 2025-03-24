
export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
  last_sign_in_at?: string;
  first_name?: string;
  last_name?: string;
  team?: string;
  can_escalate?: boolean;
  escalation_emails?: string[];
}

export interface AssignmentProps {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team?: string;
  can_escalate: boolean;
}
