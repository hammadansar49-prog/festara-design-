"""Builds the Festara report as a print-exact PDF plus a Google-Docs-friendly DOCX.

1. report.js (MODE=html) -> title/front/body HTML
2. Edge headless prints each to PDF (A4, NUML margins)
3. Heading/caption pages are read back from body.pdf -> toc.json
4. front matter is re-rendered with the real page numbers
5. page numbers are stamped (none / roman / arabic, bottom-right) and the parts merged
6. report.js (MODE=docx, TOC_JSON) -> .docx with static contents tables
"""
import io, json, os, re, subprocess, sys
import pdfplumber
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

HERE = os.path.dirname(os.path.abspath(__file__))
IMG, OUT_PDF, OUT_DOCX = sys.argv[1], sys.argv[2], sys.argv[3]
HTML = os.path.join(HERE, "html")
TOC = os.path.join(HTML, "toc.json")
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"


def node(mode, out, toc=True):
    env = dict(os.environ, MODE=mode)
    if toc and os.path.exists(TOC):
        env["TOC_JSON"] = TOC
    subprocess.run(["node", os.path.join(HERE, "report.js"), IMG, out], check=True, env=env, cwd=HERE)


def print_pdf(name):
    src = os.path.join(HTML, name + ".html")
    dst = os.path.join(HTML, name + ".pdf")
    if os.path.exists(dst):
        os.remove(dst)
    url = "file:///" + src.replace("\\", "/")
    subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                    "--run-all-compositor-stages-before-draw", "--virtual-time-budget=10000",
                    f"--user-data-dir={os.path.join(HERE, 'edge-profile')}",
                    f"--print-to-pdf={dst}", url], check=True, capture_output=True, timeout=180)
    return dst


norm = lambda s: re.sub(r"\s+", " ", s).strip()


def locate(pdf_path):
    entries = json.load(open(os.path.join(HTML, "entries.json"), encoding="utf8"))
    with pdfplumber.open(pdf_path) as pdf:
        pages = [norm(p.extract_text() or "") for p in pdf.pages]
    cur = {"toc": 0, "fig": 0, "tab": 0}
    out = {"toc": [], "fig": [], "tab": []}
    for e in entries:
        k = e["kind"]
        needle = norm(e.get("find") or e["text"])[:60]
        page = None
        for i in range(cur[k], len(pages)):
            if needle in pages[i]:
                page = i
                break
        if page is None:
            print("  ! not found:", needle)
            page = cur[k]
        cur[k] = page
        out[k].append({"text": e["text"], "level": e.get("level", 2), "page": page + 1})
    return out


def roman(n):
    vals = [(10, "x"), (9, "ix"), (5, "v"), (4, "iv"), (1, "i")]
    s = ""
    for v, r in vals:
        while n >= v:
            s += r
            n -= v
    return s


def stamp(pdf_path, fmt, writer):
    reader = PdfReader(pdf_path)
    for i, page in enumerate(reader.pages):
        if fmt:
            buf = io.BytesIO()
            c = canvas.Canvas(buf, pagesize=A4)
            c.setFont("Times-Roman", 12)
            label = roman(i + 1) if fmt == "roman" else str(i + 1)
            c.drawRightString(A4[0] - 72, 30, label)  # 1" right margin, footer area
            c.save()
            buf.seek(0)
            page.merge_page(PdfReader(buf).pages[0])
        writer.add_page(page)
    return len(reader.pages)


os.makedirs(HTML, exist_ok=True)
if os.path.exists(TOC):
    os.remove(TOC)
node("html", HTML, toc=False)
body_pdf = print_pdf("body")
toc = locate(body_pdf)
json.dump(toc, open(TOC, "w", encoding="utf8"), indent=1)
node("html", HTML)                       # front matter now carries real page numbers
title_pdf, front_pdf = print_pdf("title"), print_pdf("front")
body_pdf = print_pdf("body")

w = PdfWriter()
n = stamp(title_pdf, None, w) + stamp(front_pdf, "roman", w) + stamp(body_pdf, "arabic", w)
w.add_metadata({"/Title": "Festara - FYP Report (40% Milestone)", "/Author": "Anas Altaf, Hammad Ansar, Muhammad Sami Ullah"})
with open(OUT_PDF, "wb") as f:
    w.write(f)
print("pdf pages:", n, "->", OUT_PDF)
node("docx", OUT_DOCX)
