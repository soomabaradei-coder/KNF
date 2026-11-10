#!/usr/bin/env python3
"""بناء كنف: يجمع src/ في ملف واحد index.html (نسخة GitHub Pages) و dist/hafi.html (نسخة الأرتيفاكت).

الاستعمال:
    python3 build.py            # يبني index.html و dist/hafi.html
    python3 build.py --check    # يبني ويفحص الصياغة فقط بلا كتابة

الترتيب: src/js/*.js مرتبة بأسمائها (00- ... 28-) وتجمع داخل IIFE واحد، لأن الوحدات تتشارك نطاقا واحدا.
الصور في src/assets تدمج كـ data URI حتى تبقى الصفحة ملفا واحدا يعمل بلا خادم.
"""
import base64, mimetypes, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def asset_uri(name):
    p = os.path.join(SRC, "assets", name)
    mime = mimetypes.guess_type(p)[0] or "application/octet-stream"
    with open(p, "rb") as f:
        return "data:%s;base64,%s" % (mime, base64.b64encode(f.read()).decode())


def inline_assets(text):
    return re.sub(r"__ASSET__\(([^)]+)\)__", lambda m: asset_uri(m.group(1)), text)


def build():
    page = read(os.path.join(SRC, "page.html"))
    css = read(os.path.join(SRC, "css", "kanaf.css")).rstrip("\n")
    js_dir = os.path.join(SRC, "js")
    files = sorted(f for f in os.listdir(js_dir) if f.endswith(".js"))
    js = "\n".join(read(os.path.join(js_dir, f)).rstrip("\n") for f in files)
    html = page.replace("__CSS__", css).replace("__JS__", js)
    html = inline_assets(html)
    return html, js, files


def syntax_check(js):
    tmp = os.path.join(ROOT, ".build-check.js")
    with open(tmp, "w", encoding="utf-8") as f:
        f.write("(function(){\n" + js + "\n})();\n")
    try:
        subprocess.run(["node", "--check", tmp], check=True)
    finally:
        os.remove(tmp)


def main():
    html, js, files = build()
    syntax_check(js)
    if "--check" in sys.argv:
        print("ok: %d modules, %d bytes" % (len(files), len(html.encode("utf-8"))))
        return
    with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    # نسخة الأرتيفاكت: الصفحة بلا غلاف html/head/body (الأرتيفاكت يضيف غلافه بنفسه)
    m = re.search(r"<title>.*?</head>\s*<body>(.*)</body>\s*</html>\s*$", html, re.S)
    inner = html[html.index("<title>"):html.index("</head>")] + m.group(1)
    inner = re.sub(r"\n</head>\s*$", "\n", inner)
    os.makedirs(os.path.join(ROOT, "dist"), exist_ok=True)
    with open(os.path.join(ROOT, "dist", "hafi.html"), "w", encoding="utf-8") as f:
        f.write(inner.rstrip("\n") + "\n")
    print("built index.html (%d bytes) and dist/hafi.html from %d modules" % (len(html.encode("utf-8")), len(files)))


if __name__ == "__main__":
    main()
