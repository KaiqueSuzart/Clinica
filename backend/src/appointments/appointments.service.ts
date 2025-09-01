import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AppointmentsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    try {
      // Primeiro tentar sem JOIN para simplificar
      const { data, error } = await this.supabaseService
        .getClient()
        .from('consultas')
        .select('*')
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
              .getClient()
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
              notes: consulta.observacoes
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
              notes: consulta.observacoes
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

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('consultas')
      .select(`
        *,
        clientelA!consultas_cliente_id_fkey(id, nome, telefone, email)
      `)
      .eq('id', id)
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
      notes: data.observacoes
    };
  }

  async create(appointmentData: any) {
    console.log('Criando agendamento:', appointmentData);
    
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('consultas')
        .insert({
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
        .getClient()
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

  async update(id: string, appointmentData: any) {
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
      .getClient()
      .from('consultas')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao atualizar consulta:', error);
      throw error;
    }
    
    console.log('Consulta atualizada:', data);
    
    // Buscar dados do paciente separadamente
    const { data: patientData } = await this.supabaseService
      .getClient()
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

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('consultas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Consulta removida com sucesso' };
  }

  async findByPatient(patientId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('consultas')
      .select('*')
      .eq('cliente_id', patientId)
      .order('data_consulta', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Método para verificar disponibilidade de horário
  async checkAvailability(date: string, time: string, professional?: string) {
    let query = this.supabaseService
      .getClient()
      .from('consultas')
      .select('id')
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
  async getAvailableTimes(date: string, professional?: string) {
    const allTimes = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    let query = this.supabaseService
      .getClient()
      .from('consultas')
      .select('hora_inicio')
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
  async findNextHourAppointments() {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    
    const { data, error } = await this.supabaseService
      .getClient()
      .from('consultas')
      .select(`
        *,
        clientelA!consultas_cliente_id_fkey(id, nome, telefone, email)
      `)
      .eq('status', 'confirmado')
      .eq('data_consulta', nextHour.toISOString().split('T')[0])
      .gte('hora_inicio', now.toTimeString().split(' ')[0])
      .lte('hora_inicio', nextHour.toTimeString().split(' ')[0]);

    if (error) throw error;
    return data;
  }

  // Método para buscar histórico de procedimentos do paciente
  async getPatientProcedures(patientId: string) {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('consultas')
        .select('procedimento')
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
}










