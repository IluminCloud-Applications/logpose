# Design System — Layout & Estrutura (Guia de Replicação)

Este documento descreve os **padrões estruturais de layout** usados no app LOG POSE, independente de cores/tema.  
O objetivo é servir como **blueprint replicável** para qualquer outro app com sidebar + dashboard.

---

## 1. Arquitetura Geral do Layout

O layout funciona em **3 camadas visuais** separadas por espaçamento e bordas:

```
┌─────────────────────────────────────────────────────────────┐
│  body (bg-background, full viewport)                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  container (flex, h-full, p-2.5, gap-2.5)              │ │
│  │  ┌──────────┐  ┌──────────────────────────────────────┐ │ │
│  │  │          │  │                                      │ │ │
│  │  │ SIDEBAR  │  │  MAIN CONTENT                        │ │ │
│  │  │ floating │  │  (rounded-xl, border, bg-background) │ │ │
│  │  │          │  │                                      │ │ │
│  │  │          │  │                                      │ │ │
│  │  └──────────┘  └──────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Por que funciona?
- O `padding` externo (`p-2.5`) no container cria o **efeito flutuante** — sidebar e main não tocam as bordas do viewport.
- O `gap-2.5` separa sidebar e main visualmente.
- O `body` tem uma cor de fundo (background), e os dois painéis ficam "sobre" ele, criando profundidade.

---

## 2. DashboardLayout — O Container Pai

```tsx
<SidebarProvider
  style={{ "--sidebar-width": "14.5rem" } as React.CSSProperties}
  className="h-screen"
>
  <div className="flex flex-1 h-full p-2.5 gap-2.5">
    <AppSidebar />
    <SidebarInset className="overflow-auto flex-1">
      <div className="mx-auto w-full max-w-[1600px] min-h-full rounded-xl border border-border/40 bg-background shadow-sm">
        <Outlet />
      </div>
    </SidebarInset>
  </div>
</SidebarProvider>
```

### Regras Estruturais

| Propriedade | Valor | Propósito |
|---|---|---|
| `--sidebar-width` | `14.5rem` (~232px) | Sidebar estreita e compacta |
| `h-screen` | viewport height | Ocupa a tela toda |
| `p-2.5` | 10px padding | Cria o gap externo (efeito flutuante) |
| `gap-2.5` | 10px gap | Espaço entre sidebar e main |
| `rounded-xl` | border-radius grande | Bordas arredondadas em ambos |
| `border border-border/40` | borda sutil no main | Separação visual suave |
| `max-w-[1600px]` | largura máxima | Conteúdo não estica infinitamente |
| `shadow-sm` | sombra suave | Profundidade sutil |
| `min-h-full` | mínimo 100% altura | Garante que o main ocupe toda a altura |

---

## 3. Sidebar Flutuante — Anatomia

```tsx
<Sidebar
  variant="floating"       // ← CHAVE: usa o variant "floating" do ShadCN
  collapsible="none"       // Não colapsa (fixa)
  className="rounded-xl overflow-hidden h-full"
>
  <SidebarHeader />   {/* Logo */}
  <SidebarContent />  {/* Navegação */}
  <SidebarFooter />   {/* User */}
</Sidebar>
```

### Detalhe: O `variant="floating"` do ShadCN
O variant `floating` do componente `Sidebar` do ShadCN já aplica internamente:
- Background escuro (`--sidebar`)
- Border radius arredondado  
- Padding interno
- Aparência de card flutuante

### Sidebar Header — Logo Centralizada

```tsx
<SidebarHeader className="px-3 pt-3 pb-1">
  <img
    src="/logo_dark.webp"
    alt="Logo"
    className="h-12 w-auto object-contain"
  />
</SidebarHeader>
```

**Padrão:**
- `h-12` → Logo com **48px de altura**, pequena e compacta
- `object-contain` → Mantém proporção sem distorcer
- `px-3 pt-3 pb-1` → Padding mínimo, apenas respiro visual
- A imagem fica naturalmente centralizada pelo contain

### Sidebar Content — Grupos de Navegação

```tsx
<SidebarContent className="px-2 gap-0">
  {navGroups.map((group) => (
    <SidebarNavGroup ... />
  ))}
</SidebarContent>
```

**Padrão:**
- `px-2` → Padding lateral mínimo
- `gap-0` → Sem gap entre grupos (o espaço é dado por cada grupo)

### Grupo de Navegação — Compacto

```tsx
<SidebarGroup className="py-0.5">
  <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 px-3 mb-0">
    {label}
  </SidebarGroupLabel>
  <SidebarMenu className="gap-px">
    {items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          isActive={currentPath === item.url}
          className="cursor-pointer h-8 px-3 gap-2.5 text-[13px]"
        >
          <item.icon className="size-4" />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))}
  </SidebarMenu>
