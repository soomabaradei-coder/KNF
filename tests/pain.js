const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['iPad (gen 7) landscape'],colorScheme:'dark',locale:'ar-SA'});const p=await c.newPage();await p.route(/workers\.dev|alharamain|open-meteo|aladhan|googleapis/,r=>r.abort());
await p.goto('file://'+__dirname+'/../index.html?reset=1&admin=1&demo=abdulrahman');await p.waitForTimeout(4000);
const all=async()=>p.evaluate(()=>[...document.querySelectorAll('#feed .card,#feed .msg')].slice(-3).map(c=>c.innerText.replace(/\n+/g,' | ').slice(0,200)).join('\n   '));
await p.fill('#box','عندي ألم في قلبي');await p.press('#box','Enter');await p.waitForTimeout(2500);console.log(await all());
await b.close()})();
