/* ---------- sign-language stream mode (simulation of a limited on-device sign recogniser) ---------- */
// إيماءات العرض (ليست لغة الإشارة السعودية): نموذج نقاط اليد يعمل على الجهاز
const GEST={Open_Palm:"مساعدة",Closed_Fist:"ماء",Thumb_Up:"بخير",Victory:"عائلتي",Pointing_Up:"ضعت",ILoveYou:"طبيب"};
const GEST_HINT="كف مفتوحة = مساعدة · قبضة = ماء · إبهام = بخير · إصبعان = عائلتي · سبابة لأعلى = ضعت · 🤟 = طبيب";
let gestLoop=0;
async function startGestures(video,c,fire){
  const hud=c.querySelector(".hud");
  try{
    hud.textContent="أحمل نموذج التعرف على اليد…";
    const vis=await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs");
    const fs=await vis.FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
    const gr=await vis.GestureRecognizer.createFromOptions(fs,{baseOptions:{modelAssetPath:"https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task"},runningMode:"VIDEO",numHands:1});
    hud.textContent="جاهز. "+GEST_HINT;log("care","نموذج اليد جاهز على الجهاز","الإيماءات للعرض وليست لغة الإشارة السعودية");
    let last="",since=0,cool=0,lastT=-1;
    const tick=()=>{if(!state.signMode||!camStream)return;gestLoop=requestAnimationFrame(tick);
      if(video.readyState<2)return;const now=performance.now();if(now-lastT<80)return;lastT=now;
      let r;try{r=gr.recognizeForVideo(video,now)}catch(_){return}
      const g=r&&r.gestures&&r.gestures[0]&&r.gestures[0][0];const name=g?g.categoryName:"";const sc=g?g.score:0;
      if(now<cool){return}
      if(name&&GEST[name]&&sc>0.6){if(name!==last){last=name;since=now}
        const held=now-since;hud.textContent="أرى: "+GEST[name]+" "+"▮".repeat(Math.min(5,Math.floor(held/200)))+" "+Math.round(sc*100)+"%";
        if(held>900){cool=now+4000;last="";fire(GEST[name],Math.round(sc*100))}}
      else{last="";hud.textContent="أراقب يديك… "+GEST_HINT}};
    gestLoop=requestAnimationFrame(tick);
  }catch(e){hud.textContent="تعذر تحميل نموذج اليد هنا ("+(e&&e.message||e)+")؛ استخدم أزرار المحاكاة";log("care","نموذج اليد غير متاح في هذا العارض","المحاكاة بالأزرار")}}
