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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      buscas: {
        Row: {
          categoria: string | null
          criada_em: string
          executada_por: string | null
          id: string
          raio_km: number
          regiao: string | null
          termo_busca: string
          total_resultados: number
          total_sem_site: number
        }
        Insert: {
          categoria?: string | null
          criada_em?: string
          executada_por?: string | null
          id?: string
          raio_km?: number
          regiao?: string | null
          termo_busca: string
          total_resultados?: number
          total_sem_site?: number
        }
        Update: {
          categoria?: string | null
          criada_em?: string
          executada_por?: string | null
          id?: string
          raio_km?: number
          regiao?: string | null
          termo_busca?: string
          total_resultados?: number
          total_sem_site?: number
        }
        Relationships: []
      }
      interacoes: {
        Row: {
          criado_em: string
          descricao: string | null
          id: string
          lead_id: string
          resultado: string | null
          tipo: Database["public"]["Enums"]["interacao_tipo"]
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string
          descricao?: string | null
          id?: string
          lead_id: string
          resultado?: string | null
          tipo?: Database["public"]["Enums"]["interacao_tipo"]
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string
          descricao?: string | null
          id?: string
          lead_id?: string
          resultado?: string | null
          tipo?: Database["public"]["Enums"]["interacao_tipo"]
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interacoes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          atualizado_em: string
          avaliacao_google: number | null
          bairro: string | null
          categoria: string
          cidade: string | null
          criado_em: string
          endereco: string | null
          estado: string | null
          facebook: string | null
          id: string
          instagram: string | null
          latitude: number | null
          longitude: number | null
          nome: string
          observacoes: string | null
          origem: Database["public"]["Enums"]["lead_origem"]
          place_id: string | null
          responsavel_id: string | null
          score: number
          site_url: string | null
          status: Database["public"]["Enums"]["lead_status"]
          telefone: string | null
          tem_site: boolean
          total_avaliacoes: number
          whatsapp_link: string | null
        }
        Insert: {
          atualizado_em?: string
          avaliacao_google?: number | null
          bairro?: string | null
          categoria?: string
          cidade?: string | null
          criado_em?: string
          endereco?: string | null
          estado?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          latitude?: number | null
          longitude?: number | null
          nome: string
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["lead_origem"]
          place_id?: string | null
          responsavel_id?: string | null
          score?: number
          site_url?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          telefone?: string | null
          tem_site?: boolean
          total_avaliacoes?: number
          whatsapp_link?: string | null
        }
        Update: {
          atualizado_em?: string
          avaliacao_google?: number | null
          bairro?: string | null
          categoria?: string
          cidade?: string | null
          criado_em?: string
          endereco?: string | null
          estado?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          latitude?: number | null
          longitude?: number | null
          nome?: string
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["lead_origem"]
          place_id?: string | null
          responsavel_id?: string | null
          score?: number
          site_url?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          telefone?: string | null
          tem_site?: boolean
          total_avaliacoes?: number
          whatsapp_link?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          criado_em: string
          email: string
          id: string
          nome: string
        }
        Insert: {
          criado_em?: string
          email?: string
          id: string
          nome?: string
        }
        Update: {
          criado_em?: string
          email?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          criado_em: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "vendedor"
      interacao_tipo: "ligacao" | "whatsapp" | "email" | "visita" | "outro"
      lead_origem: "google_places" | "manual" | "importacao"
      lead_status: "novo" | "contatado" | "proposta" | "fechado" | "recusado"
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
      app_role: ["admin", "vendedor"],
      interacao_tipo: ["ligacao", "whatsapp", "email", "visita", "outro"],
      lead_origem: ["google_places", "manual", "importacao"],
      lead_status: ["novo", "contatado", "proposta", "fechado", "recusado"],
    },
  },
} as const
