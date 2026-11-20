// Service worker لنسخة الويب: يخلّي التطبيق يفتح من غير نت، ويحفظ نصوص المصحف والأحاديث بعد أول فتح
const VERSION = 'azkari-1795217855902';
const CORE = ["./","./index.html","./fonts/amiri-arabic-400-normal.woff2","./fonts/amiri-arabic-700-normal.woff2","./fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2","./fonts/ibm-plex-sans-arabic-arabic-500-normal.woff2","./fonts/ibm-plex-sans-arabic-arabic-700-normal.woff2","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./manifest.webmanifest"];
const TEXT_HOSTS = ['api.alquran.cloud', 'cdn.jsdelivr.net'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'azkari-text').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // صفحات التطبيق وملفاته: من الكاش الأول، ولو مش موجود من النت
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).catch(() => caches.match('./index.html'))));
    return;
  }
  // نصوص المصحف والأحاديث: تتحفظ بعد أول مرة
  if (TEXT_HOSTS.includes(url.hostname)) {
    e.respondWith(caches.open('azkari-text').then(c => c.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }))));
  }
  // الصوت بيشتغل أونلاين مباشرة من مصدره
});
