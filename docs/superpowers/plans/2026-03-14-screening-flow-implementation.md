# Screening Flow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the outpatient screening flow for Klinikai from nurse worklist to doctor handover, with adaptive wizard steps, draft/final submission, and real assessment status wired back into registration detail.

**Architecture:** Add a new care domain backed by visit-linked assessment tables, server-fetched worklist pages, and a client wizard that saves through Server Actions. Keep the UI split into small step components, derive clinical flags on the server, and expose a compact doctor-facing handover summary instead of a long raw form.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, shadcn/ui base-lyra primitives, `@tanstack/react-form`, Drizzle ORM, PostgreSQL, Bun, `node:test` / `bun test`.

---

## File Structure Map

### Create

- `packages/db/src/schema/assessment.ts` - assessment enums and tables for initial screening, vital signs, specialty exam, body findings, and handover state.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/actions.ts` - server queries and mutations for the assessment worklist and visit summary.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/assessment-shared.ts` - shared types, labels, Zod schemas, default values, and normalization helpers.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/adaptive-rules.ts` - pure rules for step visibility, required-if-relevant fields, and fast handover triggers.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/worklist-shared.ts` - formatters for worklist rows, badges, and summary surfaces.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/page.tsx` - server page for the nurse assessment worklist.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/worklist-view.tsx` - client worklist table with filters and row navigation.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/page.tsx` - server page for one visit assessment.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/assessment-shell.tsx` - client orchestration component for the wizard.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/assessment-stepper.tsx` - progress header, mini summary, and step navigation.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/step-intake.tsx` - intake form block.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/step-risk.tsx` - risk screening form block.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/step-vitals.tsx` - vital sign and triage block.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/step-exam.tsx` - adaptive history, allergy, medication, and specialty exam block.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/step-handover.tsx` - disposition and final handover block.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/summary-panel.tsx` - doctor-style summary card rendered beside the wizard.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/assessment-shared.test.ts` - tests for defaults, normalization, and required core fields.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/adaptive-rules.test.ts` - tests for specialty and conditional visibility.
- `apps/web/src/app/(app)/pelayanan/asesmen-awal/worklist-shared.test.ts` - tests for worklist badges and status formatting.

### Modify

- `packages/db/src/schema/visit.ts` - expand visit status enum and add assessment linkage fields only if needed for denormalized queue surfaces.
- `packages/db/src/schema/relations.ts` - register new relations between visit and assessment tables.
- `packages/db/src/schema/index.ts` - export new assessment schema.
- `apps/web/src/lib/rbac.ts` - add a dedicated care module and grant it to nurse and doctor roles.
- `apps/web/src/lib/app-navigation.ts` - add the assessment worklist nav item.
- `apps/web/src/lib/route-access.ts` - mark `/pelayanan` routes as protected.
- `apps/web/src/lib/rbac.test.ts` - cover care-module access.
- `apps/web/src/lib/app-navigation.test.ts` - cover care nav visibility.
- `apps/web/src/lib/route-access.test.ts` - cover `/pelayanan` protection.
- `apps/web/src/app/(app)/pendaftaran/pasien/actions.ts` - replace placeholder screening rows with real assessment summary and expose CTA state.
- `apps/web/src/app/(app)/pendaftaran/pasien/registration-list-shared.ts` - add real screening status labels and handover surfaces.
- `apps/web/src/app/(app)/pendaftaran/pasien/registration-list-shared.test.ts` - update expectations away from placeholder-only screening data.
- `apps/web/src/app/(app)/pendaftaran/pasien/[id]/detail-view.tsx` - add real screening CTA and status summary.
- `apps/web/src/app/(app)/pendaftaran/pasien/baru/service-actions.ts` - set new visits to `menunggu_asesmen` and preserve tenant-safe registration validation.

### Verification Commands

- `bun test "apps/web/src/lib/rbac.test.ts"`
- `bun test "apps/web/src/lib/app-navigation.test.ts"`
- `bun test "apps/web/src/lib/route-access.test.ts"`
- `bun test "apps/web/src/app/(app)/pendaftaran/pasien/registration-list-shared.test.ts"`
- `bun test "apps/web/src/app/(app)/pelayanan/asesmen-awal/assessment-shared.test.ts"`
- `bun test "apps/web/src/app/(app)/pelayanan/asesmen-awal/adaptive-rules.test.ts"`
- `bun test "apps/web/src/app/(app)/pelayanan/asesmen-awal/worklist-shared.test.ts"`
- `bun run db:generate`
- `bun run db:migrate`
- `bun run check-types`
- `bun run build`

## Chunk 1: Foundation, Schema, and Access

### Task 1: Open the care route and module access

**Files:**
- Modify: `apps/web/src/lib/rbac.ts`
- Modify: `apps/web/src/lib/app-navigation.ts`
- Modify: `apps/web/src/lib/route-access.ts`
- Modify: `apps/web/src/lib/rbac.test.ts`
- Modify: `apps/web/src/lib/app-navigation.test.ts`
- Modify: `apps/web/src/lib/route-access.test.ts`

- [ ] **Step 1: Write failing access tests**

Add tests that assert:

```ts
assert.equal(canAccessModule("nurse", "care"), true)
assert.equal(canAccessModule("doctor", "care"), true)
assert.equal(canAccessModule("receptionist", "care"), false)
assert.deepEqual(getVisibleNavItems("nurse").map((item) => item.href), ["/dashboard", "/pelayanan/asesmen-awal", "/master"])
assert.equal(getRouteAccess("/pelayanan/asesmen-awal").protected, true)
```

- [ ] **Step 2: Run only the access tests and confirm failure**

Run:

```bash
bun test "apps/web/src/lib/rbac.test.ts"
bun test "apps/web/src/lib/app-navigation.test.ts"
bun test "apps/web/src/lib/route-access.test.ts"
```

Expected: failures mentioning unknown `care` module, missing nav item, or unprotected `/pelayanan` path.

- [ ] **Step 3: Implement the minimum access changes**

Required edits:

- add `care` to `APP_MODULES`
- grant `care` to `nurse`, `doctor`, `admin`, and `superadmin`
- keep `receptionist` and `cashier` out of `care`
- add nav item `{ href: "/pelayanan/asesmen-awal", label: "Asesmen Awal", module: "care", icon: "stethoscope", group: "operations" }`
- add `/pelayanan` to protected route prefixes

- [ ] **Step 4: Re-run the access tests**

Expected: PASS.

- [ ] **Step 5: Review diff for unintended nav or RBAC regressions**

Check that existing registration and master access stay unchanged for current roles.

### Task 2: Add assessment schema and visit lifecycle states

**Files:**
- Create: `packages/db/src/schema/assessment.ts`
- Modify: `packages/db/src/schema/visit.ts`
- Modify: `packages/db/src/schema/relations.ts`
- Modify: `packages/db/src/schema/index.ts`

- [ ] **Step 1: Write schema notes directly in the plan before coding**

Create these enums in `assessment.ts`:

```ts
assessmentStatusEnum = ["draft", "finalized"]
assessmentDispositionEnum = ["ready_for_doctor", "priority_handover", "observation"]
triageLevelEnum = ["tidak_gawat", "gawat", "darurat", "meninggal"]
vitalAlertLevelEnum = ["normal", "perlu_perhatian", "abnormal", "kritis"]
clinicAssessmentTypeEnum = ["general", "dental"]
```

Create these tables:

- `visit_assessment` - one active assessment per visit; stores intake, summary, disposition, adaptive block list, completion metadata
- `visit_assessment_risk` - risk booleans, scores, and notes
- `visit_vital_sign` - one latest vital-sign row per assessment, expandable later to history
- `visit_assessment_exam` - generic history, allergy detail, medication history, psychosocial, specialty exam fields
- `visit_body_finding` - repeatable body findings

Keep every table multi-tenant with `clinic_id` and composite indexes on `(clinic_id, visit_id)` or `(clinic_id, assessment_id)`.

- [ ] **Step 2: Expand visit status enum in `visit.ts`**

Replace the current lifecycle with:

```ts
visitStatusEnum = [
  "registered",
  "menunggu_asesmen",
  "draft",
  "ready_for_doctor",
  "priority_handover",
  "observation",
  "in_examination",
  "completed",
  "cancelled",
]
```

Keep existing states so current flows do not break.

- [ ] **Step 3: Add relations and barrel exports**

Required relation direction:

- `visit` has many `visitAssessment`
- `visitAssessment` belongs to `visit`, `clinic`, `patient`, `assessedBy`, and `completedBy`
- `visitAssessment` has one `visitAssessmentRisk`, one `visitVitalSign`, one `visitAssessmentExam`, and many `visitBodyFinding`

- [ ] **Step 4: Generate and review migration**

Run:

```bash
bun run db:generate
```

Expected: a new migration with enum changes and new tables only.

Review for:

- accidental enum drops
- missing composite indexes
- missing foreign keys on `clinic_id`, `visit_id`, `patient_id`, `assessed_by_user_id`

- [ ] **Step 5: Apply migration locally**

Run:

```bash
bun run db:migrate
```

Expected: migration applies cleanly.

## Chunk 2: Shared Domain Logic and Server Data Layer

### Task 3: Build shared assessment types, defaults, and adaptive rules

**Files:**
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/assessment-shared.ts`
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/adaptive-rules.ts`
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/assessment-shared.test.ts`
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/adaptive-rules.test.ts`

- [ ] **Step 1: Write failing unit tests for pure assessment logic**

Cover at least:

```ts
test("defaults start in draft mode with all wizard steps present")
test("pain score above zero requires pain detail")
test("dental visits trigger dental exam block")
test("general visits do not trigger dental exam block by default")
test("critical triage triggers fast handover mode")
test("allergy flag true requires at least one allergy detail field")
test("communication barrier requires communication detail note")
test("functional disability requires disability note")
test("nutrition risk requires nutrition detail note")
test("high fall risk requires mitigation detail or companion marker")
test("pediatric context enables caregiver-source history fields")
test("elderly context emphasizes fall and medication review blocks")
test("fast handover schema accepts urgent minimum dataset and rejects missing urgent fields")
```

- [ ] **Step 2: Run the new tests and confirm failure**

Run:

```bash
bun test "apps/web/src/app/(app)/pelayanan/asesmen-awal/assessment-shared.test.ts"
bun test "apps/web/src/app/(app)/pelayanan/asesmen-awal/adaptive-rules.test.ts"
```

Expected: missing module or missing export failures.

- [ ] **Step 3: Implement shared domain helpers**

`assessment-shared.ts` should export:

- `assessmentWizardSteps`
- `createEmptyAssessmentDraft()`
- `assessmentCoreSchema`
- `assessmentFinalizeSchema`
- `assessmentFastHandoverSchema`
- `normalizeAssessmentInput()`
- label maps for triage, pain, fall risk, and disposition

`adaptive-rules.ts` should export:

- `getActiveAssessmentBlocks(context)`
- `getRequiredFieldsForContext(context)`
- `isFastHandoverContext(context)`
- `buildDoctorAttentionFlags(context)`

Keep these files pure and testable. Do not import React into them.

- [ ] **Step 4: Re-run the pure tests**

Expected: PASS.

- [ ] **Step 5: Run typecheck on the web app after adding shared files**

Run:

```bash
bun run check-types
```

Expected: PASS or only unrelated pre-existing failures already confirmed by the user.

### Task 4: Build server queries and mutations for worklist and visit assessment

**Files:**
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/actions.ts`
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/worklist-shared.ts`
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/worklist-shared.test.ts`
- Modify: `apps/web/src/app/(app)/pendaftaran/pasien/actions.ts`
- Modify: `apps/web/src/app/(app)/pendaftaran/pasien/registration-list-shared.ts`
- Modify: `apps/web/src/app/(app)/pendaftaran/pasien/registration-list-shared.test.ts`
- Modify: `apps/web/src/app/(app)/pendaftaran/pasien/baru/service-actions.ts`

