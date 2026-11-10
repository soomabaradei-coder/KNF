/* ---------- the Authority's services opened as API-like endpoints the agent calls (simulated here; the real ones are the integration ask) ---------- */
const PORTAL="https://alharamain.gov.sa/public/?";
const API=[
 {id:"map",url:{makkah:MAP_URL.makkah,madinah:MAP_URL.madinah},name:"الخريطة التفاعلية",ep:"GET /v1/{site}/map/points?category=&near=lat,lng",lvl:1,io:"نقاط الخدمة والمسافة والمسار",tools:["find_nearest","show_map","start_guidance","go_home"]},
 {id:"density",url:{makkah:PORTAL+"module=mataf_say_ar",madinah:PORTAL+"module=salam_to_the_messenger_of_Allah_ar"},name:"حالة كثافة المطاف والمسعى / مسار السلام",ep:"GET haram-api/api/pry/TawafSaiStatus · salamStatus",lvl:1,live:["mataf","salam"],io:"مستوى لوني لكل منطقة + وقت التحديث",tools:["get_density"]},
 {id:"halls",url:{makkah:PORTAL+"module=prayers_ar",madinah:PORTAL+"module=prayers_ar"},name:"حالة إشغال المصليات",ep:"GET haram-api/api/pry/prayerLocationsStatusHaramain",lvl:1,live:["halls"],io:"نسبة الإشغال لكل مصلى (أخضر، أصفر، وردي، رمادي)",tools:["get_prayer_hall_occupancy","plan_prayer"]},
 {id:"cart",url:{makkah:"https://carts.alharamain.gov.sa/",madinah:"https://carts.alharamain.gov.sa/"},name:"خدمة التنقل الموحدة: حجز العربات ومواقعها",ep:"POST /v1/{site}/carts/requests",lvl:2,io:"نوع العربة والمركز → رقم طلب ووقت الوصول",tools:["request_cart","track_request"]},
 {id:"lost",url:{makkah:PORTAL+"page=haram-services-ar",madinah:PORTAL+"page=nabawi-services-ar"},name:"مكاتب التائهين والمفقودات",ep:"POST /v1/{site}/lost-and-found/reports",lvl:2,io:"الوصف والموقع → رقم بلاغ والمكتب الأقرب",tools:["report_lost"]},
 {id:"kids",url:{makkah:PORTAL+"page=haram-services-ar",madinah:PORTAL+"page=nabawi-services-ar"},name:"مركز ضيافة الأطفال",ep:"POST /v1/{site}/children-center/bookings",lvl:2,io:"عدد الأطفال والوقت → رقم حجز وموعد الاستلام",tools:["book_children_center"]},
 {id:"manara",url:{makkah:"https://alharamain.gov.sa/manaratalharamain/",madinah:"https://alharamain.gov.sa/manaratalharamain/"},name:"منارة الحرمين (البث والترجمة والدروس)",ep:"GET /v1/manara/streams?lang= · GET /v1/{site}/lessons",lvl:1,io:"قنوات الترجمة وجدول الدروس",tools:["sermon_translation","play_stream","get_lessons_and_prayers"]},
 {id:"guide",url:{makkah:PORTAL+"module=services_directory_ar",madinah:PORTAL+"page=visit-etiquette-rawdah-ar"},name:"مراكز الإرشاد (5 خارجية، 2 داخلية) ودليل المصلي",ep:"GET /v1/{site}/guidance-centers · GET /v1/content/prayer-guide",lvl:0,io:"مواقع المراكز والمحتوى الإرشادي المعتمد",tools:["accessibility_services","rawdah_guide","sign_interpreter"]},
 {id:"visits",url:{makkah:PORTAL+"page=haram-library-ar",madinah:PORTAL+"page=nabawi-library-ar"},name:"بوابة الزيارات (المكتبة والمعارض)",ep:"POST /v1/visits/bookings",lvl:2,io:"المكان والوقت → رقم حجز",tools:["book_visit"]},
 {id:"mutawwif",url:{makkah:"https://alharamain.gov.sa/tawaf/",madinah:"https://alharamain.gov.sa/tawaf/"},name:"المطوف الرقمي (مكة)",ep:"GET /v1/makkah/mutawwif/stages · GET /v1/content/duas?lang=",lvl:0,io:"مراحل النسك والأدعية المعتمدة",tools:["mutawwif"]},
 {id:"requests",url:{makkah:PORTAL+"module=eservices_ar",madinah:PORTAL+"module=eservices_ar"},name:"استقبال طلبات المستفيدين",ep:"POST /v1/beneficiary-requests (مجمع ومجهول)",lvl:2,io:"الاحتياج ومكانه ووقته ولغته → تطوير الخدمات",tools:["survey"]},
 {id:"emergency",url:{makkah:"https://reports.alharamain.gov.sa/#/rafid",madinah:"https://reports.alharamain.gov.sa/#/rafid"},name:"الطوارئ والمراكز الطبية",ep:"POST /v1/{site}/emergency",lvl:2,io:"نوع الحالة والموقع → توجيه الجهة",tools:["emergency"]},
];
const LVL_API={0:"0 محتوى ورابط",1:"1 قراءة بيانات حية",2:"2 تنفيذ نيابة عن الضيف"};
function apiFor(tool){return API.find(a=>a.tools.includes(tool))}
function portalUrl(a){return a&&a.url?(a.url[state.site]||a.url.makkah):null}
function attachPortal(a,before){const u=portalUrl(a);if(!u||state.offline)return;const cards=[...feed.querySelectorAll(".card")].slice(before);const c=cards[cards.length-1];if(!c||c.querySelector(".pg"))return;
  c.insertAdjacentHTML("beforeend",`<a class="pg" href="${u}" target="_blank" rel="noopener" data-pg="${esc(a.name)}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg><span>الصفحة الحية في منصة الهيئة: ${esc(a.name)}</span></a>`)}