</SidebarGroup>
```

**Padrão de Compactação:**

| Elemento | Classe | Descrição |
|---|---|---|
| Grupo | `py-0.5` | Padding vertical mínimo (2px) |
| Label do grupo | `text-[10px] uppercase tracking-widest` | Título micro, uppercase, espaçado |
| Label do grupo | `text-sidebar-foreground/50` | 50% de opacidade (sutil) |
| Menu gap | `gap-px` | Gap de 1px entre itens (ultra compacto) |
| Botão | `h-8` | Altura de 32px (compacto, não 40px default) |
| Botão | `text-[13px]` | Fonte ligeiramente menor que o padrão |
| Ícone | `size-4` | 16px — proporcional ao h-8 |
| Botão gap | `gap-2.5` | Espaço entre ícone e texto |

### Sidebar Footer — User Dropdown

```tsx
<SidebarFooter className="p-2">
  <SidebarUser />
</SidebarFooter>
```

**Padrão do Usuário:**
- Avatar com `h-8 w-8 rounded-lg`
- Nome do user com `text-[13px]`
- Texto secundário com `text-[11px] text-sidebar-foreground/60`
- Ícone de expand `RiExpandUpDownLine` no final
- Dropdown com perfil, tema, logout

---

## 4. Main Content — O Painel Principal

```tsx
<div className="mx-auto w-full max-w-[1600px] min-h-full rounded-xl border border-border/40 bg-background shadow-sm">
  <Outlet />
</div>
```

### Regras de Estrutura

| Propriedade | Propósito |
|---|---|
| `mx-auto` | Centraliza horizontalmente |
| `max-w-[1600px]` | Limite de largura para telas ultra-wide |
| `min-h-full` | Sempre ocupa pelo menos toda a altura |
| `rounded-xl` | Bordas arredondadas matching com a sidebar |
| `border border-border/40` | Borda sutil (40% opacidade) — cria a separação |
| `bg-background` | Mesma cor do fundo ou ligeiramente diferente |
| `shadow-sm` | Sombra suave para profundidade |

### Conteúdo dentro do Main

Cada página usa:

```tsx
<div className="flex flex-col gap-6 p-6">
  <PageHeader />
  <FilterBar />
  <Content />
</div>
```

**Padrão de Página:**
- `p-6` → Padding interno de 24px (respiro generoso)
- `gap-6` → Espaço de 24px entre seções
- `flex flex-col` → Stack vertical

---

## 5. Filter Bar — Sticky com Intersection Observer

```tsx
// Sentinel invisível para detectar scroll
<div ref={sentinelRef} className="h-0 w-full" />

// Barra de filtros que fica sticky
<div className={`flex flex-wrap items-center gap-2.5 p-3 rounded-xl border transition-all duration-300
  ${isSticky
    ? "sticky top-0 z-30 bg-card/95 backdrop-blur-md shadow-lg border-border/60"
    : "bg-card/50 border-border/30"
  }`}
>
```

**Padrão:**
- IntersectionObserver detecta quando o sentinel sai do viewport
- Quando sticky: `backdrop-blur-md`, `shadow-lg`, `bg-card/95` (translúcido com blur)
- Quando normal: `bg-card/50`, `border-border/30` (mais discreto)
- `transition-all duration-300` para suavidade na transição

---

## 6. Resumo Visual — Classes Essenciais para Replicar

### Container (DashboardLayout)
```
h-screen → flex → p-2.5 → gap-2.5
```

### Sidebar
```
variant="floating" → collapsible="none" → rounded-xl → h-full → overflow-hidden
  Header: px-3 pt-3 pb-1 → img h-12
  Content: px-2 gap-0
  Footer: p-2
```

### Itens da Sidebar
```
Group: py-0.5
Label: text-[10px] uppercase tracking-widest opacity-50
Menu: gap-px
Button: h-8 px-3 gap-2.5 text-[13px]
Icon: size-4
```

### Main Content Panel
```
mx-auto → max-w-[1600px] → min-h-full → rounded-xl → border border-border/40 → shadow-sm
```

### Conteúdo da Página
```
flex flex-col → gap-6 → p-6
```

---

## 7. Checklist de Replicação

Para replicar este design em outro app:

- [ ] **SidebarProvider** com `--sidebar-width: 14.5rem`
- [ ] **Container pai** com `flex h-full p-2.5 gap-2.5` (cria o efeito flutuante)
- [ ] **Sidebar** com `variant="floating"` e `collapsible="none"`
- [ ] **Logo/imagem** no topo com `h-12 object-contain`
- [ ] **Labels de grupo** com `text-[10px] uppercase tracking-widest`
- [ ] **Menu items** com `h-8 text-[13px]` e `gap-px` entre eles
- [ ] **Main content** com `rounded-xl border border-border/40 shadow-sm`
- [ ] **Max-width** no main com `max-w-[1600px]`
- [ ] **Padding** interno das páginas com `p-6 gap-6`
- [ ] **Scrollbar** customizada com `scrollbar-width: thin`
- [ ] **Font** Inter com features `cv11, ss01, cv01`

---

## 8. Dependências Necessárias

1. **ShadCN Sidebar** — O componente `Sidebar` do ShadCN com variant `floating`
2. **Remix Icon** — `@remixicon/react` para ícones consistentes
3. **Inter Variable Font** — `@fontsource-variable/inter`
4. **React Router** — `SidebarInset` + `Outlet` para routing aninhado
