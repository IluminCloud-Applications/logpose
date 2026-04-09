-- 2026-04-09: Adicionar coluna webhook_slug para identificar de qual conta veio a transação
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS webhook_slug VARCHAR(50);
CREATE INDEX IF NOT EXISTS ix_transactions_webhook_slug ON transactions(webhook_slug);

ALTER TABLE recoveries ADD COLUMN IF NOT EXISTS webhook_slug VARCHAR(50);
