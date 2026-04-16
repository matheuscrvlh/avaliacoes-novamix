import { useAvaliacao } from "@/hooks/useAvaliacao";
import AvaliacaoForm from "@/components/AvaliacaoForm";
import AvaliacaoSucesso from "@/components/AvaliacaoSucesso";

export default function AvaliacaoPage() {
  const {
    nota,
    setNota,
    comentario,
    setComentario,
    status,
    errorMsg,
    submit,
    reset,
  } = useAvaliacao();

  return (
    <div className="min-h-screen flex items-center justify-center bg-novamix-cream p-4">
      {status === "success" ? (
        <AvaliacaoSucesso onReset={reset} />
      ) : (
        <AvaliacaoForm
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
