import { jwt } from "@elysiajs/jwt";
import type { UserRole } from "@crm/schemas";

export const JWT_SECRET = process.env.JWT_SECRET ?? "super-secret-key-change-in-production";

export interface AuthenticatedUser {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
}

/** Erro de autenticação/autorização, tratado pelo `onError` global em index.ts. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * Plugin de decodificação do JWT.
 *
 * Precisa ser aplicado na MESMA instância que declara as rotas (e não numa
 * instância compartilhada via `.use`): no Elysia 1.4 o `jwt` injetado por um
 * plugin externo não é visível no `derive` de uma instância que tenha
 * `prefix`. Por isso cada router chama `createJwt()` e encadeia `.derive(...)`.
 */
export function createJwt() {
  return jwt({ name: "jwt", secret: JWT_SECRET });
}

/**
 * Deriva `currentUser` a partir do token da requisição.
 *
 * Aceita o token pelo header `Authorization: Bearer` ou pelo cookie `jwt`
 * (que a própria rota de login define). Retorna `null` quando anônimo — quem
 * decide rejeitar é `requireAuth`/`requireRole`, chamado no handler.
 */
export async function resolveCurrentUser({
  request,
  jwt,
}: {
  request: Request;
  // Tipagem mínima do plugin do Elysia: só `verify` é usado aqui. O retorno é
  // `false` quando a assinatura não confere e o payload decodificado quando
  // confere; o tipo concreto depende de como o token foi assinado.
  jwt: { verify(token?: string): Promise<true | false | Record<string, unknown>> };
}): Promise<{ currentUser: AuthenticatedUser | null }> {
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "").trim() ||
    parseCookie(request.headers.get("cookie"))?.jwt;

  if (!token) return { currentUser: null };

  const payload = await jwt.verify(token).catch(() => false);

  // `true` indica token válido sem payload claims (não é o caso do nosso login).
  if (!payload || payload === true || !("sub" in payload)) return { currentUser: null };

  return {
    currentUser: {
      id: Number(payload.sub),
      nome: payload.nome as string,
      email: payload.email as string,
      role: payload.role as UserRole,
    },
  };
}

/** Qualquer contexto que possua `currentUser` (vem do `derive` acima). */
type AuthContext = { currentUser: AuthenticatedUser | null };

/**
 * Guards chamados no início de cada handler.
 *
 * Recebem o contexto explicitamente em vez de usar `this`: o Elysia embrulha o
 * contexto em um proxy, e `this` dentro do handler não é o objeto desestruturado
 * nos parâmetros.
 */
export function requireAuth(context: AuthContext): AuthenticatedUser {
  if (!context.currentUser) throw new HttpError(401, "Não autenticado");
  return context.currentUser;
}

/** Exige JWT válido e uma das roles informadas (vazio = qualquer role). */
export function requireRole(context: AuthContext, ...roles: UserRole[]): AuthenticatedUser {
  const user = requireAuth(context);

  if (roles.length > 0 && !roles.includes(user.role)) {
    throw new HttpError(403, "Acesso negado para o seu perfil");
  }

  return user;
}

export function parseCookie(header: string | null): Record<string, string> | null {
  if (!header) return null;

  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const index = part.indexOf("=");
    if (index === -1) return acc;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}