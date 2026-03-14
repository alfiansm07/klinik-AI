import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  assessmentFastHandoverSchema,
  assessmentFinalizeSchema,
  assessmentWizardSteps,
  createEmptyAssessmentDraft,
  normalizeAssessmentInput,
} from "./assessment-shared";
import type { AssessmentWizardStepId } from "./assessment-wizard";

function createBaseAssessmentInput() {
  return {
    visitId: "visit-1",
    assessedByUserId: "user-1",
    assessmentAt: "2026-03-14T10:00:00.000Z",
    chiefComplaint: "Nyeri dada",
    initialAllergyFlag: false,
    functionalDisabilityFlag: false,
    communicationBarrierFlag: false,
    nutritionRiskFlag: false,
    painScore: 0,
    fallRiskLevel: "rendah",
    fallMitigationNote: "",
    needsCompanionFlag: false,
    consciousnessLevel: "compos_mentis",
    systolic: 120,
    diastolic: 80,
    heartRate: 88,
    respiratoryRate: 18,
    temperatureCelsius: 36.8,
    spo2: 98,
    triageLevel: "non_urgent",
    handoverNoteManual: "Pasien stabil untuk evaluasi dokter.",
    dispositionStatus: "ready_for_doctor",
  };
}

describe("assessment-shared", () => {
  test("defaults start in draft mode with all wizard steps present", () => {
    const draft = createEmptyAssessmentDraft();

    assert.equal(draft.status, "draft");
    assert.deepEqual(
      assessmentWizardSteps.map((step: { id: AssessmentWizardStepId }) => step.id),
      ["intake", "risk", "vitals", "exam", "handover"],
    );
    assert.equal("wizardStepIds" in draft, false);
  });

  test("pain score above zero requires pain detail", () => {
    const invalidResult = assessmentFinalizeSchema.safeParse({
      ...createBaseAssessmentInput(),
      painScore: 6,
      painSummary: "",
    });

    assert.equal(invalidResult.success, false);

    const validResult = assessmentFinalizeSchema.safeParse({
      ...createBaseAssessmentInput(),
      painScore: 6,
      painSummary: "Nyeri tajam sejak pagi.",
    });

    assert.equal(validResult.success, true);
  });

  test("allergy flag true requires at least one allergy detail field", () => {
    const invalidResult = assessmentFinalizeSchema.safeParse({
      ...createBaseAssessmentInput(),
      initialAllergyFlag: true,
      drugAllergyNote: "",
      foodAllergyNote: "",
      airAllergyNote: "",
      otherAllergyNote: "",
    });

    assert.equal(invalidResult.success, false);

    const validResult = assessmentFinalizeSchema.safeParse({
      ...createBaseAssessmentInput(),
      initialAllergyFlag: true,
      drugAllergyNote: "Alergi penisilin",
    });

    assert.equal(validResult.success, true);
  });

  test("normalizeAssessmentInput trims text fields without adding UI-only wizard state", () => {
    const normalized = normalizeAssessmentInput({
      visitId: " visit-1 ",
      assessedByUserId: " user-1 ",
      assessmentAt: " 2026-03-14T10:00:00.000Z ",
      chiefComplaint: "  Nyeri perut  ",
      handoverNoteManual: "  Stabil  ",
    });

    assert.equal(normalized.visitId, "visit-1");
    assert.equal(normalized.chiefComplaint, "Nyeri perut");
    assert.equal(normalized.handoverNoteManual, "Stabil");
    assert.equal("wizardStepIds" in normalized, false);
  });

  test("finalize schema reports high fall risk mitigation on the expected field", () => {
    const result = assessmentFinalizeSchema.safeParse({
      ...createBaseAssessmentInput(),
      fallRiskLevel: "tinggi",
      fallMitigationNote: "",
      needsCompanionFlag: false,
    });

    assert.equal(result.success, false);

    if (result.success) {
      assert.fail("expected finalize schema to reject missing fall mitigation");
    }

    assert.equal(result.error.issues[0]?.path[0], "fallMitigationNote");
  });

  test("fast handover schema accepts urgent minimum dataset and rejects missing urgent fields", () => {
    const validResult = assessmentFastHandoverSchema.safeParse({
      ...createBaseAssessmentInput(),
      triageLevel: "darurat",
      dispositionStatus: "priority_handover",
      handoverNoteManual: "Segera evaluasi dokter, keluhan akut.",
    });

    assert.equal(validResult.success, true);

    const invalidResult = assessmentFastHandoverSchema.safeParse({
      ...createBaseAssessmentInput(),
      triageLevel: "darurat",
      dispositionStatus: "priority_handover",
      handoverNoteManual: "",
    });

    assert.equal(invalidResult.success, false);

    if (invalidResult.success) {
      assert.fail("expected fast handover schema to reject blank urgent note");
    }

    assert.equal(invalidResult.error.issues.some((issue) => issue.path[0] === "handoverNoteManual"), true);
  });
});
