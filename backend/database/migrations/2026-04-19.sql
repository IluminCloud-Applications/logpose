-- Aumentar campos UTM e src de VARCHAR(255) para TEXT
-- para suportar tokens longos de plataformas de anúncios (Facebook, TikTok, etc.)
ALTER TABLE transactions ALTER COLUMN utm_source TYPE TEXT;
ALTER TABLE transactions ALTER COLUMN utm_medium TYPE TEXT;
ALTER TABLE transactions ALTER COLUMN utm_campaign TYPE TEXT;
ALTER TABLE transactions ALTER COLUMN utm_content TYPE TEXT;
ALTER TABLE transactions ALTER COLUMN utm_term TYPE TEXT;
ALTER TABLE transactions ALTER COLUMN src TYPE TEXT;
