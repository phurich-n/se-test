// ข้อ 5–6: สร้างฐานข้อมูลจริง (SQLite in-memory ผ่าน sql.js) ใส่ข้อมูลตัวอย่าง แล้วรัน query ข้อ 6
// sql.js = SQLite ที่คอมไพล์เป็น WebAssembly -> รันได้ทั้ง Node และในเบราว์เซอร์ (หน้าเว็บใช้ไฟล์ SQL ชุดเดียวกัน)
import initSqlJs from "sql.js";
import { readFileSync } from "node:fs";

const readSql = (file: string) => readFileSync(new URL(`../sql/${file}`, import.meta.url), "utf8");

const SQL = await initSqlJs();
const db = new SQL.Database();
db.run("PRAGMA foreign_keys = ON;");

db.run(readSql("q5_schema.sql")); // ข้อ 5: สร้างตาราง
db.run(readSql("q5_seed.sql")); //   ข้อมูลตัวอย่าง

const [result] = db.exec(readSql("q6_query.sql")); // ข้อ 6: ได้ { columns, values }
const rows = result.values.map((v) => Object.fromEntries(result.columns.map((col, i) => [col, v[i]])));

console.log("ข้อ 6: ลูกค้าย่อยและลูกค้าหลักของแต่ละราย");
console.table(rows);
db.close();
