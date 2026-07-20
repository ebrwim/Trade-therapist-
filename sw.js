// هر بار که تغییری در HTML دادید، این عدد ورژن را یک شماره بالا ببرید (مثلا v3، v4 و...)
const CACHE_NAME = 'trade-therapist-cache-v2.1'; 

const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// مرحله نصب: ذخیره فایل‌ها در کش و عبور از حالت انتظار
self.addEventListener('install', event => {
    self.skipWaiting(); // این دستور باعث می‌شود نسخه جدید فورا جایگزین شود
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// مرحله فعال‌سازی: پاک کردن کش‌های قدیمی
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('کش قدیمی پاک شد:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // کنترل فوری تمام تب‌های باز
    );
});

// استراتژی Network First (اولویت با اینترنت، سپس کش)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // اگر اینترنت وصل بود و فایل جدیدی بود، آن را در کش کپی کن
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // اگر آفلاین بود، از کش بخوان
                return caches.match(event.request);
            })
    );
});
