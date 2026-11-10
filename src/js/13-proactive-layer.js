/* ---------- proactive layer ---------- */
function prayerPlan(){const s=site();const halls=s.halls.slice().sort((a,b)=>a[1]-b[1]);const best=halls[0];
  const hl=state.site==="madinah"?LIVE.halls():null;const occ=hl?(()=>{const ok=hl.filter(x=>x>0);const hi=ok.filter(x=>x===3).length;return hi?hi+" مصليات ممتلئة، اختر مصلى أخضر":"كل المصليات المتاحة منخفضة الإشغال"})():(state.site==="madinah"?"لا قراءة حية للإشغال":"");
  const why=[profile.quiet?"هادئ":"",profile.mobility!=="walk"?"قريب من المصعد":""].filter(Boolean).join(" و");
  log("rite","استباقي: العصر بعد 20 دقيقة",`اختار ${best[0]}${occ?" ("+occ+")":""}${why?" لأنه "+why:""}${profile.kids?" واقترح ضيافة الأطفال":""}`);
  card(head(ICON.pray,"العصر بعد 20 دقيقة","استباقي")+`<div>مصلاك الأنسب <b>${esc(best[0])}</b>${occ?" ("+occ+")":""}${why?"، "+why:""}، على بعد ${s.places.pray[0][1]} م.${profile.kids?" ومركز ضيافة الأطفال في طريقك، فيه أماكن لـ"+(profile.kids===1?"حفيدك":"حفيديك")+".":""}</div><div class="acts"><button class="primary" data-say="${profile.kids?"احجز لأطفالي في ضيافة الأطفال ودلني على المصلى":"دلني على المصلى"}">${profile.kids?"احجز ودلني":"دلني"}</button><button data-say="أين أصلي العصر؟">مصلى آخر</button></div>`,"alert")}
