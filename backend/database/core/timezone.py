from sqlalchemy import text

# Timezone padrão: São Paulo (UTC-3)
SAO_PAULO_TZ = "America/Sao_Paulo"

# Default SQL para created_at e updated_at com timezone São Paulo
CREATED_AT_DEFAULT = text("(NOW() AT TIME ZONE 'America/Sao_Paulo')")
UPDATED_AT_DEFAULT = text("(NOW() AT TIME ZONE 'America/Sao_Paulo')")
