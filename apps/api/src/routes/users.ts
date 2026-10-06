import { Elysia, t } from "elysia";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createJwt, resolveCurrentUser, requireRole } from "../plugins/auth";

/**
 * CRUD de usuários, restrito a admins.
 *
 * `requireRole("admin")` é chamado em todos os handlers: a autorização é
 * verificada na API, independentemente do que o frontend faça. O middleware do
 * frontend esconde o menu, mas não é a fronteira de segurança.
 */
export const usersRoutes = new Elysia({ prefix: "/users" })
  .use(createJwt())
  .derive(resolveCurrentUser)
  .get("/", async ({ currentUser }) => {
    requireRole({ currentUser }, "admin");

    const result = await db.select({
      id: users.id,
      nome: users.nome,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users);
    return { success: true, data: result };
  }, {
    detail: {
      tags: ["Users"],
      summary: "Listar todos os usuarios",
    },
  })
  .get("/:id", async ({ currentUser, params, set }) => {
    requireRole({ currentUser }, "admin");

    const result = await db.select({
      id: users.id,
      nome: users.nome,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(eq(users.id, params.id)).limit(1);
    if (result.length === 0) {
      set.status = 404;
      return { success: false, message: "Usuario nao encontrado" };
    }
    return { success: true, data: result[0] };
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    detail: {
      tags: ["Users"],
      summary: "Obter usuario por ID",
    },
  })
  .post("/", async ({ currentUser, body, set }) => {
    requireRole({ currentUser }, "admin");

    try {
      const hashedPassword = await bcrypt.hash(body.senha, 10);
      const [newUser] = await db.insert(users).values({
        nome: body.nome,
        email: body.email,
        senha: hashedPassword,
        role: body.role,
      }).returning({
        id: users.id,
        nome: users.nome,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });
      set.status = 201;
      return { success: true, data: newUser };
    } catch (error: any) {
      if (error.code === "23505") {
        set.status = 409;
        return { success: false, message: "E-mail ja cadastrado" };
      }
      set.status = 500;
      return { success: false, message: "Erro interno do servidor" };
    }
  }, {
    body: t.Object({
      nome: t.String({ minLength: 2 }),
      email: t.String({ format: "email" }),
      senha: t.String({ minLength: 6 }),
      role: t.Optional(t.Union([t.Literal("admin"), t.Literal("corretor")])),
    }),
    detail: {
      tags: ["Users"],
      summary: "Criar usuario",
    },
  })
  .put("/:id", async ({ currentUser, params, body, set }) => {
    requireRole({ currentUser }, "admin");

    try {
      const updateData: any = {
        nome: body.nome,
        email: body.email,
        role: body.role,
        updatedAt: new Date(),
      };
      if (body.senha) {
        updateData.senha = await bcrypt.hash(body.senha, 10);
      }
      const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, params.id)).returning({
        id: users.id,
        nome: users.nome,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });
      if (!updatedUser) {
        set.status = 404;
        return { success: false, message: "Usuario nao encontrado" };
      }
      return { success: true, data: updatedUser };
    } catch (error: any) {
      if (error.code === "23505") {
        set.status = 409;
        return { success: false, message: "E-mail ja cadastrado" };
      }
      set.status = 500;
      return { success: false, message: "Erro interno do servidor" };
    }
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    body: t.Object({
      nome: t.String({ minLength: 2 }),
      email: t.String({ format: "email" }),
      senha: t.Optional(t.String({ minLength: 6 })),
      role: t.Union([t.Literal("admin"), t.Literal("corretor")]),
    }),
    detail: {
      tags: ["Users"],
      summary: "Atualizar usuario",
    },
  })
  .delete("/:id", async ({ currentUser, params, set }) => {
    requireRole({ currentUser }, "admin");

    const [deleted] = await db.delete(users).where(eq(users.id, params.id)).returning({ id: users.id });
    if (!deleted) {
      set.status = 404;
      return { success: false, message: "Usuario nao encontrado" };
    }
    return { success: true, message: "Usuario excluido com sucesso" };
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    detail: {
      tags: ["Users"],
      summary: "Excluir usuario",
    },
  });
