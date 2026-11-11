-- ข้อ 5: Design + Normalization ตารางข้อมูลลูกค้า
-- แยกข้อมูลที่ซ้ำ/เป็นชุดค่าคงที่ ออกเป็น lookup table (3NF)
-- และใช้ Self-referencing FK (parent_customer_id) สำหรับ "ลูกค้าย่อยของลูกค้าหลัก"

CREATE TABLE titles (                 -- คำนำหน้า
  title_id    INTEGER PRIMARY KEY,
  title_name  VARCHAR(30) NOT NULL UNIQUE   -- นาย, นาง, นางสาว, บริษัท ...
);

CREATE TABLE genders (                -- เพศ
  gender_code CHAR(1) PRIMARY KEY,          -- M, F, U
  gender_name VARCHAR(20) NOT NULL
);

CREATE TABLE customer_sizes (         -- ขนาดลูกค้า
  size_code   CHAR(1) PRIMARY KEY,          -- S, M, B
  size_name   VARCHAR(20) NOT NULL
);

CREATE TABLE customer_grades (        -- เกรดลูกค้า
  grade_code  CHAR(1) PRIMARY KEY,          -- A, B, C, D
  grade_desc  VARCHAR(50) NOT NULL
);

CREATE TABLE customers (
  customer_id        INTEGER PRIMARY KEY,
  customer_code      VARCHAR(20) NOT NULL UNIQUE,   -- รหัสลูกค้า (รหัสทางธุรกิจ)
  title_id           INTEGER NOT NULL REFERENCES titles(title_id),
  first_name         VARCHAR(100) NOT NULL,
  last_name          VARCHAR(100),
  national_id        CHAR(13) UNIQUE,               -- บัตรประชาชน 13 หลัก
  gender_code        CHAR(1) REFERENCES genders(gender_code),
  birth_date         DATE,
  size_code          CHAR(1) NOT NULL REFERENCES customer_sizes(size_code),
  grade_code         CHAR(1) NOT NULL REFERENCES customer_grades(grade_code),
  parent_customer_id INTEGER NULL REFERENCES customers(customer_id),  -- NULL = ลูกค้าหลัก
  CHECK (parent_customer_id IS NULL OR parent_customer_id <> customer_id)
);

CREATE TABLE customer_addresses (     -- ที่อยู่ (แยกเป็น atomic field ตาม 1NF, 1 ลูกค้ามีได้หลายที่อยู่)
  address_id    INTEGER PRIMARY KEY,
  customer_id   INTEGER NOT NULL REFERENCES customers(customer_id),
  address_type  VARCHAR(20) NOT NULL DEFAULT 'HOME',  -- HOME, BILLING, SHIPPING
  house_no      VARCHAR(50),
  street        VARCHAR(100),
  sub_district  VARCHAR(100),
  district      VARCHAR(100),
  province      VARCHAR(100),
  postal_code   CHAR(5)
);

CREATE INDEX idx_customers_parent ON customers(parent_customer_id);

-- กันวงวนของลูกค้าหลัก–ลูกค้าย่อย (เช่น A เป็นลูกของ B และ B เป็นลูกของ A)
-- CHECK ด้านบนกันได้แค่ A → A จึงใช้ trigger ไล่ขึ้นไปตาม parent ทีละชั้น
-- ถ้าเจอตัวเองระหว่างทาง แปลว่าจะเกิดวง ให้ยกเลิกการแก้ไข
-- (ตอน INSERT เกิดวงไม่ได้ เพราะยังไม่มีแถวไหนชี้มาที่ลูกค้าใหม่)
CREATE TRIGGER trg_customers_no_parent_cycle
BEFORE UPDATE OF parent_customer_id ON customers
WHEN NEW.parent_customer_id IS NOT NULL
BEGIN
  SELECT RAISE(ABORT, 'parent_customer_id ทำให้เกิดวงวนของลูกค้าหลัก–ลูกค้าย่อย')
  WHERE EXISTS (
    WITH RECURSIVE ancestors(id) AS (
      SELECT NEW.parent_customer_id
      UNION
      SELECT c.parent_customer_id
      FROM customers c JOIN ancestors a ON c.customer_id = a.id
      WHERE c.parent_customer_id IS NOT NULL
    )
    SELECT 1 FROM ancestors WHERE id = NEW.customer_id
  );
END;
