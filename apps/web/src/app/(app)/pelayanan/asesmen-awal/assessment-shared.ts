import z from "zod";

export { assessmentWizardSteps } from "./assessment-wizard";

const TRIAGE_LEVEL_VALUES = ["non_urgent", "gawat", "darurat"] as const;
const FALL_RISK_LEVEL_VALUES = ["rendah", "sedang", "tinggi"] as const;
const DISPOSITION_STATUS_VALUES = [
  "ready_for_doctor",
  "priority_handover",
  "observation",
] as const;
const PATIENT_AGE_GROUP_VALUES = ["pediatric", "adult", "elderly"] as const;
const VISIT_TYPE_VALUES = ["general", "dental"] as const;
const VITAL_ALERT_LEVEL_VALUES = ["normal", "warning", "kritis"] as const;

export const assessmentTriageLabelMap = {
  non_urgent: "Non-urgent",
  gawat: "Gawat",
  darurat: "Darurat",
} as const;

export const assessmentPainLabelMap = {
  0: "0 - Tidak nyeri",
  1: "1 - Nyeri minimal",
  2: "2 - Nyeri ringan",
  3: "3 - Nyeri ringan",
  4: "4 - Nyeri sedang",
  5: "5 - Nyeri sedang",
  6: "6 - Nyeri sedang",
  7: "7 - Nyeri berat",
  8: "8 - Nyeri berat",
  9: "9 - Nyeri sangat berat",
  10: "10 - Nyeri tak tertahankan",
} as const;

export const assessmentFallRiskLabelMap = {
  rendah: "Risiko rendah",
  sedang: "Risiko sedang",
  tinggi: "Risiko tinggi",
} as const;

export const assessmentDispositionLabelMap = {
  ready_for_doctor: "Siap ke Dokter",
  priority_handover: "Serah Terima Prioritas",
  observation: "Observasi",
} as const;

export const assessmentConsciousnessLabelMap: Record<string, string> = {
  compos_mentis: "Compos mentis",
  apatis: "Apatis",
  somnolen: "Somnolen",
  sopor: "Sopor",
  coma: "Koma",
} as const;

const trimmedString = z.string().trim();
const optionalTrimmedString = z.string().trim().optional().default("");
const requiredTrimmedString = (message: string) => z.string().trim().min(1, message);
const optionalBoolean = z.boolean().optional().default(false);
const optionalInteger = z.number().int().nonnegative().optional().default(0);
const optionalPositiveNumber = z.number().positive().optional();

const assessmentBaseSchema = z.object({
  visitId: requiredTrimmedString("Visit wajib diisi"),
  assessedByUserId: requiredTrimmedString("Perawat penilai wajib diisi"),
  assessmentAt: requiredTrimmedString("Waktu asesmen wajib diisi"),
  status: z.enum(["draft", "finalized", "priority_handover"]).optional().default("draft"),
  visitType: z.enum(VISIT_TYPE_VALUES).optional().default("general"),
  patientAgeGroup: z.enum(PATIENT_AGE_GROUP_VALUES).optional().default("adult"),
  chiefComplaint: optionalTrimmedString,
  intakeNote: optionalTrimmedString,
  additionalComplaints: optionalTrimmedString,
  initialAllergyFlag: optionalBoolean,
  functionalDisabilityFlag: optionalBoolean,
  functionalDisabilityNote: optionalTrimmedString,
  communicationBarrierFlag: optionalBoolean,
  communicationBarrierNote: optionalTrimmedString,
  nutritionRiskFlag: optionalBoolean,
  nutritionDetailNote: optionalTrimmedString,
  painScore: optionalInteger,
  painSummary: optionalTrimmedString,
  fallRiskLevel: z.enum(FALL_RISK_LEVEL_VALUES).optional().default("rendah"),
  fallMitigationNote: optionalTrimmedString,
  needsCompanionFlag: optionalBoolean,
  historySourceType: optionalTrimmedString,
  historySourceName: optionalTrimmedString,
  historySourceRelationship: optionalTrimmedString,
  drugAllergyNote: optionalTrimmedString,
  foodAllergyNote: optionalTrimmedString,
  airAllergyNote: optionalTrimmedString,
  otherAllergyNote: optionalTrimmedString,
  medicationHistoryNote: optionalTrimmedString,
  psychosocialSpiritualNote: optionalTrimmedString,
  physicalExamNote: optionalTrimmedString,
  dentalExamNote: optionalTrimmedString,
  bodyFindingNote: optionalTrimmedString,
  consciousnessLevel: optionalTrimmedString,
  heightCm: optionalPositiveNumber,
  weightKg: optionalPositiveNumber,
  systolic: optionalPositiveNumber,
  diastolic: optionalPositiveNumber,
  heartRate: optionalPositiveNumber,
  respiratoryRate: optionalPositiveNumber,
  temperatureCelsius: optionalPositiveNumber,
  spo2: optionalPositiveNumber,
  triageLevel: z.enum(TRIAGE_LEVEL_VALUES).optional().default("non_urgent"),
  vitalAlertLevel: z.enum(VITAL_ALERT_LEVEL_VALUES).optional().default("normal"),
  handoverNoteManual: optionalTrimmedString,
  dispositionStatus: z.enum(DISPOSITION_STATUS_VALUES).optional(),
});

