import { test } from "node:test";
import assert from "node:assert/strict";
import { bfsOrder, node, root, sumIterative, sumRecursive, type NodeValue, type TreeNode } from "../src/q4.js";

test("คำตอบของโจทย์: ทั้งสองวิธีได้ 40", () => {
  assert.equal(sumRecursive(root), 40);
  assert.equal(sumIterative(root), 40);
});

test("BFS เดินทีละชั้น ตามลำดับในรูปโจทย์", () => {
  assert.deepEqual(
    bfsOrder(root).map((n) => n.value),
    ["D", 2, 3, 4, 5, "F", null, 7, 9, 10],
  );
});

test("ข้าม node ที่ไม่ใช่ตัวเลข: ตัวอักษรและ node ว่างได้ผลรวม 0", () => {
  const t = node("A", node(null), node("B"));
  assert.equal(sumRecursive(t), 0);
  assert.equal(sumIterative(t), 0);
});

test("ไม่มี tree (undefined) ได้ 0", () => {
  assert.equal(sumRecursive(undefined), 0);
});

test("บวกเลขติดลบและทศนิยมได้ถูก", () => {
  const t = node(-5, node(2.5), node(2.5));
  assert.equal(sumRecursive(t), 0);
  assert.equal(sumIterative(t), 0);
});

test("tree สุ่ม 200 ต้น: DFS กับ BFS ได้ผลรวมเท่ากันทุกครั้ง", () => {
  let seed = 42; // สุ่มแบบกำหนด seed ให้ test ได้ผลเหมือนเดิมทุกรอบ
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  const values: NodeValue[] = [1, 7, -3, 10, "D", "F", null];
  const build = (depth: number): TreeNode | undefined =>
    depth === 0 || rand() < 0.2
      ? undefined
      : node(values[Math.floor(rand() * values.length)], build(depth - 1), build(depth - 1));

  for (let k = 0; k < 200; k++) {
    const t = build(8) ?? node(0);
    assert.equal(sumIterative(t), sumRecursive(t));
  }
});

test("tree กว้างมาก (262,143 node): BFS ที่ใช้ head index ได้ผลรวมถูกต้อง", () => {
  // complete binary tree 18 ชั้น ทุก node มีค่า 1 → ผลรวม = จำนวน node = 2^18 - 1
  const build = (depth: number): TreeNode | undefined =>
    depth === 0 ? undefined : node(1, build(depth - 1), build(depth - 1));
  const wide = build(18)!;
  assert.equal(bfsOrder(wide).length, 2 ** 18 - 1);
  assert.equal(sumIterative(wide), 2 ** 18 - 1);
});

test("tree ลึกมาก (200,000 ชั้น): recursion เกิด stack overflow แต่ queue ยังทำงานได้", () => {
  let deep = node(1);
  for (let k = 1; k < 200_000; k++) deep = node(1, deep);

  assert.throws(() => sumRecursive(deep), RangeError);
  assert.equal(sumIterative(deep), 200_000);
});