function proactive(){
  const s=site();
  if(HOME().auto&&!HOME().confirmed){log("sup","استباقي: استنتج السكن من مبيت الليلة الماضية ويطلب التأكيد",HOME().home);
    card(head("🏨","هل هذا سكنك؟","يحتاج تأكيدك")+`<div>لاحظت أنك بت الليلة الماضية في <b>${esc(HOME().home)}</b>. أعتمده سكنا لك لأدلك على طريق العودة ونقطة اللقاء؟</div><div class="acts"><button class="primary" data-say="نعم هذا سكني">نعم، هذا سكني</button><button data-say="لا، سكني في مكان آخر">لا، مكان آخر</button></div>`,"alert")}
  if(state.site==="madinah"&&profile.rawdah){TOOLS.waiting_mode.run()}
  wb.body="ok";wb.mind="calm";wb.lastDrink=Date.now();wb.reminded=false;wb.answered=0;wbRender();log("care","بدأ عد الماء من فتح الوكيل","يذكره بعد "+(s.temp>=40?30:45)+" دقيقة في هذا الحر، ويعيد العد عندما يقول شربت");
  if(s.temp>=38){log("care","خطة الجسد الاستباقية","الحرارة "+s.temp+"° · عمره "+profile.age+" · "+(profile.rest?"يريد تذكير الراحة":""));
    card(head("💚","عافيتك اليوم","الجسد")+`<div>الحرارة ${s.temp}° وأنت في الساحات المكشوفة. الزم الظل، واشرب قبل أن تعطش، وخذ المصعد بدل السلالم. أقرب ظل وزمزم على بعد ${s.places.zamzam[0][1]} م.</div><div class="acts"><button class="primary" data-say="دلني على أقرب زمزم">أقرب زمزم</button><button data-say="أين أقرب مكان مكيف؟">مكان مكيف</button><button data-say="كيف حالي الجسدية؟">كيف حالي</button></div>`,"alert")}
  const lm=state.site==="makkah"?LIVE.mataf():null;const ls=state.site==="madinah"?LIVE.salam():null;
  const hi=state.site==="makkah"?(lm&&lm["المطاف"].find(x=>x[1]===3)):(ls===3?["مسار السلام",3]:null);
  const lo=lm&&lm["المطاف"][0];
  if(hi){log("nav","تنبيه استباقي من قراءة الهيئة الحية: كثافة كثيفة",hi[0]);
    card(head(ICON.crowd,"الكثافة كثيفة في "+hi[0],"استباقي · قراءة حية")+`<div>${state.site==="makkah"?(lo&&lo[1]<3?"الأخف الآن "+esc(lo[0])+" بكثافة "+LVL[lo[1]][0]+(lo[3]?"، نحو "+lo[3]+" دقيقة لإنهاء الطواف":"")+".":"كل دورات المطاف كثيفة الآن، والأفضل تأجيل الطواف قليلا."):"مسار السلام كثيف الآن، أكثر من 20 دقيقة لإنهاء السلام. سأنبهك عندما يخف."}</div><div class="acts"><button class="primary" data-say="متى أفضل وقت ${state.site==="makkah"?"للطواف":"للروضة"}؟">أفضل وقت</button></div>`,"alert")}
  if(profile.mobility!=="walk"||profile.age>=65){log("svc","استباقي من الملف: "+(profile.mobility==="cart"?"يحتاج عربة":"يتعب من المشي"),"العمر "+profile.age);
    card(head(ICON.cart,profile.mobility==="cart"?"عربتك جاهزة للطلب":"مسار قصير يناسبك","من ملفك")+`<div>${profile.mobility==="cart"?"أقرب نقطة عربات على بعد "+s.places.cart[0][1]+" م، وأستطيع طلبها الآن لتصلك مكانك.":"أقرب مصلى مخصص ومصعد على بعد "+s.places.pray[0][1]+" م، والمسار عبر المصاعد لا السلالم."}</div><div class="acts"><button class="primary" data-say="اطلب لي عربة">اطلب عربة</button><button data-say="دلني على المصلى المخصص">المصلى المخصص</button></div>`,"alert")}
  prayerPlan();
  if(state.site==="makkah"&&profile.stage==="tawaf"){log("rite","استباقي مما قاله في المحادثة: أتم الطواف وبقي السعي",profile.tawafFloor?"يفضل الدور الأول":"");
    card(head(ICON.pray,"بقي عليك السعي","كما أخبرتني")+`<div>${liveLvl("masaa")?"الأخف في المسعى الآن "+esc(LIVE.mataf()["المسعى"][0][0])+" بكثافة "+lvlText(liveLvl("masaa")):"لم أصل إلى قراءة كثافة المسعى الحية بعد"}. الصفا على بعد ${s.places.zamzam[0][1]} م.</div><div class="acts"><button class="primary" data-say="دلني على الصفا من الدور الأول">دلني على الصفا</button><button data-say="أبغى أرتاح شوي قبل السعي">أرتاح أولا</button></div>`,"alert")}
  if(profile.lessons){const L=LESSONS[1];log("rite","استباقي من الملف: يحب الدروس",L[1]);
    card(head(ICON.book,"درس يناسبك "+L[0],"من ملفك")+`<div>${L[1]} في ${L[2]}. أذكرك قبله بعشر دقائق؟</div><div class="acts"><button class="primary" data-say="ذكرني قبل درس ${L[1]} بعشر دقائق">ذكرني</button></div>`)}
  const far=famPositions().find(f=>f.sharing&&f.dist>=300);
  const anyHigh=state.site==="makkah"?!!(LIVE.mataf()&&LIVE.mataf()["المطاف"].some(x=>x[1]===3)):LIVE.salam()===3;
  if(far&&anyHigh){log("svc","استباقي من مجموعة كنف: تفرقت العائلة",far.name+" على بعد "+far.dist+" م في كثافة عالية");
    card(head("👨‍👩‍👧","تفرقتم؟ "+far.name+" على بعد "+far.dist+" م","مجموعة كنف")+`<div>الكثافة عالية بينكما. أحدد نقطة لقاء قريبة، أم تلتقون في الفندق بعد الصلاة؟</div><div class="acts"><button class="primary" data-say="حدد نقطة لقاء لنا كلنا">نقطة قريبة</button><button data-say="نلتقي في الفندق">في الفندق</button><button data-say="وين عائلتي الآن؟">أين الجميع</button></div>`,"alert")}
  if(profile.hearing){log("care","استباقي من الملف: ضعف سمع","سماعات وترجمة");
    card(head(ICON.tr,"سماعات ضعاف السمع","من ملفك")+`<div>تستلمها من مكتب الإرشاد عند أقرب باب، وتصلك الخطبة صوتا واضحا بلغتك. وأرد عليك نصا واهتزازا، وإن أردت أن يفهمك من حولك فاستخدم وضع الإشارة من الزر ✋.</div><div class="acts"><button class="primary" data-say="أين سماعات ضعاف السمع؟">أين أستلمها</button><button data-say="مترجم إشارة">مترجم إشارة</button></div>`)}
}

