/* ---------- offline mode: essentials on the device, outbound requests queued ---------- */
const OUTBOUND={request_cart:"طلب العربة",report_lost:"بلاغ التائه",book_children_center:"حجز مركز الأطفال",book_visit:"حجز الزيارة",share_location:"مشاركة الموقع",set_meeting_point:"نقطة اللقاء للعائلة",sign_interpreter:"طلب مترجم الإشارة"};
const netq=[];let liveWas=null;
// كيف تتغير كل خدمة بلا اتصال: local تعمل على الجهاز، map من الخريطة المحملة مسبقا، cached آخر قراءة محفوظة، queue تحفظ وترسل لاحقا، phone اتصال هاتفي، off تحتاج اتصالا
const OFFLINE={get_density:["cached","آخر قراءة كثافة محفوظة"],get_prayer_hall_occupancy:["cached","آخر إشغال محفوظ"],find_nearest:["map","من الخريطة المحملة مسبقا"],show_map:["map","من الخريطة المحملة مسبقا"],survey:["local","يحفظ التقييم على الجهاز"],explain_context:["local","من ملفك على الجهاز"],mutawwif:["local","الأدعية والعداد محفوظان على الجهاز"],go_home:["map","من الخريطة المحملة وتحديد الموقع"],start_guidance:["map","إرشاد بتحديد الموقع بلا إنترنت"],plan_prayer:["cached","مواقيت محفوظة وآخر إشغال"],
 request_cart:["queue"],report_lost:["queue"],book_children_center:["queue"],book_visit:["queue"],share_location:["queue"],set_meeting_point:["queue"],sign_interpreter:["queue"],track_request:["cached","آخر حالة محفوظة للطلب"],
 sermon_translation:["off","البث والترجمة يحتاجان اتصالا"],play_stream:["off","البث يحتاج اتصالا"],get_lessons_and_prayers:["cached","جدول الدروس المحفوظ"],rawdah_permit:["cached","تصريحك محفوظ على الجهاز"],accessibility_services:["map","من الخريطة المحملة"],
 family_locate:["cached","آخر موقع معروف لكل فرد"],emergency:["phone","اتصال هاتفي مباشر، وتنبيه العائلة يرسل حين يعود الإنترنت"],
 update_preferences:["local"],confirm_home:["local"],medication:["local"],set_reminder:["local"],set_mind_ok:["local"],reset_body:["local"],wellbeing_checkin:["local"],hydration_rest:["local"],waiting_mode:["cached","موعدك محفوظ؛ التنبيه بالتفويج يحتاج اتصالا"],start_breathing:["local"],rawdah_guide:["local"]};
const OFFLINE_LABEL={local:"يعمل على الجهاز",map:"من الخريطة المحملة",cached:"بيانات محفوظة قبل الانقطاع",queue:"يحفظ ويرسل عند عودة الاتصال",phone:"اتصال هاتفي",off:"يحتاج اتصالا"};
function offlineBadge(mode,note){const last=feed.lastElementChild;if(!last||!last.classList.contains("card"))return;const c={local:"var(--ok)",map:"var(--info)",cached:"var(--warn)",queue:"var(--warn)",phone:"var(--crit)",off:"var(--crit)"}[mode];
  last.insertAdjacentHTML("beforeend",`<div style="margin-top:8px;font-size:.74rem;color:${c};border-top:1px dashed var(--line);padding-top:6px">📶 بلا اتصال: ${esc(OFFLINE_LABEL[mode])}${note?" · "+esc(note):""}</div>`)}
