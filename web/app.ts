/**
 * โค้ดของหน้าเว็บคำตอบ (TypeScript) — build เป็น docs/index.html ด้วย `npm run build:web`
 * แต่ละข้อแยกเป็น 2 ส่วน: (1) ตรรกะคำนวณ ที่ตรงกับไฟล์ใน src/  (2) ส่วนแสดงผลบนหน้าเว็บ
 */
import initSqlJs, { type Database } from "sql.js";

// ไฟล์ SQL ถูกฝังตอน build (ดู web/build.mjs) — ใช้ไฟล์เดียวกับโปรแกรม command line
declare const __SCHEMA__: string;
declare const __SEED__: string;
declare const __QUERY__: string;

// ---------- helpers ----------
const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector(sel) as T;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, reducedMotion ? 0 : ms));
const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, text?: string) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  if (text !== undefined) el.textContent = text;
  return el;
}

/** ปิดปุ่มระหว่างแอนิเมชันทำงาน กันกดซ้ำ */
async function runWith(btn: HTMLButtonElement, task: () => Promise<void>) {
  btn.disabled = true;
  try {
    await task();
  } finally {
    btn.disabled = false;
  }
}

function addRow(tbody: HTMLElement, cells: (string | number)[]) {
  const tr = document.createElement("tr");
  for (const c of cells) {
    const td = document.createElement("td");
    td.textContent = String(c);
    tr.append(td);
  }
  tr.classList.add("appear");
  tbody.append(tr);
}

/** แถวว่างในตาราง trace (บอกว่าต้องทำอะไรต่อ แทนตารางที่มีแต่หัว) */
function emptyRow(cols: number, text: string) {
  const tr = document.createElement("tr");
  tr.className = "empty";
  const td = document.createElement("td");
  td.colSpan = cols;
  td.textContent = text;
  tr.append(td);
  return tr;
}

// ---------- แถบนำทาง: ไฮไลต์ข้อที่กำลังอ่านอยู่ ----------
const navLinks = new Map(
  [...document.querySelectorAll<HTMLAnchorElement>(".qnav ol a")].map((a) => [a.hash.slice(1), a]),
);
const spy = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      navLinks.forEach((a, id) => (id === e.target.id ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
    }
  },
  { rootMargin: "-35% 0px -60% 0px" },
);
document.querySelectorAll("section.q").forEach((s) => spy.observe(s));

// ======================================================================
// ข้อ 2 — trace loop: x := 2^x จนกว่า x > 1000
// ======================================================================
interface Q2Step { round: number; before: number; after: number; i: number }

function q2Trace(): Q2Step[] {
  const steps: Q2Step[] = [];
  let x = 1;
  let i = 1;
  while (x <= 1000) {
    const before = x;
    x = 2 ** x;
    i = i + 1;
    steps.push({ round: steps.length + 1, before, after: x, i });
  }
  return steps;
}

$<HTMLButtonElement>("#q2-run").addEventListener("click", (e) =>
  runWith(e.currentTarget as HTMLButtonElement, async () => {
    const tbody = $("#q2-body");
    const out = $("#q2-out");
    tbody.replaceChildren();
    out.textContent = "";
    for (const s of q2Trace()) {
      await sleep(550);
      addRow(tbody, [s.round, s.before, `2^${s.before} = ${s.after.toLocaleString()}`, s.i, s.after <= 1000 ? "วนต่อ" : "หยุด (> 1000)"]);
    }
    await sleep(300);
    out.textContent = `i = ${q2Trace().at(-1)!.i}`;
  }),
);

// ======================================================================
// ข้อ 3 — loop ซ้อน: นอกหาร i ครึ่ง, ในบวก r ทีละ 1 จำนวน n ครั้ง
// ======================================================================
interface Q3Round { round: number; i: number; r: number }

function q3Trace(n: number): Q3Round[] {
  const rounds: Q3Round[] = [];
  let i = n;
  let r = 0;
  while (i >= 1) {
    for (let j = 1; j <= n; j++) r = r + 1;
    rounds.push({ round: rounds.length + 1, i, r });
    i = i / 2;
  }
  return rounds;
}

const q3Formula = (n: number) => n * (Math.floor(Math.log2(n)) + 1);

