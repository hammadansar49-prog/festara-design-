// Minimal stand-in for the `docx` package: records constructor options so the same
// report content can be rendered to print-ready HTML (see render.js).
class Node { constructor(kind, o) { this.kind = kind; this.o = o || {}; } }
class Paragraph extends Node { constructor(o) { super("p", o); } }
class TextRun extends Node { constructor(o) { super("run", typeof o === "string" ? { text: o } : o); } }
class ImageRun extends Node { constructor(o) { super("img", o); } }
class Table extends Node { constructor(o) { super("table", o); } }
class TableRow extends Node { constructor(o) { super("tr", o); } }
class TableCell extends Node { constructor(o) { super("td", o); } }
class PageBreak extends Node { constructor() { super("pagebreak"); } }
class TableOfContents extends Node { constructor(title, o) { super("toc", { title, ...o }); } }
class StyleLevel { constructor(style, level) { this.style = style; this.level = level; } }
class Footer extends Node { constructor(o) { super("footer", o); } }
class Document { constructor(o) { this.o = o; } }
const Packer = { toBuffer: async () => Buffer.from("") };
const E = (...k) => Object.fromEntries(k.map((x) => [x, x.toLowerCase()]));
module.exports = {
  Node, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, PageBreak, TableOfContents, StyleLevel, Footer, Document, Packer,
  WidthType: E("DXA", "PERCENTAGE"), BorderStyle: E("SINGLE", "NONE", "DASHED"), ShadingType: E("CLEAR"),
  AlignmentType: { JUSTIFIED: "justify", CENTER: "center", LEFT: "left", RIGHT: "right" },
  HeadingLevel: { HEADING_1: "h1", HEADING_2: "h2", HEADING_3: "h3", HEADING_4: "h4" },
  PageNumber: { CURRENT: "PAGE" }, NumberFormat: E("LOWER_ROMAN", "DECIMAL"), LevelFormat: E("BULLET", "DECIMAL"),
  VerticalAlign: E("CENTER"), VerticalAlignSection: E("CENTER"), TabStopType: E("LEFT"), TableLayoutType: E("FIXED"),
};
