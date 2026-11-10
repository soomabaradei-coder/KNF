const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['iPhone 13'],colorScheme:'dark'});const p=await c.newPage();await p.route(/workers\.dev|alharamain/,r=>r.abort());
p.on('pageerror',e=>console.log('PAGEERR',e.message));
const now=new Date(Date.now()-5*60000).toISOString();const old=new Date(Date.now()-9*3600000).toISOString();
const payload=encodeURIComponent('78 count/min_16 count/min_97 %')+'&d='+encodeURIComponent(now+'_'+old+'_'+now);
await p.goto('file://'+__dirname+'/../index.html?reset=1#hc='+payload);await p.waitForTimeout(3500);
const btn=await p.$('[data-hc="1"]');console.log('consent btn',!!btn);if(btn){await btn.click();await p.waitForTimeout(800)}
console.log('wb1',await p.evaluate(()=>document.querySelector('#wb').innerText.replace(/\n/g,' | ')));
console.log('saved',await p.evaluate(()=>localStorage.getItem('knf_hc_last')));
// reopen without hash (new tab)
const p2=await c.newPage();await p2.route(/workers\.dev|alharamain/,r=>r.abort());await p2.goto('file://'+__dirname+'/../index.html');await p2.waitForTimeout(3000);
console.log('wb2 (reopened)',await p2.evaluate(()=>document.querySelector('#wb').innerText.replace(/\n/g,' | ')));
console.log('icons',await p2.evaluate(()=>[...document.querySelectorAll('#wb i')].map(x=>x.className+':'+x.textContent).join(' ; ')));
// stop
await p2.fill('#box','أوقف قراءة صحتي');await p2.press('#box','Enter');await p2.waitForTimeout(800);
console.log('after stop saved',await p2.evaluate(()=>localStorage.getItem('knf_hc_last')),'|',await p2.evaluate(()=>document.querySelector('#wb').innerText.replace(/\n/g,' | ')));
const p3=await c.newPage();await p3.route(/workers\.dev|alharamain/,r=>r.abort());await p3.goto('file://'+__dirname+'/../index.html');await p3.waitForTimeout(2500);
console.log('wb3 (after stop, reopened)',await p3.evaluate(()=>document.querySelector('#wb').innerText.replace(/\n/g,' | ')));
await b.close()})();
