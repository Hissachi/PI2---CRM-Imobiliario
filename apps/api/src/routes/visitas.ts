import { Elysia, t } from "elysia";
import { db } from "../db";
import { visitas, leads, imoveis } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { createJwt, resolveCurrentUser, requireAuth } from "../plugins/auth";

const visitaStatusList = ["agendada", "realizada", "cancelada", "reagendada"] as const;
type VisitaStatus = (typeof visitaStatusList)[number];

export const visitasRoutes = new Elysia({ prefix: "/visitas" })
  .use(createJwt())
  .derive(resolveCurrentUser)
  .get("/", async ({ currentUser, query }) => {
    requireAuth({ currentUser });
    const queryBuilder = db.select({
      id: visitas.id,
      leadId: visitas.leadId,
      lead: {
        id: leads.id,
        nome: leads.nome,
        telefone: leads.telefone,
      },
      imovelId: visitas.imovelId,
      imovel: {
        id: imoveis.id,
        titulo: imoveis.titulo,
        endereco: imoveis.endereco,
      },
      dataHora: visitas.dataHora,
      status: visitas.status,
      observacoes: visitas.observacoes,
      createdAt: visitas.createdAt,
      updatedAt: visitas.updatedAt,
    })
    .from(visitas)
    .leftJoin(leads, eq(visitas.leadId, leads.id))
    .leftJoin(imoveis, eq(visitas.imovelId, imoveis.id));

    const conditions = [];
    if (query.leadId) {
      conditions.push(eq(visitas.leadId, Number(query.leadId)));
    }
    if (query.imovelId) {
      conditions.push(eq(visitas.imovelId, Number(query.imovelId)));
    }
    if (query.status && visitaStatusList.includes(query.status as VisitaStatus)) {
      conditions.push(eq(visitas.status, query.status as VisitaStatus));
    }

    const result = await queryBuilder
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(visitas.dataHora));

    return { success: true, data: result };
  }, {
    query: t.Optional(t.Object({
      leadId: t.Optional(t.String()),
      imovelId: t.Optional(t.String()),
      status: t.Optional(t.String()),
    })),
    detail: {
      tags: ["Visitas"],
      summary: "Listar visitas com filtros",
    },
  })
  .get("/:id", async ({ currentUser, params, set }) => {
    requireAuth({ currentUser });
    const result = await db.select({
      id: visitas.id,
      leadId: visitas.leadId,
      lead: { id: leads.id, nome: leads.nome },
      imovelId: visitas.imovelId,
      imovel: { id: imoveis.id, titulo: imoveis.titulo },
      dataHora: visitas.dataHora,
      status: visitas.status,
      observacoes: visitas.observacoes,
      createdAt: visitas.createdAt,
      updatedAt: visitas.updatedAt,
    })
    .from(visitas)
    .leftJoin(leads, eq(visitas.leadId, leads.id))
    .leftJoin(imoveis, eq(visitas.imovelId, imoveis.id))
    .where(eq(visitas.id, params.id))
    .limit(1);
    if (result.length === 0) {
      set.status = 404;
      return { success: false, message: "Visita nao encontrada" };
    }
    return { success: true, data: result[0] };
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    detail: {
      tags: ["Visitas"],
      summary: "Obter visita por ID",
    },
  })
  .post("/", async ({ currentUser, body, set }) => {
    requireAuth({ currentUser });
    try {
      const [newVisita] = await db.insert(visitas).values({
        leadId: body.leadId,
        imovelId: body.imovelId,
        dataHora: new Date(body.dataHora),
        status: body.status,
        observacoes: body.observacoes,
      }).returning();
      set.status = 201;
      return { success: true, data: newVisita };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Erro interno do servidor" };
    }
  }, {
    body: t.Object({
      leadId: t.Number(),
      imovelId: t.Number(),
      dataHora: t.String({ format: "date-time" }),
      status: t.Optional(t.Union([t.Literal("agendada"), t.Literal("realizada"), t.Literal("cancelada"), t.Literal("reagendada")])),
      observacoes: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Visitas"],
      summary: "Criar visita",
    },
  })
  .put("/:id", async ({ currentUser, params, body, set }) => {
    requireAuth({ currentUser });
    const [updatedVisita] = await db.update(visitas).set({
      leadId: body.leadId,
      imovelId: body.imovelId,
      dataHora: new Date(body.dataHora),
      status: body.status,
      observacoes: body.observacoes,
      updatedAt: new Date(),
    }).where(eq(visitas.id, params.id)).returning();
    if (!updatedVisita) {
      set.status = 404;
      return { success: false, message: "Visita nao encontrada" };
    }
    return { success: true, data: updatedVisita };
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    body: t.Object({
      leadId: t.Number(),
      imovelId: t.Number(),
      dataHora: t.String({ format: "date-time" }),
      status: t.Union([t.Literal("agendada"), t.Literal("realizada"), t.Literal("cancelada"), t.Literal("reagendada")]),
      observacoes: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Visitas"],
      summary: "Atualizar visita",
    },
  })
  .delete("/:id", async ({ currentUser, params, set }) => {
    requireAuth({ currentUser });
    const [deleted] = await db.delete(visitas).where(eq(visitas.id, params.id)).returning({ id: visitas.id });
    if (!deleted) {
      set.status = 404;
      return { success: false, message: "Visita nao encontrada" };
    }
    return { success: true, message: "Visita excluida com sucesso" };
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    detail: {
      tags: ["Visitas"],
      summary: "Excluir visita",
    },
  });
