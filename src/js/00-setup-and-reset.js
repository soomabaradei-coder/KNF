/* ?reset=1 wipes everything this device remembers (profile, group, conversations, plan, readings) and reloads clean */
{const q0=new URLSearchParams(location.search);if(q0.get("reset")==="1"){try{Object.keys(localStorage).filter(k=>/^(hafi\.|knf_)/.test(k)).forEach(k=>localStorage.removeItem(k))}catch(_){}q0.delete("reset");const u=location.pathname+(q0.toString()?"?"+q0.toString():"")+location.hash;location.replace(u);throw new Error("reset")}}
"use strict";
const $=s=>document.querySelector(s);
const HALLS_IMG="__ASSET__(halls.jpg)__";window.HALLS_IMG=HALLS_IMG;
const SALAM_IMG="__ASSET__(salam.jpg)__";
const TOOL_AR={mashaer_guide:"إرشاد المشاعر",save_camp:"حفظ موقع المخيم",find_camp:"الدلالة على المخيم",campaign_schedule:"جدول الحملة",plan_mail:"إرسال الخطة للبريد",get_density:"كثافة المسار",get_prayer_hall_occupancy:"إشغال المصليات",show_map:"الخريطة التفاعلية",find_nearest:"أقرب خدمة",my_location:"تحديد الموقع",invite_member:"إضافة فرد للعائلة",open_portal:"صفحة الهيئة",request_cart:"طلب عربة",report_lost:"بلاغ مفقود",book_children_center:"ضيافة الأطفال",sermon_translation:"ترجمة الخطبة",get_lessons_and_prayers:"الدروس والصلوات",book_visit:"حجز زيارة",accessibility_services:"خدمات ذوي الإعاقة",emergency:"طوارئ",family_locate:"موقع فرد العائلة",set_meeting_point:"نقطة لقاء",share_location:"مشاركة الموقع",go_home:"العودة للسكن",start_guidance:"الإرشاد خطوة بخطوة",plan_prayer:"خطة الصلاة",sign_interpreter:"مترجم إشارة",medication:"تذكير الدواء",set_reminder:"تذكير",track_request:"متابعة طلب",play_stream:"البث المباشر",hydration_rest:"ماء واستراحة",waiting_mode:"موعد الروضة",start_breathing:"تمرين تنفس",rawdah_guide:"دليل الروضة",rawdah_route:"الطريق إلى الروضة",family_setup:"تسجيل العائلة",umrah_now:"عمرتي الآن",avoid_heat_crowd:"تجنب الحر والزحام",transport_options:"الوصول إلى الحرم: حافلة أو سيارة أو أجرة",heat_protection:"الوقاية من الحر",set_language:"تغيير لغة الوكيل",refer_call_center:"إحالة إلى 1966",fatwa_refer:"إحالة فتوى",rawdah_permit:"تصريح الروضة",trip_plan:"خطة الرحلة",mutawwif:"المطوف",knowledge_answer:"جواب من المصادر الرسمية",call_campaign:"الاتصال بالحملة",out_of_scope:"خارج نطاق كنف"};
function svcName(tool,site){return tool==="get_density"?(site==="makkah"?"كثافة المطاف والمسعى":"كثافة مسار السلام"):(TOOL_AR[tool]||tool)}
const MAPIMG="__ASSET__(map-makkah.jpg)__";
{const qd=new URLSearchParams(location.search);if(qd.get("dash")==="1"||location.hash==="#dash"){dashPage();return}}
const feed=$("#feed"), trace=$("#trace"), form=$("#form"), box=$("#box"), send=$("#send");
const state={site:"makkah",lang:"ar",turns:[],busy:false,sample:null,toolsOK:false};
/* موقع العرض (أدمن): حين يحدد المشرف موقع الضيف للعرض يقرأ كنف هذا الموقع بدل GPS، ويكتب في البطاقات «موقع تجريبي للعرض» */
{let _real=null;Object.defineProperty(state,"real",{configurable:true,enumerable:true,get(){const d=state.simLoc;if(d){const c=(typeof CENTER!=="undefined"&&CENTER[state.site])||[21.4225,39.8262];return{la:d.la,lo:d.lo,km:kmBetween(d.la,d.lo,c[0],c[1]),sim:1}}return _real},set(v){_real=v}})}
function gpsLabel(){return state.simLoc?"موقع تجريبي للعرض: "+state.simLoc.n:"من GPS جوالك"}
/* لغة الجوال مباشرة: الصوت بلغة الجهاز نفسها (12 لغة)، والغلاف بالعربية للعربية وبالإنجليزية لغيرها؛ تتغير بطلب صريح فقط */
const DEV_CODE=(()=>{const l=(navigator.language||"ar").toLowerCase().split("-")[0];return ["ar","en","fr","ur","id","tr","bn","ha","hi","fa","ms","es"].includes(l)?l:"en"})();
const DEV_LANG=DEV_CODE==="ar"?"ar":DEV_CODE==="fr"?"fr":"en";
const DEFAULT_PROFILE={name:"ضيف الرحمن",gender:"m",age:0,from:"",langs:"العربية والإنجليزية",readLang:DEV_LANG,speakLang:DEV_LANG,rawdah:{slot:"21:30",bookedVia:"كنف",waitMin:40,stage:0},mobility:"walk",kids:0,tawafFloor:0,quiet:0,lessons:0,rest:0,hearing:0,stage:"",meds:[],homes:{makkah:{home:"",dist:0,auto:0,confirmed:0},madinah:{home:"",dist:0,auto:0,confirmed:0}},
  family:[]};
