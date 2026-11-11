SELECT
  c.customer_code                                AS sub_customer_code,
  t1.title_name || c.first_name || ' ' || COALESCE(c.last_name, '') AS sub_customer_name,
  p.customer_code                                AS main_customer_code,
  t2.title_name || p.first_name || ' ' || COALESCE(p.last_name, '') AS main_customer_name
FROM customers c
INNER JOIN customers p ON c.parent_customer_id = p.customer_id
INNER JOIN titles t1   ON c.title_id = t1.title_id
INNER JOIN titles t2   ON p.title_id = t2.title_id
ORDER BY p.customer_code, c.customer_code;
