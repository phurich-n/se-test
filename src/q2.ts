// ข้อ 2: จากส่วนของโปรแกรมที่กำหนดให้ต่อไปนี้ หลังจากจบการทำงานแล้วค่าของ i มีค่าเป็นเท่าใด
//
// Pseudocode
//   x := 1;  i := 1;
//   while (x <= 1000) begin
//     x := 2^x;
//     i := i + 1;
//   end;
import { isMain } from "./is_main.js";

// limit = เลข 1000 ในโจทย์ แยกเป็น parameter เพื่อให้ test ลองค่าอื่นได้
export function run(limit = 1000): number {
  let x = 1;
  let i = 1;

  while (x <= limit) {
    x = 2 ** x; // ** คือยกกำลัง (ใน JavaScript ^ คือ XOR)
    i = i + 1;
  }
  return i;
}

if (isMain(import.meta.url)) {
  console.log(`i = ${run()}`);
}
