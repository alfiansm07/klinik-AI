"use server";

import { db } from "@klinik-AI/db";
import {
  visitAssessment,
  visitAssessmentExam,
  visitAssessmentRisk,
  visitBodyFinding,
  visitVitalSign,
} from "@klinik-AI/db/schema/assessment";
import { guarantor, room } from "@klinik-AI/db/schema/master";
import { patient } from "@klinik-AI/db/schema/patient";
import { visit } from "@klinik-AI/db/schema/visit";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getPageAuthContext } from "@/lib/auth-helpers";

import { PATIENT_GENDER_LABELS } from "../../pendaftaran/pasien/patient-shared";
import {
  assessmentFastHandoverSchema,
  assessmentFinalizeSchema,
  assessmentPainLabelMap,
  createEmptyAssessmentDraft,
  normalizeAssessmentInput,
  type AssessmentFinalizeInput,
} from "./assessment-shared";
import {
  formatAssessmentStatusSummary,
  getAssessmentWorklistStatusSurface,
  resolveAssessmentWorklistStatus,
  type AssessmentWorklistStatus,
} from "./worklist-shared";

type AssessmentActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  assessmentId?: string;
  visitStatus?: AssessmentWorklistStatus;
};

type AssessmentDraftInput = Partial<AssessmentFinalizeInput> & {
  visitId: string;
};

type AssessmentFormState = ReturnType<typeof normalizeAssessmentInput>;
type AssessmentDisposition = "ready_for_doctor" | "priority_handover" | "observation";
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type AssessmentWorklistRow = {
  visitId: string;
  registrationNumber: string;
  registrationDateTime: string;
  visitDate: string;
  patientName: string;
  medicalRecordNumber: string;
  genderLabel: string;
  ageLabel: string;
  roomLabel: string;
  guarantorLabel: string;
  status: AssessmentWorklistStatus;
  statusLabel: string;
  statusSummary: string;
  alertBadges: string[];
  ctaLabel: "Mulai Skrining" | "Lanjutkan Skrining" | "Lihat Ringkasan";
  rowClassName: string;
  badgeClassName: string;
};

export type AssessmentVisitDetail = {
  visitId: string;
  registrationNumber: string;
  visitDate: string;
  roomLabel: string;
  guarantorLabel: string;
  status: AssessmentWorklistStatus;
  statusLabel: string;
  statusSummary: string;
  patient: {
    id: string;
    name: string;
    medicalRecordNumber: string;
    genderLabel: string;
    ageLabel: string;
    birthDate: string;
    address: string;
  };
  context: {
    visitType: "general" | "dental";
    patientAgeGroup: "pediatric" | "adult" | "elderly";
  };
  draft: AssessmentFormState;
};

const ASSESSMENT_QUEUE_STATUSES: AssessmentWorklistStatus[] = [
  "menunggu_asesmen",
  "draft",
  "ready_for_doctor",
  "priority_handover",
  "observation",
];

const DOCTOR_ATTENTION_LABELS: Record<string, string> = {
  "urgent-triage": "Triase urgent",
  "critical-vitals": "Vital kritis",
  allergy: "Alergi",
  "high-fall-risk": "Risiko jatuh tinggi",
  "communication-barrier": "Hambatan komunikasi",
  "nutrition-risk": "Risiko nutrisi",
  "severe-pain": "Nyeri berat",
};

export async function getAssessmentWorklist(): Promise<AssessmentWorklistRow[]> {
  const context = await getPageAuthContext("care");
  const membership = context.activeMembership;

  if (!membership) {
    return [];
  }

  const visitRows = await db
    .select({
      id: visit.id,
      registrationNumber: visit.registrationNumber,
      registeredAt: visit.registeredAt,
      visitDate: visit.visitDate,
      status: visit.status,
      patientName: patient.name,
      medicalRecordNumber: patient.medicalRecordNumber,
      patientGender: patient.gender,
      patientDateOfBirth: patient.dateOfBirth,
      roomName: room.name,
      guarantorName: guarantor.name,
    })
    .from(visit)
    .innerJoin(patient, and(eq(visit.patientId, patient.id), eq(patient.clinicId, membership.clinicId)))
    .innerJoin(room, and(eq(visit.roomId, room.id), eq(room.clinicId, membership.clinicId)))
    .innerJoin(
      guarantor,
      and(eq(visit.guarantorId, guarantor.id), eq(guarantor.clinicId, membership.clinicId)),
    )
    .where(
      and(
        eq(visit.clinicId, membership.clinicId),
        inArray(visit.status, ASSESSMENT_QUEUE_STATUSES),
        isNull(visit.deletedAt),
      ),
    )
    .orderBy(desc(visit.registeredAt));

  if (visitRows.length === 0) {
    return [];
  }

  const assessmentRows = await db
    .select({
      visitId: visitAssessment.visitId,
      assessmentStatus: visitAssessment.status,
      disposition: visitAssessment.disposition,
      specialAttentionFlag: visitAssessment.specialAttentionFlag,
      requiresImmediateReviewFlag: visitAssessment.requiresImmediateReviewFlag,
      doctorAttentionFlags: visitAssessment.doctorAttentionFlags,
      handoverSummaryAuto: visitAssessment.handoverSummaryAuto,
      handoverNoteManual: visitAssessment.handoverNoteManual,
      updatedAt: visitAssessment.updatedAt,
    })
    .from(visitAssessment)
    .where(
      and(
        eq(visitAssessment.clinicId, membership.clinicId),
        inArray(
          visitAssessment.visitId,
          visitRows.map((row) => row.id),
        ),
        isNull(visitAssessment.deletedAt),
      ),
    );

  const assessmentMap = new Map(assessmentRows.map((row) => [row.visitId, row]));

  return visitRows.map((row) => {
    const assessmentRow = assessmentMap.get(row.id);
    const status = resolveAssessmentWorklistStatus({
      visitStatus: row.status,
      assessmentStatus: assessmentRow?.assessmentStatus,
      disposition: assessmentRow?.disposition,
    });
    const surface = getAssessmentWorklistStatusSurface(status);
    const summary = formatAssessmentStatusSummary(
      status,
      assessmentRow?.handoverNoteManual ?? assessmentRow?.handoverSummaryAuto,
    );

    return {
      visitId: row.id,
      registrationNumber: row.registrationNumber,
      registrationDateTime: formatDateTime(row.registeredAt),
      visitDate: row.visitDate,
      patientName: row.patientName.toUpperCase(),
      medicalRecordNumber: row.medicalRecordNumber,
      genderLabel: PATIENT_GENDER_LABELS[row.patientGender],
      ageLabel: formatPatientAgeLong(row.patientDateOfBirth),
      roomLabel: row.roomName,
      guarantorLabel: row.guarantorName,
      status,
      statusLabel: surface.label,
      statusSummary: summary,
      alertBadges: [
        assessmentRow?.requiresImmediateReviewFlag ? "Review segera" : null,
        ...(assessmentRow?.doctorAttentionFlags ?? []).slice(0, 2).map((flag) => DOCTOR_ATTENTION_LABELS[flag] ?? flag),
        assessmentRow?.specialAttentionFlag && (assessmentRow?.doctorAttentionFlags?.length ?? 0) === 0
          ? "Perlu perhatian"
          : null,
      ].filter((value): value is string => Boolean(value)),
      ctaLabel: surface.ctaLabel,
      rowClassName: surface.row,
      badgeClassName: surface.badge,
    };
  });
}

