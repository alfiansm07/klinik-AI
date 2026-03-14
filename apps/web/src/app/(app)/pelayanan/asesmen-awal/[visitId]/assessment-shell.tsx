"use client";

import { useMemo, useState, useTransition } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { ArrowLeft, ArrowRight, Save, Send, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AppRole } from "@/lib/rbac";
import { cn } from "@/lib/utils";

import {
  buildDoctorAttentionFlags,
  getAlternativeRequiredFieldGroupsForContext,
  getRequiredFieldsForContext,
  isFastHandoverContext,
} from "../adaptive-rules";
import { finalizeAssessment, saveAssessmentDraft, type AssessmentVisitDetail } from "../actions";
import { assessmentWizardSteps, createEmptyAssessmentDraft, type AssessmentFormState } from "../assessment-shared";
import { getAssessmentWorklistStatusSurface, type AssessmentWorklistStatus } from "../worklist-shared";
import { AssessmentStepper } from "./assessment-stepper";
import { StepExam } from "./step-exam";
import { StepHandover } from "./step-handover";
import { StepIntake } from "./step-intake";
import { StepRisk } from "./step-risk";
import { SummaryPanel } from "./summary-panel";
import { StepVitals } from "./step-vitals";

type AssessmentFieldErrors = Partial<Record<keyof AssessmentFormState, string>>;

type AssessmentShellProps = {
  visit: AssessmentVisitDetail;
  currentRole: AppRole;
  assessorName: string;
};

const STEP_FIELDS: Record<(typeof assessmentWizardSteps)[number]["id"], Array<keyof AssessmentFormState>> = {
  intake: ["chiefComplaint", "intakeNote", "additionalComplaints", "initialAllergyFlag"],
  risk: [
    "functionalDisabilityFlag",
    "functionalDisabilityNote",
    "communicationBarrierFlag",
    "communicationBarrierNote",
    "nutritionRiskFlag",
    "nutritionDetailNote",
    "painScore",
    "painSummary",
    "fallRiskLevel",
    "fallMitigationNote",
    "needsCompanionFlag",
    "historySourceType",
    "historySourceName",
    "historySourceRelationship",
  ],
  vitals: [
    "consciousnessLevel",
    "heightCm",
    "weightKg",
    "systolic",
    "diastolic",
    "heartRate",
    "respiratoryRate",
    "temperatureCelsius",
    "spo2",
    "triageLevel",
  ],
  exam: [
    "drugAllergyNote",
    "foodAllergyNote",
    "airAllergyNote",
    "otherAllergyNote",
    "medicationHistoryNote",
    "psychosocialSpiritualNote",
    "physicalExamNote",
    "dentalExamNote",
    "bodyFindingNote",
  ],
  handover: ["dispositionStatus", "handoverNoteManual"],
};