$<HTMLButtonElement>("#q3-run").addEventListener("click", (e) =>
  runWith(e.currentTarget as HTMLButtonElement, async () => {
    const input = $<HTMLInputElement>("#q3-n");
    const n = Math.trunc(Number(input.value));
    const tbody = $("#q3-body");
    const out = $("#q3-out");
    const check = $("#q3-check");
    tbody.replaceChildren();
    out.textContent = "";
    check.textContent = "";
    const invalid = !Number.isFinite(n) || n < 1 || n > 1_000_000;
    input.setAttribute("aria-invalid", String(invalid));
    check.classList.toggle("err", invalid);
    if (invalid) {
      check.textContent = "กรุณาใส่ n เป็นจำนวนเต็ม 1 ถึง 1,000,000";
      tbody.append(emptyRow(4, "ใส่ n ให้ถูกต้อง แล้วกด Run อีกครั้ง"));
      return;
    }
    const rounds = q3Trace(n);
    for (const row of rounds) {
      await sleep(260);
      addRow(tbody, [row.round, row.i, `+${n.toLocaleString()}`, row.r.toLocaleString()]);
    }
    await sleep(250);
    const r = rounds.at(-1)!.r;
    out.textContent = `r = ${r.toLocaleString()}`;
    check.textContent =
      `ตรวจด้วยสูตร n × (⌊log₂n⌋ + 1) = ${n.toLocaleString()} × ${Math.floor(Math.log2(n)) + 1} = ` +
      `${q3Formula(n).toLocaleString()} ${q3Formula(n) === r ? "✓ ตรงกัน" : "✗ ไม่ตรง"}`;
  }),
);

// ======================================================================
// ข้อ 4 — ผลรวมตัวเลขใน tree (ข้าม node ตัวอักษรและ node ว่าง)
// ======================================================================
type NodeValue = number | string | null;
interface TreeNode { id: number; value: NodeValue; left?: TreeNode; right?: TreeNode }

let nextId = 0;
const node = (value: NodeValue, left?: TreeNode, right?: TreeNode): TreeNode => ({ id: nextId++, value, left, right });

const root = node("D", node(2, node(4)), node(3, node(5, node(null), node(7)), node("F", node(9), node(10))));

/** DFS แบบ preorder: ตัวเอง → ซ้าย → ขวา */
function dfsOrder(n?: TreeNode, out: TreeNode[] = []): TreeNode[] {
  if (!n) return out;
  out.push(n);
  dfsOrder(n.left, out);
  dfsOrder(n.right, out);
  return out;
}

/** BFS: ไล่ทีละชั้นด้วย queue */
function bfsOrder(start: TreeNode): TreeNode[] {
  const out: TreeNode[] = [];
  const queue: TreeNode[] = [start];
  let head = 0; // ชี้หัวคิว แทน shift() ที่ต้องเลื่อนสมาชิกทุกตัว
  while (head < queue.length) {
    const cur = queue[head++];
    out.push(cur);
    if (cur.left) queue.push(cur.left);
    if (cur.right) queue.push(cur.right);
  }
  return out;
}

const isNumber = (v: NodeValue): v is number => typeof v === "number";

/** วาง node อัตโนมัติ: x = ลำดับแบบ in-order, y = ความลึก */
function layoutTree(r: TreeNode) {
  const pos = new Map<number, { x: number; y: number }>();
  let col = 0;
  let maxDepth = 0;
  const walk = (n: TreeNode | undefined, depth: number) => {
    if (!n) return;
    walk(n.left, depth + 1);
    pos.set(n.id, { x: col++, y: depth });
    maxDepth = Math.max(maxDepth, depth);
    walk(n.right, depth + 1);
  };
  walk(r, 0);
  return { pos, cols: col, depth: maxDepth };
}

function drawTree() {
  const svg = $("#q4-tree") as unknown as SVGSVGElement;
  const { pos, cols, depth } = layoutTree(root);
  // จอแคบ: บีบระยะห่างแนวนอน ให้ SVG ย่อน้อยลง ตัวเลขใน node จึงยังอ่านออก
  const narrow = matchMedia("(max-width: 560px)").matches;
  const gx = narrow ? 46 : 68, gy = narrow ? 72 : 84, pad = 30;
  const px = (id: number) => pad + pos.get(id)!.x * gx;
  const py = (id: number) => pad + pos.get(id)!.y * gy;
  svg.setAttribute("viewBox", `0 0 ${pad * 2 + (cols - 1) * gx} ${pad * 2 + depth * gy}`);

  const edges = svgEl("g", { class: "edges" });
  const nodes = svgEl("g", {});
  for (const n of dfsOrder(root)) {
    for (const child of [n.left, n.right]) {
      if (child) edges.append(svgEl("line", { x1: px(n.id), y1: py(n.id), x2: px(child.id), y2: py(child.id) }));
    }
    const g = svgEl("g", { class: `tnode ${isNumber(n.value) ? "num" : "skip"}`, id: `tn-${n.id}` });
    g.append(svgEl("circle", { cx: px(n.id), cy: py(n.id), r: 22 }));
    g.append(svgEl("text", { x: px(n.id), y: py(n.id) + 6, "text-anchor": "middle" }, n.value === null ? "" : String(n.value)));
    nodes.append(g);
  }
  svg.replaceChildren(edges, nodes);
}

