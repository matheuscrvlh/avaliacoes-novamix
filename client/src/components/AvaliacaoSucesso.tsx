import { LOJAS } from "@/types/avaliacao";

interface AvaliacaoSucessoProps {
  nota: number;
  lojaId?: number;
}

export default function AvaliacaoSucesso({
  nota,
  lojaId,
}: AvaliacaoSucessoProps) {
  const googleLink = lojaId !== undefined ? LOJAS[lojaId]?.googleLink : undefined;

  return (
    <div className="bg-white rounded-3xl shadow-xl px-10 py-12 max-w-md w-full text-center">
      <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-novamix-teal/10 flex items-center justify-center animate-bounce-in">
        <svg
          className="w-10 h-10 text-novamix-teal"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-extrabold mb-2 text-novamix-teal">
        Obrigado!
      </h2>

      <p className="text-gray-500 text-sm">
        Sua avaliação foi enviada com sucesso.
      </p>

      {nota === 5 && googleLink && (
        <a
          href={googleLink}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          ⭐ Avaliar no Google
        </a>
      )}
    </div>
  );
}
