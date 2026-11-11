// Build หน้าเว็บคำตอบเป็นไฟล์เดียว: docs/index.html (เปิด GitHub Pages จากโฟลเดอร์ /docs ได้เลย)
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const read = (path, enc = "utf8") => readFileSync(new URL(path, root), enc);

// 1) คอมไพล์ TypeScript + sql.js เป็น JavaScript ก้อนเดียว และฝังไฟล์ SQL ลงไป
const { outputFiles } = await build({
  entryPoints: [fileURLToPath(new URL("web/app.ts", root))], // fileURLToPath: .pathname ได้ "/C:/..." ซึ่งใช้ไม่ได้บน Windows
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
  minify: true,
  write: false,
  define: {
    __SCHEMA__: JSON.stringify(read("sql/q5_schema.sql")),
    __SEED__: JSON.stringify(read("sql/q5_seed.sql")),
    __QUERY__: JSON.stringify(read("sql/q6_query.sql")),
  },
});
const js = outputFiles[0].text.replaceAll("</script", "<\\/script");

// 2) ฝัง WebAssembly ของ SQLite เป็น base64
const wasm = read("node_modules/sql.js/dist/sql-wasm-browser.wasm", null).toString("base64");

// 3) ประกอบเข้ากับ template
const html = read("web/template.html").replace("/*__WASM__*/", () => wasm).replace("/*__APP__*/", () => js);

mkdirSync(new URL("docs/", root), { recursive: true });
writeFileSync(new URL("docs/index.html", root), html);
console.log(`docs/index.html  ${(html.length / 1024).toFixed(0)} KB`);
