export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      escalation_settings: {
        Row: {
          created_at: string
          emails: Json | null
          id: string
          pending_threshold: number | null
          progress_threshold: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          emails?: Json | null
          id?: string
          pending_threshold?: number | null
          progress_threshold?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          emails?: Json | null
          id?: string
          pending_threshold?: number | null
          progress_threshold?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          can_escalate: boolean | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          team: string | null
          updated_at: string
        }
        Insert: {
          can_escalate?: boolean | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          team?: string | null
          updated_at?: string
        }
        Update: {
          can_escalate?: boolean | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          team?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      request_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          request_id: string
          user_name: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          request_id: string
          user_name: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          request_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_comments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "wifi_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      wifi_requests: {
        Row: {
          created_at: string
          description: string | null
          device_type: Database["public"]["Enums"]["device_type"]
          email: string
          id: string
          issue_type: Database["public"]["Enums"]["issue_type"]
          name: string
          room_number: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          was_escalated: boolean | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          device_type: Database["public"]["Enums"]["device_type"]
          email: string
          id?: string
          issue_type: Database["public"]["Enums"]["issue_type"]
          name: string
          room_number: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          was_escalated?: boolean | null
        }
        Update: {
          created_at?: string
          description?: string | null
          device_type?: Database["public"]["Enums"]["device_type"]
          email?: string
          id?: string
          issue_type?: Database["public"]["Enums"]["issue_type"]
          name?: string
          room_number?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          was_escalated?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      setup_escalation_cron: {
        Args: {
          function_url: string
          auth_key: string
        }
        Returns: string
      }
    }
    Enums: {
      device_type: "smartphone" | "laptop" | "tablet" | "other"
      issue_type: "connect" | "slow" | "disconnect" | "login" | "other"
      request_status: "pending" | "in-progress" | "completed" | "escalated"
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
