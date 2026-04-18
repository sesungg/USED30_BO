-- Enums
CREATE TYPE media_grade AS ENUM ('M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'inspector');
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'inspector', 'settlement_manager', 'cs_agent', 'product_reviewer', 'store_manager', 'readonly_analyst');
CREATE TYPE genre AS ENUM ('JAZZ', 'R&B', 'DISCO', 'SOUL', 'ROCK', 'CLASSICAL', 'HIP-HOP', 'FUNK', 'BLUES', 'POP');
CREATE TYPE lp_format AS ENUM ('1LP', '2LP', '3LP', 'EP', '7"', '10"', '12"');
CREATE TYPE product_status AS ENUM ('draft', 'inspection_pending', 'on_sale', 'sold', 'returning', 'disposed', 'cancelled');
CREATE TYPE inspection_result AS ENUM ('pending', 'approved', 'grade_mismatch', 'rejected');
CREATE TYPE seller_response AS ENUM ('accepted', 'return_requested');
CREATE TYPE rejection_action AS ENUM ('return_requested', 'disposal_requested');
CREATE TYPE order_status AS ENUM ('payment_complete', 'inspection_pending', 'inspection_pass', 'inspection_grade_mismatch', 'inspection_rejected', 'shipping', 'delivered', 'confirmed', 'auto_confirmed', 'return_requested', 'refunded', 'cancelled');
CREATE TYPE payment_method AS ENUM ('card', 'transfer');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'partial_refund', 'failed');
CREATE TYPE shipment_direction AS ENUM ('seller_to_inspection', 'inspection_to_buyer', 'return_to_seller', 'buyer_return');
CREATE TYPE settlement_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE settlement_trigger AS ENUM ('manual_confirm', 'auto_3day');
CREATE TYPE notification_type AS ENUM ('inspection_result', 'inspection_grade_mismatch', 'inspection_rejected', 'shipping', 'delivered', 'settlement', 'return_update');
CREATE TYPE return_reason AS ENUM ('delivery_damage', 'wrong_item', 'grade_mismatch');
CREATE TYPE return_status AS ENUM ('requested', 'processing', 'completed', 'rejected');

-- Users
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  nickname        TEXT NOT NULL UNIQUE,
  phone           TEXT,
  phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  role            user_role NOT NULL DEFAULT 'user',
  admin_role      admin_role,
  profile_bg      TEXT NOT NULL DEFAULT '#0050BE',
  manner_score    NUMERIC(4,2) NOT NULL DEFAULT 36.5 CHECK (manner_score BETWEEN 0 AND 100),
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

-- User bank accounts
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

-- Refresh tokens
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
CREATE INDEX idx_refresh_tokens_expiry ON refresh_tokens (expires_at) WHERE revoked_at IS NULL;

-- Products
CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id         UUID NOT NULL REFERENCES users (id),
  artist_name       TEXT NOT NULL,
  album_name        TEXT NOT NULL,
  label             TEXT NOT NULL,
  country           TEXT NOT NULL,
  release_year      SMALLINT NOT NULL CHECK (release_year BETWEEN 1900 AND 2100),
  pressing          TEXT,
  catalog_number    TEXT,
  format            lp_format NOT NULL,
  rpm               SMALLINT NOT NULL CHECK (rpm IN (33, 45, 78)),
  media_grade       media_grade NOT NULL,
  sleeve_grade      media_grade NOT NULL,
  has_insert        BOOLEAN NOT NULL DEFAULT FALSE,
  has_obi_strip     BOOLEAN NOT NULL DEFAULT FALSE,
  description       TEXT,
  asking_price      INT NOT NULL CHECK (asking_price > 0),
  final_price       INT CHECK (final_price IS NULL OR final_price > 0),
  status            product_status NOT NULL DEFAULT 'draft',
  is_guaranteed     BOOLEAN NOT NULL DEFAULT FALSE,
  sample_youtube_id TEXT,
  cover_bg          TEXT NOT NULL DEFAULT '#0050BE',
  cover_accent      TEXT NOT NULL DEFAULT '#003E99',
  listed_at         TIMESTAMPTZ,
  sold_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_products_seller ON products (seller_id);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_artist ON products (artist_name text_pattern_ops);
