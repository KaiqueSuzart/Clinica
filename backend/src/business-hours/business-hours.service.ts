import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface DaySchedule {
  isWorking: boolean;
  startTime: string;
  endTime: string;
  lunchBreak: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

@Injectable()
export class BusinessHoursService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getBusinessHours(empresaId: string = '00000000-0000-0000-0000-000000000001'): Promise<BusinessHours> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('business_hours_config')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('day_of_week');

      if (error) {
        console.error('Erro ao buscar configurações de horário:', error);
        return this.getDefaultBusinessHours();
      }

      // Converter dados do banco para o formato esperado
      const businessHours: BusinessHours = {
        monday: this.getDefaultDaySchedule(),
        tuesday: this.getDefaultDaySchedule(),
        wednesday: this.getDefaultDaySchedule(),
        thursday: this.getDefaultDaySchedule(),
        friday: this.getDefaultDaySchedule(),
        saturday: this.getDefaultDaySchedule(),
        sunday: this.getDefaultDaySchedule(),
      };

      data.forEach((config) => {
        const dayKey = config.day_of_week as keyof BusinessHours;
        if (businessHours[dayKey]) {
          businessHours[dayKey] = {
            isWorking: config.is_working,
            startTime: config.start_time,
            endTime: config.end_time,
            lunchBreak: {
              enabled: config.lunch_break_enabled,
              startTime: config.lunch_break_start,
              endTime: config.lunch_break_end,
            },
          };
        }
      });

      return businessHours;
    } catch (error) {
      console.error('Erro ao buscar configurações de horário:', error);
      return this.getDefaultBusinessHours();
    }
  }

  async updateBusinessHours(empresaId: string = '00000000-0000-0000-0000-000000000001', businessHours: BusinessHours): Promise<BusinessHours> {
    try {
      const updates = Object.entries(businessHours).map(([dayKey, schedule]) => ({
        empresa_id: empresaId,
        day_of_week: dayKey,
        is_working: schedule.isWorking,
        start_time: schedule.startTime,
        end_time: schedule.endTime,
        lunch_break_enabled: schedule.lunchBreak.enabled,
        lunch_break_start: schedule.lunchBreak.startTime,
        lunch_break_end: schedule.lunchBreak.endTime,
      }));

      // Usar upsert para atualizar ou inserir
      const { error } = await this.supabaseService
        .getClient()
        .from('business_hours_config')
        .upsert(updates, { onConflict: 'empresa_id,day_of_week' });

      if (error) {
        console.error('Erro ao atualizar configurações de horário:', error);
        throw new Error('Erro ao salvar configurações');
      }

      return businessHours;
    } catch (error) {
      console.error('Erro ao atualizar configurações de horário:', error);
      throw new Error('Erro ao salvar configurações');
    }
  }

  private getDefaultBusinessHours(): BusinessHours {
    return {
      monday: {
        isWorking: true,
        startTime: '08:00',
        endTime: '18:00',
        lunchBreak: { enabled: true, startTime: '12:00', endTime: '13:00' }
      },
      tuesday: {
        isWorking: true,
        startTime: '08:00',
        endTime: '18:00',
        lunchBreak: { enabled: true, startTime: '12:00', endTime: '13:00' }
      },
      wednesday: {
        isWorking: true,
        startTime: '08:00',
        endTime: '18:00',
        lunchBreak: { enabled: true, startTime: '12:00', endTime: '13:00' }
      },
      thursday: {
        isWorking: true,
        startTime: '08:00',
        endTime: '18:00',
        lunchBreak: { enabled: true, startTime: '12:00', endTime: '13:00' }
      },
      friday: {
        isWorking: true,
        startTime: '08:00',
        endTime: '18:00',
        lunchBreak: { enabled: true, startTime: '12:00', endTime: '13:00' }
      },
      saturday: {
        isWorking: true,
        startTime: '08:00',
        endTime: '14:00',
        lunchBreak: { enabled: false, startTime: '12:00', endTime: '13:00' }
      },
      sunday: {
        isWorking: false,
        startTime: '08:00',
        endTime: '18:00',
        lunchBreak: { enabled: false, startTime: '12:00', endTime: '13:00' }
      }
    };
  }

  private getDefaultDaySchedule(): DaySchedule {
    return {
      isWorking: true,
      startTime: '08:00',
      endTime: '18:00',
      lunchBreak: { enabled: true, startTime: '12:00', endTime: '13:00' }
    };
  }
}
