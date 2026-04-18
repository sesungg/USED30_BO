CREATE TABLE IF NOT EXISTS admin_roles (
  code         TEXT PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  description  TEXT,
  is_system    BOOLEAN NOT NULL DEFAULT TRUE,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  code         TEXT PRIMARY KEY,
  resource     TEXT NOT NULL,
  action       TEXT NOT NULL,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (resource, action)
);

CREATE TABLE IF NOT EXISTS admin_role_permissions (
  role_code        TEXT NOT NULL REFERENCES admin_roles (code),
  permission_code  TEXT NOT NULL REFERENCES permissions (code) ON DELETE CASCADE,
  granted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_code, permission_code)
);

CREATE TABLE IF NOT EXISTS admin_accounts (
  user_id              UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  status               TEXT NOT NULL DEFAULT 'active',
  display_name         TEXT NOT NULL,
  department           TEXT,
  must_reset_password  BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at        TIMESTAMPTZ,
  created_by           UUID REFERENCES users (id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_user_roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES admin_accounts (user_id) ON DELETE CASCADE,
  role_code     TEXT NOT NULL REFERENCES admin_roles (code),
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_by   UUID REFERENCES users (id),
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at    TIMESTAMPTZ,
  revoked_by    UUID REFERENCES users (id),
  UNIQUE (user_id, role_code)
);

CREATE INDEX IF NOT EXISTS idx_admin_user_roles_active
  ON admin_user_roles (user_id, role_code)
  WHERE revoked_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_admin_user_primary_role
  ON admin_user_roles (user_id)
  WHERE is_primary = TRUE AND revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS admin_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES admin_accounts (user_id) ON DELETE CASCADE,
  token_hash    TEXT NOT NULL UNIQUE,
  ip_address    INET,
  user_agent    TEXT,
  issued_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL,
  revoked_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user
  ON admin_sessions (user_id, issued_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_active
  ON admin_sessions (expires_at)
  WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS admin_login_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users (id),
  email_snapshot  TEXT NOT NULL,
  event           TEXT NOT NULL,
  failure_reason  TEXT,
  ip_address      INET,
  user_agent      TEXT,
  session_id      UUID REFERENCES admin_sessions (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_login_logs_user
  ON admin_login_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_login_logs_email
  ON admin_login_logs (email_snapshot, created_at DESC);

CREATE OR REPLACE VIEW v_admin_effective_permissions AS
SELECT
  aur.user_id,
  p.code AS permission_code,
  p.resource,
  p.action
FROM admin_user_roles aur
JOIN admin_role_permissions arp
  ON arp.role_code = aur.role_code
JOIN permissions p
  ON p.code = arp.permission_code
WHERE aur.revoked_at IS NULL;