CREATE INDEX idx_products_album  ON products (album_name text_pattern_ops);
CREATE INDEX idx_products_listed ON products (listed_at DESC) WHERE status = 'on_sale';

-- Product genres
CREATE TABLE product_genres (
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  genre      genre NOT NULL,
  PRIMARY KEY (product_id, genre)
);
CREATE INDEX idx_product_genres_genre ON product_genres (genre);

-- Wishlists
CREATE TABLE wishlists (
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);
CREATE INDEX idx_wishlists_product ON wishlists (product_id);

-- Inspections
CREATE TABLE inspections (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id            UUID NOT NULL UNIQUE REFERENCES products (id),
  inspector_id          UUID REFERENCES users (id),
  result                inspection_result NOT NULL DEFAULT 'pending',
  seller_media_grade    media_grade NOT NULL,
  seller_sleeve_grade   media_grade NOT NULL,
  inspector_media_grade   media_grade,
  inspector_sleeve_grade  media_grade,
  rejection_reason      TEXT,
  notes                 TEXT,
  original_price        INT NOT NULL CHECK (original_price > 0),
  adjusted_price        INT CHECK (adjusted_price IS NULL OR adjusted_price > 0),
  seller_response       seller_response,
  seller_responded_at   TIMESTAMPTZ,
  response_deadline     TIMESTAMPTZ,
  rejection_action      rejection_action,
  rejection_actioned_at TIMESTAMPTZ,
  received_at           TIMESTAMPTZ,
  inspected_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_grade_mismatch_fields CHECK (
    result != 'grade_mismatch'
    OR (adjusted_price IS NOT NULL AND response_deadline IS NOT NULL)
  ),
  CONSTRAINT chk_rejection_reason CHECK (
    result != 'rejected' OR rejection_reason IS NOT NULL
  )
);
CREATE INDEX idx_inspections_product   ON inspections (product_id);
CREATE INDEX idx_inspections_inspector ON inspections (inspector_id);
CREATE INDEX idx_inspections_result    ON inspections (result);
CREATE INDEX idx_inspections_pending   ON inspections (created_at) WHERE result = 'pending';

-- Inspection photos
CREATE TABLE inspection_photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections (id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('record_side', 'label', 'sleeve_front', 'sleeve_back')),
  storage_key   TEXT NOT NULL,
  url           TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (inspection_id, type)
);
CREATE INDEX idx_inspection_photos ON inspection_photos (inspection_id);

-- Orders
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id        UUID NOT NULL REFERENCES users (id),
  product_id      UUID NOT NULL REFERENCES products (id),
  inspection_id   UUID REFERENCES inspections (id),
  status          order_status NOT NULL DEFAULT 'payment_complete',
  shipping_name      TEXT NOT NULL,
  shipping_phone     TEXT NOT NULL,
  shipping_address   TEXT NOT NULL,
  shipping_address2  TEXT,
  shipping_zipcode   TEXT NOT NULL,
  delivered_at    TIMESTAMPTZ,
  confirmed_at    TIMESTAMPTZ,
  auto_confirm_at TIMESTAMPTZ GENERATED ALWAYS AS (delivered_at + INTERVAL '3 days') STORED,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX uq_orders_product_active ON orders (product_id) WHERE status NOT IN ('cancelled', 'refunded');
CREATE INDEX idx_orders_buyer        ON orders (buyer_id);
CREATE INDEX idx_orders_status       ON orders (status);
CREATE INDEX idx_orders_product      ON orders (product_id);
CREATE INDEX idx_orders_auto_confirm ON orders (auto_confirm_at) WHERE status = 'delivered';

-- Order status history
CREATE TABLE order_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  from_status order_status,
  to_status   order_status NOT NULL,
  actor_id    UUID REFERENCES users (id),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_order_status_history ON order_status_history (order_id, created_at DESC);

