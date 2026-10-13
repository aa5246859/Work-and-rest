const C='goals-v3-20261013-3';
const S=new URL(self.registration?.scope||'./',self.location.href||self.location.origin+'/Work-and-rest/').pathname;
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('goals-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==self.location.origin||!u.pathname.startsWith(S))return;
  const offline=async()=>{
    const saved=await caches.match(e.request);
    if(saved)return saved;
    if(e.request.mode==='navigate')return caches.match('./index.html');
  };
  e.respondWith(fetch(e.request,{cache:'no-cache'}).then(async r=>{
    if(r&&r.ok){
      const copy=r.clone();
      e.waitUntil(caches.open(C).then(c=>c.put(e.request,copy)).catch(()=>{}));
    }else if(e.request.mode==='navigate'){
      const saved=await offline();if(saved)return saved;
    }
    return r;
  }).catch(offline));
});
