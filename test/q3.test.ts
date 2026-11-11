import { test } from "node:test";
import assert from "node:assert/strict";
import { run } from "../src/q3.js";

const formula = (n: number) => n * (Math.floor(Math.log2(n)) + 1);

test("คำตอบของโจทย์: n = 256 ได้ r = 2,304", () => {
  assert.equal(run(256), 2304);
});

test("n = 100 (ไม่ใช่กำลังของ 2) i เป็นทศนิยมแต่ยังได้ 7 รอบ r = 700", () => {
  assert.equal(run(100), 700);
});

test("n = 1 วน 1 รอบ ได้ r = 1", () => {
  assert.equal(run(1), 1);
});

test("n = 0 ไม่เข้า loop เลย ได้ r = 0", () => {
  assert.equal(run(0), 0);
});

test("ผลตรงกับสูตร n × (⌊log₂n⌋ + 1) ทุกค่า n ตั้งแต่ 1 ถึง 2,000", () => {
  for (let n = 1; n <= 2000; n++) {
    assert.equal(run(n), formula(n), `n = ${n}`);
  }
});

test("หารทศนิยม (/) กับหารจำนวนเต็ม (DIV) ได้จำนวนรอบเท่ากัน", () => {
  const roundsWith = (n: number, half: (i: number) => number) => {
    let rounds = 0;
    for (let i = n; i >= 1; i = half(i)) rounds++;
    return rounds;
  };
  for (let n = 1; n <= 2000; n++) {
    assert.equal(roundsWith(n, (i) => i / 2), roundsWith(n, (i) => Math.floor(i / 2)), `n = ${n}`);
  }
});