const profile=Object.assign({},DEFAULT_PROFILE);
const SRC={name:"من حسابه",campaign:"من حديثه",gender:"من حسابه",age:"من حسابه",from:"من حسابه",langs:"من حسابه",family:"أضافهم بنفسه",home:"حدده كنف من مبيتك وأكدته أنت",mobility:"من حديثه",kids:"من حسابه",tawafFloor:"من سلوكه",quiet:"من حديثه",lessons:"من سلوكه",rest:"أدخله بنفسه",hearing:"أدخله بنفسه",stage:"قاله في المحادثة",meds:"قاله في المحادثة، ولا يقرأ كنف سجله الطبي"};
try{Object.assign(profile,JSON.parse(localStorage.getItem("hafi.profile")||"{}"))}catch(_){}
/* migration: profiles saved before v93 spoke French by default; the agent now speaks English unless the guest chose otherwise after v93 */
/* ملفات الإصدارات السابقة كانت تحمل اسم العرض عبدالرحمن؛ بلا حساب يعود الاسم عاما حتى يسأله الوكيل */
if(!profile.accountId&&!profile.selfNamed&&profile.name==="عبدالرحمن"){profile.name="ضيف الرحمن";profile.nameAsked=0}
/* العائلة في الإصدارات السابقة كانت عينة عرض؛ بلا حساب وبلا سؤال سابق لا نفترض أحدا */
if(!profile.accountId&&!profile.familyAsked){profile.family=[]}
/* شخصية العرض للمعرض (الإصدار 212): ?demo=abdulrahman يحمل ملف عبدالرحمن من حملة بشرى الضيافة ويتخطى أسئلة التعارف، ثم يمسح المعلمة من الرابط */
{const q=new URLSearchParams(location.search);let nx=null;try{nx=localStorage.getItem("knf_demo_next");localStorage.removeItem("knf_demo_next")}catch(_){}if(q.get("demo")==="abdulrahman"||nx==="abdulrahman"){Object.assign(profile,JSON.parse(JSON.stringify(DEFAULT_PROFILE)),{name:"عبدالرحمن",selfNamed:true,nameAsked:1,gender:"m",genderStated:1,age:62,mobility:"slow",tawafFloor:1,rest:1,quiet:1,campaign:"بشرى الضيافة",campaignAsked:1,familyAsked:1,family:[],langSet:1,basicsStated:1,pv2:164,langChosen:1,readLang:"ar",speakLang:"ar",meds:[{name:"دواء الضغط",times:["08:00","20:00"]}],homes:{makkah:{home:"سكن الحملة في العزيزية",dist:4200,auto:0,confirmed:1},madinah:{home:"سكن الحملة قرب المسجد النبوي",dist:600,auto:0,confirmed:1}},demoPersona:"abdulrahman"});
  try{localStorage.setItem("hafi.profile",JSON.stringify(profile));localStorage.setItem("hafi.onboarded","1")}catch(_){}q.delete("demo");try{history.replaceState(null,"",location.pathname+(q.toString()?"?"+q.toString():"")+location.hash)}catch(_){}}}
