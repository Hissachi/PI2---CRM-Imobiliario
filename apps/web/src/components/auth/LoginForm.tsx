"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { IconEye, IconEyeOff } from "@/components/icons";

/**
 * Formulário de login.
 *
 * Mensagem de erro genérica de propósito: não revela se o e-mail existe, o que
 * evita enumeração de contas. O erro real da API fica só no console.
 */
export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Página de destino após o login: o middleware manda o usuário original.
  const next = searchParams.get("next");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await login(email, senha);
      router.replace(next && next.startsWith("/") ? next : "/dashboard");
    } catch {
      setError("E-mail ou senha inválidos.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-md border border-rose-500 bg-rose-50 px-4 py-3 text-sm text-rose-900"
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-slate-800">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@imobiliaria.com"
          className="w-full rounded-md border border-slate-500 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-600 focus:border-sky-700 focus:outline-2 focus:outline-offset-0 focus:outline-sky-700"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="senha" className="block text-sm font-medium text-slate-800">
          Senha
        </label>
        <div className="relative">
          <input
            id="senha"
            name="senha"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            placeholder="••••••••"
            className="w-full rounded-md border border-slate-500 bg-white px-3 py-2.5 pr-11 text-slate-900 placeholder:text-slate-600 focus:border-sky-700 focus:outline-2 focus:outline-offset-0 focus:outline-sky-700"
          />
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-700"
          >
            {showPassword ? <IconEyeOff className="size-5" /> : <IconEye className="size-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting && (
          <svg
            aria-hidden="true"
            className="size-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {submitting ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}