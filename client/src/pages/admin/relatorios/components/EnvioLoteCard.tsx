import { Send } from "lucide-react";
import type { ResultadoEnvioWhatsapp } from "@/types/supervisor";
import { Spinner } from "./Spinner";

export interface ResultadoLote {
  idfilial: number;
  nomeLoja: string;
  resultados?: ResultadoEnvioWhatsapp[];
  erro?: string;
}

interface EnvioLoteCardProps {
  periodoTexto: string;
  filiais: { idfilial: number; nomeLoja: string; supervisores: number }[];
  ocupado: boolean;
  progresso: string | null;
  resultados: ResultadoLote[] | null;
  onEnviar: () => void;
}

export function EnvioLoteCard({
  periodoTexto,
  filiais,
  ocupado,
  progresso,
  resultados,
  onEnviar,
}: EnvioLoteCardProps) {
  const comSupervisor = filiais.filter((f) => f.supervisores > 0);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
        Enviar todas as filiais
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Cada supervisor recebe o PDF da própria filial ({periodoTexto}).
      </p>

      <ul className="mt-3 space-y-1 text-xs">
        {filiais.map((f) => (
          <li key={f.idfilial} className="flex justify-between gap-2">
            <span className="text-zinc-700 dark:text-zinc-200">{f.nomeLoja}</span>
            <span className={f.supervisores ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-400 dark:text-zinc-500"}>
              {f.supervisores === 0
                ? "sem supervisor"
                : `${f.supervisores} supervisor${f.supervisores > 1 ? "es" : ""}`}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onEnviar}
        disabled={ocupado || comSupervisor.length === 0}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-green-600 px-3 py-2 text-sm font-semibold text-green-700 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-green-400 dark:hover:bg-green-900/20"
      >
        {progresso ? <Spinner /> : <Send size={15} aria-hidden="true" />}
        {progresso ?? `Enviar para ${comSupervisor.length} filia${comSupervisor.length === 1 ? "l" : "is"}`}
      </button>

      {resultados && (
        <ul className="mt-3 space-y-1.5 text-xs" aria-live="polite">
          {resultados.map((r) => {
            const falhas = r.resultados?.filter((x) => !x.ok) ?? [];
            const ok = !r.erro && falhas.length === 0;
            return (
              <li key={r.idfilial} className={ok ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {ok ? "✓" : "✗"} {r.nomeLoja}
                {r.erro
                  ? `: ${r.erro}`
                  : falhas.length > 0
                    ? `: falhou para ${falhas.map((f) => `${f.nome} (${f.erro ?? "erro"})`).join(", ")}`
                    : ` (${r.resultados?.length ?? 0} enviado${(r.resultados?.length ?? 0) > 1 ? "s" : ""})`}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