const SIGNS=[["ماء","وين أقرب زمزم؟"],["مساعدة","أحتاج مساعدة"],["بخير","أنا بخير الحمد لله"],["دواء","دوائي"],["ضعت","دلني على الفندق"],["عائلتي","بعدت عن عائلتي"],["طبيب","وين أقرب مركز طبي؟"]];
const SPOKEN={"ماء":"هذا الضيف أصم ويحتاج ماء، من فضلكم","مساعدة":"هذا الضيف أصم ويحتاج مساعدة، من فضلكم","بخير":"أنا بخير، شكرا لكم","دواء":"هذا الضيف يحتاج دواءه الآن، أرجو المساعدة","ضعت":"هذا الضيف ضاع ويريد الوصول إلى فندقه، أرجو إرشاده","عائلتي":"هذا الضيف ابتعد عن عائلته ويريد الوصول إليهم، أرجو المساعدة","طبيب":"هذا الضيف يحتاج طبيبا، دلوه على أقرب مركز طبي من فضلكم"};
function arVoiceInfo(){let vs=[];try{vs=speechSynthesis.getVoices()}catch(_){}const ar=vs.filter(v=>/^ar/i.test(v.lang));return{total:vs.length,ar:ar.map(v=>v.name)}}
function announceSign(k,conf,c){
  const ph2=SIGNS.find(x=>x[0]===k)[1],say=SPOKEN[k]||("هذا الضيف يحتاج "+k);
  log("care","تعرف على إشارة «"+k+"»","ثقة "+conf+"% · ينطق حاجته بالعربي لمن حوله ويطلب التأكيد قبل التنفيذ");
  if(c)c.querySelector(".hud").textContent="فهمت: «"+k+"» ("+conf+"%) · أنطقها لمن حولك · إبهام = نعم";
  const cc=card(head("🔊","ترجمة فورية لمن حولك","إشارة «"+k+"» · ثقة "+conf+"%")+`<div class="bigsay"><small>كنف ينطق بالعربي لمن حول الضيف:</small>${esc(say)}</div><div style="font-size:.92rem;font-weight:700;margin:4px 0">أعتمد الطلب «${esc(ph2)}»؟ أشر بالإبهام أو اضغط نعم</div><div class="acts"><button class="primary" type="button" data-yes="1">نعم، اعتمده</button><button type="button" data-no="1">لا، أعد الإشارة</button><button type="button" data-again="1">🔊 أعد النطق</button></div>`);
  const ps={k,ph2,say,card:cc,cam:c};state.pendingSign=ps;
  const vs=document.createElement("div");vs.style.cssText="font-size:.76rem;color:var(--muted);margin-top:2px";cc.querySelector(".bigsay").after(vs);
  if(!voice.ok){vs.innerHTML="<b style='color:var(--crit)'>هذا المتصفح لا يدعم النطق.</b> افتح رابط الجوال ليسمعه من حولك."}
  else{vs.textContent="🔊 أنطق الآن…";speak(say,{lang:"ar",force:true,rate:0.9}).then(()=>{const vi=arVoiceInfo();
      vs.innerHTML=voice.spoke&&!voice.err?"✓ نطقتها لمن حولك":(vi.total&&!vi.ar.length?"<b style='color:var(--crit)'>لا يوجد صوت عربي على هذا الجهاز.</b> في الآيفون: الإعدادات ← تسهيلات الاستخدام ← المحتوى المنطوق ← الأصوات ← العربية، ثم نزل صوتا.":voice.err?"لم يخرج صوت ("+esc(voice.err)+"). ارفع الصوت وأغلق الوضع الصامت ثم اضغط «أعد النطق».":"لم يخرج صوت. ارفع الصوت وأغلق الوضع الصامت ثم اضغط «أعد النطق» مرة واحدة.")+`<span style="opacity:.7"> · الأصوات: ${vi.total}، عربي: ${vi.ar.length}</span>`;listenYesNo(ps)})}
  cc.querySelector("[data-again]").addEventListener("click",()=>{vs.textContent="🔊 أنطق الآن…";speak(say,{lang:"ar",force:true,rate:0.9}).then(()=>{vs.textContent=voice.spoke&&!voice.err?"✓ نطقتها لمن حولك":"لم يخرج صوت: تأكد أن الجوال ليس صامتا وأن صوت عربي مثبت"})});
  cc.querySelector("[data-yes]").addEventListener("click",()=>{if(state.pendingSign===ps)state.pendingSign=null;confirmSign(ps)});
  cc.querySelector("[data-no]").addEventListener("click",()=>{if(state.pendingSign===ps)state.pendingSign=null;cancelSign(ps)});
}
function listenYesNo(ps){
  if(state.pendingSign!==ps)return;const SRC=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SRC||rec)return;
  let r;try{r=new SRC()}catch(_){return}r.lang="ar-SA";r.interimResults=false;r.maxAlternatives=3;
  const hudSet=t=>{if(ps.cam){const h=ps.cam.querySelector(".hud");if(h)h.textContent=t}};
  hudSet("أستمع لمن حولك: قل «نعم» أو «لا»، أو أشر بالإبهام");log("care","يستمع للتأكيد الصوتي","نعم أو لا من الضيف أو من حوله");
  const tip=document.createElement("div");tip.style.cssText="font-size:.78rem;color:var(--muted);margin-top:4px";tip.textContent="🎤 أستمع: قل نعم أو لا";ps.card.appendChild(tip);
  r.onresult=ev=>{let t="";for(const res of ev.results)for(let i=0;i<res.length;i++)t+=" "+res[i].transcript;log("care","سمع",t.trim());
    if(state.pendingSign!==ps)return;
    if(/نعم|ايوه|أيوه|اعتمد|تمام|\bاي\b|إي/.test(t)){state.pendingSign=null;confirmSign(ps)}
    else if(/\bلا\b|لأ|مو هذا|غلط/.test(t)){state.pendingSign=null;cancelSign(ps)}
    else hudSet("لم أفهم، قل نعم أو لا أو أشر بالإبهام")};
  r.onerror=()=>{tip.remove()};r.onend=()=>{tip.remove();if(state.pendingSign===ps)hudSet("بانتظار التأكيد: إبهام، أو زر نعم، أو قل نعم")};
  try{r.start()}catch(_){tip.remove()}
}
function confirmSign(ps){
  log("care","اعتمد الضيف الطلب","ينفذ: "+ps.ph2);
  const d=ps.card.querySelector(".acts");if(d)d.innerHTML=`<span style="color:var(--ok);font-weight:700">✓ اعتمد الطلب</span>`;
  if(ps.cam)ps.cam.querySelector(".hud").textContent="اعتمدت «"+ps.k+"»، أنفذ الطلب الآن";
  try{navigator.vibrate&&navigator.vibrate([60,40,60])}catch(_){}
  speak("تم، اعتمدت الطلب: "+ps.ph2,{lang:"ar",force:true,rate:0.95});
  setTimeout(()=>ask(ps.ph2),300);
}
function cancelSign(ps){
  log("care","لم يعتمد الإشارة","يعيد المحاولة");
  const d=ps.card.querySelector(".acts");if(d)d.innerHTML=`<span style="color:var(--muted)">ألغي، أعد الإشارة ببطء</span>`;
  if(ps.cam)ps.cam.querySelector(".hud").textContent="حسنا، أعد الإشارة ببطء أمام الكاميرا";
}
let camStream=null;
function stopCam(){if(gestLoop){cancelAnimationFrame(gestLoop);gestLoop=0}if(camStream){camStream.getTracks().forEach(t=>t.stop());camStream=null}}
async function openSignMode(){
  state.signMode=true;setInputMode("mSign");if(!profile.hearing){profile.hearing=1;saveProfile();renderKnown()}
  try{speechSynthesis.cancel()}catch(_){}
  try{if(voice.ok){const u=new SpeechSynthesisUtterance(" ");u.volume=0;u.lang="ar-SA";speechSynthesis.speak(u)}}catch(_){}
  log("care","وضع الإشارة: الكاميرا الأمامية","يقرأ الإشارة على الجهاز، وينطق حاجة الضيف بالعربي لمن حوله، ويرد عليه نصا واهتزازا");
  const c=card(head("🤟","وضع الإشارة","بث الكاميرا · على الجهاز")+`<div class="cam"><video autoplay muted playsinline></video><div class="ph">جار فتح الكاميرا الأمامية…</div><div class="dotrec"></div><div class="hud">أراقب يديك… أشر بحاجتك وأنطقها بالعربي لمن حولك، ثم إبهام = نعم</div></div><div style="font-size:.76rem;color:var(--muted);margin-top:6px">إيماءات العرض أمام الكاميرا: كف مفتوحة، قبضة، إبهام، إصبعان، سبابة لأعلى. أو محاكاة بالأزرار:</div><div class="signs">${SIGNS.map(([k])=>`<button type="button" data-sign="${k}">🤟 ${k}</button>`).join("")}</div><div class="acts"><button data-say="أبغى مكالمة فيديو مع المترجم">مترجم إشارة من الهيئة</button><button type="button" id="signOff">إيقاف الوضع</button></div>`);
  const v=c.querySelector("video"),ph=c.querySelector(".ph");
  const fire=(k,conf)=>{const ps=state.pendingSign;if(ps){if(k==="بخير"){state.pendingSign=null;log("care","إشارة الإبهام = نعم","يعتمد الطلب");confirmSign(ps);return}if(k==="مساعدة"){state.pendingSign=null;cancelSign(ps);return}}announceSign(k,conf,c)};
  try{camStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:false});v.srcObject=camStream;ph.remove();startGestures(v,c,fire)}
  catch(e){log("care","البث المباشر محجوب في هذا العارض ("+(e&&e.name||"")+")","بديل: لقطة من كاميرا الجوال");
    const inClaude=/claude\.ai|claudeusercontent/.test(location.hostname)||window!==window.top;ph.innerHTML=`<div>${inClaude?"الكاميرا المباشرة لا تعمل داخل صفحة Claude. افتحني من رابط الجوال ليشتغل البث:":"البث المباشر محجوب في هذا المتصفح."}</div>${inClaude?`<a class="chip" style="display:inline-block;margin-top:8px;text-decoration:none" href="https://soomabaradei-coder.github.io/KNF/#judge" target="_blank" rel="noopener">فتح نسخة الجوال</a>`:""}<div style="margin-top:8px">أو التقط إشارتك بكاميرا الجوال وسأقرؤها:</div><button type="button" class="chip" id="snapBtn" style="margin-top:8px;background:var(--gold);border-color:var(--gold);color:#1d1f1b">📷 التقط إشارة</button><input type="file" accept="image/*" capture="user" hidden id="snapIn">`;
    const si=ph.querySelector("#snapIn");ph.querySelector("#snapBtn").addEventListener("click",()=>si.click());
    si.addEventListener("change",ev=>{const f=ev.target.files&&ev.target.files[0];if(!f)return;const url=URL.createObjectURL(f);
      const img=document.createElement("img");img.src=url;img.alt="لقطة الإشارة";img.style.cssText="width:100%;height:100%;object-fit:cover;position:absolute;inset:0";v.replaceWith(img);ph.remove();
      c.querySelector(".hud").textContent="وصلت اللقطة. اختر الإشارة التي أديتها (محاكاة التعرف):";log("care","لقطة إشارة من كاميرا الجوال","التعرف محاكاة بالأزرار")})}
  c.querySelectorAll("[data-sign]").forEach(b=>b.addEventListener("click",()=>{const k=b.dataset.sign;const conf=(86+Math.floor(Math.random()*12));fire(k,conf)}));
  c.querySelector("#signOff").addEventListener("click",()=>{state.signMode=false;state.pendingSign=null;stopCam();c.querySelector(".hud").textContent="توقف الوضع";c.querySelector(".dotrec").remove();setInputMode("mText");log("care","أوقف وضع الإشارة","")})}
