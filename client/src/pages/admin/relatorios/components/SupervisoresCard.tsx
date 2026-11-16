import { useState, type FormEvent } from "react";
import { Check, MessageCircle, Pencil, Plus, Send, Trash2, X } from "lucide-react";
import type {
  ResultadoEnvioWhatsapp,
  Supervisor,
  SupervisorPayload,
} from "@/types/supervisor";
import { formatarTelefone, linkWhatsapp } from "@/lib/telefone";
import { Spinner } from "./Spinner";

interface SupervisoresCardProps {
  idfilial: number;
  nomeLoja: string;
  supervisores: Supervisor[];
  whatsappApi: boolean;
  podeEditar: boolean;
  ocupado: boolean;
  enviando: boolean;
  resultados: ResultadoEnvioWhatsapp[] | null;
  /** Texto já digitado ao abrir a conversa no WhatsApp */
  mensagemPara: (supervisor: Supervisor) => string;
  onSalvar: (dados: SupervisorPayload, id?: number) => Promise<void>;
  onExcluir: (id: number) => Promise<void>;
  onEnviar: () => void;
}

interface Formulario {
  id?: number;
  nome: string;
  whatsapp: string;
}

const campoClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100";

const botaoIcone =
  "rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100";

export function SupervisoresCard({
  idfilial,
  nomeLoja,
  supervisores,
  whatsappApi,
  podeEditar,
  ocupado,
  enviando,
  resultados,
  mensagemPara,
  onSalvar,
  onExcluir,
  onEnviar,
}: SupervisoresCardProps) {
  const [form, setForm] = useState<Formulario | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<number | null>(null);

  function abrirForm(supervisor?: Supervisor) {
    setErro(null);
    setConfirmandoExclusao(null);
    setForm(
      supervisor
        ? {
            id: supervisor.id,
            nome: supervisor.nome,
            whatsapp: formatarTelefone(supervisor.whatsapp),
          }
        : { nome: "", whatsapp: "" },
    );
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!form) return;

    setSalvando(true);
    setErro(null);
    try {
      await onSalvar({ idfilial, nome: form.nome, whatsapp: form.whatsapp }, form.id);
      setForm(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    setErro(null);
    try {
      await onExcluir(id);
      setConfirmandoExclusao(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível excluir.");
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Supervisores · {nomeLoja}
        </h2>
        {podeEditar && !form && (
          <button
            type="button"
            onClick={() => abrirForm()}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10"
          >
            <Plus size={14} aria-hidden="true" />
            Adicionar
          </button>
        )}
      </div>

      {supervisores.length === 0 && !form ? (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Nenhum supervisor cadastrado para esta filial.
          {podeEditar
            ? " Adicione o nome e o WhatsApp para enviar o relatório."
            : " Peça a um administrador para cadastrar."}
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-700">
          {supervisores.map((s) =>
            form?.id === s.id ? null : (
              <li key={s.id} className="flex items-center gap-2 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {s.nome}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatarTelefone(s.whatsapp)}
                  </p>
                </div>

                {confirmandoExclusao === s.id ? (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400">Excluir?</span>
                    <button
                      type="button"
                      onClick={() => excluir(s.id)}
                      className="rounded px-2 py-1 font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmandoExclusao(null)}
                      className="rounded px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <>
                    <a
                      href={linkWhatsapp(s.whatsapp, mensagemPara(s))}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir conversa no WhatsApp com a mensagem pronta"
                      aria-label={`Abrir conversa com ${s.nome} no WhatsApp`}
                      className="rounded-md p-1.5 text-green-600 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <MessageCircle size={16} aria-hidden="true" />
                    </a>
                    {podeEditar && (
                      <>
                        <button
                          type="button"
                          onClick={() => abrirForm(s)}
                          aria-label={`Editar ${s.nome}`}
                          className={botaoIcone}
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setForm(null);
                            setConfirmandoExclusao(s.id);
                          }}
                          aria-label={`Excluir ${s.nome}`}
                          className={botaoIcone}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </>
                )}
              </li>
            ),
          )}
        </ul>
      )}

      {form && (
        <form
          onSubmit={salvar}
          className="mt-3 space-y-2 rounded-lg border border-orange-200 bg-orange-50/50 p-3 dark:border-orange-900/50 dark:bg-orange-900/10"
        >
          <input
            type="text"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Nome do supervisor"
            aria-label="Nome do supervisor"
            maxLength={80}
            required
            autoFocus
            className={campoClass}
          />
          <input
            type="tel"
            inputMode="tel"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: formatarTelefone(e.target.value) })}
            placeholder="WhatsApp: (21) 99999-9999"
            aria-label="WhatsApp com DDD"
            required
            className={campoClass}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={salvando}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              {salvando ? <Spinner /> : <Check size={14} aria-hidden="true" />}
              Salvar
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(null);
                setErro(null);
              }}
              className="flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <X size={14} aria-hidden="true" />
              Cancelar
            </button>
          </div>
        </form>
      )}

      {erro && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{erro}</p>}

      <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-700">
        {whatsappApi ? (
          <>
            <button
              type="button"
              onClick={onEnviar}
              disabled={ocupado || supervisores.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {enviando ? <Spinner /> : <Send size={15} aria-hidden="true" />}
              {enviando ? "Enviando..." : "Enviar PDF pelo WhatsApp"}
            </button>

            {resultados && (
              <ul className="mt-3 space-y-1 text-xs" aria-live="polite">
                {resultados.map((r) => (
                  <li
                    key={r.id}
                    className={r.ok ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}
                  >
                    {r.ok ? `✓ Enviado para ${r.nome}` : `✗ ${r.nome}: ${r.erro ?? "falhou"}`}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Toque em{" "}
            <MessageCircle size={12} className="inline text-green-600" aria-label="WhatsApp" /> para
            abrir a conversa com a mensagem pronta e anexe o PDF baixado (no celular, use
            Compartilhar). O envio direto, sem abrir o WhatsApp, depende da API do WhatsApp
            configurada no servidor.
          </p>
        )}
      </div>
    </div>
  );
}
