/* ---------- saved conversations (threads): the guest returns to them, offline too ---------- */
const THR={list:[],cur:null,
  load(){try{const j=JSON.parse(localStorage.getItem("knf_threads")||"null");if(j){this.list=j.list||[];this.cur=j.cur||null}}catch(_){}},
  save(){try{localStorage.setItem("knf_threads",JSON.stringify({list:this.list.slice(0,30),cur:this.cur}))}catch(_){}},
  get(id){return this.list.find(t=>t.id===id)},
  topic(t){return /روض|السلام على النبي|مسار السلام|أسلم على/.test(t)?"زيارة الروضة":/عمر[ةه]|طواف|سعي|مطوف|أشواط/.test(t)?"العمرة":/عائل|يوسف|خديج|لقاء|بعدت/.test(t)?"العائلة":/عرب[ةه]|كرسي/.test(t)?"العربة":/صلا[ةه]|أصلي|اصلي|مصل/.test(t)?"الصلاة":/دوا|حبوب/.test(t)?"الدواء":/خط[ةه]|جهز رحلتي|خطتي/.test(t)?(state.site==="makkah"?"خطة العمرة":"خطة زيارة الروضة"):/حمل[ةه]/.test(t)?"الحملة":null},
  ensure(){if(this.cur&&this.get(this.cur))return this.get(this.cur);const t={id:"t"+Date.now(),title:"محادثة جديدة",site:state.site,at:Date.now(),html:"",n:0,plan:false};this.list.unshift(t);this.cur=t.id;return t},
  touch(userText){if(/محادثاتي|المحادثات السابقة|محادث[ةه] سابق[ةه]|افتح محادثة/.test(userText||""))return;const t=this.ensure();if(userText){t.n++;if(t.title==="محادثة جديدة"){t.title=this.topic(userText)||userText.slice(0,28)}}if(/خط[ةه]|جهز رحلتي/.test(userText||""))t.plan=true;this.sched()},
  sched(){clearTimeout(this._t);this._t=setTimeout(()=>{const t=this.cur&&this.get(this.cur);if(!t)return;t.html=feed.innerHTML;t.at=Date.now();t.site=state.site;this.save();this.render()},400)},
  open(id){const t=this.get(id);if(!t)return;this.cur=id;if(t.site!==state.site){state.site=t.site;document.querySelectorAll('[data-k="site"]').forEach(x=>x.setAttribute("aria-pressed",x.dataset.v===t.site))}
    feed.innerHTML=t.html;feed.scrollTop=feed.scrollHeight;$("#threads").hidden=true;this.save();this.render();log("sup","فتح محادثة محفوظة",t.title+" · من جهاز الضيف"+(state.offline?" · بلا إنترنت":""));renderQuick&&renderQuick()},
  remove(id){this.list=this.list.filter(t=>t.id!==id);if(this.cur===id)this.cur=null;this.save();this.render()},
  render(){const el=$("#thrList");if(!el)return;const when=ms=>{const d=new Date(ms);return d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0")};
    el.innerHTML=this.list.length?this.list.map(t=>`<div class="row ${t.id===this.cur?"cur":""}" data-open="${t.id}"><div><b>${esc(t.title)}</b><small>${t.site==="makkah"?"المسجد الحرام":"المسجد النبوي"} · ${when(t.at)} · ${t.n} ${t.n===1?"رسالة":"رسائل"}</small></div>${t.plan?'<span class="pl">فيها خطة</span>':""}<button class="del" data-del="${t.id}" title="حذف">حذف</button></div>`).join(""):'<div class="hint">لا توجد محادثات محفوظة بعد. كل محادثة تبدئينها تحفظ هنا تلقائيا بعنوان موضوعها.</div>'}
};
function autoDir(m){const t=(m.textContent||"").replace(/[\d\s°%·.,:()\-+]/g,"");const ar=(t.match(/[\u0600-\u06FF]/g)||[]).length,lat=(t.match(/[A-Za-z\u00C0-\u024F]/g)||[]).length;m.setAttribute("dir",lat>ar?"ltr":"rtl");m.style.textAlign=lat>ar?"left":"right";return m}
function msg(kind,text){if(kind==="user"&&state.chipLabel){text=state.chipLabel;state.chipLabel=""}const m=push(el(`<div class="msg ${kind}"></div>`));m.textContent=text;autoDir(m);if(kind==="user")THR.touch(text);else TRX.el(m);
  if(kind==="bot"){let en=false;try{en=isEN()}catch(_){}m.dataset.who=en?"KNF Bushra Hospitality":"كنف بشرى الضيافة";
    /* أسئلة التعارف التي تنتظر جوابا تظهر بارزة وتنبه خانة الكتابة */
    if(state.onb&&/[؟?]/.test(String(text||""))){m.classList.add("ask");m.dataset.who=en?"KNF asks you":"كنف بشرى الضيافة يسألك";try{const b=document.getElementById("box");b.classList.remove("await");void b.offsetWidth;b.classList.add("await")}catch(_){}}}
  return m}
function card(html,cls=""){if(metrics.task&&!metrics.task.served&&!/📊|📈/.test(html.slice(0,40)))taskServed(cls);const c=autoDir(push(el(`<div class="card ${cls}">${html}</div>`)));TRX.el(c);return c}
/* لغة واحدة على الشاشة: إذا كانت لغة الضيف غير العربية تترجم بطاقات كنف ورسائله العربية (ومنها نصوص الأدلة الرسمية) إلى لغته عبر بوابة كنف، بأمانة ودون إضافة، وتحفظ الترجمة */
/* الترجمة إلى لغة الضيف (الإصدار 206): كل نص عربي يظهر في المحادثة يمر هنا، حتى ما يضاف إلى البطاقة بعد ظهورها.
   ذاكرة على الجهاز حتى لا تتكرر الترجمة، وإن فشلت دفعة قسمتها نصفين ثم نصا نصا، والبطاقة شبه مخفية حتى تترجم فلا يقرأ الضيف لغتين */
const TRX={cache:new Map(),wait:new Map(),outs:new Set(),loaded:"",need(){try{return uiLang()!=="ar"&&LLM.ok()}catch(_){return false}},
  load(to){if(this.loaded===to)return;this.loaded=to;try{const o=JSON.parse(localStorage.getItem("knf_trx_"+to)||"{}");for(const k in o){this.cache.set(to+"|"+k,o[k]);this.outs.add(String(o[k]).trim())}}catch(_){}},
  save(to){clearTimeout(this._sv);this._sv=setTimeout(()=>{try{const o={};let n=0;const pre=to+"|";const ks=[...this.cache.keys()].filter(k=>k.startsWith(pre));for(const k of ks.slice(-800)){o[k.slice(pre.length)]=this.cache.get(k);n++}localStorage.setItem("knf_trx_"+to,JSON.stringify(o))}catch(_){}},800)},
  fetchChunk(base,to,ch){return fetch(base+"/translate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({to,texts:ch})}).then(r=>r.ok?r.json():null).catch(()=>null).then(j=>{
    if(j&&Array.isArray(j.out)&&j.out.length===ch.length){ch.forEach((t,i)=>{if(j.out[i]){this.cache.set(to+"|"+t,j.out[i]);this.outs.add(String(j.out[i]).trim())}});this.save(to);return}
    if(ch.length>1){const h=Math.ceil(ch.length/2);return Promise.all([this.fetchChunk(base,to,ch.slice(0,h)),this.fetchChunk(base,to,ch.slice(h))])}})},
  el(root){if(!root||!this.need())return;const to=uiLang();this.load(to);const AR=/[؀-ۿ]/;
    /* وحدات الترجمة: الجملة كاملة (فقرة أو خانة أو زر) حتى تبقى الترجمة سليمة، والنصوص المتبقية عقدة عقدة */
    const units=[];root.querySelectorAll("p,dd,dt,div,li,button,small,b,label,a,span").forEach(e=>{if(e.closest(".notr,script,style,.msg.user"))return;if(units.some(u=>u.contains(e)))return;const kids=[...e.children];if(AR.test(e.textContent)&&kids.every(k=>/^(B|I|EM|STRONG|BR)$/.test(k.tagName))&&e.textContent.trim().length<=1500)units.push(e)});
    const nodes=[];const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>AR.test(n.nodeValue)&&!(n.parentElement&&n.parentElement.closest("script,style,textarea,input,.notr,.msg.user"))&&!units.some(u=>u.contains(n))?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});let n;while((n=w.nextNode()))nodes.push(n);if(!nodes.length&&!units.length)return;
    const key=t=>to+"|"+t;const all=[...units.map(u=>u.textContent.trim()),...nodes.map(x=>x.nodeValue.trim())];
    const apply=()=>{for(const u of units){const v=this.cache.get(key(u.textContent.trim()));if(v)u.textContent=v}for(const x of nodes){const t=x.nodeValue.trim();const v=this.cache.get(key(t));if(v){const lead=x.nodeValue.match(/^\s*/)[0],tail=x.nodeValue.match(/\s*$/)[0];x.nodeValue=lead+v+tail}}autoDir(root);root.querySelectorAll("dd,dt,p,div,small,b,button,a,span").forEach(e=>{if(!AR.test(e.textContent))e.setAttribute("dir","ltr")});root.style.opacity=""};
    const waits=[];const todo=[];for(const t of new Set(all)){if(!t||this.cache.has(key(t))||this.outs.has(t))continue;const pw=this.wait.get(key(t));if(pw)waits.push(pw);else todo.push(t)}
    if(!todo.length&&!waits.length){apply();return}root.style.transition="opacity .2s";root.style.opacity=".08";
    const base=LLM.url.replace(/\/$/,"");const chunks=[];for(let i=0;i<todo.length;i+=40)chunks.push(todo.slice(i,i+40));
    const mine=Promise.all(chunks.map(ch=>this.fetchChunk(base,to,ch)));todo.forEach(t=>this.wait.set(key(t),mine));
    mine.then(()=>todo.forEach(t=>this.wait.delete(key(t))));
    Promise.all([mine,...waits]).then(apply,apply);
    setTimeout(()=>{root.style.opacity=""},9000)}};
