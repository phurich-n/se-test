// แปลง answers.md → answers.pdf
// 1) markdown → HTML หน้าตาแบบ GitHub ใช้ฟอนต์ Sarabun (Google Fonts, รุ่นโอเพนซอร์สของ TH Sarabun New)
// 2) ให้ Chrome/Edge แบบ headless พิมพ์เป็น PDF (ฟอนต์และ mermaid โหลดจากเน็ต จึงต้องต่อเน็ต)
//
// ใช้: npm run build:pdf   (ถ้าหา Chrome ไม่เจอ ให้ตั้ง CHROME_PATH)
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { Marked } from "marked";
import hljs from "highlight.js";

const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");
const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// ---------- 1) markdown → HTML ----------
const marked = new Marked({
  gfm: true,
  renderer: {
    code({ text, lang }) {
      if (lang === "mermaid") return `<pre class="mermaid">${escape(text)}</pre>`;
      const html = lang && hljs.getLanguage(lang) ? hljs.highlight(text, { language: lang }).value : escape(text);
      return `<pre><code class="hljs">${html}</code></pre>`;
    },
  },
});

const body = marked.parse(read("answers.md"));
const hljsCss = read("node_modules/highlight.js/styles/github.css");

const html = `<!doctype html><html lang="th"><head><meta charset="utf-8">
<title>Software Engineer Assessment — คำตอบ</title>
<base href="${root.href}"><!-- HTML ถูกเขียนลง temp จึงต้องชี้รูปอย่าง assets/q4-tree.png กลับมาที่โฟลเดอร์โปรเจกต์ -->
<link href="https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,400;0,600;0,700;1,400&display=block" rel="stylesheet">
<style>
${hljsCss}
@page { size: A4; margin: 16mm 15mm 18mm; }
:root { --text:#1f2328; --border:#d1d9e0; --code-bg:#f6f8fa; --link:#0969da; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin:0; color:var(--text); background:#fff;
  font: 15px/1.65 Sarabun, "Leelawadee UI", sans-serif; }
h1,h2,h3 { font-weight:600; line-height:1.35; margin:24px 0 12px; break-after:avoid; }
h1 { font-size:2em; padding-bottom:.3em; border-bottom:1px solid var(--border); margin-top:0; }
h2 { font-size:1em; padding-bottom:.3em; /* คำถามขนาดเท่าข้อความคำตอบ */ border-bottom:1px solid var(--border); }
p, ul, ol, table, pre { margin:0 0 14px; }
a { color:var(--link); text-decoration:none; }
hr { height:3px; border:0; background:var(--border); margin:22px 0; }
code { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, Sarabun, monospace; font-size:85%;
  background:rgba(129,139,152,.12); padding:.15em .4em; border-radius:6px; }
img { display:block; max-width:62%; height:auto; margin:0 auto; break-inside:avoid; }
pre { background:var(--code-bg); padding:12px 14px; border-radius:6px; overflow:hidden; white-space:pre-wrap; word-break:break-word; break-inside:avoid; }
pre code { background:none; padding:0; font-size:12px; line-height:1.5; }
pre code.hljs { background:transparent; padding:0; display:inline; }
table { border-collapse:collapse; break-inside:avoid; }
th, td { border:1px solid var(--border); padding:5px 12px; }
th { font-weight:600; background:var(--code-bg); }
tr:nth-child(2n) td { background:#f6f8fa; }
li + li { margin-top:4px; }
pre.mermaid { background:#fff; text-align:center; white-space:pre; }
pre.mermaid svg { max-width:100%; height:auto; }
</style></head><body>
${body}
<script src="https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js"></script>
<script>
  mermaid.initialize({ startOnLoad:false, theme:"neutral",
    fontFamily:'Sarabun, sans-serif', er:{ useMaxWidth:true } });
  document.fonts.ready.then(() => mermaid.run({ querySelector:"pre.mermaid" })); // วาดหลังฟอนต์โหลด ขนาดกล่องจะได้ไม่เพี้ยน
</script>
</body></html>`;

// ---------- 2) HTML → PDF ด้วย Chrome/Edge ----------
const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error("หา Chrome/Edge ไม่เจอ — ตั้ง CHROME_PATH ให้ชี้ไปที่ไฟล์ browser แล้วรันใหม่");
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), "answers-pdf-"));
const htmlPath = join(dir, "answers.html");
const pdfPath = new URL("answers.pdf", root);
writeFileSync(htmlPath, html);
try {
  execFileSync(browser, [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--virtual-time-budget=20000", // รอ mermaid วาด ER diagram ให้เสร็จก่อนพิมพ์
    "--run-all-compositor-stages-before-draw",
    `--print-to-pdf=${fileURLToPath(pdfPath)}`,
    pathToFileURL(htmlPath).href,
  ], { stdio: "ignore" });
} finally {
  rmSync(dir, { recursive: true, force: true });
}
console.log("answers.pdf");
