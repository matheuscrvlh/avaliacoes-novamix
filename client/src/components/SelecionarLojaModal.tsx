import { LOJAS } from "@/types/avaliacao";

export default function SelecionarLojaModal() {
  const handleSelect = (lojaId: number) => {
    window.location.href = `/?loja=${lojaId}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-novamix-berylline p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-fade-up">
        <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-br from-novamix-orange to-novamix-orange-dk">
          <img
            src="/logo.webp"
            alt="Novamix Food Service"
            className="h-10 mx-auto mb-2 object-contain"
          />
          <h1 className="text-novamix-teal text-2xl font-extrabold leading-tight">
            Selecione a Filial
          </h1>
          <p className="text-white/65 text-xs mt-2">
            Escolha a loja que você deseja avaliar
          </p>
        </div>

        <div className="px-8 py-7 flex flex-col gap-3">
          {Object.values(LOJAS).map((loja) => (
            <button
              key={loja.id}
              onClick={() => handleSelect(loja.id)}
              className="w-full py-4 px-5 rounded-2xl border-2 border-novamix-teal/20 bg-novamix-teal/5 hover:bg-novamix-teal hover:text-white hover:border-novamix-teal text-novamix-teal font-bold text-base transition-all duration-200 flex items-center justify-between group"
            >
              <span>{loja.nome}</span>
              <svg
                className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>

        <div className="text-center pb-5">
          <p className="text-[10px] text-gray-300">
            © {new Date().getFullYear()} Novamix Food Service
          </p>
        </div>
      </div>
    </div>
  );
}
