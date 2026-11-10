const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['iPhone 13'],colorScheme:'dark',locale:'ar-SA'});const p=await c.newPage();await p.route(/workers\.dev|alharamain|open-meteo|aladhan|googleapis/,r=>r.abort());
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file://'+__dirname+'/../index.html?reset=1&diag=1&hc=78');await p.waitForTimeout(3500);
const btn=await p.$('[data-hc="1"]');if(btn){await btn.click();await p.waitForTimeout(1000)}
console.log(await p.evaluate(()=>[...document.querySelectorAll('#feed .card,#feed .msg')].slice(-3).map(e=>e.innerText.slice(0,400)).join('\n---\n')));
await b.close()})();
