"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { api } from "./api"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      api
        .getProfile()
        .then(() => setIsAuthenticated(true))
        .catch(() => {
          console.error("Failed to fetch profile")
          localStorage.removeItem("auth_token")
          setIsAuthenticated(false)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (username: string, password: string) => {
    await api.signin({ username, password })
    setIsAuthenticated(true)
    router.push("/dashboard")
  }

  const signup = async (username: string, password: string) => {
    await api.signup({ username, password })
    await login(username, password)
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setIsAuthenticated(false)
    router.push("/signin")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
