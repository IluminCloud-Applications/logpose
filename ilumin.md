# Log Pose - Ilumin Deployment

## Projeto
- **Repositório:** https://github.com/IluminCloud-Applications/logpose
- **Image:** ghcr.io/ilumincloud-applications/logpose
- **Porta interna:** 8000
- **Arquitetura:** Monorepo unificado (React + FastAPI em 1 container)

## CI/CD
- **GitHub Actions:** `.github/workflows/docker-build.yml`
- **Registry:** GHCR (ghcr.io)
- **Trigger:** Push para `main` ou tags `v*`
- **Tags geradas:** `latest`, semver, SHA

## Servidor
- **Servidor:** (ainda não instalado)
- **Domínio:** (ainda não configurado)

## Histórico de Instalações
| Data | Versão/Tag | Servidor | Status |
|------|-----------|----------|--------|
| - | - | - | Aguardando primeiro deploy |

## Domínios Customizados
| Domínio | App | Data |
|---------|-----|------|
| - | - | - |

## Notas
- Compose de produção: `docker-compose-prod.yml`
- Database: PostgreSQL 14 (rede interna)
- Frontend servido pelo FastAPI via SPAMiddleware em `/`
- APIs sob prefixo `/api`