export const assessmentCoreSchema = assessmentBaseSchema.superRefine((value, ctx) => {
  if (value.chiefComplaint.length === 0 && value.intakeNote.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["chiefComplaint"],
      message: "Keluhan utama atau catatan intake wajib diisi",
    });
  }
});

export const assessmentFinalizeSchema = assessmentBaseSchema.superRefine((value, ctx) => {
  if (value.chiefComplaint.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["chiefComplaint"],
      message: "Keluhan utama wajib diisi",
    });
  }

  if (value.consciousnessLevel.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["consciousnessLevel"],
      message: "Kesadaran wajib diisi",
    });
  }

  for (const field of [
    "systolic",
    "diastolic",
    "heartRate",
    "respiratoryRate",
    "temperatureCelsius",
    "spo2",
  ] as const) {
    if (typeof value[field] !== "number") {
      ctx.addIssue({
        code: "custom",
        path: [field],
        message: "Tanda vital wajib diisi",
      });
    }
  }

  if (!value.dispositionStatus) {
    ctx.addIssue({
      code: "custom",
      path: ["dispositionStatus"],
      message: "Disposisi wajib diisi",
    });
  }

  if (value.handoverNoteManual.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["handoverNoteManual"],
      message: "Catatan handover wajib diisi",
    });
  }

  if (value.painScore > 0 && value.painSummary.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["painSummary"],
      message: "Detail nyeri wajib diisi saat skor nyeri di atas nol",
    });
  }

  if (
    value.initialAllergyFlag &&
    !hasAnyValue([
      value.drugAllergyNote,
      value.foodAllergyNote,
      value.airAllergyNote,
      value.otherAllergyNote,
    ])
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["drugAllergyNote"],
      message: "Isi minimal satu detail alergi",
    });
  }

  if (value.communicationBarrierFlag && value.communicationBarrierNote.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["communicationBarrierNote"],
      message: "Catatan hambatan komunikasi wajib diisi",
    });
  }

  if (value.functionalDisabilityFlag && value.functionalDisabilityNote.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["functionalDisabilityNote"],
      message: "Catatan disabilitas fungsional wajib diisi",
    });
  }

  if (value.nutritionRiskFlag && value.nutritionDetailNote.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["nutritionDetailNote"],
      message: "Catatan nutrisi wajib diisi",
    });
  }

  if (
    value.fallRiskLevel === "tinggi" &&
    value.fallMitigationNote.length === 0 &&
    value.needsCompanionFlag === false
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["fallMitigationNote"],
      message: "Risiko jatuh tinggi butuh mitigasi atau penanda pendamping",
    });
  }

  if (value.patientAgeGroup === "pediatric") {
    for (const field of [
      "historySourceType",
      "historySourceName",
      "historySourceRelationship",
    ] as const) {
      if (value[field].length === 0) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: "Riwayat caregiver wajib diisi untuk pasien pediatrik",
        });
      }
    }
  }
});

export const assessmentFastHandoverSchema = assessmentBaseSchema.superRefine((value, ctx) => {
  if (!isUrgentTriage(value.triageLevel) && value.vitalAlertLevel !== "kritis") {
    ctx.addIssue({
      code: "custom",
      path: ["triageLevel"],
      message: "Fast handover hanya untuk konteks urgent",
    });
  }

  for (const field of [
    "chiefComplaint",
    "consciousnessLevel",
    "handoverNoteManual",
  ] as const) {
    if (value[field].length === 0) {
      ctx.addIssue({
        code: "custom",
        path: [field],
        message: "Field urgent wajib diisi",
      });
    }
  }

  for (const field of [
    "systolic",
    "diastolic",
    "heartRate",
    "respiratoryRate",
    "temperatureCelsius",
    "spo2",
  ] as const) {
    if (typeof value[field] !== "number") {
      ctx.addIssue({
        code: "custom",
        path: [field],
        message: "Tanda vital urgent wajib diisi",
      });
    }
  }

  if (!value.dispositionStatus) {
    ctx.addIssue({
      code: "custom",
      path: ["dispositionStatus"],
      message: "Disposisi urgent wajib diisi",
    });
  }
});

export type AssessmentCoreInput = z.infer<typeof assessmentCoreSchema>;
export type AssessmentFinalizeInput = z.infer<typeof assessmentFinalizeSchema>;
export type AssessmentFastHandoverInput = z.infer<typeof assessmentFastHandoverSchema>;
export type AssessmentRuleContext = Partial<AssessmentFinalizeInput>;
export type AssessmentFormState = ReturnType<typeof normalizeAssessmentInput>;

