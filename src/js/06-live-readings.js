/* ---------- live readings from the Authority's public status endpoints (the same ones its own pages call) ---------- */
const LIVE={base:"https://eservices.alharamain.gov.sa/haram-api/api/pry/",ep:{mataf:"TawafSaiStatus",salam:"salamStatus",halls:"prayerLocationsStatusHaramain"},data:{},at:{},st:{"1":1,"2":2,"3":3,"4":0},
  load(){try{const j=JSON.parse(localStorage.getItem("knf_live")||"null");if(j){this.data=j.data||{};this.at=j.at||{}}}catch(_){}},
  save(){try{localStorage.setItem("knf_live",JSON.stringify({data:this.data,at:this.at}))}catch(_){}},
  sandboxed(){return /claude\.ai|claudeusercontent|usercontent/.test(location.hostname)},
  async fetch(k,again){const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),10000);const url=this.base+this.ep[k];
    try{const r=await fetch(url,{signal:ctl.signal,cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);const j=await r.json();this.data[k]=j;this.at[k]=Date.now();this.save();log("api","GET "+url+" · "+r.status,"قراءة حية من واجهة الهيئة · "+j.length+" سجل");return j}
    catch(e){if(!again&&e.name==="AbortError"){clearTimeout(t);return this.fetch(k,true)}this.err=e.name==="AbortError"?"timeout":(this.sandboxed()?"sandbox":"blocked");log("api","GET "+url+" · تعذرت القراءة",(e.name==="AbortError"?"انتهت المهلة":this.sandboxed()?"صفحة claude.ai تمنع الاتصال بمواقع خارجية":"الاتصال محجوب من هذه الصفحة")+(this.at[k]?" · أعرض آخر قراءة محفوظة":" · لا أعرض بيانات مفترضة"));return null}finally{clearTimeout(t)}},
  async refresh(){if(state.offline)return;await Promise.all(Object.keys(this.ep).map(k=>this.fetch(k)));renderSvc()},
  fresh(k){return this.at[k]&&(Date.now()-this.at[k])<15*60000},
  when(k){const t=this.at[k];if(!t)return "";const d=new Date(t);return d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0")},
  /* إن ظهرت البطاقة قبل وصول القراءة الحية: تقرأ الآن وتكمل السطر في مكانه، أو تقول بصدق إنها تعذرت */
  async fill(){if(!document.querySelector("[data-livefill]"))return;if(!this.mataf())await this.fetch("mataf");const m=this.mataf();
    document.querySelectorAll("[data-livefill]").forEach(el=>{const k=el.dataset.livefill;el.removeAttribute("data-livefill");if(!m){el.textContent=this.sandboxed()?"القراءة الحية من الهيئة لا تعمل داخل هذه الصفحة؛ افتح كنف من رابطه":"تعذرت قراءة الهيئة الحية الآن (الشبكة)، فلا أعرض كثافة مفترضة";return}
      const b=k==="t"?m["المطاف"][0]:m["المسعى"][0];el.textContent=b[0]+" بكثافة "+lvlText(b[1])+(b[3]?"، نحو "+b[3]+" دقيقة":"")+(k==="t"&&b[2]?"، من "+b[2]:"")})},
  mataf(){const j=this.data.mataf;if(!j||!this.at.mataf)return null;const out={"المطاف":[],"المسعى":[]};
    j.forEach(x=>{const l=this.st[x.status]||0;if(!l)return;const t=+x.time_expect||0;const key=x.location_type==="2"?"المسعى":"المطاف";out[key].push([String(x.location_name).trim().replace(/الارضي/,"الأرضي").replace(/الاول/,"الأول"),l,x.door_no?String(x.door_no).replace(/\s+/g,""):"",t?(t-5)+" - "+(t+5):"",x.icon?1:0])});
    out["المطاف"].sort((a,b)=>a[1]-b[1]);out["المسعى"].sort((a,b)=>a[1]-b[1]);
    return (out["المطاف"].length&&out["المسعى"].length)?out:null},
  salam(){const j=this.data.salam;if(!j||!this.at.salam||!j[0])return null;return this.st[j[0].status]||0},
  halls(){const j=this.data.halls;if(!j||!this.at.halls)return null;return j.map(x=>this.st[x.status]||0)}
};
function farNote(){const r=state.real;if(!r||!(r.km>0.8))return "";const slow=profile.mobility!=="walk"||(+profile.age||0)>=60;const km=r.km<10?r.km.toFixed(1):Math.round(r.km);return `<div class="note">أنت على بعد ${km} كم من ${esc(site().name)}، والمسافات أدناه من داخل ساحاته.</div>`}
/* the agent's own advice after the Authority's status: timing from the clock and prayer times, care from the weather and the guest's profile, places from the interactive map */
function advise(lv,what){const now=new Date();const mins=now.getHours()*60+now.getMinutes();const t=n=>{const p=PRAYERS.find(x=>x[0]===n);const [h,m]=p[1].split(":").map(Number);return h*60+m};
  const isha=t("العشاء"),fajr=t("الفجر");const beforeIsha=mins<isha-30&&mins>=fajr;const slow=profile.mobility!=="walk"||(+profile.age||0)>=60;const s=site();const hot=(s.temp||0)>=35&&mins>=t("الفجر")+120&&mins<t("المغرب");
  const nextP=PRAYERS.map(p=>[p[0],t(p[0])]).find(p=>p[1]>mins)||[PRAYERS[0][0],t(PRAYERS[0][0])+1440];const toNext=nextP[1]-mins;
  const lastP=PRAYERS.map(p=>[p[0],t(p[0])]).filter(p=>p[1]<=mins).pop();const sinceLast=lastP?mins-lastP[1]:999;
  let tip="";
  if(toNext<=40)tip="صلاة "+nextP[0]+" بعد "+toNext+" دقيقة؛ الأفضل أن تذهب بعدها بربع ساعة حين يخرج المصلون.";
  else if(sinceLast<=20)tip="المصلون يخرجون الآن من صلاة "+lastP[0]+"؛ انتظر نحو "+(20-sinceLast+5)+" دقائق ثم تحرك.";
  else if(lv===1)tip="الآن وقت مناسب، تحرك قبل أن تزيد الكثافة.";
  else if(lv===2)tip=beforeIsha?"الأفضل بعد صلاة العشاء، عادة يكون أخف.":"تحرك الآن؛ لا صلاة قريبة، والكثافة متوسطة.";
  else tip=beforeIsha?"الأفضل الانتظار إلى ما بعد صلاة العشاء، عادة يكون أخف، وسأنبهك عندما تخف الكثافة.":"الكثافة كثيفة الآن ولا صلاة قريبة؛ سأنبهك عندما تخف.";
  const care=[];if(hot)care.push("اشرب ماء قبل أن تتحرك؛ أقرب زمزم "+s.places.zamzam[0][0]+" ("+s.places.zamzam[0][1]+" م)");if(hot)care.push("امش تحت المظلات؛ أقرب مقاعد مظللة "+s.places.rest[0][0]+" ("+s.places.rest[0][1]+" م)");if(slow&&lv>=2)care.push("خذ العربة من مركزها لتقل مدة الوقوف");
  try{if(toNext<=40||sinceLast<=20||lv>=2)EVT.mark("shift");if(care.length)EVT.mark("care")}catch(_){}
  return `<div class="best"><b>اقتراحي:</b> ${esc(tip)}${care.length?"<br>"+care.map(esc).join("، ")+".":""}</div>`}
