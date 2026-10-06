/**
 * Storage abstrato para o token JWT.
 *
 * Hoje o token vive em localStorage (requisito do projeto) e é espelhado em um
 * cookie simples. O espelho existe porque o Next.js middleware roda no Edge
 * runtime, que não tem acesso a localStorage — sem o cookie não existe como
 * proteger a rota no servidor.
 *
 * Para migrar para cookie httpOnly basta trocar a implementação de
 * `TokenStorage` abaixo (ver `cookieTokenStorage`): nenhuma página ou
 * componente precisa mudar, pois todos usam apenas getToken/setToken/removeToken.
 */

export interface TokenStorage {
  get(): string | null;
  set(token: string): void;
  remove(): void;
}

const TOKEN_KEY = "crm:token";

/** Guarda a origem do token para o envio autenticado à API. */
const localStorageTokenStorage: TokenStorage = {
  get() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  remove() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
  },
};

/**
 * Cookie legível pelo middleware (não httpOnly, já que o requisito pede
 * localStorage como armazenamento principal). `SameSite=Lax` + `Path=/`
 * bastam para o mesmo domínio; em produção com subdomínios distintos use
 * `SameSite=None; Secure`.
 */
const cookieTokenStorage: TokenStorage = {
  get() {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|;\s*)crm_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  },
  set(token) {
    if (typeof document === "undefined") return;
    document.cookie = `crm_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
  },
  remove() {
    if (typeof document === "undefined") return;
    document.cookie = "crm_token=; Path=/; SameSite=Lax; Max-Age=0";
  },
};

/** Alternativa futura: trocar `compositeTokenStorage` por `cookieTokenStorage`. */
const compositeTokenStorage: TokenStorage = {
  get: () => localStorageTokenStorage.get() ?? cookieTokenStorage.get(),
  set: (token) => {
    localStorageTokenStorage.set(token);
    cookieTokenStorage.set(token);
  },
  remove: () => {
    localStorageTokenStorage.remove();
    cookieTokenStorage.remove();
  },
};

const storage = compositeTokenStorage;

export function getToken(): string | null {
  return storage.get();
}

export function setToken(token: string): void {
  storage.set(token);
}

export function removeToken(): void {
  storage.remove();
}