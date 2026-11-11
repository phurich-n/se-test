# Software Engineer Assessment Test — Solutions (TypeScript)

คำตอบแบบทดสอบ Software Engineer ของบริษัท เซาท์แลนด์รับเบอร์ จำกัด เขียนด้วย TypeScript และ SQL (SQLite)
ทุกข้อรันได้จริง ทั้งบนเครื่องและในเบราว์เซอร์

ผู้ทำ: Phurich Nilvisut

## อ่านคำตอบ

- **หน้าเว็บ interactive:** https://phurich-n.github.io/se-test/ — กด Run ดูการทำงานทีละขั้นได้ทุกข้อ ข้อ 6 รัน SQLite จริงบนหน้าเว็บ

| ข้อ | เรื่อง | คำตอบ | โค้ด |
|:---:|---|---|---|
| 1 | ตรวจสอบปัญหาเมื่อระบบใช้งานไม่ได้ | 7 ขั้นตอน | — |
| 2 | ค่าของ i หลังจบ loop | i = 5 | [src/q2.ts](src/q2.ts) |
| 3 | ค่าของ r เมื่อ n = 256 | r = 2,304 | [src/q3.ts](src/q3.ts) |
| 4 | ผลรวมตัวเลขใน Tree | 40 | [src/q4.ts](src/q4.ts) |
| 5 | Design + Normalization (ER Diagram) | 6 ตาราง | [sql/q5_schema.sql](sql/q5_schema.sql) |
| 6 | Query ลูกค้าย่อยและลูกค้าหลัก | SELF JOIN | [sql/q6_query.sql](sql/q6_query.sql) |

## วิธีรันบนเครื่อง

ต้องมี Node.js 18 ขึ้นไป

```bash
npm install
```

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run q2` | รันข้อ 2 |
| `npm run q3` | รันข้อ 3 |
| `npm run q4` | รันข้อ 4 (ทั้งแบบ recursion และ queue) |
| `npm run q5` | รันข้อ 5–6: สร้างตารางใน memory ใส่ข้อมูลตัวอย่าง แล้วรัน query ข้อ 6 |
| `npm run db` | สร้างไฟล์ฐานข้อมูล SQLite จริงที่ `db/customers.db` |
| `npm run typecheck` | ตรวจ type ทั้งโปรเจกต์ |

ไม่อยากติดตั้งอะไร: เปิดใน [StackBlitz](https://stackblitz.com/github/phurich-n/se-test) หรือ [GitHub Codespaces](https://codespaces.new/phurich-n/se-test) แล้วพิมพ์คำสั่งข้างบนใน terminal ได้เลย

## ฐานข้อมูล

[`db/customers.db`](db/customers.db) เป็นไฟล์ SQLite 3 มี 6 ตารางพร้อมข้อมูลตัวอย่าง (ลูกค้า 5 ราย เป็นลูกค้าหลัก 2 รายและลูกค้าย่อย 3 ราย)
เปิดดูได้ด้วย DB Browser for SQLite, DBeaver, ส่วนขยาย SQLite ใน VS Code หรือ `sqlite3 db/customers.db`

ตาราง ข้อมูลตัวอย่าง และ query เก็บเป็นไฟล์ `.sql` ชุดเดียว ใช้ร่วมกันทั้งโปรแกรมบนเครื่อง ไฟล์ `.db` และหน้าเว็บ แก้ที่ `sql/` ที่เดียวแล้วตรงกันทุกที่
