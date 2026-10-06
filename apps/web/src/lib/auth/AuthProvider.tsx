"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { getToken, removeToken, setToken } from "@/lib/auth/storage";
import { decodeToken, isTokenExpired, type TokenPayload } from "@/lib/auth/token";
import type { User, UserRole } from "@crm/schemas";

interface AuthState {
  user: User | null;
  /** `true` enquanto o token guardado ainda não foi validado contra a API. */
  loading: boolean;
  login(email: string, senha: string): Promise<User>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/** Monta um User a partir do payload do JWT, sem esperar a API. */
function userFromPayload(payload: TokenPayload): User {
  return {
    id: Number(payload.sub),
    nome: payload.nome,
    email: payload.email,
    role: payload.role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Valida a sessão uma vez ao montar: confirma com a API que o token
  // guardado ainda é aceito (e não expirou/revogado).
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    if (isTokenExpired(token)) {
      removeToken();
      setLoading(false);
      return;
    }

    let cancelled = false;
    api.auth
      .me()
      .then((fresh) => {
        if (!cancelled) setUser(fresh);
      })
      .catch(() => {
        removeToken();
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const result = await api.auth.login(email, senha);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    // Invalida o cookie httpOnly da API, mas não bloqueia a saída se ela falhar.
    await api.auth.logout().catch(() => undefined);
    removeToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return context;
}

/** `true` apenas para admins — usado para exibir /usuarios no menu. */
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === ("admin" satisfies UserRole);
}