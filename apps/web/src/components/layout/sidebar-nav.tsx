"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconImoveis,
  IconLeads,
  IconLogout,
  IconUsers,
  IconVisitas,
} from "@/components/icons";

export interface NavItem {
  href: string;
  label: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  /** Quando definido, o item só aparece para essa role. */
  role?: "admin";
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/leads", label: "Leads", icon: IconLeads },
  { href: "/imoveis", label: "Imóveis", icon: IconImoveis },
  { href: "/visitas", label: "Visitas", icon: IconVisitas },
  { href: "/usuarios", label: "Usuários", icon: IconUsers, role: "admin" },
];

export function SidebarNav({
  collapsed,
  role,
  onNavigate,
}: {
  collapsed: boolean;
  role?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => !item.role || item.role === role);

  return (
    <ul className="space-y-1">
      {visibleItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={[
                "group relative flex items-center rounded-lg text-sm font-medium transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-sky-50 text-sky-900"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
            >
              {/* Barra lateral de destaque no item ativo. */}
              <span
                aria-hidden="true"
                className={[
                  "absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-sky-700 transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />

              <Icon className="size-5 shrink-0" />

              {!collapsed && <span className="truncate">{item.label}</span>}

              {/* Rótulo flutuante quando colapsado — o title nativo não é
                  acessível o bastante e some rápido demais. */}
              {collapsed && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {item.label}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SidebarLogout({ collapsed, onLogout }: { collapsed: boolean; onLogout(): void }) {
  return (
    <button
      type="button"
      onClick={onLogout}
      title={collapsed ? "Sair" : undefined}
      className={[
        "group relative flex w-full items-center rounded-lg text-sm font-medium text-slate-700 transition-colors",
        "hover:bg-rose-50 hover:text-rose-800",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700",
        collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
      ].join(" ")}
    >
      <IconLogout className="size-5 shrink-0" />
      {!collapsed && <span>Sair</span>}

      {collapsed && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          Sair
        </span>
      )}
    </button>
  );
}