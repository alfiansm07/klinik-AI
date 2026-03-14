"use client";

import { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { MasterFormActions } from "@/components/shared/master-data-ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

import {
  createPegawai,
  updatePegawai,
  type PegawaiDetail,
} from "./actions";
import {
  JABATAN_OPTIONS,
  PEGAWAI_GENDER_OPTIONS,
  PEGAWAI_LICENSE_TYPE_OPTIONS,
  PEGAWAI_MARITAL_STATUS_OPTIONS,
  PEGAWAI_RELIGION_OPTIONS,
} from "./constants";
import {
  getDefaultLicenseRow,
  getDefaultPegawaiFormValues,
  mapPegawaiDetailToFormValues,
  type PegawaiFormValues,
  type PegawaiLicenseFormValues,
} from "./pegawai-shared";

type PegawaiFormProps = {
  editingDetail: PegawaiDetail | null;
  nextCode: string | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function PegawaiForm({ editingDetail, nextCode, onSuccess, onCancel }: PegawaiFormProps) {
  const isEditing = Boolean(editingDetail);
  const initialValues = useMemo(
    () => mapPegawaiDetailToFormValues(editingDetail) ?? getDefaultPegawaiFormValues(),
    [editingDetail],
  );
  const [licenseRows, setLicenseRows] = useState<PegawaiLicenseFormValues[]>(initialValues.licenses);

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      const payload: PegawaiFormValues = { ...value, licenses: licenseRows };
      const result = isEditing
        ? await updatePegawai(editingDetail!.id, payload)
        : await createPegawai(payload);

      if (!result.success) {
        toast.error(result.error ?? "Gagal menyimpan pegawai");
        return;
      }

      toast.success(isEditing ? "Pegawai berhasil diperbarui" : "Pegawai berhasil ditambahkan");
      onSuccess();
    },
  });

  function updateLicenseRow(index: number, nextValue: Partial<PegawaiLicenseFormValues>) {
    setLicenseRows((rows) => rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...nextValue } : row)));
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6 px-1 pb-1"
    >
      <fieldset className="space-y-4 rounded-xl border p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Identitas Utama</legend>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="code">Kode Pegawai</Label>
            <Input id="code" value={editingDetail?.code ?? nextCode ?? ""} disabled className="bg-muted" />
          </div>
          <FieldInput form={form} name="fullName" label="Nama Lengkap" required className="xl:col-span-2" />
          <FieldInput form={form} name="titlePrefix" label="Gelar Depan" />
          <FieldInput form={form} name="titleSuffix" label="Gelar Belakang" />
          <FieldInput form={form} name="externalReference" label="Referensi Eksternal" />
          <FieldInput form={form} name="nik" label="NIK" />
          <FieldInput form={form} name="nip" label="NIP/NRP" />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Data Pribadi</legend>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FieldSelect form={form} name="gender" label="Jenis Kelamin" options={PEGAWAI_GENDER_OPTIONS} allowClear />
          <FieldInput form={form} name="birthPlace" label="Tempat Lahir" />
          <FieldInput form={form} name="birthDate" label="Tanggal Lahir" type="date" />
          <FieldSelect form={form} name="religion" label="Agama" options={PEGAWAI_RELIGION_OPTIONS} allowClear />
          <FieldSelect
            form={form}
            name="maritalStatus"
            label="Status Perkawinan"
            options={PEGAWAI_MARITAL_STATUS_OPTIONS}
            allowClear
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Kontak</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <FieldInput form={form} name="email" label="Email" type="email" />
          <FieldInput form={form} name="phone" label="Telp/HP" />
          <FieldTextarea form={form} name="address" label="Alamat" className="md:col-span-2" />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Profesi dan Penempatan</legend>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FieldSelect form={form} name="position" label="Jabatan" required options={JABATAN_OPTIONS} />
          <FieldInput form={form} name="parentInstitutionName" label="Instansi Induk" />
          <FieldInput form={form} name="workplaceName" label="Nama Tempat Bekerja Sekarang" required />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border p-4">
        <div className="flex items-center justify-between gap-4">
          <legend className="px-1 text-sm font-semibold text-foreground">Perizinan</legend>
          <Button
            type="button"
            variant="outline"
            onClick={() => setLicenseRows((rows) => [...rows, getDefaultLicenseRow()])}
          >
            <Plus className="h-4 w-4" />
            Tambah Izin
          </Button>
        </div>

        <div className="space-y-4">
          {licenseRows.map((license, index) => (
            <div key={license.id ?? `new-${index}`} className="grid gap-4 rounded-xl border p-4 md:grid-cols-2 xl:grid-cols-6">
              {(() => {
                const lifetimeId = `license-${index}-lifetime`;
                const noteId = `license-${index}-notes`;
                return (
                  <>
              <div className="space-y-2 xl:col-span-1">
                <Label>Jenis Izin</Label>
                <Select value={license.licenseType || undefined} onValueChange={(value) => updateLicenseRow(index, { licenseType: value as PegawaiLicenseFormValues["licenseType"] })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih izin" />
                  </SelectTrigger>
                  <SelectContent>
                    {PEGAWAI_LICENSE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 xl:col-span-2">
                <Label>Nomor Izin</Label>
                <Input value={license.licenseNumber} onChange={(event) => updateLicenseRow(index, { licenseNumber: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Terbit</Label>
                <Input type="date" value={license.issuedDate} onChange={(event) => updateLicenseRow(index, { issuedDate: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Berlaku Sampai</Label>
                <Input
                  type="date"
                  value={license.validUntil}
                  disabled={license.isLifetime}
                  onChange={(event) => updateLicenseRow(index, { validUntil: event.target.value })}
                />
              </div>
              <div className="flex items-center justify-between gap-3 xl:col-span-1">
                <div className="flex items-center gap-3 pt-6">
                  <Checkbox
                    id={lifetimeId}
                    checked={license.isLifetime}
                    onCheckedChange={(checked) =>
                      updateLicenseRow(index, {
                        isLifetime: checked === true,
                        validUntil: checked === true ? "" : license.validUntil,
                      })
                    }
                  />
                  <Label htmlFor={lifetimeId}>Seumur Hidup</Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Hapus izin ${index + 1}`}
                  onClick={() => setLicenseRows((rows) => rows.filter((_, rowIndex) => rowIndex !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 md:col-span-2 xl:col-span-6">
                <Label htmlFor={noteId}>Catatan</Label>
                <Textarea
                  id={noteId}
                  value={license.notes}
                  onChange={(event) => updateLicenseRow(index, { notes: event.target.value })}
                  className="min-h-24"
                />
              </div>
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">Status</legend>
        <form.Field name="isActive">
          {(field) => (
            <div className="flex items-center gap-3">
              <Checkbox id={field.name} checked={field.state.value} onCheckedChange={(checked) => field.handleChange(checked === true)} />
              <Label htmlFor={field.name}>Status Aktif</Label>
            </div>
          )}
        </form.Field>
      </fieldset>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <MasterFormActions
            onCancel={onCancel}
            isPending={isSubmitting}
            submitLabel={isEditing ? "Simpan Perubahan" : "Simpan Pegawai"}
            submittingLabel="Menyimpan pegawai..."
          />
        )}
      </form.Subscribe>
    </form>
  );
}

function FieldInput({ form, name, label, required, className, type = "text" }: any) {
  return (
    <form.Field name={name}>
      {(field: any) => (
        <div className={`space-y-2 ${className ?? ""}`}>
          <Label htmlFor={field.name}>
            {label}
            {required ? <span className="text-destructive"> *</span> : null}
          </Label>
          <Input
            id={field.name}
            name={field.name}
            type={type}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
          />
        </div>
      )}
    </form.Field>
  );
}

function FieldTextarea({ form, name, label, className }: any) {
  return (
    <form.Field name={name}>
      {(field: any) => (
        <div className={`space-y-2 ${className ?? ""}`}>
          <Label htmlFor={field.name}>{label}</Label>
          <Textarea
            id={field.name}
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            className="min-h-28"
          />
        </div>
      )}
    </form.Field>
  );
}

function FieldSelect({ form, name, label, options, required, allowClear }: any) {
  return (
    <form.Field name={name}>
      {(field: any) => (
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {label}
            {required ? <span className="text-destructive"> *</span> : null}
          </Label>
          <Select value={field.state.value || undefined} onValueChange={(value) => field.handleChange(value === "__empty__" ? "" : value)}>
            <SelectTrigger id={field.name} className="w-full">
              <SelectValue placeholder={`Pilih ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {allowClear ? <SelectItem value="__empty__">Kosongkan</SelectItem> : null}
              {options.map((option: any) => (
                <SelectItem key={option.value ?? option.key} value={option.value ?? option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </form.Field>
  );
}
