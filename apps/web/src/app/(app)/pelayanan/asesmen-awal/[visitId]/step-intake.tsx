"use client";

import { CalendarClock, UserSquare2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import type { AssessmentFormState } from "../assessment-shared";

type AssessmentFieldErrors = Partial<Record<keyof AssessmentFormState, string>>;

type StepIntakeProps = {
  values: AssessmentFormState;
  errors: AssessmentFieldErrors;
  readOnly: boolean;
  assessorName: string;
  onValueChange: <K extends keyof AssessmentFormState>(field: K, value: AssessmentFormState[K]) => void;
};

export function StepIntake({
  values,
  errors,
  readOnly,
  assessorName,
  onValueChange,
}: StepIntakeProps) {
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-lg">Intake awal</CardTitle>
          <CardDescription>
            Rekam keluhan utama, kronologi singkat, dan informasi petugas penilai sebelum lanjut ke skrining risiko.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <UserSquare2 className="h-4 w-4 text-primary" />
                Petugas penilai
              </div>
              <p className="mt-2 text-base font-semibold text-foreground">{assessorName}</p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CalendarClock className="h-4 w-4 text-primary" />
                Waktu asesmen
              </div>
              <p className="mt-2 text-base font-semibold text-foreground">
                {formatDateTimeLabel(values.assessmentAt)}
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <FieldBlock id="chief-complaint" label="Keluhan utama" error={errors.chiefComplaint} required>
              <Textarea
                id="chief-complaint"
                value={values.chiefComplaint}
                onChange={(event) => onValueChange("chiefComplaint", event.target.value)}
                disabled={readOnly}
                className="min-h-28"
                placeholder="Contoh: nyeri dada sejak pagi, batuk tiga hari, sakit gigi kanan bawah"
              />
            </FieldBlock>

            <FieldBlock id="intake-note" label="Durasi / kronologi singkat" error={errors.intakeNote}>
              <Textarea
                id="intake-note"
                value={values.intakeNote}
                onChange={(event) => onValueChange("intakeNote", event.target.value)}
                disabled={readOnly}
                className="min-h-28"
                placeholder="Ringkas sejak kapan keluhan muncul, pemicu, dan tindakan awal yang sudah dilakukan"
              />
            </FieldBlock>
          </div>

          <FieldBlock id="additional-complaints" label="Keluhan tambahan / konteks registrasi" error={errors.additionalComplaints}>
            <Textarea
              id="additional-complaints"
              value={values.additionalComplaints}
              onChange={(event) => onValueChange("additionalComplaints", event.target.value)}
              disabled={readOnly}
              className="min-h-24"
              placeholder="Keluhan lain, konteks psikososial, atau catatan singkat yang perlu dibawa ke dokter"
            />
          </FieldBlock>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.9fr)]">
            <Label htmlFor="initial-allergy-flag" className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
              <Checkbox
                id="initial-allergy-flag"
                checked={values.initialAllergyFlag}
                onCheckedChange={(checked) => onValueChange("initialAllergyFlag", checked === true)}
                disabled={readOnly}
                className="mt-1"
              />
              <div className="space-y-1">
                <span className="text-sm font-semibold text-foreground">Ada riwayat alergi awal</span>
                <p className="text-sm text-muted-foreground">
                  Aktifkan bila registrasi atau anamnesis awal menunjukkan riwayat alergi obat, makanan, udara, atau lainnya.
                </p>
              </div>
            </Label>
          </div>
        </CardContent>
      </Card>
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

function formatDateTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Waktu belum tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}