export async function getAssessmentVisitDetail(
  visitId: string,
): Promise<AssessmentVisitDetail | null> {
  const context = await getPageAuthContext("care");
  const membership = context.activeMembership;

  if (!membership) {
    return null;
  }

  return getAssessmentVisitDetailForClinic({
    clinicId: membership.clinicId,
    currentUserId: context.session.user.id,
    visitId,
  });
}

export async function getAssessmentVisitDetailForClinic({
  visitId,
  clinicId,
  currentUserId,
}: {
  visitId: string;
  clinicId: string;
  currentUserId: string;
}): Promise<AssessmentVisitDetail | null> {

  const [visitRow] = await db
    .select({
      id: visit.id,
      registrationNumber: visit.registrationNumber,
      visitDate: visit.visitDate,
      visitStatus: visit.status,
      roomName: room.name,
      guarantorName: guarantor.name,
      patientId: patient.id,
      patientName: patient.name,
      medicalRecordNumber: patient.medicalRecordNumber,
      patientGender: patient.gender,
      patientDateOfBirth: patient.dateOfBirth,
      patientAddress: patient.address,
      heightCm: visit.heightCm,
      weightKg: visit.weightKg,
      chiefComplaint: visit.chiefComplaint,
      allergyStatus: visit.allergyStatus,
      allergyNote: visit.allergyNote,
    })
    .from(visit)
    .innerJoin(patient, and(eq(visit.patientId, patient.id), eq(patient.clinicId, clinicId)))
    .innerJoin(room, and(eq(visit.roomId, room.id), eq(room.clinicId, clinicId)))
    .innerJoin(
      guarantor,
      and(eq(visit.guarantorId, guarantor.id), eq(guarantor.clinicId, clinicId)),
    )
    .where(and(eq(visit.id, visitId), eq(visit.clinicId, clinicId), isNull(visit.deletedAt)));

  if (!visitRow) {
    return null;
  }

  const [assessmentRow] = await db
    .select({
      id: visitAssessment.id,
      assessedByUserId: visitAssessment.assessedByUserId,
      assessmentAt: visitAssessment.assessmentAt,
      assessmentType: visitAssessment.assessmentType,
      assessmentStatus: visitAssessment.status,
      chiefComplaint: visitAssessment.chiefComplaint,
      additionalComplaints: visitAssessment.additionalComplaints,
      initialAllergyFlag: visitAssessment.initialAllergyFlag,
      intakeNote: visitAssessment.intakeNote,
      handoverNoteManual: visitAssessment.handoverNoteManual,
      handoverSummaryAuto: visitAssessment.handoverSummaryAuto,
      disposition: visitAssessment.disposition,
      functionalDisabilityFlag: visitAssessmentRisk.functionalDisabilityFlag,
      functionalDisabilityNote: visitAssessmentRisk.functionalDisabilityNote,
      communicationBarrierFlag: visitAssessmentRisk.communicationBarrierFlag,
      communicationBarrierNote: visitAssessmentRisk.communicationBarrierNote,
      painScore: visitAssessmentRisk.painScore,
      painSummary: visitAssessmentRisk.painSummary,
      fallRiskLevel: visitAssessmentRisk.fallRiskLevel,
      fallMitigationNote: visitAssessmentRisk.fallMitigationNote,
      nutritionRiskLevel: visitAssessmentRisk.nutritionRiskLevel,
      nutritionDetailNote: visitAssessmentRisk.nutritionDetailNote,
      needsCompanionFlag: visitAssessmentRisk.needsCompanionFlag,
      historySourceType: visitAssessmentExam.historySourceType,
      historySourceName: visitAssessmentExam.historySourceName,
      historySourceRelationship: visitAssessmentExam.historySourceRelationship,
      drugAllergyNote: visitAssessmentExam.drugAllergyNote,
      foodAllergyNote: visitAssessmentExam.foodAllergyNote,
      airAllergyNote: visitAssessmentExam.airAllergyNote,
      otherAllergyNote: visitAssessmentExam.otherAllergyNote,
      medicationHistoryNote: visitAssessmentExam.medicationHistoryNote,
      psychosocialSpiritualNote: visitAssessmentExam.psychosocialSpiritualNote,
      physicalExamNote: visitAssessmentExam.physicalExamNote,
      dentalExamNote: visitAssessmentExam.dentalExamNote,
      consciousnessLevel: visitVitalSign.consciousnessLevel,
      systolic: visitVitalSign.systolic,
      diastolic: visitVitalSign.diastolic,
      heartRate: visitVitalSign.heartRate,
      respiratoryRate: visitVitalSign.respiratoryRate,
      temperatureCelsius: visitVitalSign.temperatureCelsius,
      spo2: visitVitalSign.spo2,
      heightCmVital: visitVitalSign.heightCm,
      weightKgVital: visitVitalSign.weightKg,
      triageLevel: visitVitalSign.triageLevel,
      vitalAlertLevel: visitVitalSign.vitalAlertLevel,
    })
    .from(visitAssessment)
    .leftJoin(visitAssessmentRisk, and(eq(visitAssessmentRisk.assessmentId, visitAssessment.id), eq(visitAssessmentRisk.clinicId, clinicId), isNull(visitAssessmentRisk.deletedAt)))
    .leftJoin(visitAssessmentExam, and(eq(visitAssessmentExam.assessmentId, visitAssessment.id), eq(visitAssessmentExam.clinicId, clinicId), isNull(visitAssessmentExam.deletedAt)))
    .leftJoin(visitVitalSign, and(eq(visitVitalSign.assessmentId, visitAssessment.id), eq(visitVitalSign.clinicId, clinicId), isNull(visitVitalSign.deletedAt)))
    .where(and(eq(visitAssessment.visitId, visitId), eq(visitAssessment.clinicId, clinicId), isNull(visitAssessment.deletedAt)));

  const [bodyFindingRow] = assessmentRow
    ? await db
        .select({
          findingNote: visitBodyFinding.findingNote,
          bodyPartLabel: visitBodyFinding.bodyPartLabel,
        })
        .from(visitBodyFinding)
        .where(
          and(
            eq(visitBodyFinding.assessmentId, assessmentRow.id),
            eq(visitBodyFinding.clinicId, clinicId),
            isNull(visitBodyFinding.deletedAt),
          ),
        )
    : [];

  const contextDefaults = {
    visitType: inferAssessmentType(visitRow.roomName),
    patientAgeGroup: derivePatientAgeGroup(visitRow.patientDateOfBirth),
  } as const;

  const fallbackStatus = resolveAssessmentWorklistStatus({ visitStatus: visitRow.visitStatus });
  const status = resolveAssessmentWorklistStatus({
    visitStatus: visitRow.visitStatus,
    assessmentStatus: assessmentRow?.assessmentStatus,
    disposition: assessmentRow?.disposition,
  });
  const surface = getAssessmentWorklistStatusSurface(status ?? fallbackStatus);

  return {
    visitId: visitRow.id,
    registrationNumber: visitRow.registrationNumber,
    visitDate: visitRow.visitDate,
    roomLabel: visitRow.roomName,
    guarantorLabel: visitRow.guarantorName,
    status,
    statusLabel: surface.label,
    statusSummary: formatAssessmentStatusSummary(
      status,
      assessmentRow?.handoverNoteManual ?? assessmentRow?.handoverSummaryAuto,
    ),
    patient: {
      id: visitRow.patientId,
      name: visitRow.patientName,
      medicalRecordNumber: visitRow.medicalRecordNumber,
      genderLabel: PATIENT_GENDER_LABELS[visitRow.patientGender],
      ageLabel: formatPatientAgeLong(visitRow.patientDateOfBirth),
      birthDate: formatDate(visitRow.patientDateOfBirth),
      address: visitRow.patientAddress ?? "-",
    },
    context: contextDefaults,
    draft: normalizeAssessmentInput({
      ...createEmptyAssessmentDraft(),
      visitId: visitRow.id,
      assessedByUserId: assessmentRow?.assessedByUserId ?? currentUserId,
      assessmentAt: assessmentRow?.assessmentAt?.toISOString() ?? new Date().toISOString(),
      visitType: assessmentRow?.assessmentType ?? contextDefaults.visitType,
      patientAgeGroup: contextDefaults.patientAgeGroup,
      chiefComplaint: assessmentRow?.chiefComplaint ?? visitRow.chiefComplaint ?? "",
      intakeNote: assessmentRow?.intakeNote ?? "",
      additionalComplaints: assessmentRow?.additionalComplaints ?? "",
      initialAllergyFlag:
        assessmentRow?.initialAllergyFlag ?? visitRow.allergyStatus === "ada",
      functionalDisabilityFlag: assessmentRow?.functionalDisabilityFlag ?? false,
      functionalDisabilityNote: assessmentRow?.functionalDisabilityNote ?? "",
      communicationBarrierFlag: assessmentRow?.communicationBarrierFlag ?? false,
      communicationBarrierNote: assessmentRow?.communicationBarrierNote ?? "",
      nutritionRiskFlag: assessmentRow?.nutritionRiskLevel === "berisiko",
      nutritionDetailNote: assessmentRow?.nutritionDetailNote ?? "",
      painScore: assessmentRow?.painScore ?? 0,
      painSummary: assessmentRow?.painSummary ?? "",
      fallRiskLevel: mapStoredFallRiskLevel(assessmentRow?.fallRiskLevel),
      fallMitigationNote: assessmentRow?.fallMitigationNote ?? "",
      needsCompanionFlag: assessmentRow?.needsCompanionFlag ?? false,
      historySourceType: assessmentRow?.historySourceType ?? "",
      historySourceName: assessmentRow?.historySourceName ?? "",
      historySourceRelationship: assessmentRow?.historySourceRelationship ?? "",
      drugAllergyNote: assessmentRow?.drugAllergyNote ?? (visitRow.allergyStatus === "ada" ? visitRow.allergyNote ?? "" : ""),
      foodAllergyNote: assessmentRow?.foodAllergyNote ?? "",
      airAllergyNote: assessmentRow?.airAllergyNote ?? "",
      otherAllergyNote: assessmentRow?.otherAllergyNote ?? "",
      medicationHistoryNote: assessmentRow?.medicationHistoryNote ?? "",
      psychosocialSpiritualNote: assessmentRow?.psychosocialSpiritualNote ?? "",
      physicalExamNote: assessmentRow?.physicalExamNote ?? "",
      dentalExamNote: assessmentRow?.dentalExamNote ?? "",
      bodyFindingNote: bodyFindingRow?.findingNote ?? "",
      consciousnessLevel: assessmentRow?.consciousnessLevel ?? "",
      heightCm: parseNumberValue(assessmentRow?.heightCmVital) ?? parseNumberValue(visitRow.heightCm),
      weightKg: parseNumberValue(assessmentRow?.weightKgVital) ?? parseNumberValue(visitRow.weightKg),
      systolic: assessmentRow?.systolic ?? undefined,
      diastolic: assessmentRow?.diastolic ?? undefined,
      heartRate: assessmentRow?.heartRate ?? undefined,
      respiratoryRate: assessmentRow?.respiratoryRate ?? undefined,
      temperatureCelsius: parseNumberValue(assessmentRow?.temperatureCelsius),
      spo2: assessmentRow?.spo2 ?? undefined,
      triageLevel: mapStoredTriageLevel(assessmentRow?.triageLevel),
      vitalAlertLevel: mapStoredVitalAlertLevel(assessmentRow?.vitalAlertLevel),
      handoverNoteManual: assessmentRow?.handoverNoteManual ?? "",
      dispositionStatus: assessmentRow?.disposition ?? undefined,
    }),
  };
}

