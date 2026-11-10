const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['iPad (gen 7) landscape'],colorScheme:'dark',locale:'ar-SA'});const p=await c.newPage();await p.route(/workers\.dev|alharamain|open-meteo|aladhan|googleapis/,r=>r.abort());
p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('file://'+__dirname+'/../index.html?reset=1&admin=1&demo=abdulrahman&expo=1');await p.waitForTimeout(4500);
const n=await p.evaluate(()=>document.querySelectorAll('#expoScen button').length);console.log('buttons',n);
await p.screenshot({path:'scen6.png',fullPage:true});
for(let i=0;i<n;i++){
  const before=await p.evaluate(()=>document.querySelectorAll('#feed .card,#feed .msg').length);
  const q=await p.evaluate(i=>{const b=document.querySelectorAll('#expoScen button')[i];b.scrollIntoView();b.click();return b.dataset.q+' @'+b.dataset.xp},i);
  await p.waitForTimeout(4500);
  const out=await p.evaluate(before=>[...document.querySelectorAll('#feed .card,#feed .msg')].slice(before).filter(e=>!e.classList.contains('user')).map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,110)).join(' || '),before);
  console.log((i+1)+'. '+q+'\n   -> '+out);
}
await b.close()})();
