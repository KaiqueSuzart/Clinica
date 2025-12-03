import { User, Patient, Appointment, Message, ReturnVisit, Budget, ClinicSettings, Notification, PatientNote, TimelineEvent, UserPermissions } from '../types';

export const currentUser: User = {
  id: '1',
  name: 'Dr. Ana Silva',
  email: 'ana@clinica.com',
  role: 'admin',
  avatar: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  permissions: ['all']
};

export const notifications: Notification[] = [
  {
    id: '1',
    type: 'confirmation',
    title: '3 confirmações pendentes',
    message: 'Pacientes aguardando confirmação de consulta',
    isRead: false,
    createdAt: '2024-01-25T08:00:00Z',
    priority: 'high'
  },
  {
    id: '2',
    type: 'message',
    title: '1 mensagem não lida',
    message: 'Nova resposta no WhatsApp',
    isRead: false,
    createdAt: '2024-01-25T09:30:00Z',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'return',
    title: '2 retornos hoje',
    message: 'Pacientes com retorno agendado para hoje',
    isRead: true,
    createdAt: '2024-01-25T07:00:00Z',
    priority: 'medium'
  }
];

export const userPermissions: UserPermissions = {
  admin: {
    canView: ['dashboard', 'agenda', 'pacientes', 'mensagens', 'retornos', 'orcamentos', 'anamnese', 'arquivos', 'relatorios', 'configuracoes'],
    canEdit: ['dashboard', 'agenda', 'pacientes', 'mensagens', 'retornos', 'orcamentos', 'anamnese', 'arquivos', 'relatorios', 'configuracoes'],
    canDelete: ['pacientes', 'orcamentos', 'arquivos']
  },
  dentista: {
    // Dentista tem o mesmo acesso que admin
    canView: ['dashboard', 'agenda', 'pacientes', 'mensagens', 'retornos', 'orcamentos', 'anamnese', 'arquivos', 'relatorios', 'configuracoes'],
    canEdit: ['dashboard', 'agenda', 'pacientes', 'mensagens', 'retornos', 'orcamentos', 'anamnese', 'arquivos', 'relatorios', 'configuracoes'],
    canDelete: ['pacientes', 'orcamentos', 'arquivos']
  },
  recepcionista: {
    canView: ['dashboard', 'agenda', 'pacientes', 'mensagens', 'retornos', 'configuracoes'],
    canEdit: ['agenda', 'pacientes', 'mensagens'],
    canDelete: []
  },
  financeiro: {
    canView: ['dashboard', 'orcamentos', 'relatorios'],
    canEdit: ['orcamentos'],
    canDelete: []
  }
};

export const patients: Patient[] = [
  {
    id: '1',
    name: 'João Santos',
    phone: '(11) 99999-9999',
    email: 'joao@email.com',
    birthDate: '1985-05-15',
    address: 'Rua das Flores, 123',
    lastVisit: '2024-01-15',
    nextReturn: '2024-02-15',
    status: 'ativo',
    notes: [
      {
        id: '1',
        patientId: '1',
        content: 'Paciente prefere ser chamado à tarde. Tem receio de procedimentos com anestesia.',
        isPrivate: true,
        createdBy: 'Dr. Ana Silva',
        createdAt: '2024-01-15T14:30:00Z'
      }
    ],
    timeline: [
      {
        id: '1',
        patientId: '1',
        type: 'consulta',
        title: 'Consulta Inicial',
        description: 'Primeira consulta - Avaliação geral e limpeza',
        date: '2024-01-15T14:00:00Z',
        professional: 'Dr. Ana Silva'
      },
      {
        id: '2',
        patientId: '1',
        type: 'arquivo',
        title: 'Raio-X Panorâmico',
        description: 'Upload de exame radiográfico',
        date: '2024-01-15T14:30:00Z',
        professional: 'Dr. Ana Silva',
        attachments: ['raio-x-panoramico.jpg']
      },
      {
        id: '3',
        patientId: '1',
        type: 'retorno',
        title: 'Retorno Agendado',
        description: 'Avaliação pós-limpeza marcada para 15/02',
        date: '2024-01-15T15:00:00Z',
        professional: 'Dr. Ana Silva'
      }
    ],
    files: [
      {
        id: '1',
        patientId: '1',
        name: 'Raio-X Panorâmico',
        type: 'image',
        url: 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=300',
        uploadDate: '2024-01-15'
      }
    ],
    procedures: [
      {
        id: '1',
        patientId: '1',
        name: 'Limpeza',
        description: 'Profilaxia completa',
        date: '2024-01-15',
        professional: 'Dr. Ana Silva',
        cost: 150,
        status: 'realizado'
      }
    ]
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    phone: '(11) 88888-8888',
    email: 'maria@email.com',
    birthDate: '1990-08-22',
    address: 'Av. Principal, 456',
    lastVisit: '2024-01-20',
    status: 'ativo',
    files: [],
    procedures: [],
    notes: [],
    timeline: []
  },
  {
    id: '3',
    name: 'Carlos Pereira',
    phone: '(11) 77777-7777',
    email: 'carlos@email.com',
    birthDate: '1978-12-10',
    address: 'Rua da Paz, 789',
    lastVisit: '2024-01-10',
    nextReturn: '2024-02-10',
    status: 'ativo',
    files: [],
    procedures: [],
    notes: [],
    timeline: []
  }
];