export async function saveAssessmentDraft(
  input: AssessmentDraftInput,
): Promise<AssessmentActionResult> {
  const context = await getPageAuthContext("care");
  const membership = context.activeMembership;

  if (!membership) {
    return { success: false, error: "Tidak memiliki akses klinik aktif" };
  }

  const visitRow = await getOwnedVisit(membership.clinicId, input.visitId);

  if (!visitRow) {
    return { success: false, error: "Kunjungan tidak ditemukan untuk klinik aktif" };
  }

  const normalized = normalizeAssessmentInput({
    ...input,
    assessedByUserId: context.session.user.id,
    assessmentAt: input.assessmentAt ?? new Date().toISOString(),
    visitType: input.visitType ?? inferAssessmentType(visitRow.roomName),
    patientAgeGroup: input.patientAgeGroup ?? derivePatientAgeGroup(visitRow.patientDateOfBirth),
  });
  const derived = deriveAssessmentMetrics(normalized, {
    heightCm: normalized.heightCm ?? parseNumberValue(visitRow.heightCm),
    weightKg: normalized.weightKg ?? parseNumberValue(visitRow.weightKg),
  });
  const visitStatus: AssessmentWorklistStatus = "draft";

  try {
    const result = await db.transaction(async (tx) => {
      const [assessmentRecord] = await tx
        .insert(visitAssessment)
        .values({
          clinicId: membership.clinicId,
          visitId: visitRow.id,
          patientId: visitRow.patientId,
          assessedByUserId: context.session.user.id,
          assessmentType: normalized.visitType,
          assessmentAt: requireAssessmentDate(normalized.assessmentAt),
          status: "draft",
          chiefComplaint: emptyToNull(normalized.chiefComplaint),
          additionalComplaints: emptyToNull(normalized.additionalComplaints),
          registrationNoteSnapshot: emptyToNull(visitRow.frontOfficeNote),
          initialAllergyFlag: normalized.initialAllergyFlag,
          intakeNote: emptyToNull(normalized.intakeNote),
          specialAttentionFlag: derived.specialAttentionFlag,
          handoverSummaryAuto: derived.handoverSummary,
          handoverNoteManual: emptyToNull(normalized.handoverNoteManual),
          doctorAttentionFlags: derived.doctorAttentionFlags,
          disposition: derived.disposition,
          requiresTransferAssistanceFlag: derived.requiresTransferAssistanceFlag,
          requiresImmediateReviewFlag: derived.requiresImmediateReviewFlag,
          assessmentCompletionStatus: visitStatus,
          adaptiveBlocksTriggered: derived.adaptiveBlocksTriggered,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [visitAssessment.clinicId, visitAssessment.visitId],
          set: {
            assessedByUserId: context.session.user.id,
            assessmentType: normalized.visitType,
            assessmentAt: requireAssessmentDate(normalized.assessmentAt),
            status: "draft",
            chiefComplaint: emptyToNull(normalized.chiefComplaint),
            additionalComplaints: emptyToNull(normalized.additionalComplaints),
            registrationNoteSnapshot: emptyToNull(visitRow.frontOfficeNote),
            initialAllergyFlag: normalized.initialAllergyFlag,
            intakeNote: emptyToNull(normalized.intakeNote),
            specialAttentionFlag: derived.specialAttentionFlag,
            handoverSummaryAuto: derived.handoverSummary,
            handoverNoteManual: emptyToNull(normalized.handoverNoteManual),
            doctorAttentionFlags: derived.doctorAttentionFlags,
            disposition: derived.disposition,
            requiresTransferAssistanceFlag: derived.requiresTransferAssistanceFlag,
            requiresImmediateReviewFlag: derived.requiresImmediateReviewFlag,
            assessmentCompletionStatus: visitStatus,
            adaptiveBlocksTriggered: derived.adaptiveBlocksTriggered,
            updatedAt: new Date(),
          },
        })
        .returning({ id: visitAssessment.id });

      await upsertAssessmentChildren(tx, membership.clinicId, assessmentRecord.id, normalized, derived);

      await tx
        .update(visit)
        .set({
          chiefComplaint: emptyToNull(normalized.chiefComplaint),
          allergyStatus: normalized.initialAllergyFlag ? "ada" : "tidak_ada",
          allergyNote: emptyToNull(firstFilled([
            normalized.drugAllergyNote,
            normalized.foodAllergyNote,
            normalized.airAllergyNote,
            normalized.otherAllergyNote,
          ])),
          status: visitStatus,
          heightCm: toNumericString(derived.heightCm),
          weightKg: toNumericString(derived.weightKg),
          updatedByUserId: context.session.user.id,
        })
        .where(and(eq(visit.id, visitRow.id), eq(visit.clinicId, membership.clinicId)));

      return assessmentRecord.id;
    });

    revalidateAssessmentPaths(visitRow.id);

    return {
      success: true,
      assessmentId: result,
      visitStatus,
    };
  } catch {
    return { success: false, error: "Gagal menyimpan draft asesmen" };
  }
}

