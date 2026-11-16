import { LoaderCircle } from "lucide-react";

// Gira a caixa HTML e não o SVG: no Chrome, animar o <svg> direto repinta a página a cada quadro.
export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span className="inline-flex animate-spin motion-reduce:animate-none" aria-hidden="true">
      <LoaderCircle size={size} />
    </span>
  );
}
