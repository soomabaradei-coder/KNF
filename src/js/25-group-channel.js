/* ---------- group channel for self-hosted copies (GitHub Pages / inside the platform): a public MQTT broker over WebSocket. Demo only: open broker, anonymous, group code in the link ---------- */
function groupCode(){const q=new URLSearchParams(location.search);let g=(q.get("g")||"").replace(/[^A-Za-z0-9]/g,"").toUpperCase();let prev="";try{prev=localStorage.getItem("knf_group")||""}catch(_){}if(g)state.joinedViaLink=true;const rr=(q.get("r")||"").slice(0,42);const by=(q.get("by")||"").slice(0,30);if(g&&by){state.joinBy=by;try{localStorage.setItem("knf_by",by)}catch(_){}}else if(!g){try{state.joinBy=localStorage.getItem("knf_by")||""}catch(_){}}if(g&&rr){state.joinRel=rr;try{localStorage.setItem("knf_rel",rr)}catch(_){}}else if(!g){try{state.joinRel=localStorage.getItem("knf_rel")||""}catch(_){}}else{state.joinRel="";try{localStorage.removeItem("knf_rel")}catch(_){}}if(!g){g=prev}if(!g){g=Math.random().toString(36).slice(2,6).toUpperCase()}try{localStorage.setItem("knf_group",g)}catch(_){}return g}
async function mqttRoom(){
  if(LIVE.sandboxed()||state.offline||location.protocol==="file:")return null;
  const code=groupCode();state.groupCode=code;
  const load=u=>new Promise((res,rej)=>{const sc=document.createElement("script");sc.src=u;sc.onload=res;sc.onerror=()=>rej(new Error("load"));document.head.appendChild(sc)});
  try{if(!window.mqtt)await load("https://cdn.jsdelivr.net/npm/mqtt@5/dist/mqtt.min.js")}catch(_){try{await load("https://unpkg.com/mqtt@5/dist/mqtt.min.js")}catch(e){log("svc","قناة المجموعة غير متاحة","تعذر تحميل مكتبة الاتصال");return null}}
  const myId=(()=>{try{let v=localStorage.getItem("knf_peer");if(!v){v="p"+Math.random().toString(36).slice(2,10);localStorage.setItem("knf_peer",v)}return v}catch(_){return "p"+Date.now()}})();
  const topic="kanaf/demo/"+code+"/presence/";
  let client;try{client=mqtt.connect("wss://broker.emqx.io:8084/mqtt",{connectTimeout:8000,keepalive:30,clean:true,clientId:"knf_"+myId+"_"+Math.random().toString(36).slice(2,6),will:{topic:topic+myId,payload:"",retain:true,qos:0}})}catch(e){return null}
  const peers=new Map();let handler=null;let mine={};
  const wrap=p=>({peer:p.id,presence:p,kind:"viewer",sameTab:false,isMe:false,guest:false});
  const emit=(joined=[],left=[])=>{if(handler)handler({peers:[...peers.values()].map(wrap),joined:joined.map(wrap),left:left.map(wrap)})};
  const ok=await new Promise(res=>{const t=setTimeout(()=>res(false),9000);client.on("connect",()=>{clearTimeout(t);res(true)});client.on("error",()=>{clearTimeout(t);res(false)})});
  if(!ok){log("svc","قناة المجموعة غير متاحة الآن","تعذر الاتصال بخادم الرسائل العام");try{client.end(true)}catch(_){}return null}
  const callTopic="kanaf/demo/"+code+"/call/";client.subscribe(topic+"+");client.subscribe(callTopic+myId);
  client.on("message",(tp,m)=>{if(tp.startsWith(callTopic)){try{const sg=JSON.parse(m.toString());if(sg&&sg.from&&sg.from!==myId)CALL.onSignal(sg)}catch(_){}return}const id=tp.slice(topic.length);if(!id||id===myId)return;const str=m.toString();if(!str){const p=peers.get(id);if(p){peers.delete(id);emit([],[p])}return}try{const p=JSON.parse(str);p.id=id;const isNew=!peers.has(id);peers.set(id,p);emit(isNew?[p]:[],[])}catch(_){}});
  const pub=()=>{if(client.connected)client.publish(topic+myId,JSON.stringify(Object.assign({},mine,{t:Date.now()})),{retain:true})};
  setInterval(()=>{const now=Date.now();const gone=[];peers.forEach((p,id)=>{if(now-(+p.t||0)>150000){peers.delete(id);gone.push(p)}});if(gone.length)emit([],gone);pub()},20000);
  window.addEventListener("beforeunload",()=>{try{client.publish(topic+myId,"",{retain:true})}catch(_){}});
  log("svc","قناة المجموعة جاهزة (عرض تجريبي عبر خادم رسائل عام)","رمز المجموعة "+code+" · من يفتح الرابط بالرمز نفسه يظهر هنا");try{$("#locText").insertAdjacentHTML("beforeend"," · مجموعة <b>"+esc(code)+"</b>")}catch(_){}
  if(state.joinedViaLink&&!profile.selfNamed){setTimeout(()=>{const w=relWord(state.joinRel);msg("sys","فتحت رابط مجموعة كنف "+code+(w?" بوصفك: "+w:"")+". اكتب اسمك لتظهر لمن أرسل لك الرابط.");log("svc","انضم عبر رابط المجموعة "+code,w?"الصلة من الرابط: "+w:"بلا صلة محددة")},600)}
  return{presence(p){mine=Object.assign({},p);pub()},onPeers(fn){handler=fn;emit()},send(to,payload){if(client.connected)client.publish(callTopic+to,JSON.stringify(payload))},myId,code};
}