-- Payments
CREATE TABLE payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL UNIQUE REFERENCES orders (id),
  method           payment_method NOT NULL,
  amount           INT NOT NULL CHECK (amount > 0),
  pg_provider      TEXT NOT NULL DEFAULT 'tosspayments',
  pg_order_id      TEXT NOT NULL UNIQUE,
  pg_payment_key   TEXT UNIQUE,
  pg_raw_response  JSONB,
  status           payment_status NOT NULL DEFAULT 'pending',
  paid_at          TIMESTAMPTZ,
  refund_amount    INT CHECK (refund_amount IS NULL OR refund_amount > 0),
  refunded_at      TIMESTAMPTZ,
  failed_reason    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_refund_not_exceed CHECK (refund_amount IS NULL OR refund_amount <= amount)
);
CREATE INDEX idx_payments_order  ON payments (order_id);
CREATE INDEX idx_payments_status ON payments (status) WHERE status = 'pending';

-- Shipments
CREATE TABLE shipments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES orders (id),
  direction      shipment_direction NOT NULL,
  carrier        TEXT NOT NULL,
  tracking_no    TEXT NOT NULL,
  current_status TEXT NOT NULL DEFAULT '발송 준비 중',
  estimated_at   TIMESTAMPTZ,
  shipped_at     TIMESTAMPTZ,
  delivered_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, direction)
);
CREATE INDEX idx_shipments_order    ON shipments (order_id);
CREATE INDEX idx_shipments_tracking ON shipments (carrier, tracking_no);

-- Settlements
CREATE TABLE settlements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL UNIQUE REFERENCES orders (id),
  seller_id        UUID NOT NULL REFERENCES users (id),
  bank_account_id  UUID NOT NULL REFERENCES user_bank_accounts (id),
  sale_price       INT NOT NULL CHECK (sale_price > 0),
  fee_rate         NUMERIC(5,4) NOT NULL DEFAULT 0.1000 CHECK (fee_rate BETWEEN 0 AND 1),
  fee_amount       INT NOT NULL CHECK (fee_amount >= 0),
  net_amount       INT NOT NULL CHECK (net_amount > 0),
  status           settlement_status NOT NULL DEFAULT 'pending',
  trigger          settlement_trigger NOT NULL,
  settled_at       TIMESTAMPTZ,
  pg_transfer_id   TEXT,
  failed_reason    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_settlement_math CHECK (net_amount = sale_price - fee_amount)
);
CREATE INDEX idx_settlements_seller ON settlements (seller_id);
CREATE INDEX idx_settlements_status ON settlements (status) WHERE status IN ('pending', 'processing');

-- Notifications
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type          notification_type NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  related_id    UUID,
  related_type  TEXT CHECK (related_type IN ('order', 'inspection', 'settlement', 'return_request')),
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_unread ON notifications (user_id, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_all    ON notifications (user_id, created_at DESC);

-- Return requests
CREATE TABLE return_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders (id),
  buyer_id    UUID NOT NULL REFERENCES users (id),
  reason      return_reason NOT NULL,
  description TEXT,
  status      return_status NOT NULL DEFAULT 'requested',
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_return_requests_order ON return_requests (order_id);
CREATE INDEX idx_return_requests_buyer ON return_requests (buyer_id);

-- Seller product photos
CREATE TABLE seller_product_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  url         TEXT NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_seller_photos ON seller_product_photos (product_id, sort_order);

-- Triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'users','products','inspections','orders',
    'payments','shipments','settlements','return_requests'
  ]) LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t
    );
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION record_order_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, from_status, to_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_orders_status_history
AFTER UPDATE ON orders FOR EACH ROW
EXECUTE FUNCTION record_order_status_change();

CREATE OR REPLACE FUNCTION sync_user_counts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IN ('confirmed', 'auto_confirmed')
     AND OLD.status NOT IN ('confirmed', 'auto_confirmed') THEN
    UPDATE users SET purchase_count = purchase_count + 1 WHERE id = NEW.buyer_id;
    UPDATE users SET sales_count = sales_count + 1
      WHERE id = (SELECT seller_id FROM products WHERE id = NEW.product_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_orders_user_counts
AFTER UPDATE ON orders FOR EACH ROW
EXECUTE FUNCTION sync_user_counts();