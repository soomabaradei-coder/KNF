/* ---------- judge mode: phone only, and a 30-second onboarding that builds the viewer's own profile ---------- */
function onboard(){
  log("sup","تعارف أول مرة","يبني كنف ملف الضيف من إجاباته، ويتعلم الباقي من المحادثة");
  const c=card(head("👋","أهلا بك، أنا كنف","تعارف قصير")+`<div class="onb"><div>أرافقك في الحرمين وأرعى عافيتك. أعرف موقعك ووقتك والطقس تلقائيا، وأحتاج منك ثلاث إجابات فقط، والباقي أتعلمه من حديثك.</div>
    <label>ما اسمك؟ <input id="obName" type="text" placeholder="اسمك" autocomplete="off"></label>
    <div class="lbl">كيف تمشي؟</div><div class="opts" data-ob="mobility"><button type="button" data-v="walk">بلا مساعدة</button><button type="button" data-v="slow" aria-pressed="true">أتعب من المشي الطويل</button><button type="button" data-v="cart">أحتاج عربة</button></div>
    <div class="lbl">من معك؟</div><div class="opts" data-ob="kids"><button type="button" data-v="0" aria-pressed="true">وحدي أو مع كبار</button><button type="button" data-v="2">معي أطفال</button></div>
    <div class="lbl">السمع</div><div class="opts" data-ob="hearing"><button type="button" data-v="0" aria-pressed="true">طبيعي</button><button type="button" data-v="1">أصم أو ضعيف سمع</button></div>
    <div class="lbl">ما يريحك؟</div><div class="opts" data-ob="quiet"><button type="button" data-v="1" aria-pressed="true">مصلى هادئ</button><button type="button" data-v="0">لا يهم</button></div>
    <div class="acts"><button type="button" class="primary" id="obGo">ابدأ معي</button><button type="button" id="obDemo">جرب بشخصية عبدالرحمن</button></div>
    <div style="font-size:.72rem;color:var(--muted)">لغتك أتعرف عليها من أول رسالة تكتبها. بياناتك تبقى على جهازك. هذا نموذج أولي: خدمات الهيئة والموقع والطقس وقراءات الصحة محاكاة ببيانات معلنة، لا ربط فعلي بعد.</div></div>`);
  c.querySelectorAll(".opts[data-ob] button").forEach(b=>b.addEventListener("click",()=>{b.parentElement.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed","false"));b.setAttribute("aria-pressed","true")}));
  const finish=()=>{state.onboarded=true;try{localStorage.setItem("hafi.onboarded","1")}catch(_){}c.remove();const s=site();
    msg("sys","أهلا "+profile.name+" في "+s.name+". أعرف موقعك ووقتك والكثافة حولك، وسأتعلم ما تفضله من حديثك.");renderKnown();proactive()};
  c.querySelector("#obGo").addEventListener("click",()=>{const n=c.querySelector("#obName").value.trim();
    const v=k=>c.querySelector(`.opts[data-ob="${k}"] [aria-pressed="true"]`).dataset.v;
    Object.assign(profile,{name:n||"ضيف الرحمن",age:"",from:"",langs:"",mobility:v("mobility"),kids:+v("kids"),quiet:+v("quiet"),lessons:0,rest:1,hearing:+v("hearing"),tawafFloor:v("mobility")==="walk"?0:1,stage:"arrive",meds:[],family:[],readLang:DEV_LANG,speakLang:DEV_LANG});
    for(const k of ["name","age","from","langs","mobility","kids","quiet","hearing"])SRC[k]="من تعارفك";SRC.family="لم تضف أحدا بعد";
    saveProfile();log("sup","بنى ملف الضيف من التعارف",profile.name+" · "+{walk:"يمشي",slow:"يتعب من المشي",cart:"عربة"}[profile.mobility]+(profile.kids?" · معه أطفال":""));finish()});
  c.querySelector("#obDemo").addEventListener("click",()=>{Object.assign(profile,JSON.parse(JSON.stringify(DEFAULT_PROFILE)));saveProfile();log("sup","حمل شخصية العرض: عبدالرحمن","");finish()})}

$("#agents").innerHTML=AGENTS.map(([id,n,d])=>`<div class="ag" data-id="${id}"><b>${n}</b><span>${d}</span></div>`).join("");
