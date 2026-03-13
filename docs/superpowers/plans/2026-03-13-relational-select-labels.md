# Relational Select Labels Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make relational selects store internal IDs but always display user-facing labels after selection, starting with patient registration and finishing with an app-wide audit.

**Architecture:** Keep form state and submit payloads unchanged by continuing to store foreign-key IDs in state. Add one small shared helper for `value -> label` lookup, use that helper to render explicit selected labels in relational select triggers, and record an audit artifact for every relational select reviewed across the app.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `@base-ui/react/select`, shadcn-style UI wrappers, Bun, Turbo.

---

## File Map

- Modify: `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx` — fix `Penjamin`, `Poli / Ruangan`, and `Tenaga Medis` so the trigger renders labels explicitly.
- Create: `apps/web/src/lib/select-utils.ts` — shared helper for relational select option shape and selected-label lookup.
- Optional Modify: `apps/web/src/components/ui/select.tsx` — only if the registration-flow proof shows the primitive wrapper itself needs a narrow compatibility tweak.
- Create: `docs/superpowers/audits/` — parent directory for audit artifacts if it does not already exist.
- Create: `docs/superpowers/audits/2026-03-13-relational-select-audit.md` — inventory of relational select locations with status (`already-correct`, `fixed`, `not-relational`).

## Constraints

- Keep the existing server-action payloads unchanged; IDs remain the submitted values.
- Do not switch select libraries.
- Do not broaden this into a general form refactor.
- No automated test runner is configured in `apps/web`; use typecheck plus manual browser verification as the acceptance gate.

## Chunk 1: Shared Label Contract + Registration Flow Fix

### Task 1: Add shared helper for relational select labels

**Files:**
- Create: `apps/web/src/lib/select-utils.ts`
- Modify: `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx`

- [ ] **Step 1: Add the shared option contract**

Create `apps/web/src/lib/select-utils.ts` with a focused helper API:

```ts
export type RelationalSelectOption = {
  value: string;
  label: string;
};

export function getSelectedOptionLabel(
  options: RelationalSelectOption[],
  value: string | null | undefined,
) {
  if (!value) return undefined;
  return options.find((option) => option.value === value)?.label;
}
```

- [ ] **Step 2: Normalize registration-flow option lists**

In `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx`, derive memo-friendly arrays for:

```ts
const guarantorOptions = options.guarantors.map((g) => ({ value: g.id, label: g.name }));
const roomOptions = options.rooms.map((r) => ({ value: r.id, label: r.name }));
const doctorOptions = options.doctors.map((d) => ({ value: d.id, label: d.name }));
```

Keep them close to render usage unless a small helper function improves readability.

- [ ] **Step 3: Render the selected label explicitly in each relational trigger**

Update the three relational selects so they:

```tsx
const selectedGuarantorLabel = getSelectedOptionLabel(guarantorOptions, guarantorId);

<Select value={guarantorId || undefined} onValueChange={(value) => setGuarantorId(value)}>
  <SelectTrigger id="guarantorId" className="w-full">
    <SelectValue>{selectedGuarantorLabel ?? "Pilih penjamin"}</SelectValue>
  </SelectTrigger>
  <SelectContent>
    {guarantorOptions.map((option) => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

Apply the same pattern to `roomId` and `doctorId`.

Use a consistent empty-value contract in implementation, for example:

```tsx
<Select
  value={guarantorId || undefined}
  onValueChange={(value) => setGuarantorId(value ?? "")}
