// ============================================================
// ===== SERVICE WORKER PARA SOLE STYLE =====
// ============================================================

const CACHE_NAME = 'solestyle-v2';
const IMAGES_CACHE = 'solestyle-images-v2';
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/novedades.html',
    '/Top_Quality.html',
    '/Triple_A.html',
    '/doble_A.html',
    '/detalle.html',
    '/styles.css',
    '/script.js'
];

// ===== INSTALACIÓN =====
self.addEventListener('install', event => {
    console.log('📦 Service Worker instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cacheando archivos base...');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                console.log('✅ Service Worker instalado correctamente');
                return self.skipWaiting();
            })
    );
});

// ===== ACTIVACIÓN =====
self.addEventListener('activate', event => {
    console.log('⚡ Service Worker activando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== IMAGES_CACHE) {
                        console.log('🗑️ Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('✅ Service Worker activado');
            return self.clients.claim();
        })
    );
});

// ===== INTERCEPTAR SOLICITUDES =====
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // ===== CACHÉ DE IMÁGENES =====
    if (url.pathname.startsWith('/imagenes/') || 
        url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
        
        event.respondWith(
            caches.open(IMAGES_CACHE).then(cache => {
                return cache.match(event.request).then(response => {
                    if (response) {
                        return response;
                    }
                    
                    return fetch(event.request).then(fetchResponse => {
                        if (fetchResponse && fetchResponse.status === 200) {
                            cache.put(event.request, fetchResponse.clone());
                        }
                        return fetchResponse;
                    }).catch(() => {
                        // Si falla, devolver imagen por defecto
                        return new Response('Imagen no disponible', {
                            status: 404,
                            statusText: 'Not Found'
                        });
                    });
                });
            })
        );
        return;
    }
    
    // ===== CACHÉ DE ARCHIVOS ESTÁTICOS =====
    if (FILES_TO_CACHE.includes(url.pathname) || 
        url.pathname === '/' ||
        url.pathname.match(/\.(css|js)$/)) {
        
        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(fetchResponse => {
                    if (fetchResponse && fetchResponse.status === 200) {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, fetchResponse.clone());
                        });
                    }
                    return fetchResponse;
                });
            })
        );
        return;
    }
    
    // ===== POR DEFECTO: NETWORK FIRST =====
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cachear la respuesta para futuras visitas
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// ===== SINCERONIZACIÓN EN SEGUNDO PLANO =====
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('👟 Service Worker de SoleStyle cargado');