async function animateSum(order: TreeNode[], label: string) {
  const seq = $("#q4-seq");
  const out = $("#q4-out");
  document.querySelectorAll(".tnode").forEach((el) => el.classList.remove("active", "visited", "counted"));
  seq.textContent = `${label}: `;
  out.textContent = "ผลรวม = 0";
  let total = 0;
  for (const n of order) {
    const el = document.getElementById(`tn-${n.id}`)!;
    el.classList.add("active");
    await sleep(520);
    const shown = n.value === null ? "(ว่าง)" : String(n.value);
    if (isNumber(n.value)) {
      total += n.value;
      el.classList.add("counted");
      seq.textContent += `${shown} `;
    } else {
      seq.textContent += `[ข้าม ${shown}] `;
    }
    out.textContent = `ผลรวม = ${total}`;
    el.classList.remove("active");
    el.classList.add("visited");
  }
}

drawTree();
$<HTMLButtonElement>("#q4-dfs").addEventListener("click", (e) =>
  runWith(e.currentTarget as HTMLButtonElement, () => animateSum(dfsOrder(root), "DFS (recursion)")),
);
$<HTMLButtonElement>("#q4-bfs").addEventListener("click", (e) =>
  runWith(e.currentTarget as HTMLButtonElement, () => animateSum(bfsOrder(root), "BFS (queue)")),
);

// ======================================================================
// ข้อ 5 — ER Diagram (วาดจากข้อมูล entity)
// ======================================================================
interface Entity { name: string; x: number; y: number; w: number; fields: [string, "PK" | "FK" | "UK" | "PK,FK" | ""][] }

const ER: Record<string, Entity> = {
  titles: { name: "titles", x: 20, y: 20, w: 190, fields: [["title_id", "PK"], ["title_name", "UK"]] },
  genders: { name: "genders", x: 20, y: 150, w: 190, fields: [["gender_code", "PK"], ["gender_name", ""]] },
  sizes: { name: "customer_sizes", x: 690, y: 20, w: 190, fields: [["size_code", "PK"], ["size_name", ""]] },
  grades: { name: "customer_grades", x: 690, y: 150, w: 190, fields: [["grade_code", "PK"], ["grade_desc", ""]] },
  customers: {
    name: "customers", x: 315, y: 20, w: 270,
    fields: [
      ["customer_id", "PK"], ["customer_code", "UK"], ["title_id", "FK"], ["first_name", ""], ["last_name", ""],
      ["national_id", "UK"], ["gender_code", "FK"], ["birth_date", ""], ["size_code", "FK"], ["grade_code", "FK"],
      ["parent_customer_id", "FK"],
    ],
  },
  addresses: {
    name: "customer_addresses", x: 315, y: 370, w: 270,
    fields: [["address_id", "PK"], ["customer_id", "FK"], ["address_type", ""], ["house_no … postal_code", ""]],
  },
};

const ROW = 24, HEAD = 32;
const fieldY = (e: Entity, field: string) => e.y + HEAD + e.fields.findIndex(([f]) => f === field) * ROW + ROW / 2;

