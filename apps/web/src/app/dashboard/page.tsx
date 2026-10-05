import { api, API_URL } from "@/lib/api";
import { Badge, EmptyState, ErrorState } from "@/components/ui";

export default async function DashboardPage() {
  try {
    const data = await api.dashboard.summary();
    const maxEtapa = Math.max(...data.leadsPorEtapa.map((item) => item.total), 1);

    const cards = [
      { label: "Leads totais", value: data.totais.leads },
      { label: "Imóveis disponíveis", value: data.totais.imoveisDisponiveis },
      { label: "Imóveis cadastrados", value: data.totais.imoveis },
      { label: "Visitas agendadas no mês", value: data.totais.visitasAgendadasNoMes },
    ];

    return (
      <div className="space-y-8">
        <section>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Valor em carteira disponível:{" "}
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              maximumFractionDigits: 0,
            }).format(data.valorCarteiraDisponivel)}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-1 text-3xl font-semibold">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-medium">Leads por etapa</h2>
            <ul className="space-y-3">
              {data.leadsPorEtapa.map((item) => (
                <li key={item.etapa} className="flex items-center gap-3">
                  <div className="w-32 shrink-0">
                    <Badge value={item.etapa} kind="lead" />
                  </div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-800"
                      style={{ width: `${(item.total / maxEtapa) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-sm tabular-nums">{item.total}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-medium">Leads por origem</h2>
            <ul className="space-y-2 text-sm">
              {data.leadsPorOrigem.map((item) => (
                <li key={item.origem} className="flex justify-between">
                  <span className="capitalize text-slate-600">{item.origem}</span>
                  <span className="tabular-nums font-medium">{item.total}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <ErrorState
          message={`${error instanceof Error ? error.message : "Erro desconhecido"}. Verifique se a API está rodando em ${API_URL}.`}
        />
      </div>
    );
  }
}

export function generateEmptyState() {
  return <EmptyState message="Sem dados" />;
}