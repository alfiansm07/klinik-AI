"use client";

import { useForm } from "@tanstack/react-form";
import { UserRoundPlus } from "lucide-react";
import { toast } from "sonner";

import { MasterFormActions } from "@/components/shared/master-data-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { createPatient } from "./actions";
import {
  getDefaultPatientFormValues,
  PATIENT_GENDER_LABELS,
  patientFormSchema,
} from "./patient-shared";
import type { PatientSearchRow } from "./actions";

type PatientFormProps = {
  nextMedicalRecordNumber: string | null;
  onSuccess: (patient: PatientSearchRow | null) => void;
  onCancel: () => void;
};

export function PatientForm({
  nextMedicalRecordNumber,
  onSuccess,
  onCancel,
}: PatientFormProps) {
  const form = useForm({
    defaultValues: getDefaultPatientFormValues(),
    validators: {
      onSubmit: patientFormSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await createPatient(value);

      if (!result.success) {
        toast.error(result.error ?? "Gagal menambahkan pasien");
        return;
      }

      toast.success("Pasien baru berhasil ditambahkan");
      onSuccess(result.patient ?? null);
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6 px-1 pb-1"
    >
      <div className="grid gap-4 rounded-xl border bg-muted/20 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Nomor rekam medis akan dibuat otomatis</p>
          <p className="text-sm text-muted-foreground">
            Front office cukup melengkapi identitas inti pasien. Detail visit rawat jalan akan
            diisi pada slice berikutnya.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-3 text-sm font-semibold text-foreground">
          <UserRoundPlus className="h-4 w-4 text-primary" />
          {nextMedicalRecordNumber ?? "Memuat..."}
        </div>
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Identitas Pasien</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="medicalRecordNumber">Nomor Rekam Medis</Label>
            <Input id="medicalRecordNumber" value={nextMedicalRecordNumber ?? ""} disabled className="bg-muted" />
          </div>

          <form.Field name="nik">
            {(field) => (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={field.name}>NIK</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  inputMode="numeric"
                  maxLength={16}
                  placeholder="Nomor Induk Kependudukan (16 digit)"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldErrors errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field name="name">
            {(field) => (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={field.name}>
                  Nama Pasien <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Masukkan nama lengkap pasien"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldErrors errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field name="gender">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Jenis Kelamin <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={field.state.value || null}
                  onValueChange={(value) => {
                    field.handleChange(value ?? "");
                  }}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PATIENT_GENDER_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldErrors errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field name="dateOfBirth">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Tanggal Lahir <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldErrors errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Kontak Dasar</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <form.Field name="mobilePhone">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>No. HP</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  inputMode="tel"
                  placeholder="08xxxxxxxxxx"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldErrors errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <div className="hidden md:block" />

          <form.Field name="address">
            {(field) => (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={field.name}>Alamat</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  placeholder="Alamat tempat tinggal pasien"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className="min-h-28 resize-y"
                />
                <FieldErrors errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        </div>
      </fieldset>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <MasterFormActions
            onCancel={onCancel}
            isPending={isSubmitting}
            submitLabel="Simpan Pasien"
            submittingLabel="Menyimpan pasien..."
          />
        )}
      </form.Subscribe>
    </form>
  );
}

function FieldErrors({ errors }: { errors: Array<{ message?: string } | undefined> }) {
  return errors.length > 0 ? (
    <div className="space-y-1">
      {errors.map((error) =>
        error?.message ? (
          <p key={error.message} className="text-sm text-destructive" role="alert">
            {error.message}
          </p>
        ) : null,
      )}
    </div>
  ) : null;
}
