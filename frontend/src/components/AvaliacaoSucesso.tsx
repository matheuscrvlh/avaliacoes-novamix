interface AvaliacaoSucessoProps {
  onReset: () => void;
}

export default function AvaliacaoSucesso({ onReset }: AvaliacaoSucessoProps) {
  return (
    <div className="bg-white rounded-3xl shadow-xl px-10 py-12 max-w-md w-full text-center">
      {/* Ícone animado */}
      <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-novamix-teal/10 flex items-center justify-center animate-bounce-in">
        <svg
          className="w-10 h-10 text-novamix-teal"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-extrabold mb-2 text-novamix-teal font-display">
        Obrigado!
      </h2>

      <p className="text-gray-500 text-sm leading-relaxed mb-8">
        Sua avaliação foi enviada com sucesso. <br />
        Ela nos ajuda a melhorar cada vez mais!
      </p>

      <button
        type="button"
        onClick={onReset}
        className="text-sm font-semibold text-novamix-orange hover:underline transition-all"
      >
        Avaliar novamente
      </button>
    </div>
  );
}
