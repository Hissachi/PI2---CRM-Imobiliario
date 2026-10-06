"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { IconChevronLeft, IconMenu } from "@/components/icons";
import { SidebarLogout, SidebarNav } from "@/components/layout/sidebar-nav";

/**
 * Layout da aplicação: sidebar + topo + área de conteúdo.
 *
 * Comportamento por largura:
 *  - >= 1024px: sidebar fixa e colapsável entre 240px (expandida) e 72px
 *    (colapsada, apenas ícones com tooltip);
 *  - < 1024px: a sidebar vira drawer off-canvas, fechado por padrão e aberto
 *    pelo botão de menu do topo (overlay + Esc para fechar).
 *
 * A preferência de colapso fica no localStorage e sobrevive a recargas.
 */

const STORAGE_KEY = "crm:sidebar-collapsed";
const DESKTOP_QUERY = "(min-width: 1024px)";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lê a preferência salva após a montar, para não divergir do HTML do servidor.
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      // localStorage indisponível (navegador privado): segue expandida.
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Falha de persistência não impede o toggle em memória.
      }
      return next;
    });
  }, []);

  // Esc fecha o drawer; trava o scroll do fundo enquanto estiver aberto.
  useEffect(() => {
    if (!drawerOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Ao voltar para desktop, garante que o drawer não fique preso aberto.
  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) setDrawerOpen(false);
    }

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-full">
      {/* Drawer no mobile: overlay + painel, ambos fora do fluxo normal. */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 h-full w-full bg-slate-900/50"
          />
          <div className="relative h-full w-72 max-w-[85vw] shadow-xl">
            <Sidebar
              collapsed={false}
              role={user?.role}
              onLogout={handleLogout}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Sidebar fixa no desktop. */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">
        <Sidebar
          collapsed={collapsed}
          role={user?.role}
          onLogout={handleLogout}
          onToggle={toggleCollapsed}
        />
      </div>

      <div className={collapsed ? "lg:pl-[72px]" : "lg:pl-60"}>
        <Topbar
          collapsed={collapsed}
          userName={user?.nome}
          userRole={user?.role}
          onLogout={handleLogout}
          onOpenDrawer={() => setDrawerOpen(true)}
          onToggleCollapsed={toggleCollapsed}
        />

        <main id="conteudo" className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white"
      >
        CR
      </span>
      {!collapsed && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900">CRM Imobiliária</span>
          <span className="block truncate text-xs text-slate-600">UNIVESP</span>
        </span>
      )}
    </div>
  );
}

function Sidebar({
  collapsed,
  role,
  onLogout,
  onNavigate,
  onToggle,
}: {
  collapsed: boolean;
  role?: string;
  onLogout(): void;
  onNavigate?(): void;
  onToggle?(): void;
}) {
  return (
    <aside
      aria-label="Navegação principal"
      className={[
        "flex h-full flex-col border-r border-slate-500 bg-white",
        onToggle ? "w-60 transition-[width] duration-200" : "w-full",
        onToggle && collapsed ? "w-[72px]" : "",
      ].join(" ")}
    >
      <div className="flex h-16 shrink-0 items-center border-b border-slate-500 px-3">
        <Brand collapsed={collapsed} />
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <SidebarNav collapsed={collapsed} role={role} onNavigate={onNavigate} />
      </nav>

      {/* Itens utilitários no rodapé, separados por divisor. */}
      <div className="shrink-0 border-t border-slate-500 p-3">
        <SidebarLogout collapsed={collapsed} onLogout={onLogout} />
      </div>
    </aside>
  );
}

function Topbar({
  collapsed,
  userName,
  userRole,
  onLogout,
  onOpenDrawer,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  userName?: string;
  userRole?: "admin" | "corretor";
  onLogout(): void;
  onOpenDrawer(): void;
  onToggleCollapsed(): void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-500 bg-white px-4 sm:px-6 lg:px-8">
      {/* < 1024px: abre o drawer. */}
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Abrir menu de navegação"
        className="rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 lg:hidden"
      >
        <IconMenu className="size-6" />
      </button>

      {/* >= 1024px: colapsa/expande a sidebar fixa. */}
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? "Expandir menu lateral" : "Colapsar menu lateral"}
        aria-expanded={!collapsed}
        className="hidden rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 lg:block"
      >
        <IconChevronLeft
          className={`size-5 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
        />
      </button>

      <div className="ml-auto flex items-center gap-3">
        {userName && (
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">{userName}</p>
            <p className="text-xs text-slate-600">{userRole === "admin" ? "Administrador" : "Corretor"}</p>
          </div>
        )}

        {userName && (
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white"
          >
            {initials(userName)}
          </span>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="rounded-md border border-slate-500 px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          Sair
        </button>
      </div>
    </header>
  );
}

function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}