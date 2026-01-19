import { NextResponse } from 'next/server';

/**
 * Helper pour créer des réponses API avec headers de cache optimisés
 */

// Cache pour les données qui changent rarement (brigades, équipes, etc.)
export function cachedResponse<T>(data: T, maxAge: number = 300) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    },
  });
}

// Cache pour les données qui changent plus fréquemment (tâches, matériels, etc.)
export function freshResponse<T>(data: T, maxAge: number = 30) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    },
  });
}

// Pas de cache pour les données sensibles ou dynamiques
export function noCacheResponse<T>(data: T) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