export function AssessmentShell({ visit, currentRole, assessorName }: AssessmentShellProps) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<AssessmentFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<AssessmentWorklistStatus>(visit.status);
  const [isSaving, startSaveTransition] = useTransition();
  const [isFinalizing, startFinalizeTransition] = useTransition();

  const initialValues = useMemo(
    () => ({
      ...createEmptyAssessmentDraft(),
      ...visit.draft,
    }),
    [visit.draft],
  );

  const form = useForm({
    defaultValues: initialValues,
  });

  const currentStatusSurface = getAssessmentWorklistStatusSurface(currentStatus);
  const isDoctorMode = currentRole === "doctor";
  const canEdit = !isDoctorMode;

  function updateField<K extends keyof AssessmentFormState>(field: K, value: AssessmentFormState[K]) {
    form.setFieldValue(field as never, value as never);
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError(null);
  }

  const stepErrors = getStepErrors(fieldErrors);

  function moveStep(direction: "previous" | "next") {
    setCurrentStepIndex((current) => {
      if (direction === "previous") {
        return Math.max(current - 1, 0);
      }

      return Math.min(current + 1, assessmentWizardSteps.length - 1);
    });
  }

  function focusFirstErroredStep(errors: AssessmentFieldErrors) {
    const firstField = Object.keys(errors)[0] as keyof AssessmentFormState | undefined;
    if (!firstField) return;

    const nextIndex = assessmentWizardSteps.findIndex((step) => STEP_FIELDS[step.id].includes(firstField));
    if (nextIndex >= 0) {
      setCurrentStepIndex(nextIndex);
    }
  }

  function handleSaveDraft() {
    setFormError(null);
    startSaveTransition(async () => {
      const result = await saveAssessmentDraft(form.state.values);

      if (!result.success) {
        setFormError(result.error ?? "Gagal menyimpan draft asesmen.");
        toast.error(result.error ?? "Gagal menyimpan draft asesmen.");
        return;
      }

      setFieldErrors({});
      setCurrentStatus(result.visitStatus ?? "draft");
      toast.success("Draft asesmen berhasil disimpan.");
      router.refresh();
    });
  }

  function handleFinalize() {
    setFormError(null);
    startFinalizeTransition(async () => {
      const result = await finalizeAssessment(form.state.values);

      if (!result.success) {
        const nextErrors = result.fieldErrors ?? {};
        setFieldErrors(nextErrors);
        setFormError(result.error ?? "Data asesmen belum lengkap.");
        focusFirstErroredStep(nextErrors);
        toast.error(result.error ?? "Data asesmen belum lengkap.");
        return;
      }

      setFieldErrors({});
      setCurrentStatus(result.visitStatus ?? currentStatus);
      toast.success(
        result.visitStatus === "priority_handover"
          ? "Asesmen difinalkan sebagai serah terima prioritas."
          : "Asesmen berhasil difinalkan untuk dokter.",
      );
      router.replace("/pelayanan/asesmen-awal" as Route);
    });
  }

  return (
    <form.Subscribe selector={(state) => state.values}>
      {(currentValues) => {
        const requiresImmediateReview = isFastHandoverContext(currentValues);
        const showDraftGate = isDoctorMode && ["draft", "menunggu_asesmen"].includes(currentStatus);
        const attentionAlerts = buildDoctorAttentionFlags(currentValues)
          .map((flag) => DOCTOR_ALERT_LABELS[flag] ?? flag)
          .slice(0, 4);
        const requiredFields = getRequiredFieldsForContext(currentValues);
        const alternativeRequiredGroups = getAlternativeRequiredFieldGroupsForContext(currentValues);
        const checklistItems = buildChecklistItems(currentValues, requiredFields, alternativeRequiredGroups);

        if (isDoctorMode) {
          return (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
              <SummaryPanel
                values={currentValues}
                patientName={visit.patient.name}
                medicalRecordNumber={visit.patient.medicalRecordNumber}
                roomLabel={visit.roomLabel}
                statusLabel={currentStatusSurface.label}
                statusClassName={cn("h-7 rounded-md border px-3 text-xs font-semibold", currentStatusSurface.badge)}
                isDoctorMode
                showDraftGate={showDraftGate}
                requiresImmediateReview={requiresImmediateReview}
              />
              <Card className="rounded-2xl border-border/70">
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Identitas kunjungan</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {visit.patient.name} · No. RM {visit.patient.medicalRecordNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {visit.roomLabel} · {visit.guarantorLabel} · Tanggal {visit.visitDate}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                    Mode dokter saat ini hanya membaca ringkasan asesmen final. Form edit tetap berada di workflow perawat.
                  </div>
                  <Link
                    href={"/pelayanan/asesmen-awal" as Route}
                    className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full rounded-lg px-4 text-sm")}
                  >
                    Kembali ke antrean asesmen
                  </Link>
                </CardContent>
              </Card>
            </div>
          );
        }

        return (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_380px]">
            <div className="space-y-6">
              <AssessmentStepper
                patientName={visit.patient.name}
                medicalRecordNumber={visit.patient.medicalRecordNumber}
                registrationNumber={visit.registrationNumber}
                roomLabel={visit.roomLabel}
                guarantorLabel={visit.guarantorLabel}
                visitDate={visit.visitDate}
                statusLabel={currentStatusSurface.label}
                statusClassName={currentStatusSurface.badge}
                alerts={attentionAlerts}
                currentStepIndex={currentStepIndex}
                stepErrors={stepErrors}
                canEdit={canEdit}
                onStepChange={setCurrentStepIndex}
              />

              {formError ? (
                <Card className="rounded-2xl border-destructive/40 bg-destructive/5">
                  <CardContent className="flex items-start gap-3 pt-5 text-sm text-destructive">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-semibold">Perlu perhatian sebelum lanjut</p>
                      <p className="mt-1">{formError}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {currentStepIndex === 0 ? (
                <StepIntake
                  values={currentValues}
                  errors={fieldErrors}
                  readOnly={!canEdit}
                  assessorName={assessorName}
                  onValueChange={updateField}
                />
              ) : null}

              {currentStepIndex === 1 ? (
                <StepRisk
                  values={currentValues}
                  errors={fieldErrors}
                  readOnly={!canEdit}
                  onValueChange={updateField}
                />
              ) : null}

              {currentStepIndex === 2 ? (
                <StepVitals
                  values={currentValues}
                  errors={fieldErrors}
                  readOnly={!canEdit}
                  onValueChange={updateField}
                />
              ) : null}

              {currentStepIndex === 3 ? (
                <StepExam
                  values={currentValues}
                  errors={fieldErrors}
                  readOnly={!canEdit}
                  onValueChange={updateField}
                />
              ) : null}

              {currentStepIndex === 4 ? (
                <StepHandover
                  values={currentValues}
                  errors={fieldErrors}
                  readOnly={!canEdit}
                  requiresImmediateReview={requiresImmediateReview}
                  checklistItems={checklistItems}
                  onValueChange={updateField}
                />
              ) : null}

              <Card className="rounded-2xl border-border/70">
                <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveStep("previous")}
                      disabled={currentStepIndex === 0 || isSaving || isFinalizing}
                      className="h-11 rounded-lg px-4 text-sm"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Langkah sebelumnya
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => moveStep("next")}
                      disabled={currentStepIndex === assessmentWizardSteps.length - 1 || isSaving || isFinalizing}
                      className="h-11 rounded-lg px-4 text-sm"
                    >
                      Langkah berikutnya
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveDraft}
                      disabled={isSaving || isFinalizing}
                      className="h-11 rounded-lg px-4 text-sm"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Menyimpan draft..." : "Simpan draft"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleFinalize}
                      disabled={isSaving || isFinalizing}
                      className="h-11 rounded-lg px-4 text-sm"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {isFinalizing ? "Memfinalkan..." : "Finalkan Asesmen"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <SummaryPanel
              values={currentValues}
              patientName={visit.patient.name}
              medicalRecordNumber={visit.patient.medicalRecordNumber}
              roomLabel={visit.roomLabel}
              statusLabel={currentStatusSurface.label}
              statusClassName={cn("h-7 rounded-md border px-3 text-xs font-semibold", currentStatusSurface.badge)}
              isDoctorMode={false}
              showDraftGate={false}
              requiresImmediateReview={requiresImmediateReview}
            />
          </div>
        );
      }}
    </form.Subscribe>
  );
}

