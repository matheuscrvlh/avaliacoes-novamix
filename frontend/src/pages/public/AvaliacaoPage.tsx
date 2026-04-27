import { useAvaliacao } from "@/hooks/useAvaliacao";
import { useLojaParam } from "@/hooks/useLojaParam";
import AvaliacaoForm from "@/components/AvaliacaoForm";
import AvaliacaoSucesso from "@/components/AvaliacaoSucesso";
import LojaInvalida from "@/components/ui/LojaInvalida";

export default function AvaliacaoPage() {
  const loja = useLojaParam();

  const {
    nota,
    setNota,
    comentario,
    setComentario,
    status,
    errorMsg,
    submit,
    reset,
  } = useAvaliacao(loja?.id ?? 0);

  if (!loja) return <LojaInvalida />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-novamix-berylline p-4">
      {status === "success" ? (
        <AvaliacaoSucesso onReset={reset} nota={nota} lojaId={loja.id} />
      ) : (
        <AvaliacaoForm
          nomeLoja={loja.nome}
          lojaId={loja.id}
          nota={nota}
          onNotaChange={setNota}
          comentario={comentario}
          onComentarioChange={setComentario}
          status={status}
          errorMsg={errorMsg}
          onSubmit={submit}
        />
      )}
    </div>
  );
}
