
export interface EscalationSettings {
  id: string;
  emails: string[];
  pending_threshold?: number;
  progress_threshold?: number;
  created_at?: string;
  updated_at?: string;
}