- [ ] **Step 1: Write failing tests for worklist and status formatting**

Cover at least:

```ts
test("maps menunggu_asesmen to a waiting badge")
test("maps draft to a continue-assessment badge")
test("maps ready_for_doctor to a success badge")
test("maps priority_handover to an urgent badge")
```

- [ ] **Step 2: Run status-formatting tests and confirm failure**

Run:

```bash
bun test "apps/web/src/app/(app)/pelayanan/asesmen-awal/worklist-shared.test.ts"
bun test "apps/web/src/app/(app)/pendaftaran/pasien/registration-list-shared.test.ts"
```

- [ ] **Step 3: Implement server data layer in `actions.ts`**

Add these server functions:

- `getAssessmentWorklist()` - fetch visits in `menunggu_asesmen`, `draft`, `ready_for_doctor`, `priority_handover`, `observation` for the active clinic; join patient, room, guarantor, and latest assessment snapshot
- `getAssessmentVisitDetail(visitId)` - fetch visit context, latest assessment draft, and specialty context for the wizard page
- `saveAssessmentDraft(input)` - upsert draft rows, derive scores and flags, keep visit status in `draft` unless urgent
- `finalizeAssessment(input)` - choose `assessmentFinalizeSchema` or `assessmentFastHandoverSchema` based on urgency, write summary snapshot, and set visit status to `ready_for_doctor`, `priority_handover`, or `observation`

