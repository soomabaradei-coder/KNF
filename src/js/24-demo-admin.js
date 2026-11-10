/* ---------- أدمن العرض: تحديد موقع الضيف ويوم الحج والحملة (للمعارض والعروض). يفتح بـ ?admin=1 أو #admin ويبقى مفعلا على الجهاز حتى ?admin=0 ---------- */
const DEMO_PLACES=[
 ["mataf","المطاف",21.4225,39.8262,"makkah"],["sahat","ساحات المسجد الحرام",21.4196,39.8262,"makkah"],["aziziyah","العزيزية (سكن)",21.4110,39.8610,"makkah"],
 ["mina","منى (المخيم)",21.4140,39.8925,"makkah"],["jamarat","الجمرات",21.4209,39.8727,"makkah"],["arafat","عرفات",21.3545,39.9760,"makkah"],["muzdalifah","مزدلفة",21.3880,39.9200,"makkah"],
 ["nabawi","المسجد النبوي",24.4672,39.6111,"madinah"]];
function demoAdminOn(){const q=new URLSearchParams(location.search);let on=false;try{if(q.get("admin")==="0")localStorage.removeItem("knf_admin");else if(q.get("admin")==="1"||location.hash==="#admin")localStorage.setItem("knf_admin","1");on=localStorage.getItem("knf_admin")==="1"}catch(_){on=q.get("admin")==="1"||location.hash==="#admin"}return on}
function demoSetPlace(key){state.followOnce=null;const p=DEMO_PLACES.find(x=>x[0]===key);if(!p){state.simLoc=null;state.mashaer=null;log("sup","أدمن: إيقاف الموقع التجريبي","يعود كنف إلى GPS الجوال");msg("sys","عاد كنف إلى موقع الجوال الحقيقي.");demoPanel();renderQuick();return}
  state.simLoc={k:p[0],n:p[1],la:p[2],lo:p[3]};state.mashaer=null;state.mashaerShown={};
  const go=()=>{try{$("#locText").innerHTML="موقعك الآن: <b>"+esc(p[1])+"</b> <span style=\"color:var(--muted)\">(موقع تجريبي للعرض)</span>"}catch(_){}log("sup","أدمن: موقع تجريبي للعرض: "+p[1],p[2]+", "+p[3]);msg("sys","موقع تجريبي للعرض: "+p[1]+".");const z=mashaerAt(p[2],p[3]);state.mashaerShown={};if(z){state.mashaerShown[z.k]=1;TOOLS.mashaer_guide.run({place:z.k})}else TOOLS.my_location.run({});state.kbReply=null;state.followOnce=null;try{renderQuick()}catch(_){}demoPanel();const bx=document.getElementById("demoBox");if(bx)bx.hidden=true};
  if(state.site!==p[4]){setSite(p[4]);setTimeout(go,500)}else go()}
