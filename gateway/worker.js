// بوابة فهم الصيغ لوكيل كنف
// Cloudflare Worker: يستقبل رسالة الضيف وقائمة أدوات الوكيل، ويسأل Claude أي أداة تناسب الصيغة، ويعيد اسم الأداة ومدخلاتها.
// المفتاح يبقى هنا على الخادم ولا يصل إلى الصفحة أبدا.
//
// الإعداد (مرة واحدة):
// 1) dash.cloudflare.com → Workers & Pages → Create → Worker → الصق هذا الملف → Deploy
// 2) Settings → Variables and Secrets:
//      ANTHROPIC_API_KEY   (Secret)  مفتاح واجهة Anthropic
//      ALLOWED_ORIGINS     (Text)    https://soomabaradei-coder.github.io
//      MODEL               (Text, اختياري) مثل claude-haiku-4-5   أو   claude-sonnet-4-5
// 3) انسخ رابط الـ Worker (مثل https://kanaf-gateway.اسمك.workers.dev) وافتح صفحة كنف مرة واحدة هكذا:
//      https://soomabaradei-coder.github.io/KNF/?llm=https://kanaf-gateway.اسمك.workers.dev#judge
//    فيحفظ الرابط على الجهاز ويستخدمه بعدها تلقائيا. ولإيقافه: ?llm=

// الإرسال اليومي للخطة (اختياري):
// 4) Settings → Bindings → KV namespace: الاسم KANAF_KV
// 5) Settings → Variables: RESEND_API_KEY (Secret) و MAIL_FROM (Text، مثل kanaf@yourdomain.com أو onboarding@resend.dev للتجربة)
// 6) Settings → Triggers → Cron: 0 2 * * *  (الخامسة صباحا بتوقيت السعودية)
//
// تأكيد الجوال برمز (اختياري). اختر مزودا واحدا وأضف مفاتيحه كـ Secrets:
//   تويليو (تجربة سريعة، ترسل فقط للأرقام الموثقة في حسابك التجريبي):
//      SMS_PROVIDER=twilio   TWILIO_ACCOUNT_SID   TWILIO_AUTH_TOKEN   TWILIO_VERIFY_SID (خدمة Verify)
//      الأرقام السعودية تستقبل الرمز بمكالمة صوتية (القناة call) لأن الشبكات السعودية ترفض الرسائل من الأرقام الدولية؛
//      بعد تسجيل اسم المرسل الحرفي في Twilio أضف OTP_SA_CHANNEL=sms. والصفحة تستطيع طلب قناة بعينها بـ {channel:"call"}.
//   يونيفونك (سعودي، للتشغيل الفعلي، يحتاج KANAF_KV لحفظ الرمز):
//      SMS_PROVIDER=unifonic   UNIFONIC_APP_SID   UNIFONIC_SENDER (اسم المرسل المسجل)
//   بلا مزود: الحساب ينشأ بلا تأكيد وتقول الصفحة إن التأكيد غير مفعل بعد.
//
// الصوت العصبي (صوت تشات جي بي تي عبر واجهة أوبن إيه آي). أضف كـ Secret:
//      OPENAI_API_KEY   مفتاح أوبن إيه آي
//   واختياري كنص: TTS_VOICE (الافتراضي ash: صوت رجل هادئ ناعم؛ بدائل رجالية: echo, onyx, verse, fable؛ نسائية: nova, coral, shimmer, sage, alloy)  TTS_MODEL (الافتراضي gpt-4o-mini-tts)
//   الصفحة تطلب /tts وتشغل الملف؛ وبلا مفتاح تعود إلى صوت الجوال تلقائيا. مع KANAF_KV يحفظ الصوت المكرر أسبوعا.
//   والتعرف على كلام الضيف بأي لغة ولهجة: الصفحة تسجل الصوت وترسله إلى /stt (المفتاح نفسه)؛ اختياري STT_MODEL (الافتراضي gpt-4o-mini-transcribe).

