import { Elysia, t } from "elysia";
import { db } from "../db/index.js";
import { leads, users } from "../db/schema.js";
import { eq, desc, and, ilike, or } from "drizzle-orm";
import { createJwt, resolveCurrentUser, requireAuth } from "../plugins/auth.js";

const leadEtapas = ["novo", "em_atendimento", "visita_agendada", "proposta", "fechado", "perdido"] as const;
type LeadEtapa = (typeof leadEtapas)[number];

export const leadsRoutes = new Elysia({ prefix: "/api/leads" })
  .use(createJwt())
  .derive(resolveCurrentUser)
  .get("/", async ({ currentUser, query }) => {
    requireAuth({ currentUser });
    const queryBuilder = db.select({
      id: leads.id,
      nome: leads.nome,
      email: leads.email,
      telefone: leads.telefone,
      origem: leads.origem,
      etapa: leads.etapa,
      corretorResponsavelId: leads.corretorResponsavelId,
      corretorResponsavel: {
        id: users.id,
        nome: users.nome,
        email: users.email,
      },
      observacoes: leads.observacoes,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
    })
    .from(leads)
    .leftJoin(users, eq(leads.corretorResponsavelId, users.id));

    const conditions = [];
    if (query.etapa && leadEtapas.includes(query.etapa as LeadEtapa)) {
      conditions.push(eq(leads.etapa, query.etapa as LeadEtapa));
    }
    if (query.corretorId) {
      conditions.push(eq(leads.corretorResponsavelId, Number(query.corretorId)));
    }
    if (query.busca) {
      conditions.push(
        or(
          ilike(leads.nome, `%${query.busca}%`),
          ilike(leads.email, `%${query.busca}%`),
          ilike(leads.telefone, `%${query.busca}%`)
        )
      );
    }

    const result = await queryBuilder
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(leads.createdAt));

    return { success: true, data: result };
  }, {
    query: t.Optional(t.Object({
      etapa: t.Optional(t.String()),
      corretorId: t.Optional(t.String()),
      busca: t.Optional(t.String()),
    })),
    detail: {
      tags: ["Leads"],
      summary: "Listar leads com filtros",
    },
  })
  .get("/:id", async ({ currentUser, params, set }) => {
    requireAuth({ currentUser });
    const result = await db.select({
      id: leads.id,
      nome: leads.nome,
      email: leads.email,
      telefone: leads.telefone,
      origem: leads.origem,
      etapa: leads.etapa,
      corretorResponsavelId: leads.corretorResponsavelId,
      corretorResponsavel: {
        id: users.id,
        nome: users.nome,
        email: users.email,
      },
      observacoes: leads.observacoes,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
    })
    .from(leads)
    .leftJoin(users, eq(leads.corretorResponsavelId, users.id))
    .where(eq(leads.id, params.id))
    .limit(1);
    if (result.length === 0) {
      set.status = 404;
      return { success: false, message: "Lead nao encontrado" };
    }
    return { success: true, data: result[0] };
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    detail: {
      tags: ["Leads"],
      summary: "Obter lead por ID",
    },
  })
  .post("/", async ({ currentUser, body, set }) => {
    requireAuth({ currentUser });
    try {
      const [newLead] = await db.insert(leads).values({
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        origem: body.origem,
        etapa: body.etapa,
        corretorResponsavelId: body.corretorResponsavelId,
        observacoes: body.observacoes,
      }).returning();
      set.status = 201;
      return { success: true, data: newLead };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Erro interno do servidor" };
    }
  }, {
    body: t.Object({
      nome: t.String({ minLength: 2 }),
      email: t.Optional(t.String({ format: "email" })),
      telefone: t.String({ minLength: 8 }),
      origem: t.Optional(t.Union([t.Literal("site"), t.Literal("indicacao"), t.Literal("portal"), t.Literal("whatsapp"), t.Literal("outros")])),
      etapa: t.Optional(t.Union([t.Literal("novo"), t.Literal("em_atendimento"), t.Literal("visita_agendada"), t.Literal("proposta"), t.Literal("fechado"), t.Literal("perdido")])),
      corretorResponsavelId: t.Optional(t.Number()),
      observacoes: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Leads"],
      summary: "Criar lead",
    },
  })
  .put("/:id", async ({ currentUser, params, body, set }) => {
    requireAuth({ currentUser });
    const [updatedLead] = await db.update(leads).set({
      nome: body.nome,
      email: body.email,
      telefone: body.telefone,
      origem: body.origem,
      etapa: body.etapa,
      corretorResponsavelId: body.corretorResponsavelId,
      observacoes: body.observacoes,
      updatedAt: new Date(),
    }).where(eq(leads.id, params.id)).returning();
    if (!updatedLead) {
      set.status = 404;
      return { success: false, message: "Lead nao encontrado" };
    }
    return { success: true, data: updatedLead };
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    body: t.Object({
      nome: t.String({ minLength: 2 }),
      email: t.Optional(t.String({ format: "email" })),
      telefone: t.String({ minLength: 8 }),
      origem: t.Union([t.Literal("site"), t.Literal("indicacao"), t.Literal("portal"), t.Literal("whatsapp"), t.Literal("outros")]),
      etapa: t.Union([t.Literal("novo"), t.Literal("em_atendimento"), t.Literal("visita_agendada"), t.Literal("proposta"), t.Literal("fechado"), t.Literal("perdido")]),
      corretorResponsavelId: t.Optional(t.Number()),
      observacoes: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Leads"],
      summary: "Atualizar lead",
    },
  })
  .delete("/:id", async ({ currentUser, params, set }) => {
    requireAuth({ currentUser });
    const [deleted] = await db.delete(leads).where(eq(leads.id, params.id)).returning({ id: leads.id });
    if (!deleted) {
      set.status = 404;
      return { success: false, message: "Lead nao encontrado" };
    }
    return { success: true, message: "Lead excluido com sucesso" };
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    detail: {
      tags: ["Leads"],
      summary: "Excluir lead",
    },
  });