export async function finalizeAssessment(
  input: AssessmentDraftInput,
): Promise<AssessmentActionResult> {
  const context = await getPageAuthContext("care");
  const membership = context.activeMembership;

  if (!membership) {
    return { success: false, error: "Tidak memiliki akses klinik aktif" };
  }

  const visitRow = await getOwnedVisit(membership.clinicId, input.visitId);

  if (!visitRow) {
    return { success: false, error: "Kunjungan tidak ditemukan untuk klinik aktif" };
  }

  const normalized = normalizeAssessmentInput({
    ...input,
    assessedByUserId: context.session.user.id,
    assessmentAt: input.assessmentAt ?? new Date().toISOString(),
    visitType: input.visitType ?? inferAssessmentType(visitRow.roomName),
    patientAgeGroup: input.patientAgeGroup ?? derivePatientAgeGroup(visitRow.patientDateOfBirth),
  });
  const derived = deriveAssessmentMetrics(normalized, {
    heightCm: normalized.heightCm ?? parseNumberValue(visitRow.heightCm),
    weightKg: normalized.weightKg ?? parseNumberValue(visitRow.weightKg),
  });
  const validationInput = {
    ...normalized,
    status: derived.requiresImmediateReviewFlag ? "priority_handover" : "finalized",
    dispositionStatus: derived.disposition,
    vitalAlertLevel: derived.sharedVitalAlertLevel,
  } satisfies AssessmentFinalizeInput;
  const validationResult = derived.requiresImmediateReviewFlag
    ? assessmentFastHandoverSchema.safeParse(validationInput)
    : assessmentFinalizeSchema.safeParse(validationInput);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message ?? "Data asesmen tidak valid",
      fieldErrors: Object.fromEntries(
        validationResult.error.issues
          .filter((issue) => issue.path[0])
          .map((issue) => [String(issue.path[0]), issue.message]),
      ),
    };
  }

  const visitStatus: AssessmentWorklistStatus = derived.requiresImmediateReviewFlag
    ? "priority_handover"
    : derived.disposition;

  try {
    const result = await db.transaction(async (tx) => {
      const [assessmentRecord] = await tx
        .insert(visitAssessment)
        .values({
          clinicId: membership.clinicId,
          visitId: visitRow.id,
          patientId: visitRow.patientId,
          assessedByUserId: context.session.user.id,
          completedByUserId: context.session.user.id,
          assessmentType: validationInput.visitType,
          assessmentAt: requireAssessmentDate(validationInput.assessmentAt),
          status: "finalized",
          chiefComplaint: emptyToNull(validationInput.chiefComplaint),
          additionalComplaints: emptyToNull(validationInput.additionalComplaints),
          registrationNoteSnapshot: emptyToNull(visitRow.frontOfficeNote),
          initialAllergyFlag: validationInput.initialAllergyFlag,
          intakeNote: emptyToNull(validationInput.intakeNote),
          specialAttentionFlag: derived.specialAttentionFlag,
          handoverSummaryAuto: derived.handoverSummary,
          handoverNoteManual: emptyToNull(validationInput.handoverNoteManual),
          doctorAttentionFlags: derived.doctorAttentionFlags,
          disposition: derived.disposition,
          requiresTransferAssistanceFlag: derived.requiresTransferAssistanceFlag,
          requiresImmediateReviewFlag: derived.requiresImmediateReviewFlag,
          assessmentCompletionStatus: visitStatus,
          adaptiveBlocksTriggered: derived.adaptiveBlocksTriggered,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [visitAssessment.clinicId, visitAssessment.visitId],
          set: {
            assessedByUserId: context.session.user.id,
            completedByUserId: context.session.user.id,
            assessmentType: validationInput.visitType,
            assessmentAt: requireAssessmentDate(validationInput.assessmentAt),
            status: "finalized",
            chiefComplaint: emptyToNull(validationInput.chiefComplaint),
            additionalComplaints: emptyToNull(validationInput.additionalComplaints),
            registrationNoteSnapshot: emptyToNull(visitRow.frontOfficeNote),
            initialAllergyFlag: validationInput.initialAllergyFlag,
            intakeNote: emptyToNull(validationInput.intakeNote),
            specialAttentionFlag: derived.specialAttentionFlag,
            handoverSummaryAuto: derived.handoverSummary,
            handoverNoteManual: emptyToNull(validationInput.handoverNoteManual),
            doctorAttentionFlags: derived.doctorAttentionFlags,
            disposition: derived.disposition,
            requiresTransferAssistanceFlag: derived.requiresTransferAssistanceFlag,
            requiresImmediateReviewFlag: derived.requiresImmediateReviewFlag,
            assessmentCompletionStatus: visitStatus,
            adaptiveBlocksTriggered: derived.adaptiveBlocksTriggered,
            completedAt: new Date(),
            updatedAt: new Date(),
          },
        })
        .returning({ id: visitAssessment.id });

      await upsertAssessmentChildren(
        tx,
        membership.clinicId,
        assessmentRecord.id,
        validationInput,
        derived,
      );

      await tx
        .update(visit)
        .set({
          chiefComplaint: emptyToNull(validationInput.chiefComplaint),
          allergyStatus: validationInput.initialAllergyFlag ? "ada" : "tidak_ada",
          allergyNote: emptyToNull(firstFilled([
            validationInput.drugAllergyNote,
            validationInput.foodAllergyNote,
            validationInput.airAllergyNote,
            validationInput.otherAllergyNote,
          ])),
          frontOfficeNote: emptyToNull(derived.handoverSummary),
          status: visitStatus,
          heightCm: toNumericString(derived.heightCm),
          weightKg: toNumericString(derived.weightKg),
          updatedByUserId: context.session.user.id,
        })
        .where(and(eq(visit.id, visitRow.id), eq(visit.clinicId, membership.clinicId)));

      return assessmentRecord.id;
    });

    revalidateAssessmentPaths(visitRow.id);

    return {
      success: true,
      assessmentId: result,
      visitStatus,
    };
  } catch {
    return { success: false, error: "Gagal memfinalkan asesmen" };
  }
}