// Função para obter data de hoje
const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Função para obter data de amanhã
const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

export const appointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'João Santos',
    patientPhone: '(11) 99999-9999',
    date: getToday(),
    time: '14:00',
    duration: 60,
    procedure: 'Consulta',
    professional: 'Dr. Ana Silva',
    status: 'confirmado'
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Maria Oliveira',
    patientPhone: '(11) 88888-8888',
    date: getToday(),
    time: '15:30',
    duration: 90,
    procedure: 'Limpeza',
    professional: 'Dr. Ana Silva',
    status: 'pendente'
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Carlos Pereira',
    patientPhone: '(11) 77777-7777',
    date: getTomorrow(),
    time: '09:00',
    duration: 120,
    procedure: 'Tratamento de Canal',
    professional: 'Dr. Pedro Costa',
    status: 'confirmado'
  },
  {
    id: '4',
    patientId: '4',
    patientName: 'Ana Costa',
    patientPhone: '(11) 66666-6666',
    date: getToday(),
    time: '10:00',
    duration: 30,
    procedure: 'Consulta de Rotina',
    professional: 'Dr. Ana Silva',
    status: 'realizado'
  },
  {
    id: '5',
    patientId: '5',
    patientName: 'Pedro Silva',
    patientPhone: '(11) 55555-5555',
    date: getToday(),
    time: '11:30',
    duration: 45,
    procedure: 'Avaliação',
    professional: 'Dr. Pedro Costa',
    status: 'pendente'
  }
];

export const messages: Message[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'João Santos',
    type: 'confirmacao',
    content: 'Olá João! Lembramos que você tem consulta marcada para amanhã às 14:00. Confirme sua presença.',
    sentAt: '2024-01-24T10:00:00Z',
    status: 'lida'
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Maria Oliveira',
    type: 'lembrete',
    content: 'Oi Maria! Sua consulta é hoje às 15:30. Aguardamos você!',
    sentAt: '2024-01-25T08:00:00Z',
    status: 'enviada'
  }
];

export const returnVisits: ReturnVisit[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'João Santos',
    procedure: 'Avaliação pós-limpeza',
    returnDate: getTomorrow(),
    status: 'pendente',
    originalDate: '2024-01-15'
  },
  {
    id: '2',
    patientId: '3',
    patientName: 'Carlos Pereira',
    procedure: 'Controle do canal',
    returnDate: getTomorrow(),
    status: 'confirmado',
    originalDate: '2024-01-10'
  }
];

export const budgets: Budget[] = [
  {
    id: '1',
    patientId: '2',
    patientName: 'Maria Oliveira',
    items: [
      {
        id: '1',
        procedure: 'Clareamento',
        description: 'Clareamento dental a laser',
        quantity: 1,
        unitPrice: 800,
        total: 800
      },
      {
        id: '2',
        procedure: 'Restauração',
        description: 'Restauração em resina composta',
        quantity: 2,
        unitPrice: 200,
        total: 400
      }
    ],
    total: 1200,
    status: 'aprovado',
    createdAt: '2024-01-20',
    validUntil: '2024-02-20'
  }
];

export const clinicSettings: ClinicSettings = {
  name: 'Smile Care Odontologia',
  address: 'Rua das Palmeiras, 123 - Centro',
  phone: '(11) 3333-3333',
  email: 'contato@smilecare.com.br',
  messageTemplates: {
    welcome: 'Olá {nome}! Bem-vindo(a) à Smile Care. Estamos aqui para cuidar do seu sorriso!',
    confirmation: 'Olá {nome}! Lembramos que você tem consulta marcada para {data} às {horario}. Confirme sua presença.',
    return: 'Oi {nome}! Está na hora do seu retorno. Entre em contato para agendar.',
    budget: 'Olá {nome}! Seu orçamento está pronto. Acesse o link para visualizar: {link}'
  }
};