import Link from "next/link";

/**
 * Conteúdo da página 404.
 *
 * Atende dois casos: URL inexistente e tentativa de acessar /usuarios sem ser
 * admin (o middleware redireciona corretores para cá, para não revelar que a
 * tela existe). Por isso o texto é genérico.
 */
export function NotFoundContent() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <p className="text-7xl font-bold text-slate-900">404</p>

        <h1 className="mt-4 text-xl font-semibold text-slate-900">
          Página não encontrada
        </h1>
        <p className="mt-2 text-sm text-slate-700">
          O endereço acessado não existe ou não está disponível para o seu perfil.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          Voltar ao dashboard
        </Link>
      </div>
    </main>
  );
}