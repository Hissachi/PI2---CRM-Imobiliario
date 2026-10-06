import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Entrar - CRM Imobiliária",
  description: "Acesso ao sistema CRM Imobiliária",
};

/**
 * Página de login. Client apenas o formulário — o layout simples e centralizado
 * fica no servidor. `Suspense` é exigido porque `LoginForm` usa useSearchParams.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white"
          >
            CR
          </span>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">CRM Imobiliária</h1>
          <p className="mt-1 text-sm text-slate-700">Projeto Integrador II - UNIVESP</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">Acesse sua conta</h2>
          <Suspense fallback={<div className="h-64" aria-hidden="true" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}