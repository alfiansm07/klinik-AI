"use client";

import { AlertCircle, ClipboardList, HeartPulse, ShieldAlert, Stethoscope } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { buildDoctorAttentionFlags } from "../adaptive-rules";
import {
  assessmentConsciousnessLabelMap,
  assessmentDispositionLabelMap,
  assessmentPainLabelMap,
  assessmentTriageLabelMap,
  type AssessmentFormState,
} from "../assessment-shared";

type SummaryPanelProps = {
  values: AssessmentFormState;
  patientName: string;
  medicalRecordNumber: string;
  roomLabel: string;
  statusLabel: string;
  statusClassName: string;
  isDoctorMode: boolean;
  showDraftGate: boolean;
  requiresImmediateReview: boolean;
};

const ATTENTION_FLAG_LABELS: Record<string, string> = {
  "urgent-triage": "Triase urgent",
  "critical-vitals": "Vital kritis",
  allergy: "Alergi perlu verifikasi",
  "high-fall-risk": "Risiko jatuh tinggi",
  "communication-barrier": "Hambatan komunikasi",
  "nutrition-risk": "Risiko nutrisi",
  "severe-pain": "Nyeri berat",
};

export function SummaryPanel({
  values,
  patientName,
  medicalRecordNumber,
  roomLabel,
  statusLabel,
  statusClassName,
  isDoctorMode,
  showDraftGate,
  requiresImmediateReview,
}: SummaryPanelProps) {
  const attentionLabels = buildDoctorAttentionFlags(values).map(
    (flag) => ATTENTION_FLAG_LABELS[flag] ?? flag,
  );
  const vitalCards = buildVitalCards(values);
  const historyHighlights = buildHistoryHighlights(values);
  const examHighlights = buildExamHighlights(values);
  const dispositionLabel = values.dispositionStatus
    ? assessmentDispositionLabelMap[values.dispositionStatus]
    : "Belum ditentukan";

  return (
    <Card className="rounded-2xl border-border/70 bg-card/95 shadow-sm xl:sticky xl:top-6">
      <CardHeader className="gap-3 border-b border-border/70 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={statusClassName}>{statusLabel}</Badge>
            <Badge variant="outline" className="h-7 rounded-md border-border/70 bg-background/70 px-3 text-xs font-medium">
              {roomLabel}
            </Badge>
          {requiresImmediateReview ? (
            <Badge className="h-7 rounded-md border border-rose-500/25 bg-rose-500/10 px-3 text-xs font-semibold text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
              Review segera
            </Badge>
          ) : null}
        </div>
        <div>
          <CardTitle className="text-lg sm:text-xl">
            {isDoctorMode ? "Ringkasan untuk Dokter" : "Ringkasan Asesmen Live"}
          </CardTitle>
          <CardDescription className="text-sm leading-6">
            {patientName} · No. RM {medicalRecordNumber}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {showDraftGate ? (
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5">
              <div className="flex items-center gap-2 text-base font-semibold text-amber-900 dark:text-amber-100">
                <AlertCircle className="h-5 w-5" />
                Asesmen belum final
              </div>
              <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-100/85">
                Dokter hanya melihat ringkasan final. Minta perawat menyelesaikan dan memfinalkan asesmen awal sebelum kunjungan ini diteruskan ke SOAP.
              </p>
            </div>
        ) : (
          <>
            <SummarySection icon={ClipboardList} title="Alasan kunjungan">
              <p className="text-sm font-semibold text-foreground">
                {values.chiefComplaint || "Keluhan utama belum diisi"}
              </p>
              {values.intakeNote ? (
                <p className="text-sm text-muted-foreground">{values.intakeNote}</p>
              ) : null}
            </SummarySection>

            <SummarySection icon={ShieldAlert} title="Alert klinis">
              {attentionLabels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {attentionLabels.map((label) => (
                    <Badge
                      key={label}
                        variant="outline"
                        className="border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200"
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada alert tambahan yang menonjol.</p>
              )}
            </SummarySection>

            <SummarySection icon={HeartPulse} title="Strip tanda vital">
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                {vitalCards.map((item) => (
                  <div
                    key={item.label}
                    className="flex min-h-28 flex-col rounded-xl border border-border/70 bg-background/75 px-3 py-3"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-3 text-[1.05rem] font-semibold leading-snug text-foreground [font-variant-numeric:tabular-nums]">
                      {item.value}
                    </p>
                    {item.supportingLines.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {item.supportingLines.map((line) => (
                          <p
                            key={line}
                            className="text-[12px] leading-4.5 text-muted-foreground [font-variant-numeric:tabular-nums]"
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </SummarySection>

            <SummarySection icon={ClipboardList} title="Ringkasan riwayat">
              <HighlightList items={historyHighlights} emptyLabel="Belum ada ringkasan riwayat penting." />
            </SummarySection>

            <SummarySection icon={Stethoscope} title="Highlight pemeriksaan">
              <HighlightList items={examHighlights} emptyLabel="Belum ada highlight pemeriksaan yang diisi." />
            </SummarySection>

            <SummarySection icon={ClipboardList} title="Tindak Lanjut dan Catatan">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold text-foreground">Keputusan:</span>{" "}
                  <span className="text-foreground">{dispositionLabel}</span>
                </p>
                <p>
                  <span className="font-semibold text-foreground">Catatan untuk dokter:</span>{" "}
                  <span className="text-muted-foreground">
                    {values.handoverNoteManual || "Belum ada catatan untuk dokter."}
                  </span>
                </p>
              </div>
            </SummarySection>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SummarySection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ClipboardList;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-border/70 bg-background/40 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function HighlightList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item} className="rounded-xl border border-border/60 bg-background/65 px-3 py-2 text-sm text-foreground">
          {item}
        </div>
      ))}
    </div>
  );
}

function buildVitalCards(values: AssessmentFormState) {
  return [
    {
      label: "Tekanan darah",
      value:
        typeof values.systolic === "number" && typeof values.diastolic === "number"
          ? `${values.systolic}/${values.diastolic} mmHg`
          : "Belum diisi",
      supportingLines: [],
    },
    {
      label: "Nadi / RR",
      value:
        typeof values.heartRate === "number" && typeof values.respiratoryRate === "number"
          ? `${values.heartRate}/mnt`
          : "Belum diisi",
      supportingLines:
        typeof values.heartRate === "number" && typeof values.respiratoryRate === "number"
          ? [`RR ${values.respiratoryRate}/mnt`]
          : [],
    },
    {
      label: "Suhu / SpO2",
      value:
        typeof values.temperatureCelsius === "number" && typeof values.spo2 === "number"
          ? `${values.temperatureCelsius} C`
          : "Belum diisi",
      supportingLines:
        typeof values.temperatureCelsius === "number" && typeof values.spo2 === "number"
          ? [`SpO2 ${values.spo2}%`]
          : [],
    },
    {
      label: "TB / BB / IMT",
      value:
        typeof values.heightCm === "number" && typeof values.weightKg === "number"
          ? `${values.heightCm} cm`
          : "Belum diisi",
      supportingLines:
        typeof values.heightCm === "number" && typeof values.weightKg === "number"
          ? [`${values.weightKg} kg`, `IMT ${calculateBmi(values) ?? "-"}`]
          : [],
    },
    {
      label: "Kesadaran",
      value: values.consciousnessLevel
        ? (assessmentConsciousnessLabelMap[values.consciousnessLevel] ?? values.consciousnessLevel)
        : "Belum diisi",
      supportingLines: [],
    },
    {
      label: "Triase",
      value: assessmentTriageLabelMap[values.triageLevel],
      supportingLines: [],
    },
    {
      label: "Skor nyeri",
      value:
        values.painScore > 0
          ? assessmentPainLabelMap[values.painScore as keyof typeof assessmentPainLabelMap]
          : "Tidak nyeri",
      supportingLines: [],
    },
  ];
}

function buildHistoryHighlights(values: AssessmentFormState) {
  const positives = [
    values.initialAllergyFlag ? buildAllergySummary(values) : null,
    values.communicationBarrierFlag
      ? `Hambatan komunikasi: ${values.communicationBarrierNote || "perlu dukungan komunikasi"}`
      : null,
    values.functionalDisabilityFlag
      ? `Disabilitas fungsional: ${values.functionalDisabilityNote || "perlu bantuan aktivitas"}`
      : null,
    values.nutritionRiskFlag
      ? `Risiko nutrisi: ${values.nutritionDetailNote || "perlu penilaian lanjut"}`
      : null,
    values.patientAgeGroup === "pediatric" && values.historySourceName
      ? `Riwayat dari ${values.historySourceName} (${values.historySourceRelationship || values.historySourceType || "pendamping"})`
      : null,
    values.psychosocialSpiritualNote
      ? `Psikososial / spiritual: ${values.psychosocialSpiritualNote}`
      : null,
  ].filter((value): value is string => Boolean(value));

  const secondary = [
    values.medicationHistoryNote ? `Obat rutin: ${values.medicationHistoryNote}` : null,
    values.additionalComplaints ? `Konteks tambahan: ${values.additionalComplaints}` : null,
  ].filter((value): value is string => Boolean(value));

  return [...positives, ...secondary];
}

function buildExamHighlights(values: AssessmentFormState) {
  return [
    values.painScore > 0
      ? `Nyeri: ${assessmentPainLabelMap[values.painScore as keyof typeof assessmentPainLabelMap]}${values.painSummary ? ` - ${values.painSummary}` : ""}`
      : null,
    values.fallRiskLevel === "tinggi"
      ? `Risiko jatuh tinggi${values.fallMitigationNote ? ` - ${values.fallMitigationNote}` : ""}`
      : values.fallRiskLevel === "sedang"
        ? "Risiko jatuh sedang"
        : null,
    values.needsCompanionFlag ? "Pasien memerlukan pendamping saat asesmen atau perpindahan" : null,
    values.visitType === "dental"
      ? values.dentalExamNote
        ? `Fokus dental: ${values.dentalExamNote}`
        : "Kunjungan dental - cek nyeri lokal, pembengkakan, dan keluhan intraoral"
      : values.physicalExamNote
        ? `Temuan umum: ${values.physicalExamNote}`
        : null,
    values.bodyFindingNote ? `Lokasi temuan: ${values.bodyFindingNote}` : null,
  ].filter((value): value is string => Boolean(value));
}

function calculateBmi(values: AssessmentFormState) {
  if (
    typeof values.heightCm !== "number" ||
    values.heightCm <= 0 ||
    typeof values.weightKg !== "number" ||
    values.weightKg <= 0
  ) {
    return null;
  }

  return Number((values.weightKg / ((values.heightCm / 100) * (values.heightCm / 100))).toFixed(2));
}

function buildAllergySummary(values: AssessmentFormState) {
  const labels = [
    values.drugAllergyNote ? `obat: ${values.drugAllergyNote}` : null,
    values.foodAllergyNote ? `makanan: ${values.foodAllergyNote}` : null,
    values.airAllergyNote ? `udara: ${values.airAllergyNote}` : null,
    values.otherAllergyNote ? `lainnya: ${values.otherAllergyNote}` : null,
  ].filter((value): value is string => Boolean(value));

  return labels.length > 0 ? `Alergi - ${labels.join("; ")}` : "Ada riwayat alergi, detail belum lengkap";
}
