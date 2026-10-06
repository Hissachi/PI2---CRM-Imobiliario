/**
 * Auditoria de contraste WCAG AA.
 *
 * Roda com: node scripts/contrast-check.mjs
 *
 * Calcula a razão de contraste para cada combinação texto/fundo usada na
 * aplicação e falha (exit 1) se alguma ficar abaixo do mínimo da WCAG:
 *  - 4.5:1 para texto normal (< 18.66px bold / 24px regular)
 *  - 3.0:1 para texto grande e para bordas/ícones (componentes não文本)
 *
 * A lista abaixo é a fonte da verdade: ao adicionar cor em um componente,
 * inclua a combinação aqui para que a regressão seja detectada.
 */

const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

/** Cores do Tailwind v4 (slate/rose/sky/amber) usadas no projeto. */
const PALETTE = {
  white: "#ffffff",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1e293b",
  slate900: "#0f172a",
  sky50: "#f0f9ff",
  sky100: "#e0f2fe",
  sky700: "#0369a1",
  sky800: "#075985",
  sky900: "#0c4a6e",
  rose50: "#fff1f2",
  rose100: "#ffe4e6",
  rose500: "#f43f5e",
  rose700: "#be123c",
  rose800: "#9f1239",
  rose900: "#881337",
  amber100: "#fef3c7",
  amber700: "#b45309",
  amber800: "#92400e",
  amber900: "#78350f",
  emerald100: "#d1fae5",
  emerald700: "#047857",
  emerald800: "#065f46",
  violet100: "#ede9fe",
  violet700: "#6d28d9",
  violet900: "#4c1d95",
  orange100: "#ffedd5",
  orange700: "#c2410c",
  orange800: "#9a3412",
};

/** [descrição, cor do texto, cor do fundo, mínimo esperado] */
const CHECKS = [
  // Corpo do texto
  ["body texto sobre fundo da pagina", "slate900", "slate100", AA_NORMAL],
  ["body texto sobre card branco", "slate900", "white", AA_NORMAL],
  ["texto secundario sobre card branco", "slate500", "white", AA_NORMAL],
["texto secundario sobre fundo da pagina", "slate600", "slate100", AA_NORMAL],
  ["texto secundario sobre card branco", "slate500", "white", AA_NORMAL],
  ["texto de tabela sobre card", "slate600", "white", AA_NORMAL],
  ["cabecalho de tabela (uppercase, 12px)", "slate700", "slate50", AA_NORMAL],

  // Navegacao
  ["item de menu inativo", "slate700", "white", AA_NORMAL],
  ["item de menu hover", "slate900", "slate100", AA_NORMAL],
  ["item de menu ativo", "sky900", "sky50", AA_NORMAL],
  ["marca da sidebar", "white", "slate900", AA_NORMAL],
  ["subtitulo da sidebar", "slate600", "white", AA_NORMAL],

  // Topo
  ["nome do usuario", "slate900", "white", AA_NORMAL],
  ["role do usuario", "slate600", "white", AA_NORMAL],
  ["avatar", "white", "slate900", AA_NORMAL],
  ["botao Sair", "slate800", "white", AA_NORMAL],
  ["botao Sair hover", "slate900", "slate100", AA_NORMAL],

  // Botoes
  ["botao primario", "white", "slate900", AA_NORMAL],
  ["botao primario hover", "white", "slate700", AA_NORMAL],
  ["botao perigo na sidebar", "rose800", "white", AA_NORMAL],
  ["botao perigo hover", "rose800", "rose50", AA_NORMAL],

  // Login
  ["rotulo de campo", "slate800", "white", AA_NORMAL],
  ["placeholder de campo", "slate600", "white", AA_NORMAL],
  ["texto do subtitulo", "slate700", "slate100", AA_NORMAL],
  ["link do subtitulo sobre cinza", "slate700", "slate100", AA_NORMAL],
  ["alternador de senha (icone)", "slate600", "white", AA_LARGE],

  // Mensagens
  ["erro de login", "rose900", "rose50", AA_NORMAL],
  ["estado vazio", "slate600", "white", AA_NORMAL],
  ["erro de API", "rose900", "rose50", AA_NORMAL],
  ["alerta de sessao (icone)", "amber800", "amber100", AA_LARGE],
  ["alerta de sessao (titulo)", "slate900", "white", AA_NORMAL],
  ["alerta de sessao (texto)", "slate700", "white", AA_NORMAL],

  // Badges de status
  ["badge novo", "sky800", "sky100", AA_NORMAL],
  ["badge em atendimento", "amber800", "amber100", AA_NORMAL],
  ["badge visita agendada", "violet900", "violet100", AA_NORMAL],
  ["badge proposta", "orange800", "orange100", AA_NORMAL],
  ["badge fechado", "emerald800", "emerald100", AA_NORMAL],
  ["badge perdido", "slate700", "slate200", AA_NORMAL],
  ["badge vendido", "sky800", "sky100", AA_NORMAL],
  ["badge admin", "sky900", "sky100", AA_NORMAL],
  ["badge corretor", "slate800", "slate200", AA_NORMAL],

  // Borders / 404
  ["404 numero", "slate900", "slate100", AA_LARGE],
  ["404 texto", "slate700", "slate100", AA_NORMAL],
  ["foco visivel (outline)", "sky700", "white", AA_LARGE],
  ["borda de card", "slate500", "white", AA_LARGE],
  ["borda de tabela", "slate500", "white", AA_LARGE],
  ["borda de input", "slate500", "white", AA_LARGE],
  ["borda de erro", "rose700", "rose50", AA_LARGE],
  ["divisor da sidebar", "slate500", "white", AA_LARGE],
  ["overlay do drawer", "slate900", "slate100", AA_LARGE],
];

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value.split("").map((c) => c + c).join("")
      : value;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Luminância relativa (WCAG 2.x). */
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const channel = (value) => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}

let failures = 0;
const rows = [];

for (const [label, fg, bg, min] of CHECKS) {
  const ratio = contrast(PALETTE[fg], PALETTE[bg]);
  const ok = ratio >= min;
  if (!ok) failures++;
  rows.push({
    estado: ok ? "OK  " : "FALHA",
    combinacao: `${fg} sobre ${bg}`,
    razao: `${ratio.toFixed(2)}:1`,
    minimo: `${min}:1`,
    descricao: label,
  });
}

const width = Math.max(...rows.map((r) => r.combinacao.length));
console.log(
  ["ESTADO", "COMBINACAO".padEnd(width), "RAZAO", "MINIMO", "DESCRICAO"].join("  "),
);
console.log("-".repeat(100));
for (const row of rows) {
  console.log(
    `${row.estado}  ${row.combinacao.padEnd(width)}  ${row.razao.padStart(7)}  ${row.minimo.padStart(7)}  ${row.descricao}`,
  );
}

console.log();
console.log(`${rows.length} combinacoes verificadas, ${failures} abaixo do minimo.`);

if (failures > 0) {
  console.log("\nCorrija as cores ou ajuste o minimo esperado se o uso for decorativo.");
  process.exit(1);
}