function netOffline(){return state.forceOffline||!navigator.onLine}
function setNet(){const off=netOffline();const el=$("#net");
  if(off){if(!state.offline){state.offline=true;state.offlineAt=Date.now();liveWas=state.sample;state.sample=null;setMode(false);log("sup","انقطع الاتصال: وضع بلا اتصال","الملف والشريط والتنفس والخريطة المحملة تعمل على الجهاز؛ الطلبات الخارجية تحفظ وترسل لاحقا");
      msg("sys","انقطع الاتصال. أعمل بالضروري على جهازك.");if(loadPlan()){log("nav","خطة الرحلة المحفوظة تظهر تلقائيا","بلا اتصال");setTimeout(()=>planCard(true),300)}
      card(head("📶","كيف تتغير الخدمات بلا اتصال","دائما جاهزون")+`<dl class="kv"><dt style="color:var(--ok)">يعمل على الجهاز</dt><dd>ملفك، شريط الحالة، الماء والراحة، التنفس والطمأنة، تذكير الدواء</dd><dt style="color:var(--info)">من الخريطة المحملة</dt><dd>أقرب عربة أو زمزم أو مصلى، والطريق إلى السكن بتحديد الموقع</dd><dt style="color:var(--warn)">بيانات محفوظة</dt><dd>الكثافة والإشغال والمواقيت وآخر موقع للعائلة، مع وقت آخر تحديث</dd><dt style="color:var(--warn)">يحفظ ويرسل لاحقا</dt><dd>العربة، البلاغات، الحجوزات، نقطة اللقاء، المترجم</dd><dt style="color:var(--crit)">اتصال هاتفي</dt><dd>الطوارئ 911 والهلال الأحمر 997 من زر SOS</dd><dt style="color:var(--crit)">يحتاج اتصالا</dt><dd>البث والترجمة الحية؛ أذكرك بها عند عودته</dd></dl>`);
      renderQuick()}
    el.hidden=false;el.className="net";$("#netText").textContent="بلا اتصال: أعمل بالضروري على جهازك"+(netq.length?" · "+netq.length+" طلب معلق":"")}
  else if(state.offline){state.offline=false;if(liveWas){state.sample=liveWas;setMode(true)}
    const sent=netq.splice(0);el.hidden=false;el.className="net ok";$("#netText").textContent="عاد الاتصال"+(sent.length?"، أرسلت: "+sent.map(x=>x.label).join("، "):"");
    log("sup","عاد الاتصال",sent.length?"أرسلت الطلبات المعلقة: "+sent.map(x=>x.label).join("، "):"لا طلبات معلقة");
    if(sent.length)msg("sys","عاد الاتصال وأرسلت لك: "+sent.map(x=>x.label).join("، ")+".");renderQuick();
    setTimeout(()=>{if(!state.offline)el.hidden=true},5000)}}
window.addEventListener("online",setNet);window.addEventListener("offline",setNet);
function setForceOffline(v){state.forceOffline=!!v;const b=$("#simNet");if(b){b.setAttribute("aria-pressed",state.forceOffline?"true":"false");b.textContent=state.forceOffline?"رجع الإنترنت":"انقطع الإنترنت"}
  document.querySelectorAll("[data-net]").forEach(x=>x.setAttribute("aria-pressed",(x.dataset.net==="off")===state.forceOffline?"true":"false"));setNet()}
$("#simNet").addEventListener("click",()=>setForceOffline(!state.forceOffline));
const EMG={
 medical:{name:"طبي",icon:"🩺",to:"المركز الطبي للهيئة والهلال الأحمر",tel:"997",telName:"الهلال الأحمر",body:1,place:s=>s.places.medical[0]},
 security:{name:"أمني",icon:"🛡️",to:"أمن الحرم ومكتب التائهين",tel:"911",telName:"الطوارئ الموحد",body:0,place:s=>s.places.lost[0]},
 fire:{name:"حريق أو خطر",icon:"🔥",to:"الدفاع المدني وأمن الحرم",tel:"998",telName:"الدفاع المدني",body:0,place:s=>s.places.gate[0]},
 unknown:{name:"طوارئ",icon:"🆘",to:"غرفة عمليات الحرم",tel:"911",telName:"الطوارئ الموحد",body:1,place:s=>s.places.medical[0]}};
/* تفويج الروضة خطوة خطوة (الإصدار 209، طلب سمية): شريط تقدم من التحقق من الموعد إلى دخول الروضة.
   لا تصل كنف بيانات التفويج من الهيئة بعد، فيتقدم الشريط بضغطة الضيف أو بقوله (تحققوا من موعدي، مسحوا الرمز، دخلت الروضة) */
