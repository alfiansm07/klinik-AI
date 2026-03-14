import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { patient } from "./patient";
import { clinic } from "./tenant";
import { visit } from "./visit";

export const assessmentStatusEnum = pgEnum("assessment_status", ["draft", "finalized"]);
export const assessmentDispositionEnum = pgEnum("assessment_disposition", [
  "ready_for_doctor",
  "priority_handover",
  "observation",
]);
export const triageLevelEnum = pgEnum("triage_level", [
  "tidak_gawat",
  "gawat",
  "darurat",
  "meninggal",
]);
export const vitalAlertLevelEnum = pgEnum("vital_alert_level", [
  "normal",
  "perlu_perhatian",
  "abnormal",
  "kritis",
]);
export const clinicAssessmentTypeEnum = pgEnum("clinic_assessment_type", [
  "general",
  "dental",
]);

export const visitAssessment = pgTable(
  "visit_assessment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    visitId: text("visit_id")
      .notNull()
      .references(() => visit.id, { onDelete: "cascade" }),
    patientId: text("patient_id")
      .notNull()
      .references(() => patient.id, { onDelete: "restrict" }),
    assessedByUserId: text("assessed_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    completedByUserId: text("completed_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    assessmentType: clinicAssessmentTypeEnum("assessment_type").default("general").notNull(),
    assessmentAt: timestamp("assessment_at").defaultNow().notNull(),
    status: assessmentStatusEnum("status").default("draft").notNull(),
    chiefComplaint: text("chief_complaint"),
    additionalComplaints: text("additional_complaints"),
    illnessDurationYear: integer("illness_duration_year"),
    illnessDurationMonth: integer("illness_duration_month"),
    illnessDurationDay: integer("illness_duration_day"),
    registrationNoteSnapshot: text("registration_note_snapshot"),
    initialAllergyFlag: boolean("initial_allergy_flag"),
    intakeNote: text("intake_note"),
    specialAttentionFlag: boolean("special_attention_flag").default(false).notNull(),
    handoverSummaryAuto: text("handover_summary_auto"),
    handoverNoteManual: text("handover_note_manual"),
    doctorAttentionFlags: jsonb("doctor_attention_flags").$type<string[]>().default([]).notNull(),
    disposition: assessmentDispositionEnum("disposition"),
    requiresTransferAssistanceFlag: boolean("requires_transfer_assistance_flag")
      .default(false)
      .notNull(),
    requiresImmediateReviewFlag: boolean("requires_immediate_review_flag")
      .default(false)
      .notNull(),
    assessmentCompletionStatus: text("assessment_completion_status"),
    adaptiveBlocksTriggered: jsonb("adaptive_blocks_triggered")
      .$type<string[]>()
      .default([])
      .notNull(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    uniqueIndex("visit_assessment_clinic_visit_idx").on(table.clinicId, table.visitId),
    uniqueIndex("visit_assessment_clinic_id_idx").on(table.clinicId, table.id),
    index("visit_assessment_clinic_patient_idx").on(table.clinicId, table.patientId),
    index("visit_assessment_clinic_status_idx").on(table.clinicId, table.status),
    index("visit_assessment_clinic_disposition_idx").on(table.clinicId, table.disposition),
    foreignKey({
      columns: [table.clinicId, table.visitId, table.patientId],
      foreignColumns: [visit.clinicId, visit.id, visit.patientId],
      name: "visit_assessment_clinic_visit_patient_fk",
    }),
    check("visit_assessment_duration_year_check", sql`${table.illnessDurationYear} >= 0`),
    check(
      "visit_assessment_duration_month_check",
      sql`${table.illnessDurationMonth} between 0 and 11`,
    ),
    check(
      "visit_assessment_duration_day_check",
      sql`${table.illnessDurationDay} between 0 and 31`,
    ),
  ],
);

export const visitAssessmentRisk = pgTable(
  "visit_assessment_risk",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => visitAssessment.id, { onDelete: "cascade" }),
    functionalDisabilityFlag: boolean("functional_disability_flag"),
    functionalDisabilityNote: text("functional_disability_note"),
    ambulationStatus: text("ambulation_status"),
    communicationBarrierFlag: boolean("communication_barrier_flag"),
    communicationBarrierNote: text("communication_barrier_note"),
    fallUnsteadyFlag: boolean("fall_unsteady_flag"),
    fallAssistiveDeviceFlag: boolean("fall_assistive_device_flag"),
    fallSupportWhileSittingFlag: boolean("fall_support_while_sitting_flag"),
    fallRiskScore: integer("fall_risk_score"),
    fallRiskLevel: text("fall_risk_level"),
    fallMitigationNote: text("fall_mitigation_note"),
    painScore: integer("pain_score"),
    painRecurrenceTiming: text("pain_recurrence_timing"),
    painCharacter: text("pain_character"),
    painSummary: text("pain_summary"),
    nutritionWeightLossScore: integer("nutrition_weight_loss_score"),
    nutritionAppetiteLossFlag: boolean("nutrition_appetite_loss_flag"),
    nutritionAppetiteScore: integer("nutrition_appetite_score"),
    nutritionSpecialDiagnosisFlag: boolean("nutrition_special_diagnosis_flag"),
    nutritionSpecialDiagnosisName: text("nutrition_special_diagnosis_name"),
    nutritionDetailNote: text("nutrition_detail_note"),
    nutritionTotalScore: integer("nutrition_total_score"),
    nutritionRiskLevel: text("nutrition_risk_level"),
    elderlyFlag: boolean("elderly_flag"),
    mobilityLimitationFlag: boolean("mobility_limitation_flag"),
    needsCompanionFlag: boolean("needs_companion_flag"),
    riskScreeningNote: text("risk_screening_note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    uniqueIndex("visit_assessment_risk_clinic_assessment_idx").on(
      table.clinicId,
      table.assessmentId,
    ),
    foreignKey({
      columns: [table.clinicId, table.assessmentId],
      foreignColumns: [visitAssessment.clinicId, visitAssessment.id],
      name: "visit_assessment_risk_clinic_assessment_fk",
    }),
    check("visit_assessment_risk_pain_score_check", sql`${table.painScore} between 0 and 10`),
    check("visit_assessment_risk_fall_score_check", sql`${table.fallRiskScore} >= 0`),
    check(
      "visit_assessment_risk_nutrition_weight_loss_check",
      sql`${table.nutritionWeightLossScore} >= 0`,
    ),
    check(
      "visit_assessment_risk_nutrition_appetite_check",
      sql`${table.nutritionAppetiteScore} >= 0`,
    ),
    check(
      "visit_assessment_risk_nutrition_total_check",
      sql`${table.nutritionTotalScore} >= 0`,
    ),
  ],
);