function liveLvl(kind){if(kind==="salam")return LIVE.salam();const m=LIVE.mataf();if(!m)return null;const L=m[kind==="masaa"?"المسعى":"المطاف"];return L.length?L[0][1]:null}
function lvlText(l){return l?LVL[l][0]:"غير متاحة الآن (لا قراءة حية)"}
function liveSnapshot(){if(state.site==="makkah"){const m=LIVE.mataf();return m?[].concat(m["المطاف"],m["المسعى"]).map(x=>[x[0],LVL[x[1]][0]]):[]}const l=LIVE.salam();return l?[["مسار السلام",LVL[l][0]]]:[]}
function liveUnavailable(title,k,api){const when=LIVE.when(k);log("nav","لا توجد قراءة حية الآن",when?"آخر قراءة محفوظة "+when:"لم تصل أي قراءة");
  const c=card(head(ICON.crowd,title,"قراءة حية فقط · لا أعرض بيانات مفترضة")+`<div>${LIVE.sandboxed()?"هذه النسخة تعمل داخل claude.ai، وهو يمنع الصفحة من الاتصال بواجهة الهيئة. القراءة الحية تعمل في نسخة الوكيل المنشورة على موقعه (GitHub) أو داخل منصة الهيئة.":LIVE.err==="timeout"?"واجهة الهيئة لم ترد خلال عشر ثوان. أعيد المحاولة أو افتح صفحة الهيئة مباشرة.":"تعذرت قراءة الحالة الحية من واجهة الهيئة من هذه الصفحة الآن. أعيد المحاولة أو افتح صفحة الهيئة مباشرة."}${when?" آخر قراءة وصلتني كانت الساعة "+when+".":""}</div><div class="acts"><button class="primary" data-retry="${k}">أعد القراءة</button></div>`,"nav");
  c.querySelector("[data-retry]").addEventListener("click",async ev=>{ev.target.disabled=true;ev.target.textContent="أقرأ…";await LIVE.refresh();c.remove();ask(api)});return{live:false,last_reading:when||null}}
