name: universal-app-architecture
description: "Global standard for high-performance application architecture, covering SaaS, White Label, and Open Source projects with Docker, modular backend, and slug-based frontend."
---

# Universal App Architecture Standard

This skill defines the definitive organizational structure for modern software projects. It ensures that whether the project is a multi-tenant SaaS, a White Label product, or an Open Source tool, it remains maintainable, scalable, and professional.

## Core Pillars (Dockerized)

Every project MUST be containerized. The root structure adapts based on the project type:

### 1. SaaS Architecture
Focuses on separation of concerns for security and scaling.
- admin/: Independent dashboard for platform owners (internal logic).
- backend/: API for end-users.
- frontend/: Web application for end-users.

### 2. White Label & Open Source Architecture
Focuses on ease of deployment and self-configuration.
- backend/: Main API.
- frontend/: Main UI.
- The Setup Flow: Projects MUST include a /setup or /install route (frontend) and corresponding logic (backend) to handle initial database creation and first admin user, similar to WordPress or n8n.

---

## Backend: Atomic Slug-Based Logic

The backend (Python/Node/Go) must follow a strict domain-driven structure, where the `api/` folder mirrors the frontend routes:

- **api/[slug]/**: Every major feature or page has its own directory.
- **Atomic Files**: Instead of one large file per slug, logic is split into small, focused files (e.g., `list.py`, `create.py`, `actions.py`, `helpers.py`).
- **200-Line Mandate**: Files MUST NOT exceed 200 lines. If a file grows, decompose it into sub-files or move shared logic to `integrations/` or `services/`.

Example structure for a "Campaigns" feature:
```text
api/
└── campaigns/
    ├── __init__.py      (Router registration)
    ├── list.py          (GET /campaigns)
    ├── budget.py        (PATCH /campaigns/budget)
    ├── tags.py          (POST /campaigns/tags)
    └── helpers.py       (Local utility functions)
```

- database/: Connections and models.
- database/migrations/: Chronological SQL files (YYYY-MM-DD.sql).
- services/: Business logic and core engines (e.g., LLM, AI tools).
- integrations/: Third-party API clients (e.g., Meta, Stripe, Vturb).

---

## Frontend: Slug-Based Modularity

The frontend (React/Vite/TypeScript) follows "Locality of Content", matching the backend structure:

- src/pages/: Organized by URL slug.
- Folder-per-Page: Every page is a directory, keeping its specific logic close.
  ```text
  pages/
  └── [slug]/
      ├── index.tsx        (Main Page Entry - Minimal code)
      ├── form.tsx         (Main UI Form/Logic)
      ├── components/      (Local-only components)
      ├── hooks/           (Local-only hooks)
      └── utils/           (Local-only helper functions)
  ```
- src/components/: Only for global, UI-kit level components (e.g., ShadCN).

---

## The "Clean Code" Mandates

1.  200-Line Limit: Strict rule. No file should exceed 200 lines. Break it down into sub-components or sub-files.
2.  Surgical Naming: File names must describe their specific action (e.g., `toggle.py` instead of `utils.py`).
3.  Visual Excellence: Maintain a cohesive design language. Use CSS variables for easy theming (crucial for White Label).
4.  Type Safety: Mandatory TypeScript or strong typing to prevent runtime errors.

---

## How to Apply This Skill

1.  Identify Project Type: SaaS (separate admin) or White Label/OS (integrated setup).
2.  Enforce Structure: Check folder placement before every new file.
3.  Automate Migrations: Ensure the first tool the user sees is the installer/migration runner.
4.  Componentize Early: If a component feels "heavy," it belongs in a sub-folder.
