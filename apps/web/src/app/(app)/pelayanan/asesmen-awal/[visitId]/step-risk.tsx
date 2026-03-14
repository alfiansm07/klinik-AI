"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { assessmentFallRiskLabelMap, type AssessmentFormState } from "../assessment-shared";

type AssessmentFieldErrors = Partial<Record<keyof AssessmentFormState, string>>;

type StepRiskProps = {
  values: AssessmentFormState;
  errors: AssessmentFieldErrors;
  readOnly: boolean;
  onValueChange: <K extends keyof AssessmentFormState>(field: K, value: AssessmentFormState[K]) => void;
};

const PAIN_OPTIONS = Array.from({ length: 11 }, (_, score) => ({
  value: String(score),
  label: `${score}`,
}));

const HISTORY_SOURCE_OPTIONS = [
  { value: "pasien", label: "Pasien sendiri" },
  { value: "orang_tua", label: "Orang tua" },
  { value: "pasangan", label: "Pasangan" },
  { value: "caregiver", label: "Caregiver / pendamping" },
  { value: "lainnya", label: "Lainnya" },
] as const;

export function StepRisk({ values, errors, readOnly, onValueChange }: StepRiskProps) {
  const showCaregiverFields = values.patientAgeGroup === "pediatric" || values.needsCompanionFlag;
  const selectedPainLabel = PAIN_OPTIONS.find((option) => option.value === String(values.painScore))?.label;
  const selectedFallRiskLabel = assessmentFallRiskLabelMap[values.fallRiskLevel];
  const selectedHistorySourceLabel =
    HISTORY_SOURCE_OPTIONS.find((option) => option.value === values.historySourceType)?.label;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-lg">Skrining risiko</CardTitle>
          <CardDescription>
            Tandai faktor yang perlu perhatian dokter lebih dini: fungsi, komunikasi, nutrisi, jatuh, nyeri, dan kebutuhan pendamping.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <ToggleCard
              id="functional-disability-flag"
              checked={values.functionalDisabilityFlag}
              disabled={readOnly}
              title="Disabilitas fungsional"
              description="Pasien memerlukan bantuan aktivitas atau perpindahan."
              onCheckedChange={(checked) => onValueChange("functionalDisabilityFlag", checked)}
            />
            <ToggleCard
              id="communication-barrier-flag"
              checked={values.communicationBarrierFlag}
              disabled={readOnly}
              title="Hambatan komunikasi"
              description="Ada gangguan bahasa, pendengaran, atau pemahaman yang perlu dukungan tambahan."
              onCheckedChange={(checked) => onValueChange("communicationBarrierFlag", checked)}
            />
            <ToggleCard
              id="nutrition-risk-flag"
              checked={values.nutritionRiskFlag}
              disabled={readOnly}
              title="Risiko nutrisi"
              description="Ada tanda penurunan asupan, penurunan berat badan, atau risiko malnutrisi."
              onCheckedChange={(checked) => onValueChange("nutritionRiskFlag", checked)}
            />
            <ToggleCard
              id="needs-companion-flag"
              checked={values.needsCompanionFlag}
              disabled={readOnly}
              title="Perlu pendamping"
              description="Pasien perlu anggota keluarga atau caregiver saat asesmen dan handover."
              onCheckedChange={(checked) => onValueChange("needsCompanionFlag", checked)}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <FieldBlock id="pain-score" label="Skor nyeri" error={errors.painScore}>
              <Select
                value={String(values.painScore)}
                onValueChange={(value) => onValueChange("painScore", Number(value ?? 0))}
                disabled={readOnly}
              >
                <SelectTrigger id="pain-score" className="h-11 w-full text-sm">
                  <SelectValue>{selectedPainLabel ?? "Pilih skor nyeri"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PAIN_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBlock>

            <FieldBlock id="fall-risk-level" label="Risiko jatuh" error={errors.fallRiskLevel}>
              <Select
                value={values.fallRiskLevel}
                onValueChange={(value) =>
                  onValueChange(
                    "fallRiskLevel",
                    (value ?? "rendah") as AssessmentFormState["fallRiskLevel"],
                  )
                }
                disabled={readOnly}
              >
                <SelectTrigger id="fall-risk-level" className="h-11 w-full text-sm">
                  <SelectValue>{selectedFallRiskLabel ?? "Pilih risiko jatuh"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(assessmentFallRiskLabelMap).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBlock>

            {showCaregiverFields ? (
              <FieldBlock
                id="history-source-type"
                label="Sumber riwayat caregiver"
                error={errors.historySourceType}
                required={values.patientAgeGroup === "pediatric"}
              >
                <Select
                  value={values.historySourceType || null}
                  onValueChange={(value) => onValueChange("historySourceType", value ?? "")}
                  disabled={readOnly}
                >
                  <SelectTrigger id="history-source-type" className="h-11 w-full text-sm">
                    <SelectValue>{selectedHistorySourceLabel ?? "Pilih sumber riwayat"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {HISTORY_SOURCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldBlock>
            ) : (
               <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Konteks caregiver</p>
                <p className="mt-1">Field caregiver otomatis aktif untuk pasien pediatrik atau pasien yang butuh pendamping.</p>
              </div>
            )}
          </div>

          {values.painScore > 0 ? (
            <FieldBlock id="pain-summary" label="Detail nyeri" error={errors.painSummary} required>
              <Textarea
                id="pain-summary"
                value={values.painSummary}
                onChange={(event) => onValueChange("painSummary", event.target.value)}
                disabled={readOnly}
                className="min-h-24"
                placeholder="Lokasi, karakter, penjalaran, faktor yang memperberat atau mengurangi"
              />
            </FieldBlock>
          ) : null}

          {showCaregiverFields ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <FieldBlock id="history-source-name" label="Nama sumber riwayat" error={errors.historySourceName} required={values.patientAgeGroup === "pediatric"}>
                <Textarea
                  id="history-source-name"
                  value={values.historySourceName}
                  onChange={(event) => onValueChange("historySourceName", event.target.value)}
                  disabled={readOnly}
                  className="min-h-24"
                  placeholder="Nama orang tua, pasangan, atau caregiver"
                />
              </FieldBlock>
              <FieldBlock id="history-source-relationship" label="Hubungan dengan pasien" error={errors.historySourceRelationship} required={values.patientAgeGroup === "pediatric"}>
                <Textarea
                  id="history-source-relationship"
                  value={values.historySourceRelationship}
                  onChange={(event) => onValueChange("historySourceRelationship", event.target.value)}
                  disabled={readOnly}
                  className="min-h-24"
                  placeholder="Contoh: ibu kandung, suami, caregiver harian"
                />
              </FieldBlock>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            {values.communicationBarrierFlag ? (
              <FieldBlock id="communication-barrier-note" label="Catatan hambatan komunikasi" error={errors.communicationBarrierNote} required>
                <Textarea
                  id="communication-barrier-note"
                  value={values.communicationBarrierNote}
                  onChange={(event) => onValueChange("communicationBarrierNote", event.target.value)}
                  disabled={readOnly}
                  className="min-h-24"
                  placeholder="Bahasa, alat bantu, atau kebutuhan pendamping komunikasi"
                />
              </FieldBlock>
            ) : null}

            {values.functionalDisabilityFlag ? (
              <FieldBlock id="functional-disability-note" label="Catatan disabilitas / mobilitas" error={errors.functionalDisabilityNote} required>
                <Textarea
                  id="functional-disability-note"
                  value={values.functionalDisabilityNote}
                  onChange={(event) => onValueChange("functionalDisabilityNote", event.target.value)}
                  disabled={readOnly}
                  className="min-h-24"
                  placeholder="Bentuk bantuan yang dibutuhkan saat pemeriksaan atau perpindahan"
                />
              </FieldBlock>
            ) : null}

            {values.nutritionRiskFlag ? (
              <FieldBlock id="nutrition-detail-note" label="Catatan risiko nutrisi" error={errors.nutritionDetailNote} required>
                <Textarea
                  id="nutrition-detail-note"
                  value={values.nutritionDetailNote}
                  onChange={(event) => onValueChange("nutritionDetailNote", event.target.value)}
                  disabled={readOnly}
                  className="min-h-24"
                  placeholder="Ringkas penurunan asupan, berat badan, atau faktor nutrisi penting"
                />
              </FieldBlock>
            ) : null}

            {values.fallRiskLevel === "tinggi" ? (
              <FieldBlock id="fall-mitigation-note" label="Mitigasi risiko jatuh" error={errors.fallMitigationNote}>
                <Textarea
                  id="fall-mitigation-note"
                  value={values.fallMitigationNote}
                  onChange={(event) => onValueChange("fallMitigationNote", event.target.value)}
                  disabled={readOnly}
                  className="min-h-24"
                  placeholder="Mitigasi lingkungan, bantuan transfer, atau alasan pendamping diperlukan"
                />
              </FieldBlock>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleCard({
  id,
  checked,
  disabled,
  title,
  description,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  disabled: boolean;
  title: string;
  description: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} disabled={disabled} className="mt-1" />
      <div className="space-y-1">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Label>
  );
}

function FieldBlock({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
