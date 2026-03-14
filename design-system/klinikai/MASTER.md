# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** KlinikAI
**Updated:** 2026-03-08
**Category:** Clinic Management SaaS — Data-Dense Dashboard

---

## Global Rules

### Color Palette

Actual colors are defined in `apps/web/src/index.css` (CSS variables). The source of truth is the CSS file.

| Role | Value | CSS Variable |
|------|-------|--------------|
| Primary | Cyan-600 `rgb(8, 145, 178)` | `--primary` |
| Primary Foreground | White | `--primary-foreground` |
| Secondary | Slate-100 | `--secondary` |
| Accent | Cyan-50 | `--accent` |
| Background | Slate-50 `rgb(248, 250, 251)` | `--background` |
| Foreground | Slate-900 `rgb(15, 23, 42)` | `--foreground` |
| Muted Foreground | Slate-500 | `--muted-foreground` |
| Destructive | Red-500 | `--destructive` |
| Success | Emerald-600 | `--success` |
| Warning | Amber-600 | `--warning` |
| Info | Sky-600 | `--info` |
| Border | Slate-200 | `--border` |

### Typography

- **Heading Font:** Figtree (`--font-heading`)
- **Body Font:** Noto Sans (`--font-sans`)
- **Mono Font:** JetBrains Mono (`--font-mono`)
- **Tracking:** `-0.01em` (slightly tighter)

### Radius

- `--radius`: `0.5rem` (8px)
- Components use `rounded-lg` (8px) by default

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

Defined in `index.css` as `--theme-shadow-*`. Use Tailwind `shadow-sm`, `shadow-md`, etc.

---

## Component Size Standard

> **Base philosophy:** Standard sizing (h-10 / 40px default). Comfortable for clinic staff during long usage sessions. All sizes below are the BASE — override via `className` only when justified.

### Buttons

| Size | Height | Padding | Text | Icon |
|------|--------|---------|------|------|
| `xs` | `h-7` (28px) | `px-2` | `text-xs` | `size-3` |
| `sm` | `h-8` (32px) | `px-3` | `text-sm` | `size-3.5` |
| **`default`** | **`h-10` (40px)** | **`px-4`** | **`text-sm`** | `size-4` |
| `lg` | `h-11` (44px) | `px-5` | `text-sm` | `size-4` |
| `icon` | `size-10` | — | — | `size-4` |
| `icon-sm` | `size-8` | — | — | `size-4` |
| `icon-lg` | `size-11` | — | — | `size-4` |

**Variants:** `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`

### Inputs

| Property | Value |
|----------|-------|
| Height | `h-10` (40px) |
| Text | `text-sm` (14px) |
| Padding | `px-3 py-2` |
| Border Radius | `rounded-lg` |

### Labels

| Property | Value |
|----------|-------|
| Text | `text-sm` (14px) |
| Weight | `font-medium` |

### Textarea

| Property | Value |
|----------|-------|
| Min Height | `min-h-16` |
| Text | `text-sm` (14px) |
| Padding | `px-3 py-2.5` |
| Border Radius | `rounded-lg` |

### Select

| Size | Height | Text |
|------|--------|------|
| **`default`** | **`h-10` (40px)** | `text-sm` |
| `sm` | `h-8` (32px) | `text-sm` |

### Table

| Part | Size | Notes |
|------|------|-------|
| Table text | `text-sm` | |
| **Header** | `h-11`, `text-xs`, `font-semibold`, `uppercase` | Taller, bolder headers |
| **Cell** | `px-3 py-2.5` | More breathing room |
| Row hover | `hover:bg-muted/50` | |

### Dialog / Modal

| Property | Value | Notes |
|----------|-------|-------|
| Default max-width | `sm:max-w-lg` (512px) | For confirmations, simple forms |
| Padding | `p-6` | |
| Title | `text-lg font-semibold` | |
| Description | `text-sm` | |
| Body text | `text-sm` | |
| **Large form override** | `sm:max-w-4xl` | For 2-column forms like Obat, via `className` |