$("#mSign").addEventListener("click",()=>{if(state.signMode){setInputMode("mSign");return}openSignMode()});
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let rec=null;
/* التعرف على الكلام عبر البوابة (أي لغة ولهجة): تسجيل من الميكروفون ثم إرساله إلى /stt؛ اضغط الميكروفون للبدء ومرة أخرى للإرسال، أو يتوقف تلقائيا بعد 15 ثانية */
const CSTT={rec:null,chunks:[],timer:null,ok(){return LLM.ok()&&!state.offline&&!!window.MediaRecorder&&!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)},
  async start(){const b=$("#mVoice");const stream=await navigator.mediaDevices.getUserMedia({audio:true});const mt=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg"].find(t=>{try{return MediaRecorder.isTypeSupported(t)}catch(_){return false}})||"";
    this.chunks=[];this.rec=new MediaRecorder(stream,mt?{mimeType:mt}:undefined);this.rec.ondataavailable=e=>{if(e.data&&e.data.size)this.chunks.push(e.data)};
    this.rec.onstop=async()=>{stream.getTracks().forEach(t=>t.stop());clearTimeout(this.timer);b.classList.remove("rec");const blob=new Blob(this.chunks,{type:this.rec.mimeType||mt||"audio/webm"});this.rec=null;
      if(blob.size<1500){msg("sys",isEN()?"I did not hear anything. Tap the microphone and speak.":"لم أسمع شيئا، اضغط الميكروفون وتحدث");setInputMode("mText");return}
      box.placeholder=isEN()?"Understanding…":"أفهم ما قلت…";typing(true);
      try{const fd=new FormData();const ext=/mp4/.test(blob.type)?"m4a":/ogg/.test(blob.type)?"ogg":"webm";fd.append("audio",blob,"voice."+ext);const r=await fetch(LLM.url.replace(/\/$/,"")+"/stt",{method:"POST",body:fd});const j=await r.json();typing(false);
        if(j&&j.text){box.value=j.text;log("sup","إدخال صوتي عبر البوابة",j.text);ask(j.text)}else{msg("sys",isEN()?"I could not recognize the speech, please type your question.":"لم أستطع التعرف على الصوت، اكتب سؤالك من فضلك")}}
      catch(e){typing(false);msg("sys",isEN()?"Voice recognition is unavailable now, please type.":"التعرف الصوتي غير متاح الآن، اكتب سؤالك")}
      box.placeholder=isEN()?UI_EN.phDefault:"اكتب أو تحدث… مثل: وين أقرب عربة؟";setInputMode("mText")};
    this.rec.start();b.classList.add("rec");setInputMode("mVoice");box.placeholder=isEN()?"Listening… tap again to send":"أستمع إليك… اضغط مرة أخرى للإرسال";this.timer=setTimeout(()=>this.stop(),15000)},
  stop(){if(this.rec&&this.rec.state!=="inactive"){try{this.rec.stop()}catch(_){}}}};
