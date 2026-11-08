var VERSION = 'v9';
var SHELL_CACHE = 'infiltrado-shell-' + VERSION;
var RUNTIME_CACHE = 'infiltrado-runtime-' + VERSION;
var BASE = new URL('./', self.location.href).href;

var EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com'
];
var FONT_CSS = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Outfit:wght@300;400;500;600;700;800&display=swap';

function precacheFonts(cache) {
  return fetch(new Request(FONT_CSS, { mode: 'cors' })).then(function (response) {
    if (!response.ok) return;
    var copy = response.clone();
    return response.text().then(function (css) {
      var urls = [];
      var pattern = /url\((?:'|")?(https:\/\/fonts\.gstatic\.com\/[^)'"\s]+)(?:'|")?\)/g;
      var match;
      while ((match = pattern.exec(css))) urls.push(match[1]);
      var tasks = [cache.put(FONT_CSS, copy).catch(function () {})];
      urls.forEach(function (url) {
        tasks.push(
          fetch(new Request(url, { mode: 'cors' }))
            .then(function (fontResponse) {
              if (fontResponse.ok || fontResponse.type === 'opaque') {
                return cache.put(url, fontResponse);
              }
            })
            .catch(function () {})
        );
      });
      return Promise.all(tasks);
    });
  }).catch(function () {});
}

var SHELL_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'styles.css',
  BASE + 'app.js',
  BASE + 'words.js',
  BASE + 'manifest.json',
  BASE + 'favicon.svg',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png',
  BASE + 'icons/icon-maskable-192.png',
  BASE + 'icons/icon-maskable-512.png',
  BASE + 'icons/apple-touch-icon.png'
];

function offlineResponse() {
  return new Response('Sin conexión', {
    status: 503,
    statusText: 'Offline',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function (cache) {
      var tasks = SHELL_ASSETS.map(function (url) {
        return cache.add(url).catch(function () {});
      });
      EXTERNAL_ASSETS.forEach(function (url) {
        tasks.push(
          fetch(new Request(url, { mode: 'no-cors' }))
            .then(function (response) { return cache.put(url, response); })
            .catch(function () {})
        );
      });
      tasks.push(precacheFonts(cache));
      return Promise.all(tasks);
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key !== SHELL_CACHE && key !== RUNTIME_CACHE) return caches.delete(key);
        return Promise.resolve(false);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

async function networkFirst(request) {
  try {
    var response = await fetch(request);
    if (response && response.ok) {
      var cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone()).catch(function () {});
    }
    return response;
  } catch (err) {
    var cached = await caches.match(request);
    if (cached) return cached;
    var index = await caches.match(BASE + 'index.html');
    return index || offlineResponse();
  }
}

async function staleWhileRevalidate(request) {
  var cache = await caches.open(SHELL_CACHE);
  var cached = await cache.match(request);
  var network = fetch(request).then(function (response) {
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(function () {});
    }
    return response;
  }).catch(function () {
    return null;
  });
  if (cached) return cached;
  var fresh = await network;
  return fresh || offlineResponse();
}

async function runtimeCacheFirst(request) {
  var cache = await caches.open(RUNTIME_CACHE);
  var cached = await cache.match(request) || await caches.match(request);
  if (cached) return cached;
  try {
    var response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) {
      cache.put(request, response.clone()).catch(function () {});
    }
    return response;
  } catch (err) {
    return offlineResponse();
  }
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  var url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate') {
      event.respondWith(networkFirst(request));
    } else {
      event.respondWith(staleWhileRevalidate(request));
    }
  } else {
    event.respondWith(runtimeCacheFirst(request));
  }
});
