import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTreatmentPlanDto } from './dto/create-treatment-plan.dto';
import { UpdateTreatmentPlanDto } from './dto/update-treatment-plan.dto';

@Injectable()
export class TreatmentPlansService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(createTreatmentPlanDto: CreateTreatmentPlanDto, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      console.log('🔧 Criando plano de tratamento:', createTreatmentPlanDto);

      // Verificar se o paciente pertence à empresa usando admin client
      // Converter patientId para número se necessário
      const patientIdNum = typeof createTreatmentPlanDto.patientId === 'string' 
        ? parseInt(createTreatmentPlanDto.patientId, 10) 
        : Number(createTreatmentPlanDto.patientId);
      
      console.log('🔍 Verificando paciente:', { 
        patientIdOriginal: createTreatmentPlanDto.patientId,
        patientIdNum, 
        empresaId, 
        tipoEmpresaId: typeof empresaId,
        tipoPatientId: typeof createTreatmentPlanDto.patientId
      });
      
      const { data: paciente, error: pacienteError } = await this.supabaseService
        .getAdminClient()
        .from('clientelA')
        .select('id, empresa')
        .eq('id', patientIdNum)
        .maybeSingle();

      if (pacienteError) {
        console.error('❌ Erro ao buscar paciente:', pacienteError);
        throw new NotFoundException('Erro ao buscar paciente');
      }

      if (!paciente) {
        console.error('❌ Paciente não encontrado:', patientIdNum);
        throw new NotFoundException('Paciente não encontrado');
      }

      // Comparar convertendo ambos para string e número para garantir compatibilidade
      const pacienteEmpresaStr = paciente.empresa?.toString();
      const empresaIdStr = empresaId?.toString();
      const pacienteEmpresaNum = Number(paciente.empresa);
      const empresaIdNum = Number(empresaId);
      
      console.log('🔍 Comparando empresas:', { 
        pacienteEmpresa: paciente.empresa,
        pacienteEmpresaStr, 
        pacienteEmpresaNum,
        empresaId,
        empresaIdStr,
        empresaIdNum,
        pacienteEmpresaTipo: typeof paciente.empresa,
        empresaIdTipo: typeof empresaId,
        igualComoString: pacienteEmpresaStr === empresaIdStr,
        igualComoNumero: pacienteEmpresaNum === empresaIdNum,
        pacienteCompleto: paciente
      });

      // Verificar tanto como string quanto como número
      const empresasIguais = pacienteEmpresaStr === empresaIdStr || 
                            pacienteEmpresaNum === empresaIdNum ||
                            paciente.empresa === empresaId;

      if (!empresasIguais) {
        console.error('❌ Paciente não pertence à empresa:', { 
          pacienteEmpresa: paciente.empresa,
          pacienteEmpresaStr, 
          pacienteEmpresaNum,
          empresaId,
          empresaIdStr,
          empresaIdNum,
          patientId: patientIdNum,
          pacienteCompleto: paciente
        });
        throw new BadRequestException(`Paciente não pertence à empresa. Paciente empresa: ${pacienteEmpresaStr} (${typeof paciente.empresa}), Empresa ID: ${empresaIdStr} (${typeof empresaId})`);
      }
      
      console.log('✅ Validação de empresa passou!');

      // Criar o plano usando admin client
      // Nota: empresa_id não é necessário aqui pois já validamos que o paciente pertence à empresa
      const { data: plan, error: planError } = await this.supabaseService
        .getAdminClient()
        .from('plano_tratamento')
        .insert({
          titulo: createTreatmentPlanDto.title,
          descricao: createTreatmentPlanDto.description || '',
          paciente_id: patientIdNum,
          progresso: 0,
          custo_total: createTreatmentPlanDto.totalCost || 0,
        })
        .select()
        .single();

      if (planError) throw planError;

      console.log('✅ Plano criado:', plan);

      // Criar os itens do plano
      if (createTreatmentPlanDto.items && createTreatmentPlanDto.items.length > 0) {
        const items = [];
        for (const item of createTreatmentPlanDto.items) {
          const { data: createdItem, error: itemError } = await this.supabaseService
            .getAdminClient()
            .from('itens_plano_tratamento')
            .insert({
              plano_id: plan.id,
              procedimento: item.procedure,
              dente: item.tooth || '',
              sessoes_estimadas: item.estimatedSessions,
              custo_estimado: item.estimatedCost,
              status: item.status || 'planejado',
              observacoes: item.notes || '',
              prioridade: item.priority,
              ordem: item.order,
            })
            .select()
            .single();

          if (itemError) throw itemError;

          console.log(`📋 Item criado: ${createdItem.id} - ${item.estimatedSessions} sessões estimadas`);
          
          // Criar as sessões para este item
          if (item.estimatedSessions > 0) {
            try {
              const sessions = Array.from({ length: item.estimatedSessions }, (_, i) => ({
                treatment_item_id: createdItem.id,
                session_number: i + 1,
                completed: false
              }));

              const { data: createdSessions, error: sessionsError } = await this.supabaseService
                .getAdminClient()
                .from('treatment_sessions')
                .insert(sessions)
                .select();

              if (sessionsError) {
                console.error(`❌ Erro ao criar sessões para item ${createdItem.id}:`, sessionsError);
              } else {
                console.log(`✅ ${createdSessions.length} sessões criadas para item ${createdItem.id}`);
                createdItem.sessions = createdSessions;
                createdItem.completedSessions = 0;
              }
            } catch (sessionError) {
              console.error(`❌ Erro ao criar sessões para item ${createdItem.id}:`, sessionError);
            }
          }
          
          items.push(createdItem);
        }

        plan.items = items;
      }

      return plan;
    } catch (error) {
      console.error('❌ Erro ao criar plano de tratamento:', error);
      throw error;
    }
  }

  async findAll(empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      // Buscar IDs dos pacientes da empresa primeiro
      const { data: pacientes, error: pacientesError } = await this.supabaseService
        .getClient()
        .from('clientelA')
        .select('id')
        .eq('empresa', empresaId);

      if (pacientesError) throw pacientesError;

      const pacienteIds = pacientes?.map(p => p.id.toString()) || [];
      
      if (pacienteIds.length === 0) {
        return [];
      }

      const { data: plans, error } = await this.supabaseService
        .getClient()
        .from('plano_tratamento')
        .select(`
          *,
          paciente: clientelA(nome, Email, telefone),
          items: itens_plano_tratamento(*)
        `)
        .in('paciente_id', pacienteIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Carregar sessões para cada item
      if (plans) {
        for (const plan of plans) {
          if (plan.items) {
            for (const item of plan.items) {
              try {
                // Buscar sessões para este item
                const { data: sessions } = await this.supabaseService
                  .getClient()
                  .from('treatment_sessions')
                  .select('*')
                  .eq('treatment_item_id', item.id)
                  .order('session_number', { ascending: true });

                item.sessions = sessions || [];
                item.completedSessions = (sessions || []).filter(s => s.completed).length;
              } catch (sessionError) {
                console.log(`⚠️ Erro ao carregar sessões para item ${item.id}:`, sessionError.message);
                item.sessions = [];
                item.completedSessions = 0;
              }
            }
          }
        }
      }

      return plans;
    } catch (error) {
      console.error('❌ Erro ao buscar planos:', error);
      throw error;
    }
  }

  async findByPatientId(patientId: number, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      console.log('🔍 Buscando planos para paciente:', patientId, 'empresa:', empresaId);

      // Verificar se o paciente pertence à empresa usando admin client
      const { data: paciente, error: pacienteError } = await this.supabaseService
        .getAdminClient()
        .from('clientelA')
        .select('id, empresa')
        .eq('id', patientId)
        .maybeSingle();

      if (pacienteError) {
        console.error('❌ Erro ao buscar paciente:', pacienteError);
        // Retornar array vazio em vez de lançar erro - pode ser que o paciente não exista
        return [];
      }

      if (!paciente) {
        console.log('⚠️ Paciente não encontrado, retornando array vazio:', patientId);
        // Retornar array vazio em vez de lançar erro - pode ser que o paciente não exista ainda
        return [];
      }

      if (paciente.empresa?.toString() !== empresaId?.toString()) {
        console.log('⚠️ Paciente não pertence à empresa, retornando array vazio:', { 
          pacienteEmpresa: paciente.empresa, 
          empresaId,
          patientId 
        });
        // Retornar array vazio em vez de lançar erro - paciente pode ser de outra empresa
        return [];
      }

      const { data: plans, error } = await this.supabaseService
        .getAdminClient()
        .from('plano_tratamento')
        .select(`
          *,
          items: itens_plano_tratamento(*)
        `)
        .eq('paciente_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar planos:', error);
        // Retornar array vazio em vez de lançar erro
        return [];
      }

      // Carregar sessões para cada item
      if (plans) {
        for (const plan of plans) {
          if (plan.items) {
            for (const item of plan.items) {
              try {
                // Buscar sessões para este item
                const { data: sessions } = await this.supabaseService
                  .getClient()
                  .from('treatment_sessions')
                  .select('*')
                  .eq('treatment_item_id', item.id)
                  .order('session_number', { ascending: true });

                item.sessions = sessions || [];
                item.completedSessions = (sessions || []).filter(s => s.completed).length;
                console.log(`📋 Item ${item.id}: ${item.completedSessions}/${item.sessoes_estimadas} sessões concluídas`);
              } catch (sessionError) {
                console.log(`⚠️ Erro ao carregar sessões para item ${item.id}:`, sessionError.message);
                item.sessions = [];
                item.completedSessions = 0;
              }
            }
          }
        }
      }

      console.log(`✅ Encontrados ${plans?.length || 0} planos para paciente ${patientId}`);
      return plans || [];
    } catch (error) {
      console.error('❌ Erro ao buscar planos do paciente:', error);
      // Retornar array vazio em vez de lançar erro
      return [];
    }
  }

  async findOne(id: string, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      const { data: plan, error } = await this.supabaseService
        .getClient()
        .from('plano_tratamento')
        .select(`
          *,
          paciente: clientelA(empresa, nome, Email, telefone),
          items: itens_plano_tratamento(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Verificar se o paciente pertence à empresa
      if (!plan || plan.paciente?.empresa !== empresaId) {
        throw new NotFoundException('Plano de tratamento não encontrado');
      }

      // Carregar sessões para cada item
      if (plan && plan.items) {
        for (const item of plan.items) {
          try {
            // Buscar sessões para este item
            const { data: sessions } = await this.supabaseService
              .getClient()
              .from('treatment_sessions')
              .select('*')
              .eq('treatment_item_id', item.id)
              .order('session_number', { ascending: true });

            item.sessions = sessions || [];
            item.completedSessions = (sessions || []).filter(s => s.completed).length;
          } catch (sessionError) {
            console.log(`⚠️ Erro ao carregar sessões para item ${item.id}:`, sessionError.message);
            item.sessions = [];
            item.completedSessions = 0;
          }
        }
      }

      return plan;
    } catch (error) {
      console.error('❌ Erro ao buscar plano:', error);
      throw error;
    }
  }

  async update(id: string, updateTreatmentPlanDto: UpdateTreatmentPlanDto, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      console.log('🔧 Atualizando plano:', id);
      console.log('📋 Dados recebidos:', JSON.stringify(updateTreatmentPlanDto, null, 2));

      // Verificar se o plano pertence à empresa antes de atualizar
      const { data: existingPlan, error: checkError } = await this.supabaseService
        .getClient()
        .from('plano_tratamento')
        .select(`
          *,
          paciente: clientelA(empresa)
        `)
        .eq('id', id)
        .single();

      if (checkError || !existingPlan) {
        throw new NotFoundException('Plano de tratamento não encontrado');
      }

      if (existingPlan.paciente?.empresa !== empresaId) {
        throw new NotFoundException('Plano de tratamento não encontrado');
      }

      // 1. Atualizar o plano principal
      const { data: plan, error: planError } = await this.supabaseService
        .getClient()
        .from('plano_tratamento')
        .update({
          titulo: updateTreatmentPlanDto.title,
          descricao: updateTreatmentPlanDto.description,
          custo_total: updateTreatmentPlanDto.totalCost,
          progresso: updateTreatmentPlanDto.progress,
        })
        .eq('id', id)
        .select()
        .single();

      if (planError) throw planError;

      // 2. Atualizar os itens se fornecidos
      if (updateTreatmentPlanDto.items) {
        console.log('🔧 Atualizando/criando itens do plano...');
        
        // Primeiro, buscar itens existentes para preservar as sessões
        const { data: existingItems, error: fetchError } = await this.supabaseService
          .getClient()
          .from('itens_plano_tratamento')
          .select('*, treatment_sessions(*)')
          .eq('plano_id', id);

        if (fetchError) {
          console.error('❌ Erro ao buscar itens existentes:', fetchError);
          throw fetchError;
        }

        console.log('📋 Itens existentes encontrados:', existingItems?.length || 0);

        // Limpar itens existentes primeiro
        await this.supabaseService
          .getClient()
          .from('itens_plano_tratamento')
          .delete()
          .eq('plano_id', id);

        // Inserir novos itens
        for (const [index, item] of updateTreatmentPlanDto.items.entries()) {
          console.log(`🔧 Processando item ${index + 1}:`, item);
          
          const itemData = {
            plano_id: id,
            procedimento: item.procedure,
            descricao: item.description || '',
            dente: item.tooth || '',
            prioridade: item.priority || 'media',
            custo_estimado: item.estimatedCost || 0,
            sessoes_estimadas: item.estimatedSessions || 1,
            status: item.status || 'planejado',
            observacoes: item.notes || '',
            ordem: item.order || index + 1,
            data_inicio: item.startDate || null,
            data_conclusao: item.completionDate || null,
          };
          
          console.log(`📤 Dados do item para inserir:`, itemData);
          
          const { data: newItem, error: itemError } = await this.supabaseService
            .getClient()
            .from('itens_plano_tratamento')
            .insert(itemData)
            .select()
            .single();

          if (itemError) {
            console.error('❌ Erro ao inserir item:', itemError);
            console.error('❌ Dados que causaram erro:', itemData);
            throw itemError;
          }
          
          console.log(`✅ Item ${index + 1} inserido com sucesso:`, newItem);

          // Verificar se este item já existia e tinha sessões
          let existingSessions = [];
          if (item.id && existingItems) {
            const existingItem = existingItems.find(ei => ei.id === item.id);
            if (existingItem && existingItem.treatment_sessions) {
              existingSessions = existingItem.treatment_sessions;
              console.log(`📋 Encontradas ${existingSessions.length} sessões existentes para preservar`);
            }
          }

          // Se o item veio com sessões do frontend, ajustar baseado no estimatedSessions
          if (item.sessions && item.sessions.length > 0) {
            console.log(`📋 Sessões recebidas do frontend: ${item.sessions.length}, mas estimatedSessions: ${item.estimatedSessions}`);
            
            // Filtrar apenas as sessões que devem existir baseado no estimatedSessions
            const validSessions = item.sessions
              .filter(session => session.session_number <= item.estimatedSessions)
              .slice(0, item.estimatedSessions); // Garantir que não exceda o limite
            
            console.log(`📋 Criando ${validSessions.length} sessões válidas`);
            
            for (const session of validSessions) {
              const sessionData = {
                treatment_item_id: newItem.id,
                session_number: session.session_number || session.sessionNumber,
                completed: session.completed || false,
                date: session.date || null,
                description: session.description || '',
              };

              const { error: sessionError } = await this.supabaseService
                .getClient()
                .from('treatment_sessions')
                .insert(sessionData);

              if (sessionError) {
                console.error('❌ Erro ao inserir sessão:', sessionError);
              } else {
                console.log(`✅ Sessão ${sessionData.session_number} inserida (completed: ${sessionData.completed})`);
              }
            }

            // Se ainda precisamos de mais sessões para completar o estimatedSessions
            if (validSessions.length < item.estimatedSessions) {
              const additionalSessionsNeeded = item.estimatedSessions - validSessions.length;
              console.log(`📋 Criando ${additionalSessionsNeeded} sessões adicionais para completar ${item.estimatedSessions}`);
              
              for (let sessionNumber = validSessions.length + 1; sessionNumber <= item.estimatedSessions; sessionNumber++) {
                const sessionData = {
                  treatment_item_id: newItem.id,
                  session_number: sessionNumber,
                  completed: false,
                  date: null,
                  description: '',
                };

                const { error: sessionError } = await this.supabaseService
                  .getClient()
                  .from('treatment_sessions')
                  .insert(sessionData);

                if (sessionError) {
                  console.error('❌ Erro ao criar sessão adicional:', sessionError);
                } else {
                  console.log(`✅ Sessão adicional ${sessionNumber} criada`);
                }
              }
            }
          } else if (existingSessions.length > 0) {
            // Preservar sessões existentes se o item foi encontrado
            console.log(`📋 Preservando ${existingSessions.length} sessões existentes`);
            
            for (const session of existingSessions) {
              const sessionData = {
                treatment_item_id: newItem.id,
                session_number: session.session_number,
                completed: session.completed || false,
                date: session.date || null,
                description: session.description || '',
              };

              const { error: sessionError } = await this.supabaseService
                .getClient()
                .from('treatment_sessions')
                .insert(sessionData);

              if (sessionError) {
                console.error('❌ Erro ao preservar sessão:', sessionError);
              } else {
                console.log(`✅ Sessão ${sessionData.session_number} preservada`);
              }
            }

            // Se o número de sessões estimadas aumentou, criar as sessões adicionais
            if (item.estimatedSessions > existingSessions.length) {
              const additionalSessions = item.estimatedSessions - existingSessions.length;
              console.log(`📋 Criando ${additionalSessions} sessões adicionais`);
              
              for (let sessionNumber = existingSessions.length + 1; sessionNumber <= item.estimatedSessions; sessionNumber++) {
                const sessionData = {
                  treatment_item_id: newItem.id,
                  session_number: sessionNumber,
                  completed: false,
                  date: null,
                  description: '',
                };

                const { error: sessionError } = await this.supabaseService
                  .getClient()
                  .from('treatment_sessions')
                  .insert(sessionData);

                if (sessionError) {
                  console.error('❌ Erro ao criar sessão adicional:', sessionError);
                } else {
                  console.log(`✅ Sessão adicional ${sessionNumber} criada`);
                }
              }
            }
          } else {
            // Criar sessões do zero para item novo
            console.log(`📋 Criando ${item.estimatedSessions} sessões do zero`);
            const sessionsToCreate = [];
            for (let sessionNumber = 1; sessionNumber <= item.estimatedSessions; sessionNumber++) {
              sessionsToCreate.push({
                treatment_item_id: newItem.id,
                session_number: sessionNumber,
                completed: false,
                date: null,
                description: '',
              });
            }

            if (sessionsToCreate.length > 0) {
              const { error: sessionsError } = await this.supabaseService
                .getClient()
                .from('treatment_sessions')
                .insert(sessionsToCreate);

              if (sessionsError) {
                console.error('❌ Erro ao criar sessões:', sessionsError);
              } else {
                console.log(`✅ Criadas ${sessionsToCreate.length} sessões para item ${newItem.id}`);
              }
            }
          }
        }
      }

      // 3. Recalcular e atualizar o progresso APÓS todas as sessões serem criadas
      console.log('🔄 Recalculando progresso do plano após atualizar sessões...');
      
      // Buscar todos os itens do plano atualizado
      const { data: updatedItems, error: itemsError } = await this.supabaseService
        .getClient()
        .from('itens_plano_tratamento')
        .select('id')
        .eq('plano_id', id);

      if (!itemsError && updatedItems && updatedItems.length > 0) {
        // Buscar todas as sessões dos itens atualizados
        const itemIds = updatedItems.map(item => item.id);
        const { data: allSessions, error: sessionsError } = await this.supabaseService
          .getClient()
          .from('treatment_sessions')
          .select('completed')
          .in('treatment_item_id', itemIds);

        if (!sessionsError && allSessions) {
          const totalSessions = allSessions.length;
          const completedSessions = allSessions.filter(session => session.completed).length;
          const newProgress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
          
          console.log(`📊 Progresso recalculado APÓS atualização: ${completedSessions}/${totalSessions} = ${newProgress}%`);
          
          // Atualizar o progresso no banco
          await this.supabaseService
            .getClient()
            .from('plano_tratamento')
            .update({ progresso: newProgress })
            .eq('id', id);
        } else {
          console.log('⚠️ Erro ao buscar sessões para recálculo ou nenhuma sessão encontrada');
        }
      } else {
        console.log('⚠️ Erro ao buscar itens para recálculo ou nenhum item encontrado');
      }

      // 4. Retornar o plano completo com itens atualizados
      console.log('✅ Atualizações concluídas, buscando plano completo...');
      return await this.findOne(id, empresaId);
    } catch (error) {
      console.error('❌ Erro ao atualizar plano:', error);
      console.error('❌ Stack trace:', error.stack);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
  }

  async remove(id: string, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      // Verificar se o plano pertence à empresa antes de deletar
      const { data: plan, error: checkError } = await this.supabaseService
        .getClient()
        .from('plano_tratamento')
        .select(`
          *,
          paciente: clientelA(empresa)
        `)
        .eq('id', id)
        .single();

      if (checkError || !plan) {
        throw new NotFoundException('Plano de tratamento não encontrado');
      }

      if (plan.paciente?.empresa !== empresaId) {
        throw new NotFoundException('Plano de tratamento não encontrado');
      }

      const { error } = await this.supabaseService
        .getClient()
        .from('plano_tratamento')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { message: 'Plano removido com sucesso' };
    } catch (error) {
      console.error('❌ Erro ao remover plano:', error);
      throw error;
    }
  }

  async getPatientTreatmentProgress(patientId: number, empresaId: string) {
    try {
      const plans = await this.findByPatientId(patientId, empresaId);
      
      // Se não há planos, retornar progresso zerado
      if (!plans || plans.length === 0) {
        return {
          totalSessions: 0,
          completedSessions: 0,
          progress: 0,
        };
      }
      
      let totalSessions = 0;
      let completedSessions = 0;

      for (const plan of plans) {
        if (plan.items) {
          for (const item of plan.items) {
            // Usar sessões estimadas e completadas em vez de status
            const estimatedSessions = item.sessoes_estimadas || 0;
            const itemCompletedSessions = item.completedSessions || 0;
            
            totalSessions += estimatedSessions;
            completedSessions += itemCompletedSessions;
            
            console.log(`📊 Item ${item.procedimento}: ${itemCompletedSessions}/${estimatedSessions} sessões`);
          }
        }
      }

      const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
      
      console.log(`📊 Progresso total: ${completedSessions}/${totalSessions} = ${progress}%`);
      
      return {
        totalSessions,
        completedSessions,
        progress,
      };
    } catch (error) {
      console.error('❌ Erro ao calcular progresso:', error);
      // Retornar progresso zerado em vez de lançar erro
      return {
        totalSessions: 0,
        completedSessions: 0,
        progress: 0,
      };
    }
  }

  async updateProgress(id: string, progress: number, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      console.log('🔍 [updateProgress] Buscando plano:', { id, progress, empresaId });
      
      // Buscar o plano primeiro
      const { data: plan, error: checkError } = await this.supabaseService
        .getAdminClient()
        .from('plano_tratamento')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (checkError) {
        console.error('❌ [updateProgress] Erro ao buscar plano:', checkError);
        throw new NotFoundException('Erro ao buscar plano de tratamento');
      }

      if (!plan) {
        console.error('❌ [updateProgress] Plano não encontrado:', id);
        throw new NotFoundException('Plano de tratamento não encontrado');
      }

      console.log('🔍 [updateProgress] Plano encontrado:', {
        planId: plan.id,
        pacienteId: plan.paciente_id
      });

      // Buscar o paciente separadamente para verificar a empresa
      const { data: paciente, error: pacienteError } = await this.supabaseService
        .getAdminClient()
        .from('clientelA')
        .select('id, empresa')
        .eq('id', plan.paciente_id)
        .maybeSingle();

      if (pacienteError) {
        console.error('❌ [updateProgress] Erro ao buscar paciente:', pacienteError);
        throw new NotFoundException('Erro ao buscar paciente do plano');
      }

      if (!paciente) {
        console.error('❌ [updateProgress] Paciente não encontrado:', plan.paciente_id);
        throw new NotFoundException('Paciente do plano não encontrado');
      }

      console.log('🔍 [updateProgress] Paciente encontrado:', {
        pacienteId: paciente.id,
        pacienteEmpresa: paciente.empresa,
        empresaId,
        tipos: {
          pacienteEmpresa: typeof paciente.empresa,
          empresaId: typeof empresaId
        }
      });

      // Comparação robusta de empresa_id
      const pacienteEmpresaStr = paciente.empresa?.toString();
      const empresaIdStr = empresaId?.toString();
      const pacienteEmpresaNum = Number(paciente.empresa);
      const empresaIdNum = Number(empresaId);

      let isSameEmpresa = false;
      if (pacienteEmpresaStr === empresaIdStr) {
        isSameEmpresa = true;
        console.log('✅ [updateProgress] Comparação string passou');
      } else if (pacienteEmpresaNum === empresaIdNum && !isNaN(pacienteEmpresaNum) && !isNaN(empresaIdNum)) {
        isSameEmpresa = true;
        console.log('✅ [updateProgress] Comparação número passou');
      } else if (paciente.empresa === empresaId) {
        isSameEmpresa = true;
        console.log('✅ [updateProgress] Comparação direta passou');
      }

      if (!isSameEmpresa) {
        console.error('❌ [updateProgress] Plano não pertence à empresa:', {
          pacienteEmpresa: pacienteEmpresaStr,
          empresaId: empresaIdStr,
          pacienteEmpresaNum,
          empresaIdNum
        });
        throw new NotFoundException('Plano de tratamento não encontrado');
      }

      console.log('✅ [updateProgress] Validado, atualizando progresso para:', progress);

      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('plano_tratamento')
        .update({ progresso: progress })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ [updateProgress] Erro ao atualizar:', error);
        throw error;
      }

      console.log('✅ [updateProgress] Progresso atualizado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao atualizar progresso:', error);
      throw error;
    }
  }

  async updateItemStatus(planId: string, itemId: string, status: string, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      // Verificar se o plano pertence à empresa
      const { data: plan, error: checkError } = await this.supabaseService
        .getClient()
        .from('plano_tratamento')
        .select(`
          *,
          paciente: clientelA(empresa)
        `)
        .eq('id', planId)
        .single();

      if (checkError || !plan) {
        throw new NotFoundException('Plano de tratamento não encontrado');
      }

      if (plan.paciente?.empresa !== empresaId) {
        throw new NotFoundException('Plano de tratamento não encontrado');
      }

      const { data, error } = await this.supabaseService
        .getClient()
        .from('itens_plano_tratamento')
        .update({ status })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erro ao atualizar status do item:', error);
      throw error;
    }
  }

  async updateSession(planId: string, itemId: string, sessionId: string, updates: any, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      console.log('🔧 Atualizando sessão:', { planId, itemId, sessionId, updates });
      
      // Verificar se o plano pertence à empresa
      const { data: plan, error: checkError } = await this.supabaseService
        .getClient()
        .from('plano_tratamento')
        .select(`
          *,
          paciente: clientelA(empresa)
        `)
        .eq('id', planId)
        .single();

      if (checkError || !plan) {
        throw new NotFoundException('Plano de tratamento não encontrado');
      }

      if (plan.paciente?.empresa !== empresaId) {
        throw new NotFoundException('Plano de tratamento não encontrado');
      }
      
      // Atualizar a sessão
      const { data: updatedSession, error: sessionError } = await this.supabaseService
        .getClient()
        .from('treatment_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Se a sessão foi marcada como concluída, verificar se todas estão concluídas
      if (updates.completed) {
        const { data: allSessions, error: sessionsError } = await this.supabaseService
          .getClient()
          .from('treatment_sessions')
          .select('completed')
          .eq('treatment_item_id', itemId);

        if (sessionsError) throw sessionsError;

        const allCompleted = allSessions.every(s => s.completed);
        
        if (allCompleted) {
          // Atualizar status do item para concluído
          await this.supabaseService
            .getClient()
            .from('itens_plano_tratamento')
            .update({ 
              status: 'concluido',
              data_conclusao: new Date().toISOString()
            })
            .eq('id', itemId);
        }
      }

      return updatedSession;
    } catch (error) {
      console.error('❌ Erro ao atualizar sessão:', error);
      throw error;
    }
  }

  async updateSessionDirect(sessionId: string, updates: any, empresaId: string) {
    if (!empresaId) {
      throw new BadRequestException('Empresa ID é obrigatório');
    }

    try {
      console.log('🔧 [updateSessionDirect] Atualizando sessão diretamente:', { sessionId, updates, empresaId });
      
      // Primeiro, buscar a sessão para obter o treatment_item_id
      const { data: session, error: sessionError } = await this.supabaseService
        .getAdminClient()
        .from('treatment_sessions')
        .select('treatment_item_id')
        .eq('id', sessionId)
        .maybeSingle();

      if (sessionError) {
        console.error('❌ [updateSessionDirect] Erro ao buscar sessão:', sessionError);
        throw new NotFoundException('Erro ao buscar sessão');
      }

      if (!session) {
        console.error('❌ [updateSessionDirect] Sessão não encontrada:', sessionId);
        throw new NotFoundException('Sessão não encontrada');
      }

      console.log('🔍 [updateSessionDirect] Sessão encontrada:', { sessionId, treatmentItemId: session.treatment_item_id });

      // Buscar o item do plano
      const { data: item, error: itemError } = await this.supabaseService
        .getAdminClient()
        .from('itens_plano_tratamento')
        .select('plano_id')
        .eq('id', session.treatment_item_id)
        .maybeSingle();

      if (itemError) {
        console.error('❌ [updateSessionDirect] Erro ao buscar item:', itemError);
        throw new NotFoundException('Erro ao buscar item do plano');
      }

      if (!item) {
        console.error('❌ [updateSessionDirect] Item não encontrado:', session.treatment_item_id);
        throw new NotFoundException('Item do plano não encontrado');
      }

      console.log('🔍 [updateSessionDirect] Item encontrado:', { itemId: session.treatment_item_id, planId: item.plano_id });

      // Buscar o plano primeiro
      const { data: plan, error: planError } = await this.supabaseService
        .getAdminClient()
        .from('plano_tratamento')
        .select('*')
        .eq('id', item.plano_id)
        .maybeSingle();

      if (planError) {
        console.error('❌ [updateSessionDirect] Erro ao buscar plano:', planError);
        throw new NotFoundException('Erro ao buscar plano de tratamento');
      }

      if (!plan) {
        console.error('❌ [updateSessionDirect] Plano não encontrado:', item.plano_id);
        throw new NotFoundException('Plano de tratamento não encontrado');
      }

      console.log('🔍 [updateSessionDirect] Plano encontrado:', { planId: plan.id, pacienteId: plan.paciente_id });

      // Buscar o paciente separadamente para verificar a empresa
      const { data: paciente, error: pacienteError } = await this.supabaseService
        .getAdminClient()
        .from('clientelA')
        .select('id, empresa')
        .eq('id', plan.paciente_id)
        .maybeSingle();

      if (pacienteError) {
        console.error('❌ [updateSessionDirect] Erro ao buscar paciente:', pacienteError);
        throw new NotFoundException('Erro ao buscar paciente do plano');
      }

      if (!paciente) {
        console.error('❌ [updateSessionDirect] Paciente não encontrado:', plan.paciente_id);
        throw new NotFoundException('Paciente do plano não encontrado');
      }

      console.log('🔍 [updateSessionDirect] Paciente encontrado:', {
        pacienteId: paciente.id,
        pacienteEmpresa: paciente.empresa,
        empresaId,
        tipos: {
          pacienteEmpresa: typeof paciente.empresa,
          empresaId: typeof empresaId
        }
      });

      // Comparação robusta de empresa_id
      const pacienteEmpresaStr = paciente.empresa?.toString();
      const empresaIdStr = empresaId?.toString();
      const pacienteEmpresaNum = Number(paciente.empresa);
      const empresaIdNum = Number(empresaId);

      let isSameEmpresa = false;
      if (pacienteEmpresaStr === empresaIdStr) {
        isSameEmpresa = true;
        console.log('✅ [updateSessionDirect] Comparação string passou');
      } else if (pacienteEmpresaNum === empresaIdNum && !isNaN(pacienteEmpresaNum) && !isNaN(empresaIdNum)) {
        isSameEmpresa = true;
        console.log('✅ [updateSessionDirect] Comparação número passou');
      } else if (paciente.empresa === empresaId) {
        isSameEmpresa = true;
        console.log('✅ [updateSessionDirect] Comparação direta passou');
      }

      if (!isSameEmpresa) {
        console.error('❌ [updateSessionDirect] Sessão não pertence à empresa:', {
          pacienteEmpresa: pacienteEmpresaStr,
          empresaId: empresaIdStr
        });
        throw new NotFoundException('Sessão não encontrada');
      }

      // Agora atualizar a sessão
      console.log('✅ [updateSessionDirect] Validação passou, atualizando sessão');
      const { data: updatedSession, error: updateError } = await this.supabaseService
        .getAdminClient()
        .from('treatment_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [updateSessionDirect] Erro ao atualizar sessão:', updateError);
        throw updateError;
      }

      console.log('✅ [updateSessionDirect] Sessão atualizada com sucesso:', updatedSession);

      // Se a sessão foi marcada como concluída, verificar se todas estão concluídas
      if (updates.completed) {
        const { data: allSessions, error: sessionsError } = await this.supabaseService
          .getAdminClient()
          .from('treatment_sessions')
          .select('completed')
          .eq('treatment_item_id', session.treatment_item_id);

        if (sessionsError) {
          console.error('❌ [updateSessionDirect] Erro ao buscar todas as sessões:', sessionsError);
          throw sessionsError;
        }

        const allCompleted = allSessions.every(s => s.completed);
        
        if (allCompleted) {
          // Atualizar status do item para concluído
          console.log('✅ [updateSessionDirect] Todas as sessões concluídas, atualizando status do item');
          await this.supabaseService
            .getAdminClient()
            .from('itens_plano_tratamento')
            .update({ 
              status: 'concluido',
              data_conclusao: new Date().toISOString()
            })
            .eq('id', session.treatment_item_id);
        }
      }

      console.log('✅ Sessão atualizada com sucesso:', updatedSession);
      return updatedSession;
    } catch (error) {
      console.error('❌ Erro ao atualizar sessão diretamente:', error);
      throw error;
    }
  }

  async setupSessionsTable() {
    try {
      console.log('🔧 Verificando tabela de sessões...');
      
      // Verificar se a tabela existe
      const { data: tableExists, error: checkError } = await this.supabaseService
        .getClient()
        .from('treatment_sessions')
        .select('id')
        .limit(1);

      if (checkError) {
        console.log('❌ Tabela treatment_sessions não existe:', checkError.message);
        return { message: 'Tabela treatment_sessions não existe. Execute o script SQL primeiro.' };
      }

      console.log('✅ Tabela treatment_sessions existe');
      
      // Buscar itens existentes
      const { data: items, error: itemsError } = await this.supabaseService
        .getClient()
        .from('itens_plano_tratamento')
        .select('id, sessoes_estimadas, procedimento');

      if (itemsError) throw itemsError;

      console.log(`📋 Encontrados ${items?.length || 0} itens de tratamento`);
      
      return { 
        message: 'Tabela verificada com sucesso', 
        itemsCount: items?.length || 0 
      };
    } catch (error) {
      console.error('❌ Erro ao verificar tabela:', error);
      throw error;
    }
  }

  async populateExistingSessions() {
    try {
      console.log('🔧 Populando sessões existentes para paciente 12...');
      
      // Buscar itens do paciente 12
      const { data: items, error: itemsError } = await this.supabaseService
        .getClient()
        .from('itens_plano_tratamento')
        .select(`
          id,
          procedimento,
          sessoes_estimadas,
          plano_tratamento!plano_id(paciente_id)
        `)
        .eq('plano_tratamento.paciente_id', 12);

      if (itemsError) throw itemsError;

      console.log(`📋 Encontrados ${items?.length || 0} itens para popular`);

      let populatedCount = 0;

      for (const item of items || []) {
        const { procedimento, sessoes_estimadas, id: itemId } = item;
        
        // Verificar se já existem sessões para este item
        const { data: existingSessions } = await this.supabaseService
          .getClient()
          .from('treatment_sessions')
          .select('id')
          .eq('treatment_item_id', itemId);

        if (existingSessions && existingSessions.length > 0) {
          console.log(`⚠️ Item ${procedimento} já tem sessões, pulando...`);
          continue;
        }

        // Criar sessões baseado no tipo de procedimento
        let completedSessions = 0;
        
        if (procedimento === 'Clareamento') {
          completedSessions = 4; // 4 de 4 completas
        } else if (procedimento === 'Cirurgia') {
          completedSessions = 2; // 2 de 4 completas
        } else {
          completedSessions = 0; // 0 completas para Limpeza e Prótese
        }

        // Criar as sessões
        for (let sessionNum = 1; sessionNum <= sessoes_estimadas; sessionNum++) {
          const isCompleted = sessionNum <= completedSessions;
          
          const { error: sessionError } = await this.supabaseService
            .getClient()
            .from('treatment_sessions')
            .insert({
              treatment_item_id: itemId,
              session_number: sessionNum,
              completed: isCompleted,
              date: isCompleted ? new Date().toISOString().split('T')[0] : null,
              description: `Sessão ${sessionNum} - ${isCompleted ? 'Concluída' : 'Pendente'}`,
            });

          if (sessionError) {
            console.error(`❌ Erro ao criar sessão ${sessionNum} para ${procedimento}:`, sessionError);
          } else {
            populatedCount++;
            console.log(`✅ Sessão ${sessionNum} criada para ${procedimento} (${isCompleted ? 'Concluída' : 'Pendente'})`);
          }
        }
      }

      return {
        message: `Sessões populadas com sucesso!`,
        populatedCount,
        itemsProcessed: items?.length || 0
      };
    } catch (error) {
      console.error('❌ Erro ao popular sessões:', error);
      throw error;
    }
  }

  async fixAllProgress() {
    try {
      console.log('🔧 Corrigindo progresso de todos os planos...');
      
      // Buscar todos os planos
      const { data: plans, error: plansError } = await this.supabaseService
        .getClient()
        .from('plano_tratamento')
        .select('id, titulo');

      if (plansError) throw plansError;

      let totalPlansFixed = 0;

      for (const plan of plans) {
        try {
          // Buscar itens do plano
          const { data: items, error: itemsError } = await this.supabaseService
            .getClient()
            .from('itens_plano_tratamento')
            .select('id, sessoes_estimadas, completedSessions')
            .eq('plano_id', plan.id);

          if (itemsError) throw itemsError;

          if (items && items.length > 0) {
            // Calcular progresso real baseado nas sessões
            let totalSessions = 0;
            let completedSessions = 0;

            for (const item of items) {
              totalSessions += item.sessoes_estimadas || 0;
              completedSessions += item.completedSessions || 0;
            }

            const realProgress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

            // Atualizar o progresso do plano
            const { error: updateError } = await this.supabaseService
              .getClient()
              .from('plano_tratamento')
              .update({ 
                progresso: realProgress,
                updated_at: new Date().toISOString()
              })
              .eq('id', plan.id);

            if (updateError) throw updateError;
            totalPlansFixed++;
            console.log(`✅ Plano "${plan.titulo}" corrigido: ${realProgress}% (${completedSessions}/${totalSessions} sessões)`);
          }
        } catch (planError) {
          console.log(`⚠️ Erro ao corrigir plano ${plan.id}:`, planError.message);
        }
      }

      return {
        message: 'Progresso de todos os planos corrigido com sucesso!',
        totalPlansFixed,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao corrigir progresso:', error);
      throw error;
    }
  }

  async fixAllCompletedSessions() {
    try {
      console.log('🔧 Corrigindo completedSessions de todos os itens...');
      
      // Buscar todos os itens
      const { data: items, error: itemsError } = await this.supabaseService
        .getClient()
        .from('itens_plano_tratamento')
        .select('id, procedimento, sessoes_estimadas');

      if (itemsError) throw itemsError;

      let totalItemsFixed = 0;

      for (const item of items) {
        try {
          // Buscar sessões para este item
          const { data: sessions, error: sessionsError } = await this.supabaseService
            .getClient()
            .from('treatment_sessions')
            .select('completed')
            .eq('treatment_item_id', item.id);

          if (sessionsError) throw sessionsError;

          // Calcular sessões completadas
          const completedCount = (sessions || []).filter(s => s.completed).length;

          // Atualizar o campo completedSessions
          const { error: updateError } = await this.supabaseService
            .getClient()
            .from('itens_plano_tratamento')
            .update({ 
              completedSessions: completedCount,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);

          if (updateError) throw updateError;
          totalItemsFixed++;
          console.log(`✅ Item "${item.procedimento}" corrigido: ${completedCount}/${item.sessoes_estimadas} sessões completadas`);
        } catch (itemError) {
          console.log(`⚠️ Erro ao corrigir item ${item.id}:`, itemError.message);
        }
      }

      return {
        message: 'CompletedSessions de todos os itens corrigido com sucesso!',
        totalItemsFixed,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao corrigir completedSessions:', error);
      throw error;
    }
  }

  async fixPeriodontiaSession() {
    try {
      console.log('🔧 Corrigindo sessão da Periodontia...');
      
      // Buscar a sessão da Periodontia
      const { data: sessions, error: sessionsError } = await this.supabaseService
        .getClient()
        .from('treatment_sessions')
        .select('*')
        .eq('treatment_item_id', '07dfb7e2-7316-4200-9b88-b063a2da5449');

      if (sessionsError) throw sessionsError;

      if (sessions && sessions.length > 0) {
        // Marcar a sessão como concluída
        const { error: updateError } = await this.supabaseService
          .getClient()
          .from('treatment_sessions')
          .update({ 
            completed: true,
            date: new Date().toISOString().split('T')[0],
            description: 'Sessão concluída',
            updated_at: new Date().toISOString()
          })
          .eq('id', sessions[0].id);

        if (updateError) throw updateError;

        // Atualizar o campo completedSessions do item
        const { error: itemUpdateError } = await this.supabaseService
          .getClient()
          .from('itens_plano_tratamento')
          .update({ 
            completedSessions: 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', '07dfb7e2-7316-4200-9b88-b063a2da5449');

        if (itemUpdateError) throw itemUpdateError;

        console.log('✅ Sessão da Periodontia corrigida: 1/1 sessões concluídas');
      }

      return {
        message: 'Sessão da Periodontia corrigida com sucesso!',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao corrigir sessão da Periodontia:', error);
      throw error;
    }
  }
}
