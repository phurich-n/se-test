// สร้างไฟล์ฐานข้อมูล SQLite จริง -> db/customers.db
// ใช้ schema + ข้อมูลตัวอย่างชุดเดียวกับ q5,q6 (ไฟล์ใน sql/)
import initSqlJs from "sql.js";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const readSql = (file: string) => readFileSync(new URL(`sql/${file}`, root), "utf8");
const dbUrl = new URL("db/customers.db", root);

const SQL = await initSqlJs();

// 1) สร้างฐานข้อมูลใหม่ทุกครั้ง (เขียนทับไฟล์เดิม) แล้วใส่ตาราง + ข้อมูลตัวอย่าง
const db = new SQL.Database();
db.run("PRAGMA foreign_keys = ON;");
db.run(readSql("q5_schema.sql"));
db.run(readSql("q5_seed.sql"));

const fkProblems = db.exec("PRAGMA foreign_key_check;");
if (fkProblems.length > 0) throw new Error(`ข้อมูลผิด foreign key: ${JSON.stringify(fkProblems[0].values)}`);

mkdirSync(new URL("db/", root), { recursive: true });
writeFileSync(dbUrl, db.export());
db.close();

// 2) เปิดไฟล์ที่เพิ่งเขียนกลับขึ้นมา เพื่อยืนยันว่าไฟล์ใช้งานได้จริง แล้วรัน query ข้อ 6
const file = new SQL.Database(readFileSync(dbUrl));
const tables = file.exec(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;`)[0].values.map(([name]) => {
  const [[count]] = file.exec(`SELECT COUNT(*) FROM "${name}";`)[0].values;
  return { table: name, rows: count };
});

console.log(`สร้างไฟล์ฐานข้อมูลแล้ว: ${fileURLToPath(dbUrl)}`);
console.table(tables);

const [result] = file.exec(readSql("q6_query.sql"));
console.log("ข้อ 6 (รันจากไฟล์ .db): ลูกค้าย่อยและลูกค้าหลักของแต่ละราย");
console.table(result.values.map((v) => Object.fromEntries(result.columns.map((col, i) => [col, v[i]]))));
file.close();
