"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { imovelStatusList, imovelTipos } from "@/components/ui";

const emptyForm = {
  tipo: "casa" as (typeof imovelTipos)[number],
  finalidade: "venda" as "venda" | "locacao",
  titulo: "",
  descricao: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "SP",
  cep: "",
  area: "",
  quartos: "",
  banheiros: "",
  vagas: "",
  valor: "",
  status: "disponivel" as (typeof imovelStatusList)[number],
};

export default function NovoImovelPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.imoveis.create({
        tipo: form.tipo,
        finalidade: form.finalidade,
        titulo: form.titulo,
        descricao: form.descricao || undefined,
        endereco: form.endereco,
        numero: form.numero || undefined,
        complemento: form.complemento || undefined,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado.toUpperCase(),
        cep: form.cep,
        area: form.area ? Number(form.area) : undefined,
        quartos: form.quartos ? Number(form.quartos) : undefined,
        banheiros: form.banheiros ? Number(form.banheiros) : undefined,
        vagas: form.vagas ? Number(form.vagas) : undefined,
        valor: form.valor,
        status: form.status,
        fotos: [],
      });
      router.push("/imoveis");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar imóvel");
    } finally {
      setSaving(false);
    }
  }

  const field =
    "w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-800";
  const label = "mb-1 block font-medium";

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Novo imóvel</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <label className="block text-sm">
          <span className={label}>Título</span>
          <input required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className={field} />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className={label}>Tipo</span>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as typeof form.tipo })}
              className={field}
            >
              {imovelTipos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className={label}>Finalidade</span>
            <select
              value={form.finalidade}
              onChange={(e) => setForm({ ...form, finalidade: e.target.value as typeof form.finalidade })}
              className={field}
            >
              <option value="venda">Venda</option>
              <option value="locacao">Locação</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className={label}>Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
              className={field}
            >
              {imovelStatusList.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          <span className={label}>Descrição</span>
          <textarea
            rows={3}
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className={field}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm sm:col-span-2">
            <span className={label}>Endereço</span>
            <input required value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} className={field} />
          </label>
          <label className="block text-sm">
            <span className={label}>Número</span>
            <input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} className={field} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className={label}>Bairro</span>
            <input required value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} className={field} />
          </label>
          <label className="block text-sm">
            <span className={label}>Cidade</span>
            <input required value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} className={field} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className={label}>UF</span>
              <input
                required
                maxLength={2}
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })}
                className={field}
              />
            </label>
            <label className="block text-sm">
              <span className={label}>CEP</span>
              <input required value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} className={field} />
            </label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-5">
          <label className="block text-sm">
            <span className={label}>Área (m²)</span>
            <input type="number" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className={field} />
          </label>
          <label className="block text-sm">
            <span className={label}>Quartos</span>
            <input type="number" value={form.quartos} onChange={(e) => setForm({ ...form, quartos: e.target.value })} className={field} />
          </label>
          <label className="block text-sm">
            <span className={label}>Banheiros</span>
            <input type="number" value={form.banheiros} onChange={(e) => setForm({ ...form, banheiros: e.target.value })} className={field} />
          </label>
          <label className="block text-sm">
            <span className={label}>Vagas</span>
            <input type="number" value={form.vagas} onChange={(e) => setForm({ ...form, vagas: e.target.value })} className={field} />
          </label>
          <label className="block text-sm">
            <span className={label}>Valor</span>
            <input required type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} className={field} />
          </label>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar imóvel"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/imoveis")}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}