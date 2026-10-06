/**
 * Leitura do payload JWT sem depender de biblioteca.
 *
 * Usado em dois lugares:
 *  - no cliente (AuthProvider) para descobrir nome/role do usuário logado;
 *  - no middleware (Edge runtime) para checar expiração e role antes de renderizar.
 *
 * IMPORTANTE: decodificar não é verificar assinatura. O middleware apenas usa
 * isso para decidir a navegação; a autorização real acontece na API, que valida
 * a assinatura do token. Ver `requireAuth` em apps/api/src/plugins/auth.ts.
 */

export interface TokenPayload {
  sub: string;
  nome: string;
  email: string;
  role: "admin" | "corretor";
  exp: number;
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");

  if (typeof atob === "function") {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  // Buffer existe apenas no runtime Node (ex.: Server Components).
  return Buffer.from(padded, "base64").toString("utf-8");
}

/** Extrai o payload, ou `null` se o token for malformado. */
export function decodeToken(token: string): TokenPayload | null {
  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as TokenPayload;
    if (!parsed.sub || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** `true` quando o token está ausente, malformado ou expirado. */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;
  // `exp` vem em segundos (epoch) no payload assinado pelo @elysiajs/jwt.
  return payload.exp * 1000 <= Date.now();
}