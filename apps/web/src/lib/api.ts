import type {
  ApiResponse,
  DashboardData,
  Imovel,
  ImovelStatus,
  ImovelTipo,
  Interacao,
  Lead,
  LeadEtapa,
  Visita,
  VisitaStatus,
  User,
} from "@crm/schemas";
import { getToken } from "@/lib/auth/storage";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

type ImovelInput = {
  tipo: Imovel["tipo"];
  finalidade: Imovel["finalidade"];
  titulo: string;
  descricao?: string;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  area?: number;
  quartos?: number;
  banheiros?: number;
  vagas?: number;
  valor: string;
  status?: Imovel["status"];
  fotos?: string[];
};

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Resolve o token a ser enviado na requisição.
 * - no navegador: lê o localStorage (ver lib/auth/storage.ts);
 * - no servidor: lê o cookie (ver lib/api-server.ts).
 */
export type TokenResolver = () => string | null | Promise<string | null>;

/**
 * Cria um cliente da API ligado a uma estratégia de token.
 *
 * Server Components não enxergam localStorage, então usam a instância de
 * `lib/api-server.ts`, que resolve o token a partir dos cookies.
 */
export function createApi(resolveToken: TokenResolver) {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await resolveToken();

    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

    if (!response.ok || !payload?.success) {
      throw new ApiError(response.status, payload?.message ?? "Erro ao comunicar com a API");
    }

    return payload.data as T;
  }

  return {
    auth: {
      login: (email: string, senha: string) =>
        request<{ user: User; token: string }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, senha }),
        }),
      me: () => request<User>("/auth/me"),
      logout: () => request<never>("/auth/logout", { method: "POST" }),
    },

    users: {
      list: () => request<User[]>("/users"),
      get: (id: number) => request<User>(`/users/${id}`),
      create: (body: { nome: string; email: string; senha: string; role?: User["role"] }) =>
        request<User>("/users", { method: "POST", body: JSON.stringify(body) }),
      update: (id: number, body: { nome: string; email: string; role: User["role"]; senha?: string }) =>
        request<User>(`/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
      remove: (id: number) => request<never>(`/users/${id}`, { method: "DELETE" }),
    },

    leads: {
      list: (params?: { etapa?: LeadEtapa; corretorId?: number; busca?: string }) => {
        const query = new URLSearchParams();
        if (params?.etapa) query.set("etapa", params.etapa);
        if (params?.corretorId) query.set("corretorId", String(params.corretorId));
        if (params?.busca) query.set("busca", params.busca);
        const qs = query.toString();
        return request<Lead[]>(`/leads${qs ? `?${qs}` : ""}`);
      },
      get: (id: number) => request<Lead>(`/leads/${id}`),
      create: (body: {
        nome: string;
        email?: string;
        telefone: string;
        origem?: Lead["origem"];
        etapa?: LeadEtapa;
        corretorResponsavelId?: number;
        observacoes?: string;
      }) => request<Lead>("/leads", { method: "POST", body: JSON.stringify(body) }),
      update: (id: number, body: Partial<Omit<Lead, "id" | "createdAt" | "updatedAt">>) =>
        request<Lead>(`/leads/${id}`, { method: "PUT", body: JSON.stringify(body) }),
      remove: (id: number) => request<never>(`/leads/${id}`, { method: "DELETE" }),
    },

    imoveis: {
      list: (params?: { tipo?: ImovelTipo; finalidade?: string; status?: ImovelStatus; busca?: string }) => {
        const query = new URLSearchParams();
        if (params?.tipo) query.set("tipo", params.tipo);
        if (params?.finalidade) query.set("finalidade", params.finalidade);
        if (params?.status) query.set("status", params.status);
        if (params?.busca) query.set("busca", params.busca);
        const qs = query.toString();
        return request<Imovel[]>(`/imoveis${qs ? `?${qs}` : ""}`);
      },
      get: (id: number) => request<Imovel>(`/imoveis/${id}`),
      create: (body: ImovelInput) =>
        request<Imovel>("/imoveis", { method: "POST", body: JSON.stringify(body) }),
      update: (id: number, body: Partial<Omit<Imovel, "id" | "createdAt" | "updatedAt">>) =>
        request<Imovel>(`/imoveis/${id}`, { method: "PUT", body: JSON.stringify(body) }),
      remove: (id: number) => request<never>(`/imoveis/${id}`, { method: "DELETE" }),
    },

    visitas: {
      list: (params?: { leadId?: number; imovelId?: number; status?: VisitaStatus }) => {
        const query = new URLSearchParams();
        if (params?.leadId) query.set("leadId", String(params.leadId));
        if (params?.imovelId) query.set("imovelId", String(params.imovelId));
        if (params?.status) query.set("status", params.status);
        const qs = query.toString();
        return request<Visita[]>(`/visitas${qs ? `?${qs}` : ""}`);
      },
      create: (body: {
        leadId: number;
        imovelId: number;
        dataHora: string;
        status?: Visita["status"];
        observacoes?: string;
      }) => request<Visita>("/visitas", { method: "POST", body: JSON.stringify(body) }),
      update: (id: number, body: Partial<Omit<Visita, "id" | "createdAt" | "updatedAt">>) =>
        request<Visita>(`/visitas/${id}`, { method: "PUT", body: JSON.stringify(body) }),
      remove: (id: number) => request<never>(`/visitas/${id}`, { method: "DELETE" }),
    },

    interacoes: {
      list: (leadId?: number) =>
        request<Interacao[]>(`/interacoes${leadId ? `?leadId=${leadId}` : ""}`),
      create: (body: { leadId: number; tipo: Interacao["tipo"]; descricao: string; dataHora?: string }) =>
        request<Interacao>("/interacoes", { method: "POST", body: JSON.stringify(body) }),
      remove: (id: number) => request<never>(`/interacoes/${id}`, { method: "DELETE" }),
    },

    dashboard: {
      summary: () => request<DashboardData>("/dashboard"),
    },
  };
}

/** Cliente usado no navegador (token vem do localStorage). */
export const api = createApi(getToken);

export { ApiError };