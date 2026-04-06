-- 2026-04-06: Add label and is_custom to recovery_channel_configs
ALTER TABLE recovery_channel_configs
    ADD COLUMN IF NOT EXISTS label      VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS is_custom  BOOLEAN NOT NULL DEFAULT FALSE;

-- 2026-04-06: Create product_aliases table
-- Permite cadastrar nomes alternativos para um produto,
-- usados para filtrar transações recebidas via webhook
-- que chegam com nomes diferentes do nome canônico cadastrado.
CREATE TABLE IF NOT EXISTS product_aliases (
    id         SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    alias      VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (product_id, alias)
);

CREATE INDEX IF NOT EXISTS ix_product_aliases_product_id ON product_aliases(product_id);
CREATE INDEX IF NOT EXISTS ix_product_aliases_alias ON product_aliases(alias);
