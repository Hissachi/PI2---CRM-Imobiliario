import { db } from "./index.js";
import { users, leads, imoveis, visitas, interacoes } from "./schema.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(interacoes);
  await db.delete(visitas);
  await db.delete(leads);
  await db.delete(imoveis);
  await db.delete(users);

  // Create users
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const [admin] = await db.insert(users).values({
    nome: "Administrador",
    email: "admin@crmimobiliaria.com",
    senha: hashedPassword,
    role: "admin",
  }).returning();

  const hashedPassword2 = await bcrypt.hash("corretor123", 10);
  const [corretor] = await db.insert(users).values({
    nome: "João Corretor",
    email: "joao@crmimobiliaria.com",
    senha: hashedPassword2,
    role: "corretor",
  }).returning();

  // Create 10 leads
  const leadsData = [
    { nome: "Ana Silva", email: "ana@example.com", telefone: "11999990001", origem: "site" as const, etapa: "novo" as const },
    { nome: "Carlos Souza", email: "carlos@example.com", telefone: "11999990002", origem: "whatsapp" as const, etapa: "em_atendimento" as const, corretorResponsavelId: corretor.id },
    { nome: "Mariana Santos", email: "mariana@example.com", telefone: "11999990003", origem: "indicacao" as const, etapa: "visita_agendada" as const, corretorResponsavelId: corretor.id },
    { nome: "Pedro Costa", email: "pedro@example.com", telefone: "11999990004", origem: "portal" as const, etapa: "proposta" as const, corretorResponsavelId: corretor.id },
    { nome: "Julia Lima", email: "julia@example.com", telefone: "11999990005", origem: "site" as const, etapa: "fechado" as const, corretorResponsavelId: corretor.id },
    { nome: "Roberto Alves", email: "roberto@example.com", telefone: "11999990006", origem: "outros" as const, etapa: "perdido" as const },
    { nome: "Fernanda Rocha", email: "fernanda@example.com", telefone: "11999990007", origem: "whatsapp" as const, etapa: "novo" as const },
    { nome: "Lucas Martins", email: "lucas@example.com", telefone: "11999990008", origem: "site" as const, etapa: "em_atendimento" as const, corretorResponsavelId: corretor.id },
    { nome: "Patricia Oliveira", email: "patricia@example.com", telefone: "11999990009", origem: "indicacao" as const, etapa: "novo" as const },
    { nome: "Thiago Pereira", email: "thiago@example.com", telefone: "11999990010", origem: "portal" as const, etapa: "visita_agendada" as const, corretorResponsavelId: corretor.id },
  ];

  const insertedLeads = await db.insert(leads).values(leadsData).returning();

  // Create 5 imoveis
  const imoveisData = [
    { tipo: "casa" as const, finalidade: "venda" as const, titulo: "Casa 3 quartos - Jardim Paulista", descricao: "Casa ampla com 3 quartos, 2 banheiros, garagem", endereco: "Rua das Flores", numero: "100", bairro: "Jardim Paulista", cidade: "São Paulo", estado: "SP", cep: "01453000", area: 150, quartos: 3, banheiros: 2, vagas: 2, valor: "850000.00", status: "disponivel" as const, fotos: ["https://via.placeholder.com/400x300"] },
    { tipo: "apartamento" as const, finalidade: "venda" as const, titulo: "Apartamento 2 quartos - Centro", descricao: "Apartamento moderno no centro da cidade", endereco: "Av. Paulista", numero: "500", bairro: "Centro", cidade: "São Paulo", estado: "SP", cep: "01310000", area: 70, quartos: 2, banheiros: 1, vagas: 1, valor: "500000.00", status: "disponivel" as const, fotos: ["https://via.placeholder.com/400x300"] },
    { tipo: "apartamento" as const, finalidade: "locacao" as const, titulo: "Apartamento 1 quarto - Bela Vista", descricao: "Apartamento para locação, mobiliado", endereco: "Rua Bela Vista", numero: "200", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", cep: "01319000", area: 40, quartos: 1, banheiros: 1, vagas: 0, valor: "1800.00", status: "disponivel" as const, fotos: ["https://via.placeholder.com/400x300"] },
    { tipo: "terreno" as const, finalidade: "venda" as const, titulo: "Terreno 500m² - Zona Norte", descricao: "Terreno plano pronto para construção", endereco: "Rua do Campo", numero: "s/n", bairro: "Vila Nova", cidade: "São Paulo", estado: "SP", cep: "02345000", area: 500, quartos: 0, banheiros: 0, vagas: 0, valor: "400000.00", status: "reservado" as const, fotos: [] },
    { tipo: "comercial" as const, finalidade: "locacao" as const, titulo: "Sala Comercial - Centro", descricao: "Sala comercial com excelente localização", endereco: "Rua Direita", numero: "300", bairro: "Centro", cidade: "São Paulo", estado: "SP", cep: "01002000", area: 60, quartos: 0, banheiros: 1, vagas: 2, valor: "3500.00", status: "disponivel" as const, fotos: [] },
  ];

  const insertedImoveis = await db.insert(imoveis).values(imoveisData).returning();

  // Create 3 visitas
  const now = new Date();
  const visitasData = [
    { leadId: insertedLeads[2].id, imovelId: insertedImoveis[0].id, dataHora: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), status: "agendada" as const, observacoes: "Visita para conhecer a casa" },
    { leadId: insertedLeads[9].id, imovelId: insertedImoveis[1].id, dataHora: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), status: "agendada" as const, observacoes: "Interessado no apartamento" },
    { leadId: insertedLeads[2].id, imovelId: insertedImoveis[1].id, dataHora: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), status: "realizada" as const, observacoes: "Visita realizada com sucesso" },
  ];

  await db.insert(visitas).values(visitasData);

  // Create interactions
  await db.insert(interacoes).values([
    { leadId: insertedLeads[1].id, tipo: "ligacao", descricao: "Primeiro contato telefônico" },
    { leadId: insertedLeads[1].id, tipo: "whatsapp", descricao: "Envio de fotos dos imóveis" },
    { leadId: insertedLeads[2].id, tipo: "visita", descricao: "Agendamento de visita confirmado" },
  ]);

  console.log("Seed completed!");
  console.log("Users:", { admin: admin.email, corretor: corretor.email });
  console.log("Leads:", insertedLeads.length);
  console.log("Imoveis:", insertedImoveis.length);
  console.log("Visitas:", visitasData.length);
  console.log("Interações: 3");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
