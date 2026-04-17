import type { SubmitStatus } from "@/types/avaliacao";

interface SubmitButtonProps {
  status: SubmitStatus;
  disabled: boolean;
  onClick: () => void;
}

export default function SubmitButton({
  status,
  disabled,
  onClick,
}: SubmitButtonProps) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="
    group relative overflow-hidden
    mt-5 w-full rounded-xl py-3.5
    text-white font-extrabold text-sm tracking-wide shadow-md
    bg-gradient-to-br from-novamix-orange to-novamix-orange-dk
    transition-all duration-300 ease-out

    hover:not-disabled:scale-[1.02]
    hover:not-disabled:shadow-lg
    hover:not-disabled:-translate-y-1

    active:not-disabled:scale-[0.98]

    disabled:opacity-40 disabled:cursor-not-allowed
  "
      >
        {/* brilho */}
        <span
          className="
      absolute inset-0
      bg-gradient-to-r from-transparent via-white/30 to-transparent
      translate-x-[-100%]
      group-hover:translate-x-[100%]
      transition-transform duration-700
    "
        />

        {/* conteúdo */}
        <span className="relative z-10">
          {status === "loading" ? "Enviando..." : "Enviar Avaliação"}
        </span>
      </button>

      {disabled && status !== "loading" && (
        <p className="text-center text-[11px] text-gray-400 mt-2">
          Selecione uma estrela para continuar
        </p>
      )}
    </>
  );
}
