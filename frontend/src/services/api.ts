// Importar URL da API do config (que já usa variável de ambiente)
import { API_BASE_URL } from '../config';

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
  status: string;
  notes?: string;
  isReturn?: boolean; // Flag para identificar se é um retorno
  valor?: number;
  pago?: boolean;
}

export interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  pendingConfirmations: number;
  unreadMessages: number;
}

export interface Notification {
  id: string;
  empresa_id: string;
  user_id?: string;
  type: 'appointment' | 'return' | 'message' | 'confirmation' | 'system';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  read_at?: string;
  expires_at?: string;
}

export interface NotificationStats {
  total_unread: number;
  by_type: {
    [key: string]: {
      count: number;
      unread: number;
    };
  };
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
  valor?: number;
  forma_pagamento?: string;
  pago?: boolean;
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

// ===== PAGAMENTOS =====

export type PaymentMethod = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'transferencia';

export interface Payment {
  id: string;
  created_at: string;
  updated_at: string;
  empresa_id: string;
  consulta_id?: string;
  paciente_id: string;
  valor: number;
  forma_pagamento: PaymentMethod;
  data_pagamento: string;
  observacoes?: string;
  descricao?: string;
  confirmado: boolean;
  paciente_nome?: string;
  consulta_data?: string;
  consulta_procedimento?: string;
}

export interface CreatePaymentData {
  consulta_id?: string;
  paciente_id: string;
  valor: number;
  forma_pagamento: PaymentMethod;
  data_pagamento?: string;
  observacoes?: string;
  descricao?: string;
  confirmado?: boolean;
}

export interface UpdatePaymentData extends Partial<CreatePaymentData> {}

export interface PaymentFilters {
  paciente_id?: string;
  consulta_id?: string;
  data_inicio?: string;
  data_fim?: string;
  forma_pagamento?: PaymentMethod;
  confirmado?: boolean;
}

export interface FinancialSummary {
  subscription?: {
    id: number;
    status: string;
    valor_mensal: number;
    proxima_cobranca: string;
    plan: {
      nome: string;
      descricao: string;
      preco_mensal: number;
    };
  };
  summary: {
    monthlySubscription: number;
    monthlyChatbotCost: number;
    totalMonthlyCost: number;
    totalPayments: number;
    nextBilling: string | null;
  };
  chatbotBilling: any[];
  paymentHistory: any[];
}

// Interfaces de Procedimentos
export interface Procedure {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  preco_estimado?: number;
  tempo_estimado_min?: number; // em minutos
  ativo?: boolean;
  observacoes?: string;
  empresa_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProcedureData {
  nome: string;
  descricao?: string;
  categoria?: string;
  preco_estimado?: number;
  tempo_estimado_min?: number;
  ativo?: boolean;
  observacoes?: string;
}

export interface UpdateProcedureData extends Partial<CreateProcedureData> {}

class ApiService {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Obter token do localStorage
    const token = localStorage.getItem('auth_token');
    
    // Preparar headers
    const headers: Record<string, string> = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    // Só adicionar Content-Type se não for FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(url, {
      headers,
      ...options,
    });

    if (!response.ok) {
      let errorData: any;
      try {
        const errorText = await response.text();
        console.error('API: Erro na resposta:', errorText);
        errorData = errorText ? JSON.parse(errorText) : { message: `Erro ${response.status}: ${response.statusText}` };
      } catch {
        errorData = { message: `Erro ${response.status}: ${response.statusText}` };
      }
      
      const error = new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
      (error as any).response = { data: errorData, status: response.status };
      throw error;
    }

    // Sempre ler o texto primeiro para evitar erros de parsing
    const text = await response.text();
    
    // Se não há conteúdo, retornar objeto de sucesso padrão
    if (!text || text.trim() === '') {
      return { success: true, message: 'Operação realizada com sucesso' } as T;
    }
    