function demoSetDay(d){state.hajjDayTest=d||0;log("sup","أدمن: يوم الحج للعرض",d?d+" ذو الحجة":"بلا (التاريخ الحقيقي)");msg("sys",d?"يوم الحج للعرض: "+d+" ذو الحجة.":"عاد كنف إلى التاريخ الحقيقي.");try{renderQuick()}catch(_){}demoPanel()}
function demoSetCamp(on){if(on){profile.campaign="بشرى الضيافة";profile.campaignAsked=1;saveProfile();showCampCard(campFind(profile.campaign))}else{profile.campaign="";saveProfile();msg("sys","أزيلت الحملة من ملف الضيف.")}try{renderQuick()}catch(_){}try{refreshHero()}catch(_){}demoPanel()}
function demoPanel(){let w=document.getElementById("demoAdm");if(!w){w=document.createElement("div");w.id="demoAdm";w.innerHTML=`<button type="button" id="demoFab" aria-label="أدمن العرض" style="position:fixed;top:calc(12px + env(safe-area-inset-top));left:12px;z-index:9999;height:48px;padding:0 18px;border-radius:999px;border:2px solid var(--gold);background:var(--kiswa);color:#fff;font:700 16px var(--body);box-shadow:0 4px 14px rgba(0,0,0,.25)">⚙ تحكم العرض</button><div id="demoBox" hidden style="position:fixed;top:calc(68px + env(safe-area-inset-top));left:10px;right:10px;max-width:420px;max-height:70vh;overflow:auto;z-index:9999;background:var(--card);border:2px solid var(--gold);border-radius:16px;padding:12px 14px;box-shadow:0 8px 30px rgba(0,0,0,.3);direction:rtl;font-size:14px"></div>`;document.body.appendChild(w);
    w.querySelector("#demoFab").addEventListener("click",()=>{const b=document.getElementById("demoBox");b.hidden=!b.hidden});
    w.querySelector("#demoBox").addEventListener("click",e=>{const b=e.target.closest("[data-dp],[data-dd],[data-dc],[data-dx],[data-dw]");if(!b)return;if(b.dataset.dw!==undefined){if(b.dataset.dw==="1")Object.assign(health,{permitted:true,watch:true,hr:82,rr:16,spo2:97,moving:false,ts:Date.now(),src:"sim"});else Object.assign(health,{permitted:false,watch:false,hr:null,rr:null,spo2:null,ts:0,src:""});healthAsked=false;wbRender();demoPanel();return}if(b.dataset.dp!==undefined)demoSetPlace(b.dataset.dp);else if(b.dataset.dd!==undefined)demoSetDay(+b.dataset.dd);else if(b.dataset.dc!==undefined)demoSetCamp(b.dataset.dc==="1");else if(b.dataset.dx==="abd"){demoGuest()}else if(b.dataset.dx==="new"){const u=new URL(location.href);u.searchParams.set("reset","1");u.searchParams.set("admin","1");if(b.dataset.dx==="abd")u.searchParams.set("demo","abdulrahman");else u.searchParams.delete("demo");location.href=u.toString()}else if(b.dataset.dx==="close")document.getElementById("demoBox").hidden=true})}
  const box=document.getElementById("demoBox");const cur=state.simLoc?state.simLoc.k:"";const hd=state.hajjDayTest||0;const camp=!!campFind(profile.campaign);
  const B=(attr,v,lab,on)=>`<button type="button" class="chip" ${attr}="${v}" aria-pressed="${on?"true":"false"}" style="margin:3px;${on?"background:var(--kiswa);color:#fff;border-color:var(--kiswa)":""}">${esc(lab)}</button>`;
  box.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><b>أدمن العرض</b><button type="button" class="chip" data-dx="close">إغلاق</button></div><div class="note" style="margin:6px 0">للعرض فقط: يكتب كنف في بطاقاته «موقع تجريبي للعرض».</div>
   <div style="margin-top:6px"><b>موقع الضيف</b></div><div>${B("data-dp","","موقع الجوال الحقيقي",!cur)}${DEMO_PLACES.map(p=>B("data-dp",p[0],p[1],cur===p[0])).join("")}</div>
   <div style="margin-top:8px"><b>يوم الحج</b></div><div>${B("data-dd",0,"التاريخ الحقيقي",!hd)}${[8,9,10,11,12,13].map(d=>B("data-dd",d,d+" ذو الحجة",hd===d)).join("")}</div>
   <div style="margin-top:8px"><b>الساعة (القلب والنفس)</b></div><div>${B("data-dw","0","بلا ساعة",health.src!=="sim")}${B("data-dw","1","ساعة تجريبية للعرض",health.src==="sim")}</div>
   <div style="margin-top:8px"><b>الحملة</b></div><div>${B("data-dc","1","مع بشرى الضيافة",camp)}${B("data-dc","0","بلا حملة",!camp)}</div>
   <div style="margin-top:8px">${B("data-dx","abd","عبدالرحمن (شخصية العرض)",profile.demoPersona==="abdulrahman")}${B("data-dx","new","ضيف جديد (مسح الجهاز)",false)}</div>`}
if(demoAdminOn()){setTimeout(()=>{try{demoPanel()}catch(_){}},1200)}
/* وضع المعرض: ?expo=1 أو زر «وضع المعرض»، ويبقى على الجهاز */
/* الإصدار 233 (سمية: «نوع السيناريوهات وخليها واقعية»): ست فئات، وكل زر سؤال كما يكتبه الضيف، مع المكان الذي يحاكى قبل السؤال */
const EXPO_SCEN=[
 ["rawdah","🕌 الروضة",[["nabawi","تصريح الروضة"],["nabawi","وش خطوات دخول الروضة؟"],["nabawi","ذكرني قبل موعد الروضة بنصف ساعة"]]],
 ["umrah","🕋 العمرة",[["mataf","ما خطوات العمرة؟"],["mataf","متى أفضل وقت للطواف؟"],["mataf","أبغى أرتاح شوي قبل السعي"]]],
 ["lost","🧭 التيه",[["mina","تهت عن مخيمي"],["mataf","ضعت في الحرم وين مكتب التائهين؟"],["nabawi","ما أعرف أرجع للسكن"]]],
 ["heat","☀️ الحر",[["arafat","أحس بدوخة من الحر"],["mataf","ما شربت ماء من الفجر"],["sahat","أبغى مكان بارد أرتاح فيه"]]],
 ["crowd","👥 الزحام",[["mataf","كثافة المطاف الآن؟"],["jamarat","الزحام شديد عند الجمرات"],["nabawi","الزحام شديد وين أروح؟"]]],
 ["plan","📋 خطة وتعليمات الحملة",[["mina","ما هي خطة بشرى الضيافة؟"],["mina","متى تفويج حملتنا للجمرات؟"],["arafat","وين مخيم الحملة في عرفات؟"]]],
 ["map","🗺️ الخريطة التفاعلية",[["mataf","افتح خريطة الحرم"],["sahat","وين أقرب باب؟"],["mataf","دلني على الصفا من الدور الأول"]]]];
const EXPO_PLACE={mataf:"المطاف",sahat:"الساحات",mina:"منى",arafat:"عرفات",jamarat:"الجمرات",muzdalifah:"مزدلفة",nabawi:"المسجد النبوي"};
function expoSet(on){try{on?localStorage.setItem("knf_expo","1"):localStorage.removeItem("knf_expo")}catch(_){}document.body.classList.toggle("expo",!!on);const b=document.getElementById("expoBtn");if(b){b.setAttribute("aria-pressed",on?"true":"false");b.textContent=on?"الصفحة كاملة":"وضع المعرض"}if(on)expoRender()}
function expoRender(){const w=document.getElementById("expoScen");if(!w||w.dataset.done)return;w.dataset.done=1;w.innerHTML=EXPO_SCEN.map(([k,n,qs])=>`<div class="xc"><h3>${esc(n)}</h3>${qs.map(([pl,q])=>`<button type="button" data-xp="${pl}" data-q="${esc(q)}">${esc(q)}<small>${esc(EXPO_PLACE[pl]||"")}</small></button>`).join("")}</div>`).join("");
  w.addEventListener("click",e=>{const b=e.target.closest("[data-xp]");if(!b)return;w.querySelectorAll("button.on").forEach(x=>x.classList.remove("on"));b.classList.add("on");const sc=[b.dataset.xp,"",b.dataset.q];
    try{window.scrollTo({top:0,behavior:"smooth"})}catch(_){window.scrollTo(0,0)}
    if(!profile.campaign){profile.campaign="بشرى الضيافة";profile.campaignAsked=1;saveProfile()}
    const tg=(DEMO_PLACES.find(x=>x[0]===sc[0])||[])[4];const dl=tg&&tg!==state.site?1700:900;demoSetPlace(sc[0]);const box2=document.getElementById("demoBox");if(box2)box2.hidden=true;
    setTimeout(()=>{if(state.busy){setTimeout(()=>ask(sc[2]),1200)}else ask(sc[2])},dl)})}
{let on=false;try{const q=new URLSearchParams(location.search);if(q.get("expo")==="1")localStorage.setItem("knf_expo","1");if(q.get("expo")==="0")localStorage.removeItem("knf_expo");on=localStorage.getItem("knf_expo")==="1"}catch(_){}
 if(on&&!state.judge)expoSet(true);const xb=document.getElementById("expoBtn");if(xb)xb.addEventListener("click",()=>expoSet(!document.body.classList.contains("expo")))}
/* تحكم العرض ظاهر دائما في شريط صفحة العرض (التابلت والحاسب)، فلا يحتاج رابطا خاصا */
{const o=document.getElementById("demoOpen");if(o)o.addEventListener("click",()=>{try{localStorage.setItem("knf_admin","1")}catch(_){}demoPanel();const b=document.getElementById("demoBox");if(b)b.hidden=false});
 const a=document.getElementById("demoAbd");if(a)a.addEventListener("click",demoGuest)}
/* الإصدار 231: إعادة العرض لا تمسح إذن الصحة ولا آخر قراءة، حتى يبقى النبض الحقيقي في المعرض */
function demoGuest(){try{Object.keys(localStorage).filter(k=>/^(hafi\.|knf_)/.test(k)&&!["knf_admin","knf_expo","knf_hc_ok","knf_hc_last"].includes(k)).forEach(k=>localStorage.removeItem(k));localStorage.setItem("knf_admin","1");localStorage.setItem("knf_demo_next","abdulrahman")}catch(_){}location.reload()}
try{if(!(/^#hc=/.test(location.hash)||new URLSearchParams(location.search).get("hc")!==null))hcRestore()}catch(_){}
if(/^#hc=/.test(location.hash)||new URLSearchParams(location.search).get("hc")!==null)setTimeout(()=>{try{hcIncoming();const c=[...document.querySelectorAll("#feed .card,#feed .msg")].pop();if(c)c.scrollIntoView({block:"center"})}catch(_){}},1500);
window.addEventListener("hashchange",()=>{if(/^#hc=/.test(location.hash))try{hcIncoming()}catch(_){}});

start();voiceStatus();setTimeout(voiceStatus,1500);
(async()=>{
  try{const g0=groupCode();state.groupCode=state.groupCode||g0}catch(_){} /* يقرأ رمز المجموعة والصلة من الرابط قبل أي سؤال للمنضم */
  try{const s=window.claude&&window.claude.use?await window.claude.use("sample"):null;
    if(s){const lim=await s.limits().catch(()=>null);state.sample=s;state.toolsOK=!!(lim&&lim.tools);state.imagesOK=!!(lim&&lim.images);setMode(state.toolsOK);if(!state.toolsOK)state.sample=null}
    else setMode(false)}
  catch(_){setMode(false)}
  try{const room=window.claude&&window.claude.use?await window.claude.use("room"):null;if(room)liveFamilyStart(room,"claude");else{const r=await mqttRoom();if(r)liveFamilyStart(r,"mqtt")}}catch(_){}
})();
