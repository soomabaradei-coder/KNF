/* ---------- impact check: time-to-service, steps, and a 3-item micro survey (effort, comfort, reassurance) ---------- */
const metrics={task:null,log:JSON.parse(localStorage.getItem("knf_metrics")||"[]")};
function taskStart(text){if(metrics.task&&metrics.task.served)metrics.last=metrics.task;metrics.task={text,t0:Date.now(),turns:1,served:0}}
function taskServed(tool){if(metrics.task&&!metrics.task.served){metrics.task.served=Date.now();metrics.task.tool=tool;metrics.task.secs=Math.round((metrics.task.served-metrics.task.t0)/1000)}}
function saveMetrics(){try{localStorage.setItem("knf_metrics",JSON.stringify(metrics.log.slice(-200)))}catch(_){}}
/* سؤال واحد بعد كل توصية: هل كانت توصية جيدة؟ ويحفظ الجواب مجهولا مع اسم الخدمة فقط */
function surveyCard(ctx){
  const t=(metrics.task&&metrics.task.served)?metrics.task:(metrics.last||metrics.task||{});
  log("care","التحقق من الأثر: سؤال واحد بعد التوصية",(t.secs!=null?"زمن الوصول للخدمة "+t.secs+" ث · ":"")+(ctx||""));
  const c=card(head("📊","هل كانت توصية جيدة؟",ctx||"")+`<div class="sv"><div class="q"><div class="yn" data-k="fit"><button type="button" class="primary" data-v="1">نعم</button><button type="button" data-v="0">لا</button></div></div></div>`,"care");
  c.querySelectorAll("[data-k] button").forEach(b=>b.addEventListener("click",()=>{const fit=+b.dataset.v;
    const rec={at:Date.now(),tool:t.tool||"",svc:TOOL_AR[t.tool]||t.tool||"",site:state.site,secs:t.secs==null?null:t.secs,fit};metrics.log.push(rec);saveMetrics();metrics.task=null;metrics.last=null;EVT.pub();
    log("care","حفظ التقييم","التوصية "+(fit?"جيدة":"غير جيدة")+(rec.svc?" · "+rec.svc:""));
    c.querySelector(".sv").innerHTML='<span style="color:var(--ok);font-weight:700">✓ شكرا</span>'}));
  return c}
function resultsCard(){
  const L=metrics.log;const avg=k=>{const v=L.filter(r=>r[k]!=null).map(r=>r[k]);return v.length?(v.reduce((a,b)=>a+b,0)/v.length):null};const f=v=>v==null?"—":(Math.round(v*10)/10).toString();
  const fit=L.filter(r=>r.fit!=null);const fitp=fit.length?Math.round(100*fit.filter(r=>r.fit).length/fit.length):null;
  log("care","عرض نتائج التحقق من الأثر",L.length+" تقييم محفوظ على الجهاز");
  card(head("📈","نتائج التحقق من الأثر",L.length+" تقييم · محفوظ على هذا الجهاز")+`<div class="svres"><div><b>${L.length}</b><small>تقييم</small></div><div><b>${fitp==null?"—":fitp+"%"}</b><small>توصية جيدة</small></div><div><b>${f(avg("secs"))}</b><small>ثانية حتى الخدمة</small></div></div><p class="note">حصيلة مجمعة ومجهولة من سؤال واحد بعد كل توصية، تصل للهيئة مع اسم الخدمة فقط دون أي بيانات شخصية.</p><div class="acts"><a class="chip" href="?dash=1" target="_blank" rel="noopener">لوحة الهيئة</a><button type="button" data-clear="1">مسح النتائج</button></div>`,"care").querySelector("[data-clear]").addEventListener("click",ev=>{metrics.log=[];saveMetrics();ev.target.closest(".card").remove();log("care","مسح نتائج الأثر","")});
  return{count:L.length,avg_secs:avg("secs"),fit_pct:fitp}}
