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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          read_at: string | null
          related_entity_id: string | null
          related_entity_type: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
        }
        Relationships: []
      }
      agent_options: {
        Row: {
          agency_name: string | null
          agent_email: string
          agent_name: string
          agent_phone: string | null
          asking_price: string | null
          created_at: string
          demand_id: string
          docusign_envelope_id: string | null
          id: string
          internal_note: string | null
          option_reference: string | null
          property_address: string | null
          property_details: string | null
          property_reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agency_name?: string | null
          agent_email: string
          agent_name: string
          agent_phone?: string | null
          asking_price?: string | null
          created_at?: string
          demand_id: string
          docusign_envelope_id?: string | null
          id?: string
          internal_note?: string | null
          option_reference?: string | null
          property_address?: string | null
          property_details?: string | null
          property_reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agency_name?: string | null
          agent_email?: string
          agent_name?: string
          agent_phone?: string | null
          asking_price?: string | null
          created_at?: string
          demand_id?: string
          docusign_envelope_id?: string | null
          id?: string
          internal_note?: string | null
          option_reference?: string | null
          property_address?: string | null
          property_details?: string | null
          property_reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_options_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "property_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          created_at: string
          envelope_id: string | null
          event_type: string
          id: string
          message: string | null
          payload: Json | null
          related_entity_id: string | null
          related_entity_type: string | null
        }
        Insert: {
          created_at?: string
          envelope_id?: string | null
          event_type: string
          id?: string
          message?: string | null
          payload?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
        }
        Update: {
          created_at?: string
          envelope_id?: string | null
          event_type?: string
          id?: string
          message?: string | null
          payload?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
        }
        Relationships: []
      }
      docusign_envelopes: {
        Row: {
          completed_at: string | null
          created_at: string
          envelope_id: string | null
          id: string
          raw_payload: Json | null
          related_entity_id: string
          related_entity_type: string
          sent_at: string | null
          signers: Json | null
          status: string
          template_type: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          envelope_id?: string | null
          id?: string
          raw_payload?: Json | null
          related_entity_id: string
          related_entity_type: string
          sent_at?: string | null
          signers?: Json | null
          status?: string
          template_type: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          envelope_id?: string | null
          id?: string
          raw_payload?: Json | null
          related_entity_id?: string
          related_entity_type?: string
          sent_at?: string | null
          signers?: Json | null
          status?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      network_contacts: {
        Row: {
          active: boolean
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          role: string
          sector: string | null
          specialties: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          role?: string
          sector?: string | null
          specialties?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string
          sector?: string | null
          specialties?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      professional_referrals: {
        Row: {
          commitment_fee: string | null
          commitment_fee_amount: number | null
          company_name: string | null
          created_at: string
          currency: string | null
          demand_id: string
          docusign_envelope_id: string | null
          id: string
          internal_note: string | null
          paid_at: string | null
          payment_intent_id: string | null
          payment_method: string | null
          payment_status: string
          professional_email: string
          professional_name: string
          professional_phone: string | null
          professional_reference: string | null
          professional_type: string
          status: string
          success_fee: string | null
          updated_at: string
        }
        Insert: {
          commitment_fee?: string | null
          commitment_fee_amount?: number | null
          company_name?: string | null
          created_at?: string
          currency?: string | null
          demand_id: string
          docusign_envelope_id?: string | null
          id?: string
          internal_note?: string | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string
          professional_email: string
          professional_name: string
          professional_phone?: string | null
          professional_reference?: string | null
          professional_type: string
          status?: string
          success_fee?: string | null
          updated_at?: string
        }
        Update: {
          commitment_fee?: string | null
          commitment_fee_amount?: number | null
          company_name?: string | null
          created_at?: string
          currency?: string | null
          demand_id?: string
          docusign_envelope_id?: string | null
          id?: string
          internal_note?: string | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string
          professional_email?: string
          professional_name?: string
          professional_phone?: string | null
          professional_reference?: string | null
          professional_type?: string
          status?: string
          success_fee?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_referrals_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "property_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      property_requests: {
        Row: {
          address: string | null
          budget: string | null
          client_agreement_status: string
          created_at: string
          current_condition: string | null
          demand_reference: string | null
          docusign_envelope_id: string | null
          email: string
          id: string
          intended_use: string | null
          internal_note: string | null
          location: string | null
          message: string | null
          name: string
          phase_1_status: string
          phase_2_status: string
          phone: string | null
          property_deal_status: string
          property_type: string | null
          renovation_objective: string | null
          request_type: string | null
          selected_professional_types: string | null
          service_type: string
          source: string
          status: string
          support_level: string | null
          surface: string | null
          timeline: string | null
          updated_at: string
          user_agent: string | null
          works_level: string | null
        }
        Insert: {
          address?: string | null
          budget?: string | null
          client_agreement_status?: string
          created_at?: string
          current_condition?: string | null
          demand_reference?: string | null
          docusign_envelope_id?: string | null
          email: string
          id?: string
          intended_use?: string | null
          internal_note?: string | null
          location?: string | null
          message?: string | null
          name: string
          phase_1_status?: string
          phase_2_status?: string
          phone?: string | null
          property_deal_status?: string
          property_type?: string | null
          renovation_objective?: string | null
          request_type?: string | null
          selected_professional_types?: string | null
          service_type: string
          source?: string
          status?: string
          support_level?: string | null
          surface?: string | null
          timeline?: string | null
          updated_at?: string
          user_agent?: string | null
          works_level?: string | null
        }
        Update: {
          address?: string | null
          budget?: string | null
          client_agreement_status?: string
          created_at?: string
          current_condition?: string | null
          demand_reference?: string | null
          docusign_envelope_id?: string | null
          email?: string
          id?: string
          intended_use?: string | null
          internal_note?: string | null
          location?: string | null
          message?: string | null
          name?: string
          phase_1_status?: string
          phase_2_status?: string
          phone?: string | null
          property_deal_status?: string
          property_type?: string | null
          renovation_objective?: string | null
          request_type?: string | null
          selected_professional_types?: string | null
          service_type?: string
          source?: string
          status?: string
          support_level?: string | null
          surface?: string | null
          timeline?: string | null
          updated_at?: string
          user_agent?: string | null
          works_level?: string | null
        }
        Relationships: []
      }
      request_sends: {
        Row: {
          contact_id: string | null
          created_at: string
          email_body: string
          email_subject: string
          id: string
          include_client_details: boolean
          property_request_id: string
          recipient_email: string
          status: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          email_body: string
          email_subject: string
          id?: string
          include_client_details?: boolean
          property_request_id: string
          recipient_email: string
          status?: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          email_body?: string
          email_subject?: string
          id?: string
          include_client_details?: boolean
          property_request_id?: string
          recipient_email?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_sends_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "network_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_sends_property_request_id_fkey"
            columns: ["property_request_id"]
            isOneToOne: false
            referencedRelation: "property_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      viewing_requests: {
        Row: {
          agent_email: string | null
          agent_name: string | null
          client_email: string | null
          client_name: string | null
          created_at: string
          demand_id: string
          docusign_envelope_id: string | null
          id: string
          internal_note: string | null
          option_id: string
          property_address: string | null
          status: string
          updated_at: string
          viewing_date: string | null
        }
        Insert: {
          agent_email?: string | null
          agent_name?: string | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          demand_id: string
          docusign_envelope_id?: string | null
          id?: string
          internal_note?: string | null
          option_id: string
          property_address?: string | null
          status?: string
          updated_at?: string
          viewing_date?: string | null
        }
        Update: {
          agent_email?: string | null
          agent_name?: string | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          demand_id?: string
          docusign_envelope_id?: string | null
          id?: string
          internal_note?: string | null
          option_id?: string
          property_address?: string | null
          status?: string
          updated_at?: string
          viewing_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viewing_requests_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "property_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewing_requests_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "agent_options"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
