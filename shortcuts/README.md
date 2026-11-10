# اختصار الصحة (KNF-Heart)

يرسل آخر نبض وتنفس من تطبيق الصحة إلى كنف عبر رابط `?hc=نبض_تنفس_أكسجين`. القراءة تبقى على الجهاز.

## القاعدة التي تعلمناها
ملفات `.shortcut` الموقعة عبر الماك (`shortcuts sign`) تصل فارغة لأن الماك لا يدعم خطوات الصحة ويفرغ إعداداتها.
الاختصار يبنى في تطبيق الاختصارات على الآيفون، وينقل إلى جهاز آخر برابط iCloud من الآيفون نفسه.

## البناء اليدوي (ثلاث دقائق)
1. Find Health Samples: النوع Heart Rate، الترتيب Start Date الأحدث أولا، الحد 1.
2. Get Details of Health Samples: Value.
3. Find Health Samples: النوع Respiratory Rate، بنفس الضبط.
4. Get Details of Health Samples: Value.
5. Text: `https://soomabaradei-coder.github.io/KNF/?hc=` ثم Value الأول ثم `_` ثم Value الثاني، بلا مسافات.
6. Open URLs.

`knf-heart-template.shortcut.plist` هو الملف الخام (بلا توقيع) للاختصار الناجح كما نزل من رابط iCloud، للرجوع إلى صيغة الخطوات.
