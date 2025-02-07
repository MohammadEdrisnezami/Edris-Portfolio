// نام کش و لیست فایل‌های مورد نیاز
const CACHE_NAME = 'site-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/main.js',
    '/images/logo.png',
    '/images/hero-image.jpg',
    '/fonts/main-font.woff2',
    '/offline.html'  // صفحه آفلاین
];

// نصب Service Worker و کش کردن فایل‌ها
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(error => {
                console.error('Error in cache installation:', error);
            })
    );
});

// فعال‌سازی Service Worker و حذف کش‌های قدیمی
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// مدیریت درخواست‌های شبکه
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // اگر در کش موجود باشد، آن را برمی‌گرداند
                if (response) {
                    return response;
                }

                // کپی درخواست برای استفاده مجدد
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then(response => {
                        // بررسی اعتبار پاسخ
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // کپی پاسخ برای ذخیره در کش
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        // در صورت خطا در شبکه، صفحه آفلاین را نمایش می‌دهد
                        console.error('Fetch error:', error);
                        return caches.match('/offline.html');
                    });
            })
    );
});

// مدیریت پیام‌ها
self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
    });
}

// تأخیر در لود اسکریپت‌های شخص ثالث
<script>
    window.addEventListener('load', function() {
        // Google Analytics
        setTimeout(function() {
            const script = document.createElement('script');
            script.src = 'https://www.google-analytics.com/analytics.js';
            document.body.appendChild(script);
        }, 3000);
    });
</script> 