import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import initSqlJs, { type Database } from "sql.js";

const readSql = (file: string) => readFileSync(new URL(`../sql/${file}`, import.meta.url), "utf8");
const SQL = await initSqlJs();

// ทุก test ได้ฐานข้อมูลใหม่ที่มีตารางจากข้อ 5 และข้อมูลตัวอย่าง จึงไม่กระทบกัน
let db: Database;
beforeEach(() => {
  db = new SQL.Database();
  db.run("PRAGMA foreign_keys = ON;");
  db.run(readSql("q5_schema.sql"));
  db.run(readSql("q5_seed.sql"));
});
afterEach(() => db.close());

const rows = (sql: string) => {
  const [result] = db.exec(sql);
  if (!result) return [];
  return result.values.map((v) => Object.fromEntries(result.columns.map((col, i) => [col, v[i]])));
};

// ---------- ข้อ 5 ----------
test("ข้อ 5: มี 6 ตาราง", () => {
  const tables = rows("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;").map((r) => r.name);
  assert.deepEqual(tables, ["customer_addresses", "customer_grades", "customer_sizes", "customers", "genders", "titles"]);
});

test("ข้อ 5: ข้อมูลตัวอย่างไม่ผิด foreign key", () => {
  assert.deepEqual(db.exec("PRAGMA foreign_key_check;"), []);
});

test("ข้อ 5: ลูกค้าเป็น parent ของตัวเองไม่ได้ ทั้งตอนเพิ่มและตอนแก้", () => {
  // INSERT: CHECK constraint กันไว้
  assert.throws(() => db.run("INSERT INTO customers VALUES (6,'C006',1,'ใหม่','ทดสอบ',NULL,'M',NULL,'S','C',6);"), /CHECK/);
  // UPDATE: trigger กันวงวนทำงานก่อน CHECK (BEFORE UPDATE) จึงเป็นตัวที่ปฏิเสธ
  assert.throws(() => db.run("UPDATE customers SET parent_customer_id = customer_id WHERE customer_code = 'C002';"), /วงวน/);
});

test("ข้อ 5: กันวงวน 2 ชั้น (C001 ไปเป็นลูกของ C003 ซึ่งเป็นลูกของ C001 อยู่แล้ว)", () => {
  assert.throws(() => db.run("UPDATE customers SET parent_customer_id = 3 WHERE customer_code = 'C001';"), /วงวน/);
  // แถวเดิมต้องไม่ถูกแก้
  assert.equal(rows("SELECT parent_customer_id AS p FROM customers WHERE customer_code = 'C001';")[0].p, null);
});

test("ข้อ 5: กันวงวนหลายชั้น (C001 → C003 → C004 → C001)", () => {
  db.run("UPDATE customers SET parent_customer_id = 3 WHERE customer_code = 'C004';"); // C004 ย้ายไปอยู่ใต้ C003 ได้ปกติ
  assert.throws(() => db.run("UPDATE customers SET parent_customer_id = 4 WHERE customer_code = 'C001';"), /วงวน/);
});

test("ข้อ 5: ย้ายลูกค้าไปอยู่ใต้ลูกค้าอื่นที่ไม่ทำให้เกิดวง ยังทำได้ปกติ", () => {
  db.run("UPDATE customers SET parent_customer_id = 2 WHERE customer_code = 'C001';"); // C001 ไปอยู่ใต้ C002
  db.run("UPDATE customers SET parent_customer_id = NULL WHERE customer_code = 'C003';"); // C003 กลายเป็นลูกค้าหลัก
  assert.equal(rows("SELECT parent_customer_id AS p FROM customers WHERE customer_code = 'C001';")[0].p, 2);
});

test("ข้อ 5: parent ต้องเป็นลูกค้าที่มีอยู่จริง", () => {
  assert.throws(() => db.run("UPDATE customers SET parent_customer_id = 999 WHERE customer_code = 'C002';"), /FOREIGN KEY/);
});

test("ข้อ 5: รหัสลูกค้าและเลขบัตรประชาชนซ้ำกันไม่ได้", () => {
  assert.throws(() => db.run("UPDATE customers SET customer_code = 'C001' WHERE customer_code = 'C002';"), /UNIQUE/);
  assert.throws(() => db.run("UPDATE customers SET national_id = '1100100000011' WHERE customer_code = 'C003';"), /UNIQUE/);
});

test("ข้อ 5: ขนาดและเกรดต้องเป็นค่าที่มีในตาราง lookup เท่านั้น", () => {
  assert.throws(() => db.run("UPDATE customers SET size_code = 'X' WHERE customer_code = 'C002';"), /FOREIGN KEY/);
  assert.throws(() => db.run("UPDATE customers SET grade_code = 'E' WHERE customer_code = 'C002';"), /FOREIGN KEY/);
});

test("ข้อ 5: ลูกค้า 1 รายมีได้หลายที่อยู่", () => {
  db.run("INSERT INTO customer_addresses (customer_id, address_type, province) VALUES (1, 'BILLING', 'กรุงเทพมหานคร');");
  assert.equal(rows("SELECT COUNT(*) AS n FROM customer_addresses WHERE customer_id = 1;")[0].n, 2);
});

// ---------- ข้อ 6 ----------
test("ข้อ 6: ได้ลูกค้าย่อย 3 ราย พร้อมลูกค้าหลักที่ถูกต้อง", () => {
  const result = rows(readSql("q6_query.sql")).map((r) => [r.sub_customer_code, r.main_customer_code]);
  assert.deepEqual(result, [
    ["C003", "C001"],
    ["C004", "C001"],
    ["C005", "C002"],
  ]);
});

test("ข้อ 6: ไม่มีลูกค้าหลัก (parent เป็น NULL) ปนอยู่ในผลลัพธ์", () => {
  const subs = rows(readSql("q6_query.sql")).map((r) => r.sub_customer_code);
  assert.ok(!subs.includes("C001"));
  assert.ok(!subs.includes("C002"));
});

test("ข้อ 6: ลูกค้าที่ไม่มีนามสกุล (นิติบุคคล) ชื่อไม่กลายเป็น NULL", () => {
  const main = rows(readSql("q6_query.sql")).find((r) => r.main_customer_code === "C001");
  assert.equal(main?.main_customer_name, "บริษัท ยางไทย จำกัด");
  db.run("UPDATE customers SET last_name = NULL WHERE customer_code = 'C001';");
  const again = rows(readSql("q6_query.sql")).find((r) => r.main_customer_code === "C001");
  assert.equal(typeof again?.main_customer_name, "string");
});

test("ข้อ 6: เพิ่มลูกค้าย่อยใหม่แล้ว query เห็นทันที", () => {
  db.run("INSERT INTO customers VALUES (6,'C006',1,'ใหม่','ทดสอบ',NULL,'M',NULL,'S','C',2);");
  const subs = rows(readSql("q6_query.sql")).map((r) => r.sub_customer_code);
  assert.deepEqual(subs, ["C003", "C004", "C005", "C006"]);
});
