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
    text-white font-extrabold text-sm tracking-wide

    bg-gradient-to-br from-novamix-orange to-novamix-orange-dk

    shadow-sm
    transition-all duration-300 ease-out

    hover:scale-[1.03]
    hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]
    hover:-translate-y-0.5

    active:scale-[0.97]
    active:translate-y-[1px]

    disabled:opacity-40 disabled:cursor-not-allowed
    disabled:hover:scale-100
  "
      >
        <span
          className="
      pointer-events-none
      absolute inset-0
      bg-gradient-to-r from-transparent via-white/30 to-transparent
      translate-x-[-100%]
      group-hover:translate-x-[100%]
      transition-transform duration-700 ease-out
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
