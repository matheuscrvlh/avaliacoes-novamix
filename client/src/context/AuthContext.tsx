import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { getSessao, logout as logoutRequest, HUB_URL, SessaoAvaliacoes } from "../lib/api"

interface AuthContextType {
  loading: boolean
  isAuthenticated: boolean
  access: SessaoAvaliacoes["access"] | null
  filiais: number[]
  isAdmin: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [sessao, setSessao] = useState<SessaoAvaliacoes | null>(null)

  useEffect(() => {
    getSessao()
      .then(setSessao)
      .finally(() => setLoading(false))
  }, [])

  async function logout() {
    await logoutRequest()
    setSessao(null)
    window.location.href = HUB_URL
  }

  return (
    <AuthContext.Provider
      value={{
        loading,
        isAuthenticated: sessao !== null,
        access: sessao?.access ?? null,
        filiais: sessao?.filiais ?? [],
        isAdmin: sessao?.access === "admin",
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro do AuthProvider")
  return ctx
}
