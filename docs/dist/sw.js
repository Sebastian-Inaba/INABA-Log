// public/sw.js
import { warn } from './utilities/logger.ts';

// Service worker caching JS/CSS bundles for faster loading

const CACHE_NAME = 'my-app-cache-v2';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/posts',
  '/post',
  '/research'
];

const MAX_CACHE_ITEMS = 150; // just in case

// helpers
const isSameOrigin = (u) => u.origin === self.location.origin;
const isStaticAsset = (p) =>
  p.startsWith('/assets/') ||
  /\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?|ttf)$/.test(p);

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxItems) return;
  // delete oldest until under limit
  for (let i = 0; i < keys.length - maxItems; i++) {
    await cache.delete(keys[i]);
  }
}

// Install: precache some core entries
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      await cache.addAll(PRECACHE_URLS);
    } catch (err) {
      warn('Precache failed (continuing):', err);
      // ensure index at least
      try { await cache.add('/index.html'); } catch(e){/*ignore*/ }
    }
  })());
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
  })());
  self.clients.claim();
});

// Stale-while-revalidate helper (serves cache first, updates in background)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  // kick off network update (don't await)
  const updatePromise = fetch(request).then(async (response) => {
    if (response && response.ok) {
      await cache.put(request, response.clone());
      trimCache(CACHE_NAME, MAX_CACHE_ITEMS).catch(()=>{});
    }
    return response;
  }).catch(()=>null);

  return cached || updatePromise;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // only same-origin
  if (!isSameOrigin(url)) return;

  // ignore auth/admin paths
if (url.pathname.startsWith('/login') || url.pathname.startsWith('/admin')) return;


  // fast path: static assets (assets/ and common static extensions)
  if (isStaticAsset(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) {
        // background refresh
        fetch(request).then(async (res) => {
          if (res && res.ok) {
            await cache.put(request, res.clone());
            trimCache(CACHE_NAME, MAX_CACHE_ITEMS).catch(()=>{});
          }
        }).catch(()=>{});
        return cached;
      }
      try {
        const net = await fetch(request);
        if (net && net.ok) {
          await cache.put(request, net.clone());
          trimCache(CACHE_NAME, MAX_CACHE_ITEMS).catch(()=>{});
        }
        return net;
      } catch {
        return cached || (await cache.match('/index.html')) || new Response('Offline', { status: 503 });
      }
    })());
    return;
  }

  // want to cache everything under /post, /posts, /research subpaths
const dynamicRegex = /^\/(?:post|posts|research)(?:\/|$)/;
const shouldCachePath =
  url.pathname === '/' ||
  url.pathname === '/index.html' ||
  dynamicRegex.test(url.pathname);

  if (shouldCachePath) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // else: let the network handle it
});