async function getOwnedVisit(clinicId: string, visitId: string) {
  const [row] = await db
    .select({
      id: visit.id,
      patientId: visit.patientId,
      patientDateOfBirth: patient.dateOfBirth,
      roomName: room.name,
      frontOfficeNote: visit.frontOfficeNote,
      heightCm: visit.heightCm,
      weightKg: visit.weightKg,
    })
    .from(visit)
    .innerJoin(patient, and(eq(visit.patientId, patient.id), eq(patient.clinicId, clinicId)))
    .innerJoin(room, and(eq(visit.roomId, room.id), eq(room.clinicId, clinicId)))
    .where(and(eq(visit.id, visitId), eq(visit.clinicId, clinicId), isNull(visit.deletedAt)));

  return row ?? null;
}

async function upsertAssessmentChildren(
  tx: DbTransaction,
  clinicId: string,
  assessmentId: string,
  input: AssessmentFormState,
  derived: ReturnType<typeof deriveAssessmentMetrics>,
) {
  await tx
    .insert(visitAssessmentRisk)
    .values({
      clinicId,
      assessmentId,
      functionalDisabilityFlag: input.functionalDisabilityFlag,
      functionalDisabilityNote: emptyToNull(input.functionalDisabilityNote),
      communicationBarrierFlag: input.communicationBarrierFlag,
      communicationBarrierNote: emptyToNull(input.communicationBarrierNote),
      fallRiskScore: derived.fallRiskScore,
      fallRiskLevel: derived.fallRiskLevel,
      fallMitigationNote: emptyToNull(input.fallMitigationNote),
      painScore: input.painScore,
      painSummary: emptyToNull(input.painSummary || derived.painLabel),
      nutritionAppetiteLossFlag: input.nutritionRiskFlag,
      nutritionTotalScore: derived.nutritionRiskScore,
      nutritionRiskLevel: derived.nutritionRiskLevel,
      nutritionDetailNote: emptyToNull(input.nutritionDetailNote),
      elderlyFlag: input.patientAgeGroup === "elderly",
      needsCompanionFlag: input.needsCompanionFlag,
      riskScreeningNote: emptyToNull(derived.flagSummary),
    })
    .onConflictDoUpdate({
      target: [visitAssessmentRisk.clinicId, visitAssessmentRisk.assessmentId],
      set: {
        functionalDisabilityFlag: input.functionalDisabilityFlag,
        functionalDisabilityNote: emptyToNull(input.functionalDisabilityNote),
        communicationBarrierFlag: input.communicationBarrierFlag,
        communicationBarrierNote: emptyToNull(input.communicationBarrierNote),
        fallRiskScore: derived.fallRiskScore,
        fallRiskLevel: derived.fallRiskLevel,
        fallMitigationNote: emptyToNull(input.fallMitigationNote),
        painScore: input.painScore,
        painSummary: emptyToNull(input.painSummary || derived.painLabel),
        nutritionAppetiteLossFlag: input.nutritionRiskFlag,
        nutritionTotalScore: derived.nutritionRiskScore,
        nutritionRiskLevel: derived.nutritionRiskLevel,
        nutritionDetailNote: emptyToNull(input.nutritionDetailNote),
        elderlyFlag: input.patientAgeGroup === "elderly",
        needsCompanionFlag: input.needsCompanionFlag,
        riskScreeningNote: emptyToNull(derived.flagSummary),
        updatedAt: new Date(),
      },
    });

  await tx
    .insert(visitVitalSign)
    .values({
      clinicId,
      assessmentId,
      consciousnessLevel: emptyToNull(input.consciousnessLevel),
      systolic: input.systolic,
      diastolic: input.diastolic,
      heartRate: input.heartRate,
      respiratoryRate: input.respiratoryRate,
      spo2: input.spo2,
      temperatureCelsius: toNumericString(input.temperatureCelsius),
      heightCm: toNumericString(derived.heightCm),
      weightKg: toNumericString(derived.weightKg),
      bmi: toNumericString(derived.bmi),
      bmiCategory: emptyToNull(derived.bmiCategory),
      triageLevel: mapSharedTriageLevel(input.triageLevel),
      vitalAlertLevel: mapSharedVitalAlertLevel(derived.sharedVitalAlertLevel),
      vitalNote: emptyToNull(derived.vitalSummary),
    })
    .onConflictDoUpdate({
      target: [visitVitalSign.clinicId, visitVitalSign.assessmentId],
      set: {
        consciousnessLevel: emptyToNull(input.consciousnessLevel),
        systolic: input.systolic,
        diastolic: input.diastolic,
        heartRate: input.heartRate,
        respiratoryRate: input.respiratoryRate,
        spo2: input.spo2,
        temperatureCelsius: toNumericString(input.temperatureCelsius),
        heightCm: toNumericString(derived.heightCm),
        weightKg: toNumericString(derived.weightKg),
        bmi: toNumericString(derived.bmi),
        bmiCategory: emptyToNull(derived.bmiCategory),
        triageLevel: mapSharedTriageLevel(input.triageLevel),
        vitalAlertLevel: mapSharedVitalAlertLevel(derived.sharedVitalAlertLevel),
        vitalNote: emptyToNull(derived.vitalSummary),
        updatedAt: new Date(),
      },
    });

  await tx
    .insert(visitAssessmentExam)
    .values({
      clinicId,
      assessmentId,
      historySourceType: emptyToNull(input.historySourceType),
      historySourceName: emptyToNull(input.historySourceName),
      historySourceRelationship: emptyToNull(input.historySourceRelationship),
      drugAllergyNote: emptyToNull(input.drugAllergyNote),
      foodAllergyNote: emptyToNull(input.foodAllergyNote),
      airAllergyNote: emptyToNull(input.airAllergyNote),
        otherAllergyNote: emptyToNull(input.otherAllergyNote),
        medicationHistoryNote: emptyToNull(input.medicationHistoryNote),
        psychosocialSpiritualNote: emptyToNull(input.psychosocialSpiritualNote),
        additionalClinicalNote: emptyToNull(input.intakeNote),
        observationNote: emptyToNull(input.handoverNoteManual),
        initialCarePlan: emptyToNull(derived.dispositionLabel),
        nursingActionNote: emptyToNull(derived.flagSummary),
        physicalExamNote: emptyToNull(input.physicalExamNote),
        dentalExamNote: emptyToNull(input.dentalExamNote),
      })
    .onConflictDoUpdate({
      target: [visitAssessmentExam.clinicId, visitAssessmentExam.assessmentId],
      set: {
        historySourceType: emptyToNull(input.historySourceType),
        historySourceName: emptyToNull(input.historySourceName),
        historySourceRelationship: emptyToNull(input.historySourceRelationship),
        drugAllergyNote: emptyToNull(input.drugAllergyNote),
        foodAllergyNote: emptyToNull(input.foodAllergyNote),
        airAllergyNote: emptyToNull(input.airAllergyNote),
        otherAllergyNote: emptyToNull(input.otherAllergyNote),
        medicationHistoryNote: emptyToNull(input.medicationHistoryNote),
        psychosocialSpiritualNote: emptyToNull(input.psychosocialSpiritualNote),
        additionalClinicalNote: emptyToNull(input.intakeNote),
        observationNote: emptyToNull(input.handoverNoteManual),
        initialCarePlan: emptyToNull(derived.dispositionLabel),
        nursingActionNote: emptyToNull(derived.flagSummary),
        physicalExamNote: emptyToNull(input.physicalExamNote),
        dentalExamNote: emptyToNull(input.dentalExamNote),
        updatedAt: new Date(),
      },
    });

  await tx.delete(visitBodyFinding).where(
    and(
      eq(visitBodyFinding.clinicId, clinicId),
      eq(visitBodyFinding.assessmentId, assessmentId),
    ),
  );

  if (emptyToNull(input.bodyFindingNote)) {
    await tx.insert(visitBodyFinding).values({
      clinicId,
      assessmentId,
      bodyPartLabel: input.visitType === "dental" ? "Area gigi / mulut" : "Temuan tubuh umum",
      findingNote: emptyToNull(input.bodyFindingNote),
      displayOrder: 0,
    });
  }
}

