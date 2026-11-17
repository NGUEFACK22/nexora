/* Nexora service worker — v1
 * Règles de sûreté :
 *  - Jamais de cache sur /api/** (cookie `auth`, données par org) ni /uploads/** (Range/206 géré par la route).
 *  - Jamais de cache pour les méthodes non-GET, les réponses redirigées (login/logout) ou les origines tierces.
 *  - Cache-first uniquement sur les actifs immuables (/_next/static hashé, icônes PWA, manifest).
 *  - Network-first sur les navigations HTML (pages force-dynamic) avec fallback offline.
 */
const VERSION = 'nexora-v1';
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_URL = '/offline.html';

const CACHE_FIRST_PREFIXES = [
  '/_next/static/',
  '/pwa/',
  '/icons/platforms/',
];

const CACHE_FIRST_FILES = [
  '/nexora.svg',
  '/nexora-text.svg',
  '/manifest.webmanifest',
];

const BYPASS_PREFIXES = [
  '/api/',
  '/uploads/',
  '/auth/',
  '/oauth/',
  '/integrations/',
  '/p/',
  '/provider/',
  '/_next/webpack-hmr',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

const isCacheFirst = (pathname) =>
  CACHE_FIRST_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
  CACHE_FIRST_FILES.includes(pathname);

const isBypassed = (pathname) =>
  BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix));

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isBypassed(url.pathname)) return;

  if (isCacheFirst(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
  }
  // tout le reste passe en réseau direct, sans interception
});