if(!profile.accountId&&!profile.langSet){profile.readLang=DEV_LANG;profile.speakLang=DEV_LANG}
/* قيم العرض القديمة (68 سنة، فاس، يتعب من المشي، طفلان) لا تفترض على ضيف حقيقي؛ تمسح مرة واحدة ما لم يصرح بها الضيف */
if(profile.pv3!==181){if(!profile.prefsStated){profile.tawafFloor=0;profile.quiet=0;profile.lessons=0;profile.rest=0;profile.hearing=0;profile.stage="";profile.meds=[]}for(const k of ["makkah","madinah"]){const H=profile.homes&&profile.homes[k];if(H&&!H.confirmed){H.home="";H.dist=0;H.auto=0}}profile.pv3=181;try{localStorage.setItem("hafi.profile",JSON.stringify(profile))}catch(_){}}
if(!profile.basicsStated&&profile.pv2!==164){if(profile.age===68)profile.age=0;if(profile.from==="فاس، المغرب")profile.from="";if(profile.mobility==="slow")profile.mobility="walk";if(profile.kids===2)profile.kids=0;profile.pv2=164;try{localStorage.setItem("hafi.profile",JSON.stringify(profile))}catch(_){}}
if(!profile.accountId){try{localStorage.setItem("hafi.profile",JSON.stringify(profile))}catch(_){}}
if(profile.pv!==93){if(profile.speakLang==="fr")profile.speakLang="en";if(!profile.gender)profile.gender="m";profile.pv=93;try{localStorage.setItem("hafi.profile",JSON.stringify(profile))}catch(_){}}
if(!Array.isArray(profile.family)||!profile.family.length)profile.family=DEFAULT_PROFILE.family.map(f=>Object.assign({},f));
if(!profile.homes||!profile.homes.makkah||!profile.homes.madinah)profile.homes=JSON.parse(JSON.stringify(DEFAULT_PROFILE.homes));
function HOME(){return profile.homes[state.site]||profile.homes.makkah}if(!profile.from)profile.from=DEFAULT_PROFILE.from;if(!profile.readLang)profile.readLang="ar";if(!profile.rawdah)profile.rawdah=DEFAULT_PROFILE.rawdah;if(!Array.isArray(profile.meds))profile.meds=DEFAULT_PROFILE.meds.map(m=>Object.assign({},m));if(!profile.speakLang)profile.speakLang="fr";
function saveProfile(noSync){try{localStorage.setItem("hafi.profile",JSON.stringify(profile))}catch(_){}if(state.pushPresence)try{state.pushPresence()}catch(_){}if(!noSync&&profile.accountId){clearTimeout(state.syncTimer);state.syncTimer=setTimeout(()=>{try{ACCT.sync(true)}catch(_){}},1500)}}
/* من في العائلة يحتاج عربة على الأرجح: أحد الوالدين أو الأجداد أو من ذكر عمره أو حركته */
const REL_DEP=/^(والدتي|امي|أمي|ماما|والدي|ابوي|أبوي|أبي|ابي|بابا|جدتي|جدي|عمتي|خالتي|عمي|خالي)$/;
function famDependent(){return (profile.family||[]).find(f=>f&&f.name&&(REL_DEP.test(f.name.trim())||/^(والدتي|والدي|جدتي|جدي)$/.test(f.rel||"")||(+f.age||0)>=60||f.mobility==="cart"||f.mobility==="slow"))||null}
/* «والدتي» تصبح «والدتك» عند مخاطبة الضيف، مع حرف جر اختياري: toYour("والدتي","ل") = لوالدتك */
function toYour(name,prep){const n=String(name||"").trim();const M={"والدتي":"والدتك","امي":"أمك","أمي":"أمك","ماما":"والدتك","والدي":"والدك","ابوي":"أبوك","أبوي":"أبوك","أبي":"أبيك","ابي":"أبيك","بابا":"والدك","جدتي":"جدتك","جدي":"جدك","عمتي":"عمتك","خالتي":"خالتك","عمي":"عمك","خالي":"خالك"};const y=M[n];if(y)return (prep||"")+y;return prep?prep+(prep==="ل"?"":" ")+n:n}
/* صلات المرافق: يختارها صاحب الرابط قبل إرساله، وتسافر في الرابط (?r=) فيعرف كنف من فتحه */
const REL_OPTS=[["mom","أم","Mother"],["dad","أب","Father"],["son","ابن","Son"],["daughter","ابنة","Daughter"],["family","عائلة","Family"],["camp","حملة","Campaign"],["sup","مشرف","Supervisor"],["sup_f","مشرفة","Supervisor (f)"],["guide","مرشد","Guide"],["guide_f","مرشدة","Guide (f)"]];
const REL_LABEL={mom:"والدتي",dad:"والدي",son:"ابني",daughter:"ابنتي",family:"من العائلة",camp:"من الحملة",sup:"مشرف الحملة",sup_f:"مشرفة الحملة",guide:"المرشد",guide_f:"المرشدة"};
const REL_LABEL_EN={mom:"my mother",dad:"my father",son:"my son",daughter:"my daughter",family:"family",camp:"campaign member",sup:"campaign supervisor",sup_f:"campaign supervisor",guide:"guide",guide_f:"guide"};
const REL_YOUR={"والدتي":"والدتك","والدي":"والدك","ابني":"ابنك","ابنتي":"ابنتك","مشرف الحملة":"مشرفك","مشرفة الحملة":"مشرفتك","المرشد":"مرشدك","المرشدة":"مرشدتك","زوجتي":"زوجتك","زوجي":"زوجك","أخي":"أخوك","أختي":"أختك","جدتي":"جدتك","جدي":"جدك","عمتي":"عمتك","خالتي":"خالتك","عمي":"عمك","خالي":"خالك","حفيدي":"حفيدك","حفيدتي":"حفيدتك"};
const REL_F={mom:1,daughter:1,sup_f:1,guide_f:1};const REL_CODE={"والدتي":"mom","والدي":"dad","ابني":"son","ابنتي":"daughter","من العائلة":"family","من الحملة":"camp","مشرف الحملة":"sup","مشرفة الحملة":"sup_f","المرشد":"guide","المرشدة":"guide_f"};
const REL_SYN={"امي":"والدتي","أمي":"والدتي","ماما":"والدتي","ابوي":"والدي","أبوي":"والدي","أبي":"والدي","ابي":"والدي","بابا":"والدي","ولدي":"ابني","بنتي":"ابنتي","المشرف":"مشرف الحملة","مشرفنا":"مشرف الحملة","مرشدنا":"المرشد","المرشده":"المرشدة","مرشدتنا":"المرشدة","المشرفة":"مشرفة الحملة","المشرفه":"مشرفة الحملة","مشرفتنا":"مشرفة الحملة"};
try{normFamily()}catch(_){} /* ملفات قديمة كتب فيها «والدتي» اسما بلا صلة */
if(!profile.langChosen&&!profile.langSet){profile.speakLang=DEV_CODE;profile.readLang=DEV_CODE==="ar"?"ar":"en";profile.langChosen=1;profile.voiceChosen=DEV_CODE!==profile.readLang?1:0;profile.langFromDevice=1;try{localStorage.setItem("hafi.profile",JSON.stringify(profile))}catch(_){}}
state.lang=["ar","en","fr"].includes(profile.speakLang)?profile.speakLang:(profile.readLang==="ar"?"ar":"en");
/* الصوت يتبع لغة القراءة ما لم يطلب الضيف صراحة صوتا بلغة أخرى (كلمني بالإنجليزي) */
if(profile.speakLang&&profile.speakLang!=="auto"&&profile.readLang&&profile.speakLang!==profile.readLang&&!profile.voiceChosen){profile.speakLang=profile.readLang;try{localStorage.setItem("hafi.profile",JSON.stringify(profile))}catch(_){}}
function relLabel(code){code=String(code||"");if(!code)return"";if(code.startsWith("x:"))return code.slice(2,42);return REL_LABEL[code]||""}
function relWord(code){code=String(code||"");if(code.startsWith("x:"))return code.slice(2,42);const o=REL_OPTS.find(r=>r[0]===code);return o?(isEN()?o[2]:o[1]):""}
function campName(t){return String(t||"").trim().replace(/^(أنا|انا|احنا|نحن|إحنا)\s+/,"").replace(/^(مع|في|من)\s+/,"").replace(/^(حملة|حمله|شركة|شركه|مجموعة|مجموعه)\s+/,"").replace(/[.!؟]+$/,"").trim().slice(0,40)}
/* بعد «من معك»: يسأل عن صلة كل اسم بالقائمة نفسها (أم، أب، ابن، ابنة، عائلة، حملة، مشرف، مرشد، غير ذلك)، ثم الحملة، ثم رابط الدعوة */
function firstName(n){const w=String(n||"").trim().split(/\s+/);return (/^(أبو|ابو|أم|ام|عبد|عبدال|بو)$/.test(w[0])&&w[1])?w[0]+" "+w[1]:w[0]||""}
function askRels(names,after){state.relQueue=(names||[]).slice();state.relAfter=after||"";nextRel()}
function nextRel(){const q=state.relQueue||[];if(!q.length){const after=state.relAfter||"";state.relAfter="";if(after==="campaign"){if(!profile.campaignAsked){askCampaign("invite");return}const names=state.onbNames||[];state.onbNames=null;if(names.length)TOOLS.invite_member.run({forName:names[0]});return}return}
  const nm=q[0];const en=isEN();const c0=card(head("👨‍👩‍👧",en?"How is "+firstName(nm)+" related to you?":"ما صلة "+firstName(nm)+" بك؟",en?"Family, campaign or other":"عائلة، أو حملة، أو غير ذلك")+`<div class="opts">${REL_OPTS.map(([k,a,e])=>`<button type="button" class="chip" data-rel="${k}">${en?e:a}</button>`).join("")}<button type="button" class="chip" data-relx="1">${en?"Other":"غير ذلك"}</button></div>`);
  const setRel=lab=>{const f=(profile.family||[]).find(x=>x.name===nm);if(f&&lab){f.rel=lab;saveProfile();renderKnown();renderQuick()}log("svc","صلة "+nm,lab||"غير محددة");q.shift();nextRel()};
  c0.querySelectorAll("[data-rel]").forEach(b=>b.addEventListener("click",()=>{c0.remove();setRel(relLabel(b.dataset.rel))}));
  c0.querySelector("[data-relx]").addEventListener("click",()=>{c0.remove();state.onb="relother";state.onbFor=nm;state.onbRelQueue=1;box.placeholder=en?"Type the relationship…":"اكتب الصلة…";const r=en?"Type the relationship, for example: my brother, my neighbour, the campaign doctor.":"اكتب الصلة، مثل: أخي، جارتي، طبيب الحملة.";msg("bot",r);speak(r,{lang:en?"en":"ar"});try{box.focus()}catch(_){}})}
