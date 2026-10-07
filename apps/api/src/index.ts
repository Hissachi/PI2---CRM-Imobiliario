import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { usersRoutes } from "./routes/users.js";
import { authRoutes } from "./routes/auth.js";
import { leadsRoutes } from "./routes/leads.js";
import { imoveisRoutes } from "./routes/imoveis.js";
import { visitasRoutes } from "./routes/visitas.js";
import { interacoesRoutes } from "./routes/interacoes.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { HttpError } from "./plugins/auth.js";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.CORS_ORIGIN,
].filter((origin): origin is string => Boolean(origin));

const app = new Elysia()
  .use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "CRM Imobiliária API",
          description:
            "API REST para CRM imobiliário - Projeto Integrador II UNIVESP",
          version: "1.0.0",
          license: {
            name: "MIT",
          },
        },
        tags: [
          { name: "Auth", description: "Autenticação e sessão" },
          { name: "Users", description: "Gestão de usuários do sistema" },
          { name: "Leads", description: "Gestão de leads" },
          { name: "Imóveis", description: "Gestão de imóveis" },
          { name: "Visitas", description: "Agendamento e gestão de visitas" },
          {
            name: "Interações",
            description: "Histórico de interações com leads",
          },
          { name: "Dashboard", description: "Indicadores e agregações" },
        ],
      },
      path: "/swagger",
      excludeStaticFile: true,
    }))
  .get("/api", () => ({
    success: true,
    message: "CRM Imobiliária API - Projeto Integrador II",
    version: "1.0.0",
    documentation: "/swagger",
  }))
  .get("/api/health", () => ({
    success: true,
    message: "API disponível",
  }))
  .use(authRoutes)
  .use(usersRoutes)
  .use(leadsRoutes)
  .use(imoveisRoutes)
  .use(visitasRoutes)
  .use(interacoesRoutes)
  .use(dashboardRoutes)
  // Converte os guards (requireAuth/requireRole) na resposta JSON padrão da API.
  .onError(({ code, error, set }) => {
    if (error instanceof HttpError) {
      set.status = error.status;
      return { success: false, message: error.message };
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, message: "Rota não encontrada" };
    }
    console.error(error);
    set.status = 500;
    return { success: false, message: "Erro interno do servidor" };
  });

// No Vercel a app é exposta como Vercel Function via `export default`
// (`app.fetch`); `app.listen()` não é suportado lá. Localmente (Bun) o
// listen continua sendo o que sobe o servidor de desenvolvimento.
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT) || 3000;
  app.listen({ port });
  console.log(`CRM Imobiliaria API rodando em http://localhost:${port}`);
  console.log(`Documentacao Swagger em http://localhost:${port}/swagger`);
}

export default app;