function drawER() {
  const svg = $("#er") as unknown as SVGSVGElement;
  const links = svgEl("g", { class: "er-links" });
  const boxes = svgEl("g", {});

  for (const e of Object.values(ER)) {
    const h = HEAD + e.fields.length * ROW;
    const g = svgEl("g", { class: "er-box" });
    g.append(svgEl("rect", { x: e.x, y: e.y, width: e.w, height: h, rx: 8, class: "er-frame" }));
    g.append(svgEl("rect", { x: e.x, y: e.y, width: e.w, height: HEAD, rx: 8, class: "er-head" }));
    g.append(svgEl("rect", { x: e.x, y: e.y + HEAD - 8, width: e.w, height: 8, class: "er-head" }));
    g.append(svgEl("text", { x: e.x + 12, y: e.y + 21, class: "er-title" }, e.name));
    e.fields.forEach(([f, key], i) => {
      const y = e.y + HEAD + i * ROW + 17;
      g.append(svgEl("text", { x: e.x + 12, y, class: key.includes("PK") ? "er-field pk" : "er-field" }, f));
      if (key) g.append(svgEl("text", { x: e.x + e.w - 12, y, "text-anchor": "end", class: `er-key k-${key.split(",")[0]}` }, key));
    });
    boxes.append(g);
  }

  const C = ER.customers;
  // เส้นจาก lookup table (ฝั่ง 1) ไปยัง FK ใน customers (ฝั่ง N)
  const link = (from: Entity, fromField: string, toField: string, side: "left" | "right") => {
    const x1 = side === "left" ? from.x + from.w : from.x;
    const x2 = side === "left" ? C.x : C.x + C.w;
    const y1 = fieldY(from, fromField);
    const y2 = fieldY(C, toField);
    const mx = (x1 + x2) / 2;
    links.append(svgEl("path", { d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}` }));
    links.append(svgEl("text", { x: x1 + (side === "left" ? 8 : -8), y: y1 - 6, "text-anchor": side === "left" ? "start" : "end", class: "card" }, "1"));
    links.append(svgEl("text", { x: x2 + (side === "left" ? -8 : 8), y: y2 - 6, "text-anchor": side === "left" ? "end" : "start", class: "card" }, "N"));
  };
  link(ER.titles, "title_id", "title_id", "left");
  link(ER.genders, "gender_code", "gender_code", "left");
  link(ER.sizes, "size_code", "size_code", "right");
  link(ER.grades, "grade_code", "grade_code", "right");

  // self-reference: parent_customer_id → customer_id (วนออกทางซ้ายของตาราง)
  const yParent = fieldY(C, "parent_customer_id");
  const yId = fieldY(C, "customer_id");
  const loopX = C.x - 30;
  links.append(svgEl("path", { class: "self", d: `M${C.x},${yParent} H${loopX} V${yId} H${C.x}` }));
  links.append(svgEl("text", { x: C.x - 8, y: yId - 6, "text-anchor": "end", class: "card self-label" }, "1"));
  links.append(svgEl("text", { x: C.x - 8, y: yParent - 6, "text-anchor": "end", class: "card self-label" }, "N"));
  links.append(svgEl("text", { x: loopX - 10, y: yParent - 18, "text-anchor": "end", class: "card self-label" }, "self-reference"));
  links.append(svgEl("text", { x: loopX - 10, y: yParent - 2, "text-anchor": "end", class: "card self-label" }, "ลูกค้าหลัก 1 : N ลูกค้าย่อย"));

  // customers 1 → N addresses
  const A = ER.addresses;
  const ax = A.x + A.w / 2;
  const cBottom = C.y + HEAD + C.fields.length * ROW;
  links.append(svgEl("path", { d: `M${ax},${cBottom} V${A.y}` }));
  links.append(svgEl("text", { x: ax + 8, y: cBottom + 16, class: "card" }, "1"));
  links.append(svgEl("text", { x: ax + 8, y: A.y - 6, class: "card" }, "N"));

  svg.replaceChildren(links, boxes);
}
drawER();

// ======================================================================
// ข้อ 6 — รัน SQL จริงในเบราว์เซอร์ด้วย sql.js
// ======================================================================
const editor = $<HTMLTextAreaElement>("#sql");
editor.value = __QUERY__.trim();

function renderResult(db: Database, sql: string) {
  const out = $("#sql-out");
  const status = $("#sql-status");
  out.replaceChildren();
  try {
    const results = db.exec(sql);
    if (results.length === 0) {
      status.textContent = "รันสำเร็จ (ไม่มีแถวผลลัพธ์)";
      return;
    }
    const { columns, values } = results.at(-1)!;
    const table = document.createElement("table");
    const head = table.createTHead().insertRow();
    for (const c of columns) head.append(Object.assign(document.createElement("th"), { textContent: c }));
    const body = table.createTBody();
    for (const row of values) addRow(body, row.map((v) => (v === null ? "NULL" : String(v))));
    out.append(table);
    status.textContent = `${values.length} แถว`;
    status.classList.remove("err");
  } catch (err) {
    status.textContent = `SQL error: ${(err as Error).message}`;
    status.classList.add("err");
  }
}

async function initSql() {
  const status = $("#sql-status");
  const wasmB64 = document.getElementById("sqljs-wasm")!.textContent!.trim();
  const wasmBinary = Uint8Array.from(atob(wasmB64), (c) => c.charCodeAt(0)).buffer; // ฝัง wasm ในหน้า ไม่ต้องพึ่ง CDN
  const SQL = await initSqlJs({ wasmBinary });
  const db = new SQL.Database();
  db.run("PRAGMA foreign_keys = ON;");
  db.run(__SCHEMA__);
  db.run(__SEED__);
  status.textContent = "ฐานข้อมูลพร้อมแล้ว";

  const run = () => renderResult(db, editor.value);
  $<HTMLButtonElement>("#sql-run").disabled = false;
  $<HTMLButtonElement>("#sql-run").addEventListener("click", run);
  editor.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") run();
  });
  document.querySelectorAll<HTMLButtonElement>("[data-sql]").forEach((b) =>
    b.addEventListener("click", () => {
      editor.value = b.dataset.sql === "q6" ? __QUERY__.trim() : b.dataset.sql!;
      run();
    }),
  );
  run();
}

initSql().catch((err) => {
  $("#sql-status").textContent = `โหลด SQLite ไม่สำเร็จ: ${(err as Error).message}`;
});