$("#mVoice").addEventListener("click",async()=>{
  if(CSTT.rec){CSTT.stop();return}
  if(rec){try{rec.stop()}catch(_){}return}
  if(CSTT.ok()){try{await CSTT.start();return}catch(e){log("sup","الميكروفون غير متاح للبوابة ("+(e&&e.name||e)+")","يجرب تعرف المتصفح")}}
  if(!SR){msg("sys",isEN()?"Voice input is not available in this browser; please type your question.":"الإدخال الصوتي غير متاح في هذا المتصفح، اكتب سؤالك من فضلك");log("sup","لا تعرف صوتي في هذا المتصفح","");return}
  rec=new SR();rec.lang={ar:"ar-SA",fr:"fr-FR",en:"en-US",ur:"ur-PK",id:"id-ID",tr:"tr-TR"}[state.lang]||"ar-SA";rec.interimResults=true;rec.maxAlternatives=1;
  const b=$("#mVoice");b.classList.add("rec");setInputMode("mVoice");box.placeholder="أستمع إليك…";
  rec.onresult=ev=>{let t="";for(const r of ev.results)t+=r[0].transcript;box.value=t;if(ev.results[ev.results.length-1].isFinal){log("sup","إدخال صوتي",t);ask(t)}};
  rec.onerror=ev=>{if(ev.error==="no-speech"||ev.error==="aborted"){msg("sys",isEN()?"I did not hear anything. Tap the microphone and speak.":"لم أسمع شيئا، اضغط الميكروفون وتحدث");return}
    msg("sys",isEN()?"The microphone is not available here ("+ev.error+"); please type your question.":"الميكروفون غير متاح هنا ("+ev.error+")، اكتب سؤالك من فضلك");log("sup","تعذر الإدخال الصوتي",ev.error)};
  rec.onend=()=>{b.classList.remove("rec");box.placeholder=isEN()?UI_EN.phDefault:"اكتب أو تحدث… مثل: وين أقرب عربة؟";rec=null;setInputMode("mText")};
  try{rec.start()}catch(_){rec=null;b.classList.remove("rec")}});
