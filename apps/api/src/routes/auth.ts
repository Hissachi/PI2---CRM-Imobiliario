import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET ?? "super-secret-key-change-in-production",
    })
  )
  .post("/login", async ({ body, jwt, set }) => {
    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);

    if (!user) {
      set.status = 401;
      return { success: false, message: "Credenciais inválidas" };
    }

    const passwordMatches = await bcrypt.compare(body.senha, user.senha);

    if (!passwordMatches) {
      set.status = 401;
      return { success: false, message: "Credenciais inválidas" };
    }

    const token = await jwt.sign({
      sub: String(user.id),
      nome: user.nome,
      email: user.email,
      role: user.role,
      exp: `${60 * 60 * 24 * 7}s`,
    });

    set.headers["set-cookie"] = [
      `jwt=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`,
    ];

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
        },
        token,
      },
    };
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      senha: t.String({ minLength: 1 }),
    }),
    detail: {
      tags: ["Auth"],
      summary: "Autenticar usuário",
      description: "Valida email e senha, retorna o usuário e um token JWT (também enviado como cookie httpOnly).",
    },
  })
  .post("/logout", ({ set }) => {
    set.headers["set-cookie"] = ["jwt=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"];
    return { success: true, message: "Sessão encerrada" };
  }, {
    detail: {
      tags: ["Auth"],
      summary: "Encerrar sessão",
      description: "Limpa o cookie JWT do cliente.",
    },
  })
  .get("/me", async ({ request, jwt, set }) => {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
      ?? parseCookie(request.headers.get("cookie"))?.jwt;

    if (!token) {
      set.status = 401;
      return { success: false, message: "Não autenticado" };
    }

    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { success: false, message: "Token inválido ou expirado" };
    }

    return {
      success: true,
      data: {
        id: Number(payload.sub),
        nome: payload.nome,
        email: payload.email,
        role: payload.role,
      },
    };
  }, {
    detail: {
      tags: ["Auth"],
      summary: "Dados do usuário autenticado",
      description: "Aceita o token via header Authorization: Bearer <token> ou via cookie jwt.",
    },
  });

function parseCookie(header: string | null): Record<string, string> | null {
  if (!header) return null;

  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const index = part.indexOf("=");
    if (index === -1) return acc;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}