let cacheName = 'currency-cache-v1';
let pathsToCache = [
    '/',
    './7DaysofCodeChallenge/',
    './index.html',
    '/7DaysofCodeChallenge/assets/',
    '/7DaysofCodeChallenge/assets/css/',
    '/7DaysofCodeChallenge/assets/css/bootstrap.min.css',
    '/7DaysofCodeChallenge/assets/css/style.css',
    '/7DaysofCodeChallenge/assets/images/',
    '/7DaysofCodeChallenge/assets/images/double-arrow.png',
    '/7DaysofCodeChallenge/assets/js/',
    '/7DaysofCodeChallenge/assets/js/jquery-3.3.1.slim.min.js',
    '/7DaysofCodeChallenge/assets/js/popper.min.js',
    '/7DaysofCodeChallenge/assets/js/bootstrap.min.js',
    '/7DaysofCodeChallenge/assets/js/custom.js',
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(pathsToCache);
        }).catch(function(error) {
            console.error('Oops, something bad happened!', error);
        })
    );
});

self.addEventListener('activate', function(event) {

    var cacheWhitelist = ['currency-cache-v1'];
    
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
});
  
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(resp) {
      return resp || fetch(event.request).then(function(response) {
        let responseClone = response.clone();
        caches.open('currency-cache-v1').then(function(cache) {

          //If its coming from api then dont cache json data that is meant for indexedDB
          if (event.request.url.indexOf('/api') === -1) {
            cache.put(event.request, responseClone);
          }
          
        });

        return response;
      });
    })
  );
    
});

