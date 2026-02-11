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
      app_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          permissions: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          permissions?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          permissions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "app_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          capacity: number | null
          class_template_id: string | null
          end_datetime: string | null
          end_time: string | null
          id: string
          instructor_id: string | null
          instructor_name: string | null
          organization_id: string | null
          room_id: string | null
          start_datetime: string
          status: string | null
          title: string
          type: string | null
        }
        Insert: {
          capacity?: number | null
          class_template_id?: string | null
          end_datetime?: string | null
          end_time?: string | null
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          organization_id?: string | null
          room_id?: string | null
          start_datetime: string
          status?: string | null
          title: string
          type?: string | null
        }
        Update: {
          capacity?: number | null
          class_template_id?: string | null
          end_datetime?: string | null
          end_time?: string | null
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          organization_id?: string | null
          room_id?: string | null
          start_datetime?: string
          status?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_class_template_id_fkey"
            columns: ["class_template_id"]
            isOneToOne: false
            referencedRelation: "class_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      class_templates: {
        Row: {
          color: string | null
          description: string | null
          duration_minutes: number | null
          icon: string | null
          id: string
          organization_id: string | null
          title: string
        }
        Insert: {
          color?: string | null
          description?: string | null
          duration_minutes?: number | null
          icon?: string | null
          id?: string
          organization_id?: string | null
          title: string
        }
        Update: {
          color?: string | null
          description?: string | null
          duration_minutes?: number | null
          icon?: string | null
          id?: string
          organization_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string | null
          id: string
          muscle_group: string | null
          name: string
          organization_id: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          muscle_group?: string | null
          name: string
          organization_id?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          muscle_group?: string | null
          name?: string
          organization_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      financial_summary: {
        Row: {
          expenses: number | null
          id: string
          month: string | null
          organization_id: string | null
          revenue: number | null
        }
        Insert: {
          expenses?: number | null
          id?: string
          month?: string | null
          organization_id?: string | null
          revenue?: number | null
        }
        Update: {
          expenses?: number | null
          id?: string
          month?: string | null
          organization_id?: string | null
          revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_summary_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      instructors: {
        Row: {
          allowed_unit_ids: string[] | null
          bio: string | null
          created_at: string | null
          id: string
          name: string | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          allowed_unit_ids?: string[] | null
          bio?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          allowed_unit_ids?: string[] | null
          bio?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instructors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string | null
          id: string
          organization_id: string | null
          paid_at: string | null
          payment_method: string | null
          plan_id: string | null
          status: string | null
          student_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          status?: string | null
          student_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          status?: string | null
          student_id?: string | null
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          active: boolean | null
          created_at: string | null
          credits: number | null
          days_per_week: number | null
          description: string | null
          duration_months: number | null
          id: string
          name: string
          organization_id: string
          plan_type: string | null
          price: number
          recurrence: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          credits?: number | null
          days_per_week?: number | null
          description?: string | null
          duration_months?: number | null
          id?: string
          name: string
          organization_id: string
          plan_type?: string | null
          price?: number
          recurrence?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          credits?: number | null
          days_per_week?: number | null
          description?: string | null
          duration_months?: number | null
          id?: string
          name?: string
          organization_id?: string
          plan_type?: string | null
          price?: number
          recurrence?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          address_city: string | null
          address_line1: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_zip: string | null
          business_type: string
          cnpj_cpf: string | null
          config_absence_penalty_action: string | null
          config_cancellation_window_minutes: number | null
          config_churn_days: number | null
          config_currency: string | null
          config_fine_percent: number | null
          config_interest_monthly_percent: number | null
          config_invoice_days_before: number | null
          config_late_checkin_policy: string | null
          config_max_absences_month: number | null
          config_min_presence_pct: number | null
          config_notify_churn: boolean | null
          config_notify_due_date: boolean | null
          config_notify_overdue: boolean | null
          contact_email: string | null
          contact_phone: string | null
          cpf_cnpj: string | null
          created_at: string | null
          description: string | null
          email: string | null
          has_physical_location: boolean | null
          id: string
          instagram: string | null
          logo_url: string | null
          name: string
          onboarding_completed: boolean | null
          opening_hours: Json | null
          phone: string | null
          plan_id: string | null
          primary_color: string | null
          schedule: Json | null
          secondary_color: string | null
          student_range: string | null
          subscription_status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          address_city?: string | null
          address_line1?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_zip?: string | null
          business_type: string
          cnpj_cpf?: string | null
          config_absence_penalty_action?: string | null
          config_cancellation_window_minutes?: number | null
          config_churn_days?: number | null
          config_currency?: string | null
          config_fine_percent?: number | null
          config_interest_monthly_percent?: number | null
          config_invoice_days_before?: number | null
          config_late_checkin_policy?: string | null
          config_max_absences_month?: number | null
          config_min_presence_pct?: number | null
          config_notify_churn?: boolean | null
          config_notify_due_date?: boolean | null
          config_notify_overdue?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          has_physical_location?: boolean | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean | null
          opening_hours?: Json | null
          phone?: string | null
          plan_id?: string | null
          primary_color?: string | null
          schedule?: Json | null
          secondary_color?: string | null
          student_range?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          address_city?: string | null
          address_line1?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_zip?: string | null
          business_type?: string
          cnpj_cpf?: string | null
          config_absence_penalty_action?: string | null
          config_cancellation_window_minutes?: number | null
          config_churn_days?: number | null
          config_currency?: string | null
          config_fine_percent?: number | null
          config_interest_monthly_percent?: number | null
          config_invoice_days_before?: number | null
          config_late_checkin_policy?: string | null
          config_max_absences_month?: number | null
          config_min_presence_pct?: number | null
          config_notify_churn?: boolean | null
          config_notify_due_date?: boolean | null
          config_notify_overdue?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          has_physical_location?: boolean | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean | null
          opening_hours?: Json | null
          phone?: string | null
          plan_id?: string | null
          primary_color?: string | null
          schedule?: Json | null
          secondary_color?: string | null
          student_range?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      physical_assessments: {
        Row: {
          bmi: number | null
          body_fat: number | null
          created_at: string | null
          height: number | null
          id: string
          notes: string | null
          recorded_at: string | null
          student_id: string | null
          weight: number | null
        }
        Insert: {
          bmi?: number | null
          body_fat?: number | null
          created_at?: string | null
          height?: number | null
          id?: string
          notes?: string | null
          recorded_at?: string | null
          student_id?: string | null
          weight?: number | null
        }
        Update: {
          bmi?: number | null
          body_fat?: number | null
          created_at?: string | null
          height?: number | null
          id?: string
          notes?: string | null
          recorded_at?: string | null
          student_id?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean | null
          checkin_cycle: string | null
          checkin_limit: number | null
          description: string | null
          duration_days: number | null
          features: Json | null
          id: string
          max_students: number | null
          name: string
          organization_id: string | null
          price: number | null
          promo_duration_months: number | null
          promo_price: number | null
          type: string | null
        }
        Insert: {
          active?: boolean | null
          checkin_cycle?: string | null
          checkin_limit?: number | null
          description?: string | null
          duration_days?: number | null
          features?: Json | null
          id?: string
          max_students?: number | null
          name: string
          organization_id?: string | null
          price?: number | null
          promo_duration_months?: number | null
          promo_price?: number | null
          type?: string | null
        }
        Update: {
          active?: boolean | null
          checkin_cycle?: string | null
          checkin_limit?: number | null
          description?: string | null
          duration_days?: number | null
          features?: Json | null
          id?: string
          max_students?: number | null
          name?: string
          organization_id?: string | null
          price?: number | null
          promo_duration_months?: number | null
          promo_price?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          has_system_access: boolean | null
          id: string
          is_instructor: boolean | null
          job_title: string | null
          must_change_password: boolean | null
          organization_id: string | null
          phone: string | null
          role: string | null
          role_id: string | null
          show_public_profile: boolean | null
          status: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          has_system_access?: boolean | null
          id: string
          is_instructor?: boolean | null
          job_title?: string | null
          must_change_password?: boolean | null
          organization_id?: string | null
          phone?: string | null
          role?: string | null
          role_id?: string | null
          show_public_profile?: boolean | null
          status?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          has_system_access?: boolean | null
          id?: string
          is_instructor?: boolean | null
          job_title?: string | null
          must_change_password?: boolean | null
          organization_id?: string | null
          phone?: string | null
          role?: string | null
          role_id?: string | null
          show_public_profile?: boolean | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "app_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          capacity: number | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
          unit_id: string | null
        }
        Insert: {
          capacity?: number | null
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          unit_id?: string | null
        }
        Update: {
          capacity?: number | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          organization_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id?: string
          organization_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          organization_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          action: string
          created_at: string | null
          details: string | null
          id: string
          metadata: Json | null
          organization_id: string
          resource: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          resource: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          resource?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          active: boolean | null
          address_city: string | null
          address_json: Json | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          business_type: string | null
          created_at: string | null
          email: string | null
          id: string
          is_main: boolean | null
          manager_name: string | null
          name: string
          organization_id: string
          other_service: string | null
          phone: string | null
          services: string[] | null
        }
        Insert: {
          active?: boolean | null
          address_city?: string | null
          address_json?: Json | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          business_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_main?: boolean | null
          manager_name?: string | null
          name: string
          organization_id: string
          other_service?: string | null
          phone?: string | null
          services?: string[] | null
        }
        Update: {
          active?: boolean | null
          address_city?: string | null
          address_json?: Json | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          business_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_main?: boolean | null
          manager_name?: string | null
          name?: string
          organization_id?: string
          other_service?: string | null
          phone?: string | null
          services?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          created_at: string | null
          event_id: string | null
          exercise_id: string | null
          id: string
          notes: string | null
          reps: string | null
          rest_time: number | null
          sets: number | null
          student_id: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          reps?: string | null
          rest_time?: number | null
          sets?: number | null
          student_id?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          exercise_id?: string | null
          id?: string
          notes?: string | null
          reps?: string | null
          rest_time?: number | null
          sets?: number | null
          student_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_participant_to_event: {
        Args: { p_event_id: string; p_student_id: string }
        Returns: Json
      }
      get_auth_org_id: { Args: never; Returns: string }
      remove_participant_from_event: {
        Args: { p_event_id: string; p_student_id: string }
        Returns: undefined
      }
    }
    Enums: {
      BusinessType: "STARTER" | "PLUS" | "STUDIO" | "PRO" | "ENTERPRISE"
      EventStatus:
        | "PREVISTA"
        | "EM_EXECUCAO"
        | "PENDENTE"
        | "REALIZADA"
        | "FALTA"
      EventType: "CLASS" | "TRAINING"
      MessageType: "TEXT" | "IMAGE" | "AUDIO" | "FILE"
      ParticipantStatus: "CONFIRMED" | "CANCELED" | "ATTENDED" | "MISSED"
      PenaltyType: "NONE" | "LOSE_CREDIT" | "FEE"
      PlanScheduleType: "FIXED" | "FLEXIBLE" | "OPEN"
      PlanStatus: "ACTIVE" | "PAUSED" | "ENDED"
      StudentStatus: "ACTIVE" | "INACTIVE" | "CANCELED"
      UserRole: "OWNER" | "ADMIN" | "MANAGER" | "INSTRUCTOR" | "STAFF"
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
    Enums: {
      BusinessType: ["STARTER", "PLUS", "STUDIO", "PRO", "ENTERPRISE"],
      EventStatus: [
        "PREVISTA",
        "EM_EXECUCAO",
        "PENDENTE",
        "REALIZADA",
        "FALTA",
      ],
      EventType: ["CLASS", "TRAINING"],
      MessageType: ["TEXT", "IMAGE", "AUDIO", "FILE"],
      ParticipantStatus: ["CONFIRMED", "CANCELED", "ATTENDED", "MISSED"],
      PenaltyType: ["NONE", "LOSE_CREDIT", "FEE"],
      PlanScheduleType: ["FIXED", "FLEXIBLE", "OPEN"],
      PlanStatus: ["ACTIVE", "PAUSED", "ENDED"],
      StudentStatus: ["ACTIVE", "INACTIVE", "CANCELED"],
      UserRole: ["OWNER", "ADMIN", "MANAGER", "INSTRUCTOR", "STAFF"],
    },
  },
} as const
