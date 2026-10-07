import { Elysia, t } from "elysia";
import { db } from "../db/index.js";
import { imoveis } from "../db/schema.js";
import { eq, desc, and, gte, lte, ilike } from "drizzle-orm";
import { createJwt, resolveCurrentUser, requireAuth } from "../plugins/auth.js";

const imovelTipos = ["casa", "apartamento", "terreno", "comercial"] as const;
const imovelFinalidades = ["venda", "locacao"] as const;
const imovelStatusList = ["disponivel", "reservado", "vendido", "locado"] as const;

type ImovelTipo = (typeof imovelTipos)[number];
type ImovelFinalidade = (typeof imovelFinalidades)[number];
type ImovelStatus = (typeof imovelStatusList)[number];

export const imoveisRoutes = new Elysia({ prefix: "/api/imoveis" })
  .use(createJwt())
  .derive(resolveCurrentUser)
  .get("/", async ({ currentUser, query }) => {
    requireAuth({ currentUser });
    const queryBuilder = db.select().from(imoveis);

    const conditions = [];
    if (query.tipo && imovelTipos.includes(query.tipo as ImovelTipo)) {
      conditions.push(eq(imoveis.tipo, query.tipo as ImovelTipo));
    }
    if (query.finalidade && imovelFinalidades.includes(query.finalidade as ImovelFinalidade)) {
      conditions.push(eq(imoveis.finalidade, query.finalidade as ImovelFinalidade));
    }
    if (query.status && imovelStatusList.includes(query.status as ImovelStatus)) {
      conditions.push(eq(imoveis.status, query.status as ImovelStatus));
    }
    if (query.valorMin) {
      conditions.push(gte(imoveis.valor, query.valorMin));
    }
    if (query.valorMax) {
      conditions.push(lte(imoveis.valor, query.valorMax));
    }
    if (query.busca) {
      conditions.push(ilike(imoveis.titulo, `%${query.busca}%`));
    }

    const result = await queryBuilder
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(imoveis.createdAt));

    return { success: true, data: result };
  }, {
    query: t.Optional(t.Object({
      tipo: t.Optional(t.String()),
      finalidade: t.Optional(t.String()),
      status: t.Optional(t.String()),
      valorMin: t.Optional(t.String()),
      valorMax: t.Optional(t.String()),
      busca: t.Optional(t.String()),
    })),
    detail: {
      tags: ["Imóveis"],
      summary: "List all imóveis with filters",
    },
  })
  .get("/:id", async ({ currentUser, params, set }) => {
    requireAuth({ currentUser });
    const result = await db.select().from(imoveis).where(eq(imoveis.id, params.id)).limit(1);
    if (result.length === 0) {
      set.status = 404;
      return { success: false, message: "Imóvel not found" };
    }
    return { success: true, data: result[0] };
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    detail: {
      tags: ["Imóveis"],
      summary: "Get imóvel by ID",
    },
  })
  .post("/", async ({ currentUser, body, set }) => {
    requireAuth({ currentUser });
    try {
      const [newImovel] = await db.insert(imoveis).values({
        tipo: body.tipo,
        finalidade: body.finalidade,
        titulo: body.titulo,
        descricao: body.descricao,
        endereco: body.endereco,
        numero: body.numero,
        complemento: body.complemento,
        bairro: body.bairro,
        cidade: body.cidade,
        estado: body.estado,
        cep: body.cep,
        area: body.area,
        quartos: body.quartos,
        banheiros: body.banheiros,
        vagas: body.vagas,
        valor: body.valor,
        status: body.status,
        fotos: body.fotos,
      }).returning();
      set.status = 201;
      return { success: true, data: newImovel };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Erro interno do servidor" };
    }
  }, {
    body: t.Object({
      tipo: t.Union([t.Literal("casa"), t.Literal("apartamento"), t.Literal("terreno"), t.Literal("comercial")]),
      finalidade: t.Union([t.Literal("venda"), t.Literal("locacao")]),
      titulo: t.String({ minLength: 3 }),
      descricao: t.Optional(t.String()),
      endereco: t.String({ minLength: 2 }),
      numero: t.Optional(t.String()),
      complemento: t.Optional(t.String()),
      bairro: t.String({ minLength: 2 }),
      cidade: t.String({ minLength: 2 }),
      estado: t.String({ minLength: 2, maxLength: 2 }),
      cep: t.String({ minLength: 8 }),
      area: t.Optional(t.Number({ minimum: 0 })),
      quartos: t.Optional(t.Number({ minimum: 0 })),
      banheiros: t.Optional(t.Number({ minimum: 0 })),
      vagas: t.Optional(t.Number({ minimum: 0 })),
      valor: t.String(),
      status: t.Optional(t.Union([t.Literal("disponivel"), t.Literal("reservado"), t.Literal("vendido"), t.Literal("locado")])),
      fotos: t.Optional(t.Array(t.String())),
    }),
    detail: {
      tags: ["Imóveis"],
      summary: "Create a new imóvel",
    },
  })
  .put("/:id", async ({ currentUser, params, body, set }) => {
    requireAuth({ currentUser });
    const [updatedImovel] = await db.update(imoveis).set({
      tipo: body.tipo,
      finalidade: body.finalidade,
      titulo: body.titulo,
      descricao: body.descricao,
      endereco: body.endereco,
      numero: body.numero,
      complemento: body.complemento,
      bairro: body.bairro,
      cidade: body.cidade,
      estado: body.estado,
      cep: body.cep,
      area: body.area,
      quartos: body.quartos,
      banheiros: body.banheiros,
      vagas: body.vagas,
      valor: body.valor,
      status: body.status,
      fotos: body.fotos,
      updatedAt: new Date(),
    }).where(eq(imoveis.id, params.id)).returning();
    if (!updatedImovel) {
      set.status = 404;
      return { success: false, message: "Imóvel not found" };
    }
    return { success: true, data: updatedImovel };
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    body: t.Object({
      tipo: t.Union([t.Literal("casa"), t.Literal("apartamento"), t.Literal("terreno"), t.Literal("comercial")]),
      finalidade: t.Union([t.Literal("venda"), t.Literal("locacao")]),
      titulo: t.String({ minLength: 3 }),
      descricao: t.Optional(t.String()),
      endereco: t.String({ minLength: 2 }),
      numero: t.Optional(t.String()),
      complemento: t.Optional(t.String()),
      bairro: t.String({ minLength: 2 }),
      cidade: t.String({ minLength: 2 }),
      estado: t.String({ minLength: 2, maxLength: 2 }),
      cep: t.String({ minLength: 8 }),
      area: t.Optional(t.Number({ minimum: 0 })),
      quartos: t.Optional(t.Number({ minimum: 0 })),
      banheiros: t.Optional(t.Number({ minimum: 0 })),
      vagas: t.Optional(t.Number({ minimum: 0 })),
      valor: t.String(),
      status: t.Union([t.Literal("disponivel"), t.Literal("reservado"), t.Literal("vendido"), t.Literal("locado")]),
      fotos: t.Optional(t.Array(t.String())),
    }),
    detail: {
      tags: ["Imóveis"],
      summary: "Update imóvel",
    },
  })
  .delete("/:id", async ({ currentUser, params, set }) => {
    requireAuth({ currentUser });
    const [deleted] = await db.delete(imoveis).where(eq(imoveis.id, params.id)).returning({ id: imoveis.id });
    if (!deleted) {
      set.status = 404;
      return { success: false, message: "Imóvel not found" };
    }
    return { success: true, message: "Imóvel deleted successfully" };
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    detail: {
      tags: ["Imóveis"],
      summary: "Delete imóvel",
    },
  });
