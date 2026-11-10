const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const cs of ['dark','light']){const c=await b.newContext({...devices['iPhone 13'],colorScheme:cs,locale:'ar-SA'});const p=await c.newPage();await p.route(/workers\.dev|alharamain|open-meteo|aladhan|googleapis/,r=>r.abort());
const now=new Date(Date.now()-4*60000).toISOString();
await p.goto('file://'+__dirname+'/../index.html?reset=1#hc='+encodeURIComponent('76 count/min')+'&d='+encodeURIComponent(now));await p.waitForTimeout(3500);
const btn=await p.$('[data-hc="1"]');if(btn){await btn.click();await p.waitForTimeout(800)}
const box=await (await p.$('#wb')).boundingBox();console.log(cs,JSON.stringify(box),await p.evaluate(()=>innerWidth));
await p.screenshot({path:'wb2_'+cs+'.png'});
await c.close()}
await b.close()})();
