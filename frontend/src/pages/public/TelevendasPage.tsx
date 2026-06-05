import { useTelevendasAvaliacao } from "@/hooks/useTelevendasAvaliacao";
import AvaliacaoForm from "@/components/AvaliacaoForm";
import AvaliacaoSucesso from "@/components/AvaliacaoSucesso";

export default function TelevendasPage() {
  const {
    nota,
    setNota,
    comentario,
    setComentario,
    status,
    errorMsg,
    submit,
    reset,
  } = useTelevendasAvaliacao();

  return (
    <div className="min-h-screen flex items-center justify-center bg-novamix-berylline p-4">
      {status === "success" ? (
        <AvaliacaoSucesso onReset={reset} nota={nota} />
      ) : (
        <AvaliacaoForm
          nomeLoja="Televendas"
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
