-- Migration: Fix legacy columns on products table after platform refactor
-- Date: 2026-03-16
-- Description: After moving platform/external_id from products to checkouts,
--              the old columns in the DB still exist with NOT NULL constraints,
--              causing IntegrityError on INSERT. This migration relaxes them.

-- 1. Make external_id nullable (was NOT NULL in old schema, no longer in model)
ALTER TABLE products ALTER COLUMN external_id DROP NOT NULL;

-- 2. Drop legacy platform column from products (now lives in checkouts table)
ALTER TABLE products DROP COLUMN IF EXISTS platform;
