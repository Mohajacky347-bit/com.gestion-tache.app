'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, ReactNode, useMemo } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: ('chef_section' | 'chef_brigade')[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Mémoriser la vérification pour éviter les recalculs inutiles
  const shouldRender = useMemo(() => {
    if (isLoading) return 'loading'
    if (!isAuthenticated) return 'redirect_login'
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      return 'redirect_role'
    }
    return 'render'
  }, [isLoading, isAuthenticated, user, allowedRoles])

  useEffect(() => {
    if (shouldRender === 'redirect_login') {
      router.push(redirectTo)
      return
    }

    if (shouldRender === 'redirect_role' && user) {
      // Rediriger vers la page appropriée selon le rôle
      if (user.role === 'chef_section') {
        router.push('/')
      } else if (user.role === 'chef_brigade') {
        router.push('/brigade')
      }
      return
    }
  }, [shouldRender, redirectTo, router, user])

  if (shouldRender === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (shouldRender !== 'render') {
    return null
  }

  return <>{children}</>
}

