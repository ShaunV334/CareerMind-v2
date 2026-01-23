"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
  refetchUser: () => Promise<void>
  isLoggingOut: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const fetchUser = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      setUser(null)
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      )

      if (!response.ok) {
        localStorage.removeItem("token")
        setUser(null)
      } else {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
      localStorage.removeItem("token")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
    
    // Listen for storage changes to detect login from other tabs
    const handleStorageChange = () => {
      fetchUser()
    }
    
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const logout = () => {
    setIsLoggingOut(true)
    localStorage.removeItem("token")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refetchUser: fetchUser, isLoggingOut }}>
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
