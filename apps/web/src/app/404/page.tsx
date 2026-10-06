import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/NotFoundContent";

export const metadata: Metadata = {
  title: "Página não encontrada - CRM Imobiliária",
};

/**
 * Rota explícita /404.
 *
 * O middleware redireciona para cá quando um corretor tenta acessar /usuarios.
 * Manter como rota real permite testar o fluxo e linkar a página em docs.
 */
export default function NotFoundPage() {
  return <NotFoundContent />;
}