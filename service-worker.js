const cacheName = 'monkey-cache-v2',
      cacheFile = [
          '/',
          './index.html',
          './css/main.css',
          './img/arm3.png',
          './img/ball.png',
          './img/bg.jpg',
          './img/fog.png',
          './img/homebutton.png',
          './img/icon-32.png',
          './img/icon-72.png',
          './img/icon-144.png',
          './img/icon-192.png',
          './img/icon-256.png',
          './img/icon-512.png',
          './img/leaf2.png',
          './img/playbutton.png',
          './img/target3.png',
          './js/main.js'
      ];

//install事件
self.addEventListener('install' , e => {
    console.log('service worker 状态 ：install');
    self.skipWaiting();
    const cacheOpenPromise = caches.open(cacheName).then(cache => {
        return cache.addAll(cacheFile)
    })
    e.waitUntil(cacheOpenPromise);
})

//fetch事件
const apiCacheName = 'monkey-api-cache';
self.addEventListener('fetch' , e => {
    const cacheRequestUrls = [
        'https://wq.jd.com/bases/searchdropdown/getdropdown?key=q'
    ];
    console.log('正在请求：' + e.request.url);

    const needCache = cacheRequestUrls.some(url => {
        return e.request.url.indexOf(url) > -1;
    })

    if(needCache){
        caches.open(apiCacheName).then(cache => {
            return fetch(e.request).then(response => {
                console.log('response clone',response.clone())
                cache.put(e.request.url , response.clone());
                return response;
            })
        })
    }else{
        e.respondWith(
            caches.match(e.request)
            .then(cache => {
                console.log('cache match e.request',cache)
                return cache || fetch(e.request)
            })
            .catch(err => {
                console.log(err)
                return fetch(e.request)
            })
        )
    }

    
})

//activate事件，激活后通过cache的key来判断是否更新cache中的静态资源
self.addEventListener('activate' , e => {
    console.log('service worker 状态：activate');
    const cachePromise = caches.keys().then(keys => {
        return Promise.all(keys.map(key => {
            if( key !== cacheName){
                return caches.delete(key)
            }
        }))
    })
    e.waitUntil(cachePromise);
    return self.clients.claim();
})