function advanceStage(){if(state.site!=="madinah"){msg("sys","انقلي الموقع إلى المسجد النبوي أولا");return}
  const s=site();const [n,d]=s.places.saee[0];state.lastCat="saee";state.lastDest=n;state.lastDist=d;log("care","تنبيه: حان تحرك فوجك","اتبع المنظمين · العائلة أبلغت بنقطة اللقاء");try{navigator.vibrate&&navigator.vibrate([60,40,60])}catch(_){}
  card(head("🔔","حان تحرك فوجك","روضة · "+profile.rawdah.slot)+`<div>انهض على مهل واتبع المنظمين. باب السلام على بعد ${d} م. العائلة أُبلغت بنقطة اللقاء بعد الخروج.</div><div class="acts"><button class="primary" data-say="ابدأ الإرشاد إلى باب السلام">ابدأ الإرشاد</button><button data-say="أذكار وآداب الروضة">الأذكار</button></div>`,"wait");
  const F={fr:"C'est le moment de rejoindre votre groupe. Levez-vous tranquillement et suivez les organisateurs.",en:"It is time to move with your group. Get up slowly and follow the organisers.",ar:"حان تحرك فوجك. انهض على مهل واتبع المنظمين."};speak(F[profile.speakLang]||F.ar,{lang:profile.speakLang})}