const RW_STEPS=[["التحقق من الموعد","الموعد"],["مسح رمز التصريح","الرمز"],["محطات الانتظار","الانتظار"],["دخول الروضة","الروضة"]];
function rwState(){const r=profile.rawdah||(profile.rawdah={});if(!r.flowT||Date.now()-r.flowT>6*3600000){r.stage=0;r.stations=0;r.waitShown=0;r.clip=0;r.flowT=Date.now()}return r}
function rawdahFlow(act){const r=rwState();const f=profile.gender==="f";
  if(act==="next")r.stage=Math.min(4,(r.stage||0)+1);else if(act==="station"){r.stage=Math.max(r.stage||0,2);r.stations=(r.stations||0)+1}else if(typeof act==="number")r.stage=Math.max(r.stage||0,act);else if(act==="reset"){r.stage=0;r.stations=0;r.waitShown=0;r.clip=0}
  r.flowT=Date.now();saveProfile();const st=r.stage||0;const slot=r.slot||"";
  const tip=[(f?"احضري":"احضر")+" قبل موعدك بنصف ساعة إلى الساحات أمام باب مكة (37)، وهناك يتحقق المنظمون من موعدك"+(slot?" ("+slot+")":"")+".",
    (f?"جهزي":"جهز")+" تصريحك في نسك على الجوال، وارفع سطوع الشاشة ليمسح الرمز.",
    (f?"تنتقلين":"تنتقل")+" مع فوجك بين محطات الانتظار حتى يحين دورك"+(r.stations?" (مررت بـ"+r.stations+")":"")+". "+(f?"اجلسي واشربي":"اجلس واشرب")+"، وأكثر من الصلاة على النبي.",
    "حان دورك. "+(f?"ادخلي بسكينة، وصلي":"ادخل بسكينة، وصل")+" ما تيسر، وأفسح لغيرك.",
    "تقبل الله منك. "+(f?"اخرجي":"اخرج")+" من الجهة التي يوجهك إليها المنظمون."][st];
  const nextLab=["تحققوا من موعدي","مسحوا الرمز","",(f?"دخلت الروضة":"دخلت الروضة")][st];
  const pct=Math.round(st/4*100);
  const star=`<svg viewBox="0 0 24 24" aria-hidden="true"><polygon class="o" points="12,0.5 15.37,3.87 20.13,3.87 20.13,8.63 23.5,12 20.13,15.37 20.13,20.13 15.37,20.13 12,23.5 8.63,20.13 3.87,20.13 3.87,15.37 0.5,12 3.87,8.63 3.87,3.87 8.63,3.87"/><polygon class="n" points="12,5 16.95,7.05 19,12 16.95,16.95 12,19 7.05,16.95 5,12 7.05,7.05"/></svg>`;
  const steps=RW_STEPS.map((x,i)=>`<span class="${i<st?"done":i===st?"now":""}"><b>${star}<em>${i<st?"✓":i+1}</em></b>${esc(x[1])}</span>`).join("");
  const html=head("🕌",st>=4?"وصلت الروضة الشريفة":RW_STEPS[st][0],st>=4?"اكتمل التفويج":"خطوة "+(st+1)+" من 4")+`<div class="rwtrack"><div class="rwbar" role="progressbar" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${st}"><i style="width:${Math.round(Math.min(st,3)/3*100)}%"></i></div><div class="rwsteps">${steps}</div></div><div style="margin-top:8px">${esc(tip)}</div><div class="acts">${st===2?`<button type="button" class="primary" data-rw="station">انتقلت لمحطة</button><button type="button" data-rw="3">نادوا فوجي</button><button type="button" data-rwwait="1">🎧 وأنت تنتظر</button>`:st<4?`<button type="button" class="primary" data-rw="next">${esc(nextLab)}</button>`:`<button type="button" class="primary" data-say="أذكار وآداب الروضة">آداب الروضة</button>`}</div>`;
  let c=state.rwCard;if(c&&c.isConnected){c.classList.toggle("rwend",st>=4);c.innerHTML=html;feed.appendChild(c);try{TRX.el(c)}catch(_){}scrollBottom()}else{c=card(html,"rwflow"+(st>=4?" rwend":""));state.rwCard=c}
  log("care","تفويج الروضة: "+(st>=4?"وصل الروضة":RW_STEPS[st][0]),"بضغطة الضيف أو قوله · لا بيانات تفويج من الهيئة بعد");
  if(st>=4&&act!==undefined)try{speak("تقبل الله منك.",{lang:"ar"})}catch(_){}
  if(st===2&&!r.waitShown){r.waitShown=1;r.clipT=Date.now();saveProfile();setTimeout(()=>{try{rwWaitCard()}catch(_){}},400)}
  return{stage:st}}