Object.keys(TOOLS).forEach(t=>{const a=apiFor(t);if(!a)return;const orig=TOOLS[t].run;TOOLS[t].run=function(input){log("api",a.ep.replace(/\{site\}/g,state.site),a.name+" · المستوى "+LVL_API[a.lvl]+" · محاكاة");const before=feed.querySelectorAll(".card").length;const r=orig.call(this,input||{});attachPortal(a,before);return r}});
Object.keys(TOOLS).forEach(t=>{const orig=TOOLS[t].run;TOOLS[t].run=function(input){try{EVT.add(t)}catch(_){}return orig.call(this,input||{})}});
feed.addEventListener("click",e=>{const g=e.target.closest("a.pg");if(g)log("api","فتح صفحة الهيئة الحية في المتصفح",g.dataset.pg+" · "+g.getAttribute("href"))});
function renderSvc(){const tb=$("#svcTable tbody");if(!tb)return;tb.innerHTML=API.map(a=>{const lv=a.live&&a.live.some(k=>LIVE.fresh(k));return `<tr><td>${esc(a.name)}</td><td style="font-family:var(--mono);font-size:.72rem;direction:ltr;text-align:left">${esc(a.ep)}</td><td>${LVL_API[a.lvl]}</td><td>${a.tools.join("، ")}</td><td><span class="st ${lv?"ok":"sim"}">${lv?"حي · "+LIVE.when(a.live[0]):"محاكاة"}</span></td></tr>`}).join("")}
renderSvc();
document.addEventListener("click",e=>{const b=e.target.closest(".chip[data-k=\"site\"]");if(!b)return;const k=b.dataset.k,v=b.dataset.v;
  if(k==="site"){state.site=v;document.querySelectorAll('[data-k="site"]').forEach(x=>x.setAttribute("aria-pressed",x.dataset.v===v));start();return}
  const on=b.getAttribute("aria-pressed")!=="true";document.querySelectorAll(`[data-k="${k}"]`).forEach(x=>x.setAttribute("aria-pressed","false"));b.setAttribute("aria-pressed",on);
});
$("#quick").addEventListener("click",e=>{const b=e.target.closest(".q");if(b){state.fromChip=true;Promise.resolve(ask(b.textContent)).finally(()=>{state.fromChip=false})}});
$("#svAsk").addEventListener("click",()=>{$("#feed").scrollIntoView({block:"end"});ask("التقييم")});
$("#svRes").addEventListener("click",()=>{$("#feed").scrollIntoView({block:"end"});ask("نتائج التقييم")});
feed.addEventListener("click",e=>{if(e.target.closest("[data-watch]")){connectWatch();return}
  {const h=e.target.closest("[data-hc]");if(h){h.closest(".acts").querySelectorAll("button").forEach(x=>x.disabled=true);hcAnswer(h.dataset.hc==="1");return}}
  if(e.target.closest("[data-hcsetup]")){hcSetup();return}
  if(e.target.closest("[data-sosshare]")){sosShare();return}
  {const c=e.target.closest("[data-telcopy]");if(c){const t=c.dataset.telcopy;const done=()=>{c.textContent="نسخت الرقم"};try{navigator.clipboard.writeText(t).then(done,done)}catch(_){done()}return}}
  if(e.target.closest("[data-rwwait]")){rwWaitCard();return}
  {const k=e.target.closest("[data-rwclip]");if(k){rwClipCard(+k.dataset.rwclip);return}}
  {const k=e.target.closest("[data-rwplay]");if(k){rwPlay(k);return}}
  if(e.target.closest("[data-rwbreath]")){TOOLS.start_breathing.run({});return}
  {const w=e.target.closest("[data-rw]");if(w){const v=w.dataset.rw;rawdahFlow(/^\d$/.test(v)?+v:v);return}}
  {const k=e.target.closest("[data-sosok]");if(k){k.disabled=true;sosOk();return}}
  if(e.target.closest("[data-hcstop]")){hcStop();return}
  {const c=e.target.closest("[data-hccopy]");if(c){const t=hcTemplate();const done=()=>{c.textContent=isEN()?"Copied":"نسخت الرابط"};try{navigator.clipboard.writeText(t).then(done,done)}catch(_){done()}return}}const b=e.target.closest("[data-say]");if(b){state.fromChip=true;state.chipLabel=uiLang()!=="ar"&&!/[\u0600-\u06FF]/.test(b.textContent)?b.textContent.trim():"";Promise.resolve(ask(b.dataset.say)).finally(()=>{state.fromChip=false;state.chipLabel=""})}});
$("#wb").addEventListener("click",()=>{const l=uiLang();if(l!=="ar"){state.fromChip=true;state.chipLabel=l==="fr"?"Comment je vais ?":"How am I doing?"}Promise.resolve(ask("كيف حالي الجسدية؟")).finally(()=>{state.fromChip=false;state.chipLabel=""})});
