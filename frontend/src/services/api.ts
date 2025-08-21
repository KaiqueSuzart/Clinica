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
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
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

  async createAnnotation(annotation: Omit<Annotation, 'id' | 'created_at' | 'updated_at'>): Promise<Annotation> {
    return this.request('/annotations', {
      method: 'POST',
      body: JSON.stringify(annotation),
    });
  }

  async updateAnnotation(id: number, annotation: Partial<Annotation>): Promise<Annotation> {
    return this.request(`/annotations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(annotation),
    });
  }

  async deleteAnnotation(id: number): Promise<void> {
    return this.request(`/annotations/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== SESSÕES DE TRATAMENTO =====
  
  async updateSession(sessionId: string, updates: UpdateSessionData): Promise<TreatmentSession> {
    return this.request(`/treatment-sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getCompletedSessionsForPatient(patientId: string): Promise<any[]> {
    return this.request(`/treatment-sessions/patient/${patientId}/completed`);
  }
}

export const apiService = new ApiService();

