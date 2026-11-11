// ข้อ 3: ถ้า n มีค่าเท่ากับ 256 หลังจบการทำงานแล้ว r มีค่าเท่าใด
//
// Pseudocode
//   i := n;  r := 0;
//   while (i >= 1) do begin
//     for j := 1 to n do
//       r := r + 1;
//     i := i / 2;
//   end;

import { isMain } from "./is_main.js";

export function run(n: number): number {
  let i = n;
  let r = 0;

  while (i >= 1) {
    for (let j = 1; j <= n; j++) {
      r = r + 1; // loop ข้างในทำ n ครั้งเสมอ, r เพิ่มรอบละ n
    }
    i = i / 2;
  }
  return r;
}

if (isMain(import.meta.url)) {
  const n = 256;
  const r = run(n);

  console.log(`r = ${r}`);
  console.log(`check ด้วยสูตร: n * (log2(n) + 1) = ${n} * ${Math.log2(n) + 1} = ${n * (Math.log2(n) + 1)}`);
}
