export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_activity_events: {
        Row: {
          booking_id: string | null
          conversation_id: string | null
          created_at: string
          description: string
          event_source: string
          event_type: string
          id: string
          metadata: Json
          org_id: string
          outcome: string
        }
        Insert: {
          booking_id?: string | null
          conversation_id?: string | null
          created_at?: string
          description: string
          event_source: string
          event_type: string
          id?: string
          metadata?: Json
          org_id: string
          outcome: string
        }
        Update: {
          booking_id?: string | null
          conversation_id?: string | null
          created_at?: string
          description?: string
          event_source?: string
          event_type?: string
          id?: string
          metadata?: Json
          org_id?: string
          outcome?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_activity_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_content: {
        Row: {
          agent_system_prompt: string | null
          business_hours_text: string | null
          business_name: string
          business_phone: string | null
          closing_script: string | null
          created_at: string
          emergency_policy: string | null
          escalation_callback_promise: string | null
          escalation_transfer_rules: string | null
          escalation_voicemail_behavior: string | null
          greeting_script: string | null
          id: string
          intake_questions: Json
          last_published_at: string | null
          org_id: string
          pricing_guidance: string | null
          published_version: number
          scheduling_blackout_dates: string | null
          scheduling_intake_questions: string | null
          scheduling_job_duration_defaults: string | null
          scheduling_lead_time: string | null
          scheduling_required_fields: string | null
          service_area: string | null
          services_summary: string | null
          updated_at: string
        }
        Insert: {
          agent_system_prompt?: string | null
          business_hours_text?: string | null
          business_name?: string
          business_phone?: string | null
          closing_script?: string | null
          created_at?: string
          emergency_policy?: string | null
          escalation_callback_promise?: string | null
          escalation_transfer_rules?: string | null
          escalation_voicemail_behavior?: string | null
          greeting_script?: string | null
          id?: string
          intake_questions?: Json
          last_published_at?: string | null
          org_id: string
          pricing_guidance?: string | null
          published_version?: number
          scheduling_blackout_dates?: string | null
          scheduling_intake_questions?: string | null
          scheduling_job_duration_defaults?: string | null
          scheduling_lead_time?: string | null
          scheduling_required_fields?: string | null
          service_area?: string | null
          services_summary?: string | null
          updated_at?: string
        }
        Update: {
          agent_system_prompt?: string | null
          business_hours_text?: string | null
          business_name?: string
          business_phone?: string | null
          closing_script?: string | null
          created_at?: string
          emergency_policy?: string | null
          escalation_callback_promise?: string | null
          escalation_transfer_rules?: string | null
          escalation_voicemail_behavior?: string | null
          greeting_script?: string | null
          id?: string
          intake_questions?: Json
          last_published_at?: string | null
          org_id?: string
          pricing_guidance?: string | null
          published_version?: number
          scheduling_blackout_dates?: string | null
          scheduling_intake_questions?: string | null
          scheduling_job_duration_defaults?: string | null
          scheduling_lead_time?: string | null
          scheduling_required_fields?: string | null
          service_area?: string | null
          services_summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_content_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_appointment_rules: {
        Row: {
          business_hours: Json
          created_at: string
          default_duration_minutes: number
          id: string
          max_days_out: number
          min_lead_time_minutes: number
          org_id: string
          service_type_map: Json
          timezone: string
          travel_buffer_minutes: number
          updated_at: string
        }
        Insert: {
          business_hours?: Json
          created_at?: string
          default_duration_minutes?: number
          id?: string
          max_days_out?: number
          min_lead_time_minutes?: number
          org_id: string
          service_type_map?: Json
          timezone?: string
          travel_buffer_minutes?: number
          updated_at?: string
        }
        Update: {
          business_hours?: Json
          created_at?: string
          default_duration_minutes?: number
          id?: string
          max_days_out?: number
          min_lead_time_minutes?: number
          org_id?: string
          service_type_map?: Json
          timezone?: string
          travel_buffer_minutes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_appointment_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_bookings: {
        Row: {
          address: string
          conversation_id: string | null
          created_at: string
          customer_name: string
          email: string | null
          id: string
          jobber_client_id: string | null
          jobber_job_id: string | null
          jobber_request_id: string | null
          jobber_visit_id: string | null
          notes: string | null
          org_id: string
          phone: string
          service_type: string
          slot_end: string
          slot_start: string
          status: string
          updated_at: string
        }
        Insert: {
          address: string
          conversation_id?: string | null
          created_at?: string
          customer_name: string
          email?: string | null
          id?: string
          jobber_client_id?: string | null
          jobber_job_id?: string | null
          jobber_request_id?: string | null
          jobber_visit_id?: string | null
          notes?: string | null
          org_id: string
          phone: string
          service_type: string
          slot_end: string
          slot_start: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string
          conversation_id?: string | null
          created_at?: string
          customer_name?: string
          email?: string | null
          id?: string
          jobber_client_id?: string | null
          jobber_job_id?: string | null
          jobber_request_id?: string | null
          jobber_visit_id?: string | null
          notes?: string | null
          org_id?: string
          phone?: string
          service_type?: string
          slot_end?: string
          slot_start?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_bookings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tool_call_logs: {
        Row: {
          conversation_id: string | null
          created_at: string
          error: string | null
          id: string
          org_id: string
          request_payload: Json
          response_payload: Json | null
          status: string
          tool_name: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          org_id: string
          request_payload?: Json
          response_payload?: Json | null
          status?: string
          tool_name: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          org_id?: string
          request_payload?: Json
          response_payload?: Json | null
          status?: string
          tool_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tool_call_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_rules: {
        Row: {
          allowed_zip_codes: Json
          blackout_dates: Json
          business_hours: Json
          created_at: string
          id: string
          notes: string | null
          org_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          allowed_zip_codes?: Json
          blackout_dates?: Json
          business_hours?: Json
          created_at?: string
          id?: string
          notes?: string | null
          org_id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          allowed_zip_codes?: Json
          blackout_dates?: Json
          business_hours?: Json
          created_at?: string
          id?: string
          notes?: string | null
          org_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_events: {
        Row: {
          booking_request_id: string
          created_at: string
          event_payload: Json
          event_type: string
          id: string
          org_id: string
        }
        Insert: {
          booking_request_id: string
          created_at?: string
          event_payload?: Json
          event_type: string
          id?: string
          org_id: string
        }
        Update: {
          booking_request_id?: string
          created_at?: string
          event_payload?: Json
          event_type?: string
          id?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_events_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_requests: {
        Row: {
          address: string | null
          caller_phone: string | null
          channel: string
          created_at: string
          customer_email: string | null
          customer_name: string | null
          id: string
          jobber_client_id: string | null
          jobber_visit_id: string | null
          last_error: string | null
          org_id: string
          preferred_windows: Json | null
          raw_payload: Json | null
          scheduled_end: string | null
          scheduled_start: string | null
          service_key: string | null
          status: string
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          caller_phone?: string | null
          channel?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          jobber_client_id?: string | null
          jobber_visit_id?: string | null
          last_error?: string | null
          org_id: string
          preferred_windows?: Json | null
          raw_payload?: Json | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          service_key?: string | null
          status?: string
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          caller_phone?: string | null
          channel?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          jobber_client_id?: string | null
          jobber_visit_id?: string | null
          last_error?: string | null
          org_id?: string
          preferred_windows?: Json | null
          raw_payload?: Json | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          service_key?: string | null
          status?: string
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_kb: {
        Row: {
          active: boolean
          answer: string
          category: string | null
          created_at: string
          id: string
          org_id: string
          question: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          org_id: string
          question: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          org_id?: string
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faq_kb_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          assigned_user_id: string | null
          booking_request_id: string | null
          created_at: string
          id: string
          notes: string | null
          org_id: string
          priority: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_user_id?: string | null
          booking_request_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          org_id: string
          priority?: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string | null
          booking_request_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          org_id?: string
          priority?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "followups_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followups_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      gtm_market_zones: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          lead_score_multiplier: number
          name: string
          notes: string | null
          org_id: string
          priority: number
          target_monthly_leads: number | null
          updated_at: string
          zip_codes: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          lead_score_multiplier?: number
          name: string
          notes?: string | null
          org_id: string
          priority?: number
          target_monthly_leads?: number | null
          updated_at?: string
          zip_codes?: string[]
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          lead_score_multiplier?: number
          name?: string
          notes?: string | null
          org_id?: string
          priority?: number
          target_monthly_leads?: number | null
          updated_at?: string
          zip_codes?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "gtm_market_zones_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_jobber_accounts: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          jobber_account_id: string | null
          org_id: string
          refresh_token: string | null
          scopes: string[] | null
          status: string
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          jobber_account_id?: string | null
          org_id: string
          refresh_token?: string | null
          scopes?: string[] | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          jobber_account_id?: string | null
          org_id?: string
          refresh_token?: string | null
          scopes?: string[] | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_jobber_accounts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobber_connections: {
        Row: {
          connected_at: string | null
          created_at: string
          id: string
          jobber_account_id: string | null
          last_error: string | null
          org_id: string
          status: string
          updated_at: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          id?: string
          jobber_account_id?: string | null
          last_error?: string | null
          org_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          id?: string
          jobber_account_id?: string | null
          last_error?: string | null
          org_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobber_connections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ad_campaigns: {
        Row: {
          ad_type: string
          checked_items: Json
          created_at: string
          id: string
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          ad_type: string
          checked_items?: Json
          created_at?: string
          id?: string
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          ad_type?: string
          checked_items?: Json
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_ad_campaigns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      service_catalog: {
        Row: {
          active: boolean
          buffer_after_minutes: number
          buffer_before_minutes: number
          created_at: string
          default_duration_minutes: number
          display_name: string
          id: string
          jobber_service_type_id: string | null
          org_id: string
          service_key: string
        }
        Insert: {
          active?: boolean
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          created_at?: string
          default_duration_minutes?: number
          display_name: string
          id?: string
          jobber_service_type_id?: string | null
          org_id: string
          service_key: string
        }
        Update: {
          active?: boolean
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          created_at?: string
          default_duration_minutes?: number
          display_name?: string
          id?: string
          jobber_service_type_id?: string | null
          org_id?: string
          service_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_catalog_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_org_with_admin: { Args: { org_name: string }; Returns: string }
      is_org_admin: { Args: { _org_id: string }; Returns: boolean }
      is_org_member: { Args: { _org_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
