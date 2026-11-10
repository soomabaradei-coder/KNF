/* ---------- agent: real (sample) or scripted router ---------- */
function instructions(){
  const s=site();const L=LANGS[state.lang]||"العربية";
  return `أنت «كنف»، وكيل ذكي يرتقي بجودة حياة ضيف بيت الله الحرام؛ يفهم احتياجه، ويستبق سؤاله، ويوصله بالخدمة الأنسب في وقتها وبالطريقة التي تلائمه. طوال رحلته: تفهم الضيف، وتعرف الخدمات المتاحة، وتوصله بالخدمة المناسبة في الوقت المناسب وبالطريقة التي تناسبه، وتتكيف مع احتياجاته أثناء الرحلة. من كرم الضيافة أن يصل للزائر ما يحتاجه قبل أن يسأل عنه. جودة الحياة عندك ثلاثة أركان: عافية الجسد (الحر، الماء، الراحة، الدواء، إشارات تطبيق الصحة)، سكينة النفس (الهدوء، الانتظار، التوتر، التنفس)، وطيب الرحلة أي جودة حياته (الطريق، العائلة، الوقت، خدمات الهيئة كلها في مكان واحد وبكلمة واحدة) ويرافقه داخل ${s.name} ويتكامل مع خدمات الهيئة العامة للعناية بشؤون المسجد الحرام والمسجد النبوي. اكتب ردك بلغة القراءة التي يفضلها الضيف (${LANGS[profile.readLang]||"العربية"}) إلا إذا كتب هو بلغة أخرى فأجبه بها. ثم أضف في آخر الرد سطرا يبدأ بـ ||| فيه الرد نفسه مترجما إلى لغة السماع التي يفضلها (${LANGS[profile.speakLang]||"الفرنسية"})، لأن الوكيل يقرؤه له بالصوت. كن موجزا جدا (جملتان على الأكثر)، دافئا ومحترما، ولا تخترع معلومات: كل معلومة عن أماكن أو أرقام أو حالات تأتي من الأدوات فقط. استدع الأداة المناسبة مباشرة بدل أن تسأل أسئلة كثيرة، واسأل سؤالا واحدا فقط إن كان ضروريا. في الطوارئ استدع emergency فورا. الضيف يسمع ردك بالصوت، فاجعله قصيرا ومسموعا. راقب نبرته: إن دلت كتابته على توتر أو غضب أو تعب (تعجب متكرر، حروف ممدودة، كلمات ضيق) فابدأ بجملة تطمين قصيرة باسمه ثم نفذ الحل فورا دون أسئلة، وبعد الحل اعرض عليه start_breathing أو مكان جلوس. إذا قال ابدأ الإرشاد أو دلني فاستدع start_guidance بالوجهة الأخيرة. بعد استدعاء أداة، لا تكرر تفاصيلها (الضيف يرى بطاقتها)، بل أضف الخطوة التالية أو نصيحة قصيرة. السياق: موقع الضيف المحدد تلقائيا ${s.name}، ${s.spot}، ${s.city}، الحرارة ${s.temp}°، الوقت ${$("#clock").textContent}، ملف الضيف (استخدمه في كل قرار، وناده باسمه أحيانا): ${profileText().map(([k,v])=>k+": "+v).join("، ")}. ${state.site==="madinah"?"الضيف ينتظر دوره في الروضة الشريفة، موعده "+profile.rawdah.slot+" محجوز عبر كنف، والدخول بالتفويج، والانتظار المتوقع نحو "+profile.rawdah.waitMin+" دقيقة: اعتن براحته وهدوئه (الجلوس، الماء، التنفس البطيء بـ start_breathing، الأذكار بـ rawdah_guide) ولا تجعله يقف في الطابور. ":""}مؤشر عافيته الآن: ${wbState().t} (${wbState().w}). دواؤه كما ذكره بنفسه: ${profile.meds.map(m=>m.name+" "+m.times.join(" و ")).join("، ")||"لا دواء"}${wb.medDue?" (موعد "+wb.medDue.name+" حان ولم يأخذه بعد)":""}؛ إذا قال إنه أخذه فاستدع medication بـ action=taken، وإذا ذكر دواء جديدا فسجله بـ action=add. لا تقترح أبدا دواء أو جرعة أو بديلا، ولا تجب عن أسئلة طبية عن الأدوية؛ وجهه إلى المركز الطبي بـ find_nearest أو emergency. ${state.signMode?"الضيف في وضع الإشارة (أصم أو ضعيف سمع): اكتب له نصا قصيرا وواضحا، ولا تعتمد على الصوت، وإن احتاج ما يتجاوز الإشارات البسيطة فاستدع sign_interpreter. ":""}${healthFresh()&&health.src==="sim"?"قراءة ساعة تجريبية للعرض: "+healthLine()+" (إشارة أولية لا تشخيص؛ اسأله قبل أن تحكم، وفي الأكسجين المنخفض أو النبض المرتفع بلا حركة في الحر استدع emergency). ":"لا قراءة ساعة الآن: احكم على عافيته من الماء والحر وما يقوله. "}عائلته في مجموعة كنف: ${profile.family.map(f=>f.name+" ("+f.rel+(f.sharing?"، يشارك موقعه":"، لا يشارك")+")").join("، ")}. سكنه: ${HOME().home}${HOME().auto&&!HOME().confirmed?" (استنتجه كنف من مبيته ولم يؤكده بعد؛ إن أكده فاستدع confirm_home)":" (مؤكد)"}. إذا سأل عن أحد عائلته أو قال إنه ضاع عنه فاستدع family_locate أولا، وافتح بلاغ تائه فقط إن لم يكن يشارك موقعه أو طلب الضيف ذلك. إذا ذكر الضيف تفضيلا جديدا أو حاجة دائمة (لا يقدر يمشي، معه أطفال، يحب الدروس، ضعف سمع) فاستدع update_preferences لحفظه ثم أكمل. الكثافة: ${s.density.map(x=>x[0]+" "+LVL[x[1]][0]).join("، ")}.`;
}
function sampleTools(){
  return Object.entries(TOOLS).filter(([n])=>state.site==="madinah"||n!=="rawdah_permit").map(([name,t])=>({name,description:t.desc,...(t.schema?{inputSchema:t.schema}:{}),execute:(input)=>t.run(input||{})}));
}
const ROUTES=[
 /* الاتصال ومشاركة الموقع أولا حتى لا تذهب «اتصل على المرشد» إلى مراكز الإرشاد */
 [/([اإأ]تصل|[اإأ]تصلي|كلم|كلمي|دق|رن)\s*(على|عل|ع|عال|بال|لل|مع|ب)?\s*(ال)?(حمل[ةه]|حملتي|حملتنا)/i,"call_campaign",t=>({question:t})],
 /* أزرار الحملة: خطة الحملة، وماذا نفعل في المشعر أو اليوم */
 [/(خط[ةه]|جدول|برنامج)\s*(تنقلات\s*)?(ال)?(حج\s*)?(مع\s*)?(ال)?(حمل[ةه]|حملتي|حملتنا|بشرى|بشري)/i,"campaign_schedule",()=>({question:""})],
 [/(ماذا|ايش|إيش|وش|شو)\s*(افعل|أفعل|اسوي|أسوي|نسوي|نفعل|نعمل|اعمل|أعمل)\s*(في|ب|يوم)\s*(ال)?(منى|عرفات|عرف[ةه]|مزدلف[ةه]|جمرات|نحر|عيد|ترويه|تروية)|كيف\s*(أرمي|ارمي|نرمي)\s*(ال)?جمرات/i,"knowledge_answer",t=>({topic:hajjTopicFor(t)})],
 [/^\s*(أنا|انا|احنا|نحن|إحنا)?\s*(مع|من|في)\s+(شركة|شركه)?\s*(بشرى|بشري)/i,"set_campaign",t=>({name:t})],
 /* المشاعر ومخيم الضيف: قبل الضياع والموقع حتى لا تذهب «ضيعت المخيم» إلى بلاغ مفقود */
 [/(احفظ|سجل|سجّل|خزن)\s*(لي)?\s*(موقع|مكان)?\s*(ال)?(مخيم|مخيمي|خيمتي|خيم[ةه])/i,"save_camp",t=>({label:t})],
 [/(مخيم|خيم[ةه])\S*\s*(رقم\s*)?([0-9٠-٩]{1,3}|[A-Za-z])\s*\/\s*[0-9٠-٩]{1,4}/i,"find_camp",t=>({which:"campaign",number:campNoIn(t)})],
 [/(مخيم|خيم[ةه])\s*(ال)?(حمل[ةه]|حملتي|حملتنا|بشرى|بشري)/i,"find_camp",t=>({which:"campaign",zone:mashaerKey(t)==="jamarat"?"":mashaerKey(t)})],
 [/(دلني|دليني|وديني|خذني|ارجعني|رجعني|ضاع|ضيعت|تهت|ضعت|ارجع|أرجع)[^.؟?]{0,10}(ال)?(مخيم|خيم)|(وين|أين|اين|فين)\s*(مخيمي|خيمتي|مخيمنا|خيمتنا)|(مخيمي|خيمتي|مخيمنا|خيمتنا)\s*(وين|فين|أين|اين)/i,"find_camp",()=>({})],
 [/(انا|أنا|احنا|إحنا|نحن|وصلت|وصلنا|الحين|الآن|الان)\s*(الحين|الآن|الان)?\s*(في|ب|بـ|الى|إلى|على|عند)?\s*(مشعر\s*)?(منى|منا|عرفات|عرف[ةه]|مزدلف[ةه]|الجمرات|جسر الجمرات)(?=\s|$|[.،,!؟?])/i,"mashaer_guide",t=>({place:mashaerKey(t)})],
 [/(ماذا|ايش|إيش|وش|شو)\s*(افعل|أفعل|اسوي|أسوي|نسوي|نفعل|اعمل|أعمل|علي|عليّ)\s*(هنا|الحين|الآن|الان|اليوم)/i,"mashaer_guide",()=>({}),()=>!!(mashaerNow()||state.mashaer)],
 [/أرسل موقعي|ارسل موقعي|شارك موقعي|[اإأ]تصل|[اإأ]تصلي|رن على|دق على|كلم |كلمي /i,"share_location",m=>({member:(m.match(/(?:موقعي|[اإأ]تصل|[اإأ]تصلي|رن|دق|كلم|كلمي)\s*(?:على|علي|ع|مع|ل|لـ|بـ|ب)?\s*(\S+)/)||[])[1]||"",mode:/[اإأ]تصل|كلم|رن |دق /.test(m)?"call":"share"}),t=>!/(1966|911|997|998|الهيئة|الهيئه|مركز الاتصال|مركز اتصال|الطوارئ|الطوارىء|الإسعاف|الاسعاف|الشرطة|الشرطه|الدفاع المدني|الأمن|الامن)/.test(t)],
 [/^\s*من معي\s*[؟?]?\s*$/i,"family_setup",()=>({}),()=>!(profile.family||[]).length],
 [/(أرسل|ارسل|ابعث|أبعث|شارك)\s*(لي\s*)?(خطتي|الخطة|الخطه)\s*(على|ع|إلى|الى|لل|ل|ب|بال)?\s*(ال)?(بريد|ايميل|إيميل|ميل)|[\w.+-]+@[\w-]+\.[\w.-]+/i,"plan_mail",t=>({email:(t.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)||[])[0]||""}),t=>!state.onb],
 [/(وش|ما|ايش|إيش|شنو)\s*(اسم\s*)?حملتي|مع أي حملة أنا|مع اي حملة انا/i,"set_campaign",()=>({ask:true})],
 [/(أنا|انا|احنا|نحن|إحنا)?\s*(مع|في)\s*(حملة|حمله)\s+(.+)|^\s*(حملتي|حملتنا)\s+(.+)|^\s*(بلا|بدون|ما في|مافي)\s*(حملة|حمله)\s*$/i,"set_campaign",t=>({name:/^\s*(بلا|بدون|ما في|مافي)/.test(t)?"":campName((t.match(/(?:حملة|حمله|حملتي|حملتنا)\s+(.+)$/)||[])[1]||"")})],
 [/(نلتقي|نتقابل|نتجمع|نقطة اللقاء)\s*(عند|في|ب)?\s*(باب|بوابة)\s*(.+)$/i,"set_meeting_point",t=>({place:"gate",gate:(t.match(/(?:باب|بوابة)\s*(.+)$/)||[])[1]||""})],
 [/^\s*(أرسل|ارسل|شارك)\s+الرابط\s+(?:لـ|ل)\s*(\S.*)$/i,"invite_member",t=>({forName:(t.match(/الرابط\s+(?:لـ|ل)\s*(\S.*)$/)||[])[1]||""})],
 [/أبغى أعتمر|ابغى اعتمر|أبي أعتمر|ابي اعتمر|بأعتمر|باعتمر|أريد العمرة|اريد العمرة|أبغى العمرة|ابغى العمرة|العمرة الآن|العمره الان|اعتمر الحين/i,"umrah_now",()=>({})],
 [/الحافل|حافلة|الباص|(^|\s)باص|محطة الباص|محطة الحافل|أقرب محطة|اقرب محطة|مواقف|موقف سيار|موقف للسيار|أوبر|اوبر|(^|\s)كريم(\s|$|[؟?!.،])|تاكسي|سيارة أجرة|سياره اجره|بالسيارة|بالسياره|كيف أروح للحرم|كيف اروح للحرم|كيف أوصل للحرم|كيف اوصل للحرم|كيف أوصل للمسجد الحرام|كيف اوصل للمسجد الحرام|كيف أرجع|كيف ارجع/i,"transport_options",t=>({mode:/الحافل|حافلة|باص|محطة/.test(t)?"bus":/مواقف|موقف|بالسيار/.test(t)?"car":/أوبر|اوبر|كريم|تاكسي|أجرة|اجره/.test(t)?"ride":"all"})],
 [/أتجنب الحر|اتجنب الحر|أتجنب الزحام|اتجنب الزحام|الحر والزحام|أهرب من الزحام|اهرب من الزحام|الزحام والحر|كيف أتفادى|كيف اتفادى/i,"avoid_heat_crowd",()=>({})],
 [/كلمني ب|كلميني ب|تكلم معي ب|تكلمي معي ب|حدثني ب|رد علي ب|غير اللغة|غيّر اللغة|بدل اللغة|أبغى اللغة|ابغى اللغة|اللغة ال/i,"set_language",t=>({lang:langFromText(t)||""}),t=>!!langFromText(t)||/غير اللغة|بدل اللغة/.test(t)],
 [/الوقاية من الحر|أتقي الحر|اتقي الحر|ضربة شمس|ضربة الشمس|الإجهاد الحراري|الاجهاد الحراري|إجهاد حراري|اجهاد حراري|الجو حار|الحر شديد|حر شديد|درجة الحرارة|كم الحرارة|الحرارة اليوم|نصائح الحر|(^|\s)الحر(\s|$|[؟?!.،])/i,"heat_protection",()=>({})],
 [/(^|\s)(حكم|يجوز|ما يجوز|حلال|حرام|فدية|كفارة|فتوى|فتوي|افتوني|أفتوني|علي دم|هدي|بطل|يبطل|شكيت|شككت|سهوت|نسيت|نقصت|زدت|ماذا علي|ايش علي|وش علي|صح طوافي|صح سعيي|صحيح طوافي)(\s|$|[؟?!.،])/i,"fatwa_refer",t=>({question:t})],
 [/(وين|أين|اين|فين)\s*(انا|أنا)(?=\s|$|[؟?!.،])|(انا|أنا)\s*(وين|أين|اين|فين)|موقعي الآن|موقعي الان|وين موقعي|أين موقعي|اين موقعي|where am i|ma position|où suis/i,"my_location",()=>({})],
 [/(دلني|دليني|وديني|خذني|وجهني|وصلني)\s*(على|إلى|الى|ل|لـ|عند)?\s*(\S+)/i,"start_guidance",t=>{const m=t.match(/(?:دلني|دليني|وديني|خذني|وجهني|وصلني)\s*(?:على|إلى|الى|ل|لـ|عند)?\s*(\S+)/i);const q=normAr(m[1].replace(/[؟?]/g,""));const f=livePeers().concat(famPositions()).find(p=>normAr(p.name).startsWith(q)||q.startsWith(normAr(p.name).split(" ")[0]));return {destination:"موقع "+f.name.split(" ")[0]+(f.where?" ("+f.where+")":""),distance_m:(f.sharing&&f.dist)||150}},t=>{const m=t.match(/(?:دلني|دليني|وديني|خذني|وجهني|وصلني)\s*(?:على|إلى|الى|ل|لـ|عند)?\s*(\S+)/i);if(!m)return false;const q=normAr(m[1].replace(/[؟?]/g,""));if(!q||/باب|مسار|الروضه|الروضة|المطاف|زمزم|الفندق|السكن|نقطه|نقطة|المسعى|الصفا|المروه|العربه|العربة|مركز|مصلى|دوره|دورة|مصعد|اقرب|أقرب/.test(q))return false;return livePeers().concat(famPositions()).some(p=>normAr(p.name).startsWith(q)||q.startsWith(normAr(p.name).split(" ")[0]))}],
 [/دلني على (باب مكة|نقطة التجمع|ساحات باب مكة|بوابة التفويج|تجمع الروضة)|وين (باب مكة|نقطة التجمع|بوابة التفويج)|أين (باب مكة|نقطة التجمع)/i,"start_guidance",()=>({destination:"ساحات باب مكة (37)، نقطة تجمع تصاريح الروضة",distance_m:330})],
 [/دلني على باب البقيع|وين باب البقيع|أين باب البقيع/i,"start_guidance",()=>({destination:"باب البقيع، نهاية مسار السلام",distance_m:420})],
 [/(أضف|اضف|ضيف|أضيف|اضيف|اضافة|إضافة|ادخل|أدخل|انضم|ينضم|يدخل|اربط|أربط)\s*(لي\s*)?(شخص|فرد|احد|أحد|واحد|عضو|زول|ابني|زوجتي|عائلتي|اهلي|أهلي|صاحبي|جماعتي|الحملة|الحمله)|ادعو|أدعو|دعوة|دعوه|شارك الرابط|ارسل الرابط|أرسل الرابط|رمز المجموعة|رمز المجموعه|كود المجموعة/i,"family_setup",()=>({})],
 [/محادثاتي|المحادثات السابقة|محادثه سابقه|محادثة سابقة|وين محادثة|رجعني لمحادثة|ارجع لمحادثة|افتح محادثة/i,"open_threads",()=>({})],
 [/(افتح|افتحي|فتح|اعرض|وريني|ابي|ابغى)\s*(لي\s*)?(صفح[ةه]|موقع|منص[ةه]|بوابة)\s*(الهيئ[ةه]|الحالة|الكثاف[ةه]|مسار السلام)|صفح[ةه] (مسار السلام|الكثاف[ةه]|الهيئ[ةه])|موقع الهيئ[ةه]|الحال[ةه] الرسمي[ةه]/i,"open_portal",t=>({page:/مصل|إشغال|اشغال/.test(t)?"halls":/خريط/.test(t)?"map":/خدمات/.test(t)?"services":/آداب|اداب|الروضة/.test(t)?"rawdah":/كثاف|سلام|حالة/.test(t)?"density":undefined})],
 [/كيف حالي|فحص عافية|كيف أشعر|كيف اشعر/i,"wellbeing_checkin",()=>({})],
 [/أنا بخير|انا بخير|الحمد لله بخير/i,"set_mind_ok",()=>({})],
 [/(ما|لم|لا|مو|مب|ماني)\s*(شربت|أشرب|اشرب|شارب|شربنا)|ما شربت|من الفجر ما/i,"hydration_rest",()=>({need:"water"})],
 [/دوخة|دوخه|دايخ|دائخ|أدوخ|ادوخ|راسي يدور|dizzy/i,"hydration_rest",()=>({need:"both"})],
 [/شربت وارتحت|شربت|ارتحت|استرحت/i,"reset_body",()=>({})],
 [/عطشان|عطشانة|أبغى ماء|ابغى ماء|ماء بارد/i,"hydration_rest",()=>({need:"water"})],
 [/أنا أصم|انا اصم|أنا أصماء|انا اصماء|ضعيف سمع|ضعيفة سمع|ما أسمع|ما اسمع|لغة الإشارة/i,"update_preferences",()=>({hearing:1})],
 [/مكالمة فيديو مع المترجم|مترجم إشارة|مترجم لغة الإشارة|interprète/i,"sign_interpreter",()=>({mode:"video"})],
 [/مرشدا يحضر|مرشد يحضر/i,"sign_interpreter",()=>({mode:"inperson"})],
 [/أروح أطوف|اروح اطوف|أبغى أطوف|ابغى اطوف|أطوف الآن|اطوف الان|وقت الطواف|أطوف\?|اطوف\?/i,"get_density",()=>({})],
 [/وصلت\s*(ال|لل|الى ال|إلى ال)?مطاف|أنا في المطاف|انا في المطاف|(بدأ|بدا|بدي|بدن|نبد|ابد|أبد|بنبد|خلصنا|خلصت|أتممت|اتممت)\S*\s*(ال|أ|ا|ن)?(طواف|طوف|شوط)|^\s*(ال)?طواف\s*[.؟!]?\s*$|نطوف الحين|نطوف الآن|نطوف الان|الطواف\s*(بدأ|بدا)|المو?طوّ?ف/i,"mutawwif",()=>({})],
 [/(دلني|دليني|وجهني|وجهيني|أرشدني|ارشدني|خذني|وديني|كيف (أوصل|اوصل|أروح|اروح)|وين|أين|طريق)\s*(على|ع|عال|إلى|الى|لل|ل)?\s*(مكان )?(ال)?(مطاف|طواف|كعبة|صحن)|دلني على المطاف/i,"start_guidance",()=>({destination:"المطاف (سطح المطاف، باب ٩٢)",distance_m:260})],
 [/أصلي على الرسول|اصلي على الرسول|أصلي عالرسول|اصلي عالرسول|أسلم على الرسول|اسلم على الرسول|أسلم على النبي|اسلم على النبي|السلام على النبي|السلام على الرسول|مسار السلام|متى أزور الروضة|متى ازور الروضة|أزور الروضة|ازور الروضة|زحمة الروضة|كثافة الروضة/i,"get_density",()=>({})],
 [/دلني على باب السلام|وين باب السلام|أين باب السلام|وديني لباب السلام|دلني على مسار السلام/i,"get_density",()=>({}),t=>profile.gender==="f"],
 [/كيف أوصل للروضة|كيف اوصل للروضة|كيف أوصل إلى الروضة|كيف اوصل الى الروضة|وين الروضة|أين الروضة|طريق الروضة/i,"rawdah_route",()=>({})],
 [/دلني على الروضة|وديني للروضة|ابدأ الإرشاد إلى الروضة|ابدا الارشاد الى الروضة/i,"start_guidance",()=>(profile.gender==="f"?{destination:"الروضة الشريفة: مداخل النساء في الجهة الشمالية (في وقت النساء وبتصريحك)",distance_m:380}:{destination:"الروضة الشريفة: نقطة التجمع في الساحات الجنوبية أمام باب مكة (37)",distance_m:330})],
 [/دلني على باب السلام|وين باب السلام|أين باب السلام|وديني لباب السلام|دلني على مسار السلام/i,"start_guidance",()=>({destination:"باب السلام (بداية مسار السلام على الرسول)",distance_m:240})],
 [/أين أصلي|وين أصلي|وين اصلي|فين أصلي|أي مصلى|وين المصلى/i,"get_prayer_hall_occupancy",()=>({})],
 [/الدرس بعد المغرب|درس بعد المغرب|درس المغرب|الدروس اليوم|وين الدرس|متى الدرس/i,"get_lessons_and_prayers",()=>({})],
 [/لوحة الحملة|^\s*الحملة\s*$|مجموعتي|حملتي|مرشد الحملة|وضع المرشد|وين مجموعتي|أين مجموعتي/i,"campaign",()=>({})],
 [/عرب[ةه]\s*(ل|لـ)?\s*(زوجتي|زوجة|امي|أمي|والدتي|ابنتي|بنتي|اختي|أختي|حفيدتي|خديجة|ليلى)/i,"request_cart",()=>({kind:"wheelchair",gender:"f"})],
 [/عرب[ةه]\s*(ل|لـ)?\s*(زوجي|ابوي|أبي|والدي|ابني|ولدي|اخوي|أخي|حفيدي)/i,"request_cart",()=>({kind:"wheelchair",gender:"m"})],
 [/عربة للرجال|عربه للرجال/i,"request_cart",()=>({kind:"wheelchair",gender:"m"})],
 [/عربة للنساء|عربه للنساء/i,"request_cart",()=>({kind:"wheelchair",gender:"f"})],
 [/مركز الإرشاد|مركز إرشاد|وين الإرشاد|أين الإرشاد|أسأل موظف|اسأل موظف|أبغى أسأل أحد|ابغى اسال احد/i,"find_nearest",()=>({category:"guide"})],
 [/جهز رحلتي|جهزلي رحلتي|جهز خطتي|جهز لي خطة|خطة العمرة|خطة الزيارة|حمل الخطة|جهز الخطة/i,"trip_plan",()=>({action:"build"})],
 [/^\s*(خطتي|الخطة|رحلتي|وريني خطتي|اعرض خطتي|ما هي خطتي)\s*[؟?]?\s*$/i,"trip_plan",()=>({action:"show"})],
 [/ماذا تعرف عني|ايش تعرف عني|إيش تعرف عني|وش تعرف عني|تفضيلاتي|ليش اقترحت|لماذا اقترحت|ليش تقترح|كيف تعرفني/i,"explain_context",()=>({})],
 [/نتائج (التقييم|الاختبار|الأثر)|ملخص التقييم|نتائج التحقق/i,"survey",()=>({action:"results"})],
 [/^\s*التقييم\s*$|قيم التجربة|قيّم التجربة|تقييم التجربة|استبيان|أقيم|اقيم/i,"survey",()=>({action:"ask"})],
 [/^الخريطة$|افتح الخريطة|خريطة الحرم|وريني الخريطة|وين أنا|وين انا|أين أنا/i,"show_map",()=>({})],
 [/مو?طوّ?ف|أدعية الطواف|ادعية الطواف|أدعية السعي|دعاء الطواف|كم شوط|عداد الأشواط|عداد الاشواط|خطوات العمرة|مناسك العمرة|دليل العمرة/i,"mutawwif",()=>({})],
 [/الصورة لافتة|الصورة باب|لافتة باب/i,"find_nearest",()=>({category:"gate"})],
 [/الصورة علبة دوا|علبة دوا/i,"medication",()=>({action:"add",name:"الدواء الذي في الصورة",times:["08:00"]})],
 [/الصورة لمكان ضعت|ضعت فيه/i,"go_home",()=>({})],
 [/أخذت الدوا|اخذت الدوا|أخذت دوا|اخذت دوا|أخذته|اخذته|شربت الدوا|أخذت حبوب|اخذت حبوب/i,"medication",()=>({action:"taken"})],
 [/ذكرني بالدوا/i,"set_reminder",()=>({event:"الدواء",minutes_before:15})],
 [/آخذ|اخذ|عندي دوا|أتناول|اتناول|أشرب دوا|اشرب دوا/i,"medication",t=>{const m=t.match(/((?:دواء|دوا|حبوب|علاج)\s+\S+)/);const h=t.match(/(\d{1,2})/);return{action:"add",name:m?m[1]:"دواء",times:h?[String((+h[1]>=1&&+h[1]<=6)?+h[1]+12:+h[1]).padStart(2,"0")+":00"]:["08:00"]}}],
 [/دوا|أدوي|ادوي|حبوب|علاج|médicament|medicine/i,"medication",()=>({action:"status"})],
 [/تعبان|تعبانة|متعب|أنا متعبة|منهك|رجولي تعبت/i,"hydration_rest",()=>({need:"both"})],
 [/تنفس|نفس معي|توتر|متوتر|قلقان|قلق|ضايق|خايف|مرتبك|أهدأ|اهدأ|اهدا/i,"start_breathing",()=>({})],
 [/أذكار|اذكار|آداب الروضة|اداب الروضة|اقرأ لي/i,"rawdah_guide",()=>({})],
 [/أجلس وأنتظر|اجلس وانتظر|أنتظر تنبيهك|انتظر تنبيهك/i,"set_reminder",()=>({event:"دورك في الروضة",minutes_before:10})],
 [/وضع الانتظار|كم باقي|كم بقي|متى دوري|وين دوري/i,"waiting_mode",()=>({})],
 [/احجز.*(ضيافة|أطفال|اطفال).*(دلني|المصلى)/i,"plan_prayer",()=>({})],
 [/نعم.*(سكني|هذا الفندق|سكن)|هذا سكني|أيوه سكني/i,"confirm_home",()=>({confirmed:1})],
 [/لا.*(سكني|مكان آخر|فندق ثاني|فندق آخر)/i,"confirm_home",()=>({confirmed:0})],
 [/(خلصت|أتممت|انتهيت|كملت|أكملت).*(طواف|الطواف)|طفت/i,"update_preferences",()=>({stage:"tawaf"})],
 [/ذكرني|ذكريني|نبهني|تذكير/i,"set_reminder",m=>({event:m.replace(/^ذكرني\s*(قبل)?\s*/,"").replace(/\s*ب?(عشر|نصف|ربع|خمس)?\s*(دقائق|ساعة|دقيقة)?$/,"").trim()||"الحدث",minutes_before:/نصف ساعة/.test(m)?30:/ربع/.test(m)?15:/خمس/.test(m)?5:10})],
 [/وصل طلبي|تتبع|وين طلبي|أين طلبي/i,"track_request",m=>({ticket:(m.match(/[A-Z]{2,4}-\d+/)||["طلبك"])[0],action:"status"})],
 [/ألغ|الغ|إلغاء|الغاء/i,"track_request",m=>({ticket:(m.match(/[A-Z]{2,4}-\d+/)||["طلبك"])[0],action:"cancel"})],
 [/شغل البث|شغل الترجمة|ابدأ البث/i,"play_stream",()=>({})],
 [/البديل التالي|بديل آخر|غيره/i,"find_nearest",m=>({category:Object.keys(CATS).find(k=>m.includes(CATS[k]))||"gate",alt:1})],
 [/مكتب.*(تائه|مفقود)/i,"find_nearest",()=>({category:"lost"})],
 [/مصلى مخصص|المصلى المخصص|مصليات كبار السن/i,"find_nearest",()=>({category:"pray"})],
 [/أرتاح|ارتاح|استراحة|أجلس|اجلس|مقعد|تعبت/i,"find_nearest",()=>({category:"rest"})],
 [/الصفا|المروة|المسعى|السعي|مسار السلام/i,"find_nearest",()=>({category:"saee"})],
 [/(نلتقي|نتجمع|نقطة لقاء|لقاء).*(فندق|سكن)|(فندق|سكن).*(نلتقي|نتجمع|نقطة لقاء)/i,"set_meeting_point",()=>({place:"home"})],
 [/نقطة لقاء|نلتقي|نتجمع|نقطة قريبة|meeting/i,"set_meeting_point",()=>({place:"nearest"})],
 [/(وين|أين|اين|فين).*(عائلتي|أهلي|اهلي|الأطفال|الاطفال|أحفادي|الجماعة)/i,"family_locate",()=>({})],
 [/من معي|مين معي|من متصل|مين متصل|المتصلين|المتصلون|مجموعتي/i,"family_locate",()=>({})],
 [/(وين|أين|اين|فين|où est)\s+(\S+)/i,"family_locate",t=>{const m=t.match(/(?:وين|أين|اين|فين|où est)\s+(\S+)/i);return {member:m?m[1].replace(/[؟?]/g,""):undefined}},t=>{const m=t.match(/(?:وين|أين|اين|فين|où est)\s+(\S+)/i);const n=m&&m[1].replace(/[؟?]/g,"");if(!n)return false;const q=normAr(n);return livePeers().concat(famPositions()).some(p=>famMatch(p,q))}],
 [/^\s*(وين|أين|اين|فين)\s+(\S+)\s*[؟?!.]?\s*$/i,"family_locate",t=>({member:(t.match(/^\s*(?:وين|أين|اين|فين)\s+(\S+)/)||[])[1].replace(/[؟?!.]/g,"")}),t=>{const n=(t.match(/^\s*(?:وين|أين|اين|فين)\s+(\S+)/)||[])[1];return !!n&&!/^(ال|أقرب|اقرب|أصلي|اصلي|نصلي|أروح|اروح|أنا|انا|أنت|احنا|نحن|موقعي|مكاني|نقطة|باب|بوابة|مطاف|مسعى|زمزم|عربة|عربات|حمام|دورة|مصلى|مصليات|مركز|مستشفى|صيدلية|مظلات|مظلة|فندق|سكن|الطريق|طريق|محطة|موقف|مواقف|حافلة|باص|روضة|قبلة)/.test(n)&&(profile.family||[]).length>0}],
 [/(ابني|ولدي|زوجتي|زوجة ابني|حفيدي|حفيدتي|بنتي).*(وين|أين|اين|فين)|(وين|أين|اين|فين).*(ابني|ولدي|زوجتي|زوجة ابني|حفيدي|حفيدتي|بنتي)/i,"family_locate",t=>({member:/زوجة ابني/.test(t)?"زوجة ابني":/ابني|ولدي/.test(t)?"ابني":/زوجتي/.test(t)?"زوجتي":/حفيدتي/.test(t)?"حفيدتي":/حفيدي/.test(t)?"حفيدي":/بنتي/.test(t)?"ابنتي":undefined})],
 [/(بعدت|ابتعدت|تفرقت|تفرقنا|انفصلت|ضعت).*(عائلتي|أهلي|اهلي|عن)|(عائلتي|أهلي|اهلي).*(بعدوا|راحوا|تفرق)/i,"family_locate",()=>({})],
 [/(ضاع|ضايع|تاه|تائه|فقدت).*(ابني|حفيدي|حفيدتي|زوجتي|زوجي|ولدي|بنتي|ابنتي|أحفادي|والدتي|والدي|أمي|أبوي|أخي|أختي)|(ابني|حفيدي|زوجتي|والدتي|والدي|أمي|أبوي).*(ضاع|ضايع|تاه|تاهت|ضاعت)/i,"family_locate",t=>({member:(t.match(/(ابني|حفيدي|حفيدتي|زوجتي|زوجي|ولدي|بنتي|ابنتي|والدتي|والدي|أمي|أبوي|أخي|أختي)/)||[])[1]||undefined})],
 [/(نلتقي|نتقابل|نتجمع|نقطة اللقاء|اللقاء).*(الفندق|السكن|فندق|سكن)|(الفندق|السكن).*(نلتقي|نتقابل|نتجمع)/i,"set_meeting_point",()=>({place:"home"})],
 [/سكن|فندق|أرجع|ارجع|العودة|البيت|نرجع|hotel/i,"go_home",()=>({})],
 [/ما أقدر أمشي|ما اقدر امشي|أتعب|اتعب|رجلي|ركبتي/i,"update_preferences",()=>({mobility:"cart"})],
 [/ضعيف.*سمع|ما أسمع|ما اسمع/i,"update_preferences",()=>({hearing:1})],
 [/معي.*(طفل|أطفال|اطفال|ولد|بنت)|عندي.*(طفل|أطفال|اطفال)/i,"update_preferences",m=>({kids:(m.match(/\d+/)||[2])[0]})],
 [/خلصت.*سعي|أتممت.*سعي|انتهيت.*سعي/i,"update_preferences",()=>({stage:"saee"})],
 [/حريق|دخان|نار|fire/i,"emergency",m=>({description:m,type:"fire"})],
 [/سرق|سرقة|اعتدى|اعتداء|يضربني|تحرش/i,"emergency",m=>({description:m,type:"security"})],
 [/إسعاف|أغمي|اغمي|يغمى|ألم شديد|الم شديد|(ألم|الم|وجع)\s*(في|ب)?\s*(صدري|الصدر|قلبي|القلب)|ضيق نفس|ضيق تنفس|نزيف|اختناق|faint|chest pain/i,"emergency",m=>({description:m,type:"medical"})],
 [/طوارئ|طوارى|emergency|النجدة|انقذوني|أنقذوني/i,"emergency",m=>({description:m,type:"unknown"})],
 [/عربة|عربه|كرسي|wheelchair|cart|أمشي|امشي|تعب/i,"request_cart",()=>({kind:"wheelchair"})],
 [/ضاع|ضايع|تاه|تائه|فقدت|مفقود|lost/i,"report_lost",m=>({type:/ولد|بنت|طفل|أم|أب|زوج|جد|شخص|child|son|daughter|mother|father/i.test(m)?"person":"item",description:m})],
 [/أطفال|اطفال|طفل|ضيافة|kids|child/i,"book_children_center",m=>({children:Number((m.match(/\d+/)||[profile.kids||1])[0])||profile.kids||1,prayer:(m.match(/(الفجر|الظهر|العصر|المغرب|العشاء)/)||[""])[0]}),t=>!/بشر[ىي]\s*(ال)?ضياف/.test(t)],
 [/ترجم|خطبة|اردو|urdu|english|translat|سماعة/i,"sermon_translation",()=>({lang:state.lang})],
 [/روضة|الروضه|تصريح|rawdah/i,"rawdah_permit",()=>({})],
 [/كثاف|زحم|زحام|ازدحام|وقت.*(طواف|سعي|روضة)|crowd|busy/i,"get_density",()=>({})],
 [/مصل(ى|ي)|مكان.*(صلاة|أصلي)|إشغال|اشغال|أصلي|اصلي/i,"get_prayer_hall_occupancy",()=>({})],
 [/إشارة|اشارة|أصم|اصم|صم\b|برايل|كفيف|ضعاف|إعاقة|اعاقة/i,"accessibility_services",m=>({need:/إشارة|اشارة|أصم|اصم|صم\b|سمع/.test(m)?"deaf":/برايل|كفيف|بصر/.test(m)?"blind":"mobility"})],
 [/زمزم|ماء|مويه|عطش/i,"find_nearest",()=>({category:"zamzam"})],
 [/حمام|دورة|دورات|وضوء|toilet/i,"find_nearest",()=>({category:"wc"})],
 [/مصعد|سلم|سلالم|elevator|lift/i,"find_nearest",()=>({category:"lift"})],
 [/طبي|عيادة|صيدلية|دواء|هلال|doctor|clinic/i,"find_nearest",()=>({category:"medical"})],
 [/مكتب.*(تائه|مفقود)/i,"find_nearest",()=>({category:"lost"})],
 [/مكيف|ظل|بارد/i,"find_nearest",()=>({category:"lift"})],
 [/مكتبة|معرض|كسوة|زيارة|متحف/i,"book_visit",m=>({place:/كسوة/.test(m)?"kiswa":/معرض|متحف/.test(m)?"exhibition":"library"})],
 [/درس|دروس|صلاة|الصلاة|أذان|اذان|موعد (الصلاة|الأذان|الاذان|الدرس)|متى (الفجر|الظهر|العصر|المغرب|العشاء|الأذان|الاذان|الصلاة|الدرس)/i,"get_lessons_and_prayers",()=>({})],
 [/باب|بوابة|مخرج|gate|exit/i,"find_nearest",()=>({category:"gate"})],
 [/مصلى مخصص|كبار السن/i,"find_nearest",()=>({category:"pray"})],
];
const FOLLOW={my_location:"هذا موقعك من جوالك، وأحدثه كلما تحركت.",invite_member:"من يفتح الرابط يكتب اسمه ويأذن بموقعه فيظهر عندك فورا، ولا يسأل عن صلته لأن الرابط يحملها.",open_threads:"محادثاتك محفوظة على جهازك وتفتح حتى بلا إنترنت.",open_portal:"هذه صفحات الهيئة نفسها، أفتحها لك مباشرة ولا أنسخ منها شيئا.",campaign:"هذه لوحة مرشد الحملة: المجموعة فوق خدمات الهيئة نفسها، لا خدمة جديدة.",trip_plan:"خطتك محفوظة على جهازك، وتتقدم معك خطوة خطوة ولو انقطع الاتصال.",sign_interpreter:"سأبقى معك حتى يصل، وأكتب لك كل شيء.",survey:"رأيك يساعدنا على قياس الأثر، ويبقى على جهازك.",explain_context:"هذا ما أوظفه لتخصيص كل اقتراح لك، ولا أسألك إلا عندما تنقصني معلومة مؤثرة.",mutawwif:"فتحت لك المطوف الرقمي من خدمات الهيئة: الأدعية وعداد الأشواط، وسأذكرك بالماء في منتصف الطواف.",show_map:"هذه خريطتك من الخريطة التفاعلية للهيئة، وعليها ما يخصك أنت.",start_guidance:"أرشدك بالصوت خطوة بخطوة على خريطة الهيئة، وأعيد الحساب إن تغير المسار.",rawdah_route:"هذا طريقك إلى الروضة على خريطة الهيئة، وما يناسبك قبل أن تتحرك.",umrah_now:"جمعت لك كل ما تحتاجه لعمرتك الآن، وأرافقك خطوة بخطوة.",family_setup:"أخبرني من معك لأبقيك على تواصل بهم.",avoid_heat_crowd:"هذا الأخف الآن، وسأنبهك إن تغير.",transport_options:"وعند وصولك إلى الساحات أرشدك خطوة بخطوة.",heat_protection:"وأنبهك بالماء والظل كلما اشتد الحر.",set_language:"تم.",refer_call_center:"لا أجد جواب هذا في مصادري، ولا أخمن؛ اتصل بالرقم الموحد 1966 وهم يجيبونك.",fatwa_refer:"هذا يحتاج فتوى ولا أفتي فيه؛ اتصل مجانا بإجابة السائلين 8001222100، أو اسأل في مواقع الإفتاء داخل المسجد.",medication:"",wellbeing_checkin:"",set_mind_ok:"الحمد لله. أنا معك إن احتجت شيئا.",reset_body:"ممتاز، الحمد لله.",hydration_rest:"لا تنتظر العطش في هذا الحر، وأخبرني عندما تشرب وترتاح.",start_breathing:"تابع الدائرة، وأنا معك. إن شعرت بألم في الصدر أو ضيق نفس شديد فقل لي فورا.",rawdah_guide:"خذ وقتك، وسأذكرك بها عند باب السلام.",waiting_mode:"اجلس مرتاحا، ودورك محفوظ. سأنبهك قبل انتقال فوجك.",plan_prayer:"حجزت لهما ورسمت لك الطريق. سأذكرك بالخروج قبل الإقامة بعشر دقائق، وباستلامهما بعد الصلاة.",confirm_home:"شكرا، لن أسألك عنه مرة أخرى.",set_reminder:"سأنبهك في وقته بالصوت.",track_request:"إن تأخر أكثر من ذلك أخبرني وأتابعه لك.",play_stream:"استمتع، وأوقفه بكلمة «أوقف البث».",family_locate:"إن أردت أحدد لكم نقطة لقاء وأرسلها للجميع، أو أرسل موقعك مباشرة.",set_meeting_point:"إن أردت أدلك إليها بالصوت، أو أبدلها بنقطة أخرى.",share_location:"إن لم يصله، أرسل له رابط المجموعة ليظهر موقعكما لبعضكما.",go_home:"سأبقى معك بالصوت حتى الفندق، وأذكرك بالماء في المنتصف.",update_preferences:"حفظتها، ولن أسألك عنها مرة أخرى. سأراعيها في كل ما أقترحه عليك.",emergency:"اتصل الآن بالرقم في البطاقة، وابق مكانك. أنا معك.",request_cart:"سيصلك تنبيه عند اقتراب الدافع. هل تريد أن أختار لك مصلى قريبا من المصعد بعدها؟",report_lost:"سأبلغك فور أي خبر. إن أردت، أرشدك الآن إلى المكتب ليكون قريبا منك.",book_children_center:"تم. سأذكرك بالاستلام بعد الصلاة بخمس دقائق.",sermon_translation:"وصلت القناة. سأنبهك قبل الخطبة بدقيقتين.",rawdah_permit:"سأنبهك قبل موعدك، والأفضل الوصول قبله بعشر دقائق من باب السلام.",get_density:state=>{if(state.site==="makkah"){const m=LIVE.mataf();if(!m)return "لم أصل إلى قراءة الهيئة الحية الآن، ولا أعطيك رقما من عندي.";const b=m["المطاف"][0];return "الأخف الآن "+b[0]+" ("+LVL[b[1]][0]+")"+(b[2]?"، من باب "+String(b[2]).split("-")[0]:"")+"."}
   if(profile.gender==="f")return "أخبرتك بما يخصك: السلام من القسم المخصص للنساء، والروضة بموعد تصريحك.";
   const lv=LIVE.salam();if(!lv)return "لم أصل إلى قراءة الهيئة الحية الآن، ولا أعطيك رقما من عندي.";return lv===1?"مسار السلام خفيف الآن، 5 إلى 10 دقائق، وقت مناسب.":lv===2?"مسار السلام متوسط الآن، 11 إلى 20 دقيقة.":"مسار السلام كثيف الآن، أكثر من 20 دقيقة."},get_prayer_hall_occupancy:state=>{const h=state.site==="madinah"?LIVE.halls():null;if(!h)return state.site==="madinah"?"لم أصل إلى قراءة الهيئة الحية الآن، ولا أعطيك رقما من عندي.":"";return profile.gender==="f"?"مصلى النساء الأنسب مذكور أعلاه، وأدلك إليه.":"مصلاك الأنسب مذكور أعلاه، وأدلك إليه."},accessibility_services:"أستطيع إرشادك إلى أي منها الآن.",find_nearest:"اضغط «ابدأ الإرشاد» وسأدلك خطوة بخطوة بالصوت.",book_visit:"تم الحجز. سأرسل لك المسار قبل الموعد بربع ساعة.",get_lessons_and_prayers:"هل أذكرك قبل الدرس الذي يناسبك؟"};
