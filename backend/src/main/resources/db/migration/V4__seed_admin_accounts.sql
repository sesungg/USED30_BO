INSERT INTO admin_roles (code, name, description, sort_order)
VALUES
  ('super_admin', 'Super Admin', 'Full platform administrator', 10),
  ('admin', 'Admin', 'General backoffice administrator', 20),
  ('inspector', 'Inspector', 'Inspection workflow manager', 30),
  ('settlement_manager', 'Settlement Manager', 'Settlement and payout operations', 40),
  ('cs_agent', 'CS Agent', 'Customer support operations', 50),
  ('product_reviewer', 'Product Reviewer', 'Product review and moderation', 60),
  ('store_manager', 'Store Manager', 'Store catalog and operations', 70),
  ('readonly_analyst', 'Readonly Analyst', 'Read-only analytics access', 80)
ON CONFLICT (code) DO NOTHING;

WITH seeded_admins (email, password_hash, nickname) AS (
  VALUES
    ('super@used30.com',      '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'super_admin'),
    ('admin@used30.com',      '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'admin'),
    ('inspector@used30.com',  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'inspector'),
    ('settlement@used30.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'settlement_mgr'),
    ('cs@used30.com',         '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'cs_agent'),
    ('reviewer@used30.com',   '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'product_reviewer'),
    ('store@used30.com',      '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'store_manager'),
    ('analyst@used30.com',    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'readonly_analyst')
)
INSERT INTO users (email, password_hash, nickname, is_active)
SELECT email, password_hash, nickname, TRUE
FROM seeded_admins
ON CONFLICT (email) DO NOTHING;

DO $$
DECLARE
  role_udt_name TEXT;
BEGIN
  SELECT c.udt_name
  INTO role_udt_name
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'users'
    AND c.column_name = 'role';

  IF role_udt_name = 'user_role' THEN
    EXECUTE $sql$
      UPDATE users u
      SET role = seeded_admins.role::user_role
      FROM (
        VALUES
          ('super@used30.com', 'admin'),
          ('admin@used30.com', 'admin'),
          ('inspector@used30.com', 'inspector'),
          ('settlement@used30.com', 'admin'),
          ('cs@used30.com', 'admin'),
          ('reviewer@used30.com', 'admin'),
          ('store@used30.com', 'admin'),
          ('analyst@used30.com', 'admin')
      ) AS seeded_admins(email, role)
      WHERE u.email = seeded_admins.email
    $sql$;
  ELSE
    UPDATE users u
    SET role = seeded_admins.role
    FROM (
      VALUES
        ('super@used30.com', 'admin'),
        ('admin@used30.com', 'admin'),
        ('inspector@used30.com', 'inspector'),
        ('settlement@used30.com', 'admin'),
        ('cs@used30.com', 'admin'),
        ('reviewer@used30.com', 'admin'),
        ('store@used30.com', 'admin'),
        ('analyst@used30.com', 'admin')
    ) AS seeded_admins(email, role)
    WHERE u.email = seeded_admins.email;
  END IF;
END $$;

WITH seeded_admins (email, display_name, department) AS (
  VALUES
    ('super@used30.com',      'Super Admin',        'Platform'),
    ('admin@used30.com',      'Admin',              'Operations'),
    ('inspector@used30.com',  'Inspector',          'Inspection'),
    ('settlement@used30.com', 'Settlement Manager', 'Settlement'),
    ('cs@used30.com',         'CS Agent',           'Customer Care'),
    ('reviewer@used30.com',   'Product Reviewer',   'Catalog'),
    ('store@used30.com',      'Store Manager',      'Store'),
    ('analyst@used30.com',    'Readonly Analyst',   'Analytics')
)
INSERT INTO admin_accounts (user_id, status, display_name, department, must_reset_password)
SELECT u.id, 'active', seeded_admins.display_name, seeded_admins.department, FALSE
FROM seeded_admins
JOIN users u ON u.email = seeded_admins.email
ON CONFLICT (user_id) DO NOTHING;

WITH seeded_admins (email, role_code) AS (
  VALUES
    ('super@used30.com',      'super_admin'),
    ('admin@used30.com',      'admin'),
    ('inspector@used30.com',  'inspector'),
    ('settlement@used30.com', 'settlement_manager'),
    ('cs@used30.com',         'cs_agent'),
    ('reviewer@used30.com',   'product_reviewer'),
    ('store@used30.com',      'store_manager'),
    ('analyst@used30.com',    'readonly_analyst')
)
INSERT INTO admin_user_roles (user_id, role_code, is_primary)
SELECT u.id, seeded_admins.role_code, TRUE
FROM seeded_admins
JOIN users u ON u.email = seeded_admins.email
ON CONFLICT (user_id, role_code) DO NOTHING;
