import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const { handleLogin, loading, error } = useLogin();
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const ok = await handleLogin(usuario, senha);
    if (ok) navigate("/dashboard");
  }

  return (
    <main className="w-full min-h-screen flex relative overflow-hidden">
      {/* Banner de fundo */}
      <img
        src="/bannerLogin.jpeg"
        alt="Banner Novamix"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Card de Login */}
      <div
        className="bg-white w-[90%] max-w-[380px] mx-auto my-auto flex flex-col gap-3 p-6
                   justify-center rounded-xl shadow-2xl relative z-10
                   md:w-[420px] md:max-w-[420px] md:absolute md:right-[8%]
                   md:top-1/2 md:-translate-y-1/2 md:mx-0
                   lg:right-[10%]"
      >
        <img
          src="/logo.webp"
          alt="Logo Novamix"
          className="w-[45%] max-w-[140px] mx-auto mb-3"
        />

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Usuário"
            required
            className="bg-zinc-100 w-full rounded p-3 text-base text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            required
            className="bg-zinc-100 w-full rounded p-3 text-base text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white font-semibold hover:bg-orange-400 hover:shadow-lg
                       w-full rounded p-3 mt-3 transition-all active:scale-95 text-base disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
