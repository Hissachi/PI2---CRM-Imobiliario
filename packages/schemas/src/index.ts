export type UserRole = "admin" | "corretor";

export type LeadOrigem = "site" | "indicacao" | "portal" | "whatsapp" | "outros";

export type LeadEtapa =
  | "novo"
  | "em_atendimento"
  | "visita_agendada"
  | "proposta"
  | "fechado"
  | "perdido";

export type ImovelTipo = "casa" | "apartamento" | "terreno" | "comercial";

export type ImovelFinalidade = "venda" | "locacao";

export type ImovelStatus = "disponivel" | "reservado" | "vendido" | "locado";

export type VisitaStatus = "agendada" | "realizada" | "cancelada" | "reagendada";

export type InteracaoTipo = "ligacao" | "whatsapp" | "email" | "visita" | "proposta" | "outros";

export interface User {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  id: number;
  nome: string;
  email: string | null;
  telefone: string;
  origem: LeadOrigem;
  etapa: LeadEtapa;
  corretorResponsavelId: number | null;
  corretorResponsavel?: Pick<User, "id" | "nome" | "email"> | null;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Imovel {
  id: number;
  tipo: ImovelTipo;
  finalidade: ImovelFinalidade;
  titulo: string;
  descricao: string | null;
  endereco: string;
  numero: string | null;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  area: number | null;
  quartos: number;
  banheiros: number;
  vagas: number;
  valor: string;
  status: ImovelStatus;
  fotos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Visita {
  id: number;
  leadId: number;
  imovelId: number;
  dataHora: string;
  status: VisitaStatus;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
  lead?: { id: number; nome: string } | null;
  imovel?: { id: number; titulo: string } | null;
}

export interface Interacao {
  id: number;
  leadId: number;
  tipo: InteracaoTipo;
  descricao: string;
  dataHora: string;
  createdAt: string;
}

export interface DashboardData {
  totais: {
    leads: number;
    imoveis: number;
    imoveisDisponiveis: number;
    visitasAgendadasNoMes: number;
  };
  valorCarteiraDisponivel: number;
  leadsPorEtapa: { etapa: LeadEtapa; total: number }[];
  leadsPorOrigem: { origem: LeadOrigem; total: number }[];
  imoveisPorStatus: { status: ImovelStatus; total: number }[];
  visitasPorStatus: { status: VisitaStatus; total: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}