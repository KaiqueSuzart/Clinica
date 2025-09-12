const API_BASE_URL = 'http://localhost:3001';

export interface Patient {
  id: number;
  nome: string;
  telefone?: string;
  empresa?: number;
  iaativa?: boolean;
  Email?: string;
  Cpf?: number;
  data_nascimento?: string;
  observacoes?: string;
  status?: string;
  ultima_visita?: string;
  proximo_retorno?: string;
  responsavel_nome?: string;
  responsavel_telefone?: string;
  responsavel_parente?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  observations?: string;
  created_at?: string;
  updated_at?: string;
  anamnese?: AnamneseData;
  timeline?: any[];
  notes?: any[];
}

export interface CreatePatientData {
  nome: string;
  telefone?: string;
  empresa?: number;
  iaativa?: boolean;
  Email?: string;
  Cpf?: number;
  data_nascimento?: string;
  observacoes?: string;
  status?: string;
  ultima_visita?: string;
  proximo_retorno?: string;
  responsavel_nome?: string;
  responsavel_telefone?: string;
  responsavel_parente?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  observations?: string;
}

export interface UpdatePatientData extends Partial<CreatePatientData> {}

export interface TreatmentSession {
  id: string;
  treatment_item_id: string;
  session_number: number;
  date?: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateSessionData {
  date?: string;
  description?: string;
  completed?: boolean;
}

export interface SearchPatientParams {
  nome?: string;
  Cpf?: string;
  Email?: string;
  status?: string;
  iaativa?: boolean;
  empresa?: string;
}

export interface AnamneseData {
  id?: number;
  cliente_id: number;
  alergias?: string;
  medicamentos_uso?: string;
  historico_medico?: string;
  historico_odontologico?: string;
  habitos?: string;
  queixa_principal?: string;
  consentimento?: boolean;
  data_consentimento?: string;
  diabetes?: boolean;
  diabetes_notes?: string;
  hypertension?: boolean;
  hypertension_notes?: string;
  heart_problems?: boolean;
  heart_problems_notes?: string;
  pregnant?: boolean;
  pregnant_notes?: string;
  smoking?: boolean;
  smoking_notes?: string;
  alcohol?: boolean;
  alcohol_notes?: string;
  toothache?: boolean;
  toothache_notes?: string;
  gum_bleeding?: boolean;
  gum_bleeding_notes?: string;
  sensitivity?: boolean;
  sensitivity_notes?: string;
  bad_breath?: boolean;
  bad_breath_notes?: string;
  jaw_pain?: boolean;
  jaw_pain_notes?: string;
  previous_treatments?: boolean;
  previous_treatments_notes?: string;
  orthodontics?: boolean;
  orthodontics_notes?: string;
  surgeries?: boolean;
  surgeries_notes?: string;
  anesthesia_reaction?: boolean;
  anesthesia_reaction_notes?: string;
}

export interface Annotation {
  id?: number;
  patient_id: number;
  content: string;
  category: string;
  is_private?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  duration: number;
  procedure: string;
  professional: string;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'realizado';
  notes?: string;
}

export interface ReturnVisit {
  id: string;
  created_at: string;
  updated_at: string;
  empresa_id: string;
  cliente_id: string;
  consulta_original_id?: string;
  data_retorno: string;
  hora_retorno: string;
  motivo: string;
  procedimento: string;
  status: 'pendente' | 'confirmado' | 'realizado' | 'cancelado';
  observacoes?: string;
  data_consulta_original?: string; // Data da consulta original
  // Dados do paciente
  paciente_nome: string;
  paciente_telefone: string;
  paciente_email?: string;
  // Dados da consulta original (se existir)
  consulta_original_data?: string;
  consulta_original_procedimento?: string;
}

export interface CreateReturnData {
  cliente_id: string;
  consulta_original_id?: string;
  data_retorno: string;
  hora_retorno: string;
  motivo: string;
  procedimento: string;
  status: string;
  observacoes?: string;
  data_consulta_original?: string; // Data da consulta original
}

// ===== ORÇAMENTOS =====

export interface BudgetItem {
  id?: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  observacoes?: string;
}

export interface Budget {
  id: string;
  created_at: string;
  updated_at: string;
  empresa_id: string;
  cliente_id: string;
  dentista_id?: string;
  descricao?: string;
  valor_total: number;
  desconto: number;
  tipo_desconto?: string;
  valor_final: number;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'recusado' | 'cancelado';
  data_validade: string;
  observacoes?: string;
  forma_pagamento?: string;
  parcelas: number;
  itens?: BudgetItem[];
  // Dados do paciente (join)
  clientelA?: {
    id: string;
    nome: string;
    telefone?: string;
    email?: string;
  };
}

export interface CreateBudgetData {
  cliente_id: string;
  dentista_id?: string;
  descricao?: string;
  valor_total: number;
  desconto?: number;
  tipo_desconto?: string;
  valor_final: number;
  status?: string;
  data_validade: string;
  observacoes?: string;
  forma_pagamento?: string;
  parcelas?: number;
  itens: {
    descricao: string;
    quantidade: number;
    valor_unitario: number;
    valor_total: number;
    observacoes?: string;
  }[];
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {
  itens?: {
    id?: string;
    descricao: string;
    quantidade: number;
    valor_unitario: number;
    valor_total: number;
    observacoes?: string;
  }[];
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Erro na resposta:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  }