window.SALAM_IMG=SALAM_IMG;
const SALAM_LIVE={1:"low",2:"med",3:"high"};
/* order of the Authority's prayer-hall polygons as its page draws them, matched to the labels on its map */
const HALLS_M=[["الساحات الغربية الجديدة",12,0,"باب 37"],["الساحات الغربية",10,0,"باب 8"],["النساء الغربي",7,1,"باب 13"],["الساحات الشرقية",8,0,"باب 33"],["النساء الشرقي",6,1,"باب 25"],["الساحات الغربية الجديدة (نساء)",11,1,"باب 37"],["الساحات الشمالية",9,0,"باب 21"],["الساحات الجنوبية",13,0,"باب السلام"],["الحصوة الأولى",1,0,"باب السلام"],["الحصوة الثانية",2,0,"باب السلام"],["التوسعة الشرقية",4,0,"باب 37"],["التوسعة الغربية",3,0,"باب 5"],["التوسعة الشمالية",5,0,"باب 21"]];
const HALL_ST={1:["متاح","l1"],2:["مزدحم","l2"],3:["ممتلئ","l3"],0:["غير متاح","l0"]};
function salamMap(lv){const live="https://alharamain.gov.sa/public/assets/tsm/"+(lv===0?"unavilable":(SALAM_LIVE[lv]||"med"))+".jpg";
  return `<div class="smap"><img src="${live}" alt="مسار السلام على الرسول" onerror="this.onerror=null;this.src=SALAM_IMG"><div class="cap">مسار السلام كما في صفحة الهيئة</div></div>`}
