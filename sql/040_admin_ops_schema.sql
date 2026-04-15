-- used30_bo admin operations schema
-- Dependencies:
-- - Requires 010_user_member_schema.sql, 020_admin_rbac_and_auth_schema.sql,
--   and 030_commerce_core_schema.sql first.
-- - App-managed enum values are documented in 000_app_managed_enums.json.

CREATE TABLE announcements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category      TEXT NOT NULL DEFAULT 'notice',
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  thumbnail_url TEXT,
  is_pinned     BOOLEAN NOT NULL DEFAULT FALSE,
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  published_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  view_count    INT NOT NULL DEFAULT 0,
  author_id     UUID NOT NULL REFERENCES users (id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_list
  ON announcements (published_at DESC)
  WHERE is_published = TRUE;

CREATE INDEX idx_announcements_pinned
  ON announcements (is_pinned, published_at DESC, expires_at)
  WHERE is_published = TRUE;

CREATE TABLE announcement_reads (
  user_id          UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  announcement_id  UUID NOT NULL REFERENCES announcements (id) ON DELETE CASCADE,
  read_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, announcement_id)
);

CREATE TABLE faq_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE faqs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES faq_categories (id),
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  helpful_yes INT NOT NULL DEFAULT 0 CHECK (helpful_yes >= 0),
  helpful_no  INT NOT NULL DEFAULT 0 CHECK (helpful_no >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_faqs_category
  ON faqs (category_id, sort_order)
  WHERE is_active = TRUE;

CREATE TABLE support_tickets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users (id),
  category         TEXT NOT NULL,
  title            TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'open',
  related_order_id UUID REFERENCES orders (id),
  assigned_to      UUID REFERENCES users (id),
  resolved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_user
  ON support_tickets (user_id, created_at DESC);

CREATE INDEX idx_tickets_status
  ON support_tickets (status, created_at DESC);

CREATE INDEX idx_tickets_assigned
  ON support_tickets (assigned_to)
  WHERE status NOT IN ('resolved', 'closed');

CREATE INDEX idx_tickets_open
  ON support_tickets (created_at ASC)
  WHERE status = 'open';

CREATE TABLE support_ticket_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  UUID NOT NULL REFERENCES support_tickets (id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES users (id),
  is_admin   BOOLEAN NOT NULL DEFAULT FALSE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages
  ON support_ticket_messages (ticket_id, created_at ASC);

CREATE TABLE support_ticket_attachments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID NOT NULL REFERENCES support_ticket_messages (id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  url         TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  file_size   INT NOT NULL CHECK (file_size > 0),
  mime_type   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inspector_assignments (
  inspector_id UUID NOT NULL REFERENCES users (id),
  center_id    UUID NOT NULL REFERENCES inspection_centers (id),
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (inspector_id, center_id)
);

CREATE TABLE app_configs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key          TEXT NOT NULL,
  value        TEXT NOT NULL,
  description  TEXT,
  effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by   UUID REFERENCES users (id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (key, effective_at)
);

CREATE VIEW v_current_app_configs AS
SELECT DISTINCT ON (key)
  key,
  value,
  description,
  effective_at
FROM app_configs
WHERE effective_at <= NOW()
ORDER BY key, effective_at DESC;

CREATE TABLE admin_action_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES users (id),
  action      TEXT NOT NULL,
  target_type TEXT CHECK (target_type IN (
    'user',
    'admin_user',
    'role_assignment',
    'order',
    'inspection',
    'settlement',
    'announcement',
    'banner',
    'event',
    'faq',
    'ticket',
    'config',
    'coupon',
    'penalty'
  )),
  target_id   UUID,
  before_data JSONB,
  after_data  JSONB,
  note        TEXT,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin
  ON admin_action_logs (admin_id, created_at DESC);

CREATE INDEX idx_admin_logs_target
  ON admin_action_logs (target_type, target_id);

CREATE INDEX idx_admin_logs_action
  ON admin_action_logs (action, created_at DESC);

CREATE TABLE seller_product_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  url         TEXT NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seller_photos
  ON seller_product_photos (product_id, sort_order);

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  payload     JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user
  ON notifications (user_id, created_at DESC);

CREATE TABLE push_notification_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications (id),
  user_id         UUID NOT NULL REFERENCES users (id),
  push_token_id   UUID REFERENCES user_push_tokens (id),
  platform        TEXT,
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'sent',
  provider_msg_id TEXT,
  error_message   TEXT,
  retry_count     SMALLINT NOT NULL DEFAULT 0,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_push_logs_user
  ON push_notification_logs (user_id, sent_at DESC);

CREATE INDEX idx_push_logs_failed
  ON push_notification_logs (retry_count, sent_at DESC)
  WHERE status = 'failed';

CREATE TABLE user_penalties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active',
  score_delta   NUMERIC(6,2) NOT NULL DEFAULT 0,
  reason_code   TEXT NOT NULL,
  note          TEXT,
  issued_by     UUID NOT NULL REFERENCES users (id),
  starts_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at       TIMESTAMPTZ,
  revoked_at    TIMESTAMPTZ,
  revoked_by    UUID REFERENCES users (id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_penalties_active
  ON user_penalties (user_id, type, created_at DESC)
  WHERE status = 'active';

CREATE TABLE user_edit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  edited_by    UUID NOT NULL REFERENCES users (id),
  change_set   JSONB NOT NULL,
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_edit_logs_user
  ON user_edit_logs (user_id, created_at DESC);

CREATE TABLE banners (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  placement     TEXT NOT NULL,
  image_url     TEXT NOT NULL,
  link_url      TEXT,
  bg_color      TEXT,
  sort_order    SMALLINT NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'draft',
  starts_at     TIMESTAMPTZ,
  ends_at       TIMESTAMPTZ,
  created_by    UUID NOT NULL REFERENCES users (id),
  updated_by    UUID REFERENCES users (id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_banners_live
  ON banners (placement, sort_order, starts_at DESC)
  WHERE status IN ('scheduled', 'live');

CREATE TABLE event_campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  type          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft',
  summary       TEXT,
  content       TEXT NOT NULL,
  banner_id     UUID REFERENCES banners (id),
  starts_at     TIMESTAMPTZ,
  ends_at       TIMESTAMPTZ,
  created_by    UUID NOT NULL REFERENCES users (id),
  updated_by    UUID REFERENCES users (id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_campaigns_live
  ON event_campaigns (status, starts_at DESC);

CREATE TABLE event_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES event_campaigns (id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  entry_status  TEXT NOT NULL DEFAULT 'entered',
  payload       JSONB NOT NULL DEFAULT '{}'::jsonb,
  entered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_entries_event
  ON event_entries (event_id, entered_at DESC);

CREATE TABLE coupons (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                 TEXT NOT NULL UNIQUE,
  name                 TEXT NOT NULL,
  discount_type        TEXT NOT NULL,
  discount_value       NUMERIC(12,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount     INT NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
  max_discount_amount  INT CHECK (max_discount_amount IS NULL OR max_discount_amount > 0),
  starts_at            TIMESTAMPTZ,
  ends_at              TIMESTAMPTZ,
  total_limit          INT CHECK (total_limit IS NULL OR total_limit > 0),
  per_user_limit       INT NOT NULL DEFAULT 1 CHECK (per_user_limit > 0),
  status               TEXT NOT NULL DEFAULT 'draft',
  created_by           UUID NOT NULL REFERENCES users (id),
  updated_by           UUID REFERENCES users (id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_active
  ON coupons (status, starts_at DESC);

CREATE TABLE coupon_issuances (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id     UUID NOT NULL REFERENCES coupons (id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  issued_by     UUID REFERENCES users (id),
  issued_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'issued',
  used_at       TIMESTAMPTZ,
  order_id      UUID REFERENCES orders (id)
);

CREATE INDEX idx_coupon_issuances_user
  ON coupon_issuances (user_id, status, issued_at DESC);

CREATE INDEX idx_coupon_issuances_coupon
  ON coupon_issuances (coupon_id, status, issued_at DESC);

CREATE TABLE coupon_redemptions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issuance_id      UUID NOT NULL UNIQUE REFERENCES coupon_issuances (id) ON DELETE CASCADE,
  order_id         UUID NOT NULL REFERENCES orders (id),
  discount_amount  INT NOT NULL CHECK (discount_amount > 0),
  redeemed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at     TIMESTAMPTZ
);

CREATE TABLE admin_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type   TEXT NOT NULL CHECK (target_type IN (
    'user',
    'order',
    'inspection',
    'settlement',
    'ticket',
    'coupon',
    'event'
  )),
  target_id     UUID NOT NULL,
  author_id     UUID NOT NULL REFERENCES users (id),
  body          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_notes_target
  ON admin_notes (target_type, target_id, created_at DESC);

CREATE VIEW v_active_banners AS
SELECT *
FROM banners
WHERE status IN ('scheduled', 'live')
  AND (starts_at IS NULL OR starts_at <= NOW())
  AND (ends_at IS NULL OR ends_at > NOW());

CREATE VIEW v_active_coupons AS
SELECT *
FROM coupons
WHERE status = 'active'
  AND (starts_at IS NULL OR starts_at <= NOW())
  AND (ends_at IS NULL OR ends_at > NOW());
