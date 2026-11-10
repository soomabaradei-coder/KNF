const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [place,q] of [['mataf','افتح خريطة الحرم'],['sahat','وين أقرب باب؟'],['nabawi','ابدأ الإرشاد إلى الروضة'],['mataf','دلني على الصفا من الدور الأول'],['sahat','وين أقرب عربة؟']]){
const c=await b.newContext({...devices['iPad (gen 7) landscape'],colorScheme:'dark',locale:'ar-SA'});const p=await c.newPage();await p.route(/workers\.dev|alharamain|open-meteo|aladhan|googleapis/,r=>r.abort());
await p.goto('file://'+__dirname+'/../index.html?reset=1&admin=1&demo=abdulrahman&expo=1');await p.waitForTimeout(3500);
await p.evaluate(k=>{const b=document.querySelector('#expoScen button[data-xp="'+k+'"]');b.click()},place);await p.waitForTimeout(7000);
const before=await p.evaluate(()=>document.querySelectorAll('#feed .card,#feed .msg').length);
await p.fill('#box',q);await p.press('#box','Enter');await p.waitForTimeout(4000);
console.log(q,'\n  ->',await p.evaluate(before=>[...document.querySelectorAll('#feed .card,#feed .msg')].slice(before).map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,170)).join(' || '),before));
await c.close()}
await b.close()})();
