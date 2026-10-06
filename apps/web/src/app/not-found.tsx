import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/NotFoundContent";

export const metadata: Metadata = {
  title: "Página não encontrada - CRM Imobiliária",
};

/** Renderizado pelo Next.js em qualquer URL sem correspondência. */
export default function NotFound() {
  return <NotFoundContent />;
}