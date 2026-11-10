# اختبارات كنف

اختبارات Playwright على النسخة المبنية `index.html`، وكلها تعمل بلا شبكة (تمنع البوابة وواجهات الهيئة والطقس والمواقيت).

التشغيل من جذر المستودع بعد البناء:

    python3 build.py
    node tests/scen6.js        # كل أزرار سيناريوهات المعرض (21 زرا) وما ترد به القواعد
    node tests/hc_persist.js   # قراءة تطبيق الصحة: الإذن، الحفظ على الجهاز، الاستعادة، الإيقاف
    node tests/hcq.js          # سؤال النبض قبل القراءة وبعدها، وألم القلب إلى الطوارئ
    node tests/pain.js         # ألم الصدر يذهب إلى الطوارئ
    node tests/wbshot2.js      # لقطة شريط العافية على الآيفون في الوضعين
    node tests/diag.js         # بطاقة التشخيص ?diag=1
    node tests/three.js        # أسئلة مفردة بعد اختيار مكان (عدل القائمة في أعلى الملف)

يلزم Playwright مثبتا مع كروميوم: `npm i playwright` ثم `npx playwright install chromium`.