export const visitVitalSign = pgTable(
  "visit_vital_sign",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => visitAssessment.id, { onDelete: "cascade" }),
    consciousnessLevel: text("consciousness_level"),
    bloodPressureSite: text("blood_pressure_site"),
    systolic: integer("systolic"),
    diastolic: integer("diastolic"),
    heartRate: integer("heart_rate"),
    respiratoryRate: integer("respiratory_rate"),
    spo2: integer("spo2"),
    temperatureCelsius: numeric("temperature_celsius", { precision: 4, scale: 1 }),
    cardiacRhythm: text("cardiac_rhythm"),
    waistCircumferenceCm: numeric("waist_circumference_cm", { precision: 5, scale: 2 }),
    heightCm: numeric("height_cm", { precision: 5, scale: 2 }),
    heightMeasurementMethod: text("height_measurement_method"),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
    bmi: numeric("bmi", { precision: 5, scale: 2 }),
    bmiCategory: text("bmi_category"),
    triageLevel: triageLevelEnum("triage_level"),
    vitalAlertLevel: vitalAlertLevelEnum("vital_alert_level"),
    vitalNote: text("vital_note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    uniqueIndex("visit_vital_sign_clinic_assessment_idx").on(
      table.clinicId,
      table.assessmentId,
    ),
    foreignKey({
      columns: [table.clinicId, table.assessmentId],
      foreignColumns: [visitAssessment.clinicId, visitAssessment.id],
      name: "visit_vital_sign_clinic_assessment_fk",
    }),
    check("visit_vital_sign_systolic_check", sql`${table.systolic} >= 0`),
    check("visit_vital_sign_diastolic_check", sql`${table.diastolic} >= 0`),
    check("visit_vital_sign_heart_rate_check", sql`${table.heartRate} >= 0`),
    check("visit_vital_sign_respiratory_rate_check", sql`${table.respiratoryRate} >= 0`),
    check("visit_vital_sign_spo2_check", sql`${table.spo2} between 0 and 100`),
    check(
      "visit_vital_sign_temperature_check",
      sql`${table.temperatureCelsius} >= 0`,
    ),
    check(
      "visit_vital_sign_waist_circumference_check",
      sql`${table.waistCircumferenceCm} >= 0`,
    ),
    check("visit_vital_sign_height_check", sql`${table.heightCm} >= 0`),
    check("visit_vital_sign_weight_check", sql`${table.weightKg} >= 0`),
    check("visit_vital_sign_bmi_check", sql`${table.bmi} >= 0`),
  ],
);

