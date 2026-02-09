
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            graphql: {
                Args: {
                    operationName?: string
                    query?: string
                    variables?: Json
                    extensions?: Json
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
    public: {
        Tables: {
            attendance_logs: {
                Row: {
                    confirmed_by_user: string | null
                    created_at: string
                    event_id: string
                    id: string
                    notes: string | null
                    status: string
                    student_id: string
                }
                Insert: {
                    confirmed_by_user?: string | null
                    created_at?: string
                    event_id: string
                    id: string
                    notes?: string | null
                    status: string
                    student_id: string
                }
                Update: {
                    confirmed_by_user?: string | null
                    created_at?: string
                    event_id?: string
                    id?: string
                    notes?: string | null
                    status?: string
                    student_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "attendance_logs_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "calendar_events"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "attendance_logs_student_id_fkey"
                        columns: ["student_id"]
                        isOneToOne: false
                        referencedRelation: "students"
                        referencedColumns: ["id"]
                    },
                ]
            }
            body_measurements: {
                Row: {
                    arms: number | null
                    body_fat: number | null
                    chest: number | null
                    date: string
                    hips: number | null
                    id: string
                    legs: number | null
                    notes: string | null
                    student_id: string
                    waist: number | null
                    weight: number | null
                }
                Insert: {
                    arms?: number | null
                    body_fat?: number | null
                    chest?: number | null
                    date: string
                    hips?: number | null
                    id: string
                    legs?: number | null
                    notes?: string | null
                    student_id: string
                    waist?: number | null
                    weight?: number | null
                }
                Update: {
                    arms?: number | null
                    body_fat?: number | null
                    chest?: number | null
                    date?: string
                    hips?: number | null
                    id?: string
                    legs?: number | null
                    notes?: string | null
                    student_id?: string
                    waist?: number | null
                    weight?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "body_measurements_student_id_fkey"
                        columns: ["student_id"]
                        isOneToOne: false
                        referencedRelation: "students"
                        referencedColumns: ["id"]
                    },
                ]
            }
            calendar_events: {
                Row: {
                    capacity_limit: number | null
                    created_at: string
                    end_datetime: string
                    id: string
                    instructor_id: string | null
                    organization_id: string
                    room_id: string | null
                    start_datetime: string
                    status: Database["public"]["Enums"]["EventStatus"]
                    template_id: string | null
                    type: Database["public"]["Enums"]["EventType"]
                    unit_id: string
                }
                Insert: {
                    capacity_limit?: number | null
                    created_at?: string
                    end_datetime: string
                    id: string
                    instructor_id?: string | null
                    organization_id: string
                    room_id?: string | null
                    start_datetime: string
                    status?: Database["public"]["Enums"]["EventStatus"]
                    template_id?: string | null
                    type: Database["public"]["Enums"]["EventType"]
                    unit_id: string
                }
                Update: {
                    capacity_limit?: number | null
                    created_at?: string
                    end_datetime?: string
                    id?: string
                    instructor_id?: string | null
                    organization_id?: string
                    room_id?: string | null
                    start_datetime?: string
                    status?: Database["public"]["Enums"]["EventStatus"]
                    template_id?: string | null
                    type?: Database["public"]["Enums"]["EventType"]
                    unit_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "calendar_events_instructor_id_fkey"
                        columns: ["instructor_id"]
                        isOneToOne: false
                        referencedRelation: "instructors"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "calendar_events_room_id_fkey"
                        columns: ["room_id"]
                        isOneToOne: false
                        referencedRelation: "rooms"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "calendar_events_template_id_fkey"
                        columns: ["template_id"]
                        isOneToOne: false
                        referencedRelation: "class_templates"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "calendar_events_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "units"
                        referencedColumns: ["id"]
                    },
                ]
            }
            cancellation_policies: {
                Row: {
                    cancel_limit_minutes: number
                    id: string
                    name: string
                    organization_id: string
                    penalty_type: Database["public"]["Enums"]["PenaltyType"]
                }
                Insert: {
                    cancel_limit_minutes: number
                    id: string
                    name: string
                    organization_id: string
                    penalty_type: Database["public"]["Enums"]["PenaltyType"]
                }
                Update: {
                    cancel_limit_minutes?: number
                    id?: string
                    name?: string
                    organization_id?: string
                    penalty_type?: Database["public"]["Enums"]["PenaltyType"]
                }
                Relationships: [
                    {
                        foreignKeyName: "cancellation_policies_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            class_templates: {
                Row: {
                    allow_reservations: boolean
                    cancellation_policy_id: string | null
                    color: string | null
                    created_at: string
                    default_duration_minutes: number
                    icon: string | null
                    id: string
                    max_students: number | null
                    min_students: number | null
                    organization_id: string
                    title: string
                }
                Insert: {
                    allow_reservations?: boolean
                    cancellation_policy_id?: string | null
                    color?: string | null
                    created_at?: string
                    default_duration_minutes: number
                    icon?: string | null
                    id: string
                    max_students?: number | null
                    min_students?: number | null
                    organization_id: string
                    title: string
                }
                Update: {
                    allow_reservations?: boolean
                    cancellation_policy_id?: string | null
                    color?: string | null
                    created_at?: string
                    default_duration_minutes?: number
                    icon?: string | null
                    id?: string
                    max_students?: number | null
                    min_students?: number | null
                    organization_id?: string
                    title?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "class_templates_cancellation_policy_id_fkey"
                        columns: ["cancellation_policy_id"]
                        isOneToOne: false
                        referencedRelation: "cancellation_policies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "class_templates_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            conversations: {
                Row: {
                    archived_by: string[] | null
                    id: string
                    last_message_preview: string | null
                    organization_id: string
                    participant_ids: string[] | null
                    updated_at: string
                }
                Insert: {
                    archived_by?: string[] | null
                    id: string
                    last_message_preview?: string | null
                    organization_id: string
                    participant_ids?: string[] | null
                    updated_at: string
                }
                Update: {
                    archived_by?: string[] | null
                    id?: string
                    last_message_preview?: string | null
                    organization_id?: string
                    participant_ids?: string[] | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "conversations_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            event_participants: {
                Row: {
                    event_id: string
                    id: string
                    status: Database["public"]["Enums"]["ParticipantStatus"]
                    student_id: string
                }
                Insert: {
                    event_id: string
                    id: string
                    status?: Database["public"]["Enums"]["ParticipantStatus"]
                    student_id: string
                }
                Update: {
                    event_id?: string
                    id?: string
                    status?: Database["public"]["Enums"]["ParticipantStatus"]
                    student_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "event_participants_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "calendar_events"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "event_participants_student_id_fkey"
                        columns: ["student_id"]
                        isOneToOne: false
                        referencedRelation: "students"
                        referencedColumns: ["id"]
                    },
                ]
            }
            exercises_library: {
                Row: {
                    difficulty: string | null
                    equipment: string | null
                    id: string
                    media_url: string | null
                    muscle_group: string | null
                    name: string
                }
                Insert: {
                    difficulty?: string | null
                    equipment?: string | null
                    id: string
                    media_url?: string | null
                    muscle_group?: string | null
                    name: string
                }
                Update: {
                    difficulty?: string | null
                    equipment?: string | null
                    id?: string
                    media_url?: string | null
                    muscle_group?: string | null
                    name?: string
                }
                Relationships: []
            }
            instructors: {
                Row: {
                    active: boolean
                    allowed_unit_ids: string[] | null
                    bio: string | null
                    id: string
                    name: string
                    organization_id: string
                    user_id: string | null
                }
                Insert: {
                    active?: boolean
                    allowed_unit_ids?: string[] | null
                    bio?: string | null
                    id: string
                    name: string
                    organization_id: string
                    user_id?: string | null
                }
                Update: {
                    active?: boolean
                    allowed_unit_ids?: string[] | null
                    bio?: string | null
                    id?: string
                    name?: string
                    organization_id?: string
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
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            messages: {
                Row: {
                    content: string | null
                    conversation_id: string
                    created_at: string
                    deleted_at: string | null
                    file_url: string | null
                    id: string
                    reactions_json: Json | null
                    sender_id: string
                    type: Database["public"]["Enums"]["MessageType"]
                }
                Insert: {
                    content?: string | null
                    conversation_id: string
                    created_at?: string
                    deleted_at?: string | null
                    file_url?: string | null
                    id: string
                    reactions_json?: Json | null
                    sender_id: string
                    type: Database["public"]["Enums"]["MessageType"]
                }
                Update: {
                    content?: string | null
                    conversation_id?: string
                    created_at?: string
                    deleted_at?: string | null
                    file_url?: string | null
                    id?: string
                    reactions_json?: Json | null
                    sender_id?: string
                    type?: Database["public"]["Enums"]["MessageType"]
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_conversation_id_fkey"
                        columns: ["conversation_id"]
                        isOneToOne: false
                        referencedRelation: "conversations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            organizations: {
                Row: {
                    address_city: string | null
                    address_line1: string | null
                    address_neighborhood: string | null
                    address_number: string | null
                    address_state: string | null
                    address_zip: string | null
                    business_type: Database["public"]["Enums"]["BusinessType"] | null
                    contact_email: string | null
                    created_at: string
                    document: string | null
                    has_physical_location: boolean | null
                    id: string
                    name: string
                    onboarding_completed: boolean | null
                    opening_hours: Json | null
                    plan_id: string | null
                    social_media: Json | null
                    student_range: string | null
                    updated_at: string
                }
                Insert: {
                    address_city?: string | null
                    address_line1?: string | null
                    address_neighborhood?: string | null
                    address_number?: string | null
                    address_state?: string | null
                    address_zip?: string | null
                    business_type?: Database["public"]["Enums"]["BusinessType"] | null
                    contact_email?: string | null
                    created_at?: string
                    document?: string | null
                    has_physical_location?: boolean | null
                    id: string
                    name: string
                    onboarding_completed?: boolean | null
                    opening_hours?: Json | null
                    plan_id?: string | null
                    social_media?: Json | null
                    student_range?: string | null
                    updated_at: string
                }
                Update: {
                    address_city?: string | null
                    address_line1?: string | null
                    address_neighborhood?: string | null
                    address_number?: string | null
                    address_state?: string | null
                    address_zip?: string | null
                    business_type?: Database["public"]["Enums"]["BusinessType"] | null
                    contact_email?: string | null
                    created_at?: string
                    document?: string | null
                    has_physical_location?: boolean | null
                    id?: string
                    name?: string
                    onboarding_completed?: boolean | null
                    opening_hours?: Json | null
                    plan_id?: string | null
                    social_media?: Json | null
                    student_range?: string | null
                    updated_at?: string
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
            plans: {
                Row: {
                    created_at: string
                    features: Json | null
                    id: string
                    max_students: number
                    name: string
                    price: number
                }
                Insert: {
                    created_at?: string
                    features?: Json | null
                    id?: string
                    max_students: number
                    name: string
                    price: number
                }
                Update: {
                    created_at?: string
                    features?: Json | null
                    id?: string
                    max_students?: number
                    name?: string
                    price?: number
                }
                Relationships: []
            }
            reports: {
                Row: {
                    created_at: string
                    filters_json: Json | null
                    generated_by_user: string | null
                    id: string
                    name: string
                    organization_id: string
                    result_json: Json | null
                }
                Insert: {
                    created_at?: string
                    filters_json?: Json | null
                    generated_by_user?: string | null
                    id: string
                    name: string
                    organization_id: string
                    result_json?: Json | null
                }
                Update: {
                    created_at?: string
                    filters_json?: Json | null
                    generated_by_user?: string | null
                    id?: string
                    name?: string
                    organization_id?: string
                    result_json?: Json | null
                }
                Relationships: [
                    {
                        foreignKeyName: "reports_generated_by_user_fkey"
                        columns: ["generated_by_user"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "reports_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            rooms: {
                Row: {
                    allow_parallel_booking: boolean
                    capacity: number
                    created_at: string
                    id: string
                    name: string
                    unit_id: string
                }
                Insert: {
                    allow_parallel_booking?: boolean
                    capacity: number
                    created_at?: string
                    id: string
                    name: string
                    unit_id: string
                }
                Update: {
                    allow_parallel_booking?: boolean
                    capacity?: number
                    created_at?: string
                    id?: string
                    name?: string
                    unit_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "rooms_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "units"
                        referencedColumns: ["id"]
                    },
                ]
            }
            student_plan_assignments: {
                Row: {
                    color: string | null
                    fixed_schedule_json: Json | null
                    id: string
                    plan_name: string
                    schedule_type: Database["public"]["Enums"]["PlanScheduleType"]
                    start_date: string
                    status: Database["public"]["Enums"]["PlanStatus"]
                    student_id: string
                    weekly_limit: number | null
                }
                Insert: {
                    color?: string | null
                    fixed_schedule_json?: Json | null
                    id: string
                    plan_name: string
                    schedule_type: Database["public"]["Enums"]["PlanScheduleType"]
                    start_date: string
                    status?: Database["public"]["Enums"]["PlanStatus"]
                    student_id: string
                    weekly_limit?: number | null
                }
                Update: {
                    color?: string | null
                    fixed_schedule_json?: Json | null
                    id?: string
                    plan_name?: string
                    schedule_type?: Database["public"]["Enums"]["PlanScheduleType"]
                    start_date?: string
                    status?: Database["public"]["Enums"]["PlanStatus"]
                    student_id?: string
                    weekly_limit?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "student_plan_assignments_student_id_fkey"
                        columns: ["student_id"]
                        isOneToOne: false
                        referencedRelation: "students"
                        referencedColumns: ["id"]
                    },
                ]
            }
            students: {
                Row: {
                    avatar_url: string | null
                    created_at: string
                    email: string | null
                    full_name: string
                    id: string
                    organization_id: string
                    phone: string | null
                    status: Database["public"]["Enums"]["StudentStatus"]
                    unit_id: string
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string
                    email?: string | null
                    full_name: string
                    id: string
                    organization_id: string
                    phone?: string | null
                    status?: Database["public"]["Enums"]["StudentStatus"]
                    unit_id: string
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string
                    email?: string | null
                    full_name?: string
                    id?: string
                    organization_id?: string
                    phone?: string | null
                    status?: Database["public"]["Enums"]["StudentStatus"]
                    unit_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "students_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "units"
                        referencedColumns: ["id"]
                    },
                ]
            }
            system_logs: {
                Row: {
                    action_type: string
                    actor_user_id: string | null
                    created_at: string
                    entity_id: string | null
                    entity_type: string
                    id: string
                    new_data_json: Json | null
                    old_data_json: Json | null
                    organization_id: string
                }
                Insert: {
                    action_type: string
                    actor_user_id?: string | null
                    created_at?: string
                    entity_id?: string | null
                    entity_type: string
                    id: string
                    new_data_json?: Json | null
                    old_data_json?: Json | null
                    organization_id: string
                }
                Update: {
                    action_type?: string
                    actor_user_id?: string | null
                    created_at?: string
                    entity_id?: string | null
                    entity_type?: string
                    id?: string
                    new_data_json?: Json | null
                    old_data_json?: Json | null
                    organization_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "system_logs_actor_user_id_fkey"
                        columns: ["actor_user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "system_logs_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            units: {
                Row: {
                    active: boolean
                    address_json: Json | null
                    created_at: string
                    id: string
                    name: string
                    organization_id: string
                }
                Insert: {
                    active?: boolean
                    address_json?: Json | null
                    created_at?: string
                    id: string
                    name: string
                    organization_id: string
                }
                Update: {
                    active?: boolean
                    address_json?: Json | null
                    created_at?: string
                    id?: string
                    name?: string
                    organization_id?: string
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
            users: {
                Row: {
                    active: boolean
                    allowed_unit_ids: string[] | null
                    avatar_url: string | null
                    created_at: string
                    email: string
                    id: string
                    name: string
                    organization_id: string
                    role: Database["public"]["Enums"]["UserRole"]
                }
                Insert: {
                    active?: boolean
                    allowed_unit_ids?: string[] | null
                    avatar_url?: string | null
                    created_at?: string
                    email: string
                    id: string
                    name: string
                    organization_id: string
                    role: Database["public"]["Enums"]["UserRole"]
                }
                Update: {
                    active?: boolean
                    allowed_unit_ids?: string[] | null
                    avatar_url?: string | null
                    created_at?: string
                    email?: string
                    id?: string
                    name?: string
                    organization_id?: string
                    role?: Database["public"]["Enums"]["UserRole"]
                }
                Relationships: [
                    {
                        foreignKeyName: "users_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                ]
            }
            workout_exercises: {
                Row: {
                    duration_seconds: number | null
                    exercise_id: string
                    id: string
                    intensity: string | null
                    notes: string | null
                    reps: string | null
                    sets: number | null
                    weight: number | null
                    workout_id: string
                }
                Insert: {
                    duration_seconds?: number | null
                    exercise_id: string
                    id: string
                    intensity?: string | null
                    notes?: string | null
                    reps?: string | null
                    sets?: number | null
                    weight?: number | null
                    workout_id: string
                }
                Update: {
                    duration_seconds?: number | null
                    exercise_id?: string
                    id?: string
                    intensity?: string | null
                    notes?: string | null
                    reps?: string | null
                    sets?: number | null
                    weight?: number | null
                    workout_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "workout_exercises_exercise_id_fkey"
                        columns: ["exercise_id"]
                        isOneToOne: false
                        referencedRelation: "exercises_library"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "workout_exercises_workout_id_fkey"
                        columns: ["workout_id"]
                        isOneToOne: false
                        referencedRelation: "workouts"
                        referencedColumns: ["id"]
                    },
                ]
            }
            workouts: {
                Row: {
                    created_at: string
                    created_by_user_id: string | null
                    goal: string | null
                    id: string
                    organization_id: string
                    student_id: string
                    title: string
                }
                Insert: {
                    created_at?: string
                    created_by_user_id?: string | null
                    goal?: string | null
                    id: string
                    organization_id: string
                    student_id: string
                    title: string
                }
                Update: {
                    created_at?: string
                    created_by_user_id?: string | null
                    goal?: string | null
                    id?: string
                    organization_id?: string
                    student_id?: string
                    title: string
                }
                Relationships: [
                    {
                        foreignKeyName: "workouts_created_by_user_id_fkey"
                        columns: ["created_by_user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "workouts_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "workouts_student_id_fkey"
                        columns: ["student_id"]
                        isOneToOne: false
                        referencedRelation: "students"
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