function deriveAssessmentMetrics(
  input: AssessmentFormState,
  measurements: { heightCm?: number; weightKg?: number },
) {
  const heightCm = measurements.heightCm ?? null;
  const weightKg = measurements.weightKg ?? null;
  const bmi = deriveBmi(heightCm, weightKg);
  const bmiCategory = getBmiCategory(bmi);
  const painLabel = assessmentPainLabelMap[input.painScore as keyof typeof assessmentPainLabelMap] ?? null;
  const fallRiskScore = getFallRiskScore(input.fallRiskLevel, input.needsCompanionFlag);
  const nutritionRiskScore = input.nutritionRiskFlag ? 2 : 0;
  const nutritionRiskLevel = input.nutritionRiskFlag ? "berisiko" : "rendah";
  const sharedVitalAlertLevel = deriveSharedVitalAlertLevel(input);
  const immediateReviewFromTriage = input.triageLevel === "gawat" || input.triageLevel === "darurat";
  const requiresImmediateReviewFlag =
    immediateReviewFromTriage || sharedVitalAlertLevel === "kritis" || input.dispositionStatus === "priority_handover";
  const fallRiskLevel = mapStoredFallRiskLevel(input.fallRiskLevel);
  const doctorAttentionFlags = [
    input.initialAllergyFlag ? "Alergi perlu verifikasi" : null,
    input.communicationBarrierFlag ? "Hambatan komunikasi" : null,
    input.functionalDisabilityFlag ? "Disabilitas fungsional" : null,
    input.nutritionRiskFlag ? "Risiko nutrisi" : null,
    input.fallRiskLevel === "tinggi" ? "Risiko jatuh tinggi" : null,
    input.needsCompanionFlag ? "Perlu pendamping" : null,
    painLabel && input.painScore > 0 ? `Nyeri: ${painLabel}` : null,
    requiresImmediateReviewFlag ? "Perlu review dokter segera" : null,
  ].filter((value): value is string => Boolean(value));
  const flagSummary = doctorAttentionFlags.join("; ");
  const disposition: AssessmentDisposition = requiresImmediateReviewFlag
    ? "priority_handover"
    : input.dispositionStatus ?? "ready_for_doctor";
  const dispositionLabel =
    disposition === "priority_handover"
      ? "Handover prioritas"
      : disposition === "observation"
        ? "Observasi"
        : "Siap ke dokter";
  const adaptiveBlocksTriggered = [
    input.visitType === "dental" ? "dental_exam" : "general_exam",
    input.patientAgeGroup === "pediatric" ? "caregiver_history" : null,
    input.initialAllergyFlag ? "allergy_detail" : null,
    input.painScore > 0 ? "pain_detail" : null,
    input.fallRiskLevel === "tinggi" ? "fall_mitigation" : null,
    input.communicationBarrierFlag ? "communication_support" : null,
    input.functionalDisabilityFlag ? "functional_support" : null,
    input.nutritionRiskFlag ? "nutrition_detail" : null,
  ].filter((value): value is string => Boolean(value));
  const vitalSummary = formatVitalSummary(input);
  const handoverSummary = [
    emptyToNull(input.chiefComplaint),
    vitalSummary,
    painLabel && input.painScore > 0 ? `Nyeri ${painLabel}` : null,
    flagSummary || null,
    `Disposisi: ${dispositionLabel}`,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" | ");

  return {
    bmi,
    heightCm,
    weightKg,
    bmiCategory,
    painLabel,
    fallRiskScore,
    fallRiskLevel,
    nutritionRiskScore,
    nutritionRiskLevel,
    sharedVitalAlertLevel,
    requiresImmediateReviewFlag,
    requiresTransferAssistanceFlag: input.needsCompanionFlag || input.functionalDisabilityFlag,
    specialAttentionFlag: doctorAttentionFlags.length > 0,
    doctorAttentionFlags,
    adaptiveBlocksTriggered,
    flagSummary,
    vitalSummary,
    handoverSummary,
    disposition,
    dispositionLabel,
  };
}

