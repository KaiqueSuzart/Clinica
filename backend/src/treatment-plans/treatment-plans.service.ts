import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { TreatmentSessionsService } from './treatment-sessions.service';
import { CreateTreatmentPlanDto } from './dto/create-treatment-plan.dto';
import { UpdateTreatmentPlanDto } from './dto/update-treatment-plan.dto';

@Injectable()
export class TreatmentPlansService {
  constructor(
    private supabaseService: SupabaseService,
    private sessionsService: TreatmentSessionsService
  ) {}

  async create(createTreatmentPlanDto: CreateTreatmentPlanDto) {
    const { items, ...planData } = createTreatmentPlanDto;
    
    // Calcular custo total se não fornecido
    if (!planData.totalCost) {
      planData.totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
    }

    // Calcular progresso se não fornecido
    if (!planData.progress) {
      planData.progress = 0;
    }

    // Adicionar timestamps
    const now = new Date().toISOString();
    const planWithTimestamps = {
      paciente_id: planData.patientId,
      titulo: planData.title,
      descricao: planData.description,
      custo_total: planData.totalCost,
      progresso: planData.progress,
      created_at: now,
      updated_at: now,
    };

    // Criar o plano de tratamento
    const { data: plan, error: planError } = await this.supabaseService
      .getClient()
      .from('plano_tratamento')
      .insert(planWithTimestamps)
      .select()
      .single();

    if (planError) {
      console.error('Erro ao criar plano de tratamento:', planError);
      throw planError;
    }

    // Criar os itens do plano
    const itemsWithPlanId = items.map(item => ({
      plano_id: plan.id,
      procedimento: item.procedure,
      descricao: item.description,
      dente: item.tooth,
      prioridade: item.priority,
      custo_estimado: item.estimatedCost,
      sessoes_estimadas: item.estimatedSessions,
      status: item.status,
      data_inicio: item.startDate,
      data_conclusao: item.completionDate,
      observacoes: item.notes,
      ordem: item.order,
      created_at: now,
      updated_at: now,
    }));

    const { data: createdItems, error: itemsError } = await this.supabaseService
      .getClient()
      .from('itens_plano_tratamento')
      .insert(itemsWithPlanId)
      .select();

    if (itemsError) {
      console.error('Erro ao criar itens do plano:', itemsError);
      // Se falhar ao criar itens, remover o plano criado
      await this.supabaseService
        .getClient()
        .from('plano_tratamento')
        .delete()
        .eq('id', plan.id);
      throw itemsError;
    }

    // Criar sessões para cada item
    for (const item of createdItems) {
      await this.sessionsService.createSessionsForItem(item.id, item.sessoes_estimadas);
    }

    return {
      ...plan,
      items: createdItems,
    };
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('plano_tratamento')
      .select(`
        *,
        items: itens_plano_tratamento(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Adicionar sessões para cada item
    for (const plan of data) {
      for (const item of plan.items) {
        item.sessions = await this.sessionsService.getSessionsForItem(item.id);
      }
    }

    return data;
  }

  async findByPatientId(patientId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('plano_tratamento')
      .select(`
        *,
        items: itens_plano_tratamento(*)
      `)
      .eq('paciente_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Adicionar sessões para cada item
    for (const plan of data) {
      for (const item of plan.items) {
        item.sessions = await this.sessionsService.getSessionsForItem(item.id);
      }
    }

    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('plano_tratamento')
      .select(`
        *,
        items: itens_plano_tratamento(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Plano de tratamento não encontrado');
    }

    // Adicionar sessões para cada item
    for (const item of data.items) {
      item.sessions = await this.sessionsService.getSessionsForItem(item.id);
    }

    return data;
  }

  async update(id: string, updateTreatmentPlanDto: UpdateTreatmentPlanDto) {
    // Verificar se o plano existe
    const existingPlan = await this.findOne(id);
    
    const { items, ...planData } = updateTreatmentPlanDto;
    
    // Calcular custo total se itens foram atualizados
    if (items) {
      planData.totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
      
      // Calcular progresso baseado nos itens concluídos
      const completedItems = items.filter(item => item.status === 'concluido').length;
      planData.progress = Math.round((completedItems / items.length) * 100);
    }

    // Criar objeto com dados para atualização
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (planData.patientId) updateData.paciente_id = planData.patientId;
    if (planData.title) updateData.titulo = planData.title;
    if (planData.description !== undefined) updateData.descricao = planData.description;
    if (planData.totalCost !== undefined) updateData.custo_total = planData.totalCost;
    if (planData.progress !== undefined) updateData.progresso = planData.progress;

    // Atualizar o plano
    const { data: updatedPlan, error: planError } = await this.supabaseService
      .getClient()
      .from('plano_tratamento')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (planError) throw planError;

    // Se itens foram fornecidos, atualizar os itens
    if (items) {
      // Remover itens existentes e suas sessões
      await this.supabaseService
        .getClient()
        .from('itens_plano_tratamento')
        .delete()
        .eq('plano_id', id);

      // Criar novos itens
      const now = new Date().toISOString();
      const itemsWithPlanId = items.map(item => ({
        plano_id: id,
        procedimento: item.procedure,
        descricao: item.description,
        dente: item.tooth,
        prioridade: item.priority,
        custo_estimado: item.estimatedCost,
        sessoes_estimadas: item.estimatedSessions,
        status: item.status,
        data_inicio: item.startDate,
        data_conclusao: item.completionDate,
        observacoes: item.notes,
        ordem: item.order,
        created_at: now,
        updated_at: now,
      }));

      const { data: updatedItems, error: itemsError } = await this.supabaseService
        .getClient()
        .from('itens_plano_tratamento')
        .insert(itemsWithPlanId)
        .select();

      if (itemsError) throw itemsError;

      // Criar sessões para cada novo item
      for (const item of updatedItems) {
        await this.sessionsService.createSessionsForItem(item.id, item.sessoes_estimadas);
      }

      return {
        ...updatedPlan,
        items: updatedItems,
      };
    }

    return updatedPlan;
  }

  async remove(id: string) {
    // Verificar se o plano existe
    const plan = await this.findOne(id);

    // Remover sessões primeiro
    for (const item of plan.items) {
      await this.sessionsService.deleteSessionsForItem(item.id);
    }

    // Remover itens primeiro (devido à chave estrangeira)
    const { error: itemsError } = await this.supabaseService
      .getClient()
      .from('itens_plano_tratamento')
      .delete()
      .eq('plano_id', id);

    if (itemsError) throw itemsError;

    // Remover o plano
    const { error: planError } = await this.supabaseService
      .getClient()
      .from('plano_tratamento')
      .delete()
      .eq('id', id);

    if (planError) throw planError;

    return { message: 'Plano de tratamento removido com sucesso' };
  }

  async updateItemStatus(planId: string, itemId: string, status: string) {
    // Verificar se o plano existe
    await this.findOne(planId);

    // Atualizar status do item
    const { data: updatedItem, error: itemError } = await this.supabaseService
      .getClient()
      .from('itens_plano_tratamento')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'concluido' ? { data_conclusao: new Date().toISOString() } : {}),
        ...(status === 'em_andamento' ? { data_inicio: new Date().toISOString() } : {})
      })
      .eq('id', itemId)
      .eq('plano_id', planId)
      .select()
      .single();

    if (itemError) throw itemError;

    // Recalcular progresso do plano
    const { data: items } = await this.supabaseService
      .getClient()
      .from('itens_plano_tratamento')
      .select('status')
      .eq('plano_id', planId);

    const totalItems = items.length;
    const completedItems = items.filter(item => item.status === 'concluido').length;
    const progress = Math.round((completedItems / totalItems) * 100);

    // Atualizar progresso do plano
    await this.supabaseService
      .getClient()
      .from('plano_tratamento')
      .update({ 
        progresso: progress,
        updated_at: new Date().toISOString()
      })
      .eq('id', planId);

    return updatedItem;
  }

  async updateSession(planId: string, itemId: string, sessionId: string, updates: any) {
    // Verificar se o plano existe
    await this.findOne(planId);

    // Atualizar a sessão
    const updatedSession = await this.sessionsService.updateSession(sessionId, updates);

    // Se a sessão foi marcada como concluída, verificar se todas estão concluídas
    if (updates.completed) {
      const sessions = await this.sessionsService.getSessionsForItem(itemId);
      const allCompleted = sessions.every(s => s.completed);
      
      if (allCompleted) {
        // Atualizar status do item para concluído
        await this.supabaseService
          .getClient()
          .from('itens_plano_tratamento')
          .update({ 
            status: 'concluido',
            data_conclusao: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', itemId);
      }
    }

    return updatedSession;
  }

  async getPatientTreatmentProgress(patientId: string) {
    const plans = await this.findByPatientId(patientId);
    
    if (!plans.length) {
      return {
        totalPlans: 0,
        activePlans: 0,
        completedPlans: 0,
        totalCost: 0,
        averageProgress: 0,
        recentActivity: []
      };
    }

    const activePlans = plans.filter(plan => plan.progress < 100);
    const completedPlans = plans.filter(plan => plan.progress === 100);
    const totalCost = plans.reduce((sum, plan) => sum + (plan.totalCost || 0), 0);
    const averageProgress = Math.round(
      plans.reduce((sum, plan) => sum + (plan.progress || 0), 0) / plans.length
    );

    // Buscar atividade recente
    const { data: recentActivity } = await this.supabaseService
      .getClient()
      .from('itens_plano_tratamento')
      .select(`
        *,
        plan: plano_tratamento(titulo, paciente_id)
      `)
      .eq('plan.paciente_id', patientId)
      .order('updated_at', { ascending: false })
      .limit(10);

    return {
      totalPlans: plans.length,
      activePlans: activePlans.length,
      completedPlans: completedPlans.length,
      totalCost,
      averageProgress,
      recentActivity: recentActivity || []
    };
  }
}
