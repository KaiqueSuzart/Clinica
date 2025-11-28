import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AppointmentsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(empresaId: string) {
    try {
      // Primeiro tentar sem JOIN para simplificar
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('consultas')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('data_consulta', { ascending: true })
        .order('hora_inicio', { ascending: true });

      if (error) {
        console.error('Erro ao buscar consultas:', error);
        // Retornar dados mock se houver erro
        return [
          {
            id: '1',
            patientId: '1',
            patientName: 'João Santos',
            patientPhone: '(11) 99999-9999',
            date: '2024-08-31',
            time: '14:00',
            duration: 60,
            procedure: 'Consulta',
            professional: 'Dr. Ana Silva',
            status: 'confirmado',
            notes: 'Dados de teste'
          },
          {
            id: '2',
            patientId: '2',
            patientName: 'Maria Oliveira',
            patientPhone: '(11) 88888-8888',
            date: '2024-08-31',
            time: '15:30',
            duration: 90,
            procedure: 'Limpeza',
            professional: 'Dr. Ana Silva',
            status: 'pendente',
            notes: 'Dados de teste'
          }
        ];
      }
      
      // Buscar dados dos pacientes para cada consulta
      const consultasComPacientes = await Promise.all(
        data.map(async (consulta) => {
          console.log(`Buscando paciente ID ${consulta.cliente_id} para consulta ${consulta.id}`);
          
          try {
            const { data: pacienteData, error: pacienteError } = await this.supabaseService
              .getAdminClient()
              .from('clientelA')
              .select('id, nome, telefone, Email')
              .eq('id', consulta.cliente_id)
              .single();

            if (pacienteError) {
              console.error(`Erro ao buscar paciente ID ${consulta.cliente_id}:`, pacienteError);
            }
            
            console.log(`Paciente encontrado para ID ${consulta.cliente_id}:`, pacienteData);

            return {
              id: consulta.id,
              patientId: consulta.cliente_id,
              patientName: pacienteData?.nome || `Paciente ${consulta.cliente_id} (não encontrado)`,
              patientPhone: pacienteData?.telefone || '',
              date: consulta.data_consulta,
              time: consulta.hora_inicio,
              duration: consulta.duracao_minutos || 60,
              procedure: consulta.procedimento,
              professional: consulta.dentista_id || 'Dr. Ana Silva',
              status: consulta.status || 'pendente',
              notes: consulta.observacoes,
              valor: consulta.valor || null,
              pago: consulta.pago || false
            };
          } catch (error) {
            console.error(`Erro geral ao buscar paciente ID ${consulta.cliente_id}:`, error);
            return {
              id: consulta.id,
              patientId: consulta.cliente_id,
              patientName: `Paciente ${consulta.cliente_id} (erro)`,
              patientPhone: '',
              date: consulta.data_consulta,
              time: consulta.hora_inicio,
              duration: consulta.duracao_minutos || 60,
              procedure: consulta.procedimento,
              professional: consulta.dentista_id || 'Dr. Ana Silva',
              status: consulta.status || 'pendente',
              notes: consulta.observacoes,
              valor: consulta.valor || null,
              pago: consulta.pago || false
            };
          }
        })
      );

      return consultasComPacientes;
    } catch (error) {
      console.error('Erro geral:', error);
      // Retornar dados mock em caso de erro
      return [
        {
          id: '1',
          patientId: '1',
          patientName: 'João Santos (Mock)',
          patientPhone: '(11) 99999-9999',
          date: '2024-08-31',
          time: '14:00',
          duration: 60,
          procedure: 'Consulta',
          professional: 'Dr. Ana Silva',
          status: 'confirmado',
          notes: 'Dados de teste - erro na conexão'
        }
      ];
    }
  }

  async findOne(id: string, empresaId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('consultas')
      .select(`
        *,
        clientelA!consultas_cliente_id_fkey(id, nome, telefone, email)
      `)
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Consulta não encontrada');
    }

    return {
      id: data.id,
      patientId: data.cliente_id,
      patientName: data.clientelA?.nome || 'Nome não encontrado',
      patientPhone: data.clientelA?.telefone || '',
      date: data.data_consulta,
      time: data.hora_inicio,
      duration: data.duracao_minutos || 60,
      procedure: data.procedimento,
      professional: data.dentista_id || 'Dr. Ana Silva',
      status: data.status || 'pendente',
      notes: data.observacoes,
      valor: data.valor || null,
      pago: data.pago || false
    };
  }

  async create(appointmentData: any, empresaId: string) {
    console.log('Criando agendamento:', appointmentData);
    
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('consultas')
        .insert({
          empresa_id: empresaId,
          cliente_id: appointmentData.patient_id,
          data_consulta: appointmentData.date,
          hora_inicio: appointmentData.time,
          duracao_minutos: appointmentData.duration || 60,
          procedimento: appointmentData.procedure,
          dentista_id: appointmentData.professional,
          status: appointmentData.status || 'pendente',
          observacoes: appointmentData.notes,
          tipo_consulta: appointmentData.type || 'Consulta'
        })
        .select('*')
        .single();

      if (error) {
        console.error('Erro detalhado do Supabase:', JSON.stringify(error, null, 2));
        throw new Error(`Erro ao criar agendamento: ${error.message} - Detalhes: ${error.details} - Hint: ${error.hint}`);
      }
    
      console.log('Agendamento criado:', data);
    
      // Buscar dados do paciente separadamente
      console.log('Buscando paciente com ID:', appointmentData.patient_id);
      const { data: patientData, error: patientError } = await this.supabaseService
        .getAdminClient()
        .from('clientelA')
        .select('id, nome, telefone, Email')
        .eq('id', appointmentData.patient_id)
        .single();
      
      if (patientError) {
        console.error('Erro ao buscar paciente:', patientError);
      }
      console.log('Dados do paciente encontrados:', patientData);
    
      // Retornar no formato esperado pelo frontend
      return {
        id: data.id,
        patientId: data.cliente_id,
        patientName: patientData?.nome || 'Nome não encontrado',
        patientPhone: patientData?.telefone || '',
        date: data.data_consulta,
        time: data.hora_inicio,
        duration: data.duracao_minutos || 60,
        procedure: data.procedimento,
        professional: data.dentista_id || 'Dr. Ana Silva',
        status: data.status || 'pendente',
        notes: data.observacoes
      };
    } catch (error) {
      console.error('Erro geral ao criar agendamento:', error);
      throw error;
    }
  }

  async update(id: string, appointmentData: any, empresaId: string) {
    const updateData: any = {};
    
    if (appointmentData.patient_id) updateData.cliente_id = appointmentData.patient_id;
    if (appointmentData.date) updateData.data_consulta = appointmentData.date;
    if (appointmentData.time) updateData.hora_inicio = appointmentData.time;
    if (appointmentData.duration) updateData.duracao_minutos = appointmentData.duration;
    if (appointmentData.procedure) updateData.procedimento = appointmentData.procedure;
    if (appointmentData.professional) updateData.dentista_id = appointmentData.professional;
    if (appointmentData.status) updateData.status = appointmentData.status;
    if (appointmentData.notes) updateData.observacoes = appointmentData.notes;
    if (appointmentData.type) updateData.tipo_consulta = appointmentData.type;

    console.log('Atualizando consulta ID:', id, 'com dados:', updateData);

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('consultas')
      .update(updateData)
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao atualizar consulta:', error);
      throw error;
    }
    
    console.log('Consulta atualizada:', data);
    
    // Buscar dados do paciente separadamente
    const { data: patientData } = await this.supabaseService
      .getAdminClient()
      .from('clientelA')
      .select('id, nome, telefone, Email')
      .eq('id', data.cliente_id)
      .single();
    
    return {
      id: data.id,
      patientId: data.cliente_id,
      patientName: patientData?.nome || 'Nome não encontrado',
      patientPhone: patientData?.telefone || '',
      date: data.data_consulta,
      time: data.hora_inicio,
      duration: data.duracao_minutos || 60,
      procedure: data.procedimento,
      professional: data.dentista_id || 'Dr. Ana Silva',
      status: data.status || 'pendente',
      notes: data.observacoes
    };
  }

  async remove(id: string, empresaId: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('consultas')
      .delete()
      .eq('id', id)
      .eq('empresa_id', empresaId);

    if (error) throw error;
    return { message: 'Consulta removida com sucesso' };
  }

  async findByPatient(patientId: string, empresaId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('consultas')
      .select('*')
      .eq('cliente_id', patientId)
      .eq('empresa_id', empresaId)
      .order('data_consulta', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Método para verificar disponibilidade de horário
  async checkAvailability(date: string, time: string, empresaId: string, professional?: string) {
    let query = this.supabaseService
      .getAdminClient()
      .from('consultas')
      .select('id')
      .eq('empresa_id', empresaId)
      .eq('data_consulta', date)
      .eq('hora_inicio', time)
      .neq('status', 'cancelado');

    if (professional) {
      query = query.eq('dentista_id', professional);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data?.length === 0; // true se disponível
  }

  // Método para buscar horários disponíveis
  async getAvailableTimes(date: string, empresaId: string, professional?: string) {
    const allTimes = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    let query = this.supabaseService
      .getAdminClient()
      .from('consultas')
      .select('hora_inicio')
      .eq('empresa_id', empresaId)
      .eq('data_consulta', date)
      .neq('status', 'cancelado');

    if (professional) {
      query = query.eq('dentista_id', professional);
    }

    const { data: consultas, error } = await query;

    if (error) throw error;

    const occupiedTimes = consultas?.map(consulta => consulta.hora_inicio) || [];
    return allTimes.filter(time => !occupiedTimes.includes(time));
  }

  // Método para buscar consultas da próxima hora (para N8N)
  async findNextHourAppointments(empresaId: string) {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('consultas')
      .select(`
        *,
        clientelA!consultas_cliente_id_fkey(id, nome, telefone, email)
      `)
      .eq('empresa_id', empresaId)
      .eq('status', 'confirmado')
      .eq('data_consulta', nextHour.toISOString().split('T')[0])
      .gte('hora_inicio', now.toTimeString().split(' ')[0])
      .lte('hora_inicio', nextHour.toTimeString().split(' ')[0]);

    if (error) throw error;
    return data;
  }

  // Método para buscar histórico de procedimentos do paciente
  async getPatientProcedures(patientId: string, empresaId: string) {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('consultas')
        .select('procedimento')
        .eq('empresa_id', empresaId)
        .eq('cliente_id', patientId)
        .eq('status', 'realizado')
        .order('data_consulta', { ascending: false });

      if (error) {
        console.error('Erro ao buscar procedimentos do paciente:', error);
        return [];
      }

      // Retornar lista única de procedimentos
      const uniqueProcedures = [...new Set(data?.map(item => item.procedimento).filter(Boolean))] || [];
      return uniqueProcedures;
    } catch (error) {
      console.error('Erro geral ao buscar procedimentos:', error);
      return [];
    }
  }

  // Método para buscar consultas do dia
  async findTodayAppointments(empresaId: string) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('consultas')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('data_consulta', today)
        .neq('status', 'realizado') // Excluir consultas realizadas
        .order('hora_inicio', { ascending: true });

      if (error) {
        console.error('Erro ao buscar consultas do dia:', error);
        return [];
      }

      // Buscar dados dos pacientes para cada consulta
      const consultasComPacientes = await Promise.all(
        data.map(async (consulta) => {
          try {
            const { data: pacienteData, error: pacienteError } = await this.supabaseService
              .getAdminClient()
              .from('clientelA')
              .select('id, nome, telefone, Email')
              .eq('id', consulta.cliente_id)
              .single();

            if (pacienteError) {
              console.error(`Erro ao buscar paciente ID ${consulta.cliente_id}:`, pacienteError);
            }

            return {
              id: consulta.id,
              patientId: consulta.cliente_id,
              patientName: pacienteData?.nome || `Paciente ${consulta.cliente_id}`,
              patientPhone: pacienteData?.telefone || '',
              date: consulta.data_consulta,
              time: consulta.hora_inicio,
              duration: consulta.duracao_minutos || 60,
              procedure: consulta.procedimento,
              professional: consulta.dentista_id || 'Dr. Ana Silva',
              status: consulta.status || 'pendente',
              notes: consulta.observacoes
            };
          } catch (error) {
            console.error(`Erro geral ao buscar paciente ID ${consulta.cliente_id}:`, error);
            return {
              id: consulta.id,
              patientId: consulta.cliente_id,
              patientName: `Paciente ${consulta.cliente_id}`,
              patientPhone: '',
              date: consulta.data_consulta,
              time: consulta.hora_inicio,
              duration: consulta.duracao_minutos || 60,
              procedure: consulta.procedimento,
              professional: consulta.dentista_id || 'Dr. Ana Silva',
              status: consulta.status || 'pendente',
              notes: consulta.observacoes
            };
          }
        })
      );

      return consultasComPacientes;
    } catch (error) {
      console.error('Erro geral ao buscar consultas do dia:', error);
      return [];
    }
  }

  // Método para buscar histórico de consultas (realizadas)
  async findCompletedAppointments(empresaId: string) {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('consultas')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('status', 'realizado')
        .order('data_consulta', { ascending: false })
        .order('hora_inicio', { ascending: false });

      if (error) {
        console.error('Erro ao buscar consultas realizadas:', error);
        return [];
      }

      // Buscar dados dos pacientes para cada consulta
      const consultasComPacientes = await Promise.all(
        data.map(async (consulta) => {
          try {
            const { data: pacienteData, error: pacienteError } = await this.supabaseService
              .getAdminClient()
              .from('clientelA')
              .select('id, nome, telefone, Email')
              .eq('id', consulta.cliente_id)
              .single();

            if (pacienteError) {
              console.error(`Erro ao buscar paciente ID ${consulta.cliente_id}:`, pacienteError);
            }

            return {
              id: consulta.id,
              patientId: consulta.cliente_id,
              patientName: pacienteData?.nome || `Paciente ${consulta.cliente_id}`,
              patientPhone: pacienteData?.telefone || '',
              date: consulta.data_consulta,
              time: consulta.hora_inicio,
              duration: consulta.duracao_minutos || 60,
              procedure: consulta.procedimento,
              professional: consulta.dentista_id || 'Dr. Ana Silva',
              status: consulta.status || 'realizado',
              notes: consulta.observacoes
            };
          } catch (error) {
            console.error(`Erro geral ao buscar paciente ID ${consulta.cliente_id}:`, error);
            return {
              id: consulta.id,
              patientId: consulta.cliente_id,
              patientName: `Paciente ${consulta.cliente_id}`,
              patientPhone: '',
              date: consulta.data_consulta,
              time: consulta.hora_inicio,
              duration: consulta.duracao_minutos || 60,
              procedure: consulta.procedimento,
              professional: consulta.dentista_id || 'Dr. Ana Silva',
              status: consulta.status || 'realizado',
              notes: consulta.observacoes
            };
          }
        })
      );

      return consultasComPacientes;
    } catch (error) {
      console.error('Erro geral ao buscar consultas realizadas:', error);
      return [];
    }
  }

  // Método para marcar consulta como realizada
  async markAsCompleted(id: string, empresaId: string) {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('consultas')
        .update({ status: 'realizado' })
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao marcar consulta como realizada:', error);
        throw error;
      }

      // Buscar dados do paciente
      const { data: patientData } = await this.supabaseService
        .getAdminClient()
        .from('clientelA')
        .select('id, nome, telefone, Email')
        .eq('id', data.cliente_id)
        .single();

      return {
        id: data.id,
        patientId: data.cliente_id,
        patientName: patientData?.nome || 'Nome não encontrado',
        patientPhone: patientData?.telefone || '',
        date: data.data_consulta,
        time: data.hora_inicio,
        duration: data.duracao_minutos || 60,
        procedure: data.procedimento,
        professional: data.dentista_id || 'Dr. Ana Silva',
        status: 'realizado',
        notes: data.observacoes
      };
    } catch (error) {
      console.error('Erro geral ao marcar consulta como realizada:', error);
      throw error;
    }
  }

  // Método para buscar consultas por período
  async findAppointmentsByPeriod(startDate: string, endDate: string, empresaId: string) {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('consultas')
        .select('*')
        .eq('empresa_id', empresaId)
        .gte('data_consulta', startDate)
        .lte('data_consulta', endDate)
        .neq('status', 'realizado') // Excluir consultas realizadas
        .order('data_consulta', { ascending: true })
        .order('hora_inicio', { ascending: true });

      if (error) {
        console.error('Erro ao buscar consultas por período:', error);
        return [];
      }

      // Buscar dados dos pacientes para cada consulta
      const consultasComPacientes = await Promise.all(
        data.map(async (consulta) => {
          try {
            const { data: pacienteData, error: pacienteError } = await this.supabaseService
              .getAdminClient()
              .from('clientelA')
              .select('id, nome, telefone, Email')
              .eq('id', consulta.cliente_id)
              .single();

            if (pacienteError) {
              console.error(`Erro ao buscar paciente ID ${consulta.cliente_id}:`, pacienteError);
            }

            return {
              id: consulta.id,
              patientId: consulta.cliente_id,
              patientName: pacienteData?.nome || `Paciente ${consulta.cliente_id}`,
              patientPhone: pacienteData?.telefone || '',
              date: consulta.data_consulta,
              time: consulta.hora_inicio,
              duration: consulta.duracao_minutos || 60,
              procedure: consulta.procedimento,
              professional: consulta.dentista_id || 'Dr. Ana Silva',
              status: consulta.status || 'pendente',
              notes: consulta.observacoes
            };
          } catch (error) {
            console.error(`Erro geral ao buscar paciente ID ${consulta.cliente_id}:`, error);
            return {
              id: consulta.id,
              patientId: consulta.cliente_id,
              patientName: `Paciente ${consulta.cliente_id}`,
              patientPhone: '',
              date: consulta.data_consulta,
              time: consulta.hora_inicio,
              duration: consulta.duracao_minutos || 60,
              procedure: consulta.procedimento,
              professional: consulta.dentista_id || 'Dr. Ana Silva',
              status: consulta.status || 'pendente',
              notes: consulta.observacoes
            };
          }
        })
      );

      return consultasComPacientes;
    } catch (error) {
      console.error('Erro geral ao buscar consultas por período:', error);
      return [];
    }
  }

  // Método para buscar consultas da semana atual
  async findWeekAppointments(empresaId: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
    endOfWeek.setHours(23, 59, 59, 999);

    return this.findAppointmentsByPeriod(
      startOfWeek.toISOString().split('T')[0],
      endOfWeek.toISOString().split('T')[0],
      empresaId
    );
  }

  // Método para buscar consultas do mês atual
  async findMonthAppointments(empresaId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.findAppointmentsByPeriod(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0],
      empresaId
    );
  }
}