export const visitAssessmentExam = pgTable(
  "visit_assessment_exam",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => visitAssessment.id, { onDelete: "cascade" }),
    historyPresentIllness: text("history_present_illness"),
    pastMedicalHistory: text("past_medical_history"),
    familyMedicalHistory: text("family_medical_history"),
    historySourceType: text("history_source_type"),
    historySourceName: text("history_source_name"),
    historySourceRelationship: text("history_source_relationship"),
    psychosocialSpiritualNote: text("psychosocial_spiritual_note"),
    additionalClinicalNote: text("additional_clinical_note"),
    allergyNoneFlag: boolean("allergy_none_flag"),
    drugAllergyNote: text("drug_allergy_note"),
    foodAllergyNote: text("food_allergy_note"),
    airAllergyNote: text("air_allergy_note"),
    otherAllergyNote: text("other_allergy_note"),
    allergySeverityNote: text("allergy_severity_note"),
    allergyVerificationNote: text("allergy_verification_note"),
    currentSteroidMedication: text("current_steroid_medication"),
    currentAnticoagulantMedication: text("current_anticoagulant_medication"),
    currentMucolyticMedication: text("current_mucolytic_medication"),
    currentChronicDiseaseMedication: text("current_chronic_disease_medication"),
    currentOtherMedication: text("current_other_medication"),
    frequentlyUsedMedication: text("frequently_used_medication"),
    medicationHistoryNote: text("medication_history_note"),
    initialCarePlan: text("initial_care_plan"),
    nursingActionNote: text("nursing_action_note"),
    observationNote: text("observation_note"),
    smokingFlag: boolean("smoking_flag"),
    alcoholFlag: boolean("alcohol_flag"),
    lowFruitVegetableFlag: boolean("low_fruit_vegetable_flag"),
    dentalExtraoralSwellingFlag: boolean("dental_extraoral_swelling_flag"),
    dentalExtraoralConsistency: text("dental_extraoral_consistency"),
    dentalExtraoralSkinColor: text("dental_extraoral_skin_color"),
    dentalExtraoralSkinTemperature: text("dental_extraoral_skin_temperature"),
    dentalIntraoralToothMobilityFlag: boolean("dental_intraoral_tooth_mobility_flag"),
    dentalIntraoralGingivaColor: text("dental_intraoral_gingiva_color"),
    dentalIntraoralCariesTooth: text("dental_intraoral_caries_tooth"),
    dentalIntraoralSwellingFlag: boolean("dental_intraoral_swelling_flag"),
    dentalIntraoralPercussionPainFlag: boolean("dental_intraoral_percussion_pain_flag"),
    dentalIntraoralPressurePainFlag: boolean("dental_intraoral_pressure_pain_flag"),
    dentalIntraoralPalpationPainFlag: boolean("dental_intraoral_palpation_pain_flag"),
    dentalCariesStatus: text("dental_caries_status"),
    dentalExamNote: text("dental_exam_note"),
    examSkinFlag: boolean("exam_skin_flag"),
    examNailsFlag: boolean("exam_nails_flag"),
    examHeadFlag: boolean("exam_head_flag"),
    examEyesFlag: boolean("exam_eyes_flag"),
    examEarsFlag: boolean("exam_ears_flag"),
    examNoseSinusFlag: boolean("exam_nose_sinus_flag"),
    examMouthLipsFlag: boolean("exam_mouth_lips_flag"),
    examNeckFlag: boolean("exam_neck_flag"),
    examChestBackFlag: boolean("exam_chest_back_flag"),
    examCardiovascularFlag: boolean("exam_cardiovascular_flag"),
    examAbdomenFlag: boolean("exam_abdomen_flag"),
    examUpperExtremitiesFlag: boolean("exam_upper_extremities_flag"),
    examLowerExtremitiesFlag: boolean("exam_lower_extremities_flag"),
    examMaleGenitaliaFlag: boolean("exam_male_genitalia_flag"),
    physicalExamNote: text("physical_exam_note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    uniqueIndex("visit_assessment_exam_clinic_assessment_idx").on(
      table.clinicId,
      table.assessmentId,
    ),
    foreignKey({
      columns: [table.clinicId, table.assessmentId],
      foreignColumns: [visitAssessment.clinicId, visitAssessment.id],
      name: "visit_assessment_exam_clinic_assessment_fk",
    }),
  ],
);

export const visitBodyFinding = pgTable(
  "visit_body_finding",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => visitAssessment.id, { onDelete: "cascade" }),
    bodyPartCode: text("body_part_code"),
    bodyPartLabel: text("body_part_label").notNull(),
    findingNote: text("finding_note"),
    findingPainFlag: boolean("finding_pain_flag"),
    findingSwellingFlag: boolean("finding_swelling_flag"),
    findingSide: text("finding_side"),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("visit_body_finding_clinic_assessment_idx").on(table.clinicId, table.assessmentId),
    index("visit_body_finding_clinic_body_part_idx").on(table.clinicId, table.bodyPartCode),
    foreignKey({
      columns: [table.clinicId, table.assessmentId],
      foreignColumns: [visitAssessment.clinicId, visitAssessment.id],
      name: "visit_body_finding_clinic_assessment_fk",
    }),
    check("visit_body_finding_display_order_check", sql`${table.displayOrder} >= 0`),
  ],
);

// Relations defined in ./relations.ts to avoid circular imports
