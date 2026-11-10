/* ---------- admin: one-click tour of every interface ---------- */
const SCENES=[
 ["التعارف (أول فتح)",()=>{state.onboarded=false;const j=state.judge;state.judge=true;start();state.judge=j}],
 ["الشاشة الرئيسية (مكة)",()=>{setSite("makkah")}],
 ["أقرب عربة + إرشاد صوتي",()=>{setSite("makkah");ask("وين أقرب عربة؟")}],
 ["صلاة العصر (استباقي)",()=>{setSite("makkah");msg("sys","قبل العصر بعشرين دقيقة");prayerPlan()}],
 ["مواقع العائلة ونقطة اللقاء",()=>{setSite("makkah");ask("بعدت عن عائلتي")}],
 ["شريط الماء (أصفر)",()=>{setSite("makkah");wb.lastDrink=Date.now()-40*60000;wb.reminded=false;wbRender()}],
 ["إشارة الساعة: نبض (أصفر)",()=>{setSite("makkah");$("#simPulse").click()}],
 ["إشارة الساعة: أكسجين (أحمر)",()=>{setSite("makkah");$("#simSpo2").click()}],
 ["تذكير الدواء",()=>{setSite("makkah");$("#simMed").click()}],
 ["توتر ثم طمأنة ثم تنفس",()=>{setSite("makkah");ask("أحس بتوتر!! ضعت وما أعرف وين أروح")}],
 ["المدينة: انتظار الروضة",()=>{setSite("madinah")}],
 ["تمرين التنفس",()=>{setSite("madinah");ask("تنفس معي")}],
 ["الصورة (كاميرا)",()=>{setSite("makkah");$("#mImage").click()}],
 ["وضع الإشارة",()=>{setSite("makkah");openSignMode()}],
 ["بلا اتصال",()=>{setSite("makkah");setForceOffline(true);setTimeout(()=>ask("أبغى عربة"),600)}],
 ["الطوارئ",()=>{setSite("makkah");ask("عندي ألم في صدري وضيق نفس")}],
 ["العودة إلى السكن",()=>{setSite("makkah");ask("دلني على الفندق")}],
 ["ملف الضيف (ما يعرفه كنف)",()=>{setSite("makkah");$("#profBtn").click()}],
];
function cleanState(){stopSpeak();stopCam();state.busy=false;send.disabled=false;typing(false);if(state.forceOffline)setForceOffline(false);state.signMode=false;setInputMode("mText");
  Object.assign(wb,{body:"ok",mind:"calm",lastDrink:Date.now(),reminded:false,answered:0,medDue:null});if(health.src!=="ble"&&health.src!=="health")Object.assign(health,{permitted:false,watch:false,hr:null,rr:null,spo2:null,moving:false,ts:0,src:""});healthAsked=false;
  const sh=$("#sheet");if(sh&&!sh.hidden)sh.hidden=true}
function setSite(v){cleanState();if(state.site!==v){state.site=v;loadPrayerTimes();loadWeather();document.querySelectorAll('[data-k="site"]').forEach(x=>x.setAttribute("aria-pressed",x.dataset.v===v))}start()}
let adminTimer=0;
function adminRender(){$("#adminBtns").innerHTML=SCENES.map((x,i)=>`<button class="chip" type="button" data-scene="${i}">${i+1}. ${esc(x[0])}</button>`).join("");
  $("#adminBtns").addEventListener("click",e=>{const b=e.target.closest("[data-scene]");if(!b)return;clearInterval(adminTimer);runScene(+b.dataset.scene)});
  $("#adminAuto").addEventListener("click",()=>{let i=0;clearInterval(adminTimer);runScene(0);adminTimer=setInterval(()=>{i=(i+1)%SCENES.length;runScene(i);if(i===0)clearInterval(adminTimer)},8000)});
  $("#adminStop").addEventListener("click",()=>clearInterval(adminTimer))}
function runScene(i){const [name,fn]=SCENES[i];$("#adminNow").textContent=(i+1)+" / "+SCENES.length+": "+name;document.querySelectorAll("[data-scene]").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.scene===i));try{fn()}catch(e){log("sup","تعذر عرض الواجهة: "+name,String(e&&e.message||e))}}
{const h=location.hash,q=new URLSearchParams(location.search);if(h==="#admin"||q.get("view")==="admin"){$("#adminPanel").hidden=false;adminRender()}}
