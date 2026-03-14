import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildDoctorAttentionFlags,
  getActiveAssessmentBlocks,
  getAlternativeRequiredFieldGroupsForContext,
  getRequiredFieldsForContext,
  isFastHandoverContext,
} from "./adaptive-rules";

describe("adaptive-rules", () => {
  test("dental visits trigger dental exam block", () => {
    const blocks = getActiveAssessmentBlocks({
      visitType: "dental",
      chiefComplaint: "Sakit gigi",
      patientAgeGroup: "adult",
    });

    assert.deepEqual(blocks, [
      "intake",
      "risk-screening",
      "vital-signs",
      "core-history",
      "general-exam",
      "handover",
      "dental-exam",
    ]);
  });

  test("general visits do not trigger dental exam block by default", () => {
    const blocks = getActiveAssessmentBlocks({
      visitType: "general",
      chiefComplaint: "Batuk",
      patientAgeGroup: "adult",
    });

    assert.deepEqual(blocks, [
      "intake",
      "risk-screening",
      "vital-signs",
      "core-history",
      "general-exam",
      "handover",
    ]);
  });

  test("critical triage triggers fast handover mode", () => {
    assert.equal(
      isFastHandoverContext({
        triageLevel: "gawat",
        vitalAlertLevel: "normal",
      }),
      true,
    );
  });

  test("fast handover also triggers on critical vital alert", () => {
    assert.equal(
      isFastHandoverContext({
        triageLevel: "non_urgent",
        vitalAlertLevel: "kritis",
      }),
      true,
    );
  });

  test("communication barrier requires communication detail note", () => {
    const requiredFields = getRequiredFieldsForContext({
      communicationBarrierFlag: true,
    });

    assert.equal(requiredFields.includes("communicationBarrierNote"), true);
  });

  test("functional disability requires disability note", () => {
    const requiredFields = getRequiredFieldsForContext({
      functionalDisabilityFlag: true,
    });

    assert.equal(requiredFields.includes("functionalDisabilityNote"), true);
  });

  test("nutrition risk requires nutrition detail note", () => {
    const requiredFields = getRequiredFieldsForContext({
      nutritionRiskFlag: true,
    });

    assert.equal(requiredFields.includes("nutritionDetailNote"), true);
  });

  test("high fall risk requires mitigation detail or companion marker", () => {
    const requiredFields = getRequiredFieldsForContext({
      fallRiskLevel: "tinggi",
    });
    const alternativeGroups = getAlternativeRequiredFieldGroupsForContext({
      fallRiskLevel: "tinggi",
    });

    assert.deepEqual(requiredFields, []);
    assert.deepEqual(alternativeGroups, [["fallMitigationNote", "needsCompanionFlag"]]);
  });

  test("pediatric context enables caregiver-source history fields", () => {
    const requiredFields = getRequiredFieldsForContext({
      patientAgeGroup: "pediatric",
    });

    assert.deepEqual(
      requiredFields.filter((field: string) => field.startsWith("historySource")),
      ["historySourceType", "historySourceName", "historySourceRelationship"],
    );
  });

  test("elderly context emphasizes fall and medication review blocks", () => {
    const blocks = getActiveAssessmentBlocks({
      patientAgeGroup: "elderly",
      visitType: "general",
    });

    assert.deepEqual(blocks, [
      "intake",
      "risk-screening",
      "vital-signs",
      "core-history",
      "general-exam",
      "handover",
      "fall-prevention",
      "medication-review",
    ]);
  });

  test("doctor attention flags highlight urgent and screening concerns", () => {
    const flags = buildDoctorAttentionFlags({
      triageLevel: "darurat",
      initialAllergyFlag: true,
      fallRiskLevel: "tinggi",
    });

    assert.deepEqual(flags, ["urgent-triage", "allergy", "high-fall-risk"]);
  });

  test("active blocks are deduplicated when multiple dental triggers exist", () => {
    const blocks = getActiveAssessmentBlocks({
      visitType: "dental",
      chiefComplaint: "Sakit gigi dan gusi",
      patientAgeGroup: "elderly",
      fallRiskLevel: "tinggi",
    });

    assert.deepEqual(blocks, [
      "intake",
      "risk-screening",
      "vital-signs",
      "core-history",
      "general-exam",
      "handover",
      "dental-exam",
      "fall-prevention",
      "medication-review",
    ]);
  });
});
