-- 백오피스 관리자 계정 초기 데이터
-- password: 'password123' BCrypt hashed
INSERT INTO users (email, password_hash, nickname, role, is_active)
VALUES
  ('super@used30.com',      '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'super_admin',      'admin',     true),
  ('admin@used30.com',      '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'admin',            'admin',     true),
  ('inspector@used30.com',  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'inspector',        'inspector', true),
  ('settlement@used30.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'settlement_mgr',   'admin',     true),
  ('cs@used30.com',         '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'cs_agent',         'admin',     true),
  ('reviewer@used30.com',   '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'product_reviewer', 'admin',     true),
  ('store@used30.com',      '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'store_manager',    'admin',     true),
  ('analyst@used30.com',    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RqtfBKQ8H/rH0OFWy', 'readonly_analyst', 'admin',     true)
ON CONFLICT (email) DO NOTHING;
