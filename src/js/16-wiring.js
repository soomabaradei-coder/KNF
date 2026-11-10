/* ---------- wiring ---------- */
function setMode(live){$("#modeTag").innerHTML=live?"الوضع: <b>وكيل مباشر (Claude يختار الأدوات)</b>":(LLM.ok()?"الوضع: <b>محاكاة + فهم الصيغ عبر Claude</b>":"الوضع: <b>محاكاة موجهة</b>")}
function renderQuick(){
  if(state.offline){$("#quick").innerHTML=["خطتي","محادثاتي","التقييم","وين أقرب زمزم؟","دلني على الفندق","أبغى عربة","تنفس معي","بعدت عن عائلتي","شغل البث"].map(x=>`<button class="q" type="button">${esc(x)}</button>`).join("");return}
  const q=state.site==="makkah"?(isEN()?[UI_EN.chipsM[0],UI_EN.chipsM[1],(profile.family[0]?UI_EN.chipWhere(profile.family[0].name.split(" ")[0]):UI_EN.chipAdd),UI_EN.chipsM[2]]:["أبغى أعتمر","كثافة المطاف الآن؟",(profile.family[0]?"وين "+profile.family[0].name.split(" ")[0]+"؟":"أضف فردا"),"كيف أتجنب الحر والزحام؟"]):(isEN()?[UI_EN.chipsD[0],"Rawdah entry steps",UI_EN.chipsD[2],(profile.family[0]?UI_EN.chipWhere(profile.family[0].name.split(" ")[0]):UI_EN.chipAdd)]:["متى أسلم على الرسول؟","تفويج الروضة","كيف أوصل للروضة؟",(profile.family[0]?"وين "+profile.family[0].name.split(" ")[0]+"؟":"أضف فردا")]);
  /* زر الاتصال بالمرشد أو المرشدة إن كان في المجموعة؛ و«وين» لأول فرد من العائلة بالصلة لا بالاسم الخام */
  const g=(profile.family||[]).find(f=>/^(المرشد|المرشدة|مشرف الحملة|مشرفة الحملة)$/.test(f.rel||""));if(g){const w=/^(المرشدة|مشرفة الحملة)$/.test(g.rel)?(g.rel==="المرشدة"?"المرشدة":"المشرفة"):(g.rel==="المرشد"?"المرشد":"المشرف");q.splice(2,0,isEN()?"Call the guide":"اتصل على "+w)}
  const fam0=famOnly()[0];if(fam0){const i=q.findIndex(x=>/^(وين |Where is )/.test(x));const lbl=isEN()?UI_EN.chipWhere(firstName(fam0.name)):"وين "+(isRelWord(fam0.name)?fam0.name:firstName(fam0.name))+"؟";if(i>=0)q[i]=lbl}
  /* أزرار الحملة أولا: خطتها، والاتصال بها، وما نفعله في المشعر أو يوم الحج */
  const cp=!isEN()?campFind(profile.campaign):null;if(cp){const cc=[];if(cp.schedule&&cp.schedule.length)cc.push("ما هي خطة "+cp.n+"؟");if(cp.ph)cc.push("اتصل بحملة "+cp.n);cc.push(hajjChip());q.unshift(...cc.filter(x=>!q.includes(x)))}
  $("#quick").innerHTML=q.map(x=>`<button class="q" type="button">${esc(x)}</button>`).join("");
}
