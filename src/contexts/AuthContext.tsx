'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthUser, AppUserRole } from '@/types/auth'

interface AuthContextType {
  user: AuthUser | null
  login: (identifier: string, password: string, role: AppUserRole) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_ENDPOINT = '/api/auth/session'
const LOGIN_ENDPOINT = '/api/auth/login'
const LOGOUT_ENDPOINT = '/api/auth/logout'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const hydrateSession = async () => {
      try {
        const response = await fetch(SESSION_ENDPOINT, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal
        })

        if (!response.ok) {
          setUser(null)
          localStorage.removeItem('user')
          setIsLoading(false)
          return
        }

        const data = await response.json()
        if (data?.user) {
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
        } else {
          setUser(null)
          localStorage.removeItem('user')
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Session sync error:', error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    hydrateSession()

    return () => controller.abort()
  }, [])

  const login = async (identifier: string, password: string, role: AppUserRole): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role })
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      if (!data?.user) {
        return false
      }

      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      return true
    } catch (error) {
      console.error('Erreur de connexion:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch(LOGOUT_ENDPOINT, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Erreur déconnexion:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('user')
    }
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

