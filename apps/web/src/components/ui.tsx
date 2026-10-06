const etapas: Record<string, string> = {
  novo: "bg-sky-100 text-sky-800",
  em_atendimento: "bg-amber-100 text-amber-800",
  visita_agendada: "bg-violet-100 text-violet-900",
  proposta: "bg-orange-100 text-orange-800",
  fechado: "bg-emerald-100 text-emerald-800",
  perdido: "bg-slate-200 text-slate-700",
};

const imoveisStatus: Record<string, string> = {
  disponivel: "bg-emerald-100 text-emerald-800",
  reservado: "bg-amber-100 text-amber-800",
  vendido: "bg-sky-100 text-sky-800",
  locado: "bg-violet-100 text-violet-900",
};

const visitasStatus: Record<string, string> = {
  agendada: "bg-sky-100 text-sky-800",
  realizada: "bg-emerald-100 text-emerald-800",
  cancelada: "bg-rose-100 text-rose-900",
  reagendada: "bg-amber-100 text-amber-800",
};

export const badgeStyles = {
  lead: etapas,
  imovel: imoveisStatus,
  visita: visitasStatus,
};

export const leadEtapas = [
  "novo",
  "em_atendimento",
  "visita_agendada",
  "proposta",
  "fechado",
  "perdido",
] as const;

export const leadOrigens = ["site", "indicacao", "portal", "whatsapp", "outros"] as const;

export const imovelTipos = ["casa", "apartamento", "terreno", "comercial"] as const;

export const imovelStatusList = ["disponivel", "reservado", "vendido", "locado"] as const;

export function Badge({
  value,
  kind,
}: {
  value: string;
  kind: keyof typeof badgeStyles;
}) {
  const styles = badgeStyles[kind][value] ?? "bg-slate-100 text-slate-700";
  const label = value.replace(/_/g, " ");

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-400 bg-white p-12 text-center text-sm text-slate-600">
      {message}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-rose-700 bg-rose-50 p-4 text-sm text-rose-900">
      {message}
    </div>
  );
}