Server-action rules:

- verify clinic ownership on every visit and related record
- derive BMI, pain label, fall risk level, nutrition risk level, and attention flags on the server
- revalidate both `/pelayanan/asesmen-awal` and the related registration detail path

- [ ] **Step 4: Replace registration placeholders with real assessment data**

In `pendaftaran/pasien/actions.ts` and `registration-list-shared.ts`:

- map new visit statuses to real screening labels
- feed `screeningRows` from assessment summary instead of `frontOfficeNote`
- expose CTA states such as `Mulai Skrining`, `Lanjutkan Skrining`, and `Lihat Handover`

- [ ] **Step 4a: Set new registrations to the assessment queue entry state**

In `pendaftaran/pasien/baru/service-actions.ts`:

- write new visits with `status: "menunggu_asesmen"`
- keep the existing registration validation and tenant ownership checks intact
- revalidate the registration list and `/pelayanan/asesmen-awal` so the visit appears immediately in the nurse worklist

- [ ] **Step 5: Re-run worklist and registration tests**

Expected: PASS.

## Chunk 3: Worklist UI, Wizard UI, and Verification

### Task 5: Build the nurse worklist page

**Files:**
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/page.tsx`
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/worklist-view.tsx`

- [ ] **Step 1: Build the server page shell**

