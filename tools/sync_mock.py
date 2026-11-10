import html,difflib,sys,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# يزامن نموذج «كنف داخل منصة الهيئة» (platform/kanaf_in_platform.html) مع آخر بناء dist/hafi.html
# الاستعمال: python3 tools/sync_mock.py dist/hafi.prev.html   (نسخة dist/hafi.html التي يحويها النموذج حاليا)
mk=open(os.path.join(ROOT,'platform','kanaf_in_platform.html'),encoding='utf-8').read()
i=mk.index('srcdoc="'); j=mk.index('"',i+8)
old=html.unescape(mk[i+8:j]); ol=old.split('\n')
prev=open(sys.argv[1],encoding='utf-8').read().split('\n')   # the hafi version the mockup currently embeds
new=open(os.path.join(ROOT,'dist','hafi.html'),encoding='utf-8').read().split('\n')
sm=difflib.SequenceMatcher(None,prev,ol,autojunk=False)
patches={}  # prev line text -> replacement text
for tag,a1,a2,b1,b2 in sm.get_opcodes():
    if tag=='replace' and a2-a1==b2-b1:
        for k in range(a2-a1): patches[prev[a1+k]]=ol[b1+k]
    elif tag=='insert': assert ol[b1:b2]==['</body></html>'], ol[b1:b2]
    elif tag!='equal': raise SystemExit('unexpected '+tag)
out=[]; used=0
for l in new:
    if l in patches: out.append(patches[l]); used+=1
    else: out.append(l)
assert used==len(patches),(used,len(patches))
out.append('</body></html>')
doc='\n'.join(out)
mk2=mk[:i+8]+html.escape(doc,quote=True)+mk[j:]
open(os.path.join(ROOT,'platform','kanaf_in_platform.html'),'w',encoding='utf-8').write(mk2); print('mockup synced, patches',used,len(mk2))
