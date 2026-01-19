'use client'

import { createContext, useContext, ReactNode, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

// Fonction pour récupérer l'utilisateur depuis le localStorage (synchrone pour l'état initial)
function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try {
      return JSON.parse(savedUser)
    } catch (error) {
      localStorage.removeItem('user')
      return null
    }
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  
  // Récupérer l'utilisateur initial depuis localStorage (synchrone)
  const initialUser = useMemo(() => getStoredUser(), [])

  // Utiliser React Query pour gérer la session avec cache optimisé
  const { data: sessionUser, isLoading: isSessionLoading } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const response = await fetch(SESSION_ENDPOINT, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        localStorage.removeItem('user')
        return null
      }

      const data = await response.json()
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
        return data.user as AuthUser
      }
      
      localStorage.removeItem('user')
      return null
    },
    enabled: typeof window !== 'undefined', // Ne s'exécute que côté client
    staleTime: 5 * 60 * 1000, // 5 minutes - considère les données fraîches
    gcTime: 10 * 60 * 1000, // 10 minutes de cache
    refetchOnWindowFocus: false, // Ne pas refetch au focus
    refetchOnMount: false, // Ne pas refetch au mount si déjà en cache
    initialData: initialUser, // Utiliser les données du localStorage comme données initiales
  })

  const user = sessionUser ?? initialUser

  // Mutation pour la connexion
  const loginMutation = useMutation({
    mutationFn: async ({ identifier, password, role }: { identifier: string; password: string; role: AppUserRole }) => {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role })
      })

      if (!response.ok) {
        throw new Error('Échec de la connexion')
      }

      const data = await response.json()
      if (!data?.user) {
        throw new Error('Données utilisateur invalides')
      }

      return data.user as AuthUser
    },
    onSuccess: (userData) => {
      localStorage.setItem('user', JSON.stringify(userData))
      // Mettre à jour le cache React Query
      queryClient.setQueryData(['auth', 'session'], userData)
    },
  })

  // Mutation pour la déconnexion
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(LOGOUT_ENDPOINT, {
        method: 'POST',
        credentials: 'include'
      })
    },
    onSuccess: () => {
      localStorage.removeItem('user')
      // Nettoyer le cache React Query
      queryClient.setQueryData(['auth', 'session'], null)
    },
  })

  const login = async (identifier: string, password: string, role: AppUserRole): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ identifier, password, role })
      return true
    } catch (error) {
      console.error('Erreur de connexion:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch (error) {
      console.error('Erreur déconnexion:', error)
      // Nettoyer quand même en cas d'erreur
      localStorage.removeItem('user')
      queryClient.setQueryData(['auth', 'session'], null)
    }
  }

  const value: AuthContextType = useMemo(() => ({
    user,
    login,
    logout,
    isLoading: isSessionLoading && !initialUser, // Ne bloquer que si pas d'utilisateur initial
    isAuthenticated: !!user
  }), [user, isSessionLoading, initialUser])

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

