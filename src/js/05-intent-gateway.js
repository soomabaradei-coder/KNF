/* ---------- intent gateway: a small server (Cloudflare Worker) that asks Claude which tool fits the guest's wording; the API key stays on the server ---------- */
const LLM={url:"",load(){try{const q=new URLSearchParams(location.search);const u=q.get("llm");if(u!==null){if(u)localStorage.setItem("knf_llm",u);else localStorage.removeItem("knf_llm")}this.url=localStorage.getItem("knf_llm")||this.url}catch(_){}
    /* بوابة كنف افتراضية على موقع كنف نفسه: كل جوال يفتح الرابط يفهم عبر Claude ويسمع الصوت الطبيعي، لا جوال سمية وحده (كانت البوابة تحفظ فقط على الجهاز الذي فتح رابط ?llm=) */
    if(!this.url&&/^soomabaradei-coder\.github\.io$/.test(location.hostname))this.url="https://kanaf-gateway.soomabaradei.workers.dev"},
  ok(){return !!this.url&&!state.offline},
  async classify(text){if(!this.ok())return null;const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),7000);
    try{const tools=Object.keys(TOOLS).map(k=>({name:k,desc:TOOLS[k].desc,schema:TOOLS[k].schema||{type:"object",properties:{}}}));
      const r=await fetch(this.url,{method:"POST",headers:{"content-type":"application/json"},signal:ctl.signal,body:JSON.stringify({text,site:state.site,lang:state.lang,reply_lang:state.turnLang||(profile.langChosen?profile.speakLang:"auto"),profile:profileText().map(([k,v])=>k+": "+v).join("، "),tools})});
      if(!r.ok)throw new Error("HTTP "+r.status);const j=await r.json();if(!j||!j.name||!TOOLS[j.name])return null;this.reply=j.reply||"";return [j.name,j.input||{}]}
    catch(e){log("sup","بوابة الفهم غير متاحة الآن",(e.name==="AbortError"?"انتهت المهلة":String(e.message||e))+" · أكمل بالمطابقة المحلية");return null}finally{clearTimeout(t)}}};
LLM.load();
