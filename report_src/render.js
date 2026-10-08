// Renders shim nodes (see shim.js) into three print-ready HTML files: title, front matter, body.
// Page size/margins follow the NUML guidelines; page numbers are stamped later (stamp.py).
const fs = require("fs");
const path = require("path");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const tw = (v) => `${v / 20}pt`;

const CSS = `
@page { size: A4; margin: 1in 1in 1in 1.25in; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: "Times New Roman", Times, serif; font-size: 12pt; color: #000; }
p { margin: 0; orphans: 2; widows: 2; }
.h1, .h2, .h3, .h4 { font-weight: bold; break-after: avoid; page-break-after: avoid; }
.h2 { font-size: 16pt; } .h3 { font-size: 14pt; } .h4 { font-size: 12pt; }
.cap { font-size: 10pt; font-weight: bold; text-align: center; line-height: 1.2; }
.np { break-before: page; page-break-before: always; }
.keep { break-inside: avoid; page-break-inside: avoid; }
.kn { break-after: avoid; page-break-after: avoid; }
.sep { height: 245mm; display: flex; align-items: center; justify-content: center; text-align: center; break-after: page; }
.sep .n { font-size: 18pt; font-weight: bold; line-height: 1.5; }
.sep .t { font-size: 22pt; font-weight: bold; line-height: 1.5; }
table { border-collapse: collapse; margin: 0 auto; table-layout: fixed; }
thead { display: table-header-group; }
tr { break-inside: avoid; page-break-inside: avoid; }
td, th { padding: 3pt 5pt; vertical-align: middle; font-size: 10pt; line-height: 1.3; text-align: left; font-weight: normal; }
td p, th p { margin: 0 0 2pt 0; }
.li { display: flex; text-align: justify; line-height: 1.5; margin: 0 0 4pt 0; }
.li .mk { flex: 0 0 18pt; margin-left: 18pt; }
.li .tx { flex: 1; }
.toc { width: 100%; border-collapse: collapse; table-layout: fixed; }
table.keep { break-inside: avoid; page-break-inside: avoid; }
.toc td { border: none; padding: 1.5pt 0; font-size: 12pt; line-height: 1.35; }
.toc td.pg { text-align: right; width: 40pt; vertical-align: bottom; }
.toc td.t { overflow: hidden; white-space: nowrap; }
.toc td.t span.dots::after { content: " . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ."; }
.toc td.t span.lbl { background: #fff; padding-right: 3pt; }
.toc tr.l1 td { font-weight: bold; padding-top: 6pt; }
.toc td.t.long { white-space: normal; } .toc td.t.long span.dots { display: none; }
.toc tr.l2 td.t { padding-left: 18pt; } .toc tr.l3 td.t { padding-left: 40pt; }
`;

function textOf(node) {
  if (!node) return "";
  if (node.kind === "run") return (node.o.break ? " " : "") + (node.o.text || "");
  return (node.o.children || []).map(textOf).join("");
}

function runHtml(r) {
  if (r.kind === "pagebreak") return '<span class="pbr"></span>';
  if (r.kind === "img") {
    const t = r.o.transformation;
    return `<img src="data:image/${r.o.type};base64,${Buffer.from(r.o.data).toString("base64")}" style="width:${t.width}px;height:${t.height}px">`;
  }
  const o = r.o;
  let t = esc(o.text || "");
  if (o.allCaps) t = t.toUpperCase();
  const st = [];
  if (o.bold) st.push("font-weight:bold");
  if (o.italics) st.push("font-style:italic");
  if (o.size) st.push(`font-size:${o.size / 2}pt`);
  if (o.color) st.push(`color:#${o.color}`);
  if (o.font) st.push(`font-family:${o.font},monospace`);
  return (o.break ? "<br>" : "") + (st.length ? `<span style="${st.join(";")}">${t}</span>` : t);
}

class Renderer {
  constructor(numbering) { this.counters = {}; this.headings = []; this.numbering = numbering; this.inSep = false; }