`page.tsx` should:

- call `getPageAuthContext("care")`
- fetch worklist data on the server with `getAssessmentWorklist()`
- render `PageHeader` with nurse-facing copy
- pass only serialized worklist rows to the client view

- [ ] **Step 2: Build the client worklist view**

`worklist-view.tsx` should:

- use existing table primitives from `@/components/ui/table`
- stay mobile-first and avoid horizontal overflow at 375px
- support filters for date, room, status, and search
- show compact badges for assessment state and alerts
- navigate to `/pelayanan/asesmen-awal/[visitId]` on row click or explicit action button

Follow React best practices:

- keep expensive row transforms in `useMemo`
- pass minimal serialized data from the server page
- avoid client-side fetching for core worklist data

- [ ] **Step 3: Manually verify the worklist layout at 375px, 768px, 1024px, and 1440px**

Check:

- no clipped controls
- filter bar wraps cleanly
- row actions stay reachable on mobile
- registration-created visits appear as `menunggu_asesmen`

### Task 6: Build the adaptive wizard route and step components

**Files:**
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/page.tsx`
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/assessment-shell.tsx`
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/assessment-stepper.tsx`
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/step-intake.tsx`
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/step-risk.tsx`
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/step-vitals.tsx`
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/step-exam.tsx`
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/step-handover.tsx`
- Create: `apps/web/src/app/(app)/pelayanan/asesmen-awal/[visitId]/summary-panel.tsx`
- Modify: `apps/web/src/app/(app)/pendaftaran/pasien/[id]/detail-view.tsx`

- [ ] **Step 1: Build the server route for one visit**

`[visitId]/page.tsx` should:

- fetch visit detail and draft data on the server
- 404 when the visit does not belong to the active clinic
- render the shell with only the data needed by the client form
- pass the current role so nurses get edit mode and doctors get read-only handover mode