export function createEmptyAssessmentDraft() {
  return {
    visitId: "",
    assessedByUserId: "",
    assessmentAt: "",
    status: "draft" as const,
    visitType: "general" as const,
    patientAgeGroup: "adult" as const,
    chiefComplaint: "",
    intakeNote: "",
    additionalComplaints: "",
    initialAllergyFlag: false,
    functionalDisabilityFlag: false,
    functionalDisabilityNote: "",
    communicationBarrierFlag: false,
    communicationBarrierNote: "",
    nutritionRiskFlag: false,
    nutritionDetailNote: "",
    painScore: 0,
    painSummary: "",
    fallRiskLevel: "rendah" as const,
    fallMitigationNote: "",
    needsCompanionFlag: false,
    historySourceType: "",
    historySourceName: "",
    historySourceRelationship: "",
    drugAllergyNote: "",
    foodAllergyNote: "",
    airAllergyNote: "",
    otherAllergyNote: "",
    medicationHistoryNote: "",
    psychosocialSpiritualNote: "",
    physicalExamNote: "",
    dentalExamNote: "",
    bodyFindingNote: "",
    consciousnessLevel: "",
    heightCm: undefined,
    weightKg: undefined,
    systolic: undefined,
    diastolic: undefined,
    heartRate: undefined,
    respiratoryRate: undefined,
    temperatureCelsius: undefined,
    spo2: undefined,
    triageLevel: "non_urgent" as const,
    vitalAlertLevel: "normal" as const,
    handoverNoteManual: "",
    dispositionStatus: undefined,
  };
}

export function normalizeAssessmentInput(input: Partial<AssessmentFinalizeInput>) {
  const draft = createEmptyAssessmentDraft();

  return {
    ...draft,
    ...input,
    visitId: normalizeString(input.visitId ?? draft.visitId),
    assessedByUserId: normalizeString(input.assessedByUserId ?? draft.assessedByUserId),
    assessmentAt: normalizeString(input.assessmentAt ?? draft.assessmentAt),
    chiefComplaint: normalizeString(input.chiefComplaint ?? draft.chiefComplaint),
    intakeNote: normalizeString(input.intakeNote ?? draft.intakeNote),
    additionalComplaints: normalizeString(input.additionalComplaints ?? draft.additionalComplaints),
    functionalDisabilityNote: normalizeString(
      input.functionalDisabilityNote ?? draft.functionalDisabilityNote,
    ),
    communicationBarrierNote: normalizeString(
      input.communicationBarrierNote ?? draft.communicationBarrierNote,
    ),
    nutritionDetailNote: normalizeString(input.nutritionDetailNote ?? draft.nutritionDetailNote),
    painSummary: normalizeString(input.painSummary ?? draft.painSummary),
    fallMitigationNote: normalizeString(input.fallMitigationNote ?? draft.fallMitigationNote),
    historySourceType: normalizeString(input.historySourceType ?? draft.historySourceType),
    historySourceName: normalizeString(input.historySourceName ?? draft.historySourceName),
    historySourceRelationship: normalizeString(
      input.historySourceRelationship ?? draft.historySourceRelationship,
    ),
    drugAllergyNote: normalizeString(input.drugAllergyNote ?? draft.drugAllergyNote),
    foodAllergyNote: normalizeString(input.foodAllergyNote ?? draft.foodAllergyNote),
    airAllergyNote: normalizeString(input.airAllergyNote ?? draft.airAllergyNote),
    otherAllergyNote: normalizeString(input.otherAllergyNote ?? draft.otherAllergyNote),
    medicationHistoryNote: normalizeString(
      input.medicationHistoryNote ?? draft.medicationHistoryNote,
    ),
    psychosocialSpiritualNote: normalizeString(
      input.psychosocialSpiritualNote ?? draft.psychosocialSpiritualNote,
    ),
    physicalExamNote: normalizeString(input.physicalExamNote ?? draft.physicalExamNote),
    dentalExamNote: normalizeString(input.dentalExamNote ?? draft.dentalExamNote),
    bodyFindingNote: normalizeString(input.bodyFindingNote ?? draft.bodyFindingNote),
    consciousnessLevel: normalizeString(input.consciousnessLevel ?? draft.consciousnessLevel),
    handoverNoteManual: normalizeString(input.handoverNoteManual ?? draft.handoverNoteManual),
  };
}

function hasAnyValue(values: string[]) {
  return values.some((value) => value.trim().length > 0);
}

function isUrgentTriage(value: string | undefined) {
  return value === "gawat" || value === "darurat";
}

function normalizeString(value: string) {
  return trimmedString.parse(value);
}