function askCampaign(after){state.onb="campaign";state.onbAfter=after||"";const r=isEN()?"Are you with a Hajj or Umrah campaign? Type its name, or say none.":"هل أنت مع حملة حج أو عمرة؟ اكتب اسمها، أو قل بلا حملة.";msg("bot",r);speak(r,{lang:isEN()?"en":"ar"});box.placeholder=isEN()?"Campaign name, or none…":"اسم الحملة، أو بلا حملة…"}
function relYou(rel){rel=String(rel||"");return REL_YOUR[rel]||rel}
function isRelWord(n){n=String(n||"").trim();return !!(REL_CODE[n]||REL_SYN[n]||REL_YOUR[n])}
function famWho(f){const y=f&&REL_YOUR[f.rel];if(y&&isRelWord(f.name))return y;return y?y+" "+firstName(f.name):String(f&&f.name||"")}
function famYour(f,prep){const y=f&&REL_YOUR[f.rel];if(y)return (prep||"")+y;return toYour(String(f&&f.name||"").split(" ")[0],prep)}
function famMatch(p,q){const n=normAr(p.name||"");if(!q)return false;if(n.startsWith(q)||q.startsWith(n.split(" ")[0]))return true;const rels=[p.prel,p.rel].filter(Boolean);const pf=(profile.family||[]).find(x=>x.name===String(p.name||"").replace(/ \(جهاز آخر\)$/,""));if(pf&&pf.rel)rels.push(pf.rel);const qq=normAr(REL_SYN[q]||q);return rels.some(r=>normAr(r)===qq||normAr(REL_SYN[r]||"")===qq)}
function profileText(){
  const m={walk:"يمشي بلا مساعدة",slow:"يتعب من المشي الطويل",cart:"يحتاج عربة"}[profile.mobility];
  const st={arrive:"وصل للتو",tawaf:"أتم الطواف وبقي السعي",saee:"أتم الطواف والسعي"}[profile.stage];
  return [["الاسم",profile.name,"name"],["الجوال",profile.phone?profile.phone+(profile.phoneVerified?" · مؤكد":" · غير مؤكد"):"لم يذكر","phone"],["الجنس",profile.gender==="f"?"أنثى":"ذكر","gender"],["العمر",profile.age||"لم يذكر","age"],["من",profile.from||"لم يذكر","from"],["اللغة","يقرأ بـ"+(LANGS[profile.readLang]||"العربية")+" ويسمع بـ"+(LANGS[profile.speakLang]||"English"),"langs"],["العائلة",profile.family.filter(f=>f.sharing).length+" من "+profile.family.length+" يشاركون موقعهم","family"],["الحملة",profile.campaign||"بلا حملة","campaign"],["السكن",(HOME()&&HOME().confirmed&&HOME().home)?HOME().home:"لم يحدد بعد","home"],["الحركة",m,"mobility"],["الرفقة",profile.kids>0?"معه "+profile.kids+" من الأطفال":"بلا أطفال","kids"],
   ["الطواف",profile.tawafFloor?"يفضل الدور الأول":"المطاف الأرضي","tawafFloor"],["المصلى",profile.quiet?"يفضل الهدوء":"لا تفضيل","quiet"],["الدروس",profile.lessons?"يحب حضورها":"لا يهتم","lessons"],
   ["الراحة",profile.rest?"تذكير كل 20 دقيقة":"بلا تذكير","rest"],["السمع",profile.hearing?"ضعف سمع":"طبيعي","hearing"],["الدواء",profile.meds.length?profile.meds.map(m=>m.name+" "+m.times.join(" و")).join("، "):"لم يذكر دواء","meds"],["رحلته اليوم",st||"لم يحدد بعد","stage"]];
}
/* عنوان الشاشة الأساسية: بالاسم والحملة إن عرفت «أهلا بك يا سمية في كنف بشرى الضيافة» */
function heroTitle(){const named=profile.name&&profile.name!=="ضيف الرحمن";const c=profile.campaign||"";
  if(isEN())return named?(c?"Welcome "+profile.name+" to KNF "+c:"Welcome "+profile.name+", I am KNF Bushra Hospitality"):"Welcome, I am KNF Bushra Hospitality";
  const K=c?"كنف "+c:"كنف بشرى الضيافة";return named?(c?"أهلا بك يا "+profile.name+" في "+K:"أهلا "+profile.name+"، أنا "+K):"أهلا، أنا "+K}