/* وقت الانتظار في محطات الروضة (الإصدار 211، طلب سمية): مقاطع توعوية قصيرة من مصادر الهيئة والوزارة تسمع بصوت كنف، ونشاط التنفس.
   أول ما يصل الضيف محطات الانتظار تصله بطاقة «وأنت تنتظر»، ثم مقطع جديد كل 8 دقائق ما دام في الانتظار. لا يشغل الصوت إلا بضغطة الضيف */
const RW_CLIPS=[
 {t:"آداب الروضة",src:"as",x:"في الروضة صل ركعتين إن وجدت مكانا، وادع بدعاء قصير، ثم أفسح لمن بعدك. وتجنب مزاحمة المصلين ورفع الصوت، والتزم توجيهات العاملين."},
 {t:"السلام على النبي",src:"as",x:"تقف تجاه القبر بأدب وخفض صوت وتقول: السلام عليك يا نبي الله ورحمة الله وبركاته. ثم تتحرك عن يمينك قليلا وتسلم على أبي بكر الصديق، ثم على عمر بن الخطاب رضي الله عنهما."},
 {t:"آداب المسجد النبوي",src:"an",x:"تجنب مزاحمة المصلين، والجلوس أو الصلاة في الممرات، والتمسح بالأبواب والجدران. واستقبل القبلة عند الدعاء."},
 {t:"الماء والراحة",src:"uv",x:"خذ قسطا من الراحة عند التعب، وأكثر من شرب السوائل، ولا تنتظر العطش في الحر."}];
function rwClipCard(i){const c0=RW_CLIPS[i%RW_CLIPS.length];const src=KSRC[c0.src]||{};const r=rwState();r.clip=(i%RW_CLIPS.length)+1;saveProfile();
  card(head("🎧",c0.t,"مقطع توعوي · "+(src.n||""))+`<div class="clipt">${esc(c0.x)}</div><div class="acts"><button type="button" class="primary" data-rwplay="1">▶ استمع</button><button type="button" data-rwclip="${(i+1)%RW_CLIPS.length}">التالي</button><button type="button" data-rwbreath="1">🫧 تنفس معي</button></div>${src.u?`<div class="muted" style="font-size:.72rem">المصدر: <a href="${esc(src.u)}" target="_blank" rel="noopener">${esc(src.o||src.n)}</a></div>`:""}`,"rwclip");
  log("rite","مقطع توعوي أثناء انتظار الروضة",c0.t+" · "+(src.n||""))}
function rwWaitCard(){const f=profile.gender==="f";
  card(head("⏳","وأنت تنتظر","محطات الانتظار")+`<div>${f?"اختاري":"اختر"} ما يريحك حتى يحين دورك:</div><div class="acts" style="flex-direction:column;align-items:stretch">${RW_CLIPS.map((c0,i)=>`<button type="button" data-rwclip="${i}">🎧 ${esc(c0.t)}</button>`).join("")}<button type="button" class="primary" data-rwbreath="1">🫧 تنفس معي دقيقة</button></div>`,"rwwait");
  log("care","وقت الانتظار في الروضة: مقاطع توعوية وتنفس","يرسل مقطعا جديدا كل 8 دقائق ما دام في الانتظار")}
