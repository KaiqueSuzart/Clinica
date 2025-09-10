import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Database } from '../types/database';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

type Budget = Database['public']['Tables']['orcamentos']['Row'];
type BudgetInsert = Database['public']['Tables']['orcamentos']['Insert'];
type BudgetUpdate = Database['public']['Tables']['orcamentos']['Update'];
type BudgetItem = Database['public']['Tables']['itens_orcamento']['Row'];
type BudgetItemInsert = Database['public']['Tables']['itens_orcamento']['Insert'];
type BudgetItemUpdate = Database['public']['Tables']['itens_orcamento']['Update'];


@Injectable()
export class BudgetsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<Budget[]> {
    try {
      const { data, error } = await this.supabase.getClient()
        .from('orcamentos')
        .select(`
          *,
          clientelA:cliente_id (
            id,
            nome,
            telefone
          ),
          itens_orcamento (
            id,
            descricao,
            quantidade,
            valor_unitario,
            valor_total,
            observacoes
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar orçamentos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro na conexão com Supabase:', error);
      return [];
    }
  }

  async findOne(id: string): Promise<Budget & { itens: BudgetItem[] }> {
    const { data: budget, error: budgetError } = await this.supabase.getClient()
      .from('orcamentos')
      .select(`
        *,
        clientelA:cliente_id (
          id,
          nome,
          telefone
        ),
        itens_orcamento (
          id,
          descricao,
          quantidade,
          valor_unitario,
          valor_total,
          observacoes
        )
      `)
      .eq('id', id)
      .single();

    if (budgetError) {
      throw new Error(`Erro ao buscar orçamento: ${budgetError.message}`);
    }

    const { data: itens, error: itensError } = await this.supabase.getClient()
      .from('itens_orcamento')
      .select('*')
      .eq('orcamento_id', id)
      .order('created_at', { ascending: true });

    if (itensError) {
      throw new Error(`Erro ao buscar itens do orçamento: ${itensError.message}`);
    }

    return {
      ...budget,
      itens: itens || []
    };
  }

  async findByPatient(patientId: string): Promise<Budget[]> {
    const { data, error } = await this.supabase.getClient()
      .from('orcamentos')
      .select(`
        *,
        clientelA:cliente_id (
          id,
          nome,
          telefone
        ),
        itens_orcamento (
          id,
          descricao,
          quantidade,
          valor_unitario,
          valor_total,
          observacoes
        )
      `)
      .eq('cliente_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar orçamentos do paciente: ${error.message}`);
    }

    return data || [];
  }

  async create(createBudgetDto: CreateBudgetDto): Promise<Budget> {
    try {
      console.log('Iniciando criação de orçamento:', createBudgetDto);
      
      // Verificar se o Supabase está funcionando
      const client = this.supabase.getClient();
      if (!client) {
        throw new Error('Cliente Supabase não inicializado');
      }

      const { itens, ...budgetData } = createBudgetDto;

      // Validar dados obrigatórios
      if (!budgetData.cliente_id) {
        throw new Error('cliente_id é obrigatório');
      }
      if (!budgetData.data_validade) {
        throw new Error('data_validade é obrigatória');
      }

                    // Inserir orçamento
                    const orcamentoData = {
                        ...budgetData,
                        empresa_id: 1, // Usar ID numérico em vez de UUID
                        status: budgetData.status || 'rascunho'
                    };

      console.log('Dados do orçamento a serem inseridos:', orcamentoData);

      const { data: budget, error: budgetError } = await client
        .from('orcamentos')
        .insert(orcamentoData)
        .select()
        .single();

      if (budgetError) {
        console.error('Erro ao criar orçamento:', budgetError);
        throw new Error(`Erro ao criar orçamento: ${budgetError.message} - Código: ${budgetError.code}`);
      }

      if (!budget) {
        throw new Error('Orçamento não foi criado - dados não retornados');
      }

      console.log('Orçamento criado com sucesso:', budget);

      // Inserir itens do orçamento
      if (itens && itens.length > 0) {
        const itensToInsert: BudgetItemInsert[] = itens.map(item => ({
          orcamento_id: budget.id,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_total: item.valor_total,
          observacoes: item.observacoes
        }));

        console.log('Inserindo itens:', itensToInsert);

        const { error: itensError } = await client
          .from('itens_orcamento')
          .insert(itensToInsert);

        if (itensError) {
          console.error('Erro ao criar itens do orçamento:', itensError);
          // Se der erro ao inserir itens, deletar o orçamento criado
          await client
            .from('orcamentos')
            .delete()
            .eq('id', budget.id);
          
          throw new Error(`Erro ao criar itens do orçamento: ${itensError.message} - Código: ${itensError.code}`);
        }

        console.log('Itens inseridos com sucesso');
      }

      return budget;
    } catch (error) {
      console.error('Erro na criação do orçamento:', error);
      throw error;
    }
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto): Promise<Budget> {
    const { itens, ...budgetData } = updateBudgetDto;

    // Atualizar orçamento
    const { data: budget, error: budgetError } = await this.supabase.getClient()
      .from('orcamentos')
      .update({
        ...budgetData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (budgetError) {
      throw new Error(`Erro ao atualizar orçamento: ${budgetError.message}`);
    }

    // Atualizar itens se fornecidos
    if (itens) {
      // Deletar itens existentes
      await this.supabase.getClient()
        .from('itens_orcamento')
        .delete()
        .eq('orcamento_id', id);

      // Inserir novos itens
      if (itens.length > 0) {
        const itensToInsert: BudgetItemInsert[] = itens.map(item => ({
          orcamento_id: id,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_total: item.valor_total,
          observacoes: item.observacoes
        }));

        const { error: itensError } = await this.supabase.getClient()
          .from('itens_orcamento')
          .insert(itensToInsert);

        if (itensError) {
          throw new Error(`Erro ao atualizar itens do orçamento: ${itensError.message}`);
        }
      }
    }

    return budget;
  }

  async remove(id: string): Promise<void> {
    // Deletar itens primeiro (devido à foreign key)
    await this.supabase.getClient()
      .from('itens_orcamento')
      .delete()
      .eq('orcamento_id', id);

    // Deletar orçamento
    const { error } = await this.supabase.getClient()
      .from('orcamentos')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar orçamento: ${error.message}`);
    }
  }

  async updateStatus(id: string, status: string): Promise<Budget> {
    const { data, error } = await this.supabase.getClient()
      .from('orcamentos')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar status do orçamento: ${error.message}`);
    }

    return data;
  }
}
