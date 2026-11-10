/* ---------- طبقة قياس الخدمات للهيئة: أي خدمة طلبت، متى، من أي منطقة، وبأي لغة. بلا أي بيانات شخصية ---------- */
const EVT={list:[],client:null,id:null,
  load(){try{this.list=JSON.parse(localStorage.getItem("knf_events")||"[]")}catch(_){this.list=[]}},
  zone(){const r=state.real;if(!r||typeof r.km!=="number")return "بلا تحديد موقع";if(r.km>=0.6&&typeof r.la==="number"&&masarPos(r.la,r.lo).in)return "وجهة مسار (المدخل الغربي)";return r.km<0.6?"داخل المسجد وساحاته":r.km<1.5?"المنطقة المركزية":r.km<5?"داخل المدينة":"خارج المدينة"},
  seg(){const age=+profile.age||0;if(profile.mobility==="cart"||profile.hearing)return "ذوو احتياجات خاصة";if(age>=60)return "كبار السن";if((+profile.kids||0)>0)return "عائلات مع أطفال";return "عام"},
  add(tool){if(!TOOL_AR[tool])return;const e={at:Date.now(),tool,svc:svcName(tool,state.site),site:state.site,lang:state.lang||"ar",zone:this.zone(),seg:this.seg(),online:!state.offline,how:!state.busy?"اقتراح من الوكيل":state.fromChip?"زر سريع":"كتابة أو صوت"};
    this.list.push(e);this.list=this.list.slice(-400);try{localStorage.setItem("knf_events",JSON.stringify(this.list))}catch(_){}this.pub()},
  mark(k){const e=this.list[this.list.length-1];if(!e||Date.now()-e.at>4000||e[k])return;e[k]=1;try{localStorage.setItem("knf_events",JSON.stringify(this.list))}catch(_){}this.pub()},
  devId(){if(this.id)return this.id;try{let v=localStorage.getItem("knf_peer");if(!v){v="p"+Math.random().toString(36).slice(2,10);localStorage.setItem("knf_peer",v)}this.id=v}catch(_){this.id="p"+Date.now()}return this.id},
  payload(){return JSON.stringify({dev:this.devId(),t:Date.now(),site:state.site,events:this.list.slice(-300),ratings:metrics.log.slice(-200)})},
  async pub(){if(LIVE.sandboxed()||state.offline||location.protocol==="file:")return;
    try{if(!this.client){if(!window.mqtt){await new Promise((res,rej)=>{const sc=document.createElement("script");sc.src="https://cdn.jsdelivr.net/npm/mqtt@5/dist/mqtt.min.js";sc.onload=res;sc.onerror=rej;document.head.appendChild(sc)})}
        this.client=mqtt.connect("wss://broker.emqx.io:8084/mqtt",{connectTimeout:8000,keepalive:60,clean:true,clientId:"knfe_"+this.devId()+"_"+Math.random().toString(36).slice(2,6)});
        await new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error("timeout")),9000);this.client.on("connect",()=>{clearTimeout(t);res()});this.client.on("error",()=>{clearTimeout(t);rej(new Error("mqtt"))})});
        log("api","قناة قياس الخدمات جاهزة","تصل للوحة الهيئة الخدمة والوقت والمنطقة واللغة فقط، بلا بيانات شخصية")}
      if(this.client.connected)this.client.publish("kanaf/demo/evt/"+this.devId(),this.payload(),{retain:true})}catch(e){this.client=null}}};
EVT.load();
function svgMap(dist){
  const s=state.site==="makkah";
  const px=Math.min(230,40+dist*0.6);
  return `<svg class="map" viewBox="0 0 320 120" role="img" aria-label="مخطط تقريبي للمسار">
   <rect x="0" y="0" width="320" height="120" fill="transparent"/>
   ${s?`<rect x="135" y="40" width="50" height="50" rx="4" fill="var(--kiswa)"/><circle cx="160" cy="65" r="38" fill="none" stroke="var(--line)" stroke-dasharray="3 3"/><text x="160" y="110" font-size="9" text-anchor="middle" fill="var(--muted)">المطاف</text>`
      :`<rect x="110" y="35" width="100" height="55" rx="6" fill="var(--kiswa)"/><circle cx="135" cy="62" r="14" fill="var(--kiswa2)" stroke="var(--gold2)" stroke-width="1.5"/><text x="160" y="110" font-size="9" text-anchor="middle" fill="var(--muted)">المسجد النبوي</text>`}
   <circle cx="270" cy="95" r="6" fill="var(--info)"/><text x="270" y="82" font-size="9" text-anchor="middle" fill="var(--fg)">أنت</text>
   <path d="M270 95 C 240 95, ${270-px} 60, ${270-px} 40" fill="none" stroke="var(--gold)" stroke-width="2.5" stroke-dasharray="6 4"/>
   <circle cx="${270-px}" cy="40" r="7" fill="var(--gold)"/><text x="${270-px}" y="28" font-size="9" text-anchor="middle" fill="var(--fg)">الوجهة</text>
  </svg>`;
}
function famPositions(){const me=state.real;const live=livePeers();
  /* لا مواقع مفترضة: المتصل الآن يأخذ موقعه الحي، ومن انقطع يأخذ آخر موقع وصل منه فعلا، ومن لم يفتح الرابط لا موقع له */
  return (profile.family||[]).map(f=>{const l=live.find(p=>p.name.replace(" (جهاز آخر)","")===f.name);if(l)return Object.assign({},f,{live:1,sharing:1,where:l.where,dist:l.dist,ago:l.ago,dir:l.dir,la:l.la,lo:l.lo,prel:l.prel,rel:f.rel||"من المجموعة"});
    const has=typeof f.la==="number"&&typeof f.lo==="number";const ago=has?Math.max(0,Math.round((Date.now()-(+f.t||0))/60000)):null;const dist=(has&&me)?Math.round(kmBetween(me.la,me.lo,f.la,f.lo)*1000):null;const dir=(has&&me)?dirOf(me.la,me.lo,f.la,f.lo):"";
    return Object.assign({},f,{live:0,sharing:0,last:has,where:has?"آخر موقع وصلني قبل "+ago+" د: "+describePos(f.la,f.lo).text+(dist!==null?" · "+fmtD(dist)+" "+dir+" منك":""):"لم يفتح الرابط بعد",dist,ago,dir,rel:f.rel||"من المجموعة"})})}
function svgFamily(pos){const pins=pos.filter(f=>f.sharing).slice(0,3).map((f,i)=>{const x=80+i*70,y=35+(i%2)*25;return `<circle cx="${x}" cy="${y}" r="7" fill="var(--gold)"/><text x="${x}" y="${y-11}" font-size="9" text-anchor="middle" fill="var(--fg)">${esc(f.name.split(" ")[0])}</text>`}).join("");
  return `<svg class="map" viewBox="0 0 320 120" role="img" aria-label="مواقع العائلة"><rect x="135" y="40" width="50" height="50" rx="4" fill="var(--kiswa)"/><circle cx="160" cy="65" r="38" fill="none" stroke="var(--line)" stroke-dasharray="3 3"/><circle cx="270" cy="95" r="6" fill="var(--info)"/><text x="270" y="82" font-size="9" text-anchor="middle" fill="var(--fg)">أنت</text>${pins}</svg>`}
