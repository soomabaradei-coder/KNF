/* ---------- offline trip plan: built while online from intent + profile, stored on device, shown whenever the network drops ---------- */
const AR2=n=>String(n).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
function buildPlan(){const s=site();const slow=profile.mobility!=="walk"||(+profile.age||0)>=60;const g=s.places.gate[0],cart=s.places.cart[0],z=s.places.zamzam[0],pr=s.places.pray[0];const H=HOME();
  const fam=(profile.family||[]).filter(f=>f.phone&&!/مع/.test(f.phone)).map(f=>f.name+" "+f.phone);
  let plan;
  if(state.site==="makkah"){plan={site:"makkah",intent:"العمرة",title:"خطتك للعمرة",steps:[
    ["من "+H.home+" إلى "+g[0]+(slow?" بالعربة من "+cart[0]:" مشيا")+"، نحو "+walk(H.dist)+" دقيقة","home","gate"],
    ["الطواف سبعة أشواط من "+(profile.tawafFloor?"الدور الأول":"صحن المطاف")+(slow?" (الدور الأول يسمح بالعربة)":"")+"، والدعاء بلغتك من المطوف الرقمي","mataf","mataf"],
    ["ركعتان خلف مقام إبراهيم أو في أي موضع إن ازدحم","mataf","mataf"],
    ["اشرب من زمزم: "+z[0]+" ("+z[1]+" م)","zamzam","zamzam"],
    ["السعي سبعة أشواط بين الصفا والمروة"+(slow?" بالعربة من "+(s.places.cart[1]||cart)[0]:""),"saee","saee"],
    ["الحلق أو التقصير عند حلاق مرخص قرب باب المروة","saee","saee"],
    ["العودة إلى "+H.home+"، ونقطة اللقاء مع العائلة عند "+g[0],"home","home"]]}}
  else{const r=profile.rawdah||{};plan={site:"madinah",intent:"زيارة الروضة",title:"خطتك لزيارة الروضة",steps:[
    ["من "+H.home+" إلى الساحات الجنوبية أمام باب مكة (37)، نقطة تجمع تصاريح الروضة"+(slow?"، بالعربة من "+cart[0]+" (يسمح لكبار السن بدخول الروضة بالعربة اليدوية ضمن ضوابط الهيئة)":"")+"، نحو "+walk(H.dist+90)+" دقيقة، والوصول قبل الموعد بثلاثين دقيقة","home","rgate"],
    ["الصلاة في "+pr[0]+" (الأقل إشغالا في آخر لقطة)","pray","pray"],
    ["الصلاة في الروضة الشريفة بتصريح: موعدك "+(r.slot||"حسب التصريح")+"، تحقق من التصريح عند نقطة التجمع، ثم الانتظار والدخول مع فوجك عبر المسار المعتمد، ركعتان ودعاء قصير ثم أفسح لمن بعدك. خذ حذاءك معك في كيس لأن الخروج من غير باب الدخول","rgate","rawdah"],
    [(profile.gender==="f"?"السلام على النبي صلى الله عليه وسلم من القسم المخصص للنساء وفي أوقاته، بالدعاء بلغتك":"السلام على النبي صلى الله عليه وسلم وصاحبيه: إن لم يمر مسار خروجك من الروضة أمام الحجرة النبوية، فمسار السلام مفتوح بلا تصريح من باب السلام 1 في الجهة الغربية إلى باب البقيع في الجهة الشرقية، "+((LIVE.salam()?"كثافته الآن "+LVL[LIVE.salam()][0]:"ولا قراءة حية لكثافته الآن"))),"gate","baqi"],
    ["الخروج، ونقطة اللقاء مع العائلة عند باب السلام، ثم العودة إلى "+H.home,"gate","home"]]}}
  plan.saved=Date.now();plan.step=0;plan.lang=profile.readLang||"ar";plan.prayers=PRAYERS;plan.density=liveSnapshot();plan.halls=s.halls;plan.meet=g[0];plan.family=fam;plan.emergency="911";plan.home=H.home;
  try{localStorage.setItem("knf_plan",JSON.stringify(plan))}catch(_){}
  state.plan=plan;
  /* الخطة تبقى على الجهاز. لا ترسل إلى البريد إلا إذا طلب الضيف ذلك، ومرة واحدة لكل طلب */
  return plan}
