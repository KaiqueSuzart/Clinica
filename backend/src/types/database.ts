// Tipos do schema do Supabase baseados nas tabelas atuais
// Ajuste conforme evoluir o banco

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Pacientes
      clientelA: {
        Row: {
          id: string; // no banco é int4; mantemos string para compat frontend
          nome: string | null;
          telefone: string | null;
          empresa: string | null;
          inativa: boolean | null;
          email: string | null;
          cpf: string | null;
          data_nascimento: string | null; // date ISO
          observacoes: string | null;
          status: string | null;
          ultima_visita: string | null; // timestamptz
          proximo_retorno: string | null; // date
          responsavel_nome: string | null;
          responsavel_telefone: string | null;
          responsavel_parentesco: string | null;
          created_at: string | null;
          updated_at: string | null;
          address: string | null;
          emergency_contact_name: string | null;
          emergency_contact_tel: string | null;
          observations: string | null;
        };
        Insert: Partial<Database['public']['Tables']['clientelA']['Row']> & { id?: string };
        Update: Partial<Database['public']['Tables']['clientelA']['Row']>;
      };

      // Usuários
      usuarios: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          empresa_id: string | null;
          nome: string | null;
          email: string | null;
          telefone: string | null;
          cargo: string | null;
          avatar_url: string | null;
          ativo: boolean | null;
          permissoes: Json | null;
          ultimo_login: string | null;
        };
        Insert: Partial<Database['public']['Tables']['usuarios']['Row']> & { id?: string };
        Update: Partial<Database['public']['Tables']['usuarios']['Row']>;
      };

      // Empresa
      empresa: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          nome: string | null;
          telefone_empresa: string | null;
          inativa: boolean | null;
          email_empresa: string | null;
          endereco: string | null;
          cnpj: string | null;
          logo_url: string | null;
          configuracoes: Json | null;
        };
        Insert: Partial<Database['public']['Tables']['empresa']['Row']> & { id?: string };
        Update: Partial<Database['public']['Tables']['empresa']['Row']>;
      };

      // Consultas
      consultas: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          empresa_id: string | null;
          cliente_id: string | null;
          dentista_id: string | null;
          data_consulta: string | null;
          hora_inicio: string | null;
          duracao_minutos: number | null;
          tipo_consulta: string | null;
          procedimento: string | null;
          observacoes: string | null;
          status: string | null;
          valor: number | null;
          forma_pagamento: string | null;
          pago: boolean | null;
        };
        Insert: Partial<Database['public']['Tables']['consultas']['Row']> & { id?: string };
        Update: Partial<Database['public']['Tables']['consultas']['Row']>;
      };

      // Retornos
      retornos: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          empresa_id: string | null;
          cliente_id: string | null;
          consulta_original_id: string | null;
          data_retorno: string | null;
          hora_retorno: string | null;
          motivo: string | null;
          procedimento: string | null;
          status: string | null;
          observacoes: string | null;
        };
        Insert: Partial<Database['public']['Tables']['retornos']['Row']> & { id?: string };
        Update: Partial<Database['public']['Tables']['retornos']['Row']>;
      };

      // Procedimentos (histórico/procedimentos realizados)
      procedimentos: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          empresa_id: string | null;
          cliente_id: string | null;
          consulta_id: string | null;
          nome: string | null;
          descricao: string | null;
          data_procedimento: string | null;
          dentista_id: string | null;
          custo: number | null;
          status: string | null;
          observacoes: string | null;
        };
        Insert: Partial<Database['public']['Tables']['procedimentos']['Row']> & { id?: string };
        Update: Partial<Database['public']['Tables']['procedimentos']['Row']>;
      };

      // Orçamentos
      orcamentos: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          empresa_id: string | null;
          cliente_id: string | null;
          dentista_id: string | null;
          descricao: string | null;
          valor_total: number | null;
          desconto: number | null;
          valor_final: number | null;
          status: string | null;
          data_validade: string | null;
          observacoes: string | null;
          forma_pagamento: string | null;
          parcelas: number | null;
        };
        Insert: Partial<Database['public']['Tables']['orcamentos']['Row']> & { id?: string };
        Update: Partial<Database['public']['Tables']['orcamentos']['Row']>;
      };

      itens_orcamento: {
        Row: {
          id: string;
          orcamento_id: string;
          descricao: string | null;
          quantidade: number | null;
          valor_unitario: number | null;
          valor_total: number | null;
          observacoes: string | null;
        };
        Insert: Partial<Database['public']['Tables']['itens_orcamento']['Row']> & { id?: string };
        Update: Partial<Database['public']['Tables']['itens_orcamento']['Row']>;
      };

      // Planos de tratamento
      plano_tratamento: {
        Row: {
          id: string;
          paciente_id: string;
          titulo: string;
          descricao: string | null;
          custo_total: number | null;
          progresso: number | null;
          created_at: string;
          updated_at: string;
          status: string | null;
          observacoes: string | null;
        };
        Insert: {
          id?: string;
          paciente_id: string;
          titulo: string;
          descricao?: string | null;
          custo_total?: number | null;
          progresso?: number | null;
          created_at?: string;
          updated_at?: string;
          status?: string | null;
          observacoes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['plano_tratamento']['Insert']>;
      };

      itens_plano_tratamento: {
        Row: {
          id: string;
          plano_id: string;
          procedimento: string;
          descricao: string;
          dente: string | null;
          prioridade: 'alta' | 'media' | 'baixa';
          custo_estimado: number;
          sessoes_estimadas: number;
          status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
          data_inicio: string | null;
          data_conclusao: string | null;
          observacoes: string | null;
          ordem: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plano_id: string;
          procedimento: string;
          descricao: string;
          dente?: string | null;
          prioridade?: 'alta' | 'media' | 'baixa';
          custo_estimado: number;
          sessoes_estimadas: number;
          status?: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
          data_inicio?: string | null;
          data_conclusao?: string | null;
          observacoes?: string | null;
          ordem?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['itens_plano_tratamento']['Insert']>;
      };

      treatment_sessions: {
        Row: {
          id: string;
          treatment_item_id: string;
          session_number: number;
          date: string | null;
          description: string | null;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          treatment_item_id: string;
          session_number: number;
          date?: string | null;
          description?: string | null;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['treatment_sessions']['Insert']>;
      };

      // Anamnese (campos principais + clínicos)
      anamnese: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          cliente_id: string;
          alergias: string | null;
          medicamentos_uso: string | null;
          historico_medico: string | null;
          historico_odonto: string | null;
          habitos: string | null;
          queixa_principal: string | null;
          consentimento: boolean | null;
          data_consentimento: string | null;
          diabetes: boolean | null;
          diabetes_notes: string | null;
          hipertension: boolean | null;
          hipertension_notes: string | null;
          heart_problems: boolean | null;
          heart_problems_notes: string | null;
          pregnant: boolean | null;
          pregnant_notes: string | null;
          smoking: boolean | null;
          smoking_notes: string | null;
          alcohol: boolean | null;
          alcohol_notes: string | null;
          toothache: boolean | null;
          toothache_notes: string | null;
          gum_bleeding: boolean | null;
          gum_bleeding_notes: string | null;
          sensitivity: boolean | null;
          sensitivity_notes: string | null;
          bad_breath: boolean | null;
          bad_breath_notes: string | null;
          jaw_pain: boolean | null;
          jaw_pain_notes: string | null;
          previous_treatments: boolean | null;
          previous_treatments_notes: string | null;
          orthodontics: boolean | null;
          orthodontics_notes: string | null;
          surgeries: boolean | null;
          surgeries_notes: string | null;
          anesthesia_reaction: boolean | null;
          anesthesia_reaction_notes: string | null;
        };
        Insert: Partial<Database['public']['Tables']['anamnese']['Row']> & { id?: string };
        Update: Partial<Database['public']['Tables']['anamnese']['Row']>;
      };

      // Notas privadas por cliente
      notas_cliente: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          cliente_id: string;
          usuario_id: string;
          titulo: string | null;
          conteudo: string | null;
          privada: boolean | null;
          categoria: string | null;
          tags: string | null;
        };
        Insert: Partial<Database['public']['Tables']['notas_cliente']['Row']> & { id?: string };
        Update: Partial<Database['public']['Tables']['notas_cliente']['Row']>;
      };

      // Agenda/comunicações
      agenda: {
        Row: {
          id: string;
          cliente_id: string | null;
          usuario_id: string | null;
          conteudo: string | null;
          email: string | null;
          status: string | null;
          data_envio: string | null;
          data_leitura: string | null;
          tentativas: number | null;
        };
        Insert: Partial<Database['public']['Tables']['agenda']['Row']> & { id?: string };
        Update: Partial<Database['public']['Tables']['agenda']['Row']>;
      };

      // Timeline de eventos
      timeline_eventos: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          empresa_id: string | null;
          tipo: string | null;
          titulo: string | null;
          descricao: string | null;
          data_evento: string | null;
          usuario_id: string | null;
          dados_relacionados: Json | null;
          anexos: string | null;
        };
        Insert: Partial<Database['public']['Tables']['timeline_eventos']['Row']> & { id?: string };
        Update: Partial<Database['public']['Tables']['timeline_eventos']['Row']>;
      };

      // Anotações (annotations)
      annotations: {
        Row: {
          id: number;
          patient_id: string;
          content: string;
          category: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['annotations']['Row']> & { id?: number };
        Update: Partial<Database['public']['Tables']['annotations']['Row']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];


