-- Migration: Add role and invite_token to admins table
-- Date: 2026-03-15
-- Description: Adds user roles (owner/admin/viewer) and invite token support

-- 1. Create the role enum type
DO $$ BEGIN
    CREATE TYPE userrole AS ENUM ('owner', 'admin', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add role column with default 'admin' (existing users become 'admin')
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role userrole NOT NULL DEFAULT 'admin';

-- 3. Set the first admin (id=1) as 'owner'
UPDATE admins SET role = 'owner' WHERE id = (SELECT MIN(id) FROM admins);

-- 4. Add invite_token column (nullable, unique)
ALTER TABLE admins ADD COLUMN IF NOT EXISTS invite_token VARCHAR(255) UNIQUE;

-- 5. Make email nullable (invited users don't have email yet)
ALTER TABLE admins ALTER COLUMN email DROP NOT NULL;

-- 6. Make password_hash nullable (invited users don't have password yet)
ALTER TABLE admins ALTER COLUMN password_hash DROP NOT NULL;
