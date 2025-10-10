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
      carbon_savings: {
        Row: {
          carbon_saved_kg: number | null
          created_at: string | null
          food_saved_kg: number | null
          id: string
          miles_driven_equivalent: number | null
          money_saved: number | null
          month: string
          trees_equivalent: number | null
          user_id: string | null
          waste_prevented_count: number | null
        }
        Insert: {
          carbon_saved_kg?: number | null
          created_at?: string | null
          food_saved_kg?: number | null
          id?: string
          miles_driven_equivalent?: number | null
          money_saved?: number | null
          month: string
          trees_equivalent?: number | null
          user_id?: string | null
          waste_prevented_count?: number | null
        }
        Update: {
          carbon_saved_kg?: number | null
          created_at?: string | null
          food_saved_kg?: number | null
          id?: string
          miles_driven_equivalent?: number | null
          money_saved?: number | null
          month?: string
          trees_equivalent?: number | null
          user_id?: string | null
          waste_prevented_count?: number | null
        }
        Relationships: []
      }
      common_allergens: {
        Row: {
          alternative_names: string[] | null
          category: string | null
          common_in: string[] | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          alternative_names?: string[] | null
          category?: string | null
          common_in?: string[] | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          alternative_names?: string[] | null
          category?: string | null
          common_in?: string[] | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      compliance_scores: {
        Row: {
          created_at: string | null
          date: string
          fasting_score: number
          hydration_score: number | null
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
          hydration_score?: number | null
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
          hydration_score?: number | null
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
      consumption_patterns: {
        Row: {
          avg_days_to_consume: number | null
          id: string
          item_category: string
          preferred_brands: Json | null
          purchase_frequency: string | null
          seasonal_variation: Json | null
          typical_quantity: number | null
          updated_at: string | null
          user_id: string | null
          waste_percentage: number | null
        }
        Insert: {
          avg_days_to_consume?: number | null
          id?: string
          item_category: string
          preferred_brands?: Json | null
          purchase_frequency?: string | null
          seasonal_variation?: Json | null
          typical_quantity?: number | null
          updated_at?: string | null
          user_id?: string | null
          waste_percentage?: number | null
        }
        Update: {
          avg_days_to_consume?: number | null
          id?: string
          item_category?: string
          preferred_brands?: Json | null
          purchase_frequency?: string | null
          seasonal_variation?: Json | null
          typical_quantity?: number | null
          updated_at?: string | null
          user_id?: string | null
          waste_percentage?: number | null
        }
        Relationships: []
      }
      creator_earnings: {
        Row: {
          created_at: string | null
          id: string
          paid_out_cents: number | null
          pending_payout_cents: number | null
          total_earnings_cents: number | null
          total_sales: number | null
          total_unlocks: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          paid_out_cents?: number | null
          pending_payout_cents?: number | null
          total_earnings_cents?: number | null
          total_sales?: number | null
          total_unlocks?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          paid_out_cents?: number | null
          pending_payout_cents?: number | null
          total_earnings_cents?: number | null
          total_sales?: number | null
          total_unlocks?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      family_groups: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      family_invites: {
        Row: {
          created_at: string | null
          expires_at: string
          group_id: string
          id: string
          invite_code: string
          invited_by: string
          invited_email: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          group_id: string
          id?: string
          invite_code: string
          invited_by: string
          invited_email: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          group_id?: string
          id?: string
          invite_code?: string
          invited_by?: string
          invited_email?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_invites_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_waste_stats: {
        Row: {
          created_at: string | null
          family_group_id: string | null
          id: string
          items_wasted: number | null
          money_wasted: number | null
          rank: number | null
          user_id: string | null
          waste_percentage: number | null
          week_start: string
        }
        Insert: {
          created_at?: string | null
          family_group_id?: string | null
          id?: string
          items_wasted?: number | null
          money_wasted?: number | null
          rank?: number | null
          user_id?: string | null
          waste_percentage?: number | null
          week_start: string
        }
        Update: {
          created_at?: string | null
          family_group_id?: string | null
          id?: string
          items_wasted?: number | null
          money_wasted?: number | null
          rank?: number | null
          user_id?: string | null
          waste_percentage?: number | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_waste_stats_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
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
      fasting_sessions: {
        Row: {
          actual_duration_hours: number | null
          broken_early: boolean | null
          completed: boolean | null
          created_at: string | null
          end_time: string | null
          id: string
          notes: string | null
          start_time: string
          target_duration_hours: number
          user_id: string
        }
        Insert: {
          actual_duration_hours?: number | null
          broken_early?: boolean | null
          completed?: boolean | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time: string
          target_duration_hours: number
          user_id: string
        }
        Update: {
          actual_duration_hours?: number | null
          broken_early?: boolean | null
          completed?: boolean | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string
          target_duration_hours?: number
          user_id?: string
        }
        Relationships: []
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
      food_inventory: {
        Row: {
          barcode: string | null
          carbon_footprint: number | null
          category: string
          consumed_date: string | null
          created_at: string | null
          estimated_cost: number | null
          expiration_date: string
          id: string
          image_url: string | null
          item_name: string
          location: string | null
          purchase_date: string
          quantity: number | null
          status: string | null
          unit: string | null
          updated_at: string | null
          user_id: string | null
          waste_reason: string | null
        }
        Insert: {
          barcode?: string | null
          carbon_footprint?: number | null
          category: string
          consumed_date?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          expiration_date: string
          id?: string
          image_url?: string | null
          item_name: string
          location?: string | null
          purchase_date: string
          quantity?: number | null
          status?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
          waste_reason?: string | null
        }
        Update: {
          barcode?: string | null
          carbon_footprint?: number | null
          category?: string
          consumed_date?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          expiration_date?: string
          id?: string
          image_url?: string | null
          item_name?: string
          location?: string | null
          purchase_date?: string
          quantity?: number | null
          status?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string | null
          waste_reason?: string | null
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          allergen_warning_shown: boolean | null
          calories: number
          carbs_g: number
          contains_allergens: string[] | null
          created_at: string | null
          date: string
          fats_g: number
          food_name: string
          hydration_ml: number | null
          id: string
          is_beverage: boolean | null
          marked_done: boolean | null
          marked_done_at: string | null
          meal_type: string | null
          protein_g: number
          serving_size: string | null
          time: string
          user_id: string
        }
        Insert: {
          allergen_warning_shown?: boolean | null
          calories: number
          carbs_g?: number
          contains_allergens?: string[] | null
          created_at?: string | null
          date?: string
          fats_g?: number
          food_name: string
          hydration_ml?: number | null
          id?: string
          is_beverage?: boolean | null
          marked_done?: boolean | null
          marked_done_at?: string | null
          meal_type?: string | null
          protein_g?: number
          serving_size?: string | null
          time?: string
          user_id: string
        }
        Update: {
          allergen_warning_shown?: boolean | null
          calories?: number
          carbs_g?: number
          contains_allergens?: string[] | null
          created_at?: string | null
          date?: string
          fats_g?: number
          food_name?: string
          hydration_ml?: number | null
          id?: string
          is_beverage?: boolean | null
          marked_done?: boolean | null
          marked_done_at?: string | null
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
          daily_calorie_goal: number | null
          daily_water_goal_ml: number | null
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
          daily_calorie_goal?: number | null
          daily_water_goal_ml?: number | null
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
          daily_calorie_goal?: number | null
          daily_water_goal_ml?: number | null
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
      individual_payouts: {
        Row: {
          amount_cents: number
          batch_id: string | null
          created_at: string | null
          currency: string | null
          failure_reason: string | null
          id: string
          paid_at: string | null
          status: string | null
          stripe_account_id: string
          stripe_payout_id: string | null
          stripe_transfer_id: string | null
          transaction_count: number | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          batch_id?: string | null
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
          stripe_account_id: string
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
          transaction_count?: number | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          batch_id?: string | null
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
          stripe_account_id?: string
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
          transaction_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "individual_payouts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "payout_batches"
            referencedColumns: ["id"]
          },
        ]
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
      payment_transactions: {
        Row: {
          amount_creator_payout: number
          amount_platform_fee: number
          amount_total: number
          buyer_id: string
          completed_at: string | null
          created_at: string | null
          currency: string | null
          customer_email: string | null
          failure_reason: string | null
          id: string
          payment_method: string | null
          payout_date: string | null
          payout_status: string | null
          recipe_id: string
          seller_id: string
          status: string | null
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_creator_payout: number
          amount_platform_fee: number
          amount_total: number
          buyer_id: string
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          failure_reason?: string | null
          id?: string
          payment_method?: string | null
          payout_date?: string | null
          payout_status?: string | null
          recipe_id: string
          seller_id: string
          status?: string | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_creator_payout?: number
          amount_platform_fee?: number
          amount_total?: number
          buyer_id?: string
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          failure_reason?: string | null
          id?: string
          payment_method?: string | null
          payout_date?: string | null
          payout_status?: string | null
          recipe_id?: string
          seller_id?: string
          status?: string | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_batches: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          period_end: string
          period_start: string
          processed_at: string | null
          processed_by: string | null
          status: string | null
          total_amount_cents: number | null
          total_creators: number | null
          total_transactions: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          total_amount_cents?: number | null
          total_creators?: number | null
          total_transactions?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          total_amount_cents?: number | null
          total_creators?: number | null
          total_transactions?: number | null
        }
        Relationships: []
      }
      personalized_recommendations: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          recipe_count: number | null
          recipe_ids: string[]
          score_threshold: number | null
          strategy: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          recipe_count?: number | null
          recipe_ids: string[]
          score_threshold?: number | null
          strategy: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          recipe_count?: number | null
          recipe_ids?: string[]
          score_threshold?: number | null
          strategy?: string
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
          profile_completed: boolean | null
          sex: string
          updated_at: string | null
          workout_experience: string | null
          workout_frequency: number | null
          workout_location: string | null
          workout_preference: string | null
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
          profile_completed?: boolean | null
          sex: string
          updated_at?: string | null
          workout_experience?: string | null
          workout_frequency?: number | null
          workout_location?: string | null
          workout_preference?: string | null
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
          profile_completed?: boolean | null
          sex?: string
          updated_at?: string | null
          workout_experience?: string | null
          workout_frequency?: number | null
          workout_location?: string | null
          workout_preference?: string | null
        }
        Relationships: []
      }
      receipts: {
        Row: {
          created_at: string | null
          estimated_total: number | null
          id: string
          items: Json | null
          receipt_date: string | null
          savings: number | null
          store_name: string | null
          subtotal: number | null
          tax: number | null
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          estimated_total?: number | null
          id?: string
          items?: Json | null
          receipt_date?: string | null
          savings?: number | null
          store_name?: string | null
          subtotal?: number | null
          tax?: number | null
          total: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          estimated_total?: number | null
          id?: string
          items?: Json | null
          receipt_date?: string | null
          savings?: number | null
          store_name?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      recipe_interactions: {
        Row: {
          created_at: string | null
          favorited: boolean | null
          favorited_at: string | null
          first_viewed_at: string | null
          id: string
          last_viewed_at: string | null
          logged_to_diary: boolean | null
          recipe_id: string
          reviewed: boolean | null
          shared: boolean | null
          updated_at: string | null
          user_id: string
          view_count: number | null
          view_duration_seconds: number | null
          viewed: boolean | null
        }
        Insert: {
          created_at?: string | null
          favorited?: boolean | null
          favorited_at?: string | null
          first_viewed_at?: string | null
          id?: string
          last_viewed_at?: string | null
          logged_to_diary?: boolean | null
          recipe_id: string
          reviewed?: boolean | null
          shared?: boolean | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
          view_duration_seconds?: number | null
          viewed?: boolean | null
        }
        Update: {
          created_at?: string | null
          favorited?: boolean | null
          favorited_at?: string | null
          first_viewed_at?: string | null
          id?: string
          last_viewed_at?: string | null
          logged_to_diary?: boolean | null
          recipe_id?: string
          reviewed?: boolean | null
          shared?: boolean | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
          view_duration_seconds?: number | null
          viewed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_interactions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          not_helpful_count: number | null
          photo_count: number | null
          photos: string[] | null
          rating: number
          recipe_id: string
          title: string | null
          updated_at: string | null
          user_id: string
          verified_purchase: boolean | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          not_helpful_count?: number | null
          photo_count?: number | null
          photos?: string[] | null
          rating: number
          recipe_id: string
          title?: string | null
          updated_at?: string | null
          user_id: string
          verified_purchase?: boolean | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          not_helpful_count?: number | null
          photo_count?: number | null
          photos?: string[] | null
          rating?: number
          recipe_id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_reviews_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_similarities: {
        Row: {
          created_at: string | null
          id: string
          recipe_id: string
          similar_by_cuisine: boolean | null
          similar_by_ingredients: boolean | null
          similar_by_nutrition: boolean | null
          similar_by_tags: boolean | null
          similar_recipe_id: string
          similarity_score: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipe_id: string
          similar_by_cuisine?: boolean | null
          similar_by_ingredients?: boolean | null
          similar_by_nutrition?: boolean | null
          similar_by_tags?: boolean | null
          similar_recipe_id: string
          similarity_score: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recipe_id?: string
          similar_by_cuisine?: boolean | null
          similar_by_ingredients?: boolean | null
          similar_by_nutrition?: boolean | null
          similar_by_tags?: boolean | null
          similar_recipe_id?: string
          similarity_score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_similarities_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_similarities_similar_recipe_id_fkey"
            columns: ["similar_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_trending_scores: {
        Row: {
          calculated_at: string | null
          favorite_score: number | null
          last_24h_views: number | null
          last_30d_views: number | null
          last_7d_views: number | null
          recency_score: number | null
          recipe_id: string
          review_score: number | null
          score_velocity: number | null
          trending_score: number
          unlock_score: number | null
          updated_at: string | null
          view_score: number | null
        }
        Insert: {
          calculated_at?: string | null
          favorite_score?: number | null
          last_24h_views?: number | null
          last_30d_views?: number | null
          last_7d_views?: number | null
          recency_score?: number | null
          recipe_id: string
          review_score?: number | null
          score_velocity?: number | null
          trending_score?: number
          unlock_score?: number | null
          updated_at?: string | null
          view_score?: number | null
        }
        Update: {
          calculated_at?: string | null
          favorite_score?: number | null
          last_24h_views?: number | null
          last_30d_views?: number | null
          last_7d_views?: number | null
          recency_score?: number | null
          recipe_id?: string
          review_score?: number | null
          score_velocity?: number | null
          trending_score?: number
          unlock_score?: number | null
          updated_at?: string | null
          view_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_trending_scores_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: true
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_unlocks: {
        Row: {
          amount_paid: number
          created_at: string | null
          creator_payout: number
          id: string
          platform_fee: number
          recipe_id: string
          status: string | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          creator_payout: number
          id?: string
          platform_fee: number
          recipe_id: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          creator_payout?: number
          id?: string
          platform_fee?: number
          recipe_id?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_unlocks_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_views: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown | null
          recipe_id: string
          scrolled_to_ingredients: boolean | null
          scrolled_to_instructions: boolean | null
          time_spent_seconds: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          recipe_id: string
          scrolled_to_ingredients?: boolean | null
          scrolled_to_instructions?: boolean | null
          time_spent_seconds?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          recipe_id?: string
          scrolled_to_ingredients?: boolean | null
          scrolled_to_instructions?: boolean | null
          time_spent_seconds?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_views_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          average_rating: number | null
          calories_per_serving: number | null
          carbs_g: number | null
          category: string
          cook_time_min: number | null
          created_at: string | null
          cuisine: string | null
          cuisine_types: string[] | null
          deal_description: string | null
          deal_end_date: string | null
          deal_percentage: number | null
          deal_price: number | null
          deal_start_date: string | null
          description: string | null
          difficulty: string | null
          equipment: Json | null
          fats_g: number | null
          fiber_g: number | null
          good_for_energy: boolean | null
          good_for_fasting: boolean | null
          good_for_heart_health: boolean | null
          good_for_late_night: boolean | null
          good_for_muscle_gain: boolean | null
          good_for_weight_loss: boolean | null
          id: string
          image_url: string | null
          images: string[] | null
          ingredients: Json
          instructions: Json
          is_on_deal: boolean | null
          is_paid: boolean | null
          is_public: boolean | null
          meal_types: string[] | null
          name: string
          nutrition_breakdown: Json | null
          original_price: number | null
          prep_time_min: number | null
          price: number | null
          protein_g: number | null
          servings: number
          sodium_mg: number | null
          status: string | null
          stripe_account_id: string | null
          sugar_g: number | null
          tags: string[] | null
          thumbnail_index: number | null
          total_revenue: number | null
          total_reviews: number | null
          total_time_min: number | null
          total_unlocks: number | null
          updated_at: string | null
          user_id: string | null
          youtube_url: string | null
        }
        Insert: {
          average_rating?: number | null
          calories_per_serving?: number | null
          carbs_g?: number | null
          category: string
          cook_time_min?: number | null
          created_at?: string | null
          cuisine?: string | null
          cuisine_types?: string[] | null
          deal_description?: string | null
          deal_end_date?: string | null
          deal_percentage?: number | null
          deal_price?: number | null
          deal_start_date?: string | null
          description?: string | null
          difficulty?: string | null
          equipment?: Json | null
          fats_g?: number | null
          fiber_g?: number | null
          good_for_energy?: boolean | null
          good_for_fasting?: boolean | null
          good_for_heart_health?: boolean | null
          good_for_late_night?: boolean | null
          good_for_muscle_gain?: boolean | null
          good_for_weight_loss?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          ingredients?: Json
          instructions?: Json
          is_on_deal?: boolean | null
          is_paid?: boolean | null
          is_public?: boolean | null
          meal_types?: string[] | null
          name: string
          nutrition_breakdown?: Json | null
          original_price?: number | null
          prep_time_min?: number | null
          price?: number | null
          protein_g?: number | null
          servings?: number
          sodium_mg?: number | null
          status?: string | null
          stripe_account_id?: string | null
          sugar_g?: number | null
          tags?: string[] | null
          thumbnail_index?: number | null
          total_revenue?: number | null
          total_reviews?: number | null
          total_time_min?: number | null
          total_unlocks?: number | null
          updated_at?: string | null
          user_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          average_rating?: number | null
          calories_per_serving?: number | null
          carbs_g?: number | null
          category?: string
          cook_time_min?: number | null
          created_at?: string | null
          cuisine?: string | null
          cuisine_types?: string[] | null
          deal_description?: string | null
          deal_end_date?: string | null
          deal_percentage?: number | null
          deal_price?: number | null
          deal_start_date?: string | null
          description?: string | null
          difficulty?: string | null
          equipment?: Json | null
          fats_g?: number | null
          fiber_g?: number | null
          good_for_energy?: boolean | null
          good_for_fasting?: boolean | null
          good_for_heart_health?: boolean | null
          good_for_late_night?: boolean | null
          good_for_muscle_gain?: boolean | null
          good_for_weight_loss?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          ingredients?: Json
          instructions?: Json
          is_on_deal?: boolean | null
          is_paid?: boolean | null
          is_public?: boolean | null
          meal_types?: string[] | null
          name?: string
          nutrition_breakdown?: Json | null
          original_price?: number | null
          prep_time_min?: number | null
          price?: number | null
          protein_g?: number | null
          servings?: number
          sodium_mg?: number | null
          status?: string | null
          stripe_account_id?: string | null
          sugar_g?: number | null
          tags?: string[] | null
          thumbnail_index?: number | null
          total_revenue?: number | null
          total_reviews?: number | null
          total_time_min?: number | null
          total_unlocks?: number | null
          updated_at?: string | null
          user_id?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      rescue_recipes: {
        Row: {
          carbon_saved: number
          cooked: boolean | null
          cooked_date: string | null
          created_at: string | null
          id: string
          ingredients: Json
          instructions: string
          items_rescued: number
          money_saved: number
          rating: number | null
          recipe_name: string
          user_id: string | null
        }
        Insert: {
          carbon_saved: number
          cooked?: boolean | null
          cooked_date?: string | null
          created_at?: string | null
          id?: string
          ingredients: Json
          instructions: string
          items_rescued: number
          money_saved: number
          rating?: number | null
          recipe_name: string
          user_id?: string | null
        }
        Update: {
          carbon_saved?: number
          cooked?: boolean | null
          cooked_date?: string | null
          created_at?: string | null
          id?: string
          ingredients?: Json
          instructions?: string
          items_rescued?: number
          money_saved?: number
          rating?: number | null
          recipe_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      scanned_products: {
        Row: {
          added_to_diary: boolean | null
          approved: boolean | null
          barcode: string
          brand: string | null
          created_at: string | null
          health_score: number | null
          id: string
          nutrition_data: Json | null
          product_name: string | null
          user_id: string
        }
        Insert: {
          added_to_diary?: boolean | null
          approved?: boolean | null
          barcode: string
          brand?: string | null
          created_at?: string | null
          health_score?: number | null
          id?: string
          nutrition_data?: Json | null
          product_name?: string | null
          user_id: string
        }
        Update: {
          added_to_diary?: boolean | null
          approved?: boolean | null
          barcode?: string
          brand?: string | null
          created_at?: string | null
          health_score?: number | null
          id?: string
          nutrition_data?: Json | null
          product_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_notifications: {
        Row: {
          body: string
          created_at: string | null
          id: string
          sent: boolean | null
          title: string
          trigger_at: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          sent?: boolean | null
          title: string
          trigger_at: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          sent?: boolean | null
          title?: string
          trigger_at?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_lists: {
        Row: {
          completed_items: number | null
          created_at: string | null
          family_group_id: string | null
          goal_type: string | null
          id: string
          is_active: boolean | null
          is_shared: boolean | null
          items: Json
          name: string
          total_estimated_cost: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_items?: number | null
          created_at?: string | null
          family_group_id?: string | null
          goal_type?: string | null
          id?: string
          is_active?: boolean | null
          is_shared?: boolean | null
          items?: Json
          name: string
          total_estimated_cost?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_items?: number | null
          created_at?: string | null
          family_group_id?: string | null
          goal_type?: string | null
          id?: string
          is_active?: boolean | null
          is_shared?: boolean | null
          items?: Json
          name?: string
          total_estimated_cost?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
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
      stripe_connect_accounts: {
        Row: {
          account_type: string | null
          bank_account_verified: boolean | null
          charges_enabled: boolean | null
          country: string | null
          created_at: string | null
          currency: string | null
          details_submitted: boolean | null
          email: string | null
          id: string
          onboarding_complete: boolean | null
          payouts_enabled: boolean | null
          stripe_account_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_type?: string | null
          bank_account_verified?: boolean | null
          charges_enabled?: boolean | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          details_submitted?: boolean | null
          email?: string | null
          id?: string
          onboarding_complete?: boolean | null
          payouts_enabled?: boolean | null
          stripe_account_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_type?: string | null
          bank_account_verified?: boolean | null
          charges_enabled?: boolean | null
          country?: string | null
          created_at?: string | null
          currency?: string | null
          details_submitted?: boolean | null
          email?: string | null
          id?: string
          onboarding_complete?: boolean | null
          payouts_enabled?: boolean | null
          stripe_account_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_allergies: {
        Row: {
          allergen_name: string
          created_at: string | null
          diagnosed_by: string | null
          diagnosed_date: string | null
          id: string
          notes: string | null
          reaction_symptoms: string | null
          severity: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allergen_name: string
          created_at?: string | null
          diagnosed_by?: string | null
          diagnosed_date?: string | null
          id?: string
          notes?: string | null
          reaction_symptoms?: string | null
          severity?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allergen_name?: string
          created_at?: string | null
          diagnosed_by?: string | null
          diagnosed_date?: string | null
          id?: string
          notes?: string | null
          reaction_symptoms?: string | null
          severity?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_allergies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_biomarkers: {
        Row: {
          biomarker_name: string
          biomarker_value: number | null
          created_at: string | null
          id: string
          is_normal: boolean | null
          lab_name: string | null
          normal_range_max: number | null
          normal_range_min: number | null
          notes: string | null
          test_date: string | null
          unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          biomarker_name: string
          biomarker_value?: number | null
          created_at?: string | null
          id?: string
          is_normal?: boolean | null
          lab_name?: string | null
          normal_range_max?: number | null
          normal_range_min?: number | null
          notes?: string | null
          test_date?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          biomarker_name?: string
          biomarker_value?: number | null
          created_at?: string | null
          id?: string
          is_normal?: boolean | null
          lab_name?: string | null
          normal_range_max?: number | null
          normal_range_min?: number | null
          notes?: string | null
          test_date?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_biomarkers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_conditions: {
        Row: {
          condition_type: string
          created_at: string | null
          id: string
          notes: string | null
          user_id: string | null
        }
        Insert: {
          condition_type: string
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          condition_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_fasting: {
        Row: {
          created_at: string | null
          eating_window_end: string | null
          eating_window_start: string | null
          fasting_enabled: boolean | null
          fasting_method: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          eating_window_end?: string | null
          eating_window_start?: string | null
          fasting_enabled?: boolean | null
          fasting_method?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          eating_window_end?: string | null
          eating_window_start?: string | null
          fasting_enabled?: boolean | null
          fasting_method?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_lifestyle: {
        Row: {
          alcohol: boolean | null
          caffeine_intake: string | null
          created_at: string | null
          id: string
          sleep_hours: string | null
          smokes: boolean | null
          stress_level: string | null
          updated_at: string | null
          user_id: string | null
          water_intake: number | null
        }
        Insert: {
          alcohol?: boolean | null
          caffeine_intake?: string | null
          created_at?: string | null
          id?: string
          sleep_hours?: string | null
          smokes?: boolean | null
          stress_level?: string | null
          updated_at?: string | null
          user_id?: string | null
          water_intake?: number | null
        }
        Update: {
          alcohol?: boolean | null
          caffeine_intake?: string | null
          created_at?: string | null
          id?: string
          sleep_hours?: string | null
          smokes?: boolean | null
          stress_level?: string | null
          updated_at?: string | null
          user_id?: string | null
          water_intake?: number | null
        }
        Relationships: []
      }
      user_meds: {
        Row: {
          active: boolean | null
          created_at: string | null
          dosage: string | null
          id: string
          name: string
          purpose: string | null
          time: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          dosage?: string | null
          id?: string
          name: string
          purpose?: string | null
          time?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          dosage?: string | null
          id?: string
          name?: string
          purpose?: string | null
          time?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          ai_suggestions: boolean | null
          created_at: string | null
          daily_summary_email: boolean | null
          focus_areas: string[] | null
          health_data_tracking: boolean | null
          id: string
          meal_prep_day: string | null
          meal_prep_reminders: boolean | null
          notifications_enabled: boolean | null
          shopping_reminders: boolean | null
          shopping_time: string | null
          updated_at: string | null
          user_id: string | null
          water_interval: number | null
          water_reminders: boolean | null
          workout_reminders: boolean | null
          workout_time: string | null
        }
        Insert: {
          ai_suggestions?: boolean | null
          created_at?: string | null
          daily_summary_email?: boolean | null
          focus_areas?: string[] | null
          health_data_tracking?: boolean | null
          id?: string
          meal_prep_day?: string | null
          meal_prep_reminders?: boolean | null
          notifications_enabled?: boolean | null
          shopping_reminders?: boolean | null
          shopping_time?: string | null
          updated_at?: string | null
          user_id?: string | null
          water_interval?: number | null
          water_reminders?: boolean | null
          workout_reminders?: boolean | null
          workout_time?: string | null
        }
        Update: {
          ai_suggestions?: boolean | null
          created_at?: string | null
          daily_summary_email?: boolean | null
          focus_areas?: string[] | null
          health_data_tracking?: boolean | null
          id?: string
          meal_prep_day?: string | null
          meal_prep_reminders?: boolean | null
          notifications_enabled?: boolean | null
          shopping_reminders?: boolean | null
          shopping_time?: string | null
          updated_at?: string | null
          user_id?: string | null
          water_interval?: number | null
          water_reminders?: boolean | null
          workout_reminders?: boolean | null
          workout_time?: string | null
        }
        Relationships: []
      }
      user_taste_profiles: {
        Row: {
          avg_calories_preferred: number | null
          avg_prep_time_preferred: number | null
          created_at: string | null
          id: string
          preferred_cuisines: string[] | null
          preferred_difficulty: string | null
          preferred_meal_times: string[] | null
          preferred_tags: string[] | null
          prefers_high_protein: boolean | null
          prefers_low_carb: boolean | null
          prefers_quick_meals: boolean | null
          prefers_vegetarian: boolean | null
          taste_vector: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_calories_preferred?: number | null
          avg_prep_time_preferred?: number | null
          created_at?: string | null
          id?: string
          preferred_cuisines?: string[] | null
          preferred_difficulty?: string | null
          preferred_meal_times?: string[] | null
          preferred_tags?: string[] | null
          prefers_high_protein?: boolean | null
          prefers_low_carb?: boolean | null
          prefers_quick_meals?: boolean | null
          prefers_vegetarian?: boolean | null
          taste_vector?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_calories_preferred?: number | null
          avg_prep_time_preferred?: number | null
          created_at?: string | null
          id?: string
          preferred_cuisines?: string[] | null
          preferred_difficulty?: string | null
          preferred_meal_times?: string[] | null
          preferred_tags?: string[] | null
          prefers_high_protein?: boolean | null
          prefers_low_carb?: boolean | null
          prefers_quick_meals?: boolean | null
          prefers_vegetarian?: boolean | null
          taste_vector?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      waste_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          created_at: string | null
          description: string
          earned_date: string
          icon: string
          id: string
          milestone_value: number | null
          user_id: string | null
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          created_at?: string | null
          description: string
          earned_date: string
          icon: string
          id?: string
          milestone_value?: number | null
          user_id?: string | null
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          created_at?: string | null
          description?: string
          earned_date?: string
          icon?: string
          id?: string
          milestone_value?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      waste_log: {
        Row: {
          carbon_footprint: number
          category: string
          could_have_saved: boolean | null
          created_at: string | null
          estimated_cost: number
          id: string
          item_name: string
          quantity: number
          user_id: string | null
          waste_reason: string
          wasted_date: string
        }
        Insert: {
          carbon_footprint: number
          category: string
          could_have_saved?: boolean | null
          created_at?: string | null
          estimated_cost: number
          id?: string
          item_name: string
          quantity: number
          user_id?: string | null
          waste_reason: string
          wasted_date: string
        }
        Update: {
          carbon_footprint?: number
          category?: string
          could_have_saved?: boolean | null
          created_at?: string | null
          estimated_cost?: number
          id?: string
          item_name?: string
          quantity?: number
          user_id?: string | null
          waste_reason?: string
          wasted_date?: string
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_oz: number
          created_at: string | null
          date: string
          id: string
          time: string
          user_id: string
        }
        Insert: {
          amount_oz: number
          created_at?: string | null
          date: string
          id?: string
          time: string
          user_id: string
        }
        Update: {
          amount_oz?: number
          created_at?: string | null
          date?: string
          id?: string
          time?: string
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
          duration_min: number | null
          id: string
          name: string
          notes: string | null
          scheduled_time: string | null
          total_volume_lbs: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          date?: string
          duration_min?: number | null
          id?: string
          name: string
          notes?: string | null
          scheduled_time?: string | null
          total_volume_lbs?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          date?: string
          duration_min?: number | null
          id?: string
          name?: string
          notes?: string | null
          scheduled_time?: string | null
          total_volume_lbs?: number | null
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
      calculate_recipe_similarity: {
        Args: { p_compare_recipe_id: string; p_recipe_id: string }
        Returns: number
      }
      calculate_trending_score: {
        Args: { p_recipe_id: string }
        Returns: number
      }
      check_food_allergens: {
        Args: { p_food_name: string; p_user_id: string }
        Returns: string[]
      }
      expire_old_deals: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_low_biomarkers: {
        Args: { p_user_id: string }
        Returns: {
          biomarker_name: string
          current_value: number
          deficit: number
          normal_min: number
        }[]
      }
      increment_recipe_logs: {
        Args: { recipe_id: string }
        Returns: undefined
      }
      is_deal_active: {
        Args: { recipe: Database["public"]["Tables"]["recipes"]["Row"] }
        Returns: boolean
      }
      update_user_taste_profile: {
        Args: { p_user_id: string }
        Returns: undefined
      }
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
