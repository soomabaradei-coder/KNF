// البريد بطلب الضيف فقط: بناء الخطة أو حفظ البريد لا يرسل شيئا إلى /plan، وطلب "أرسل خطتي للبريد" يرسل مرة واحدة مع send:true
const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
const c=await b.newContext({...devices['iPad (gen 7) landscape'],colorScheme:'dark',locale:'ar-SA'});const p=await c.newPage();
const calls=[];
await p.route(/alharamain|open-meteo|aladhan|googleapis/,r=>r.abort());
await p.route(u=>/workers\.dev$/.test(new URL(u).hostname),r=>{const q=r.request();const u=q.url();
  if(/\/plan$/.test(new URL(u).pathname)){let body={};try{body=JSON.parse(q.postData()||'{}')}catch(_){}calls.push(body);return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({stored:false,sent:!!body.send,reason:''})})}
  return r.abort()});
const url='file://'+__dirname+'/../index.html?admin=1&demo=abdulrahman&llm=https://kanaf-gateway.example.workers.dev';
try{await p.goto(url+'&reset=1')}catch(_){}await p.waitForTimeout(3500);
// حساب وبريد محفوظان على الجهاز، كما لو أن الضيف سجل من قبل
await p.evaluate(()=>{const pr=JSON.parse(localStorage.getItem('hafi.profile')||'{}');pr.accountId='test-acct-1';pr.email='guest@example.com';pr.planMailAsked=1;localStorage.setItem('hafi.profile',JSON.stringify(pr))});
try{await p.goto(url)}catch(_){}await p.waitForTimeout(3500);
const got=await p.evaluate(()=>{const pr=JSON.parse(localStorage.getItem('hafi.profile')||'{}');return [pr.accountId,pr.email]});
console.log('profile:',got.join(' '));
const say=async t=>{const before=await p.evaluate(()=>document.querySelectorAll('#feed .card,#feed .msg').length);await p.fill('#box',t);await p.press('#box','Enter');await p.waitForTimeout(4500);return p.evaluate(before=>[...document.querySelectorAll('#feed .card,#feed .msg')].slice(before).map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,160)).join(' || '),before)};
const o1=await say('جهز رحلتي');console.log('build:',o1.slice(0,400));
if(calls.length)throw new Error('plan build contacted /plan: '+JSON.stringify(calls));
if(/كل صباح/.test(o1))throw new Error('daily promise still shown after build');
const o2=await say('أرسل خطتي للبريد');console.log('mail:',o2.slice(0,400));
if(calls.length!==1)throw new Error('expected exactly one /plan call, got '+calls.length);
if(calls[0].send!==true||calls[0].email!=='guest@example.com')throw new Error('bad /plan body '+JSON.stringify(calls[0]).slice(0,200));
if(/كل صباح/.test(o2))throw new Error('daily promise still shown after mail');
if(!/أرسلت خطتك إلى guest@example\.com/.test(o2))throw new Error('sent confirmation missing');
const all=await p.evaluate(()=>document.documentElement.innerHTML);
if(/كل صباح على|للإرسال اليومي/.test(all))throw new Error('daily wording still in page');
await b.close();console.log('mail_once test ok')})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
