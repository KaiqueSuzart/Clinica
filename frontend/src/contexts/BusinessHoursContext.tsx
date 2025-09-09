import React, { createContext, useContext, useState, useEffect } from 'react';

interface DaySchedule {
  isWorking: boolean;
  startTime: string;
  endTime: string;
  lunchBreak: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface BusinessHoursContextType {
  businessHours: BusinessHours;
  setBusinessHours: (hours: BusinessHours) => void;
  isWorkingDay: (date: Date) => boolean;
  isWorkingTime: (time: string) => boolean;
  getAvailableTimeSlots: () => string[];
}

const BusinessHoursContext = createContext<BusinessHoursContextType | undefined>(undefined);

const defaultBusinessHours: BusinessHours = {
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

export function BusinessHoursProvider({ children }: { children: React.ReactNode }) {
  const [businessHours, setBusinessHours] = useState<BusinessHours>(() => {
    try {
      // Carregar do localStorage se disponível
      const saved = localStorage.getItem('businessHours');
      if (saved) {
        return JSON.parse(saved);
      }
      return defaultBusinessHours;
    } catch (error) {
      console.error('Erro ao carregar businessHours do localStorage:', error);
      return defaultBusinessHours;
    }
  });

  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('businessHours', JSON.stringify(businessHours));
  }, [businessHours]);

  // Verificar se é um dia de trabalho
  const isWorkingDay = (date: Date) => {
    if (!businessHours) return false;
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()] as keyof BusinessHours;
    return businessHours[dayName].isWorking;
  };

  // Verificar se é um horário de trabalho para um dia específico
  const isWorkingTime = (time: string, date?: Date) => {
    if (!businessHours) return false;
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = date ? dayNames[date.getDay()] as keyof BusinessHours : 'monday';
    const daySchedule = businessHours[dayName];
    
    if (!daySchedule.isWorking) {
      return false;
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    
    const [startHours, startMinutes] = daySchedule.startTime.split(':').map(Number);
    const [endHours, endMinutes] = daySchedule.endTime.split(':').map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;
    
    // Verificar se está dentro do horário de funcionamento
    if (timeInMinutes < startTimeInMinutes || timeInMinutes >= endTimeInMinutes) {
      return false;
    }
    
    // Verificar se não está no horário de almoço
    if (daySchedule.lunchBreak.enabled) {
      const [lunchStartHours, lunchStartMinutes] = daySchedule.lunchBreak.startTime.split(':').map(Number);
      const [lunchEndHours, lunchEndMinutes] = daySchedule.lunchBreak.endTime.split(':').map(Number);
      const lunchStartTimeInMinutes = lunchStartHours * 60 + lunchStartMinutes;
      const lunchEndTimeInMinutes = lunchEndHours * 60 + lunchEndMinutes;
      
      if (timeInMinutes >= lunchStartTimeInMinutes && timeInMinutes < lunchEndTimeInMinutes) {
        return false;
      }
    }
    
    return true;
  };

  // Gerar slots de horário disponíveis para um dia específico
  const getAvailableTimeSlots = (date?: Date) => {
    if (!businessHours) return [];
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = date ? dayNames[date.getDay()] as keyof BusinessHours : 'monday';
    const daySchedule = businessHours[dayName];
    
    if (!daySchedule.isWorking) {
      return [];
    }
    
    const slots: string[] = [];
    const [startHours, startMinutes] = daySchedule.startTime.split(':').map(Number);
    const [endHours, endMinutes] = daySchedule.endTime.split(':').map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;
    
    // Gerar slots de 30 em 30 minutos
    for (let minutes = startTimeInMinutes; minutes < endTimeInMinutes; minutes += 30) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      
      if (isWorkingTime(timeString, date)) {
        slots.push(timeString);
      }
    }
    
    return slots;
  };

  // Verificar se businessHours está definido
  if (!businessHours) {
    console.error('BusinessHours não está definido!');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Erro ao carregar configurações de horário</div>
      </div>
    );
  }

  return (
    <BusinessHoursContext.Provider value={{
      businessHours,
      setBusinessHours,
      isWorkingDay,
      isWorkingTime,
      getAvailableTimeSlots
    }}>
      {children}
    </BusinessHoursContext.Provider>
  );
}

export function useBusinessHours() {
  const context = useContext(BusinessHoursContext);
  if (context === undefined) {
    throw new Error('useBusinessHours must be used within a BusinessHoursProvider');
  }
  return context;
}
