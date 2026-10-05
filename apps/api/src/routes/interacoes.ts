import { Elysia, t } from "elysia";
import { db } from "../db";
import { interacoes, leads } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const interacoesRoutes = new Elysia({ prefix: "/interacoes" })
  .get("/", async ({ query }) => {
    const queryBuilder = db.select({
      id: interacoes.id,
      leadId: interacoes.leadId,
      lead: {
        id: leads.id,
        nome: leads.nome,
      },
      tipo: interacoes.tipo,
      descricao: interacoes.descricao,
      dataHora: interacoes.dataHora,
      createdAt: interacoes.createdAt,
    })
    .from(interacoes)
    .leftJoin(leads, eq(interacoes.leadId, leads.id));

    const result = await queryBuilder
      .where(query.leadId ? eq(interacoes.leadId, Number(query.leadId)) : undefined)
      .orderBy(desc(interacoes.dataHora));

    return { success: true, data: result };
  }, {
    query: t.Optional(t.Object({
      leadId: t.Optional(t.String()),
    })),
    detail: {
      tags: ["Interações"],
      summary: "List all interações",
    },
  })
  .get("/:id", async ({ params, set }) => {
    const result = await db.select().from(interacoes).where(eq(interacoes.id, params.id)).limit(1);
    if (result.length === 0) {
      set.status = 404;
      return { success: false, message: "Interação not found" };
    }
    return { success: true, data: result[0] };
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    detail: {
      tags: ["Interações"],
      summary: "Get interação by ID",
    },
  })
  .post("/", async ({ body, set }) => {
    try {
      const [newInteracao] = await db.insert(interacoes).values({
        leadId: body.leadId,
        tipo: body.tipo,
        descricao: body.descricao,
        dataHora: body.dataHora ? new Date(body.dataHora) : undefined,
      }).returning();
      set.status = 201;
      return { success: true, data: newInteracao };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Erro interno do servidor" };
    }
  }, {
    body: t.Object({
      leadId: t.Number(),
      tipo: t.Union([t.Literal("ligacao"), t.Literal("whatsapp"), t.Literal("email"), t.Literal("visita"), t.Literal("proposta"), t.Literal("outros")]),
      descricao: t.String({ minLength: 1 }),
      dataHora: t.Optional(t.String({ format: "date-time" })),
    }),
    detail: {
      tags: ["Interações"],
      summary: "Create a new interação",
    },
  })
  .put("/:id", async ({ params, body, set }) => {
    const [updatedInteracao] = await db.update(interacoes).set({
      leadId: body.leadId,
      tipo: body.tipo,
      descricao: body.descricao,
      dataHora: body.dataHora ? new Date(body.dataHora) : undefined,
    }).where(eq(interacoes.id, params.id)).returning();
    if (!updatedInteracao) {
      set.status = 404;
      return { success: false, message: "Interação not found" };
    }
    return { success: true, data: updatedInteracao };
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    body: t.Object({
      leadId: t.Number(),
      tipo: t.Union([t.Literal("ligacao"), t.Literal("whatsapp"), t.Literal("email"), t.Literal("visita"), t.Literal("proposta"), t.Literal("outros")]),
      descricao: t.String({ minLength: 1 }),
      dataHora: t.Optional(t.String({ format: "date-time" })),
    }),
    detail: {
      tags: ["Interações"],
      summary: "Update interação",
    },
  })
  .delete("/:id", async ({ params, set }) => {
    const [deleted] = await db.delete(interacoes).where(eq(interacoes.id, params.id)).returning({ id: interacoes.id });
    if (!deleted) {
      set.status = 404;
      return { success: false, message: "Interação not found" };
    }
    return { success: true, message: "Interação deleted successfully" };
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    detail: {
      tags: ["Interações"],
      summary: "Delete interação",
    },
  });
