// ข้อ 4: หาผลรวมของ "ตัวเลข" ใน Tree
//
//               D
//            /     \
//           2       3
//          /      /   \
//         4      5     F
//               / \   / \
//          (ว่าง)  7  9   10
//
// จุดหลอกของโจทย์: บาง node เป็นตัวอักษร (D, F) และมี node ว่าง 1 ตัว
// -> ต้องบวกเฉพาะค่าที่เป็นตัวเลขเท่านั้น
import { isMain } from "./is_main.js";

// 1) นิยามชนิดข้อมูลของ node
//    value เป็นได้ทั้ง number, string หรือ null (node ว่าง) -> ใช้ union type
export type NodeValue = number | string | null;

export interface TreeNode {
  value: NodeValue;
  left?: TreeNode; // ? = อาจไม่มีลูกก็ได้
  right?: TreeNode; // ? = อาจไม่มีลูกก็ได้
}

// ฟังก์ชันช่วยสร้าง node ให้เขียนสั้นลง
export const node = (value: NodeValue, left?: TreeNode, right?: TreeNode): TreeNode => ({
  value,
  left,
  right,
});

// สร้าง tree ตามรูปในโจทย์
export const root: TreeNode = node(
  "D",
  node(2, node(4)),
  node(3, node(5, node(null), node(7)), node("F", node(9), node(10))),
);

// วิธีที่ 1: Recursion (DFS) — ผลรวม = ค่าของตัวเอง + ผลรวมซ้าย + ผลรวมขวา
export function sumRecursive(n?: TreeNode): number {
  if (!n) return 0; // base case: ไม่มี node -> 0
  const own = typeof n.value === "number" ? n.value : 0; // type guard
  return own + sumRecursive(n.left) + sumRecursive(n.right);
}

// 4) วิธีที่ 2: Iterative ด้วย Queue (BFS) — ไล่ทีละชั้น ไม่ใช้ recursion
export function sumIterative(start: TreeNode): number {
  let total = 0;
  for (const current of bfsOrder(start)) {
    if (typeof current.value === "number") total += current.value;
  }
  return total;
}

// ลำดับ node ที่ BFS เดินผ่าน ใช้ queue: หยิบตัวหน้าสุดออก แล้วใส่ลูกต่อท้าย
// ใช้ head ชี้หัวคิวแทน queue.shift() เพราะ shift() ต้องเลื่อนสมาชิกที่เหลือทุกตัว (O(n) ต่อครั้ง)
// ทั้งฟังก์ชันจะกลายเป็น O(n²) ส่วน head++ เป็น O(1) ทั้งฟังก์ชันจึงเป็น O(n)
export function bfsOrder(start: TreeNode): TreeNode[] {
  const order: TreeNode[] = [];
  const queue: TreeNode[] = [start];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head++]; // หยิบตัวหน้าสุดออก
    order.push(current);
    if (current.left) queue.push(current.left); // ใส่ตัวลูกต่อท้ายคิว
    if (current.right) queue.push(current.right); // ใส่ตัวลูกต่อท้ายคิว
  }
  return order;
}

if (isMain(import.meta.url)) {
  const label = (v: NodeValue) => (v === null ? "(ว่าง)" : String(v));
  console.log("ผลรวม (Recursive DFS):", sumRecursive(root));
  console.log("ลำดับการเยี่ยม (BFS):", bfsOrder(root).map((n) => label(n.value)).join(" -> "));
  console.log("ผลรวม (Iterative BFS):", sumIterative(root));
}