$("#simRawdah").addEventListener("click",advanceStage);
$("#simThirst").addEventListener("click",()=>{wb.lastDrink=Date.now()-40*60000;wb.reminded=false;wbRender()});
$("#simPulse").addEventListener("click",()=>{health.src="sim";health.permitted=true;health.watch=true;health.hr=114;health.rr=19;health.spo2=96;health.moving=false;health.ts=Date.now();healthAsked=false;wbRender()});
$("#simSpo2").addEventListener("click",()=>{health.src="sim";health.permitted=true;health.watch=true;health.hr=104;health.rr=25;health.spo2=91;health.moving=false;health.ts=Date.now();healthAsked=false;wbRender()});
{const q=new URLSearchParams(location.search);const h=location.hash;state.judge=q.get("view")==="phone"||h==="#phone"||h==="#judge";
  if(state.judge){document.body.classList.add("judge");try{state.onboarded=localStorage.getItem("hafi.onboarded")==="1"}catch(_){state.onboarded=false}
    /* #judge يفتح المحادثة مباشرة بملف الضيف التجريبي؛ أسئلة التعريف تظهر فقط بـ ?onboard=1 أو ?fresh=1 */
    if(q.get("fresh")==="1"||q.get("onboard")==="1"){state.onboarded=false;try{localStorage.removeItem("hafi.onboarded");localStorage.removeItem("hafi.profile")}catch(_){}}else if(h==="#judge"&&q.get("calm")!=="0"){state.onboarded=true;try{localStorage.setItem("hafi.onboarded","1")}catch(_){}}}}
setNet();
LIVE.load();LIVE.refresh();setInterval(()=>LIVE.refresh(),60000);
setInterval(()=>{try{const r=state.real;if(r&&typeof r.la==="number")mashaerSense(r.la,r.lo)}catch(_){}},60000);
loadPrayerTimes();loadWeather();
window.__knf={state,renderLivePeers,livePeers,profile:()=>profile,addMates,groupMates,TOOLS,liveFamilyStart,setSite,get CALL(){return CALL},get EVT(){return EVT},get ACCT(){return ACCT}};
$("#simMed").addEventListener("click",()=>{const m=profile.meds[0];msg("agent","يا "+profile.name+"، حان موعد "+(m?m.name:"الدواء")+".");speak({fr:"C'est l'heure de votre médicament. Asseyez-vous et buvez un peu d'eau.",en:"It is time for your medicine. Sit down and drink some water.",ar:"حان موعد دوائك. اجلس واشرب قليلا من الماء."}[profile.speakLang]||"",{lang:profile.speakLang});TOOLS.medication.run({action:"due"})});
$("#simNoWatch").addEventListener("click",()=>{health.watch=!health.watch;health.permitted=health.watch;healthAsked=false;wbRender()});
$("#simPrayer").addEventListener("click",()=>{msg("sys","قبل العصر بعشرين دقيقة");prayerPlan()});
$("#resetBtn").addEventListener("click",()=>{stopSpeak();start()});
THR.load();THR.render();
$("#thrBtn").addEventListener("click",()=>{THR.render();$("#threads").hidden=!$("#threads").hidden;$("#sheet").hidden=true});
$("#thrClose").addEventListener("click",()=>{$("#threads").hidden=true});
$("#thrNew").addEventListener("click",()=>{$("#threads").hidden=true;stopSpeak();start()});
$("#thrList").addEventListener("click",e=>{const d=e.target.closest("[data-del]");if(d){THR.remove(d.dataset.del);return}const o=e.target.closest("[data-open]");if(o)THR.open(o.dataset.open)});
/* الجوال: عند فتح لوحة المفاتيح يصغر العرض المرئي ولا تصغر الصفحة؛ على الشاشات الضيقة نجعل الصفحة ثابتة بحجم العرض المرئي نفسه فيبقى حقل الكتابة فوق لوحة المفاتيح */
setTimeout(()=>{const vv=window.visualViewport;const scr=$(".screen");if(scr&&document.body.classList.contains("judge")){
  const narrow=()=>window.innerWidth<=520;
  /* لا نغير شيئا إلا إذا تغير القياس فعلا، حتى لا ترتجف الشاشة مع كل حدث تمرير */
  const ios=/iPhone|iPad|iPod/.test(navigator.userAgent||"")||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  let last="";let raf=0;const fit=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;if(!narrow()){if(document.body.classList.contains("mob")){document.body.classList.remove("mob","ios");document.body.style.height="";document.body.style.top="";last=""}return}
    if(ios){document.body.classList.add("mob","ios");return}
    const h=vv?Math.round(vv.height):window.innerHeight;const t=vv?Math.round(vv.offsetTop):0;const key=h+"/"+t;if(key===last&&document.body.classList.contains("mob"))return;const wasH=last.split("/")[0];last=key;
    document.body.classList.add("mob");document.body.style.height=h+"px";document.body.style.top=t+"px";if(String(h)!==wasH){try{if(window.scrollY)window.scrollTo(0,0)}catch(_){}setTimeout(()=>{feed.scrollTop=feed.scrollHeight},120)}})};
  if(vv){vv.addEventListener("resize",fit);vv.addEventListener("scroll",fit)}window.addEventListener("resize",fit);window.addEventListener("orientationchange",()=>setTimeout(fit,300));fit();
  box.addEventListener("focus",()=>{if(ios){setTimeout(()=>{try{box.scrollIntoView({block:"end",behavior:"smooth"})}catch(_){}},350);return}setTimeout(fit,300);setTimeout(fit,700)});box.addEventListener("blur",()=>{if(ios){setTimeout(()=>{try{window.scrollTo(0,0)}catch(_){}},200);return}setTimeout(fit,300)})}},0);
