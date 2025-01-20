const CACHE_NAME = 'my-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    'icon_large.png',
    'icon.png',
    // اضافه کردن مسیرهای فایل‌های دیگری که باید کش شوند
];

// نصب Service Worker و کش کردن منابع
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// هنگام درخواست منابع، از کش استفاده کنید
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // اگر منبع در کش موجود باشد، آن را بازگردانید
                return response || fetch(event.request);
            })
    );
});

// حذف کش‌های قدیمی
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
