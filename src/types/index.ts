export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'dentista' | 'recepcionista' | 'financeiro';
  avatar?: string;
  permissions: string[];
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthDate: string;
  address: string;
  lastVisit?: string;
  nextReturn?: string;
  status: 'ativo' | 'inativo';
  anamnese?: Anamnese;
  files: PatientFile[];
  procedures: Procedure[];
  notes: PatientNote[];
  timeline: TimelineEvent[];
  treatmentPlan?: TreatmentPlan;
  scheduledReturn?: ScheduledReturn;
}

export interface ScheduledReturn {
  id: string;
  patientId: string;
  patientName: string;
  procedure: string;
  returnDate: string;
  reminderDate: string;
  notes?: string;
  status: 'agendado' | 'lembrete_enviado' | 'pendente_agendamento';
  createdAt: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  title: string;
  description: string;
  items: TreatmentItem[];
  totalCost: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentItem {
  id: string;
  procedure: string;
  description: string;
  tooth?: string;
  priority: 'alta' | 'media' | 'baixa';
  estimatedCost: number;
  estimatedSessions: number;
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
  startDate?: string;
  completionDate?: string;
  notes: string;
  order: number;
}
export interface PatientNote {
  id: string;
  patientId: string;
  content: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  type: 'consulta' | 'procedimento' | 'arquivo' | 'nota' | 'retorno' | 'anamnese';
  title: string;
  description: string;
  date: string;
  professional?: string;
  attachments?: string[];
}

export interface Anamnese {
  id: string;
  patientId: string;
  allergies: string;
  medications: string;
  medicalHistory: string;
  dentalHistory: string;
  consent: boolean;
  consentDate: string;
  createdAt: string;
}

export interface PatientFile {
  id: string;
  patientId: string;
  name: string;
  type: 'image' | 'document';
  url: string;
  uploadDate: string;
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
  status: 'confirmado' | 'pendente' | 'cancelado' | 'realizado';
  notes?: string;
}

export interface Message {
  id: string;
  patientId: string;
  patientName: string;
  type: 'confirmacao' | 'lembrete' | 'retorno' | 'orcamento';
  content: string;
  sentAt: string;
  status: 'enviada' | 'lida' | 'respondida';
}

export interface ReturnVisit {
  id: string;
  patientId: string;
  patientName: string;
  procedure: string;
  returnDate: string;
  status: 'confirmado' | 'pendente' | 'reagendado';
  originalDate: string;
}

export interface Budget {
  id: string;
  patientId: string;
  patientName: string;
  items: BudgetItem[];
  total: number;
  status: 'rascunho' | 'aprovado' | 'recusado';
  createdAt: string;
  validUntil: string;
}

export interface BudgetItem {
  id: string;
  procedure: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Procedure {
  id: string;
  patientId: string;
  name: string;
  description: string;
  date: string;
  professional: string;
  cost: number;
  status: 'planejado' | 'realizado' | 'cancelado';
}

export interface Notification {
  id: string;
  type: 'confirmation' | 'message' | 'return' | 'appointment';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ClinicSettings {
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  messageTemplates: {
    welcome: string;
    confirmation: string;
    return: string;
    budget: string;
  };
}

export interface UserPermissions {
  [key: string]: {
    canView: string[];
    canEdit: string[];
    canDelete: string[];
  };
}