  para(p, ctx = {}) {
    const o = p.o;
    const kids = (o.children || []);
    if (kids.length === 1 && kids[0].kind === "pagebreak") return '<div class="np"></div>';
    const cls = [], st = [];
    const al = o.alignment || (ctx.cell ? "left" : null);
    if (o.heading) cls.push(o.heading);
    if (o.style === "FigureCaption" || o.style === "TableCaption") cls.push("cap");
    if (o.pageBreakBefore) cls.push("np");
    if (o.keepNext || o.style === "TableCaption") cls.push("kn");
    if (al) st.push(`text-align:${al}`);
    const sp = o.spacing || {};
    let before = sp.before, after = sp.after, line = sp.line;
    if (o.heading === "h2") { before = before ?? 360; after = after ?? 160; }
    if (o.heading === "h3") { before = before ?? 280; after = after ?? 140; }
    if (o.heading === "h4") { before = before ?? 200; after = after ?? 120; }
    if (o.style === "FigureCaption") { before = 60; after = 240; line = 240; }
    if (o.style === "TableCaption") { before = 200; after = 80; line = 240; }
    if (before) st.push(`margin-top:${tw(before)}`);
    if (after) st.push(`margin-bottom:${tw(after)}`);
    if (!ctx.cell) st.push(`line-height:${line ? line / 240 : 1.5}`);
    if (o.indent) {
      if (o.indent.left) st.push(`padding-left:${tw(o.indent.left)}`);
      if (o.indent.right) st.push(`padding-right:${tw(o.indent.right)}`);
      if (o.indent.hanging) st.push(`text-indent:-${tw(o.indent.hanging)}`);
    }
    if (o.shading) st.push(`background:#${o.shading.fill}`);
    let inner = kids.map(runHtml).join("") || "&nbsp;";
    if (ctx.cell) inner = inner.replace(/font-size:\d+(\.\d+)?pt/g, (m) => m); // keep cell run sizes
    if (o.tabStops) inner = inner.replace(/\t/, '</span><span>');
    if (o.tabStops) inner = `<span style="display:inline-block;width:${tw(o.tabStops[0].position)};text-indent:0">` + inner + "</span>";

    if (o.numbering) {
      const ref = o.numbering.reference, lvl = o.numbering.level || 0;
      let mk = "•";
      if (ref !== "bullets") { this.counters[ref] = (this.counters[ref] || 0) + 1; mk = this.counters[ref] + "."; }
      else if (lvl) mk = "◦";
      return `<div class="li" style="margin-left:${lvl * 18}pt"><span class="mk">${mk}</span><span class="tx">${inner}</span></div>`;
    }
    // record headings & captions for the TOC / lists
    const text = textOf(p).trim();
    if (o.heading === "h1" || o.heading === "h2" || o.heading === "h3") this.headings.push({ kind: "toc", level: +o.heading[1], text });
    if (o.style === "FigureCaption") this.headings.push({ kind: "fig", text });
    if (o.style === "TableCaption") this.headings.push({ kind: "tab", text });
    return `<p class="${cls.join(" ")}" style="${st.join(";")}">${inner}</p>`;
  }