function refreshHero(){try{document.querySelectorAll(".hero b").forEach(b=>{b.textContent=heroTitle()})}catch(_){}}
function renderKnown(){refreshHero();
  const ms=$("#mSign");if(ms){ms.hidden=!profile.hearing&&!state.signMode}
  $("#known").innerHTML=profileText().map(([k,v,key])=>`<dt>${k}</dt><dd>${esc(v)}<span class="src">${SRC[key]||""}</span></dd>`).join("");
  $("#profBtn").textContent="👤 "+(profile.name==="ضيف الرحمن"&&uiLang()!=="ar"?(uiLang()==="fr"?"Invité":"Guest"):profile.name);
  $("#pName").value=profile.name;$("#pAge").value=profile.age||"";if($("#pGender"))$("#pGender").value=profile.gender||"m";$("#pHome").value=(HOME()&&HOME().confirmed)?HOME().home:"";
  if($("#pPhone")){$("#pPhone").value=profile.phone||"";$("#pPhoneSt").textContent=profile.phone?(profile.phoneVerified?"مؤكد":"غير مؤكد"):"";$("#pCamp").value=profile.campaign||"";if($("#pCampPh"))$("#pCampPh").value=profile.campaignPhone||"";$("#pEmail").value=profile.email||""}
  $("#famList").innerHTML=profile.family.map((f,i)=>`<div class="fm"><div><b>${esc(f.name)}</b> <span style="color:var(--muted)">${esc(relYou(f.rel))}</span><small>${esc(f.phone)}</small></div><button class="sw" type="button" data-i="${i}" aria-pressed="${f.sharing?"true":"false"}">${f.sharing?(f.g==="f"||/^(والدتي|ابنتي|زوجتي|أختي|جدتي|عمتي|خالتي|حفيدتي|المرشدة|مشرفة الحملة)$/.test(f.rel||"")?"تشارك موقعها":"يشارك موقعه"):(f.g==="f"||/^(والدتي|ابنتي|زوجتي|أختي|جدتي|عمتي|خالتي|حفيدتي|المرشدة|مشرفة الحملة)$/.test(f.rel||"")?"لا تشارك":"لا يشارك")}</button><button class="rm" type="button" data-rm="${i}" aria-label="حذف">✕</button></div>`).join("");
  document.querySelectorAll(".opts [data-pref]").forEach(b=>{const k=b.dataset.pref;b.setAttribute("aria-pressed",String(profile[k])===b.dataset.v?"true":"false")});
  document.querySelectorAll(".opts[data-pref]").forEach(g=>{const k=g.dataset.pref;g.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(profile[k])===b.dataset.v?"true":"false"))});
}

