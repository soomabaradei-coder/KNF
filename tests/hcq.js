const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['iPad (gen 7) landscape'],colorScheme:'dark',locale:'ar-SA'});const p=await c.newPage();await p.route(/workers\.dev|alharamain|open-meteo|aladhan|googleapis/,r=>r.abort());
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file://'+__dirname+'/../index.html?reset=1&admin=1&demo=abdulrahman');await p.waitForTimeout(4000);
const last=async()=>p.evaluate(()=>{const c=[...document.querySelectorAll('#feed .card,#feed .msg')].pop();return c?c.innerText.replace(/\n+/g,' | ').slice(0,260):''});
await p.fill('#box','وين نبض القلب');await p.press('#box','Enter');await p.waitForTimeout(1200);console.log('1:',await last());
const now=new Date(Date.now()-3*60000).toISOString();
await p.goto('file://'+__dirname+'/../index.html#hc='+encodeURIComponent('71 count/min')+'&d='+encodeURIComponent(now));await p.waitForTimeout(3000);
const btn=await p.$('[data-hc="1"]');if(btn){await btn.click();await p.waitForTimeout(600)}
await p.fill('#box','كم نبضي الحين؟');await p.press('#box','Enter');await p.waitForTimeout(1200);console.log('2:',await last());
await p.fill('#box','عندي ألم في قلبي');await p.press('#box','Enter');await p.waitForTimeout(1500);console.log('3:',await last());
await b.close()})();
