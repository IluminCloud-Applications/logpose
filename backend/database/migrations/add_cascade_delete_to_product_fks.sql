-- Migration: Add ON DELETE CASCADE to all Foreign Keys referencing products
-- Date: 2026-03-16
-- Description: When a product is deleted, all related rows in checkouts,
--              order_bumps, upsells, customer_products must be deleted automatically.
--              Transactions keep the FK but set product_id to NULL (SET NULL)
--              to preserve the sales history even after a product is removed.

-- ── 1. checkouts ─────────────────────────────────────────────
ALTER TABLE checkouts
    DROP CONSTRAINT IF EXISTS checkouts_product_id_fkey;

ALTER TABLE checkouts
    ADD CONSTRAINT checkouts_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE;

-- ── 2. order_bumps ───────────────────────────────────────────
ALTER TABLE order_bumps
    DROP CONSTRAINT IF EXISTS order_bumps_product_id_fkey;

ALTER TABLE order_bumps
    ADD CONSTRAINT order_bumps_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE;

-- ── 3. upsells ───────────────────────────────────────────────
ALTER TABLE upsells
    DROP CONSTRAINT IF EXISTS upsells_product_id_fkey;

ALTER TABLE upsells
    ADD CONSTRAINT upsells_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE;

-- ── 4. customer_products ─────────────────────────────────────
ALTER TABLE customer_products
    DROP CONSTRAINT IF EXISTS customer_products_product_id_fkey;

ALTER TABLE customer_products
    ADD CONSTRAINT customer_products_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE;

-- ── 5. transactions (SET NULL to preserve sales history) ──────
ALTER TABLE transactions
    DROP CONSTRAINT IF EXISTS transactions_product_id_fkey;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE SET NULL;