  table(t) {
    const widths = t.o.columnWidths;
    const total = widths.reduce((a, b) => a + b, 0);
    const cols = widths.map((w) => `<col style="width:${tw(w)}">`).join("");
    const head = [], body = [];
    for (const tr of t.o.rows) {
      const cells = tr.o.children.map((td) => {
        const c = td.o, st = [];
        const b = c.borders || {};
        for (const side of ["top", "bottom", "left", "right"]) {
          const s = b[side];
          if (!s || s.style === "none") st.push(`border-${side}:none`);
          else st.push(`border-${side}:${s.style === "dashed" ? "1.5px dashed" : "0.75px solid"} #${s.color || "808080"}`);
        }
        if (c.shading) st.push(`background:#${c.shading.fill}`);
        const inner = (c.children || []).map((p) => (p.kind === "table" ? this.table(p) : this.para(p, { cell: true }))).join("");
        const tag = tr.o.tableHeader ? "th" : "td";
        return `<${tag}${c.columnSpan ? ` colspan="${c.columnSpan}"` : ""} style="${st.join(";")}">${inner}</${tag}>`;
      }).join("");
      const h = tr.o.height ? ` style="height:${tw(tr.o.height.value)}"` : "";
      (tr.o.tableHeader ? head : body).push(`<tr${h}>${cells}</tr>`);
    }
    const keep = body.length <= 10 ? ' class="keep"' : "";
    return `<table${keep} style="width:${tw(total)}"><colgroup>${cols}</colgroup>${head.length ? `<thead>${head.join("")}</thead>` : ""}<tbody>${body.join("")}</tbody></table>`;
  }

  toc(node, toc) {
    const kind = node.o.title === "List of Figures" ? "fig" : node.o.title === "List of Tables" ? "tab" : "toc";
    const items = (toc && toc[kind]) || [];
    const rows = items.map((e) => `<tr class="l${e.level || 2}"><td class="t${e.text.length > 78 ? " long" : ""}"><span class="lbl">${esc(e.text)}</span><span class="dots"></span></td><td class="pg">${e.page ?? ""}</td></tr>`).join("");
    return `<table class="toc"><colgroup><col><col style="width:40pt"></colgroup><tbody>${rows}</tbody></table>`;
  }

  items(list, toc) {
    const out = [];
    for (let i = 0; i < list.length; i++) {
      const n = list[i];
      if (!n) continue;
      if (n.__np) { out.push('<div class="np"></div>'); continue; }
      if (n.__sep) { out.push(`<div class="sep np"><div><div class="n">${esc(n.num)}</div><div class="t h1">${esc(n.title.toUpperCase())}</div></div></div>`);
        this.headings.push({ kind: "toc", level: 1, text: `${n.num}: ${n.title.toUpperCase()}`, find: n.title.toUpperCase() }); continue; }
      if (n.kind === "table") {
        const nx = list[i + 1];
        if (nx && nx.kind === "p" && nx.o.style === "FigureCaption") { // screenshot box + its caption
          out.push(`<div class="keep">${this.table(n)}${this.para(nx)}</div>`); i++; continue;
        }
        out.push(this.table(n)); continue;
      }
      if (n.kind === "toc") { out.push(this.toc(n, toc)); continue; }
      if (n.kind === "p") {
        // keep an image/code paragraph together with what follows (its caption)
        if (n.o.keepNext && !n.o.heading) {
          const grp = [this.para(n)];
          while (i + 1 < list.length && list[i + 1] && list[i + 1].kind === "p") {
            const nx = list[++i];
            grp.push(this.para(nx));
            if (!nx.o.keepNext) break;
          }
          out.push(`<div class="keep">${grp.join("")}</div>`);
          continue;
        }
        out.push(this.para(n));
      }
    }
    return out.join("\n");
  }
}

function page(body) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`;
}

function write(parts, outDir, toc) {
  fs.mkdirSync(outDir, { recursive: true });
  const r = new Renderer();
  const title = r.items(parts.title.flat(Infinity), toc);
  const r2 = new Renderer();
  const front = r2.items(parts.front.flat(Infinity), toc);
  const rb = new Renderer();
  const body = rb.items(parts.body.flat(Infinity), toc).replace(/^<div class="sep np">/, '<div class="sep">');
  fs.writeFileSync(path.join(outDir, "title.html"), page(title));
  fs.writeFileSync(path.join(outDir, "front.html"), page(front));
  fs.writeFileSync(path.join(outDir, "body.html"), page(body));
  fs.writeFileSync(path.join(outDir, "entries.json"), JSON.stringify(rb.headings, null, 1));
}

module.exports = { write };