### Switch

| Size | Dimensions | Thumb |
|------|-----------|-------|
| **`default`** | `22px x 40px` | `18px` |
| `sm` | `16px x 28px` | `14px` |

### Badge

| Property | Value |
|----------|-------|
| Height | `h-6` (24px) |
| Padding | `px-2.5` |
| Text | `text-xs` |

---

## Master Data Page Patterns

> Standard UX patterns for ALL master data pages. Consistency is mandatory.

### Page Layout

```
+-------------------------------------------------------------+
| Page Title                          [Action Buttons...]      |
+-------------------------------------------------------------+
| [Filter Dropdowns...] [Search Input] [Cari] [Export]         |
+-------------------------------------------------------------+
| Table Header (h-11, uppercase, font-semibold)                |
| ----------------------------------------------------------- |
| Row 1 (clickable -> opens edit modal)                        |
| Row 2                                                        |
| Row 3                                                        |
+-------------------------------------------------------------+
| Tampilkan [10 v]                                             |
+-------------------------------------------------------------+
```

### Interaction Patterns

| Action | Pattern | Notes |
|--------|---------|-------|
| **Add** | Dialog (center modal) | Default `max-w-lg`, override to `max-w-4xl` for complex forms |
| **Edit** | Click row -> Dialog (center modal) | No edit button in actions column |
| **Delete** | Confirmation dialog | Simple confirm/cancel |
| **Upload bulk** | Separate page (sub-route) | Breadcrumb navigation back |
| **Column settings** | Dialog with checkboxes | 2-column grid, "Simpan Pengaturan" button |
| **Export** | Button in filter bar | Direct download |
| **Search/Filter** | Dropdowns + text input + "Cari" button | In filter bar row |

### What NOT to use

| Pattern | Reason |
|---------|--------|
| **Drawer/Sheet** | Not used. Always use center Dialog. |
| **Edit button in table** | Click row = edit. No separate button needed. |
| **Inline editing** | Not used. Always open Dialog. |
| **Separate edit page** | Not used. Dialog is sufficient. |

### Filter Bar

- Dropdowns for categorical filters (Status, Kategori, etc.)
- Text input for search by name
- "Cari" button (primary) to trigger search
- "Export" button (outline)
- "Atur Kolom" button (secondary) — opens column settings dialog

### Form Dialog (Add/Edit)

- 2-column layout for complex forms (`grid grid-cols-2 gap-x-8 gap-y-4`)
- Required fields marked with `*` after label
- Auto-generated fields (e.g., Kode Barang) shown as `disabled` input
- Character counter badge below text fields (`n/max`)
- Status toggle (Switch) at bottom
- Buttons: "Batal" (outline) + "Simpan ..." (primary)

### Upload Page

- Breadcrumb: `Master Data X > Upload Master Data`
- 2-step flow: Download Template -> Upload Excel
- Step 1: Download template button
- Step 2: File input + Upload button

---

## Style Guidelines

**Style:** Data-Dense Dashboard

**Keywords:** Data tables, KPI cards, filter bars, space-efficient, maximum data visibility

**Key Effects:** Row highlighting on hover, smooth filter animations, data loading spinners, cursor-pointer on clickable rows

---

## Anti-Patterns (Do NOT Use)

- ❌ **Drawer/Sheet for forms** — Use center Dialog
- ❌ **Ornate design** — Keep it clinical and functional
- ❌ **No filtering** — Every list page must have filters
- ❌ **Emojis as icons** — Use Lucide icons
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y
- ❌ **Compact/tiny sizing** — Do not use `text-xs` for body text, `h-8` for default buttons, etc.

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] Component sizes match this spec (h-10 buttons, h-10 inputs, etc.)
- [ ] No emojis used as icons (use Lucide)
- [ ] `cursor-pointer` on all clickable elements (especially table rows)
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
- [ ] Master data pages follow the interaction patterns above
