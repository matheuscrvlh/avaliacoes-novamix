export default function LojaInvalida() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-novamix-cream p-4">
      <div className="bg-white rounded-3xl shadow-xl px-10 py-12 max-w-md w-full text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold mb-2 text-gray-700 font-display">
          Loja não encontrada!
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          O link que você acessou não contém uma loja válida. <br />
          Verifique o link e tente novamente.
        </p>
      </div>
    </div>
  );
}
