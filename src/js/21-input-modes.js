/* ---------- input modes: voice, image, text ---------- */
function setInputMode(m){["mVoice","mImage","mText"].forEach(id=>$("#"+id).classList.toggle("on",id===m))}
$("#mText").addEventListener("click",()=>{setInputMode("mText");box.focus()});
$("#mImage").addEventListener("click",async()=>{setInputMode("mImage");
  let st=null;try{st=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false})}catch(_){st=null}
  if(!st){$("#imgIn").click();return}
  const c=card(head("📷","التقط صورة","لافتة، باب، علبة دواء، مكان")+`<div class="cam"><video autoplay muted playsinline style="transform:none"></video></div><div class="acts"><button type="button" class="primary" id="shot">التقط</button><button type="button" id="shotX">إلغاء</button></div>`);
  const v=c.querySelector("video");v.srcObject=st;const stop=()=>{st.getTracks().forEach(t=>t.stop())};
  c.querySelector("#shotX").addEventListener("click",()=>{stop();c.remove();setInputMode("mText")});
  c.querySelector("#shot").addEventListener("click",()=>{const cv=document.createElement("canvas");cv.width=v.videoWidth||640;cv.height=v.videoHeight||480;cv.getContext("2d").drawImage(v,0,0);
    cv.toBlob(async b=>{stop();c.remove();log("sup","التقط صورة بالكاميرا",state.imagesOK?"ترسل إلى الوكيل المباشر":"محاكاة قراءة الصورة");await ask("أرسلت صورة، ماذا ترى فيها وبماذا تنصحني؟",b);setInputMode("mText")},"image/jpeg",0.85)})});
$("#imgIn").addEventListener("change",async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;e.target.value="";
  log("sup","وصلت صورة من الكاميرا",state.imagesOK?"ترسل إلى الوكيل المباشر":"محاكاة قراءة الصورة");
  await ask("أرسلت صورة، ماذا ترى فيها وبماذا تنصحني؟",f);setInputMode("mText")});
async function scriptedImage(text){
  // بلا نموذج رؤية في وضع المحاكاة: نسأل الضيف عن نوع الصورة ونكمل من حديثه
  card(head("🖼️","وصلتني الصورة","محاكاة")+`<div>في النسخة الحقيقية يقرؤها الوكيل بنفسه. الآن أخبرني ما فيها لأكمل:</div><div class="acts"><button class="primary" data-say="الصورة لافتة باب في الحرم">لافتة أو باب</button><button data-say="الصورة علبة دوائي">علبة دواء</button><button data-say="الصورة لمكان ضعت فيه">مكان ضعت فيه</button></div>`);
  return pick({ar:"وصلتني الصورة. أخبرني ما فيها لأساعدك بدقة.",fr:"J'ai bien reçu la photo. Dites-moi ce qu'elle montre pour vous aider précisément.",en:"I received the photo. Tell me what it shows so I can help precisely."})}
