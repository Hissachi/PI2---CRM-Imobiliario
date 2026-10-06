import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/AuthProvider";

export const metadata: Metadata = {
  title: "CRM Imobiliária",
  description: "Sistema de gestão de leads e imóveis - Projeto Integrador II UNIVESP",
};

/**
 * Layout raiz: apenas <html>/<body> e o provider de sessão.
 *
 * A navegação (sidebar + topo) fica no layout do route group `(app)`, para que
 * /login e a 404 sejam renderizadas sem a casca da aplicação.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full bg-slate-100 text-slate-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}