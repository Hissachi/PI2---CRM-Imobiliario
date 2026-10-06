"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { leadEtapas, leadOrigens } from "@/components/ui";

const emptyForm = {
  nome: "",
  email: "",
  telefone: "",
  origem: "site" as (typeof leadOrigens)[number],
  etapa: "novo" as (typeof leadEtapas)[number],
  corretorResponsavelId: "",
  observacoes: "",
};

export default function NovoLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.leads.create({
        nome: form.nome,
        email: form.email || undefined,
        telefone: form.telefone,
        origem: form.origem,
        etapa: form.etapa,
        corretorResponsavelId: form.corretorResponsavelId
          ? Number(form.corretorResponsavelId)
          : undefined,
        observacoes: form.observacoes || undefined,
      });
      router.push("/leads");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar lead");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Novo lead</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Nome</span>
          <input
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-800"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">E-mail</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-800"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Telefone</span>
            <input
              required
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-800"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Origem</span>
            <select
              value={form.origem}
              onChange={(e) => setForm({ ...form, origem: e.target.value as typeof form.origem })}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-800"
            >
              {leadOrigens.map((origem) => (
                <option key={origem} value={origem}>
                  {origem}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Etapa</span>
            <select
              value={form.etapa}
              onChange={(e) => setForm({ ...form, etapa: e.target.value as typeof form.etapa })}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-800"
            >
              {leadEtapas.map((etapa) => (
                <option key={etapa} value={etapa}>
                  {etapa.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Corretor responsável (ID)</span>
          <input
            type="number"
            value={form.corretorResponsavelId}
            onChange={(e) => setForm({ ...form, corretorResponsavelId: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-800"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Observações</span>
          <textarea
            rows={3}
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-800"
          />
        </label>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar lead"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/leads")}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}