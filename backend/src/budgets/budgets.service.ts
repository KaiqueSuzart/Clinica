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

  // Valores permitidos para o status de orçamentos
  private readonly statusPermitidos = ['rascunho', 'enviado', 'aprovado', 'recusado', 'cancelado'];

  // Normalizar status para garantir formato correto
  private normalizeStatus(status: string | null | undefined): string {
    if (!status) return 'rascunho'; // Status padrão
    
    const statusNormalizado = String(status).trim().toLowerCase();
    
    if (!this.statusPermitidos.includes(statusNormalizado)) {
      console.warn(`[BudgetsService] Status inválido recebido: ${status}, usando 'rascunho' como padrão`);
      return 'rascunho';
    }
    
    return statusNormalizado;
  }

  async findAll(empresaId: string): Promise<Budget[]> {
    try {
      const { data, error } = await this.supabase.getAdminClient()
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
        .eq('empresa_id', empresaId)
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

  async findOne(id: string, empresaId: string): Promise<Budget & { itens: BudgetItem[] }> {
    const { data: budget, error: budgetError } = await this.supabase.getAdminClient()
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
      .eq('empresa_id', empresaId)
      .single();

    if (budgetError) {
      throw new Error(`Erro ao buscar orçamento: ${budgetError.message}`);
    }

    const { data: itens, error: itensError } = await this.supabase.getAdminClient()
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

  async findByPatient(patientId: string, empresaId: string): Promise<Budget[]> {
    const { data, error } = await this.supabase.getAdminClient()
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
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar orçamentos do paciente: ${error.message}`);
    }

    return data || [];
  }

  async create(createBudgetDto: CreateBudgetDto, empresaId: string): Promise<Budget> {
    try {
      console.log('Iniciando criação de orçamento:', createBudgetDto);
      
      // Verificar se o Supabase está funcionando
      const client = this.supabase.getAdminClient();
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
                        empresa_id: empresaId,
                        status: this.normalizeStatus(budgetData.status)
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

  async update(id: string, updateBudgetDto: UpdateBudgetDto, empresaId: string): Promise<Budget> {
    const { itens, ...budgetData } = updateBudgetDto;

    // Normalizar status se estiver sendo atualizado
    const dataToUpdate: any = {
      ...budgetData,
      updated_at: new Date().toISOString()
    };

    if (budgetData.status !== undefined) {
      dataToUpdate.status = this.normalizeStatus(budgetData.status);
    }

    // Atualizar orçamento
    const { data: budget, error: budgetError } = await this.supabase.getAdminClient()
      .from('orcamentos')
      .update(dataToUpdate)
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .select()
      .single();

    if (budgetError) {
      throw new Error(`Erro ao atualizar orçamento: ${budgetError.message}`);
    }

    // Atualizar itens se fornecidos
    if (itens) {
      // Deletar itens existentes
      await this.supabase.getAdminClient()
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

        const { error: itensError } = await this.supabase.getAdminClient()
          .from('itens_orcamento')
          .insert(itensToInsert);

        if (itensError) {
          throw new Error(`Erro ao atualizar itens do orçamento: ${itensError.message}`);
        }
      }
    }

    return budget;
  }

  async remove(id: string, empresaId: string): Promise<{ success: boolean; message: string }> {
    // Deletar itens primeiro (devido à foreign key)
    const { error: itensError } = await this.supabase.getAdminClient()
      .from('itens_orcamento')
      .delete()
      .eq('orcamento_id', id);

    if (itensError) {
      throw new Error(`Erro ao deletar itens do orçamento: ${itensError.message}`);
    }

    // Deletar orçamento
    const { error } = await this.supabase.getAdminClient()
      .from('orcamentos')
      .delete()
      .eq('id', id)
      .eq('empresa_id', empresaId);

    if (error) {
      throw new Error(`Erro ao deletar orçamento: ${error.message}`);
    }

    return {
      success: true,
      message: 'Orçamento deletado com sucesso'
    };
  }

  async updateStatus(id: string, status: string, empresaId: string): Promise<Budget> {
    try {
      console.log('[BudgetsService.updateStatus] 📥 Atualizando status:', { id, status, empresaId });

      // Normalizar o status para garantir que está no formato correto
      const statusNormalizado = this.normalizeStatus(status);
      
      console.log('[BudgetsService.updateStatus] ✅ Status normalizado:', { original: status, normalizado: statusNormalizado });

      const { data, error } = await this.supabase.getAdminClient()
        .from('orcamentos')
        .update({
          status: statusNormalizado,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single();

      if (error) {
        console.error('[BudgetsService.updateStatus] ❌ Erro do Supabase:', error);
        throw new Error(`Erro ao atualizar status do orçamento: ${error.message}`);
      }

      if (!data) {
        console.error('[BudgetsService.updateStatus] ❌ Orçamento não encontrado após atualização');
        throw new Error('Orçamento não encontrado após atualização');
      }

      console.log('[BudgetsService.updateStatus] ✅ Status atualizado com sucesso:', { id, status, newStatus: data.status });

      // Retornar apenas os campos essenciais para evitar problemas de serialização
      return {
        id: data.id,
        status: data.status,
        updated_at: data.updated_at,
        cliente_id: data.cliente_id,
        empresa_id: data.empresa_id,
        valor_total: data.valor_total,
        valor_final: data.valor_final
      } as Budget;
    } catch (error) {
      console.error('[BudgetsService.updateStatus] ❌ Erro genérico:', error);
      throw error;
    }
  }
}