function deriveBmi(heightCm: number | null, weightKg: number | null) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return null;
  }

  const heightMeter = heightCm / 100;
  return Number((weightKg / (heightMeter * heightMeter)).toFixed(2));
}

function getBmiCategory(bmi: number | null) {
  if (bmi == null) return null;
  if (bmi < 18.5) return "Kurus";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Berlebih";
  return "Obesitas";
}

function getFallRiskScore(level: string, needsCompanionFlag: boolean) {
  if (level === "tinggi") return needsCompanionFlag ? 4 : 5;
  if (level === "sedang") return 2;
  return 0;
}

function deriveSharedVitalAlertLevel(input: AssessmentFormState) {
  if (
    (input.systolic && (input.systolic < 90 || input.systolic > 180)) ||
    (input.diastolic && input.diastolic > 120) ||
    (input.heartRate && (input.heartRate < 50 || input.heartRate > 130)) ||
    (input.respiratoryRate && (input.respiratoryRate < 10 || input.respiratoryRate > 30)) ||
    (input.temperatureCelsius && input.temperatureCelsius >= 39) ||
    (input.spo2 && input.spo2 < 90)
  ) {
    return "kritis" as const;
  }

  return "normal" as const;
}

function inferAssessmentType(roomName: string) {
  const normalized = roomName.toLowerCase();

  if (normalized.includes("gigi") || normalized.includes("dental")) {
    return "dental" as const;
  }

  return "general" as const;
}

