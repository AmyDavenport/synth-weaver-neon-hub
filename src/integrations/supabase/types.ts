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
      branches: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          repository_id: string
          sha: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          repository_id: string
          sha?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          repository_id?: string
          sha?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      commits: {
        Row: {
          author_email: string | null
          author_name: string | null
          branch_id: string | null
          committed_at: string
          id: string
          message: string
          repository_id: string
          sha: string
        }
        Insert: {
          author_email?: string | null
          author_name?: string | null
          branch_id?: string | null
          committed_at?: string
          id?: string
          message: string
          repository_id: string
          sha: string
        }
        Update: {
          author_email?: string | null
          author_name?: string | null
          branch_id?: string | null
          committed_at?: string
          id?: string
          message?: string
          repository_id?: string
          sha?: string
        }
        Relationships: [
          {
            foreignKeyName: "commits_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commits_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      extensions: {
        Row: {
          author: string | null
          category: string
          created_at: string
          description: string | null
          downloads_count: number | null
          icon: string | null
          id: string
          is_official: boolean | null
          name: string
        }
        Insert: {
          author?: string | null
          category: string
          created_at?: string
          description?: string | null
          downloads_count?: number | null
          icon?: string | null
          id?: string
          is_official?: boolean | null
          name: string
        }
        Update: {
          author?: string | null
          category?: string
          created_at?: string
          description?: string | null
          downloads_count?: number | null
          icon?: string | null
          id?: string
          is_official?: boolean | null
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          github_access_token: string | null
          github_username: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          github_access_token?: string | null
          github_username?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          github_access_token?: string | null
          github_username?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      repositories: {
        Row: {
          clone_url: string | null
          created_at: string
          description: string | null
          forks_count: number | null
          github_full_name: string | null
          github_repo_id: string | null
          id: string
          is_synced: boolean | null
          language: string | null
          last_synced_at: string | null
          name: string
          stars_count: number | null
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          clone_url?: string | null
          created_at?: string
          description?: string | null
          forks_count?: number | null
          github_full_name?: string | null
          github_repo_id?: string | null
          id?: string
          is_synced?: boolean | null
          language?: string | null
          last_synced_at?: string | null
          name: string
          stars_count?: number | null
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          clone_url?: string | null
          created_at?: string
          description?: string | null
          forks_count?: number | null
          github_full_name?: string | null
          github_repo_id?: string | null
          id?: string
          is_synced?: boolean | null
          language?: string | null
          last_synced_at?: string | null
          name?: string
          stars_count?: number | null
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      user_extensions: {
        Row: {
          extension_id: string
          id: string
          installed_at: string
          user_id: string
        }
        Insert: {
          extension_id: string
          id?: string
          installed_at?: string
          user_id: string
        }
        Update: {
          extension_id?: string
          id?: string
          installed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_extensions_extension_id_fkey"
            columns: ["extension_id"]
            isOneToOne: false
            referencedRelation: "extensions"
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
