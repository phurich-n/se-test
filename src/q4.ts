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

// 1) นิยามชนิดข้อมูลของ node
//    value เป็นได้ทั้ง number, string หรือ null (node ว่าง) -> ใช้ union type
type NodeValue = number | string | null;

interface TreeNode {
  value: NodeValue;
  left?: TreeNode; // ? = อาจไม่มีลูกก็ได้
  right?: TreeNode; // ? = อาจไม่มีลูกก็ได้
}

// ฟังก์ชันช่วยสร้าง node ให้เขียนสั้นลง
const node = (value: NodeValue, left?: TreeNode, right?: TreeNode): TreeNode => ({
  value,
  left,
  right,
});

// สร้าง tree ตามรูปในโจทย์
const root: TreeNode = node(
  "D",
  node(2, node(4)),
  node(3, node(5, node(null), node(7)), node("F", node(9), node(10))),
);

// วิธีที่ 1: Recursion (DFS) — ผลรวม = ค่าของตัวเอง + ผลรวมซ้าย + ผลรวมขวา
function sumRecursive(n?: TreeNode): number {
  if (!n) return 0; // base case: ไม่มี node -> 0
  const own = typeof n.value === "number" ? n.value : 0; // type guard
  return own + sumRecursive(n.left) + sumRecursive(n.right);
}

// 4) วิธีที่ 2: Iterative ด้วย Queue (BFS) — ไล่ทีละชั้น ไม่ใช้ recursion
function sumIterative(start: TreeNode): number {
  let total = 0;
  const queue: TreeNode[] = [start];
  const visited: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!; // หยิบตัวหน้าสุดออก
    visited.push(current.value === null ? "(ว่าง)" : String(current.value));
    if (typeof current.value === "number") total += current.value;
    if (current.left) queue.push(current.left); // ใส่ตัวลูกต่อท้ายคิว
    if (current.right) queue.push(current.right); // ใส่ตัวลูกต่อท้ายคิว
  }
  console.log("ลำดับการเยี่ยม (BFS):", visited.join(" -> "));
  return total;
}

console.log("ผลรวม (Recursive DFS):", sumRecursive(root));
console.log("ผลรวม (Iterative BFS):", sumIterative(root));