/* الوضع الهادئ افتراضي؛ ?calm=0 يعيد الواجهة الكاملة */
{const q=new URLSearchParams(location.search);const scr=$(".screen");if(scr&&isEN()){scr.setAttribute("dir","ltr");scr.classList.add("ltr")}if(scr&&q.get("calm")!=="0"){scr.classList.add("calm");
  const pop=$("#menuPop");["#resetBtn","#thrBtn","#voiceBtn","#sosBtn"].forEach(id=>{const el=$(id);if(el)pop.appendChild(el)});
  const lbl=isEN()?{"#resetBtn":"New chat","#thrBtn":"My chats","#voiceBtn":"Voice","#sosBtn":"Emergency"}:{"#resetBtn":"محادثة جديدة","#thrBtn":"محادثاتي","#voiceBtn":"الصوت","#sosBtn":"طوارئ"};Object.keys(lbl).forEach(id=>{const el=$(id);if(!el)return;const sp=document.createElement("span");sp.textContent=lbl[id];sp.style.flex="1";sp.style.textAlign="right";el.appendChild(sp)});
  const mb=$("#menuBtn");mb.addEventListener("click",e=>{e.stopPropagation();pop.hidden=!pop.hidden});document.addEventListener("click",e=>{if(!pop.hidden&&!pop.contains(e.target))pop.hidden=true});pop.addEventListener("click",e=>{if(e.target.closest("button")&&!e.target.closest("#voiceBtn"))pop.hidden=true});
  const pb=$("#plusBtn");if(pb)pb.addEventListener("click",()=>{pb.parentElement.classList.toggle("open")});}}
{const db=$("#dashOpen");if(db)db.addEventListener("click",()=>{if(/claude\.ai|claudeusercontent|usercontent/.test(location.hostname)){location.hash="#dash";location.reload();return}const u=location.pathname+"?dash=1";let w=null;try{w=window.open(u,"_blank","noopener")}catch(_){}if(!w){location.href=u}})}
$("#voiceBtn").addEventListener("click",()=>{voice.on=!voice.on;$("#voiceBtn").setAttribute("aria-pressed",voice.on);$("#voiceBtn").textContent=voice.on?"🔊":"🔇";if(!voice.on)stopSpeak();else speak({fr:"Le son est activé.",en:"Voice is on.",ar:"الصوت مفعل."}[profile.speakLang]||"الصوت مفعل.")});
if(voice.ok){try{speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=voiceStatus}catch(_){}}else{$("#voiceBtn").textContent="🔇";$("#voiceBtn").disabled=true;$("#voiceBtn").title="المتصفح لا يدعم النطق"}
$("#profBtn").addEventListener("click",()=>{$("#sheet").hidden=!$("#sheet").hidden});
$("#sheetClose").addEventListener("click",()=>{$("#sheet").hidden=true;start()});
$("#sheet").addEventListener("click",e=>{const b=e.target.closest(".opts button");if(!b)return;
  const grp=b.closest(".opts[data-pref]");
  if(grp){const k=grp.dataset.pref;profile[k]=(k==="kids")?Number(b.dataset.v):b.dataset.v}
  else{const k=b.dataset.pref;profile[k]=b.getAttribute("aria-pressed")==="true"?0:1}
  SRC[grp?grp.dataset.pref:b.dataset.pref]="أدخله بنفسه";profile.prefsStated=1;saveProfile();renderKnown()});
