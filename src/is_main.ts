import { pathToFileURL } from "node:url";

// true เมื่อไฟล์นี้ถูกรันตรงๆ (npm run q2) และ false เมื่อถูก import จาก test
// ทำให้ test เรียกฟังก์ชันได้โดยไม่พิมพ์ผลลัพธ์ออกหน้าจอ
export const isMain = (moduleUrl: string) =>
  process.argv[1] !== undefined && moduleUrl === pathToFileURL(process.argv[1]).href;
