import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileChartColumn,
  FileText,
  Image as ImageIcon,
  Moon,
  Share2,
  Sun,
} from "lucide-react";
import { Sidebar } from "./dashboard/components/Sidebar";
import { Footer } from "./dashboard/components/Footer";
import { ErroCarregamento } from "./dashboard/components/ErroCarregamento";
import { RelatorioFilial } from "./relatorios/components/RelatorioFilial";
import { PreviaDocumento } from "./relatorios/components/PreviaDocumento";
import { SupervisoresCard } from "./relatorios/components/SupervisoresCard";
import { EnvioLoteCard, type ResultadoLote } from "./relatorios/components/EnvioLoteCard";
import { ConfirmarEnvioModal } from "./relatorios/components/ConfirmarEnvioModal";
import { Spinner } from "./relatorios/components/Spinner";
import {
  contemDia,
  descreverPeriodo,
  deslocarPeriodo,
  diaEmSaoPaulo,
  hojeEmSaoPaulo,
  nomeArquivo,
  periodoPadrao,
  tituloPeriodo,
  type Periodo,
  type TipoPeriodo,
} from "./relatorios/periodo";
import { resumir } from "./relatorios/resumo";
import { baixarArquivo, gerarPdf, gerarPng, podeCompartilhar } from "./relatorios/exportar";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import {
  enviarRelatorioWhatsapp,
  excluirSupervisor,
  getAvaliacoes,
  getSupervisores,
  salvarSupervisor,
} from "../../lib/api";
import { LOJAS, type AvaliacaoApi } from "@/types/avaliacao";
import type {
  ResultadoEnvioWhatsapp,
  Supervisor,
  SupervisorPayload,
} from "@/types/supervisor";

type Formato = "imagem" | "pdf";
type Acao = "baixar" | "compartilhar" | "whatsapp" | "lote";

interface AvaliacaoComDia extends AvaliacaoApi {
  /** AAAA-MM-DD em São Paulo, calculado uma vez no carregamento */
  dia: string;
}

/** Relatório montado fora da tela, em tamanho real, só na hora de exportar */
interface ItemPalco {
  idfilial: number;
  formato: Formato;
  periodo: Periodo;
}

function nomeDaFilial(id: number) {
  return LOJAS[id]?.nome ?? `Filial ${id}`;
}

function nomeCurtoDaFilial(id: number) {
  return nomeDaFilial(id).replace(/^Loja /, "");
}

function chaveDe(idfilial: number, periodo: Periodo) {
  return `${idfilial}|${periodo.tipo}|${periodo.inicio}`;
}

function mensagemDeErro(err: unknown, padrao: string) {
  return err instanceof Error && err.message ? err.message : padrao;
}

const cardClass =
  "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800";

function segmento(ativo: boolean) {
  return `flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
    ativo
      ? "bg-white text-orange-600 shadow-sm dark:bg-zinc-600 dark:text-orange-300"
      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
  }`;
}