function densityCard(){
  const AR=n=>String(n).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
  const needsCart=profile.mobility==="cart"||profile.mobility==="slow"||Number(profile.age)>=60;
  const live=LIVE.mataf();if(!live)return liveUnavailable("كثافة المطاف والمسعى","mataf","متى أفضل وقت للطواف؟");const SRC_D=live;
  const render=tab=>{const L=SRC_D[tab];const act=tab==="المطاف"?"الطواف":"السعي";
    return `<div class="dn">${L.map(([n,l,doors,t,cart])=>`<div class="it"><div class="ic ${LVL[l][1]}">${RING}</div><div><div class="nm">${esc(n)}<span class="lvl ${LVL[l][1]}">${LVL[l][0]}</span></div><div class="sub">${doors?"الأبواب المؤدية ("+esc(doors)+")<br>":""}${t?AR(t)+" د لإنهاء "+act:"المدة غير منشورة"}</div></div>${cart?`<div class="cart" title="يسمح بالعربات">♿</div>`:"<span></span>"}</div>`).join("")}</div>`};
  const pick=tab=>{const L=(SRC_D[tab].filter(x=>!needsCart||x[4]).slice().sort((a,b)=>a[1]-b[1])[0])||SRC_D[tab][0];return L};
  if(live)log("nav","قرأ الكثافة الحية من واجهة الهيئة","TawafSaiStatus · "+LIVE.when("mataf"));
  const c=card(head(ICON.crowd,"كثافة المطاف والمسعى",live?"قراءة حية من واجهة الهيئة · "+LIVE.when("mataf"):"مؤشر الكثافة اللحظي · منصة الهيئة · محاكاة")+`<div class="dtabs"><button type="button" data-tab="المطاف" aria-pressed="true">المطاف</button><button type="button" data-tab="المسعى" aria-pressed="false">المسعى</button></div><div class="dbody">${render("المطاف")}</div><div class="best"></div>`,"nav");
  const best=c.querySelector(".best");
  const show=tab=>{c.querySelector(".dbody").innerHTML=render(tab);const b=pick(tab);const act=tab==="المطاف"?"الطواف":"السعي";const door=b[2]?String(b[2]).split(/\s*-\s*/)[0]:"";
    const b2=SRC_D[tab].slice().sort((a,b)=>a[1]-b[1])[0];const alt=(needsCart&&b2&&b2!==b&&b2[1]<b[1])?`<div class="sub" style="font-size:.8rem;margin-top:4px">${esc(b[0])} هو المخصص للعربات وفق مؤشر الهيئة. وإن كنت تستطيع ${act==="الطواف"?"الطواف":"السعي"} بلا عربة فالأخف الآن ${esc(b2[0])}: كثافة ${LVL[b2[1]][0]}${b2[3]?"، "+AR(b2[3])+" د":""}.</div>`:"";
    best.innerHTML=`<div style="font-weight:700;margin-bottom:4px">الأنسب لك الآن: ${esc(b[0])}</div><div class="sub" style="font-size:.8rem;color:var(--muted)">كثافة ${LVL[b[1]][0]}${b[3]?" · "+AR(b[3])+" د لإنهاء "+act:""}${needsCart&&b[4]?" · يسمح بالعربة":""}${door?" · ادخل من باب "+esc(door):""}</div>${alt}<div class="acts">${door?`<button class="primary" data-say="ابدأ الإرشاد إلى باب ${esc(door)}">ابدأ الإرشاد إلى باب ${esc(door)}</button>`:`<button class="primary" data-say="دلني على ${esc(b[0])}">ابدأ الإرشاد إلى ${esc(b[0])}</button>`}${needsCart?`<button data-say="أبغى عربة">اطلب عربة</button>`:""}</div>`;
    c.querySelectorAll("[data-tab]").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.tab===tab)))};
  c.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.tab)));show("المطاف");
  return{source:live?"واجهة الهيئة TawafSaiStatus (حي)":"مؤشر كثافة المطاف والمسعى (محاكاة)",mataf:SRC_D["المطاف"].map(x=>({area:x[0],level:LVL[x[1]][0],doors:x[2],minutes:x[3],cart:!!x[4]})),masaa:SRC_D["المسعى"].map(x=>({area:x[0],level:LVL[x[1]][0],doors:x[2],minutes:x[3],cart:!!x[4]})),best_for_guest:pick("المطاف")[0]}}
