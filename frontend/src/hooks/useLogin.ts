import { useState } from "react"
import { useAuth } from "../context/AuthContext"

const BASE_URL = import.meta.env.VITE_API_URL ?? "https://avaliacoes.lojanovamix.com.br/api"

export function useLogin() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleLogin(usuario: string, senha: string) {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.erro || "Usuário ou senha incorretos.")
        return false
      }

      login(data.token)
      return true
    } catch {
      setError("Erro ao conectar com o servidor.")
      return false
    } finally {
      setLoading(false)
    }
  }

  return { handleLogin, loading, error }
}