/* ما يضاف إلى المحادثة بعد ظهور البطاقة (رابط حي، سطر حالة) يترجم أيضا */
{const pend=new Set();let tm=0;try{new MutationObserver(ms=>{if(!TRX.need())return;const AR=/[؀-ۿ]/;for(const m of ms){for(const nd of m.addedNodes){const t=nd.nodeType===3?nd.nodeValue:(nd.textContent||"");if(!AR.test(t))continue;const e=nd.nodeType===3?nd.parentElement:nd;if(!e||!e.closest)continue;if(e.closest(".msg.user,.notr,script,style"))continue;const r=e.closest(".card,.msg")||e;pend.add(r)}}
  if(pend.size){clearTimeout(tm);tm=setTimeout(()=>{const a=[...pend];pend.clear();a.forEach(r=>{if(r.isConnected)TRX.el(r)})},60)}}).observe(document.getElementById("feed"),{childList:true,subtree:true})}catch(_){}}
function head(ic,title,sub){return `<div class="h"><span class="ic">${ic}</span><b>${esc(title)}</b>${sub?`<small>${esc(sub)}</small>`:""}</div>`}
const ICON={map:"🗺️",crowd:"👥",cart:"♿",lost:"🔎",kids:"🧒",tr:"🎧",pray:"🕌",med:"🩺",sun:"☀️",book:"📚",cal:"🗓️",tick:"🎫"};
let t0=Date.now();
function log(who,what,sub){
  if(trace.querySelector(".empty"))trace.innerHTML="";
  const a=AGENTS.find(x=>x[0]===who);
  const n=el(`<div class="tr"><span class="who ${who==="sup"?"sup":""}">${esc(a?a[1]:who)}</span><span class="what">${esc(what)}${sub?`<small>${esc(sub)}</small>`:""}</span><time>+${((Date.now()-t0)/1000).toFixed(1)}s</time></div>`);
  trace.appendChild(n);trace.scrollTop=trace.scrollHeight;
  document.querySelectorAll(".ag").forEach(x=>x.classList.toggle("active",x.dataset.id===who));
}
function typing(on){let t=feed.querySelector(".typing");if(on&&!t){push(el('<div class="typing"><i></i><i></i><i></i></div>'))}else if(!on&&t)t.remove()}
function walk(m){return Math.max(1,Math.round(m/70))}

