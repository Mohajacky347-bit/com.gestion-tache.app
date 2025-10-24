import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Vérifier si l'utilisateur est sur la page de login
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }

  // Vérifier si l'utilisateur est authentifié via localStorage (côté client)
  // Note: En production, ceci devrait être géré côté serveur avec des cookies sécurisés
  const user = request.cookies.get('user')
  
  // Si pas d'utilisateur et pas sur login, rediriger vers login
  if (!user && request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