- [ ] **Step 2: Build the shell and stepper**

`assessment-shell.tsx` should:

- initialize `@tanstack/react-form` with `createEmptyAssessmentDraft()` merged with server draft data
- keep current step index locally
- save drafts through `startTransition`
- surface server validation errors by field and by step
- lock editing for doctor users and render summary-first read-only handover mode until SOAP exists

`assessment-stepper.tsx` should:

- show progress, visit identity, mini alerts, and current status
- keep actions large enough for clinical use (`h-11+`, `text-base`)

- [ ] **Step 3: Implement each step as a focused component**

Keep responsibilities narrow:

- `step-intake.tsx` - complaint, duration, assessor, allergy flag
- `step-risk.tsx` - function, fall, pain, nutrition, communication, disability, companion needs, caregiver context when relevant
- `step-vitals.tsx` - consciousness, BP, pulse, respiration, temperature, SpO2, BMI, triage
- `step-exam.tsx` - history, allergy detail, medication, psychosocial, adaptive general or dental exam, body findings
- `step-handover.tsx` - disposition, immediate review flag, manual note, final review checklist

Do not create one giant 800-line form component.

- [ ] **Step 4: Build the live summary panel**

`summary-panel.tsx` should render the doctor-facing handover summary from current form state plus derived flags:

- reason for visit
- alert badges
- compact vital strip
- history summary
- exam highlights
- disposition

Show positive and abnormal findings first.

- [ ] **Step 4a: Make the handover summary usable for doctors before SOAP exists**

On the same `[visitId]` route:

- nurses see editable wizard plus live summary
- doctors see the finalized summary first in read-only mode
- if the assessment is still `draft`, doctors see a clear `Asesmen belum final` state instead of raw incomplete fields
- the read-only summary covers identity, complaint, alerts, vitals, history highlights, exam highlights, and disposition

- [ ] **Step 5: Wire registration detail to the wizard route**

In `detail-view.tsx`:

- replace placeholder screening links with real CTA buttons
- show current assessment status badge
- route to `/pelayanan/asesmen-awal/[visitId]`

### Task 7: Final verification, QA, and handoff checklist

**Files:**
- No new files; verify the full feature set above.

- [ ] **Step 1: Run all targeted tests**

Run every command listed in `Verification Commands`.

- [ ] **Step 2: Fix all red tests and type errors before claiming completion**

Do not defer known failing tests.

- [ ] **Step 3: Run manual workflow QA end to end**

Check this scenario set:

1. register a new outpatient visit
2. confirm visit appears in nurse worklist as `menunggu_asesmen`
3. save a partial intake as draft
4. reopen and confirm draft data persists
5. finalize a normal general-clinic assessment
6. confirm visit becomes `ready_for_doctor`
7. confirm registration detail shows real screening summary
8. confirm urgent triage produces `priority_handover`
9. confirm a dental visit reveals dental-only fields
10. confirm a zero-pain visit hides pain detail by default
11. confirm a communication barrier requires detail before final submit
12. confirm a disability flag requires `functional_disability_note`
13. confirm nutrition risk requires `nutrition_detail_note`
14. confirm high fall risk requires mitigation context
15. confirm a doctor opening the visit sees the read-only handover summary first

- [ ] **Step 4: Record any new workflow lesson immediately if implementation reveals a repeatable pattern**

Update `tasks/lessons.md` during execution, not at the end of the week.

- [ ] **Step 5: Prepare execution handoff notes**

Handoff must mention:

- schema and migration applied
- new `/pelayanan/asesmen-awal` route
- files added for wizard steps
- final verification output
- any intentionally deferred non-MVP specialty blocks

## Notes for the Implementer

- Use Server Actions only. Do not add API routes.
- Keep server fetching in server components; client components should receive only data needed for interactivity.
- Prefer direct imports over broad barrels for performance-sensitive client files.
- Keep step components small and focused so the wizard is maintainable.
- Use existing shadcn/base-lyra primitives and current sizing guidance for clinical staff.
- Treat urgent triage as a first-class path, not a side note.
- Do not create commits unless the user explicitly asks for them during execution.
