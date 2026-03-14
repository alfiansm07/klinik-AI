"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Textarea,
} from "@/components/ui/textarea";

import type { AssessmentFormState } from "../assessment-shared";

type AssessmentFieldErrors = Partial<Record<keyof AssessmentFormState, string>>;

type StepExamProps = {
  values: AssessmentFormState;
  errors: AssessmentFieldErrors;
  readOnly: boolean;
  onValueChange: <K extends keyof AssessmentFormState>(field: K, value: AssessmentFormState[K]) => void;
};

export function StepExam({ values, errors, readOnly, onValueChange }: StepExamProps) {
  const isDental = values.visitType === "dental";

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-lg">Riwayat dan pemeriksaan</CardTitle>
          <CardDescription>
            Lengkapi sumber riwayat, detail alergi, obat rutin, dan catatan fokus {isDental ? "gigi" : "umum"} untuk dokter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">
              Fokus pemeriksaan {isDental ? "gigi" : "umum"}
            </p>
            <p className="mt-1">
              {isDental
                ? "Soroti lokasi nyeri gigi, pembengkakan, karies, atau keluhan intraoral yang perlu segera dilihat dokter gigi."
                : "Soroti temuan umum, riwayat penyakit sekarang, dan konteks pemeriksaan fisik yang perlu diprioritaskan dokter."}
            </p>
          </div>

          {values.initialAllergyFlag ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <FieldBlock id="drug-allergy-note" label="Alergi obat" error={errors.drugAllergyNote}>
                <Textarea
                  id="drug-allergy-note"
                  value={values.drugAllergyNote}
                  onChange={(event) => onValueChange("drugAllergyNote", event.target.value)}
                  disabled={readOnly}
                  className="min-h-20"
                  placeholder="Contoh: penisilin menyebabkan gatal dan sesak"
                />
              </FieldBlock>
              <FieldBlock id="food-allergy-note" label="Alergi makanan" error={errors.foodAllergyNote}>
                <Textarea
                  id="food-allergy-note"
                  value={values.foodAllergyNote}
                  onChange={(event) => onValueChange("foodAllergyNote", event.target.value)}
                  disabled={readOnly}
                  className="min-h-20"
                  placeholder="Contoh: seafood, telur, kacang"
                />
              </FieldBlock>
              <FieldBlock id="air-allergy-note" label="Alergi udara / lingkungan" error={errors.airAllergyNote}>
                <Textarea
                  id="air-allergy-note"
                  value={values.airAllergyNote}
                  onChange={(event) => onValueChange("airAllergyNote", event.target.value)}
                  disabled={readOnly}
                  className="min-h-20"
                  placeholder="Contoh: debu, asap, parfum"
                />
              </FieldBlock>
              <FieldBlock id="other-allergy-note" label="Alergi lainnya" error={errors.otherAllergyNote}>
                <Textarea
                  id="other-allergy-note"
                  value={values.otherAllergyNote}
                  onChange={(event) => onValueChange("otherAllergyNote", event.target.value)}
                  disabled={readOnly}
                  className="min-h-20"
                  placeholder="Catat alergi lain bila ada"
                />
              </FieldBlock>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <FieldBlock id="medication-history-note" label="Riwayat obat / terapi rutin" error={errors.medicationHistoryNote}>
              <Textarea
                id="medication-history-note"
                value={values.medicationHistoryNote}
                onChange={(event) => onValueChange("medicationHistoryNote", event.target.value)}
                disabled={readOnly}
                className="min-h-24"
                placeholder="Obat kronis, steroid, antikoagulan, antibiotik, atau terapi lain yang sedang berjalan"
              />
            </FieldBlock>

            <FieldBlock id="psychosocial-spiritual-note" label="Psikososial / spiritual" error={errors.psychosocialSpiritualNote}>
              <Textarea
                id="psychosocial-spiritual-note"
                value={values.psychosocialSpiritualNote}
                onChange={(event) => onValueChange("psychosocialSpiritualNote", event.target.value)}
                disabled={readOnly}
                className="min-h-24"
                placeholder="Ringkas konteks psikososial, spiritual, atau kebutuhan dukungan selama pelayanan"
              />
            </FieldBlock>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <FieldBlock id="physical-exam-note" label={isDental ? "Pemeriksaan umum pendukung" : "Pemeriksaan fisik umum"} error={errors.physicalExamNote}>
              <Textarea
                id="physical-exam-note"
                value={values.physicalExamNote}
                onChange={(event) => onValueChange("physicalExamNote", event.target.value)}
                disabled={readOnly}
                className="min-h-24"
                placeholder={isDental ? "Temuan umum yang ikut memengaruhi keluhan gigi / mulut" : "Temuan inspeksi, palpasi, atau fokus pemeriksaan umum yang perlu dibaca dokter"}
              />
            </FieldBlock>

            <FieldBlock id="dental-exam-note" label={isDental ? "Pemeriksaan gigi terfokus" : "Catatan pemeriksaan spesifik"} error={errors.dentalExamNote}>
              <Textarea
                id="dental-exam-note"
                value={values.dentalExamNote}
                onChange={(event) => onValueChange("dentalExamNote", event.target.value)}
                disabled={readOnly}
                className="min-h-24"
                placeholder={isDental ? "Ekstraoral, intraoral, gusi, karies, pembengkakan, atau nyeri tekan" : "Temuan pemeriksaan spesifik poli yang perlu disorot"}
              />
            </FieldBlock>
          </div>

          <FieldBlock id="body-finding-note" label="Lokasi temuan / body findings" error={errors.bodyFindingNote}>
            <Textarea
              id="body-finding-note"
              value={values.bodyFindingNote}
              onChange={(event) => onValueChange("bodyFindingNote", event.target.value)}
              disabled={readOnly}
              className="min-h-24"
              placeholder={isDental ? "Contoh: regio molar kanan bawah, gusi bukal, mukosa" : "Contoh: abdomen kanan bawah, thoraks, ekstremitas kiri, leher"}
            />
          </FieldBlock>
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
