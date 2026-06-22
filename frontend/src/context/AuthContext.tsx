import { createContext, useContext, useState, ReactNode } from "react"

interface AuthContextType {
  token: string | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function tokenValido(token: string | null): boolean {
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem("token")
    if (!tokenValido(stored)) {
      localStorage.removeItem("token")
      return null
    }
    return stored
  })

  function login(newToken: string) {
    localStorage.setItem("token", newToken)
    setToken(newToken)
  }

  function logout() {
    localStorage.removeItem("token")
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: tokenValido(token) }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro do AuthProvider")
  return ctx
}