const MUT={stages:[["الطواف",'<svg viewBox="0 0 34 30"><rect x="11" y="3" width="12" height="12" rx="1"/><line x1="11" y1="7" x2="23" y2="7"/><path d="M6 20c0 3 5 5.5 11 5.5s11-2.5 11-5.5"/><path d="M28 17v3h-3"/></svg>',7],["الصلاة خلف المقام",'<svg viewBox="0 0 34 30"><path d="M3 24h28"/><path d="M8 24c0-5 3-9 8-10h7c3 0 5 2 6 5l2 5"/><circle cx="27" cy="14" r="3"/><path d="M8 24c0-2 1-4 3-5"/></svg>',0],["السعي",'<svg viewBox="0 0 34 30"><path d="M3 24h28"/><path d="M4 24l8-10 6 7 5-6 8 9"/><path d="M8 7h18"/><path d="M22 4l4 3-4 3"/></svg>',7],["الحلق أو التقصير",'<svg viewBox="0 0 34 30"><circle cx="10" cy="21" r="4"/><circle cx="10" cy="9" r="4"/><path d="M13 11l17 12"/><path d="M13 19l17-12"/></svg>',0]],
 duas:["ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار","رب لا تذرني فردا وأنت خير الوارثين","سبحان الله والحمد لله ولا إله إلا الله والله أكبر","لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير","رب اغفر وارحم وتجاوز عما تعلم، إنك أنت الأعز الأكرم","اللهم إني أسألك العفو والعافية في الدنيا والآخرة"]};
