import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { getSessao, HUB_URL, SessaoAvaliacoes } from "../lib/api"

interface AuthContextType {
  loading: boolean
  isAuthenticated: boolean
  access: SessaoAvaliacoes["access"] | null
  filiais: number[]
  isAdmin: boolean
  voltarAoHub: () => void
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

  function voltarAoHub() {
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
        voltarAoHub,
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