function pushPlan(plan){plan=plan||state.plan||loadPlan();try{if(plan&&LLM.ok()&&profile.accountId&&profile.email){return fetch(LLM.url.replace(/\/$/,"")+"/plan",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:profile.accountId,email:profile.email,title:plan.title,text:planText(plan),send:true})}).then(r=>r.json()).then(j=>{if(j&&j.sent){log("svc","أرسل الخطة إلى البريد بطلب الضيف",profile.email+" · مرة واحدة");msg("sys","أرسلت خطتك إلى "+profile.email+".")}else log("svc","تعذر إرسال الخطة بالبريد",(j&&j.reason)||"");return j}).catch(()=>null)}}catch(_){}return Promise.resolve(null)}
function loadPlan(){try{const p=JSON.parse(localStorage.getItem("knf_plan")||"null");if(p&&p.site===state.site){state.plan=p;return p}}catch(_){}return null}
function planText(p){const lines=[p.title+" · "+site().name,"",...p.steps.map((st,i)=>(i+1)+". "+st[0]),"",p.meet?"نقطة اللقاء: "+p.meet:"",p.home?"السكن: "+p.home:"","الطوارئ: 911 · الرقم الموحد لضيوف الرحمن: 1966","","من وكيل كنف"];return lines.filter(x=>x!==undefined).join("\n")}
function sharePlan(how){const p=state.plan||loadPlan();if(!p){msg("sys","لا توجد خطة محفوظة بعد؛ جهز رحلتك أولا.");return}const txt=planText(p);
  if(how==="wa"){const num=(profile.phone||"").replace(/\D/g,"");const u="https://wa.me/"+(num?num:"")+"?text="+encodeURIComponent(txt);log("svc","إرسال الخطة عبر واتساب",num?"إلى جوال الضيف":"مشاركة");window.open(u,"_blank","noopener")}
  else if(how==="mail"){if(!profile.email){state.onb="mailonly";const r="ما بريدك الإلكتروني لأرسل لك الخطة؟";msg("bot",r);speak(r,{lang:"ar"});box.placeholder="بريدك الإلكتروني…";return}
    const u="mailto:"+encodeURIComponent(profile.email)+"?subject="+encodeURIComponent("خطتك من كنف: "+p.title)+"&body="+encodeURIComponent(txt);log("svc","إرسال الخطة إلى البريد",profile.email);location.href=u}
  else{if(navigator.share){navigator.share({title:p.title,text:txt}).catch(()=>{})}else{navigator.clipboard&&navigator.clipboard.writeText(txt);msg("sys","نسخت الخطة.")}}}
function planCard(auto){const p=state.plan||loadPlan();if(!p){card(head("📶","لا توجد خطة محفوظة",site().name)+`<div>جهز خطتك وأنت متصل بالشبكة حتى تعمل معك بلا اتصال داخل المسجد.</div><div class="acts"><button class="primary" data-say="جهز رحلتي">جهز رحلتي الآن</button></div>`);return{plan:null}}
  const age=Math.max(1,Math.round((Date.now()-p.saved)/60000));const keys=[...new Set(p.steps.map(x=>x[2]))];
  const c=card(head("📶",p.title,(auto?"تعمل بلا اتصال · ":"")+"حفظت قبل "+AR2(age)+" د")+`<div style="font-size:.8rem;color:var(--muted)">كل ما تحتاجه اليوم محفوظ على جهازك: الخريطة والمسار وخطوات ${esc(p.intent)} والأدعية والمواقيت ونقطة اللقاء. ما يحتاج الشبكة يرسل حين تعود.</div>`+authMap(keys,p.steps[Math.min(p.step,p.steps.length-1)][2])+`<div class="steps">${p.steps.map((st,i)=>`<div class="step ${i===p.step?"now":i<p.step?"done":""}"><i>${AR2(i+1)}</i><span>${esc(st[0])}</span></div>`).join("")}</div><div class="acts"><button class="primary" data-pdone="1">${p.step>=p.steps.length-1?"أتممت الخطة":"أتممت هذه الخطوة، التالية"}</button><button data-pmap="1">دلني على الخطوة الحالية</button><button data-pwa="1">أرسلها لواتسابي</button><button data-pmail="1">أرسلها لبريدي</button></div><dl class="kv" style="margin-top:8px"><dt>آخر قراءة حية للكثافة</dt><dd>${p.density.length?p.density.map(([n,l])=>esc(n)+": "+l).join(" · ")+` <span style="color:var(--muted)">(قبل ${AR2(age)} د)</span>`:"لم تتوفر قراءة حية عند حفظ الخطة"}</dd><dt>المواقيت</dt><dd>${p.prayers.map(([n,t])=>n+" "+t).join(" · ")}</dd><dt>نقطة اللقاء</dt><dd>${esc(p.meet)}</dd>${p.family.length?`<dt>العائلة</dt><dd>${p.family.map(esc).join("<br>")}</dd>`:""}<dt>الطوارئ</dt><dd>${p.emergency} (اتصال مباشر يعمل بلا بيانات)</dd></dl>`,"nav");
  c.querySelector("[data-pdone]").addEventListener("click",()=>{if(p.step<p.steps.length-1){p.step++;try{localStorage.setItem("knf_plan",JSON.stringify(p))}catch(_){}c.remove();planCard(auto)}else{msg("sys","تقبل الله. أتممت خطتك.");c.querySelector("[data-pdone]").disabled=true}});
  c.querySelector("[data-pmap]").addEventListener("click",()=>{const st=p.steps[Math.min(p.step,p.steps.length-1)];guidance(st[0].split("،")[0],180)});
  c.querySelector("[data-pwa]").addEventListener("click",()=>sharePlan("wa"));c.querySelector("[data-pmail]").addEventListener("click",()=>sharePlan("mail"));
  return{plan:p.intent,step:p.step+1,of:p.steps.length}}
