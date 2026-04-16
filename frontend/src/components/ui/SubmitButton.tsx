import type { SubmitStatus } from "@/types/avaliacao";

interface SubmitButtonProps {
  status: SubmitStatus;
  disabled: boolean;
  onClick: () => void;
}

export default function SubmitButton({ status, disabled, onClick }: SubmitButtonProps) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="
          mt-5 w-full rounded-xl py-3.5
          text-white font-extrabold text-sm tracking-wide shadow-md
          bg-gradient-to-br from-novamix-orange to-novamix-orange-dk
          transition-all duration-150
          hover:not-disabled:opacity-90 hover:not-disabled:-translate-y-px
          active:not-disabled:translate-y-0
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      >
        {status === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
              />
            </svg>
            Enviando...
          </span>
        ) : (
          "Enviar Avaliação"
        )}
      </button>

      {disabled && status !== "loading" && (
        <p className="text-center text-[11px] text-gray-400 mt-2">
          Selecione uma estrela para continuar
        </p>
      )}
    </>
  );
}
