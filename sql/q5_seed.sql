-- ข้อมูลตัวอย่างสำหรับข้อ 5–6
INSERT INTO titles VALUES (1,'นาย'),(2,'นาง'),(3,'นางสาว'),(4,'บริษัท ');
INSERT INTO genders VALUES ('M','ชาย'),('F','หญิง'),('U','ไม่ระบุ');
INSERT INTO customer_sizes VALUES ('S','Small'),('M','Medium'),('B','Big');
INSERT INTO customer_grades VALUES ('A','ดีมาก'),('B','ดี'),('C','ปานกลาง'),('D','ต้องติดตาม');

-- customer_id, code, title, first, last, national_id, gender, birth, size, grade, parent
INSERT INTO customers VALUES
  (1,'C001',4,'ยางไทย','จำกัด',NULL,NULL,NULL,'B','A',NULL),                       -- ลูกค้าหลัก
  (2,'C002',1,'สมชาย','ใจดี','1100100000011','M','1985-03-12','M','B',NULL),       -- ลูกค้าหลัก
  (3,'C003',3,'สมหญิง','รักงาน','1100100000022','F','1990-07-01','S','B',1),       -- ย่อยของ C001
  (4,'C004',1,'ประเสริฐ','มั่นคง','1100100000033','M','1978-11-20','S','C',1),     -- ย่อยของ C001
  (5,'C005',2,'มาลี','สุขใจ','1100100000044','F','1982-01-05','S','D',2);          -- ย่อยของ C002

INSERT INTO customer_addresses (customer_id, house_no, street, sub_district, district, province, postal_code) VALUES
  (1,'99','ถนนกาญจนวนิช','คอหงส์','หาดใหญ่','สงขลา','90110'),
  (3,'12/3','ถนนเพชรเกษม','หาดใหญ่','หาดใหญ่','สงขลา','90110');
