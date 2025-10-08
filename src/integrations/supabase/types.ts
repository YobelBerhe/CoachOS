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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      compliance_scores: {
        Row: {
          created_at: string | null
          date: string
          fasting_score: number
          id: string
          nutrition_score: number
          overall_score: number
          sleep_score: number
          updated_at: string | null
          user_id: string
          workout_score: number
        }
        Insert: {
          created_at?: string | null
          date: string
          fasting_score: number
          id?: string
          nutrition_score: number
          overall_score: number
          sleep_score: number
          updated_at?: string | null
          user_id: string
          workout_score: number
        }
        Update: {
          created_at?: string | null
          date?: string
          fasting_score?: number
          id?: string
          nutrition_score?: number
          overall_score?: number
          sleep_score?: number
          updated_at?: string | null
          user_id?: string
          workout_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "compliance_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_targets: {
        Row: {
          bmr: number
          calories: number
          carbs_g: number
          created_at: string | null
          date: string
          fats_g: number
          id: string
          protein_g: number
          tdee: number
          user_id: string
        }
        Insert: {
          bmr: number
          calories: number
          carbs_g: number
          created_at?: string | null
          date: string
          fats_g: number
          id?: string
          protein_g: number
          tdee: number
          user_id: string
        }
        Update: {
          bmr?: number
          calories?: number
          carbs_g?: number
          created_at?: string | null
          date?: string
          fats_g?: number
          id?: string
          protein_g?: number
          tdee?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_targets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_logs: {
        Row: {
          created_at: string | null
          exercise_id: string
          id: string
          notes: string | null
          sets: Json
          workout_session_id: string
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          notes?: string | null
          sets: Json
          workout_session_id: string
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          notes?: string | null
          sets?: Json
          workout_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_logs_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string | null
          difficulty: string
          equipment: string
          id: string
          instructions: string | null
          muscle_group: string
          name: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          difficulty: string
          equipment: string
          id?: string
          instructions?: string | null
          muscle_group: string
          name: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          difficulty?: string
          equipment?: string
          id?: string
          instructions?: string | null
          muscle_group?: string
          name?: string
          video_url?: string | null
        }
        Relationships: []
      }
      fasting_plans: {
        Row: {
          created_at: string | null
          eating_window_end: string
          eating_window_start: string
          id: string
          is_active: boolean | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          eating_window_end: string
          eating_window_start: string
          id?: string
          is_active?: boolean | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          eating_window_end?: string
          eating_window_start?: string
          id?: string
          is_active?: boolean | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fasting_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_recipes: {
        Row: {
          created_at: string | null
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      food_logs: {
        Row: {
          calories: number
          carbs_g: number
          created_at: string | null
          date: string
          fats_g: number
          food_name: string
          id: string
          meal_type: string | null
          protein_g: number
          serving_size: string | null
          time: string
          user_id: string
        }
        Insert: {
          calories: number
          carbs_g?: number
          created_at?: string | null
          date?: string
          fats_g?: number
          food_name: string
          id?: string
          meal_type?: string | null
          protein_g?: number
          serving_size?: string | null
          time?: string
          user_id: string
        }
        Update: {
          calories?: number
          carbs_g?: number
          created_at?: string | null
          date?: string
          fats_g?: number
          food_name?: string
          id?: string
          meal_type?: string | null
          protein_g?: number
          serving_size?: string | null
          time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          aggression: string | null
          created_at: string | null
          current_weight_kg: number
          id: string
          is_active: boolean | null
          target_weight_kg: number
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aggression?: string | null
          created_at?: string | null
          current_weight_kg: number
          id?: string
          is_active?: boolean | null
          target_weight_kg: number
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aggression?: string | null
          created_at?: string | null
          current_weight_kg?: number
          id?: string
          is_active?: boolean | null
          target_weight_kg?: number
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_lists: {
        Row: {
          created_at: string | null
          id: string
          items: Json
          updated_at: string | null
          user_id: string
          week_of: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          items?: Json
          updated_at?: string | null
          user_id: string
          week_of: string
        }
        Update: {
          created_at?: string | null
          id?: string
          items?: Json
          updated_at?: string | null
          user_id?: string
          week_of?: string
        }
        Relationships: []
      }
      medication_logs: {
        Row: {
          created_at: string | null
          date: string
          id: string
          medication_id: string
          scheduled_time: string
          skip_reason: string | null
          skipped: boolean | null
          taken_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          medication_id: string
          scheduled_time: string
          skip_reason?: string | null
          skipped?: boolean | null
          taken_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          medication_id?: string
          scheduled_time?: string
          skip_reason?: string | null
          skipped?: boolean | null
          taken_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string | null
          current_pills: number | null
          dosage: string
          frequency: string
          id: string
          is_active: boolean | null
          name: string
          pills_per_bottle: number | null
          take_with_food: boolean | null
          times: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_pills?: number | null
          dosage: string
          frequency: string
          id?: string
          is_active?: boolean | null
          name: string
          pills_per_bottle?: number | null
          take_with_food?: boolean | null
          times?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_pills?: number | null
          dosage?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          name?: string
          pills_per_bottle?: number | null
          take_with_food?: boolean | null
          times?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string
          age: number
          created_at: string | null
          dietary_restrictions: string[] | null
          email: string
          full_name: string | null
          health_conditions: string[] | null
          height_cm: number
          id: string
          sex: string
          updated_at: string | null
        }
        Insert: {
          activity_level: string
          age: number
          created_at?: string | null
          dietary_restrictions?: string[] | null
          email: string
          full_name?: string | null
          health_conditions?: string[] | null
          height_cm: number
          id: string
          sex: string
          updated_at?: string | null
        }
        Update: {
          activity_level?: string
          age?: number
          created_at?: string | null
          dietary_restrictions?: string[] | null
          email?: string
          full_name?: string | null
          health_conditions?: string[] | null
          height_cm?: number
          id?: string
          sex?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          calories_per_serving: number | null
          carbs_g_per_serving: number | null
          category: string
          cook_time_min: number | null
          created_at: string | null
          cuisine: string | null
          description: string | null
          difficulty: string | null
          fats_g_per_serving: number | null
          id: string
          image_url: string | null
          ingredients: Json
          instructions: Json
          is_public: boolean | null
          name: string
          prep_time_min: number | null
          protein_g_per_serving: number | null
          servings: number
          tags: string[] | null
          total_time_min: number | null
          updated_at: string | null
        }
        Insert: {
          calories_per_serving?: number | null
          carbs_g_per_serving?: number | null
          category: string
          cook_time_min?: number | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          difficulty?: string | null
          fats_g_per_serving?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: Json
          is_public?: boolean | null
          name: string
          prep_time_min?: number | null
          protein_g_per_serving?: number | null
          servings?: number
          tags?: string[] | null
          total_time_min?: number | null
          updated_at?: string | null
        }
        Update: {
          calories_per_serving?: number | null
          carbs_g_per_serving?: number | null
          category?: string
          cook_time_min?: number | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          difficulty?: string | null
          fats_g_per_serving?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: Json
          is_public?: boolean | null
          name?: string
          prep_time_min?: number | null
          protein_g_per_serving?: number | null
          servings?: number
          tags?: string[] | null
          total_time_min?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sleep_logs: {
        Row: {
          bedtime: string
          created_at: string | null
          date: string
          duration_min: number
          id: string
          quality: number | null
          user_id: string
          wake_time: string
        }
        Insert: {
          bedtime: string
          created_at?: string | null
          date: string
          duration_min: number
          id?: string
          quality?: number | null
          user_id: string
          wake_time: string
        }
        Update: {
          bedtime?: string
          created_at?: string | null
          date?: string
          duration_min?: number
          id?: string
          quality?: number | null
          user_id?: string
          wake_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleep_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          created_at: string | null
          current_streak: number
          id: string
          last_updated: string
          longest_streak: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number
          id?: string
          last_updated: string
          longest_streak?: number
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number
          id?: string
          last_updated?: string
          longest_streak?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          created_at: string | null
          date: string
          id: string
          notes: string | null
          user_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          user_id: string
          weight_kg: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          user_id?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "weight_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          date: string
          id: string
          name: string
          notes: string | null
          scheduled_time: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          date?: string
          id?: string
          name: string
          notes?: string | null
          scheduled_time?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          date?: string
          id?: string
          name?: string
          notes?: string | null
          scheduled_time?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