const mut={stage:0,shawt:0,dua:0,auto:false};
function mutawwifCard(){
  const AR=n=>String(n).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
  const c=card(head('<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:#b8995a;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round"><rect x="6" y="3" width="12" height="12" rx="1"/><line x1="6" y1="7" x2="18" y2="7"/><path d="M3 19c0 1.5 4 3 9 3s9-1.5 9-3-4-3-9-3"/></svg>',"المطوف الرقمي","خدمة المطوف الرقمي · منصة الهيئة")+`<div class="mut"><div class="stg"></div><div class="sec"><i><b class="sn"></b></i><span class="st"></span></div><div class="pan"><div class="box cntw"></div><div class="box"><span class="lbl">الأدعية</span><div class="tools"><button type="button" data-spk="1" title="اسمع الدعاء"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/></svg></button><button type="button" class="sw" data-auto="1" aria-pressed="false" title="تشغيل تلقائي"></button><span>تشغيل تلقائي</span></div><div class="dua"></div><div class="dnav"><button type="button" data-d="1" title="التالي"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button><span class="di"></span><button type="button" data-d="-1" title="السابق"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button></div></div></div><details class="pl"><summary><svg viewBox="0 0 24 24"><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/></svg> مواقع تهمك</summary><ul class="pls"></ul></details><div class="kn"></div></div><div class="acts"><button type="button" data-stage="1">المرحلة التالية</button></div>`,"rite");
  const st=c.querySelector(".stg"),cw=c.querySelector(".cntw"),du=c.querySelector(".dua"),di=c.querySelector(".di"),kn=c.querySelector(".kn");
  const knText=()=>{const [n,,max]=MUT.stages[mut.stage];
    if(mut.stage===0){if(mut.shawt>=7)return "أتممت الطواف. المرحلة التالية: ركعتان خلف المقام، وأقرب مصلى هادئ خلف المقام عند الدور الأرضي.";if(mut.shawt>=4)return "منتصف الطواف. اشرب ماء الآن، أقرب زمزم على بعد ٦٠ م، وإن تعبت أكمل من الدور الأول بالعربة.";return "أعد الأشواط هنا وسأذكرك بالماء في المنتصف، وأرشدك لأقل الأدوار كثافة إن احتجت."}
    if(mut.stage===1)return "صل ركعتين خلف المقام، ثم اشرب من زمزم قبل السعي. "+(liveLvl("masaa")?"الأخف في المسعى الآن "+LIVE.mataf()["المسعى"][0][0]+" بكثافة "+lvlText(liveLvl("masaa"))+".":"لم أصل إلى قراءة كثافة المسعى الحية الآن.");
    if(mut.stage===2){if(mut.shawt>=7)return "أتممت السعي. بقي الحلق أو التقصير، وأقرب حلاق مرخص عند باب المروة.";if(mut.shawt>=4)return "منتصف السعي. خذ نفسا، وبين الميلين الأخضرين لا يلزم الإسراع لكبار السن.";return "أعد الأشواط وسأذكرك بالدعاء بين الصفا والمروة."}
    return "اختر حلاقا مرخصا فقط. بعدها تمت عمرتك، تقبل الله."};
  const draw=()=>{st.innerHTML=MUT.stages.map(([n,ic],i)=>`<div class="${i===mut.stage?"on":i<mut.stage?"done":""}" title="${n}">${ic}</div>`).join("");
    c.querySelector(".sn").textContent=AR(mut.stage+1);c.querySelector(".st").textContent=MUT.stages[mut.stage][0];
    const max=MUT.stages[mut.stage][2];cw.innerHTML=max?`<span class="lbl">الأشواط</span><div class="cnt"><button type="button" class="p" data-c="1">+</button><div class="n">${AR(mut.shawt)}</div><button type="button" data-c="-1">−</button></div><div style="text-align:center;font-size:.76rem;color:var(--muted)">${AR(mut.shawt)} من ${AR(max)}</div>`:`<span class="lbl">${mut.stage===1?"الصلاة":"الحلق أو التقصير"}</span><div style="padding:26px 6px 8px;text-align:center;color:var(--muted);font-size:.84rem">${mut.stage===1?"ركعتان خلف مقام إبراهيم، أو في أي موضع من المسجد إن ازدحم":"يكتمل النسك بالحلق أو التقصير بعد السعي"}</div>`;
    const pl=site().places;c.querySelector(".pls").innerHTML=[["زمزم",pl.zamzam],["دورات المياه",pl.wc],["العربات",pl.cart],["مصلى",pl.pray]].filter(x=>x[1]&&x[1][0]).map(([k,v])=>`<li>${k}: ${esc(v[0][0])} (${v[0][1]} م)</li>`).join("");
    du.textContent=MUT.duas[mut.dua];di.textContent=AR(mut.dua+1)+" / "+AR(MUT.duas.length);kn.textContent="كنف: "+knText();
    cw.querySelectorAll("[data-c]").forEach(b=>b.addEventListener("click",()=>{mut.shawt=Math.max(0,Math.min(max,mut.shawt+Number(b.dataset.c)));mut.dua=(mut.dua+1)%MUT.duas.length;draw();
      if(mut.shawt===4){log("care","استباقي من المطوف الرقمي: منتصف الطواف","تذكير بالماء وأقرب زمزم");try{navigator.vibrate&&navigator.vibrate(60)}catch(_){}}
      if(mut.shawt===max){log("rite","أتم "+MUT.stages[mut.stage][0],"يحدث ملف الضيف ويقترح المرحلة التالية");if(mut.stage===0)profile.stage="tawaf";if(mut.stage===2)profile.stage="saee";saveProfile();renderKnown();speak(knText(),{lang:"ar"});setTimeout(()=>surveyCard("بعد إتمام "+MUT.stages[mut.stage][0]),1500)}}))};
  c.querySelectorAll("[data-d]").forEach(b=>b.addEventListener("click",()=>{mut.dua=(mut.dua+Number(b.dataset.d)+MUT.duas.length)%MUT.duas.length;draw();if(mut.auto)speak(MUT.duas[mut.dua],{lang:"ar",force:true,rate:0.9})}));
  c.querySelector("[data-spk]").addEventListener("click",()=>speak(MUT.duas[mut.dua],{lang:"ar",force:true,rate:0.9}));
  c.querySelector("[data-auto]").addEventListener("click",b=>{mut.auto=!mut.auto;b.currentTarget.setAttribute("aria-pressed",String(mut.auto));if(mut.auto)speak(MUT.duas[mut.dua],{lang:"ar",force:true,rate:0.9})});
  c.querySelector("[data-stage]").addEventListener("click",()=>{mut.stage=Math.min(3,mut.stage+1);mut.shawt=0;log("rite","انتقل إلى مرحلة "+MUT.stages[mut.stage][0],"من المطوف الرقمي");draw()});
  draw();return{stage:MUT.stages[mut.stage][0],shawt:mut.shawt,source:"خدمة المطوف الرقمي (الهيئة)"}}
