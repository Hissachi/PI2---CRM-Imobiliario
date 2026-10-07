import { Elysia, t } from "elysia";
import { db } from "../db/index.js";
import { leads, imoveis, visitas } from "../db/schema.js";
import { count, eq, gte, lte, and, sql } from "drizzle-orm";
import { createJwt, resolveCurrentUser, requireAuth } from "../plugins/auth.js";

export const dashboardRoutes = new Elysia({ prefix: "/api/dashboard" })
  .use(createJwt())
  .derive(resolveCurrentUser)
  .get("/", async ({ currentUser }) => {
    requireAuth({ currentUser });

    const [leadsTotal] = await db.select({ value: count() }).from(leads);
    const [imoveisTotal] = await db.select({ value: count() }).from(imoveis);
    const [imoveisDisponiveis] = await db
      .select({ value: count() })
      .from(imoveis)
      .where(eq(imoveis.status, "disponivel"));

    const now = new Date();
    const inicioDoMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const fimDoMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [visitasNoMes] = await db
      .select({ value: count() })
      .from(visitas)
      .where(
        and(
          eq(visitas.status, "agendada"),
          gte(visitas.dataHora, inicioDoMes),
          lte(visitas.dataHora, fimDoMes)
        )
      );

    const leadsPorEtapa = await db
      .select({ etapa: leads.etapa, total: count() })
      .from(leads)
      .groupBy(leads.etapa);

    const leadsPorOrigem = await db
      .select({ origem: leads.origem, total: count() })
      .from(leads)
      .groupBy(leads.origem);

    const imoveisPorStatus = await db
      .select({ status: imoveis.status, total: count() })
      .from(imoveis)
      .groupBy(imoveis.status);

    const visitasPorStatus = await db
      .select({ status: visitas.status, total: count() })
      .from(visitas)
      .groupBy(visitas.status);

    const valorCarteira = await db
      .select({ total: sql<number>`coalesce(sum(${imoveis.valor}), 0)` })
      .from(imoveis)
      .where(eq(imoveis.status, "disponivel"));

    return {
      success: true,
      data: {
        totais: {
          leads: leadsTotal.value,
          imoveis: imoveisTotal.value,
          imoveisDisponiveis: imoveisDisponiveis.value,
          visitasAgendadasNoMes: visitasNoMes.value,
        },
        valorCarteiraDisponivel: Number(valorCarteira[0]?.total ?? 0),
        leadsPorEtapa,
        leadsPorOrigem,
        imoveisPorStatus,
        visitasPorStatus,
      },
    };
  }, {
    detail: {
      tags: ["Dashboard"],
      summary: "Indicadores gerais do CRM",
      description: "Retorna totais, distribuição de leads por etapa e origem, status de imóveis e visitas.",
    },
  });
