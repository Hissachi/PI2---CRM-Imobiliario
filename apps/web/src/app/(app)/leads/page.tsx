import Link from "next/link";
import { api, API_URL } from "@/lib/api-server";
import { Badge, EmptyState, ErrorState, leadEtapas } from "@/components/ui";

type SearchParams = Promise<{ etapa?: string }>;

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const { etapa } = await searchParams;
  const etapaValida = leadEtapas.find((item) => item === etapa);

  let leads;
  try {
    leads = await api.leads.list({ etapa: etapaValida });
  } catch (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <ErrorState
          message={`${error instanceof Error ? error.message : "Erro"} - API em ${API_URL}`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <Link
          href="/leads/novo"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Novo lead
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/leads"
          className={`rounded-full border px-3 py-1 ${!etapaValida ? "border-slate-900 bg-slate-900 text-white" : "border-slate-500"}`}
        >
          Todos
        </Link>
        {leadEtapas.map((item) => (
          <Link
            key={item}
            href={`/leads?etapa=${item}`}
            className={`rounded-full border px-3 py-1 capitalize ${etapaValida === item ? "border-slate-900 bg-slate-900 text-white" : "border-slate-500"}`}
          >
            {item.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      {leads.length === 0 ? (
        <EmptyState message="Nenhum lead encontrado para este filtro." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-500 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-500 bg-slate-50 text-left text-xs uppercase text-slate-700">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Etapa</th>
                <th className="px-4 py-3">Corretor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-4 py-3 font-medium">{lead.nome}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{lead.telefone}</div>
                    {lead.email && <div className="text-xs">{lead.email}</div>}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">{lead.origem}</td>
                  <td className="px-4 py-3">
                    <Badge value={lead.etapa} kind="lead" />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {lead.corretorResponsavel?.nome ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}