import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

/**
 * Layout das páginas privadas (route group `(app)`).
 *
 * Duas camadas de proteção:
 *  - `middleware.ts` já redirecionou antes deste HTML ser gerado;
 *  - `ProtectedRoute` confirma o token com a API no cliente antes de exibir o
 *    conteúdo, e mostra o diálogo de "login necessário" se a sessão falhar.
 */
export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}