>
```

- [ ] **Step 4: Normalize empty-value handling**

Replace `null` select values with the contract expected by the component (`undefined` when empty). Keep the state itself as `""` if that is the least invasive form-state contract.

- [ ] **Step 5: Run typecheck for the modified app**

Run: `bun run check-types`

Expected: TypeScript passes with no new errors from `select-utils.ts` or `step-data-pelayanan.tsx`.

- [ ] **Step 6: Manually verify the registration flow in the browser**

Run: `bun run dev:web`

Manual checks:

- confirm each relational field shows its placeholder before any selection
- open `/pendaftaran/pasien/baru`
- pick a `Penjamin`, confirm the trigger shows the selected name, not a UUID
- pick a `Poli / Ruangan`, confirm the trigger shows the selected name, not a UUID
- pick a `Tenaga Medis`, confirm the trigger shows the selected name
- refresh and confirm any preserved/default selection still shows the label
- inspect the submit call in `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx` and confirm it still sends `guarantorId`, `roomId`, and `doctorId` as ID values
- submit a valid form and confirm the flow still succeeds, which proves the server still accepts the ID payload contract

### Task 2: Evaluate whether the UI primitive needs a narrow follow-up

**Files:**
- Inspect: `apps/web/src/components/ui/select.tsx`
- Optional Modify: `apps/web/src/components/ui/select.tsx`

- [ ] **Step 1: Verify whether explicit trigger labels fully solve the bug**

If the registration flow behaves correctly with explicit labels, stop here and do not change the primitive. The helper-based explicit-label pattern remains the canonical solution; primitive edits are fallback-only.

- [ ] **Step 2: Only if needed, apply the smallest primitive-level compatibility fix**

Allowed examples:

- improve `SelectValue` typing or class handling
- preserve placeholder behavior when children are supplied explicitly

Do not rewrite the select wrapper or change unrelated styling.

- [ ] **Step 3: Re-run typecheck if the primitive changes**

Run: `bun run check-types`

Expected: Pass.

- [ ] **Step 4: Manually regression-check non-relational select behavior if the primitive changes**

Open concrete known enum/static-select cases in both `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx` and `apps/web/src/app/(app)/master/ruangan/ruangan-form.tsx` and confirm:

- placeholder text still appears when no value is selected
- selected labels still render correctly for `Kunjungan`, `Jenis Pelayanan`, `Asal Pendaftaran`, and `Alergi`
- selected labels still render correctly for `Jenis Kunjungan` and `Instalasi` in `ruangan-form.tsx`
- no trigger shows raw internal values unexpectedly
- the registration-flow relational selects still show labels correctly after the primitive change
- empty-state and preselected/default-state trigger text still behave correctly

## Chunk 2: App-Wide Audit and Alignment

### Task 3: Inventory all relational selects

**Files:**
- Create: `docs/superpowers/audits/2026-03-13-relational-select-audit.md`
- Inspect: `apps/web/src/**/*.tsx`

- [ ] **Step 1: Search for select usages**

Run discovery from all app select entry points, not just symbol-name guesses:

- search for imports from `@/components/ui/select`
- search for `<Select`, `<SelectTrigger`, and `<SelectValue` usage across `apps/web/src/**/*.{ts,tsx}`
- inspect any wrapper components or extracted field components that render the shared select primitives

Then inspect each candidate usage to determine whether it is relational.

Audit stop rule: the audit is complete only when every discovered `Select` usage in `apps/web/src/**/*.tsx` has been classified.

- [ ] **Step 2: Classify each occurrence**

For every candidate location, classify it as:

- `fixed` — changed in this work
- `already-correct` — already shows labels instead of IDs
- `not-relational` — enum/static select, not backed by an internal identifier
- `follow-up-needed` — relational select found but not yet aligned; this status must be driven to zero before Phase 2 is complete

- [ ] **Step 3: Record the audit artifact**

Write `docs/superpowers/audits/2026-03-13-relational-select-audit.md` in this structure:

```md
# Relational Select Audit — 2026-03-13

## Summary
- Total Select usages reviewed: N
- Relational selects reviewed: N
- Fixed: N
- Already correct: N
- Not relational: N
- Follow-up needed: 0

## Audit Table
| File | Field | Status | Verification | Notes |
| --- | --- | --- | --- | --- |
| `apps/web/src/app/(app)/pendaftaran/pasien/baru/step-data-pelayanan.tsx` | `guarantorId` | `fixed` | browser select-pick check + code review | explicit trigger label |

## Follow-up Needed
- none

## Final Verification Summary
- `bun run check-types`: pass/fail + date
- Relational entries runtime-verified: N/N
- `follow-up-needed`: 0
- Notes: short summary of any extra screens checked
```

For every relational entry, `Verification` must include concrete evidence, not just a status label. Minimum allowed values:

- `browser select-pick check + code review`
- `browser default/placeholder check + code review`

Pure code inspection alone is not enough for `fixed` or `already-correct` relational entries.

### Task 4: Align any additional broken relational selects found during audit

**Files:**
- Modify: exact files discovered during Task 3

- [ ] **Step 1: For each broken relational select, apply the same helper-based pattern**

Use `RelationalSelectOption` + `getSelectedOptionLabel()`.

Do not introduce a second pattern for newly found screens.

- [ ] **Step 2: Re-run typecheck after each batch**

Run: `bun run check-types`

Expected: Pass.

- [ ] **Step 3: Re-run manual verification for each changed screen**

Check that the selected text in the trigger matches the option label the user clicked.

- [ ] **Step 4: Runtime-check every relational entry in the audit table**

Before Phase 2 is done, every row classified as `fixed` or `already-correct` must have runtime verification evidence captured in the audit artifact.

## Chunk 3: Final Verification and Handoff

### Task 5: Prove the rule is satisfied

**Files:**
- Review: every file marked `fixed` or `already-correct` in `docs/superpowers/audits/2026-03-13-relational-select-audit.md`
- Review: `apps/web/src/lib/select-utils.ts`
- Review: `docs/superpowers/audits/2026-03-13-relational-select-audit.md`

- [ ] **Step 1: Confirm the rule in code**

Check that relational selects now follow the same contract:

- IDs stored in state
- labels derived from options
- trigger text renders labels explicitly
- no unresolved `follow-up-needed` entries remain in the audit artifact

- [ ] **Step 2: Run the final verification commands**

Run: `bun run check-types`

Expected: Pass.

- [ ] **Step 3: Summarize verification evidence**

Write the final evidence into the `Final Verification Summary` section of `docs/superpowers/audits/2026-03-13-relational-select-audit.md` and mirror the same facts in the implementation handoff:

- typecheck result
- manual verification result for registration flow
- manual verification result for every relational location in the audit, including `already-correct` entries
- audit artifact path and counts by status
- explicit statement that `follow-up-needed = 0`
