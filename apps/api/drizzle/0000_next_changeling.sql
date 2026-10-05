CREATE TYPE "public"."imovel_finality" AS ENUM('venda', 'locacao');--> statement-breakpoint
CREATE TYPE "public"."imovel_status" AS ENUM('disponivel', 'reservado', 'vendido', 'locado');--> statement-breakpoint
CREATE TYPE "public"."imovel_type" AS ENUM('casa', 'apartamento', 'terreno', 'comercial');--> statement-breakpoint
CREATE TYPE "public"."interacao_type" AS ENUM('ligacao', 'whatsapp', 'email', 'visita', 'proposta', 'outros');--> statement-breakpoint
CREATE TYPE "public"."lead_origin" AS ENUM('site', 'indicacao', 'portal', 'whatsapp', 'outros');--> statement-breakpoint
CREATE TYPE "public"."lead_step" AS ENUM('novo', 'em_atendimento', 'visita_agendada', 'proposta', 'fechado', 'perdido');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'corretor');--> statement-breakpoint
CREATE TYPE "public"."visita_status" AS ENUM('agendada', 'realizada', 'cancelada', 'reagendada');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "imoveis" (
	"id" serial PRIMARY KEY NOT NULL,
	"tipo" "imovel_type" NOT NULL,
	"finalidade" "imovel_finality" NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"descricao" text,
	"endereco" varchar(255) NOT NULL,
	"numero" varchar(50),
	"complemento" varchar(100),
	"bairro" varchar(100) NOT NULL,
	"cidade" varchar(100) NOT NULL,
	"estado" varchar(2) NOT NULL,
	"cep" varchar(20) NOT NULL,
	"area" integer,
	"quartos" integer DEFAULT 0,
	"banheiros" integer DEFAULT 0,
	"vagas" integer DEFAULT 0,
	"valor" numeric(12, 2) NOT NULL,
	"status" "imovel_status" DEFAULT 'disponivel' NOT NULL,
	"fotos" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interacoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"tipo" "interacao_type" NOT NULL,
	"descricao" text NOT NULL,
	"data_hora" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255) NOT NULL,
	"email" varchar(255),
	"telefone" varchar(50) NOT NULL,
	"origem" "lead_origin" DEFAULT 'outros' NOT NULL,
	"etapa" "lead_step" DEFAULT 'novo' NOT NULL,
	"corretor_responsavel_id" integer,
	"observacoes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"senha" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'corretor' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "visitas" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"imovel_id" integer NOT NULL,
	"data_hora" timestamp NOT NULL,
	"status" "visita_status" DEFAULT 'agendada' NOT NULL,
	"observacoes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interacoes" ADD CONSTRAINT "interacoes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_corretor_responsavel_id_users_id_fk" FOREIGN KEY ("corretor_responsavel_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "visitas" ADD CONSTRAINT "visitas_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "visitas" ADD CONSTRAINT "visitas_imovel_id_imoveis_id_fk" FOREIGN KEY ("imovel_id") REFERENCES "public"."imoveis"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