export default function RelatoriosPage() {
  const { filiais, isAdmin } = useAuth();
  const { dark, toggle } = useTheme();
  const hoje = useMemo(hojeEmSaoPaulo, []);

  const filiaisDisponiveis = useMemo(
    () => filiais.filter((id) => LOJAS[id]).sort((a, b) => a - b),
    [filiais],
  );

  const [idfilial, setIdfilial] = useState<number | null>(filiaisDisponiveis[0] ?? null);
  const [periodo, setPeriodo] = useState<Periodo>(() => periodoPadrao("semana", hoje));
  const [formato, setFormato] = useState<Formato>("pdf");

  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoComDia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [supervisores, setSupervisores] = useState<Supervisor[]>([]);
  const [whatsappApi, setWhatsappApi] = useState(false);
  const [erroSupervisores, setErroSupervisores] = useState<string | null>(null);

  const [ocupado, setOcupado] = useState<Acao | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [prontoParaCompartilhar, setProntoParaCompartilhar] = useState<File | null>(null);
  const [confirmacao, setConfirmacao] = useState<"filial" | "lote" | null>(null);
  const [envioFilial, setEnvioFilial] = useState<{
    chave: string;
    resultados: ResultadoEnvioWhatsapp[];
  } | null>(null);
  const [envioLote, setEnvioLote] = useState<{ chave: string; resultados: ResultadoLote[] } | null>(
    null,
  );
  const [progressoLote, setProgressoLote] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAvaliacoes();
      setAvaliacoes(
        res.map((a) => ({
          ...a,
          id: Number(a.id),
          idfilial: Number(a.idfilial),
          nota: Number(a.nota),
          dia: diaEmSaoPaulo(a.data),
        })),
      );
    } catch {
      setError("Não foi possível carregar as avaliações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    getSupervisores()
      .then((res) => {
        setSupervisores(res.supervisores);
        setWhatsappApi(res.whatsappApi);
      })
      .catch((err) =>
        setErroSupervisores(mensagemDeErro(err, "Não foi possível carregar os supervisores.")),
      );
  }, []);

  // A sessão pode chegar depois do primeiro render
  useEffect(() => {
    if (idfilial === null && filiaisDisponiveis.length) setIdfilial(filiaisDisponiveis[0]);
  }, [idfilial, filiaisDisponiveis]);

  const dadosRelatorio = useCallback(
    (id: number, p: Periodo) => {
      const periodoAnterior = deslocarPeriodo(p, -1);
      return {
        periodoAnterior,
        doPeriodo: avaliacoes.filter((a) => a.idfilial === id && contemDia(p, a.dia)),
        anterior: resumir(
          avaliacoes.filter((a) => a.idfilial === id && contemDia(periodoAnterior, a.dia)),
        ),
      };
    },
    [avaliacoes],
  );

  const atual = useMemo(
    () => (idfilial === null ? null : dadosRelatorio(idfilial, periodo)),
    [dadosRelatorio, idfilial, periodo],
  );

  const contagemPorFilial = useMemo(() => {
    const contagem = new Map<number, number>();
    for (const a of avaliacoes) {
      if (contemDia(periodo, a.dia)) contagem.set(a.idfilial, (contagem.get(a.idfilial) ?? 0) + 1);
    }
    return contagem;
  }, [avaliacoes, periodo]);

  const supervisoresDaFilial = useCallback(
    (id: number) =>
      supervisores.filter((s) => s.idfilial === id).sort((a, b) => a.nome.localeCompare(b.nome)),
    [supervisores],
  );

  // ---------- palco de exportação ----------

  const palcoRef = useRef<HTMLDivElement>(null);
  const [palco, setPalco] = useState<ItemPalco[]>([]);
  const aoMontarPalco = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    aoMontarPalco.current?.();
    aoMontarPalco.current = null;
  }, [palco]);

  function montarPalco(itens: ItemPalco[]) {
    return new Promise<void>((resolve) => {
      aoMontarPalco.current = resolve;
      setPalco(itens);
    });
  }

  async function exportarDoPalco(item: ItemPalco) {
    const no = palcoRef.current?.querySelector<HTMLElement>(
      `[data-relatorio="${item.idfilial}-${item.formato}"]`,
    );
    if (!no) throw new Error("Não foi possível montar o relatório.");

    const pdf = item.formato === "pdf";
    const blob = pdf ? await gerarPdf(no) : await gerarPng(no);
    return new File(
      [blob],
      nomeArquivo(nomeCurtoDaFilial(item.idfilial), item.periodo, pdf ? "pdf" : "png"),
      { type: pdf ? "application/pdf" : "image/png" },
    );
  }

  async function gerarArquivo(item: ItemPalco) {
    await montarPalco([item]);
    try {
      return await exportarDoPalco(item);
    } finally {
      setPalco([]);
    }
  }

  async function executar(acao: Acao, tarefa: () => Promise<void>) {
    setOcupado(acao);
    setErroAcao(null);
    setProntoParaCompartilhar(null);
    try {
      await tarefa();
    } catch (err) {
      setErroAcao(mensagemDeErro(err, "Algo deu errado. Tente de novo."));
    } finally {
      setOcupado(null);
    }
  }

  // ---------- ações ----------

  const tipoArquivo = formato === "pdf" ? "application/pdf" : "image/png";
  const compartilhavel = useMemo(() => podeCompartilhar(tipoArquivo), [tipoArquivo]);

  function handleBaixar() {
    if (idfilial === null) return;
    executar("baixar", async () => {
      baixarArquivo(await gerarArquivo({ idfilial, formato, periodo }));
    });
  }

  async function compartilhar(arquivo: File) {
    await navigator.share({
      files: [arquivo],
      title: `Avaliações · ${nomeDaFilial(idfilial ?? 0)}`,
      text: `Relatório de avaliações: ${nomeDaFilial(idfilial ?? 0)}, ${descreverPeriodo(periodo)}.`,
    });
  }

  function handleCompartilhar() {
    if (idfilial === null) return;
    executar("compartilhar", async () => {
      const arquivo = await gerarArquivo({ idfilial, formato, periodo });
      try {
        await compartilhar(arquivo);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Gerar o arquivo demorou e o navegador "esqueceu" o toque: pede um novo toque
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setProntoParaCompartilhar(arquivo);
          return;
        }
        throw err;
      }
    });
  }

  async function handleCompartilharPronto() {
    if (!prontoParaCompartilhar) return;
    try {
      await compartilhar(prontoParaCompartilhar);
      setProntoParaCompartilhar(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setProntoParaCompartilhar(null);
      setErroAcao("O navegador não permitiu compartilhar. Use o botão Baixar.");
    }
  }

  function enviarFilial() {
    if (idfilial === null) return;
    const id = idfilial;
    const p = periodo;
    executar("whatsapp", async () => {
      const arquivo = await gerarArquivo({ idfilial: id, formato: "pdf", periodo: p });
      const resultados = await enviarRelatorioWhatsapp({
        idfilial: id,
        periodo: descreverPeriodo(p),
        nomeArquivo: arquivo.name,
        pdf: arquivo,
      });
      setEnvioFilial({ chave: chaveDe(id, p), resultados });
    });
  }

  function enviarLote() {
    const p = periodo;
    const alvos = filiaisDisponiveis.filter((id) => supervisoresDaFilial(id).length > 0);
    const itens: ItemPalco[] = alvos.map((id) => ({ idfilial: id, formato: "pdf", periodo: p }));

    executar("lote", async () => {
      const resultados: ResultadoLote[] = [];
      setEnvioLote(null);
      await montarPalco(itens);
      try {
        for (const [i, item] of itens.entries()) {
          const nomeLoja = nomeCurtoDaFilial(item.idfilial);
          setProgressoLote(`Enviando ${nomeLoja} (${i + 1} de ${itens.length})...`);
          try {
            const arquivo = await exportarDoPalco(item);
            const r = await enviarRelatorioWhatsapp({
              idfilial: item.idfilial,
              periodo: descreverPeriodo(p),
              nomeArquivo: arquivo.name,
              pdf: arquivo,
            });
            resultados.push({ idfilial: item.idfilial, nomeLoja, resultados: r });
          } catch (err) {
            resultados.push({
              idfilial: item.idfilial,
              nomeLoja,
              erro: mensagemDeErro(err, "falhou"),
            });
          }
          setEnvioLote({ chave: `${p.tipo}|${p.inicio}`, resultados: [...resultados] });
        }
      } finally {
        setPalco([]);
        setProgressoLote(null);
      }
    });
  }

  async function handleSalvarSupervisor(dados: SupervisorPayload, id?: number) {
    const salvo = await salvarSupervisor(dados, id);
    setSupervisores((prev) => (id ? prev.map((s) => (s.id === id ? salvo : s)) : [...prev, salvo]));
  }

  async function handleExcluirSupervisor(id: number) {
    await excluirSupervisor(id);
    setSupervisores((prev) => prev.filter((s) => s.id !== id));
  }

  // ---------- período ----------

  function mudarTipo(tipo: TipoPeriodo) {
    if (tipo !== periodo.tipo) setPeriodo(periodoPadrao(tipo, hoje));
  }

  const podeAvancar = deslocarPeriodo(periodo, 1).inicio <= hoje;
  const ehPeriodoAtual = periodo.inicio === periodoPadrao(periodo.tipo, hoje).inicio;

  const supervisoresAtuais = idfilial === null ? [] : supervisoresDaFilial(idfilial);
  const chaveAtual = idfilial === null ? "" : chaveDe(idfilial, periodo);

  return (
    <div className="flex min-h-screen w-full bg-[#f5f5f5] dark:bg-zinc-900">
      <Sidebar activeTab="relatorios" />

      <main className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <section className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-6 pb-10 pt-20 lg:pt-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                <FileChartColumn className="text-orange-500" size={22} />
                Relatórios por filial
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Gere o relatório semanal ou mensal de cada filial e envie aos supervisores
              </p>
            </div>

            <button
              onClick={toggle}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
              title={dark ? "Modo claro" : "Modo escuro"}
              aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>

          {loading ? (
            <div role="status" className="space-y-6">
              <span className="sr-only">Carregando avaliações...</span>
              <div className="h-32 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-96 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
            </div>
          ) : error ? (
            <ErroCarregamento mensagem={error} onTentarNovamente={carregar} />
          ) : idfilial === null || !atual ? (
            <p className={`${cardClass} text-sm text-zinc-500 dark:text-zinc-400`}>
              Seu usuário não tem nenhuma filial liberada.
            </p>
          ) : (
            <>
              <fieldset
                disabled={ocupado !== null}
                className={`${cardClass} grid min-w-0 gap-4 md:grid-cols-[1fr_auto]`}
              >
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Filial
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filiaisDisponiveis.map((id) => {
                      const ativa = id === idfilial;
                      return (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={ativa}
                          onClick={() => setIdfilial(id)}
                          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                            ativa
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-zinc-300 text-zinc-600 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-orange-400"
                          }`}
                        >
                          {nomeCurtoDaFilial(id)}
                          <span
                            className={`rounded-full px-1.5 text-[11px] ${
                              ativa
                                ? "bg-white/25"
                                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                            }`}
                          >
                            {contagemPorFilial.get(id) ?? 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Período
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-700/60">
                      <button
                        type="button"
                        aria-pressed={periodo.tipo === "semana"}
                        onClick={() => mudarTipo("semana")}
                        className={segmento(periodo.tipo === "semana")}
                      >
                        Semanal
                      </button>
                      <button
                        type="button"
                        aria-pressed={periodo.tipo === "mes"}
                        onClick={() => mudarTipo("mes")}
                        className={segmento(periodo.tipo === "mes")}
                      >
                        Mensal
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPeriodo(deslocarPeriodo(periodo, -1))}
                        aria-label={periodo.tipo === "semana" ? "Semana anterior" : "Mês anterior"}
                        className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-700"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="min-w-[13rem] text-center text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                        {tituloPeriodo(periodo)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPeriodo(deslocarPeriodo(periodo, 1))}
                        disabled={!podeAvancar}
                        aria-label={periodo.tipo === "semana" ? "Próxima semana" : "Próximo mês"}
                        className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-700"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>

                    {!ehPeriodoAtual && (
                      <button
                        type="button"
                        onClick={() => setPeriodo(periodoPadrao(periodo.tipo, hoje))}
                        className="text-xs text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
                      >
                        {periodo.tipo === "semana" ? "Última semana" : "Mês atual"}
                      </button>
                    )}
                  </div>
                </div>
              </fieldset>

              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <aside className="space-y-4 lg:order-2">
                  {erroAcao && (
                    <p
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300"
                    >
                      {erroAcao}
                    </p>
                  )}

                  <div className={cardClass}>
                    <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                      Exportar
                    </h2>

                    <div className="mt-3 flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-700/60">
                      <button
                        type="button"
                        aria-pressed={formato === "imagem"}
                        onClick={() => setFormato("imagem")}
                        className={segmento(formato === "imagem")}
                      >
                        <ImageIcon size={14} aria-hidden="true" />
                        Imagem
                      </button>
                      <button
                        type="button"
                        aria-pressed={formato === "pdf"}
                        onClick={() => setFormato("pdf")}
                        className={segmento(formato === "pdf")}
                      >
                        <FileText size={14} aria-hidden="true" />
                        PDF
                      </button>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={handleBaixar}
                        disabled={ocupado !== null}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {ocupado === "baixar" ? <Spinner /> : <Download size={15} aria-hidden="true" />}
                        Baixar
                      </button>
                      {compartilhavel && (
                        <button
                          type="button"
                          onClick={handleCompartilhar}
                          disabled={ocupado !== null}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-orange-500 px-3 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-orange-400 dark:hover:bg-orange-500/10"
                        >
                          {ocupado === "compartilhar" ? (
                            <Spinner />
                          ) : (
                            <Share2 size={15} aria-hidden="true" />
                          )}
                          Compartilhar
                        </button>
                      )}
                    </div>

                    {prontoParaCompartilhar && (
                      <button
                        type="button"
                        onClick={handleCompartilharPronto}
                        className="mt-2 w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                      >
                        Arquivo pronto: toque para compartilhar
                      </button>
                    )}
                  </div>

                  {erroSupervisores ? (
                    <p className={`${cardClass} text-xs text-red-600 dark:text-red-400`}>
                      {erroSupervisores}
                    </p>
                  ) : (
                    <SupervisoresCard
                      key={idfilial}
                      idfilial={idfilial}
                      nomeLoja={nomeCurtoDaFilial(idfilial)}
                      supervisores={supervisoresAtuais}
                      whatsappApi={whatsappApi}
                      podeEditar={isAdmin}
                      ocupado={ocupado !== null}
                      enviando={ocupado === "whatsapp"}
                      resultados={envioFilial?.chave === chaveAtual ? envioFilial.resultados : null}
                      mensagemPara={(s) =>
                        `Olá, ${s.nome.split(" ")[0]}! Segue o relatório de avaliações da Novamix: ${nomeDaFilial(idfilial)}, ${descreverPeriodo(periodo)}.`
                      }
                      onSalvar={handleSalvarSupervisor}
                      onExcluir={handleExcluirSupervisor}
                      onEnviar={() => setConfirmacao("filial")}
                    />
                  )}

                  {whatsappApi && !erroSupervisores && filiaisDisponiveis.length > 1 && (
                    <EnvioLoteCard
                      periodoTexto={descreverPeriodo(periodo)}
                      filiais={filiaisDisponiveis.map((id) => ({
                        idfilial: id,
                        nomeLoja: nomeCurtoDaFilial(id),
                        supervisores: supervisoresDaFilial(id).length,
                      }))}
                      ocupado={ocupado !== null}
                      progresso={progressoLote}
                      resultados={
                        envioLote?.chave === `${periodo.tipo}|${periodo.inicio}`
                          ? envioLote.resultados
                          : null
                      }
                      onEnviar={() => setConfirmacao("lote")}
                    />
                  )}
                </aside>

                <div className="min-w-0 lg:order-1">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Prévia {formato === "imagem" ? "da imagem" : "do PDF"}
                  </p>
                  <PreviaDocumento>
                    <RelatorioFilial
                      nomeLoja={nomeDaFilial(idfilial)}
                      periodo={periodo}
                      periodoAnterior={atual.periodoAnterior}
                      hoje={hoje}
                      avaliacoes={atual.doPeriodo}
                      anterior={atual.anterior}
                    />
                  </PreviaDocumento>
                </div>
              </div>
            </>
          )}
        </section>

        <div className="pb-6">
          <Footer />
        </div>
      </main>

      {confirmacao && idfilial !== null && (
        <ConfirmarEnvioModal
          titulo="Enviar pelo WhatsApp?"
          descricao={
            confirmacao === "filial"
              ? `O PDF de ${nomeCurtoDaFilial(idfilial)} (${descreverPeriodo(periodo)}) vai para:`
              : `Cada filial recebe o próprio PDF (${descreverPeriodo(periodo)}):`
          }
          destinatarios={
            confirmacao === "filial"
              ? supervisoresAtuais.map((s) => s.nome)
              : filiaisDisponiveis
                  .filter((id) => supervisoresDaFilial(id).length > 0)
                  .map(
                    (id) =>
                      `${nomeCurtoDaFilial(id)}: ${supervisoresDaFilial(id)
                        .map((s) => s.nome)
                        .join(", ")}`,
                  )
          }
          onCancelar={() => setConfirmacao(null)}
          onConfirmar={() => {
            const tipo = confirmacao;
            setConfirmacao(null);
            if (tipo === "filial") enviarFilial();
            else enviarLote();
          }}
        />
      )}

      {/* Relatórios em tamanho real, fora da tela, montados só durante a exportação */}
      <div
        ref={palcoRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-[-10000px] top-0"
      >
        {palco.map((item) => {
          const dados = dadosRelatorio(item.idfilial, item.periodo);
          return (
            <RelatorioFilial
              key={`${item.idfilial}-${item.formato}`}
              marcador={`${item.idfilial}-${item.formato}`}
              nomeLoja={nomeDaFilial(item.idfilial)}
              periodo={item.periodo}
              periodoAnterior={dados.periodoAnterior}
              hoje={hoje}
              avaliacoes={dados.doPeriodo}
              anterior={dados.anterior}
            />
          );
        })}
      </div>
    </div>
  );
}
