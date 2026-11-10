// الكثافة اللحظية عبر البوابة: يحاكي رد /density ويتحقق أن بطاقة الكثافة تعرض القراءة ومصدرها، ثم يحاكي فشل البوابة والمصدر المباشر معا
const {chromium,devices}=require('playwright');
const SAMPLE=[{location_name:"المطاف الارضي",location_type:"1",status:"3",time_expect:"40",door_no:"79 - 94",icon:""},{location_name:"الدور الاول",location_type:"1",status:"1",time_expect:"25",door_no:"1 - 10",icon:"cart"},{location_name:"المسعى الارضي",location_type:"2",status:"2",time_expect:"30",door_no:"",icon:""},{location_name:"المسعى الاول",location_type:"2",status:"1",time_expect:"20",door_no:"",icon:"cart"}];
(async()=>{const b=await chromium.launch();
for(const mode of ['gateway','none']){
const c=await b.newContext({...devices['iPad (gen 7) landscape'],colorScheme:'dark',locale:'ar-SA'});const p=await c.newPage();
await p.route(/alharamain|open-meteo|aladhan|googleapis/,r=>r.abort());
await p.route(u=>/workers\.dev$/.test(new URL(u).hostname),r=>{const u=r.request().url();if(mode==='gateway'&&/\/density\?k=mataf/.test(u))return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({ok:true,k:'mataf',at:Date.now(),source:'test',data:SAMPLE})});return r.abort()});
try{await p.goto('file://'+__dirname+'/../index.html?reset=1&admin=1&demo=abdulrahman&llm=https://kanaf-gateway.example.workers.dev')}catch(_){}await p.waitForTimeout(4000);
const before=await p.evaluate(()=>document.querySelectorAll('#feed .card,#feed .msg').length);
await p.fill('#box','كثافة المطاف الآن؟');await p.press('#box','Enter');await p.waitForTimeout(4000);
const out=await p.evaluate(before=>[...document.querySelectorAll('#feed .card,#feed .msg')].slice(before).map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,200)).join(' || '),before);
console.log(mode+':',out);
if(mode==='gateway'){if(!/عبر بوابة كنف/.test(out)||!/الدور الأول/.test(out))throw new Error('gateway density card missing');}
else{if(!/لا أعرض بيانات مفترضة|لم أصل إلى قراءة/.test(out))throw new Error('honest fallback missing')}
await c.close()}
await b.close();console.log('density test ok')})();