function tone(text){const t=String(text);
  const marks=[];if(/[!؟?]{2,}/.test(t))marks.push("علامات تعجب أو استفهام متكررة");if(/([\u0621-\u064Aa-z])\1{2,}/i.test(t))marks.push("حروف ممدودة");
  if(/معصب|غضبان|زعلان|ضايق|متضايق|توتر|متوتر|خايف|مو قادر|ماقدر|ما قدرت|تعبت|زهقت|طفشت|محد يرد|ما أحد|ماحد|خلاص|أبغى أطلع|ابغى اطلع|كرهت|مو معقول|وين الناس|ساعدوني|الحقوني/.test(t))marks.push("كلمات ضيق أو غضب");
  if(/j'en peux plus|ras le bol|n'en peux plus|personne ne|c'est pas possible|au secours|aidez-moi|énervé|enerve|stressé|stresse|inquiet|fatigué/i.test(t))marks.push("كلمات ضيق بالفرنسية");
  const lat=t.replace(/[^A-Za-z]/g,"");if(lat.length>8&&lat.replace(/[^A-Z]/g,"").length/lat.length>0.6)marks.push("كتابة بحروف كبيرة");
  return marks}
async function viaGateway(text){if(!LLM.ok())return null;typing(true);const fz=await LLM.classify(text);if(!fz)return null;let [fname,fargs]=fz;if(fname==="out_of_scope"&&inDomain(text)){fname="refer_call_center";fargs={topic:text.slice(0,80)};LLM.reply=""}const ft=TOOLS[fname];log("sup","فهم الصيغة عبر Claude (بوابة كنف): "+fname,"اختار الأداة من وصفها، والمفتاح على الخادم");await wait(300);ft.run(fargs);
  {const kr=kbTake();if(kr){LLM.reply="";return kr}}
  const rp=LLM.reply||"";LLM.reply="";if(rp){const rl=detectLang(rp)||state.lang||"ar";return {text:rp,say:rp,sayLang:rl}}
  return pick({ar:follow(fname),fr:FOLLOW_FR[fname]||follow(fname),en:(typeof FOLLOW_EN[fname]==="function"?FOLLOW_EN[fname](state):FOLLOW_EN[fname])||follow(fname)})}
function detectLang(text){return /[a-z]{3,}/i.test(text)&&!/[\u0600-\u06FF]/.test(text)?(()=>{if(/[éèêàçùôâîûœ]/.test(text))return "fr";const fr=(text.match(/\b(je|où|ou|est|les|mon|ma|mes|vous|pour|comment|famille|hôtel|retour|prière|chariot|aide|bonjour|merci|moi|vers|le|la|guidez|chemin|aller|emmène|emmenez|suis|avec|une|des|du)\b/gi)||[]).length;const en=(text.match(/\b(the|where|is|are|my|to|how|can|i|need|want|please|me|you|a|an|of|in|what|when|which|take|get|near|nearest|help|family|hotel|back|guide)\b/gi)||[]).length;return fr>en?"fr":"en"})():/[\u0679\u067E\u0686\u0688\u0691\u06BA\u06BE\u06C1\u06CC\u06D2]/.test(text)?"ur":/[\u0600-\u06FF]/.test(text)?"ar":null}
/* لا خدمة ولا جواب من المصادر: داخل نطاق الحج والعمرة يحال إلى 1966، وخارجه: خارج نطاق معرفتي، والتحية تعرض ما يقدمه كنف */
function noMatch(text){if(/^\s*(السلام عليكم|سلام عليكم|سلام|مرحبا|مرحباً|اهلا|أهلا|هلا|هلا والله|صباح الخير|مساء الخير|hi|hello|salam|bonjour|salut)(\s|$|[!.،,؟?])/i.test(text)){log("sup","تحية بلا طلب","يعرض ما يقدمه");return pick({ar:GENERIC.ar,fr:GENERIC.fr,en:GENERIC.en})}
  if(inDomain(text)){TOOLS.refer_call_center.run({topic:text.slice(0,80)});return kbTake()}
  TOOLS.out_of_scope.run();return kbTake()}
async function scripted(text){
  log("sup","قرأ الطلب والسياق","يصنف النية ويختار الوكيل");
  await wait(500);
  /* with the gateway available, free-form sentences go to Claude first; short commands and quick chips stay local for speed */
  /* الطلبات الصريحة عن الوصول والفتوى تحسم محليا قبل البوابة حتى لا تذهب إلى الخريطة */
  /* مراجع المعرفة أولا: سؤال معرفي جوابه في الأدلة الرسمية يجاب منها مباشرة بلا تخمين */
  const EARLY=["save_camp","find_camp","mashaer_guide"];const early=!state.fromChip&&ROUTES.some(([re,name,,guard])=>EARLY.includes(name)&&re.test(text)&&(!guard||guard(text)));
  if(!early){const nq=kbNorm(text);const kx=KB.find(x=>x.t===text.trim());const kb=kx?{e:kx,s:9}:(state.fromChip?null:kbMatch(text));
   const qcue=/[؟?]/.test(text)||/ (ما|ماهي|ماهو|ايش|وش|شو|كيف|متى|هل|كم|لماذا|ليش|ماذا|اشرح|عرفني|علمني|اعرف) /.test(nq);
   const bare=nq.trim().split(" ").length<=4;const loc=/ (وين|فين|اين|دلني|دليني|وديني|خذني|اقرب) /.test(nq);
   const price=/ (سعر|اسعار|بكم|كم سعر|كم يكلف|تكلفه|رسوم|كم الرسوم) /.test(nq)&&!/ريال/.test(kb?kb.e.a.join(" "):"");
   if(kb&&!price&&(kx||qcue||bare)&&!(loc&&ROUTES.some(([re,,,guard])=>re.test(text)&&(!guard||guard(text))))){log("sup","سؤال معرفي جوابه في الأدلة الرسمية","يجيب من المصدر: "+kb.e.t);await wait(250);state.kbQ=text;TOOLS.knowledge_answer.run({topic:kb.e.t});state.kbQ="";const kr=kbTake();if(kr)return kr}}
  /* سؤال يخص الحملة نفسها (برنامجها وحافلاتها وتفويجها ووجباتها وسكنها): يحال إلى الحملة لا إلى 1966 */
  if(!early){const nq=kbNorm(text);if(!state.fromChip&&campQ(text)&&/(حمل|تفويج|وجبات|اعاشه|مخيم|عفش|تسكين|استرداد|باقه|نتحرك|التحرك|تجمع|جدول)/.test(nq)&&!/^ ?(اتصل|اتصلي|كلم|كلمي|دق|رن) /.test(nq)){const sch=SCHED_RE.test(nq);log("sup",sch?"سؤال عن جدول الحملة":"سؤال يخص الحملة نفسها",sch?"يعرض ما زودت به الحملة أو يحيل إليها":"يحيله إلى الحملة");await wait(250);(sch?TOOLS.campaign_schedule:TOOLS.call_campaign).run({question:text});const kr=kbTake();if(kr)return kr}}
  const LOCAL_FIRST=["save_camp","find_camp","mashaer_guide","transport_options","fatwa_refer","call_campaign","share_location","family_locate","set_meeting_point","invite_member","set_campaign","plan_mail"];const lf=ROUTES.find(([re,name,,guard])=>LOCAL_FIRST.includes(name)&&re.test(text)&&(!guard||guard(text)));
  if(LLM.ok()&&!state.fromChip&&!lf){const g=await viaGateway(text);if(g)return g}
  if(/^\s*(دلني|أرشدني|ارشدني|وجهني|دليني)\s*[.؟!]?\s*$/i.test(text)&&!state.lastDest){
    log("sup","طلب إرشاد بلا وجهة","يعرض الخريطة ويسأل إلى أين");await wait(300);TOOLS.show_map.run({});
    return pick({ar:"إلى أين أدلك؟ هذه خريطتك الآن: اختر أقرب عربة أو زمزم أو قل لي اسم المكان.",fr:"Où voulez-vous aller ? Voici votre carte.",en:"Where to? Here is your map."})}
  if(/ابدأ الإرشاد|ابدا الارشاد|وجهني|دلني على الطريق|^\s*(دلني|أرشدني|ارشدني|دليني)\s*[.؟!]?\s*$|commencer le guidage|guide-moi|guidez-moi|start guidance|guide me/i.test(text)){
    const m=text.match(/إلى (.+)$|vers (.+)$|to (.+)$/);const dest=(m&&(m[1]||m[2]||m[3]))||state.lastDest||"الوجهة";
    log("sup","وجه إلى وكيل الإرشاد","أداة: start_guidance");await wait(300);guidance(dest.replace(/^نقطة اللقاء$/,state.lastDest||dest),state.lastDist||150);
    if(/^موقع /.test(dest))return pick({ar:"أدلك إليه بالمسافة والاتجاه من جوالكما، وأنبهك عندما تقترب.",fr:"Je vous guide vers lui par la distance et la direction de vos deux téléphones.",en:"I guide you to them by distance and direction from both phones."});
    return pick({ar:"أرشدك بالصوت خطوة بخطوة، وأعيد الحساب إن تغير المسار.",fr:"Je vous guide par la voix, étape par étape.",en:"I will guide you by voice, step by step."})}
  if(state.lang==="en"){const en=EN_ROUTES.find(([re])=>re.test(text));
    if(!en){const g=await viaGateway(text);if(g)return g;return noMatch(text)}
    const spec=en[1];const name=Array.isArray(spec)?spec[0]:spec;const wm=text.match(/where (?:is|are) (?:my )?(\S+?)\??$/i);const args=name==="set_language"?{lang:langFromText(text)||""}:Array.isArray(spec)?spec[1]:(name==="family_locate"&&wm&&!/family|son|wife|kids|children|group/i.test(wm[1])?{member:wm[1]}:name==="report_lost"?{type:"person",description:text}:name==="share_location"?{member:(text.match(/(?:to|with|call)\s+(?:my\s+)?(\S+?)\??$/i)||[])[1]||""}:name==="book_children_center"?{children:2}:name==="request_cart"?{kind:"wheelchair"}:{});
    const t=TOOLS[name];log("sup","وجه إلى "+AGENTS.find(a=>a[0]===t.agent)[1],"أداة: "+name+" · الرد بالإنجليزية");await wait(400);t.run(args);const fe=FOLLOW_EN[name];const et=typeof fe==="function"?fe(state):fe;return pick({ar:follow(name),fr:FOLLOW_FR[name]||follow(name),en:et||follow(name)})}
  if(state.lang==="fr"){const fr=FR_ROUTES.find(([re])=>re.test(text));
    if(!fr){const g=await viaGateway(text);if(g)return g;return noMatch(text)}
    const spec=fr[1];const name=Array.isArray(spec)?spec[0]:spec;const args=Array.isArray(spec)?spec[1]:(name==="report_lost"?{type:"person",description:text}:name==="share_location"?{member:(text.match(/(?:to|with|call)\s+(?:my\s+)?(\S+?)\??$/i)||[])[1]||""}:name==="book_children_center"?{children:2}:name==="request_cart"?{kind:"wheelchair"}:{});
    const t=TOOLS[name];log("sup","وجه إلى "+AGENTS.find(a=>a[0]===t.agent)[1],"أداة: "+name+" · الرد بالفرنسية");await wait(400);t.run(args);return pick({ar:follow(name),fr:FOLLOW_FR[name]||"C'est fait.",en:FOLLOW_FR[name]||"Done."})}
  const r=ROUTES.find(([re,,,guard])=>re.test(text)&&(!guard||guard(text)));
  if(!r){let fz=null;if(LLM.ok()){typing(true);fz=await LLM.classify(text);if(fz&&fz[0]==="out_of_scope"&&inDomain(text)){fz=["refer_call_center",{topic:text.slice(0,80)}];LLM.reply=""}if(fz)log("sup","فهم الصيغة عبر Claude (بوابة كنف): "+fz[0],"اختار الأداة من وصفها، والمفتاح على الخادم")}
    if(!fz){const nq=kbNorm(text);const feel=/(تعب|دايخ|ضايع|ضعت|تهت|خايف|قلق|عطش|جوع|زعلان|ضيق|مرهق|حر|ضاع)/.test(nq);
      const qcue=/[؟?]/.test(text)||/ (ما|ماهي|ماهو|ايش|وش|شو|كيف|متى|هل|كم|لماذا|ليش|ماذا|من) /.test(nq);
      if(!inDomain(text)&&!feel)return noMatch(text);
      fz=fuzzyIntent(text);if(fz&&qcue&&(fz.score||0)<4&&!feel)fz=null}
    if(fz){const [fname,fargs]=fz;const ft=TOOLS[fname];const viaLLM=/عبر Claude/.test(trace.lastChild&&trace.lastChild.innerText||"");if(!viaLLM)log("sup","فهم النية تقريبيا: "+fname,"مطابقة بالكلمات المفتاحية");await wait(400);ft.run(fargs);
      if(viaLLM&&LLM.reply){const rp=LLM.reply;LLM.reply="";const rl=detectLang(rp)||state.lang||"ar";return {text:rp,say:rp,sayLang:rl}}
      {const kr=kbTake();if(kr){LLM.reply="";return kr}}
      return pick({ar:follow(fname),fr:FOLLOW_FR[fname]||follow(fname),en:(typeof FOLLOW_EN[fname]==="function"?FOLLOW_EN[fname](state):FOLLOW_EN[fname])||follow(fname)})}
    return noMatch(text)}
  const [,name,args]=r;const t=TOOLS[name];
  log("sup","وجه إلى "+AGENTS.find(a=>a[0]===t.agent)[1],"أداة: "+name);
  await wait(400);t.run(args(text));
  {const kr=kbTake();if(kr)return kr}
  return pick({ar:follow(name),fr:FOLLOW_FR[name]||follow(name),en:(typeof FOLLOW_EN[name]==="function"?FOLLOW_EN[name](state):FOLLOW_EN[name])||follow(name)});
}
