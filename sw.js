const APP_SHELL_CACHE_NAME = 'hangman-app-shell';

self.addEventListener('install', e => {
    
    e.waitUntil(
        caches.open(APP_SHELL_CACHE_NAME)
        .then(cache => {
            return cache.addAll([
                'assets/database.json',
                'assets/mylibrary.js',
                'assets/estilos.css',
                'assets/code.js',
                'img/clean.svg',
                'img/store.svg',
                'img/show.svg',
                'favicon.ico',
                'img/box.svg',
                'index.html',
                './'
            ]);
        })
    )

})

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request)
        .then(res => {
            if (res) return res;
            return fetch(e.request);
        })
    )
})