    // Tentar fazer parse JSON
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // Se falhar o parse, retornar objeto com o texto como mensagem
      console.warn('API: Erro ao fazer parse JSON, retornando texto:', text);
      return { success: true, message: text } as T;
    }
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
    const mappedPlans = result.map((plan: any, index: number) => {
      // O backend retorna plan.items como array de itens_plano_tratamento
      const planItems = plan.items || plan.itens_plano_tratamento || [];
      
      const mappedPlan = {
        id: plan.id || `plan-${index}`,
        title: plan.titulo || plan.title || `Plano ${index + 1}`,
        description: plan.descricao || plan.description || '',
        descricao: plan.descricao || plan.description || '', // Manter ambos para compatibilidade
        totalCost: plan.custo_total || plan.totalCost || 0,
        progress: plan.progresso || plan.progress || 0,
        status: plan.status || 'ativo',
        paciente_id: plan.paciente_id || plan.patientId,
        created_at: plan.created_at || plan.createdAt,
        items: Array.isArray(planItems) ? planItems.map((item: any, itemIndex: number) => ({
          id: item.id || `item-${itemIndex}`,
          procedure: item.procedimento || item.procedure || 'Procedimento',
          procedimento: item.procedimento || item.procedure || 'Procedimento', // Manter ambos
          description: item.descricao || item.description || '',
          descricao: item.descricao || item.description || '', // Manter ambos
          nome: item.nome || item.name || '',
          tooth: item.dente || item.tooth || '',
          priority: item.prioridade || item.priority || 'media',
          estimatedCost: item.custo_estimado || item.estimatedCost || 0,
          valor_total: item.custo_estimado || item.estimatedCost || item.valor_total || 0, // Campo para valor total (usa custo_estimado)
          custo_estimado: item.custo_estimado || item.estimatedCost || 0, // Manter ambos
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

    // Obter token do localStorage
    const token = localStorage.getItem('auth_token');
    
    // Preparar headers (sem Content-Type para FormData - o browser define automaticamente)
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}/files/upload`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorData: any;
      try {
        const errorText = await response.text();
        console.error('API: Erro no upload:', errorText);
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: `Erro ${response.status}: ${response.statusText}` };
      }
      
      const error = new Error(errorData.message || `Erro no upload: ${response.status} ${response.statusText}`);
      (error as any).response = { data: errorData, status: response.status };
      throw error;
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

  // ===== PAGAMENTOS =====

  async getAllPayments(filters?: PaymentFilters): Promise<Payment[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return this.request<Payment[]>(`/payments${queryString ? `?${queryString}` : ''}`);
  }

  async getPaymentById(id: string): Promise<Payment> {
    return this.request<Payment>(`/payments/${id}`);
  }

  async createPayment(data: CreatePaymentData): Promise<Payment> {
    return this.request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayment(id: string, data: UpdatePaymentData): Promise<Payment> {
    return this.request<Payment>(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePayment(id: string): Promise<void> {
    return this.request<void>(`/payments/${id}`, {
      method: 'DELETE',
    });
  }

  async getFinancialSummary(dataInicio?: string, dataFim?: string): Promise<FinancialSummary> {
    // Usar o endpoint correto que retorna subscription, summary, chatbotBilling e paymentHistory
    return this.request<FinancialSummary>('/subscriptions/financial-summary');
  }

  async getPaymentsSummary(dataInicio?: string, dataFim?: string): Promise<{
    total: number;
    quantidade: number;
    por_forma_pagamento: Record<string, number>;
    periodo: {
      inicio: string | null;
      fim: string | null;
    };
  }> {
    let url = '/payments/summary';
    const params = new URLSearchParams();
    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);
    if (params.toString()) url += `?${params.toString()}`;
    return this.request(url);
  }

  // Procedures methods
  async getProcedures(categoria?: string, ativo?: boolean): Promise<{ success: boolean; data: Procedure[]; total: number }> {
    let url = '/procedures';
    const params = new URLSearchParams();
    
    if (categoria) params.append('categoria', categoria);
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.request<{ success: boolean; data: Procedure[]; total: number }>(url);
  }

  async getProcedureById(id: string): Promise<{ success: boolean; data: Procedure }> {
    return this.request<{ success: boolean; data: Procedure }>(`/procedures/${id}`);
  }

  async getCategorias(): Promise<{ success: boolean; data: string[]; total: number }> {
    return this.request<{ success: boolean; data: string[]; total: number }>('/procedures/categorias');
  }

  async createProcedure(data: CreateProcedureData): Promise<{ success: boolean; data: Procedure; message: string }> {
    return this.request<{ success: boolean; data: Procedure; message: string }>('/procedures', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProcedure(id: string, data: UpdateProcedureData): Promise<{ success: boolean; data: Procedure; message: string }> {
    return this.request<{ success: boolean; data: Procedure; message: string }>(`/procedures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProcedure(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/procedures/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard methods (já definidos acima, removendo duplicatas)

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await this.request<{ success: boolean; data: DashboardStats }>('/dashboard/today-stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      return {
        todayAppointments: 0,
        totalPatients: 0,
        pendingConfirmations: 0,
        unreadMessages: 0
      };
    }
  }

  async getMonthlyStats(): Promise<{ atendimentosRealizados: number; taxaComparecimento: number; faturamento: number }> {
    try {
      const response = await this.request<{ success: boolean; data: any }>('/dashboard/monthly-stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas mensais:', error);
      return {
        atendimentosRealizados: 0,
        taxaComparecimento: 0,
        faturamento: 0
      };
    }
  }

  // Métodos de Notificações
  async getNotifications(userId?: string, limit = 50, offset = 0): Promise<Notification[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return this.request<Notification[]>(`/notifications?${params.toString()}`);
  }

  async getUnreadNotifications(userId?: string): Promise<Notification[]> {
    const params = userId ? `?userId=${userId}` : '';
    return this.request<Notification[]>(`/notifications/unread${params}`);
  }

  async getNotificationStats(userId?: string): Promise<NotificationStats> {
    const params = userId ? `?userId=${userId}` : '';
    return this.request<NotificationStats>(`/notifications/stats${params}`);
  }

  async markNotificationAsRead(id: string): Promise<void> {
    return this.request<void>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead(userId?: string): Promise<number> {
    const params = userId ? `?userId=${userId}` : '';
    return this.request<number>(`/notifications/mark-all-read${params}`, {
      method: 'PATCH',
    });
  }

  async runAutoNotificationCheck(empresaId?: string): Promise<{ success: boolean; created: number }> {
    const params = empresaId ? `?empresaId=${empresaId}` : '';
    return this.request<{ success: boolean; created: number }>(`/notifications/auto-check${params}`, {
      method: 'POST',
    });
  }

  async createNotification(notification: {
    user_id?: string;
    type: 'appointment' | 'return' | 'message' | 'confirmation' | 'system';
    title: string;
    message: string;
    data?: any;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    expires_at?: string;
  }): Promise<Notification> {
    return this.request<Notification>('/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  }

  async deleteNotification(id: string): Promise<void> {
    return this.request<void>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== PERFIL DE USUÁRIO =====
  
  async getPerfilUsuario(): Promise<any> {
    return this.request<any>('/usuarios/perfil');
  }

  async updatePerfilUsuario(data: {
    nome?: string;
    telefone?: string;
    cargo?: string;
    bio?: string;
    avatar_url?: string;
  }): Promise<any> {
    return this.request<any>('/usuarios/perfil', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('auth_token');
    const url = `${API_BASE_URL}/usuarios/perfil/avatar`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      let errorData: any;
      try {
        const errorText = await response.text();
        errorData = errorText ? JSON.parse(errorText) : { message: `Erro ${response.status}: ${response.statusText}` };
      } catch {
        errorData = { message: `Erro ${response.status}: ${response.statusText}` };
      }
      
      const error = new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
      (error as any).response = { data: errorData, status: response.status };
      throw error;
    }

    return await response.json();
  }

  // ===== GERENCIAMENTO DE USUÁRIOS =====
  
  async getAllUsuarios(): Promise<{ success: boolean; data: any[]; total: number }> {
    return this.request<{ success: boolean; data: any[]; total: number }>('/usuarios');
  }

  async getDentistas(): Promise<any[]> {
    try {
      // Usar endpoint específico que retorna apenas dentistas
      const response = await this.request<{ success: boolean; data: any[]; total: number }>('/usuarios/dentistas');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar dentistas:', error);
      return [];
    }
  }

  async createUsuario(data: {
    email: string;
    nome: string;
    cargo: string;
    telefone?: string;
    password?: string;
    avatar_url?: string;
    ativo?: boolean;
  }): Promise<{ success: boolean; data: any; message: string; password_temporaria?: string }> {
    return this.request<{ success: boolean; data: any; message: string; password_temporaria?: string }>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUsuario(id: string, data: {
    nome?: string;
    cargo?: string;
    telefone?: string;
    avatar_url?: string;
    ativo?: boolean;
  }): Promise<{ success: boolean; data: any; message: string }> {
    return this.request<{ success: boolean; data: any; message: string }>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deactivateUsuario(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/usuarios/${id}/deactivate`, {
      method: 'PUT',
    });
  }

  // ===== ASSINATURAS E PAGAMENTOS =====
  
  async getSubscriptionPlans(): Promise<any[]> {
    return this.request<any[]>('/subscriptions/plans');
  }

  async getEmpresaSubscription(): Promise<any> {
    return this.request<any>('/subscriptions/empresa');
  }

  async createEmpresaSubscription(data: {
    plan_id: number;
    valor_mensal: number;
  }): Promise<any> {
    return this.request<any>('/subscriptions/empresa', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmpresaSubscription(data: {
    status?: string;
    data_fim?: string;
    proxima_cobranca?: string;
  }): Promise<any> {
    return this.request<any>('/subscriptions/empresa', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getChatbotBilling(startDate?: string, endDate?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request<any[]>(`/subscriptions/chatbot-billing?${params.toString()}`);
  }

  async createChatbotBilling(data: {
    data_cobranca: string;
    tokens_utilizados: number;
    custo_tokens: number;
    custo_railway: number;
    custo_total: number;
  }): Promise<any> {
    return this.request<any>('/subscriptions/chatbot-billing', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentHistory(startDate?: string, endDate?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request<any[]>(`/subscriptions/payment-history?${params.toString()}`);
  }

  async createPaymentRecord(data: {
    tipo: string;
    valor: number;
    descricao: string;
    metodo_pagamento?: string;
    referencia_externa?: string;
  }): Promise<any> {
    return this.request<any>('/subscriptions/payment-history', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===== MÉTODOS GENÉRICOS =====
  
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const options: RequestInit = {
      method: 'POST',
    };

    // Se for FormData, não stringify
    if (data instanceof FormData) {
      options.body = data;
      // Remover Content-Type para FormData (será definido automaticamente)
    } else if (data) {
      options.body = JSON.stringify(data);
      options.headers = {
        'Content-Type': 'application/json',
      };
    }

    return this.request<T>(endpoint, options);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();

