-- 2026-03-24: Add stripe_enabled column to company_settings
ALTER TABLE company_settings
    ADD COLUMN IF NOT EXISTS stripe_enabled BOOLEAN NOT NULL DEFAULT false;

-- 2026-03-24: Add logo_url column to products
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL;

-- 2026-03-24-2: Add checkout_code column to checkouts (for PayT checkout identification)
ALTER TABLE checkouts
    ADD COLUMN IF NOT EXISTS checkout_code VARCHAR(255) DEFAULT NULL;

CREATE INDEX IF NOT EXISTS ix_checkouts_checkout_code ON checkouts (checkout_code);

-- 2026-03-24: Add name column to checkouts (friendly identifier)
ALTER TABLE checkouts
    ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT NULL;

-- 2026-03-24: Fix FK constraints to use ON DELETE CASCADE
ALTER TABLE checkouts DROP CONSTRAINT IF EXISTS checkouts_product_id_fkey;
ALTER TABLE checkouts ADD CONSTRAINT checkouts_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE order_bumps DROP CONSTRAINT IF EXISTS order_bumps_product_id_fkey;
ALTER TABLE order_bumps ADD CONSTRAINT order_bumps_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE upsells DROP CONSTRAINT IF EXISTS upsells_product_id_fkey;
ALTER TABLE upsells ADD CONSTRAINT upsells_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
