import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { usersRoutes } from "./routes/users";
import { authRoutes } from "./routes/auth";
import { leadsRoutes } from "./routes/leads";
import { imoveisRoutes } from "./routes/imoveis";
import { visitasRoutes } from "./routes/visitas";
import { interacoesRoutes } from "./routes/interacoes";
import { dashboardRoutes } from "./routes/dashboard";

const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: "CRM Imobiliária API",
        description: "API REST para CRM imobiliário - Projeto Integrador II UNIVESP",
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
        { name: "Interações", description: "Histórico de interações com leads" },
        { name: "Dashboard", description: "Indicadores e agregações" },
      ],
    },
    path: "/swagger",
    excludeStaticFile: true,
  }))
  .get("/", () => ({
    success: true,
    message: "CRM Imobiliária API - Projeto Integrador II",
    version: "1.0.0",
    documentation: "/swagger",
  }))
  .use(authRoutes)
  .use(usersRoutes)
  .use(leadsRoutes)
  .use(imoveisRoutes)
  .use(visitasRoutes)
  .use(interacoesRoutes)
  .use(dashboardRoutes)
  .listen({ port: Number(process.env.PORT) || 3000 });

const port = Number(process.env.PORT) || 3000;

console.log(`CRM Imobiliaria API rodando em http://localhost:${port}`);
console.log(`Documentacao Swagger em http://localhost:${port}/swagger`);
