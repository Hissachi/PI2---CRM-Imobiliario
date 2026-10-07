import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "./schema.js";
import "dotenv/config";

/**
 * Cria (ou atualiza) o usuário admin inicial — o "bootstrap" do sistema.
 *
 * Por que existe: todas as rotas de `/api/users` exigem token de admin; sem um
 * admin no banco não há como criar o primeiro usuário pela API. Este script
 * roda direto no banco (uma vez, contra o banco hospedado) e resolve isso.
 *
 * Salvaguardas:
 * - exige ADMIN_EMAIL e ADMIN_PASSWORD no ambiente (sem senha default);
 * - NÃO é destrutivo: nunca apaga dados e não insere dados de demonstração;
 * - idempotente: faz upsert por e-mail (reexecutar só atualiza o admin);
 * - confirmação: sem `--yes` (ou CONFIRM=1) apenas mostra o alvo e sai (dry-run).
 *
 * Uso:
 *   DATABASE_URL="<pooler>" ADMIN_EMAIL="x@y.com" ADMIN_PASSWORD="..." \
 *     pnpm db:create-admin -- --yes
 */
async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const nome = process.env.ADMIN_NOME ?? "Administrador";
  const confirmado = process.argv.includes("--yes") || process.env.CONFIRM === "1";

  if (!databaseUrl) {
    console.error("DATABASE_URL não definida.");
    process.exit(1);
  }
  if (!email || !password) {
    console.error("Defina ADMIN_EMAIL e ADMIN_PASSWORD no ambiente.");
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("ADMIN_PASSWORD deve ter ao menos 6 caracteres.");
    process.exit(1);
  }

  console.log(`Banco alvo: ${maskDatabaseUrl(databaseUrl)}`);
  console.log(`Admin: ${nome} <${email}>`);

  if (!confirmado) {
    console.log("Dry-run: nada foi gravado. Rode novamente com --yes (ou CONFIRM=1) para aplicar.");
    return;
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const senha = await bcrypt.hash(password, 10);

    if (existing) {
      await db
        .update(users)
        .set({ nome, senha, role: "admin", updatedAt: new Date() })
        .where(eq(users.id, existing.id));
      console.log(`Admin atualizado (id ${existing.id}).`);
    } else {
      const [created] = await db
        .insert(users)
        .values({ nome, email, senha, role: "admin" })
        .returning({ id: users.id });
      console.log(`Admin criado (id ${created.id}).`);
    }

    console.log("Concluído. Faça login em /api/auth/login e crie os demais usuários pela tela /usuarios.");
  } finally {
    await pool.end();
  }
}

/** Mostra host e database da URL, ocultando usuário/senha. */
function maskDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return "<DATABASE_URL inválida>";
  }
}

main().catch((err) => {
  console.error("Falha ao criar admin:", err);
  process.exit(1);
});
