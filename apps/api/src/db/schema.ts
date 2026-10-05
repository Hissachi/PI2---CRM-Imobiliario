import { pgTable, serial, varchar, text, integer, decimal, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "corretor"]);

export const leadOriginEnum = pgEnum("lead_origin", ["site", "indicacao", "portal", "whatsapp", "outros"]);

export const leadStepEnum = pgEnum("lead_step", [
  "novo",
  "em_atendimento",
  "visita_agendada",
  "proposta",
  "fechado",
  "perdido",
]);

export const imovelTypeEnum = pgEnum("imovel_type", ["casa", "apartamento", "terreno", "comercial"]);

export const imovelFinalityEnum = pgEnum("imovel_finality", ["venda", "locacao"]);

export const imovelStatusEnum = pgEnum("imovel_status", ["disponivel", "reservado", "vendido", "locado"]);

export const visitaStatusEnum = pgEnum("visita_status", ["agendada", "realizada", "cancelada", "reagendada"]);

export const interacaoTypeEnum = pgEnum("interacao_type", ["ligacao", "whatsapp", "email", "visita", "proposta", "outros"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  senha: varchar("senha", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("corretor"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  telefone: varchar("telefone", { length: 50 }).notNull(),
  origem: leadOriginEnum("origem").notNull().default("outros"),
  etapa: leadStepEnum("etapa").notNull().default("novo"),
  corretorResponsavelId: integer("corretor_responsavel_id").references(() => users.id),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const imoveis = pgTable("imoveis", {
  id: serial("id").primaryKey(),
  tipo: imovelTypeEnum("tipo").notNull(),
  finalidade: imovelFinalityEnum("finalidade").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  endereco: varchar("endereco", { length: 255 }).notNull(),
  numero: varchar("numero", { length: 50 }),
  complemento: varchar("complemento", { length: 100 }),
  bairro: varchar("bairro", { length: 100 }).notNull(),
  cidade: varchar("cidade", { length: 100 }).notNull(),
  estado: varchar("estado", { length: 2 }).notNull(),
  cep: varchar("cep", { length: 20 }).notNull(),
  area: integer("area"),
  quartos: integer("quartos").default(0),
  banheiros: integer("banheiros").default(0),
  vagas: integer("vagas").default(0),
  valor: decimal("valor", { precision: 12, scale: 2 }).notNull(),
  status: imovelStatusEnum("status").notNull().default("disponivel"),
  fotos: text("fotos").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const visitas = pgTable("visitas", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  imovelId: integer("imovel_id").notNull().references(() => imoveis.id, { onDelete: "cascade" }),
  dataHora: timestamp("data_hora").notNull(),
  status: visitaStatusEnum("status").notNull().default("agendada"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const interacoes = pgTable("interacoes", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  tipo: interacaoTypeEnum("tipo").notNull(),
  descricao: text("descricao").notNull(),
  dataHora: timestamp("data_hora").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