export default {
  async scheduled(event, env, ctx) {
    if (!env.KANAF_KV || !env.RESEND_API_KEY) return;
    const list = await env.KANAF_KV.list({ prefix: "plan:" });
    for (const k of list.keys) {
      const rec = await env.KANAF_KV.get(k.name, "json");
      if (!rec || !rec.email || !rec.text) continue;
      await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
        body: JSON.stringify({ from: env.MAIL_FROM || "onboarding@resend.dev", to: [rec.email], subject: "خطتك اليوم من كنف: " + (rec.title || ""), text: rec.text }) }).catch(() => {});
    }
  },
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
    const ok = allowed.length === 0 || allowed.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": ok ? origin : "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Vary": "Origin",
      "content-type": "application/json; charset=utf-8"
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(req.url);
    const json = (o, status) => new Response(JSON.stringify(o), { status: status || 200, headers: cors });
    const sha = async s => { const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join(""); };
    const okPhone = p => /^\+[1-9]\d{7,14}$/.test(String(p || ""));
    const provider = (env.SMS_PROVIDER || (env.TWILIO_VERIFY_SID ? "twilio" : env.UNIFONIC_APP_SID ? "unifonic" : "")).toLowerCase();
    if (url.pathname === "/translate" && req.method === "POST" && ok) { if (!env.ANTHROPIC_API_KEY) return json({ error: "no key" }, 503); let b; try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); } const to = String(b.to || "en").slice(0, 5); const items = (Array.isArray(b.texts) ? b.texts : []).slice(0, 40).map(t => String(t || "").slice(0, 1200)); if (!items.length) return json({ out: [] }); const ck = "tr:" + await sha(to + JSON.stringify(items)); if (env.KANAF_KV) { const c = await env.KANAF_KV.get(ck, "json"); if (c) return json({ out: c }); } const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: JSON.stringify({ model: env.MODEL || "claude-haiku-4-5", max_tokens: 4000, system: "You translate interface text of KNF, a companion app for Hajj and Umrah pilgrims, faithfully into the target language. Keep numbers, gate numbers, phone numbers, times and proper names. Do not add, explain or omit anything. Use the tool.", tools: [{ name: "translations", description: "The translations, same order and count as the items", input_schema: { type: "object", properties: { out: { type: "array", items: { type: "string" } } }, required: ["out"] } }], tool_choice: { type: "tool", name: "translations" }, messages: [{ role: "user", content: "Target language: " + to + ". Items as a JSON array: " + JSON.stringify(items) }] }) }); const j = await r.json().catch(() => ({})); const tu = (j.content || []).find(c => c.type === "tool_use"); const out = tu && tu.input && Array.isArray(tu.input.out) ? tu.input.out.map(x => String(x)) : null; if (!out || out.length !== items.length) return json({ error: "translate_failed" }, 502); if (env.KANAF_KV) await env.KANAF_KV.put(ck, JSON.stringify(out), { expirationTtl: 2592000 }); return json({ out }); } // الصوت العصبي: {text, lang} يعيد mp3
    if (url.pathname === "/tts" && req.method === "POST" && ok) {
      if (!env.OPENAI_API_KEY) return json({ error: "tts_not_configured" }, 503);
      let b; try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); }
      const text = String(b.text || "").replace(/\s+/g, " ").trim().slice(0, 900);
      if (!text) return json({ error: "empty" }, 400);
      const lang = String(b.lang || "ar").slice(0, 5);
      const voice = env.TTS_VOICE || "ash"; const model = env.TTS_MODEL || "gpt-4o-mini-tts";
      const audioHeaders = { "content-type": "audio/mpeg", "Cache-Control": "private, max-age=86400", "Access-Control-Allow-Origin": cors["Access-Control-Allow-Origin"], "Vary": "Origin" };
      const ck = "tts:" + await sha(model + voice + lang + text);
      if (env.KANAF_KV) { const hit = await env.KANAF_KV.get(ck, "arrayBuffer"); if (hit) return new Response(hit, { headers: audioHeaders }); }
      const instr = lang.startsWith("ar") ? "تحدث بصوت رجل هادئ ناعم ودافئ، بعربية طبيعية بنبرة مرافق مطمئن لضيف الرحمن في الحرم، بسرعة معتدلة ونطق واضح للأرقام، بلا انفعال." : lang.startsWith("fr") ? "Parle d'une voix d'homme calme, douce et chaleureuse, comme un accompagnateur rassurant." : "Speak as a calm, soft, warm male voice, like a reassuring companion, natural and unhurried.";
      const r = await fetch("https://api.openai.com/v1/audio/speech", { method: "POST", headers: { Authorization: "Bearer " + env.OPENAI_API_KEY, "content-type": "application/json" }, body: JSON.stringify({ model, voice, input: text, instructions: instr, response_format: "mp3" }) });
      if (!r.ok) { const e = await r.text().catch(() => ""); return json({ error: "tts_failed", status: r.status, detail: e.slice(0, 200) }, 502); }
      const buf = await r.arrayBuffer();
      if (env.KANAF_KV && buf.byteLength < 2000000) { try { await env.KANAF_KV.put(ck, buf, { expirationTtl: 7 * 86400 }); } catch {} }
      return new Response(buf, { headers: audioHeaders });
    }
    // التعرف على الكلام: ملف صوتي (multipart، الحقل audio) يعيد {text}
    if (url.pathname === "/stt" && req.method === "POST" && ok) {
      if (!env.OPENAI_API_KEY) return json({ error: "stt_not_configured" }, 503);
      let fd; try { fd = await req.formData(); } catch { return json({ error: "bad form" }, 400); }
      const f = fd.get("audio"); if (!f || typeof f === "string") return json({ error: "no audio" }, 400);
      if (f.size > 6 * 1024 * 1024) return json({ error: "too_large" }, 413);
      const out = new FormData(); out.append("file", f, f.name || "audio.webm"); out.append("model", env.STT_MODEL || "gpt-4o-mini-transcribe"); out.append("response_format", "json");
      const hint = String(fd.get("lang") || ""); if (/^[a-z]{2}$/.test(hint)) out.append("language", hint);
      const r = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { Authorization: "Bearer " + env.OPENAI_API_KEY }, body: out });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return json({ error: "stt_failed", status: r.status, detail: ((j.error && j.error.message) || "").slice(0, 200) }, 502);
      return json({ text: String(j.text || "").slice(0, 500) });
    }
    // تأكيد الجوال: إرسال الرمز {phone}
    if (url.pathname === "/otp/send" && req.method === "POST" && ok) {
      let b; try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); }
      const phone = String(b.phone || "").trim();
      if (!okPhone(phone)) return json({ sent: false, reason: "bad_phone" });
      if (!provider) return json({ sent: false, reason: "sms_not_configured" });
      // حد الإرسال: ثلاث رسائل لكل رقم كل عشر دقائق (عند توفر KV)
      if (env.KANAF_KV) { const rk = "otp:rl:" + phone; const n = +(await env.KANAF_KV.get(rk)) || 0; if (n >= 3) return json({ sent: false, reason: "rate_limited" }); await env.KANAF_KV.put(rk, String(n + 1), { expirationTtl: 600 }); }
      if (provider === "twilio") {
        // القناة: sms أو call. الشبكات السعودية ترفض الرسائل من الأرقام الدولية (خطأ 21612) إلى أن يسجل اسم مرسل حرفي،
        // لذا الافتراضي للأرقام السعودية مكالمة تقرأ الرمز بالعربية (OTP_SA_CHANNEL يغيره إلى sms بعد التسجيل).
        const want = String(b.channel || "").toLowerCase();
        const channel = ["sms", "call"].includes(want) ? want : (phone.startsWith("+966") ? (env.OTP_SA_CHANNEL || "call") : "sms");
        const auth = "Basic " + btoa(env.TWILIO_ACCOUNT_SID + ":" + env.TWILIO_AUTH_TOKEN);
        const r = await fetch("https://verify.twilio.com/v2/Services/" + env.TWILIO_VERIFY_SID + "/Verifications", { method: "POST", headers: { Authorization: auth, "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ To: phone, Channel: channel, Locale: "ar" }) });
        const j = await r.json().catch(() => ({}));
        return json({ sent: r.ok, provider: "twilio", channel, reason: r.ok ? undefined : (j.message || ("HTTP " + r.status)) });
      }
      if (provider === "unifonic") {
        if (!env.KANAF_KV) return json({ sent: false, reason: "kv_missing" });
        const code = String(Math.floor(1000 + Math.random() * 9000));
        await env.KANAF_KV.put("otp:" + phone, JSON.stringify({ h: await sha(code + phone), tries: 0 }), { expirationTtl: 300 });
        const r = await fetch("https://el.cloud.unifonic.com/rest/SMS/messages", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ AppSid: env.UNIFONIC_APP_SID, SenderID: env.UNIFONIC_SENDER || "", Recipient: phone.replace(/\D/g, ""), Body: "رمز تأكيد كنف: " + code }) });
        return json({ sent: r.ok, provider: "unifonic", reason: r.ok ? undefined : ("HTTP " + r.status) });
      }
      return json({ sent: false, reason: "unknown_provider" });
    }
    // تأكيد الجوال: التحقق من الرمز {phone, code}
    if (url.pathname === "/otp/verify" && req.method === "POST" && ok) {
      let b; try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); }
      const phone = String(b.phone || "").trim(); const code = String(b.code || "").replace(/\D/g, "");
      if (!okPhone(phone) || code.length < 4 || code.length > 8) return json({ verified: false, reason: "bad_input" });
      if (provider === "twilio") {
        const auth = "Basic " + btoa(env.TWILIO_ACCOUNT_SID + ":" + env.TWILIO_AUTH_TOKEN);
        const r = await fetch("https://verify.twilio.com/v2/Services/" + env.TWILIO_VERIFY_SID + "/VerificationCheck", { method: "POST", headers: { Authorization: auth, "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ To: phone, Code: code }) });
        const j = await r.json().catch(() => ({}));
        return json({ verified: r.ok && j.status === "approved" });
      }
      if (provider === "unifonic" && env.KANAF_KV) {
        const rec = await env.KANAF_KV.get("otp:" + phone, "json");
        if (!rec) return json({ verified: false, reason: "expired" });
        if (rec.tries >= 5) { await env.KANAF_KV.delete("otp:" + phone); return json({ verified: false, reason: "too_many" }); }
        const good = rec.h === await sha(code + phone);
        if (good) await env.KANAF_KV.delete("otp:" + phone); else await env.KANAF_KV.put("otp:" + phone, JSON.stringify({ h: rec.h, tries: rec.tries + 1 }), { expirationTtl: 300 });
        return json({ verified: good });
      }
      return json({ verified: false, reason: "sms_not_configured" });
    }
    // حفظ خطة الضيف للإرسال اليومي: {id, email, title, text}
    if (url.pathname === "/plan" && req.method === "POST" && ok) {
      if (!env.KANAF_KV) return new Response(JSON.stringify({ stored: false, reason: "KV غير مضبوط" }), { headers: cors });
      let b; try { b = await req.json(); } catch { return new Response(JSON.stringify({ error: "bad json" }), { status: 400, headers: cors }); }
      if (!b.id || !b.email || !b.text) return new Response(JSON.stringify({ stored: false }), { headers: cors });
      await env.KANAF_KV.put("plan:" + String(b.id).slice(0, 40), JSON.stringify({ email: String(b.email).slice(0, 120), title: String(b.title || "").slice(0, 120), text: String(b.text).slice(0, 4000), t: Date.now() }), { expirationTtl: 60 * 60 * 24 * 14 });
      // إرسال فوري إن طلب الضيف (send: true) حتى لا ينتظر الصباح؛ بحد رسالتين كل عشر دقائق للحساب
      if (b.send && env.RESEND_API_KEY) {
        const rk = "plansend:" + String(b.id).slice(0, 40); const n = +(await env.KANAF_KV.get(rk)) || 0;
        if (n >= 2) return new Response(JSON.stringify({ stored: true, sent: false, reason: "rate" }), { headers: cors });
        const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
          body: JSON.stringify({ from: env.MAIL_FROM || "onboarding@resend.dev", to: [String(b.email).slice(0, 120)], subject: "خطتك من كنف: " + String(b.title || "").slice(0, 120), text: String(b.text).slice(0, 4000) }) });
        const j = await r.json().catch(() => ({}));
        await env.KANAF_KV.put(rk, String(n + 1), { expirationTtl: 600 });
        return new Response(JSON.stringify({ stored: true, sent: r.ok, reason: r.ok ? "" : (j && (j.message || j.name)) || ("HTTP " + r.status) }), { headers: cors });
      }
      return new Response(JSON.stringify({ stored: true, sent: false, reason: env.RESEND_API_KEY ? "" : "RESEND_API_KEY غير مضبوط" }), { headers: cors });
    }
    if (req.method !== "POST" || !ok) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: cors });
    if (!env.ANTHROPIC_API_KEY) return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY غير مضبوط" }), { status: 500, headers: cors });

    let body;
    try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "bad json" }), { status: 400, headers: cors }); }
    const text = String(body.text || "").slice(0, 500);
    const site = body.site === "makkah" ? "المسجد الحرام" : "المسجد النبوي";
    const lang = String(body.lang || "ar");
    const replyLang = String(body.reply_lang || "auto").slice(0, 5);
    const profile = String(body.profile || "").slice(0, 1500);
    const tools = Array.isArray(body.tools) ? body.tools.slice(0, 60) : [];
    if (!text || !tools.length) return new Response(JSON.stringify({ name: null }), { headers: cors });

    const system = [
      "أنت موجه النوايا داخل وكيل كنف، وكيل ذكي يرافق ضيف الرحمن في المسجد الحرام والمسجد النبوي والمشاعر، ويتكامل مع نسك ومنصات الهيئة العامة للعناية بشؤون الحرمين وكل خدمة تفيد الضيف.",
      "مهمتك الوحيدة: اختيار الأداة الواحدة الأنسب لرسالة الضيف من قائمة الأدوات، وتعبئة مدخلاتها إن وجدت.",
      "افهم العامية الخليجية والحجازية والمغاربية والفصحى والفرنسية والإنجليزية والأردية. الرسالة قد تكون ناقصة أو فيها أخطاء إملائية.",
      "قواعد: مسار السلام على الرسول للرجال بلا تصريح (get_density في المدينة). الصلاة في الروضة الشريفة بتصريح وموعد (rawdah_permit أو waiting_mode). لا تخترع أدوات غير الموجودة.",
      "قاعدة المصادر: كنف لا يجيب إلا من مصادره. سؤال معرفة عن الحج أو العمرة أو الزيارة أو آداب الحرمين جوابه في أحد موضوعات knowledge_answer: اخترها بذلك الموضوع. سؤال من الحج والعمرة والزيارة وخدمات الحرمين لا جواب له في الموضوعات ولا تغطيه أداة خدمة: إن كان يخص حملة الضيف نفسها (برنامجها، حافلاتها، تفويجها، سكنها، وجباتها، مرشدها) أو طلب الاتصال بالحملة فاختر call_campaign، وإلا refer_call_center (الرقم الموحد 1966) ولا تخمن ولا تختر show_map. سؤال خارج الحج والعمرة والزيارة والحرمين ورحلة الضيف فيهما: out_of_scope. السؤال عن الوكيل نفسه: explain_context. الحالات الفقهية الشخصية (نسيت، شككت، فدية، كفارة): fatwa_refer. أسئلة الوصول إلى الحرم من خارجه (حافلة، مواقف، أجرة) لها transport_options.",
      "استدع الأداة، وأضف في الحقل reply داخل مدخلات الأداة جملة واحدة قصيرة تؤكد ما ستفعله دون ذكر أرقام أو حالات، لأن البطاقة التي تلي الرد تحمل البيانات الحية. لغة الجملة: إن كانت «لغة الرد» المرسلة رمز لغة محددا (مثل ur أو id أو tr) فاكتبها بتلك اللغة حتى لو كتب الضيف بغيرها، وإن كانت auto فبلغة رسالة الضيف نفسها (عربي، إنجليزي، فرنسي، أردو، إندونيسي، تركي، أو غيرها)."
    ].join("\n");

    const payload = {
      model: env.MODEL || "claude-haiku-4-5",
      max_tokens: 300,
      system,
      tools: tools.map(t => {
        const schema = (t.schema && typeof t.schema === "object" && t.schema.properties) ? JSON.parse(JSON.stringify(t.schema)) : { type: "object", properties: {} };
        schema.properties = Object.assign({}, schema.properties, { reply: { type: "string", description: "جملة قصيرة للضيف بلغة رسالته تؤكد ما سيفعله الوكيل، بلا أرقام" } });
        return { name: String(t.name), description: String(t.desc || "").slice(0, 1200), input_schema: schema };
      }),
      tool_choice: { type: "any" },
      messages: [{ role: "user", content: `الموقع الحالي: ${site}\nلغة الرسالة: ${lang}\nلغة الرد: ${replyLang}\nما يعرفه الوكيل عن الضيف: ${profile}\n\nرسالة الضيف: ${text}` }]
    };

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return new Response(JSON.stringify({ name: null, error: (j.error && j.error.message) || ("HTTP " + r.status) }), { status: 502, headers: cors });
    const tu = (j.content || []).find(c => c.type === "tool_use");
    if (!tu) return new Response(JSON.stringify({ name: null }), { headers: cors });
    const input = Object.assign({}, tu.input || {});
    const reply = typeof input.reply === "string" ? input.reply.slice(0, 300) : "";
    delete input.reply;
    return new Response(JSON.stringify({ name: tu.name, input, reply }), { headers: cors });
  }
};
