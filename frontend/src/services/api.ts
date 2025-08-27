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
  created_at?: string;
  updated_at?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('API: Fazendo requisição para:', url);
    console.log('API: Opções da requisição:', options);
    if (options.body) {
      console.log('API: Corpo da requisição:', options.body);
    }
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log('API: Status da resposta:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Erro na resposta:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('API: Resposta JSON:', result);
    return result;
  }

  // ===== PACIENTES =====
  
  async getPatients(): Promise<Patient[]> {
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

  // ===== TESTE DE CONEXÃO =====
  
  async testConnection(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/test-supabase');
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
    console.log('API: Dados sendo enviados para createTreatmentPlan:', planData);
    console.log('API: JSON stringificado:', JSON.stringify(planData));
    
    const result = await this.request('/treatment-plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
    
    console.log('API: Resposta recebida:', result);
    return result;
  }

  async getTreatmentPlansByPatient(patientId: number): Promise<any[]> {
    console.log('API: Buscando planos para paciente:', patientId);
    const result = await this.request(`/treatment-plans/patient/${patientId}`);
    console.log('API: Planos encontrados (brutos):', result);
    
    // Verificar se result é um array
    if (!Array.isArray(result)) {
      console.error('API: Resultado não é um array:', result);
      return [];
    }
    
    // Mapear dados do backend (português) para frontend (inglês)
    const mappedPlans = result.map((plan: any, index: number) => {
      console.log(`API: Mapeando plano ${index + 1}:`, plan);
      console.log(`API: Campo progresso do BD:`, plan.progresso);
      console.log(`API: Campo progress do BD:`, plan.progress);
      
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
      
      console.log(`API: Plano mapeado ${index + 1}:`, mappedPlan);
      return mappedPlan;
    });
    
    console.log('API: Planos mapeados:', mappedPlans);
    return mappedPlans;
  }

  async deleteTreatmentPlan(planId: string): Promise<{ message: string }> {
    console.log('API: Excluindo plano de tratamento:', planId);
    const result = await this.request<{ message: string }>(`/treatment-plans/${planId}`, {
      method: 'DELETE',
    });
    console.log('API: Plano excluído com sucesso:', result);
    return result;
  }

  async updateTreatmentPlan(planId: string, updateData: any): Promise<any> {
    console.log(`📝 API: Atualizando plano ${planId}:`, updateData);
    const result = await this.request<any>(`/treatment-plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    console.log(`✅ API: Plano ${planId} atualizado:`, result);
    return result;
  }

  async updateTreatmentPlanProgress(planId: string, progress: number): Promise<any> {
    console.log(`📊 API: Atualizando progresso do plano ${planId} para ${progress}%`);
    const result = await this.request<any>(`/treatment-plans/${planId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    });
    console.log(`✅ API: Progresso do plano ${planId} atualizado para ${progress}%`);
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
}

export const apiService = new ApiService();

