"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getToken, removeToken } from "@/lib/auth/storage";
import { SessionRequiredDialog } from "@/components/auth/SessionRequiredDialog";

/**
 * Envolve as páginas privadas e garante que só renderizam com sessão válida.
 *
 * Camada de segurança do cliente: o middleware já redireciona antes do HTML
 * chegar ao navegador, mas ele não valida assinatura. Aqui confirmamos o token
 * contra a API (`/auth/me`, feito no AuthProvider) antes de exibir o conteúdo.
 *
 * Sem token, ou com token rejeitado pela API, mostramos o diálogo e só
 * redirecionamos para /login depois do clique em "OK".
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reason, setReason] = useState<"missing" | "invalid" | null>(null);

  useEffect(() => {
    if (loading || user) return;

    // Havia token guardado, mas a API recusou (expirado ou assinatura inválida):
    // limpamos antes de redirecionar para não reenviar um token morto.
    const hadToken = Boolean(getToken());
    if (hadToken) removeToken();

    setReason(hadToken ? "invalid" : "missing");
  }, [loading, user]);

  if (reason) {
    return <SessionRequiredDialog open reason={reason} onConfirm={() => router.replace("/login")} />;
  }

  // Enquanto `loading` é true o AuthProvider ainda valida o token: não
  // renderizar o children evita um "flash" de conteúdo protegido.
  if (!user) return null;

  return <>{children}</>;
}