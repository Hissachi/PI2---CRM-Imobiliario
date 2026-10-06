"use client";

import { useEffect, useRef, useState } from "react";
import { IconAlert } from "@/components/icons";

/**
 * Diálogo de sessão exigida.
 *
 * Aparece quando o usuário tenta acessar uma área privada sem token válido.
 * Só redireciona para /login depois de o usuário confirmar em "OK", conforme
 * requisito — assim a mensagem é lida antes de perder a página.
 *
 * Implementado como <dialog> nativo para ter foco preso, Esc para fechar e
 * semântica correta de modal, sem depender de biblioteca.
 */
export function SessionRequiredDialog({
  open,
  reason,
  onConfirm,
}: {
  open: boolean;
  /** "missing" = nunca logado; "invalid" = token expirado/revogado. */
  reason: "missing" | "invalid";
  onConfirm(): void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const description =
    reason === "missing"
      ? "Você precisa estar logado para acessar esta página."
      : "Sua sessão expirou ou é inválida. Faça login novamente.";

  return (
    <dialog
      ref={ref}
      // `cancel` (Esc) é tratado como confirmação: fechar sem decidir deixa a
      // página travada, então tratar igual mantém apenas um caminho de saída.
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onClose={() => {
        if (open && !dismissed) handleClose();
      }}
      aria-labelledby="session-required-title"
      aria-describedby="session-required-description"
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-slate-500 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
    >
      <div className="flex gap-4 p-6">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800"
        >
          <IconAlert className="size-6" />
        </span>

        <div className="space-y-2">
          <h2 id="session-required-title" className="text-lg font-semibold text-slate-900">
            Login necessário
          </h2>
          <p id="session-required-description" className="text-sm text-slate-700">
            {description}
          </p>
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-500 bg-slate-50 px-6 py-4">
        <button
          type="button"
          onClick={handleClose}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          OK
        </button>
      </div>
    </dialog>
  );

  function handleClose() {
    setDismissed(true);
    onConfirm();
  }
}