function derivePatientAgeGroup(dateOfBirth: string) {
  const age = getAgeYears(dateOfBirth);

  if (age < 18) return "pediatric" as const;
  if (age >= 60) return "elderly" as const;
  return "adult" as const;
}

function mapSharedTriageLevel(value: string) {
  if (value === "gawat") return "gawat" as const;
  if (value === "darurat") return "darurat" as const;
  return "tidak_gawat" as const;
}

function mapStoredTriageLevel(value: string | null | undefined) {
  if (value === "gawat") return "gawat" as const;
  if (value === "darurat") return "darurat" as const;
  return "non_urgent" as const;
}

function mapSharedVitalAlertLevel(value: string) {
  return value === "kritis" ? "kritis" : "normal";
}

function mapStoredVitalAlertLevel(value: string | null | undefined) {
  return value === "kritis" ? "kritis" : "normal";
}

function mapStoredFallRiskLevel(value: string | null | undefined) {
  if (value === "tinggi") return "tinggi" as const;
  if (value === "sedang") return "sedang" as const;
  return "rendah" as const;
}

function requireAssessmentDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Waktu asesmen tidak valid");
  }

  return parsed;
}

function parseNumberValue(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toNumericString(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return String(value);
}

function emptyToNull(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function firstFilled(values: Array<string | null | undefined>) {
  for (const value of values) {
    const normalized = emptyToNull(value);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function formatVitalSummary(input: AssessmentFormState) {
  const parts = [
    input.systolic && input.diastolic ? `TD ${input.systolic}/${input.diastolic}` : null,
    input.heartRate ? `Nadi ${input.heartRate}/mnt` : null,
    input.respiratoryRate ? `RR ${input.respiratoryRate}/mnt` : null,
    input.temperatureCelsius ? `Suhu ${input.temperatureCelsius} C` : null,
    input.spo2 ? `SpO2 ${input.spo2}%` : null,
  ].filter((value): value is string => Boolean(value));

  return parts.join(", ");
}

function revalidateAssessmentPaths(visitId: string) {
  revalidatePath("/pelayanan/asesmen-awal");
  revalidatePath(`/pelayanan/asesmen-awal/${visitId}`);
  revalidatePath("/pendaftaran/pasien");
  revalidatePath(`/pendaftaran/pasien/${visitId}`);
}

function formatDate(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function formatDateTime(value: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).formatToParts(value);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("day")}-${get("month")}-${get("year")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

function formatPatientAgeLong(dateOfBirth: string, referenceDate = new Date()) {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return "-";
  let years = referenceDate.getFullYear() - birthDate.getFullYear();
  let months = referenceDate.getMonth() - birthDate.getMonth();
  let days = referenceDate.getDate() - birthDate.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0);
    days += prevMonthDate.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return `${years} Thn ${months} Bln ${days} Hr`;
}

function getAgeYears(dateOfBirth: string, referenceDate = new Date()) {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) {
    return 0;
  }

  let years = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    years -= 1;
  }

  return years;
}