  // ===== PACIENTES =====
  
  async getPatients(): Promise<Patient[]> {
    return this.request<Patient[]>('/patients');
  }

  async getAllPatients(): Promise<Patient[]> {
    return this.request<Patient[]>('/patients');
  }

  async getPatient(id: number): Promise<Patient> {
    return this.request<Patient>(`/patients/${id}`);
  }

  async createPatient(data: CreatePatientData): Promise<Patient> {
    return this.request<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePatient(id: number, data: UpdatePatientData): Promise<Patient> {
    return this.request<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePatient(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/patients/${id}`, {
      method: 'DELETE',
    });
  }

  async searchPatients(params: SearchPatientParams): Promise<Patient[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    return this.request<Patient[]>(`/patients/search?${searchParams.toString()}`);
  }

  async getPatientsByStatus(status: string): Promise<Patient[]> {
    return this.request<Patient[]>(`/patients/status/${status}`);
  }

  async getActivePatients(): Promise<Patient[]> {
    return this.request<Patient[]>('/patients/active');
  }

  async getPatientsWithUpcomingReturns(): Promise<Patient[]> {
    return this.request<Patient[]>('/patients/upcoming-returns');
  }



  async getHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }

  // ===== ANAMNESE =====
  
  async getAnamnese(id: string): Promise<AnamneseData> {
    return this.request<AnamneseData>(`/anamnese/${id}`);
  }

  async getAnamneseByPatient(patientId: number): Promise<AnamneseData[]> {
    return this.request<AnamneseData[]>(`/anamnese/patient/${patientId}`);
  }

  async createAnamnese(data: AnamneseData): Promise<AnamneseData> {
    return this.request<AnamneseData>('/anamnese', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAnamnese(id: string, data: Partial<AnamneseData>): Promise<AnamneseData> {
    return this.request<AnamneseData>(`/anamnese/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAnamnese(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/anamnese/${id}`, {
      method: 'DELETE',
    });
  }

  // Anotações
  async getAnnotations(patientId: number): Promise<Annotation[]> {
    return this.request(`/annotations?patient_id=${patientId}`);
  }

  async getAnnotationsByCategory(patientId: number, category: string): Promise<Annotation[]> {
    return this.request(`/annotations?patient_id=${patientId}&category=${category}`);
  }

  async createAnnotation(annotation: Omit<Annotation, 'id' | 'created_at' | 'updated_at'>): Promise<Annotation> {
    return this.request('/annotations', {
      method: 'POST',
      body: JSON.stringify(annotation),
    });
  }

  async updateAnnotation(id: number, annotation: Partial<Annotation>): Promise<Annotation> {
    return this.request(`/annotations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(annotation),
    });
  }

  async deleteAnnotation(id: number): Promise<void> {
    return this.request(`/annotations/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== PLANOS DE TRATAMENTO =====
  
  async createTreatmentPlan(planData: {
    patientId: number;
    title: string;
    description?: string;
    items: any[];
    totalCost?: number;
    progress?: number;
  }): Promise<any> {
    const result = await this.request('/treatment-plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
    return result;
  }

  async getTreatmentPlansByPatient(patientId: number): Promise<any[]> {
    const result = await this.request(`/treatment-plans/patient/${patientId}`);
    
    // Verificar se result é um array
    if (!Array.isArray(result)) {
      console.error('API: Resultado não é um array:', result);
      return [];
    }
    
    // Mapear dados do backend (português) para frontend (inglês)
    const mappedPlans = result.map((plan: any) => {
      
      const mappedPlan = {
        id: plan.id || `plan-${index}`,
        title: plan.titulo || plan.title || `Plano ${index + 1}`,
        description: plan.descricao || plan.description || '',
        totalCost: plan.custo_total || plan.totalCost || 0,
        progress: plan.progresso || plan.progress || 0,
        status: plan.status || 'ativo',
        items: Array.isArray(plan.items) ? plan.items.map((item: any, itemIndex: number) => ({
          id: item.id || `item-${itemIndex}`,
          procedure: item.procedimento || item.procedure || 'Procedimento',
          description: item.descricao || item.description || '',
          tooth: item.dente || item.tooth || '',
          priority: item.prioridade || item.priority || 'media',
          estimatedCost: item.custo_estimado || item.estimatedCost || 0,
          estimatedSessions: item.sessoes_estimadas || item.estimatedSessions || 1,
          status: item.status || 'planejado',
          notes: item.observacoes || item.notes || '',
          order: item.ordem || item.order || itemIndex + 1,
          startDate: item.data_inicio || item.startDate || '',
          completionDate: item.data_conclusao || item.completionDate || '',
          sessions: item.sessions || [],
          completedSessions: item.completedSessions || 0,
          sessoes_estimadas: item.sessoes_estimadas || item.estimatedSessions || 1
        })) : []
      };
      
      return mappedPlan;
    });
    
    return mappedPlans;
  }

  async deleteTreatmentPlan(planId: string): Promise<{ message: string }> {
    const result = await this.request<{ message: string }>(`/treatment-plans/${planId}`, {
      method: 'DELETE',
    });
    return result;
  }

  async updateTreatmentPlan(planId: string, updateData: any): Promise<any> {
    const result = await this.request<any>(`/treatment-plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    return result;
  }

  async updateTreatmentPlanProgress(planId: string, progress: number): Promise<any> {
    const result = await this.request<any>(`/treatment-plans/${planId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    });
    return result;
  }

  // ===== SESSÕES DE TRATAMENTO =====
  
  async createSession(sessionData: {
    treatment_item_id: string;
    session_number: number;
    date?: string | null;
    description?: string | null;
    completed?: boolean;
  }): Promise<TreatmentSession> {
    return this.request('/treatment-sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }
  
  async updateSession(sessionId: string, updates: UpdateSessionData): Promise<TreatmentSession> {
    // Usar a rota correta do backend
    return this.request(`/treatment-plans/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getCompletedSessionsForPatient(patientId: string): Promise<any[]> {
    return this.request(`/treatment-sessions/patient/${patientId}/completed`);
  }

  // ===== ARQUIVOS =====
  
  async uploadFile(file: File, patientId: string, category: string, description?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', patientId);
    formData.append('category', category);
    if (description) {
      formData.append('description', description);
    }

        const url = `${API_BASE_URL}/files/upload`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });



    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Erro no upload:', errorText);
      throw new Error(`Erro no upload: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  async getPatientFiles(patientId: string): Promise<any[]> {
    return this.request(`/files/patient/${patientId}`);
  }

  async getFilesByCategory(patientId: string, category: string): Promise<any[]> {
    return this.request(`/files/patient/${patientId}/category/${category}`);
  }

  async getPatientFileStats(patientId: string): Promise<any> {
    return this.request(`/files/patient/${patientId}/stats`);
  }

  async deleteFile(fileId: string): Promise<{ message: string }> {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async updateFile(fileId: string, description: string): Promise<any> {
    return this.request(`/files/${fileId}`, {
      method: 'PATCH',
      body: JSON.stringify({ description }),
    });
  }

  // Appointments
  async getAllAppointments(): Promise<Appointment[]> {
    return this.request<Appointment[]>('/appointments');
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    return this.request<Appointment>(`/appointments/${id}`);
  }

  async createAppointment(appointment: Omit<Appointment, 'id' | 'patientName' | 'patientPhone'>): Promise<Appointment> {
    return this.request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify({
        patient_id: appointment.patientId,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        procedure: appointment.procedure,
        professional: appointment.professional,
        status: appointment.status,
        notes: appointment.notes
      }),
    });
  }

  async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    return this.request<Appointment>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        patient_id: appointment.patientId,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        procedure: appointment.procedure,
        professional: appointment.professional,
        status: appointment.status,
        notes: appointment.notes
      }),
    });
  }

  async deleteAppointment(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  async checkAvailability(date: string, time: string, professional?: string): Promise<boolean> {
    const response = await this.request<{ available: boolean }>(`/appointments/check-availability`, {
      method: 'POST',
      body: JSON.stringify({ date, time, professional }),
    });
    return response.available;
  }

  async getAvailableTimes(date: string, professional?: string): Promise<string[]> {
    const params = new URLSearchParams({ date });
    if (professional) params.append('professional', professional);
    return this.request<string[]>(`/appointments/available-times?${params}`);
  }

  async getNextHourAppointments(): Promise<Appointment[]> {
    return this.request<Appointment[]>('/appointments/next-hour');
  }

  async confirmAppointment(id: string, confirmed: boolean): Promise<Appointment> {
    return this.request<Appointment>(`/appointments/${id}/confirm`, {
      method: 'PUT',
      body: JSON.stringify({ confirmed }),
    });
  }

  // ===== RETORNOS =====
  
  async getAllReturns(): Promise<ReturnVisit[]> {
    return this.request<ReturnVisit[]>('/returns');
  }

  // ===== CONFIGURAÇÕES DE HORÁRIO =====
  
  async getBusinessHours(): Promise<any> {
    return this.request<any>('/business-hours');
  }

  async updateBusinessHours(businessHours: any): Promise<any> {
    return this.request<any>('/business-hours', {
      method: 'PUT',
      body: JSON.stringify(businessHours),
    });
  }

  async getConfirmedReturns(): Promise<ReturnVisit[]> {
    return this.request<ReturnVisit[]>('/returns/confirmed');
  }

  async getPossibleReturns(): Promise<ReturnVisit[]> {
    return this.request<ReturnVisit[]>('/returns/possible');
  }

  async getCompletedReturns(): Promise<ReturnVisit[]> {
    return this.request<ReturnVisit[]>('/returns/completed');
  }

  async getOverdueReturns(): Promise<ReturnVisit[]> {
    return this.request<ReturnVisit[]>('/returns/overdue');
  }

  async getReturnById(id: string): Promise<ReturnVisit> {
    return this.request<ReturnVisit>(`/returns/${id}`);
  }

  async createReturn(data: CreateReturnData): Promise<ReturnVisit> {
    return this.request<ReturnVisit>('/returns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReturn(id: string, data: Partial<CreateReturnData>): Promise<ReturnVisit> {
    return this.request<ReturnVisit>(`/returns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReturn(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/returns/${id}`, {
      method: 'DELETE',
    });
  }

  async confirmReturn(id: string): Promise<ReturnVisit> {
    return this.request<ReturnVisit>(`/returns/${id}/confirm`, {
      method: 'PATCH',
    });
  }

  async completeReturn(id: string): Promise<ReturnVisit> {
    return this.request<ReturnVisit>(`/returns/${id}/complete`, {
      method: 'PATCH',
    });
  }

  async cancelReturn(id: string): Promise<ReturnVisit> {
    return this.request<ReturnVisit>(`/returns/${id}/cancel`, {
      method: 'PATCH',
    });
  }

  // ===== CONSULTAS/AGENDA =====
  
  async getTodayAppointments(): Promise<Appointment[]> {
    return this.request<Appointment[]>('/appointments/today');
  }

  async getCompletedAppointments(): Promise<Appointment[]> {
    return this.request<Appointment[]>('/appointments/completed');
  }

  async markAppointmentAsCompleted(id: string): Promise<Appointment> {
    return this.request<Appointment>(`/appointments/${id}/complete`, {
      method: 'PUT',
    });
  }

  async getWeekAppointments(): Promise<Appointment[]> {
    return this.request<Appointment[]>('/appointments/week');
  }

  async getMonthAppointments(): Promise<Appointment[]> {
    return this.request<Appointment[]>('/appointments/month');
  }

  async getAppointmentsByPeriod(startDate: string, endDate: string): Promise<Appointment[]> {
    return this.request<Appointment[]>(`/appointments/period?startDate=${startDate}&endDate=${endDate}`);
  }

  // ===== ORÇAMENTOS =====
  
  async getAllBudgets(): Promise<Budget[]> {
    return this.request<Budget[]>('/budgets');
  }

  async getBudgetById(id: string): Promise<Budget> {
    return this.request<Budget>(`/budgets/${id}`);
  }

  async getBudgetsByPatient(patientId: string): Promise<Budget[]> {
    return this.request<Budget[]>(`/budgets/patient/${patientId}`);
  }

  async createBudget(data: CreateBudgetData): Promise<Budget> {
    return this.request<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBudget(id: string, data: UpdateBudgetData): Promise<Budget> {
    return this.request<Budget>(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateBudgetStatus(id: string, status: string): Promise<Budget> {
    return this.request<Budget>(`/budgets/${id}/status?status=${status}`, {
      method: 'PUT',
    });
  }

  async deleteBudget(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/budgets/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();