function getStepErrors(errors: AssessmentFieldErrors) {
  const nextErrors: Partial<Record<(typeof assessmentWizardSteps)[number]["id"], string>> = {};

  for (const step of assessmentWizardSteps) {
    const count = STEP_FIELDS[step.id].filter((field) => errors[field]).length;
    if (count > 0) {
      nextErrors[step.id] = `${count} field perlu dilengkapi`;
    }
  }

  return nextErrors;
}

function buildChecklistItems(
  values: AssessmentFormState,
  requiredFields: Array<keyof AssessmentFormState>,
  alternativeGroups: Array<ReadonlyArray<keyof AssessmentFormState>>,
) {
  return [
    {
      label: "Keluhan utama tercatat",
      done: values.chiefComplaint.trim().length > 0,
    },
    {
      label: "Tanda vital inti lengkap",
      done: [
        values.consciousnessLevel,
        values.systolic,
        values.diastolic,
        values.heartRate,
        values.respiratoryRate,
        values.temperatureCelsius,
        values.spo2,
      ].every((value) => value !== "" && value !== undefined),
    },
    {
      label: "Field wajib kontekstual terisi",
      done: requiredFields.every((field) => hasValue(values[field])),
    },
    {
      label: "Kebutuhan alternatif terpenuhi",
      done: alternativeGroups.every((group) => group.some((field) => hasValue(values[field]))),
    },
    {
      label: "Keputusan dan catatan untuk dokter siap",
      done:
        values.dispositionStatus !== undefined && values.handoverNoteManual.trim().length > 0,
    },
  ];
}

function hasValue(value: AssessmentFormState[keyof AssessmentFormState]) {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number") {
    return true;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return value !== undefined && value !== null;
}

const DOCTOR_ALERT_LABELS: Record<string, string> = {
  "urgent-triage": "Triase urgent",
  "critical-vitals": "Vital kritis",
  allergy: "Alergi",
  "high-fall-risk": "Risiko jatuh tinggi",
  "communication-barrier": "Hambatan komunikasi",
  "nutrition-risk": "Risiko nutrisi",
  "severe-pain": "Nyeri berat",
};
