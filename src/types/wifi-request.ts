
export type RequestStatus = "pending" | "in-progress" | "completed" | "escalated";

export interface WifiRequest {
  id: string;
  name: string;
  email: string;
  room_number: string;
  device_type: string;
  issue_type: string;
  description: string | null;
  status: RequestStatus;
  created_at: Date;
  updated_at: string;
  was_escalated?: boolean;
  comments?: { text: string; timestamp: Date; user: string }[];
}
