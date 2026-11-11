import { test } from "node:test";
import assert from "node:assert/strict";
import { run } from "../src/q2.js";

test("คำตอบของโจทย์: limit = 1000 ได้ i = 5", () => {
  assert.equal(run(), 5);
});

test("^ ใน JavaScript คือ XOR ไม่ใช่ยกกำลัง จึงต้องใช้ **", () => {
  assert.equal(2 ^ 1, 3);
  assert.equal(2 ** 1, 2);
});

test("ถ้า x เริ่มต้นเกิน limit อยู่แล้ว จะไม่เข้า loop เลย ได้ i = 1", () => {
  assert.equal(run(0), 1);
});

test("limit = 1 วน 1 รอบ (x: 1 → 2) ได้ i = 2", () => {
  assert.equal(run(1), 2);
});

test("limit = 1,000,000: 2^65536 ใหญ่เกิน number จึงกลายเป็น Infinity แล้ว loop หยุด ได้ i = 6", () => {
  assert.equal(2 ** 65536, Infinity);
  assert.equal(run(1_000_000), 6);
});
