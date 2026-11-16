import { useEffect, useRef, useState, type ReactNode } from "react";
import { LARGURA_RELATORIO } from "./RelatorioFilial";

// Mostra o relatório (largura fixa de A4) reduzido para caber na tela, como uma folha.
export function PreviaDocumento({ children }: { children: ReactNode }) {
  const caixaRef = useRef<HTMLDivElement>(null);
  const folhaRef = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);
  const [altura, setAltura] = useState<number>();

  useEffect(() => {
    const caixa = caixaRef.current;
    const folha = folhaRef.current;
    if (!caixa || !folha) return;

    const medir = () => {
      const novaEscala = Math.min(1, caixa.clientWidth / LARGURA_RELATORIO);
      setEscala(novaEscala);
      setAltura(folha.offsetHeight * novaEscala);
    };

    const observador = new ResizeObserver(medir);
    observador.observe(caixa);
    observador.observe(folha);
    return () => observador.disconnect();
  }, []);

  return (
    <div ref={caixaRef} className="w-full overflow-hidden" style={{ height: altura }}>
      <div
        ref={folhaRef}
        className="mx-auto origin-top-left overflow-hidden rounded-lg shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-700"
        style={{ width: LARGURA_RELATORIO, transform: `scale(${escala})` }}
      >
        {children}
      </div>
    </div>
  );
}
