import type { AssessmentRuleContext } from "./assessment-shared";

export type AssessmentBlockId =
  | "intake"
  | "risk-screening"
  | "vital-signs"
  | "core-history"
  | "general-exam"
  | "dental-exam"
  | "pain-detail"
  | "allergy-detail"
  | "communication-support"
  | "nutrition-detail"
  | "fall-prevention"
  | "medication-review"
  | "handover";

export type AssessmentFieldKey =
  | "painSummary"
  | "communicationBarrierNote"
  | "functionalDisabilityNote"
  | "nutritionDetailNote"
  | "fallMitigationNote"
  | "needsCompanionFlag"
  | "historySourceType"
  | "historySourceName"
  | "historySourceRelationship";

export type AssessmentAlternativeRequirementGroup = readonly AssessmentFieldKey[];

export function getActiveAssessmentBlocks(context: AssessmentRuleContext): AssessmentBlockId[] {
  const blocks: AssessmentBlockId[] = [
    "intake",
    "risk-screening",
    "vital-signs",
    "core-history",
    "general-exam",
    "handover",
  ];

  if (context.painScore && context.painScore > 0) {
    blocks.push("pain-detail");
  }

  if (context.initialAllergyFlag) {
    blocks.push("allergy-detail");
  }

  if (context.communicationBarrierFlag) {
    blocks.push("communication-support");
  }

  if (context.nutritionRiskFlag) {
    blocks.push("nutrition-detail");
  }

  if (context.visitType === "dental" || hasDentalComplaint(context.chiefComplaint)) {
    blocks.push("dental-exam");
  }

  if (context.patientAgeGroup === "elderly" || context.fallRiskLevel === "tinggi") {
    blocks.push("fall-prevention", "medication-review");
  }

  return unique(blocks);
}

export function getRequiredFieldsForContext(context: AssessmentRuleContext): AssessmentFieldKey[] {
  const fields: AssessmentFieldKey[] = [];

  if ((context.painScore ?? 0) > 0) {
    fields.push("painSummary");
  }

  if (context.communicationBarrierFlag) {
    fields.push("communicationBarrierNote");
  }

  if (context.functionalDisabilityFlag) {
    fields.push("functionalDisabilityNote");
  }

  if (context.nutritionRiskFlag) {
    fields.push("nutritionDetailNote");
  }

  if (context.fallRiskLevel === "tinggi") {
    // handled by getAlternativeRequiredFieldGroupsForContext to support either/or validation
  }

  if (context.patientAgeGroup === "pediatric") {
    fields.push("historySourceType", "historySourceName", "historySourceRelationship");
  }

  return unique(fields);
}

export function isFastHandoverContext(context: AssessmentRuleContext) {
  return context.triageLevel === "gawat" || context.triageLevel === "darurat" || context.vitalAlertLevel === "kritis";
}

export function getAlternativeRequiredFieldGroupsForContext(
  context: AssessmentRuleContext,
): AssessmentAlternativeRequirementGroup[] {
  const groups: AssessmentAlternativeRequirementGroup[] = [];

  if (context.fallRiskLevel === "tinggi") {
    groups.push(["fallMitigationNote", "needsCompanionFlag"]);
  }

  return groups;
}

export function buildDoctorAttentionFlags(context: AssessmentRuleContext) {
  const flags: string[] = [];

  if (context.triageLevel === "gawat" || context.triageLevel === "darurat") {
    flags.push("urgent-triage");
  }

  if (context.vitalAlertLevel === "kritis") {
    flags.push("critical-vitals");
  }

  if (context.initialAllergyFlag) {
    flags.push("allergy");
  }

  if (context.fallRiskLevel === "tinggi") {
    flags.push("high-fall-risk");
  }

  if (context.communicationBarrierFlag) {
    flags.push("communication-barrier");
  }

  if (context.nutritionRiskFlag) {
    flags.push("nutrition-risk");
  }

  if ((context.painScore ?? 0) >= 7) {
    flags.push("severe-pain");
  }

  return unique(flags);
}

function hasDentalComplaint(chiefComplaint: string | undefined) {
  return chiefComplaint?.toLowerCase().includes("gigi") ?? false;
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}
