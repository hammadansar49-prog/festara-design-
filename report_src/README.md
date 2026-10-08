# Festara FYP report generator

Builds `../Festara_FYP_Report_40_percent.pdf` (print-exact) and `../Festara_FYP_Report_40_percent.docx` (Google-Docs-friendly) from one source.

## Files
- `report.js` - all report content (front matter, chapters 1-7, appendices, references). Edit text here.
- `render.js` + `shim.js` - render the same content to print-ready HTML for the PDF.
- `build.py` - full pipeline: HTML -> Edge headless PDF -> read heading pages -> fill contents pages -> stamp page numbers (none / roman / arabic) -> merge -> regenerate DOCX with static contents tables.
- `diagrams.py` - draws every figure in `img/` with matplotlib.
- `img/` - figures and the NUML logo (`im7.png`).
- `reference_docs/` - the NUML report format, submission guidelines, sample report, meeting log and 40% undertaking templates.

## Rebuild
```bash
npm install
pip install pdfplumber pypdf reportlab pypdfium2 matplotlib
python diagrams.py img        # only if a diagram changed
python build.py img ../Festara_FYP_Report_40_percent.pdf ../Festara_FYP_Report_40_percent.docx
```
Requires Microsoft Edge at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`.
