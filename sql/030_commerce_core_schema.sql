-- used30_bo commerce core schema (Products, Orders, Inspections, Settlements)
-- Dependencies: 010_user_member_schema.sql
-- App-managed enum values are documented in 000_app_managed_enums.json.

-- 2. 상품 도메인
-- 2-1. LP 카탈로그 (마스터 데이터)
CREATE TABLE lp_catalogs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  artist        TEXT NOT NULL,
  release_year  SMALLINT,
  label         TEXT,
  country       TEXT,
  format        TEXT, -- ex) 12", 7", 2xLP
  barcode       TEXT,
  cover_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lp_catalogs_search ON lp_catalogs (title, artist);

-- 2-2. 실제 판매 상품 (리스팅)
CREATE TABLE products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id        UUID NOT NULL REFERENCES users (id),
  catalog_id       UUID NOT NULL REFERENCES lp_catalogs (id),
  price            INT NOT NULL CHECK (price > 0),
  media_condition  TEXT NOT NULL,
  sleeve_condition TEXT NOT NULL,
  has_obi          BOOLEAN NOT NULL DEFAULT FALSE,
  has_insert       BOOLEAN NOT NULL DEFAULT FALSE,
  description      TEXT,
  status           TEXT NOT NULL DEFAULT 'on_sale',
  view_count       INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_catalog ON products (catalog_id, status);
CREATE INDEX idx_products_seller ON products (seller_id, created_at DESC);

-- 3. 거래 및 주문 도메인
CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number        TEXT NOT NULL UNIQUE, -- 사용자 노출용 주문번호
  buyer_id            UUID NOT NULL REFERENCES users (id),
  seller_id           UUID NOT NULL REFERENCES users (id),
  product_id          UUID NOT NULL REFERENCES products (id),
  product_price       INT NOT NULL,
  platform_fee        INT NOT NULL DEFAULT 0,  -- 구매자 수수료
  shipping_fee        INT NOT NULL DEFAULT 0,
  total_amount        INT NOT NULL,            -- 최종 결제 금액
  status              TEXT NOT NULL DEFAULT 'payment_pending',
  shipping_address_id UUID REFERENCES user_addresses (id),
  tracking_no_to_center TEXT,                  -- 판매자 -> 센터 송장
  tracking_no_to_buyer  TEXT,                  -- 센터 -> 구매자 송장
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer ON orders (buyer_id, created_at DESC);
CREATE INDEX idx_orders_seller ON orders (seller_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders (status, created_at DESC);

CREATE TABLE inspection_centers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  address    TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. 검수 도메인
CREATE TABLE inspections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL UNIQUE REFERENCES orders (id),
  center_id           UUID NOT NULL REFERENCES inspection_centers (id),
  inspector_id        UUID REFERENCES users (id), -- 검수 담당자 (admin)
  status              TEXT NOT NULL DEFAULT 'pending',
  actual_media_cond   TEXT,
  actual_sleeve_cond  TEXT,
  mismatch_reason     TEXT,                       -- 등급 불일치 또는 불합격 상세 사유
  buyer_decision      BOOLEAN,                    -- 불일치 시 구매자의 최종 수용 여부 (true: 수용, false: 거절)
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inspections_status ON inspections (status, created_at DESC);
CREATE INDEX idx_inspections_center ON inspections (center_id, status);

-- 5. 정산 도메인
CREATE TABLE settlements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL UNIQUE REFERENCES orders (id),
  seller_id           UUID NOT NULL REFERENCES users (id),
  bank_account_id     UUID NOT NULL REFERENCES user_bank_accounts (id),
  product_price       INT NOT NULL,
  seller_fee          INT NOT NULL DEFAULT 0,  -- 판매자 수수료
  inspection_fee      INT NOT NULL DEFAULT 0,  -- 검수 비용 (필요시 부과)
  settlement_amount   INT NOT NULL,            -- 최종 지급 금액 (product_price - seller_fee - inspection_fee)
  status              TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_at        TIMESTAMPTZ NOT NULL,    -- 정산 예정일
  processed_at        TIMESTAMPTZ,             -- 실제 지급 완료일
  fail_reason         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settlements_seller ON settlements (seller_id, status);
CREATE INDEX idx_settlements_scheduled ON settlements (scheduled_at) WHERE status = 'scheduled';
