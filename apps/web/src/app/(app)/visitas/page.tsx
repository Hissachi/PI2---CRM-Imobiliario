import { api, API_URL } from "@/lib/api-server";
import { Badge, EmptyState, ErrorState } from "@/components/ui";

export default async function VisitasPage() {
  let visitas;
  try {
    visitas = await api.visitas.list();
  } catch (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Visitas</h1>
        <ErrorState
          message={`${error instanceof Error ? error.message : "Erro"} - API em ${API_URL}`}
        />
      </div>
    );
  }

  const agendadas = visitas.filter((v) => v.status === "agendada");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Agenda de visitas</h1>

      <section className="space-y-3">
        <h2 className="font-medium">Próximas agendadas ({agendadas.length})</h2>
        {agendadas.length === 0 ? (
          <EmptyState message="Nenhuma visita agendada." />
        ) : (
          <ul className="space-y-2">
            {agendadas.map((visita) => (
              <li
                key={visita.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-500 bg-white p-4"
              >
                <div>
                  <p className="font-medium">{visita.lead?.nome ?? `Lead #${visita.leadId}`}</p>
                  <p className="text-sm text-slate-600">
                    {visita.imovel?.titulo ?? `Imóvel #${visita.imovelId}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm tabular-nums text-slate-600">
                    {new Date(visita.dataHora).toLocaleString("pt-BR")}
                  </span>
                  <Badge value={visita.status} kind="visita" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Todas as visitas ({visitas.length})</h2>
        <div className="overflow-hidden rounded-lg border border-slate-500 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-500 bg-slate-50 text-left text-xs uppercase text-slate-700">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Imóvel</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visitas.map((visita) => (
                <tr key={visita.id}>
                  <td className="px-4 py-3 tabular-nums text-slate-600">
                    {new Date(visita.dataHora).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">{visita.lead?.nome ?? visita.leadId}</td>
                  <td className="px-4 py-3">{visita.imovel?.titulo ?? visita.imovelId}</td>
                  <td className="px-4 py-3">
                    <Badge value={visita.status} kind="visita" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}