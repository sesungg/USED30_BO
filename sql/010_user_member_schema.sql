-- used30_bo user/member schema
-- Apply order:
--   1) 010_user_member_schema.sql
--   2) 020_admin_rbac_and_auth_schema.sql
--   3) 030_commerce_core_schema.sql
--   4) 040_admin_ops_schema.sql
--
-- Notes:
-- - This file is self-contained for member/auth domain tables.
-- - BO authorization is NOT derived from users.role. See 020_admin_rbac_and_auth_schema.sql.
-- - App-managed enum values are documented in 000_app_managed_enums.json.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  nickname        TEXT NOT NULL UNIQUE,
  phone           TEXT,
  phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  role            TEXT NOT NULL DEFAULT 'user',
  profile_bg      TEXT NOT NULL DEFAULT '#0050BE',
  manner_score    NUMERIC(4,2) NOT NULL DEFAULT 36.5
                  CHECK (manner_score BETWEEN 0 AND 100),
  sales_count     INT NOT NULL DEFAULT 0 CHECK (sales_count >= 0),
  purchase_count  INT NOT NULL DEFAULT 0 CHECK (purchase_count >= 0),
  wish_count      INT NOT NULL DEFAULT 0 CHECK (wish_count >= 0),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_nickname ON users (nickname);
CREATE INDEX idx_users_role     ON users (role) WHERE role IN ('admin', 'inspector');

CREATE TABLE user_bank_accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  bank_name     TEXT NOT NULL,
  account_no    TEXT NOT NULL,
  holder_name   TEXT NOT NULL,
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at   TIMESTAMPTZ,
  is_primary    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bank_accounts_user ON user_bank_accounts (user_id);
CREATE UNIQUE INDEX uq_user_primary_account
  ON user_bank_accounts (user_id)
  WHERE is_primary = TRUE;

CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  device_info TEXT,
  ip_address  INET,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user   ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expiry ON refresh_tokens (expires_at)
  WHERE revoked_at IS NULL;

CREATE TABLE email_verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  purpose     TEXT NOT NULL
              CHECK (purpose IN ('signup', 'password_reset', 'email_change')),
  is_used     BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  used_at     TIMESTAMPTZ,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_verif_email  ON email_verifications (email, purpose)
  WHERE is_used = FALSE;
CREATE INDEX idx_email_verif_expiry ON email_verifications (expires_at)
  WHERE is_used = FALSE;

CREATE TABLE phone_verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  purpose     TEXT NOT NULL
              CHECK (purpose IN ('signup', 'bank_account', 'password_reset')),
  attempts    SMALLINT NOT NULL DEFAULT 0 CHECK (attempts <= 5),
  is_used     BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '3 minutes'),
  used_at     TIMESTAMPTZ,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_phone_verif_phone  ON phone_verifications (phone, purpose)
  WHERE is_used = FALSE;
CREATE INDEX idx_phone_verif_expiry ON phone_verifications (expires_at)
  WHERE is_used = FALSE;

CREATE TABLE password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  is_used     BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  used_at     TIMESTAMPTZ,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pwd_reset_user   ON password_reset_tokens (user_id)
  WHERE is_used = FALSE;
CREATE INDEX idx_pwd_reset_expiry ON password_reset_tokens (expires_at)
  WHERE is_used = FALSE;

CREATE TABLE oauth_accounts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  provider         TEXT NOT NULL,
  provider_uid     TEXT NOT NULL,
  access_token     TEXT,
  refresh_token    TEXT,
  token_expires_at TIMESTAMPTZ,
  raw_profile      JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_uid)
);

CREATE INDEX idx_oauth_user ON oauth_accounts (user_id);

CREATE TABLE user_addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  label       TEXT NOT NULL DEFAULT 'home',
  recipient   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  zipcode     TEXT NOT NULL,
  address     TEXT NOT NULL,
  address2    TEXT,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_addresses_user ON user_addresses (user_id);
CREATE UNIQUE INDEX uq_user_default_address
  ON user_addresses (user_id)
  WHERE is_default = TRUE;

CREATE TABLE user_notification_settings (
  user_id           UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  inspection_result BOOLEAN NOT NULL DEFAULT TRUE,
  grade_mismatch    BOOLEAN NOT NULL DEFAULT TRUE,
  shipping          BOOLEAN NOT NULL DEFAULT TRUE,
  settlement        BOOLEAN NOT NULL DEFAULT TRUE,
  marketing         BOOLEAN NOT NULL DEFAULT FALSE,
  push_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_push_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  platform     TEXT NOT NULL,
  token        TEXT NOT NULL UNIQUE,
  device_id    TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_push_tokens_user  ON user_push_tokens (user_id) WHERE is_active = TRUE;
CREATE INDEX idx_push_tokens_token ON user_push_tokens (token);

CREATE TABLE terms_of_service (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT NOT NULL,
  version      TEXT NOT NULL,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  is_required  BOOLEAN NOT NULL DEFAULT TRUE,
  effective_at TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (type, version)
);

CREATE INDEX idx_terms_type_effective
  ON terms_of_service (type, effective_at DESC);

CREATE VIEW v_current_terms AS
SELECT DISTINCT ON (type) *
FROM terms_of_service
WHERE effective_at <= NOW()
ORDER BY type, effective_at DESC;

CREATE TABLE user_agreements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  terms_id    UUID NOT NULL REFERENCES terms_of_service (id),
  is_agreed   BOOLEAN NOT NULL,
  agreed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address  INET,
  user_agent  TEXT,
  UNIQUE (user_id, terms_id)
);

CREATE INDEX idx_user_agreements_user ON user_agreements (user_id);

CREATE TABLE banned_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  reason     TEXT NOT NULL,
  note       TEXT,
  banned_by  UUID NOT NULL REFERENCES users (id),
  banned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  lifted_at  TIMESTAMPTZ,
  lifted_by  UUID REFERENCES users (id)
);

CREATE INDEX idx_banned_users_active ON banned_users (user_id)
  WHERE lifted_at IS NULL;
CREATE INDEX idx_banned_users_expiry ON banned_users (expires_at)
  WHERE lifted_at IS NULL AND expires_at IS NOT NULL;
