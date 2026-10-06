import { NextResponse, type NextRequest } from "next/server";
import { decodeToken, isTokenExpired } from "@/lib/auth/token";

/**
 * Proteção de rotas no servidor (Edge runtime).
 *
 * O middleware não tem acesso a localStorage, por isso `setToken` também
 * espelha o token em um cookie legível (ver lib/auth/storage.ts). Aqui usamos
 * esse espelho para:
 *
 *  1. redirecionar para /login quem não tem token válido (antes de renderizar);
 *  2. mandar quem não tem permissão para /usuarios direto para a 404;
 *  3. mandar quem já está logado para fora de /login.
 *
 * O middleware não é a fronteira de segurança: ele não valida a assinatura.
 * A checagem real acontece na API (`requireAuth`/`requireRole`). Aqui só
 * decodificamos o payload para UX de navegação.
 */

/** Rotas liberadas. */
const PUBLIC_PATHS = ["/login", "/404"];

/** Rotas restritas por role (admin). Corretor acessando cai na 404. */
const ADMIN_ONLY = ["/usuarios"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function hasAdminOnlyPrefix(pathname: string): boolean {
  return ADMIN_ONLY.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("crm_token")?.value ?? null;

  // Rota pública: nada a checar, exceto evitar tela de login para quem tem sessão.
  if (isPublicPath(pathname)) {
    if (pathname === "/login" && token && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Sem token ou token expirado → login. Token expirado também é removido do
  // cookie para não reenviar um token morto a cada navegação.
  if (!token || isTokenExpired(token)) {
    if (token) request.cookies.delete("crm_token");

    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role insuficiente → 404 (não 403), conforme requisito: corretor não deve
  // nem confirmar que a tela /usuarios existe.
  if (hasAdminOnlyPrefix(pathname)) {
    const payload = decodeToken(token);
    if (payload?.role !== "admin") {
      return NextResponse.redirect(new URL("/404", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Tudo, exceto assets e rotas da API (a API tem controle próprio).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)"],
};