function rwPlay(btn){const c=btn.closest(".card");const el=c&&c.querySelector(".clipt");if(!el)return;const t=el.textContent.trim();try{stopSpeak()}catch(_){}speak(t,{lang:/[\u0600-\u06FF]/.test(t)?"ar":uiLang()})}
setInterval(()=>{try{const r=profile.rawdah;if(!r||r.stage!==2||!state.rwCard||!state.rwCard.isConnected||state.busy)return;if(Date.now()-(r.clipT||0)<8*60000)return;r.clipT=Date.now();rwClipCard(r.clip||0)}catch(_){}},60000);
/* أجهزة بلا شريحة اتصال (تابلت أو حاسب) (الإصدار 217): زر الاتصال يعرض الرقم كبيرا، وواتساب للأرقام الجوالة، ونسخ الرقم.
   أرقام الطوارئ القصيرة لا تعمل على واتساب، فيقول كنف اتصل من أي جوال قريب أو اطلب من أقرب منظم */
const NO_TEL=(()=>{try{const u=navigator.userAgent;const ipad=/iPad/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1);const andTab=/Android/.test(u)&&!/Mobile/.test(u);const desk=!/Android|iPhone|iPad|iPod|Mobile/.test(u)&&!(navigator.maxTouchPoints>1);return ipad||andTab||desk}catch(_){return false}})();
function waNum(p){let d=String(p||"").replace(/[٠-٩]/g,c=>"٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/[^\d+]/g,"");if(d.startsWith("+"))d=d.slice(1);else if(d.startsWith("00"))d=d.slice(2);else if(/^05\d{8}$/.test(d))d="966"+d.slice(1);else if(/^5\d{8}$/.test(d))d="966"+d;return /^\d{10,15}$/.test(d)&&!/^(800|920)/.test(d)?d:""}
function telCard(num){const n=String(num||"").trim();const digits=n.replace(/\D/g,"");const wa=waNum(n);const short=digits.length<=5;const f=profile.gender==="f";
  log("svc","اتصال من جهاز بلا شريحة",n+(wa?" · واتساب متاح":short?" · رقم طوارئ قصير":""));
  card(head("📞",(f?"اتصلي":"اتصل")+" بـ"+n,"هذا الجهاز بلا شريحة اتصال")+`<div class="big notr" dir="ltr" style="font-family:var(--display);font-size:2.4rem;font-weight:800;text-align:center;letter-spacing:.06em;color:var(--kiswa)">${esc(n)}</div><div>${short?"رقم طوارئ: "+(f?"اتصلي":"اتصل")+" به من أي جوال قريب، أو "+(f?"اطلبي":"اطلب")+" من أقرب منظم.":wa?(f?"اتصلي":"اتصل")+" به من جوالك، أو عبر واتساب بالإنترنت.":(f?"اتصلي":"اتصل")+" به من جوالك."}</div><div class="acts">${wa?`<a class="btn primary" href="https://wa.me/${wa}" target="_blank" rel="noopener">واتساب</a>`:""}<button type="button" data-telcopy="${esc(n)}">انسخ الرقم</button><a class="btn" href="tel:${esc(digits||n)}">اتصل من هذا الجهاز</a></div>`,"telcard")}
document.addEventListener("click",e=>{if(!NO_TEL)return;const a=e.target.closest('a[href^="tel:"]');if(!a||a.closest(".telcard"))return;e.preventDefault();e.stopPropagation();let n=a.getAttribute("href").slice(4);try{n=decodeURIComponent(n)}catch(_){}telCard(n)},true);
/* الحشود في المشاعر: الهيئة لا تنشر كثافة حية للمشاعر، فيبني كنف على تفويج الحملة ونصائح الأدلة التوعوية */
const CROWD_TIPS={jamarat:["ارم في وقت التفويج المحدد لحملتك ومن الدور المحدد لها، والتزم بتوجيهات رجال الأمن.","اقترب من الجهة الأقل زحاما، ولا تتوقف بعد الرمي في مسار المشاة.","إن شق عليك الزحام فوكل من يرمي عنك."],
 mina:["لا تخرج من المخيم إلا للضرورة ومع رفقة، وأبلغ مشرف الحملة.","تحرك إلى الجمرات مع حملتك في وقت تفويجها، لا منفردا."],
 arafat:["ابق في مخيمك؛ عرفة كلها موقف ولا يلزمك صعود الجبل.","انفر إلى مزدلفة مع حملتك بعد الغروب وبوسيلتها المحددة، ولا تنفر منفردا."],
 muzdalifah:["ابق في حدود مكان حملتك، والتزم بموعد انصرافها.","لا تبحث عن الحصى في مسارات المشاة."]};
function crowdMashaer(z){const c=campFind(profile.campaign);let nx=null;try{nx=schedNext()}catch(_){}const sm=c&&c.schedMeta&&c.schedMeta.sample;
  log("nav","الحشود في "+z.n,"لا قراءة كثافة حية للمشاعر · تفويج الحملة والأدلة");
  card(head("👥","الحشود في "+z.n,"تفويج الحملة يقيك الزحام")+(nx?`<div class="best"><b>تفويج حملتك القادم:</b> ${esc(schedSay(nx))}${sm?" (جدول مقترح للعرض)":""}</div>`:"")+`<ul style="margin:8px 0;padding-inline-start:20px">${(CROWD_TIPS[z.k]||[]).map(t=>`<li>${esc(t)}</li>`).join("")}</ul><div class="muted">لا تصلني قراءة كثافة حية للمشاعر، فلا أعطيك رقما من عندي.</div><div class="acts">${c?`<button type="button" class="primary" data-say="ما هي خطة ${esc(c.n)}؟">جدول الحملة</button><button type="button" data-say="اتصل بحملة ${esc(c.n)}">اتصل بالحملة</button>`:""}</div>`);
  return{zone:z.k}}
/* الطوارئ بصدق (الإصدار 208): كنف لا يبلغ جهة رسمية تلقائيا بعد، فيضع الاتصال أولا، ويرسل موقع الضيف فعلا لعائلته المتصلة في كنف، ويهيئ رسالة بموقعه لمن يختار، ويدل على أقرب مركز. لا يكتب «الفريق في الطريق» */
function sosAct(type,desc){const ty=EMG[type]||EMG.unknown;if(ty.body)wb.body="pain";try{wbRender()}catch(_){}
  const r=state.real&&typeof state.real.la==="number"?state.real:null;const fam=(state.room&&state.peers)?state.peers.length:0;
  state.sos={type:type||"unknown",name:profile.name&&profile.name!=="ضيف الرحمن"?profile.name:"",t:Date.now(),la:r?+r.la.toFixed(5):null,lo:r?+r.lo.toFixed(5):null};if(state.pushPresence)try{state.pushPresence()}catch(_){}
  const [n,,w]=ty.place(site());const cc=(typeof campContact==="function")?campContact():null;
  const where=r?describePos(r.la,r.lo).text:"";const mapU=r?"https://maps.google.com/?q="+r.la.toFixed(5)+","+r.lo.toFixed(5):"";
  state.sosBody="أحتاج مساعدة عاجلة ("+ty.name+")."+(r?" أنا "+where+". موقعي: "+mapU:"");
  log("care","طوارئ "+ty.name+": الاتصال أولا","تنبيه العائلة في كنف: "+fam+" · لا بلاغ رسمي تلقائي");
  const btn=(h,t,pri)=>`<a class="btn${pri?" primary":""}" href="${h}" style="text-align:center;padding:9px 14px;font-size:.9rem;font-weight:700;${pri?"background:var(--crit);border-color:var(--crit)":""}">${t}</a>`;
  card(head(ty.icon,"اتصل الآن "+ty.tel,ty.telName)+`<div class="acts" style="flex-direction:column;align-items:stretch">${btn("tel:"+ty.tel,"📞 اتصل "+ty.tel+" "+esc(ty.telName),1)}${cc&&cc.phone?btn("tel:"+esc(cc.phone),"📞 "+esc(cc.name)):""}<button type="button" data-sosshare="1" style="padding:9px 14px;font-size:.9rem">📍 أرسل موقعي برسالة</button></div>
    <dl class="kv"><dt>عائلتك</dt><dd>${fam?"وصلهم تنبيه بموقعك في كنف":"غير متصلين في كنف الآن"}</dd><dt>موقعك</dt><dd>${r?esc(where):"لم يصلني موقع جوالك"}</dd><dt>الأقرب</dt><dd>${esc(n)}، ${esc(w)}</dd></dl>
    <div class="muted">كنف لا يبلغ الجهات الرسمية تلقائيا، فاتصل.</div><div class="acts"><button type="button" data-sosok="1">أنا بخير الآن</button></div>`,"alert crit");
  return{call:ty.tel,call_name:ty.telName,campaign_phone:cc&&cc.phone||null,family_alerted:fam,official_report_sent:false,location_known:!!r,nearest:n}}
function sosShare(){const t=state.sosBody||"أحتاج مساعدة عاجلة.";if(navigator.share){navigator.share({text:t}).catch(()=>{});return}location.href="sms:?&body="+encodeURIComponent(t)}
function sosOk(){state.sos=null;if(state.pushPresence)try{state.pushPresence()}catch(_){}if(wb.body==="pain")wb.body="ok";try{wbRender()}catch(_){}log("care","الضيف بخير بعد الطوارئ","أوقف تنبيه العائلة");msg("sys","الحمد لله. أوقفت تنبيه عائلتك.")}
/* عند فرد العائلة: يصله تنبيه طوارئ من فرده في كنف بموقعه وزر الاتصال */
function sosIncoming(p){const pr=p.presence||{};const s0=pr.sos;if(!s0||!s0.t||Date.now()-s0.t>30*60000)return;state.sosSeen=state.sosSeen||{};if((state.sosSeen[p.peer]||0)>=s0.t)return;state.sosSeen[p.peer]=s0.t;
  const ty=EMG[s0.type]||EMG.unknown;const f=pr.g==="f";const who=String(s0.name||pr.name||"")||(f?"فردة من عائلتك":"فرد من عائلتك");const has=typeof s0.la==="number"&&typeof s0.lo==="number";
  const me=state.real&&typeof state.real.la==="number"?state.real:null;const dist=has&&me?Math.round(kmBetween(me.la,me.lo,s0.la,s0.lo)*1000):null;
  log("care","تنبيه طوارئ من "+who,ty.name+(has?" · موقعه معروف":""));
  card(head("🆘",who+(f?" تحتاج":" يحتاج")+" مساعدة","طوارئ "+ty.name)+`<div>${has?(f?"موقعها: ":"موقعه: ")+esc(describePos(s0.la,s0.lo).text)+(dist!==null?" · "+fmtD(dist)+" "+dirOf(me.la,me.lo,s0.la,s0.lo)+" منك":""):(f?"لم يصل موقعها.":"لم يصل موقعه.")}</div><div class="acts">${pr.ph?`<a class="btn primary" href="tel:${esc(pr.ph)}">📞 ${f?"اتصل بها":"اتصل به"}</a>`:""}${has?`<a class="btn" href="https://maps.google.com/?q=${s0.la},${s0.lo}" target="_blank" rel="noopener">🗺️ ${f?"موقعها":"موقعه"}</a>`:""}<a class="btn" href="tel:${ty.tel}">📞 ${ty.tel}</a></div>`,"alert crit");
  try{speak(who+(f?" تحتاج":" يحتاج")+" مساعدة.",{lang:"ar"})}catch(_){}}
function sosGuess(){const hs=healthSignals();if(wb.body==="pain"||hs.some(x=>x.sev>=1))return "medical";if(wb.mind==="stressed"&&(state.lastText||"").match(/ضاع|ضايع|تاه|طفل|ولدي|بنتي|سرق/))return "security";return null}
$("#sosBtn").addEventListener("click",()=>{stopSpeak();const g=sosGuess();log("care","زر الطوارئ","فرز بضغطة واحدة"+(g?" · ترجيح تلقائي: "+EMG[g].name:"")+(state.offline?" · بلا اتصال: اتصال هاتفي":""));
  const c=card(head("🆘","ما نوع الحالة؟","لأعطيك الرقم الصحيح")+`<div>${g?"بحسب حالتك أرجح: <b>"+EMG[g].name+"</b>. ":""}إن لم تستطع الاختيار اضغط الأخير.</div><div class="acts" style="flex-direction:column"><button type="button" class="primary" data-emg="medical" style="background:var(--crit);border-color:var(--crit)">🩺 طبي: إغماء، ألم، إصابة</button><button type="button" data-emg="security">🛡️ أمني: ضياع طفل، سرقة، اعتداء</button><button type="button" data-emg="fire">🔥 حريق أو خطر</button><button type="button" data-emg="unknown">🆘 لا أعرف</button></div>`,"alert crit");
  if(g){const b=c.querySelector(`[data-emg="${g}"]`);b.style.boxShadow="0 0 0 3px var(--gold)"}
  c.querySelectorAll("[data-emg]").forEach(b=>b.addEventListener("click",()=>{const type=b.dataset.emg;c.remove();sosFire(type)}))});
function sosFire(type){const ty=EMG[type]||EMG.unknown;
  if(state.offline){card(head(ty.icon,"اتصل الآن "+ty.tel,"لا إنترنت")+`<div>لا إنترنت الآن، فالاتصال الهاتفي يعمل.</div><div class="acts"><a class="btn primary" href="tel:${ty.tel}" style="background:var(--crit);border-color:var(--crit);font-weight:700">📞 ${ty.tel} ${esc(ty.telName)}</a><a class="btn" href="tel:911">📞 911</a></div>`,"alert crit");netq.push({name:"emergency",label:"تنبيه عائلتك بموقعك",input:{description:"زر الطوارئ",type},at:Date.now()});setNet();return}
  msg("user","طوارئ: "+ty.name);TOOLS.emergency.run({description:"ضغط زر الطوارئ: "+ty.name,type});
  msg("bot","اتصل الآن بـ"+ty.tel+". ابق مكانك، وإن استطعت اجلس في الظل. أنا معك.");
  speak({fr:"Appelez maintenant le "+ty.tel+". Restez où vous êtes.",en:"Call "+ty.tel+" now. Stay where you are.",ar:"اتصل الآن بـ"+ty.tel+". ابق مكانك."}[profile.speakLang]||"",{lang:profile.speakLang})}

document.addEventListener("click",e=>{const b=e.target.closest("[data-net]");if(!b)return;setForceOffline(b.dataset.net==="off")});
for(const name of Object.keys(OFFLINE)){const t=TOOLS[name];if(!t)continue;const [mode,note]=OFFLINE[name];const orig=t.run.bind(t);const label=OUTBOUND[name]||name;
  t.run=function(input){
    if(!state.offline)return orig(input||{});
    if(mode==="off"){log("care","بلا اتصال: "+name+" غير متاح",note||"");card(head("📶","تحتاج اتصالا",OFFLINE_LABEL.off)+`<div>${esc(note||"هذه الخدمة تحتاج إنترنت")}. سأذكرك بها أول ما يرجع الاتصال.</div>`);netq.push({name,label:"تذكير: "+({play_stream:"البث",sermon_translation:"ترجمة الخطبة"}[name]||name),input,at:Date.now()});setNet();return{offline:true,unavailable:true}}
    if(mode==="phone"&&name==="emergency"){sosFire((input&&input.type)||"unknown");return{offline:true,phone:true}}
    const r=orig(input||{});
    if(mode==="queue"){netq.push({name,label,input,at:Date.now()});offlineBadge(mode,"الطلب محفوظ على جهازك");log("sup","طلب معلق: "+label,"يرسل عند عودة الاتصال");setNet()}
    else{offlineBadge(mode,note);log("sup","بلا اتصال: "+name,OFFLINE_LABEL[mode]+(note?" · "+note:""))}
    return r}}
form.addEventListener("submit",e=>{e.preventDefault();ask(box.value)});
