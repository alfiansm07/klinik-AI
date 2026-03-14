"use client";

import { BadgeCheck, ClipboardCheck, Siren } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  assessmentDispositionLabelMap,
  type AssessmentFormState,
} from "../assessment-shared";

type AssessmentFieldErrors = Partial<Record<keyof AssessmentFormState, string>>;

type StepHandoverProps = {
  values: AssessmentFormState;
  errors: AssessmentFieldErrors;
  readOnly: boolean;
  requiresImmediateReview: boolean;
  checklistItems: Array<{ label: string; done: boolean }>;
  onValueChange: <K extends keyof AssessmentFormState>(field: K, value: AssessmentFormState[K]) => void;
};

export function StepHandover({
  values,
  errors,
  readOnly,
  requiresImmediateReview,
  checklistItems,
  onValueChange,
}: StepHandoverProps) {
  const selectedDispositionLabel = values.dispositionStatus
    ? assessmentDispositionLabelMap[values.dispositionStatus]
    : null;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-lg">Serah Terima ke Dokter</CardTitle>
          <CardDescription>
            Pilih keputusan tindak lanjut, tulis catatan untuk dokter, lalu pastikan poin inti sudah lengkap sebelum finalisasi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-4">
              <FieldBlock id="disposition-status" label="Keputusan Tindak Lanjut" error={errors.dispositionStatus} required>
                <Select
                  value={values.dispositionStatus ?? null}
                  onValueChange={(value) =>
                    onValueChange(
                      "dispositionStatus",
                      (value ?? undefined) as AssessmentFormState["dispositionStatus"],
                    )
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger id="disposition-status" className="h-11 w-full text-sm">
                    <SelectValue>{selectedDispositionLabel ?? "Pilih keputusan tindak lanjut"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(assessmentDispositionLabelMap).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldBlock>

               <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  {requiresImmediateReview ? (
                    <Siren className="h-4 w-4 text-rose-600" />
                  ) : (
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                  )}
                  Status review dokter
                </div>
                <p className="mt-1">
                  {requiresImmediateReview
                    ? "Draft saat ini memicu review dokter segera berdasarkan triase atau tanda vital kritis."
                    : "Tidak ada penanda urgent otomatis. Lanjutkan dengan disposisi normal atau observasi sesuai kondisi klinis."}
                </p>
              </div>
            </div>

            <FieldBlock id="handover-note-manual" label="Catatan untuk Dokter" error={errors.handoverNoteManual} required>
              <Textarea
                id="handover-note-manual"
                value={values.handoverNoteManual}
                onChange={(event) => onValueChange("handoverNoteManual", event.target.value)}
                disabled={readOnly}
                className="min-h-36"
                placeholder="Ringkas poin yang harus dibaca dokter terlebih dahulu: keluhan, tanda vital, risiko, temuan penting, dan tindak lanjut prioritas"
              />
            </FieldBlock>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Checklist final review
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {checklistItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2"
                >
                  <span className="text-sm text-foreground">{item.label}</span>
                  <Badge
                    variant="outline"
                    className={item.done ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"}
                  >
                    {item.done ? "Siap" : "Belum"}
                  </Badge>
                </div>
              ))}
            </div>
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
