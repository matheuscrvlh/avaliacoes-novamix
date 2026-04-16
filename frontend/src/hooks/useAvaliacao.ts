import { useState, useCallback } from "react";
import { postAvaliacao } from "@/lib/api";
import type { SubmitStatus } from "@/types/avaliacao";

export function useAvaliacao() {
  const [nota, setNota] = useState<number>(0);
  const [comentario, setComentario] = useState<string>("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const submit = useCallback(async () => {
    if (nota === 0) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      await postAvaliacao({
        nota,
        comentario: comentario.trim() || null,
      });
      setStatus("success");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Erro desconhecido. Tente novamente."
      );
      setStatus("error");
    }
  }, [nota, comentario]);

  const reset = useCallback(() => {
    setNota(0);
    setComentario("");
    setStatus("idle");
    setErrorMsg("");
  }, []);

  return {
    nota,
    setNota,
    comentario,
    setComentario,
    status,
    errorMsg,
    submit,
    reset,
  };
}
