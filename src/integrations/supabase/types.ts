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
      alertas_sos: {
        Row: {
          atendente_id: string | null
          condominio_id: string
          created_at: string | null
          data_alerta: string | null
          data_atendimento: string | null
          descricao: string | null
          id: string
          localizacao: string | null
          morador_id: string
          status: string | null
          tipo: string
        }
        Insert: {
          atendente_id?: string | null
          condominio_id: string
          created_at?: string | null
          data_alerta?: string | null
          data_atendimento?: string | null
          descricao?: string | null
          id?: string
          localizacao?: string | null
          morador_id: string
          status?: string | null
          tipo: string
        }
        Update: {
          atendente_id?: string | null
          condominio_id?: string
          created_at?: string | null
          data_alerta?: string | null
          data_atendimento?: string | null
          descricao?: string | null
          id?: string
          localizacao?: string | null
          morador_id?: string
          status?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_sos_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_sos_morador_id_fkey"
            columns: ["morador_id"]
            isOneToOne: false
            referencedRelation: "moradores"
            referencedColumns: ["id"]
          },
        ]
      }
      avisos: {
        Row: {
          ativo: boolean | null
          autor_id: string
          condominio_id: string
          conteudo: string
          created_at: string | null
          data_expiracao: string | null
          data_publicacao: string | null
          id: string
          prioridade: string | null
          tipo: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          autor_id: string
          condominio_id: string
          conteudo: string
          created_at?: string | null
          data_expiracao?: string | null
          data_publicacao?: string | null
          id?: string
          prioridade?: string | null
          tipo?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          autor_id?: string
          condominio_id?: string
          conteudo?: string
          created_at?: string | null
          data_expiracao?: string | null
          data_publicacao?: string | null
          id?: string
          prioridade?: string | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avisos_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      blocos: {
        Row: {
          condominio_id: string
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          condominio_id: string
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          condominio_id?: string
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocos_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      condominios: {
        Row: {
          ativo: boolean | null
          cep: string
          cidade: string
          created_at: string | null
          email: string | null
          endereco: string
          estado: string
          id: string
          logo_url: string | null
          nome: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cep: string
          cidade: string
          created_at?: string | null
          email?: string | null
          endereco: string
          estado: string
          id?: string
          logo_url?: string | null
          nome: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cep?: string
          cidade?: string
          created_at?: string | null
          email?: string | null
          endereco?: string
          estado?: string
          id?: string
          logo_url?: string | null
          nome?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      encomendas: {
        Row: {
          codigo_rastreio: string | null
          condominio_id: string
          created_at: string | null
          data_notificacao: string | null
          data_recebimento: string | null
          data_retirada: string | null
          foto_url: string | null
          id: string
          morador_id: string | null
          observacao: string | null
          porteiro_entrega_id: string | null
          porteiro_recebimento_id: string
          remetente: string
          status: Database["public"]["Enums"]["package_status"] | null
          tipo: string
          unidade_id: string
          updated_at: string | null
        }
        Insert: {
          codigo_rastreio?: string | null
          condominio_id: string
          created_at?: string | null
          data_notificacao?: string | null
          data_recebimento?: string | null
          data_retirada?: string | null
          foto_url?: string | null
          id?: string
          morador_id?: string | null
          observacao?: string | null
          porteiro_entrega_id?: string | null
          porteiro_recebimento_id: string
          remetente: string
          status?: Database["public"]["Enums"]["package_status"] | null
          tipo: string
          unidade_id: string
          updated_at?: string | null
        }
        Update: {
          codigo_rastreio?: string | null
          condominio_id?: string
          created_at?: string | null
          data_notificacao?: string | null
          data_recebimento?: string | null
          data_retirada?: string | null
          foto_url?: string | null
          id?: string
          morador_id?: string | null
          observacao?: string | null
          porteiro_entrega_id?: string | null
          porteiro_recebimento_id?: string
          remetente?: string
          status?: Database["public"]["Enums"]["package_status"] | null
          tipo?: string
          unidade_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "encomendas_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encomendas_morador_id_fkey"
            columns: ["morador_id"]
            isOneToOne: false
            referencedRelation: "moradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encomendas_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      enquete_opcoes: {
        Row: {
          created_at: string | null
          enquete_id: string
          id: string
          ordem: number | null
          texto: string
        }
        Insert: {
          created_at?: string | null
          enquete_id: string
          id?: string
          ordem?: number | null
          texto: string
        }
        Update: {
          created_at?: string | null
          enquete_id?: string
          id?: string
          ordem?: number | null
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquete_opcoes_enquete_id_fkey"
            columns: ["enquete_id"]
            isOneToOne: false
            referencedRelation: "enquetes"
            referencedColumns: ["id"]
          },
        ]
      }
      enquete_votos: {
        Row: {
          created_at: string | null
          enquete_id: string
          id: string
          opcao_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enquete_id: string
          id?: string
          opcao_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          enquete_id?: string
          id?: string
          opcao_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquete_votos_enquete_id_fkey"
            columns: ["enquete_id"]
            isOneToOne: false
            referencedRelation: "enquetes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquete_votos_opcao_id_fkey"
            columns: ["opcao_id"]
            isOneToOne: false
            referencedRelation: "enquete_opcoes"
            referencedColumns: ["id"]
          },
        ]
      }
      enquetes: {
        Row: {
          ativa: boolean | null
          autor_id: string
          condominio_id: string
          created_at: string | null
          data_fim: string
          data_inicio: string | null
          descricao: string | null
          id: string
          titulo: string
        }
        Insert: {
          ativa?: boolean | null
          autor_id: string
          condominio_id: string
          created_at?: string | null
          data_fim: string
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          titulo: string
        }
        Update: {
          ativa?: boolean | null
          autor_id?: string
          condominio_id?: string
          created_at?: string | null
          data_fim?: string
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquetes_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      moradores: {
        Row: {
          created_at: string | null
          data_entrada: string | null
          data_saida: string | null
          id: string
          is_proprietario: boolean | null
          status: Database["public"]["Enums"]["resident_status"] | null
          unidade_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_entrada?: string | null
          data_saida?: string | null
          id?: string
          is_proprietario?: boolean | null
          status?: Database["public"]["Enums"]["resident_status"] | null
          unidade_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_entrada?: string | null
          data_saida?: string | null
          id?: string
          is_proprietario?: boolean | null
          status?: Database["public"]["Enums"]["resident_status"] | null
          unidade_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moradores_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      unidades: {
        Row: {
          bloco_id: string
          created_at: string | null
          id: string
          numero: string
          tipo: Database["public"]["Enums"]["unit_type"] | null
        }
        Insert: {
          bloco_id: string
          created_at?: string | null
          id?: string
          numero: string
          tipo?: Database["public"]["Enums"]["unit_type"] | null
        }
        Update: {
          bloco_id?: string
          created_at?: string | null
          id?: string
          numero?: string
          tipo?: Database["public"]["Enums"]["unit_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "unidades_bloco_id_fkey"
            columns: ["bloco_id"]
            isOneToOne: false
            referencedRelation: "blocos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          condominio_id: string
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          condominio_id: string
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          condominio_id?: string
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
        ]
      }
      visitantes: {
        Row: {
          condominio_id: string
          created_at: string | null
          data_entrada: string | null
          data_saida: string | null
          documento: string | null
          foto_url: string | null
          id: string
          nome: string
          observacao: string | null
          porteiro_id: string
          unidade_id: string
        }
        Insert: {
          condominio_id: string
          created_at?: string | null
          data_entrada?: string | null
          data_saida?: string | null
          documento?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          observacao?: string | null
          porteiro_id: string
          unidade_id: string
        }
        Update: {
          condominio_id?: string
          created_at?: string | null
          data_entrada?: string | null
          data_saida?: string | null
          documento?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          observacao?: string | null
          porteiro_id?: string
          unidade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitantes_condominio_id_fkey"
            columns: ["condominio_id"]
            isOneToOne: false
            referencedRelation: "condominios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitantes_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role_in_condominio: {
        Args: { _condominio_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _condominio_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_master: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "master" | "admin" | "portaria" | "morador"
      package_status: "recebida" | "notificada" | "retirada"
      resident_status: "pendente" | "aprovado" | "rejeitado" | "inativo"
      unit_type: "apartamento" | "casa" | "sala" | "loja"
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
      app_role: ["master", "admin", "portaria", "morador"],
      package_status: ["recebida", "notificada", "retirada"],
      resident_status: ["pendente", "aprovado", "rejeitado", "inativo"],
      unit_type: ["apartamento", "casa", "sala", "loja"],
    },
  },
} as const
