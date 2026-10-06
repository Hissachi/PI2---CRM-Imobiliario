import Link from "next/link";
import { api, API_URL } from "@/lib/api-server";
import { Badge, EmptyState, ErrorState } from "@/components/ui";

export default async function ImoveisPage() {
  let imoveis;
  try {
    imoveis = await api.imoveis.list();
  } catch (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Imóveis</h1>
        <ErrorState
          message={`${error instanceof Error ? error.message : "Erro"} - API em ${API_URL}`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Imóveis</h1>
        <Link
          href="/imoveis/novo"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Novo imóvel
        </Link>
      </div>

      {imoveis.length === 0 ? (
        <EmptyState message="Nenhum imóvel cadastrado." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {imoveis.map((imovel) => (
            <article
              key={imovel.id}
              className="flex flex-col rounded-lg border border-slate-500 bg-white p-5"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h2 className="font-medium leading-snug">{imovel.titulo}</h2>
                <Badge value={imovel.status} kind="imovel" />
              </div>
              <p className="text-sm text-slate-600 capitalize">
                {imovel.tipo} - {imovel.finalidade}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {imovel.bairro}, {imovel.cidade}/{imovel.estado}
              </p>
              <p className="mt-3 text-lg font-semibold">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                  Number(imovel.valor)
                )}
                <span className="ml-1 text-xs font-normal text-slate-500">
                  /{imovel.finalidade === "venda" ? "venda" : "mês"}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {imovel.area ? `${imovel.area} m² - ` : ""}
                {imovel.quartos} qtos - {imovel.banheiros} banh - {imovel.vagas} vagas
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}