$("#famList").addEventListener("click",e=>{const sw=e.target.closest(".sw");const rm=e.target.closest(".rm");
  if(sw){const f=profile.family[Number(sw.dataset.i)];f.sharing=f.sharing?0:1}
  else if(rm){profile.family.splice(Number(rm.dataset.rm),1)}else return;
  SRC.family="أضافهم بنفسه";saveProfile();renderKnown()});
$("#famInvite").addEventListener("click",()=>{$("#sheet").hidden=true;ask("أضف فردا")});
$("#famAdd").addEventListener("click",()=>{$("#sheet").hidden=true;TOOLS.family_setup.run({})});
$("#homeAuto").addEventListener("click",()=>{const r=state.real;if(!r||typeof r.la!=="number"){msg("sys","لم يصلني موقعك بعد؛ اسمح بالموقع ثم اضغط «سكني هنا الآن».");return}const H=HOME();const nm=($("#pHome").value.trim())||("سكني: "+describePos(r.la,r.lo).text);Object.assign(H,{home:nm,la:+r.la.toFixed(5),lo:+r.lo.toFixed(5),confirmed:1,auto:0});$("#pHome").value=nm;SRC.home="حدده من موقعه";saveProfile();renderKnown();log("svc","حفظ السكن من موقع الجوال",nm);msg("sys","حفظت سكنك عند موقعك الحالي: "+nm+".")});
$("#pHome").addEventListener("change",e=>{const v=e.target.value.trim();const H=HOME();if(!v){H.home="";H.confirmed=0;delete H.la;delete H.lo}else{const hp=hotelOf(v);Object.assign(H,{home:v,confirmed:1,auto:0,la:hp?hp[1]:H.la,lo:hp?hp[2]:H.lo})}SRC.home="أدخله بنفسه";saveProfile();renderKnown()});
$("#pPhone")&&$("#pPhone").addEventListener("change",e=>{const ph=normPhone(e.target.value);if(!ph){$("#pPhoneSt").textContent="رقم غير مكتمل";return}if(ph!==profile.phone){profile.phone=ph;profile.phoneVerified=0;$("#pPhoneSt").textContent="غير مؤكد";saveProfile();renderKnown()}});
$("#pCamp")&&$("#pCamp").addEventListener("change",e=>{const cf=campFind(e.target.value);profile.campaign=cf?cf.n:campName(e.target.value);e.target.value=profile.campaign;profile.campaignAsked=1;saveProfile();renderKnown();if(cf)showCampCard(cf)});
$("#pCampPh")&&$("#pCampPh").addEventListener("change",e=>{const ph=normPhone(e.target.value);profile.campaignPhone=ph||"";e.target.value=profile.campaignPhone;saveProfile();renderKnown();log("svc",ph?"حفظ رقم الحملة من صفحة المعلومات":"حذف رقم الحملة","")});
$("#pEmail")&&$("#pEmail").addEventListener("change",e=>{const em=(e.target.value.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)||[])[0]||"";profile.email=em;saveProfile();renderKnown()});
$("#pName").addEventListener("change",e=>{profile.selfNamed=true});
$("#pName").addEventListener("change",e=>{profile.name=e.target.value.trim()||DEFAULT_PROFILE.name;saveProfile();renderKnown()});
$("#pAge").addEventListener("change",e=>{profile.age=Number(e.target.value)||0;profile.basicsStated=1;saveProfile();renderKnown()});
$("#pGender")&&$("#pGender").addEventListener("change",e=>{profile.gender=e.target.value;profile.genderStated=1;saveProfile();renderKnown()});
function clock(){const d=new Date();let l="ar-SA";try{const u=uiLang();l=u==="ar"?"ar-SA":u==="fr"?"fr-FR":"en-GB"}catch(_){}$("#clock").textContent=d.toLocaleTimeString(l,{hour:"2-digit",minute:"2-digit"})}
clock();setInterval(clock,30000);setInterval(wbRender,30000);

