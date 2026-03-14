"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { assessmentTriageLabelMap, type AssessmentFormState } from "../assessment-shared";

type AssessmentFieldErrors = Partial<Record<keyof AssessmentFormState, string>>;

type StepVitalsProps = {
  values: AssessmentFormState;
  errors: AssessmentFieldErrors;
  readOnly: boolean;
  onValueChange: <K extends keyof AssessmentFormState>(field: K, value: AssessmentFormState[K]) => void;
};

const CONSCIOUSNESS_OPTIONS = [
  { value: "compos_mentis", label: "Compos mentis" },
  { value: "apatis", label: "Apatis" },
  { value: "somnolen", label: "Somnolen" },
  { value: "sopor", label: "Sopor" },
  { value: "coma", label: "Koma" },
] as const;

export function StepVitals({ values, errors, readOnly, onValueChange }: StepVitalsProps) {
  const selectedConsciousnessLabel =
    CONSCIOUSNESS_OPTIONS.find((option) => option.value === values.consciousnessLevel)?.label;
  const selectedTriageLabel = assessmentTriageLabelMap[values.triageLevel];
  const bmi =
    typeof values.heightCm === "number" && values.heightCm > 0 && typeof values.weightKg === "number" && values.weightKg > 0
      ? Number((values.weightKg / ((values.heightCm / 100) * (values.heightCm / 100))).toFixed(2))
      : null;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-lg">Tanda vital dan triase</CardTitle>
          <CardDescription>
            Catat status kesadaran, tanda vital inti, dan level triase untuk menentukan urgensi handover.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FieldBlock id="consciousness-level" label="Kesadaran" error={errors.consciousnessLevel} required>
              <Select
                value={values.consciousnessLevel || null}
                onValueChange={(value) => onValueChange("consciousnessLevel", value ?? "")}
                disabled={readOnly}
              >
                <SelectTrigger id="consciousness-level" className="h-11 w-full text-sm">
                  <SelectValue>{selectedConsciousnessLabel ?? "Pilih kesadaran"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CONSCIOUSNESS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBlock>

            <FieldBlock id="triage-level" label="Triase" error={errors.triageLevel}>
              <Select
                value={values.triageLevel}
                onValueChange={(value) =>
                  onValueChange(
                    "triageLevel",
                    (value ?? "non_urgent") as AssessmentFormState["triageLevel"],
                  )
                }
                disabled={readOnly}
              >
                <SelectTrigger id="triage-level" className="h-11 w-full text-sm">
                  <SelectValue>{selectedTriageLabel ?? "Pilih triase"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(assessmentTriageLabelMap).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBlock>

            <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Catatan cepat</p>
              <p className="mt-1">Isi lengkap tanda vital untuk mengaktifkan penanda kritis dan membantu dokter memprioritaskan kunjungan.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <NumberField
              id="height-cm"
              label="Tinggi badan"
              suffix="cm"
              value={values.heightCm}
              readOnly={readOnly}
              onValueChange={(value) => onValueChange("heightCm", value)}
            />
            <NumberField
              id="weight-kg"
              label="Berat badan"
              suffix="kg"
              value={values.weightKg}
              readOnly={readOnly}
              onValueChange={(value) => onValueChange("weightKg", value)}
            />
            <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">IMT / BMI</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{bmi == null ? "-" : bmi}</p>
              <p className="mt-1">Terhitung otomatis dari tinggi dan berat badan terkini.</p>
            </div>
            <NumberField
              id="systolic"
              label="Sistolik"
              suffix="mmHg"
              value={values.systolic}
              error={errors.systolic}
              required
              readOnly={readOnly}
              onValueChange={(value) => onValueChange("systolic", value)}
            />
            <NumberField
              id="diastolic"
              label="Diastolik"
              suffix="mmHg"
              value={values.diastolic}
              error={errors.diastolic}
              required
              readOnly={readOnly}
              onValueChange={(value) => onValueChange("diastolic", value)}
            />
            <NumberField
              id="heart-rate"
              label="Nadi"
              suffix="/mnt"
              value={values.heartRate}
              error={errors.heartRate}
              required
              readOnly={readOnly}
              onValueChange={(value) => onValueChange("heartRate", value)}
            />
            <NumberField
              id="respiratory-rate"
              label="Respirasi"
              suffix="/mnt"
              value={values.respiratoryRate}
              error={errors.respiratoryRate}
              required
              readOnly={readOnly}
              onValueChange={(value) => onValueChange("respiratoryRate", value)}
            />
            <NumberField
              id="temperature-celsius"
              label="Suhu"
              suffix="C"
              step="0.1"
              value={values.temperatureCelsius}
              error={errors.temperatureCelsius}
              required
              readOnly={readOnly}
              onValueChange={(value) => onValueChange("temperatureCelsius", value)}
            />
            <NumberField
              id="spo2"
              label="SpO2"
              suffix="%"
              value={values.spo2}
              error={errors.spo2}
              required
              readOnly={readOnly}
              onValueChange={(value) => onValueChange("spo2", value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NumberField({
  id,
  label,
  suffix,
  value,
  error,
  required,
  readOnly,
  step,
  onValueChange,
}: {
  id: string;
  label: string;
  suffix: string;
  value: number | undefined;
  error?: string;
  required?: boolean;
  readOnly: boolean;
  step?: string;
  onValueChange: (value: number | undefined) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      <div className="relative">
        <Input
          type="number"
          id={id}
          inputMode="decimal"
          step={step}
          value={typeof value === "number" ? String(value) : ""}
          onChange={(event) => {
            const nextValue = event.target.value;
            onValueChange(nextValue.length > 0 ? Number(nextValue) : undefined);
          }}
          disabled={readOnly}
          className="h-11 pr-14 text-sm"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
          {suffix}
        </span>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
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
