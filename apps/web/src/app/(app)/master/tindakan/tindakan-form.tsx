"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MasterFormActions } from "@/components/shared/master-data-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type TariffComponentLookup } from "@/lib/tariff-components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getRelationalSelectTriggerLabel,
  getSelectedOptionLabel,
  hasUnavailableSelectedOption,
} from "@/lib/select-utils";

import {
  createTindakan,
  updateTindakan,
  type TindakanDetail,
  type TindakanMedicineItem,
  type TindakanFormData,
  type LookupOption,
} from "./actions";
import { ACTION_CATEGORY_VALUES, ACTION_CATEGORY_LABELS, type ActionCategory } from "./constants";

// ─── Shared Constants & Utils ─────────────────────────────────

export const ACTION_TYPE_LABELS: Record<string, string> = {
  regular: "REGULAR",
  tindakan: "TINDAKAN",
  radiologi: "RADIOLOGI",
  laboratorium: "LABORATORIUM",
};

const ACTION_TYPE_VALUES = ["regular", "tindakan", "radiologi", "laboratorium"] as const;
const NO_MEDICINE_VALUE = "__none__";
const NO_MEDICINE_UNIT_VALUE = "__none_unit__";

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ─── Types ────────────────────────────────────────────────────

export type TindakanLookups = {
  medicines: LookupOption[];
  medicineUnits: LookupOption[];
  tariffComponents: TariffComponentLookup[];
};

export type MedicineRowState = {
  key: string;
  medicineId: string;
  medicineUnitId: string | null;
  quantity: number;
};

// ─── Medicine Sub-Table ───────────────────────────────────────

type MedicineSubTableProps = {
  rows: MedicineRowState[];
  onChange: (rows: MedicineRowState[]) => void;
  medicines: LookupOption[];
  medicineUnits: LookupOption[];
};

export function MedicineSubTable({
  rows,
  onChange,
  medicines,
  medicineUnits,
}: MedicineSubTableProps) {
  const medicineOptions = medicines.map((medicine) => ({
    value: medicine.id,
    label: `${medicine.code} — ${medicine.name}`,
  }));
  const medicineUnitOptions = medicineUnits.map((unit) => ({
    value: unit.id,
    label: unit.name,
  }));
  const hasMedicineOptions = medicineOptions.length > 0;
  const hasMedicineUnitOptions = medicineUnitOptions.length > 0;

  function addRow() {
    onChange([
      ...rows,
      { key: crypto.randomUUID(), medicineId: "", medicineUnitId: null, quantity: 1 },
    ]);
  }

  function removeRow(key: string) {
    onChange(rows.filter((r) => r.key !== key));
  }

  function updateRow(key: string, field: keyof MedicineRowState, value: string | number | null) {
    onChange(
      rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.key} className="flex items-end gap-2">
          {(() => {
            const hasUnavailableMedicineValue = hasUnavailableSelectedOption(
              medicineOptions,
              row.medicineId,
            );
            const hasUnavailableMedicineUnitValue = hasUnavailableSelectedOption(
              medicineUnitOptions,
              row.medicineUnitId,
            );

            return (
              <>
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Obat</Label>
            <Select
              value={row.medicineId || NO_MEDICINE_VALUE}
              onValueChange={(v) =>
                updateRow(
                  row.key,
                  "medicineId",
                  v === NO_MEDICINE_VALUE ? "" : (v ?? ""),
                )
              }
            >
              <SelectTrigger
                className="w-full"
                disabled={!hasMedicineOptions && !hasUnavailableMedicineValue}
              >
                <SelectValue>
                  {getRelationalSelectTriggerLabel(
                    medicineOptions,
                    row.medicineId,
                    "Pilih obat",
                    "Tidak ada data obat",
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_MEDICINE_VALUE}>Pilih obat</SelectItem>
                {hasMedicineOptions ? (
                  medicineOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty_medicine__" disabled>
                    Tidak ada data obat
                  </SelectItem>
                )}
                {hasUnavailableMedicineValue ? (
                  <SelectItem value="__missing_medicine__" disabled>
                    Pilihan tersimpan tidak tersedia
                  </SelectItem>
                ) : null}
              </SelectContent>
            </Select>
          </div>

          <div className="w-36 space-y-1">
            <Label className="text-xs">Satuan</Label>
            <Select
              value={row.medicineUnitId || NO_MEDICINE_UNIT_VALUE}
              onValueChange={(v) =>
                updateRow(
                  row.key,
                  "medicineUnitId",
                  v === NO_MEDICINE_UNIT_VALUE ? null : (v ?? null),
                )
              }
            >
              <SelectTrigger
                className="w-full"
                disabled={!hasMedicineUnitOptions && !hasUnavailableMedicineUnitValue}
              >
                <SelectValue>
                  {getRelationalSelectTriggerLabel(
                    medicineUnitOptions,
                    row.medicineUnitId,
                    "Tanpa satuan",
                    "Tidak ada data satuan",
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_MEDICINE_UNIT_VALUE}>Tanpa satuan</SelectItem>
                {hasMedicineUnitOptions ? (
                  medicineUnitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty_medicine_unit__" disabled>
                    Tidak ada data satuan
                  </SelectItem>
                )}
                {hasUnavailableMedicineUnitValue ? (
                  <SelectItem value="__missing_medicine_unit__" disabled>
                    Pilihan tersimpan tidak tersedia
                  </SelectItem>
                ) : null}
              </SelectContent>
            </Select>
          </div>

          <div className="w-20 space-y-1">
            <Label className="text-xs">Qty</Label>
            <Input
              type="number"
              min={1}
              value={row.quantity}
              onChange={(e) => updateRow(row.key, "quantity", Number(e.target.value) || 1)}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mb-0.5"
            onClick={() => removeRow(row.key)}
          >
            ✕
          </Button>
              </>
            );
          })()}
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        + Tambah Obat
      </Button>
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────

type TindakanFormProps = {
  editingDetail: TindakanDetail | null;
  nextCode: string | null;
  lookups: TindakanLookups;
  onSuccess: () => void;
  onCancel: () => void;
};

export function TindakanForm({
  editingDetail,
  nextCode,
  lookups,
  onSuccess,
  onCancel,
}: TindakanFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!editingDetail;
  const [actionCategory, setActionCategory] = useState<ActionCategory | null>(
    editingDetail?.actionCategory ?? null,
  );
  const [actionType, setActionType] = useState<TindakanFormData["actionType"]>(
    editingDetail?.actionType ?? "regular",
  );

  // Medicine rows state
  const [medicineRows, setMedicineRows] = useState<MedicineRowState[]>(() => {
    if (!editingDetail?.medicines) return [];
    return editingDetail.medicines.map((med) => ({
      key: crypto.randomUUID(),
      medicineId: med.medicineId,
      medicineUnitId: med.medicineUnitId,
      quantity: med.quantity,
    }));
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      toast.error("Nama tindakan wajib diisi");
      return;
    }

    const doctorFee = Number(formData.get("doctorFee") || 0);
    const clinicFee = Number(formData.get("clinicFee") || 0);
    const otherFee = Number(formData.get("otherFee") || 0);
    const midwifeFee = Number(formData.get("midwifeFee") || 0);
    const nurseFee = Number(formData.get("nurseFee") || 0);
    const selectedMedicineIds = medicineRows
      .map((row) => row.medicineId)
      .filter((medicineId): medicineId is string => Boolean(medicineId));

    if (new Set(selectedMedicineIds).size !== selectedMedicineIds.length) {
      toast.error("Obat yang sama tidak boleh dipilih lebih dari sekali");
      return;
    }

    const hasInvalidQuantity = medicineRows.some(
      (row) => row.medicineId && (!Number.isInteger(row.quantity) || row.quantity <= 0),
    );

    if (hasInvalidQuantity) {
      toast.error("Jumlah obat harus lebih dari 0");
      return;
    }

    const data: TindakanFormData = {
      name,
      actionCategory: actionCategory ?? null,
      icd9Code: (formData.get("icd9Code") as string) || null,
      actionType,
      doctorFee,
      clinicFee,
      otherFee,
      midwifeFee,
      nurseFee,
      totalFee: doctorFee + clinicFee + otherFee + midwifeFee + nurseFee,
      medicines: medicineRows
        .filter((r) => r.medicineId)
        .map((r) => ({
          medicineId: r.medicineId,
          medicineUnitId: r.medicineUnitId,
          quantity: r.quantity,
        })),
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateTindakan(editingDetail.id, data)
        : await createTindakan(data);

      if (result.success) {
        toast.success(
          isEditing ? "Tindakan berhasil diperbarui" : "Tindakan berhasil ditambahkan",
        );
        onSuccess();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="actionCategory" value={actionCategory ?? ""} />
      <input type="hidden" name="actionType" value={actionType} />

      {/* Section: Informasi Dasar */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Informasi Dasar</legend>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">
              Kode Tindakan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              value={editingDetail?.code ?? nextCode ?? ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Nama Tindakan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Konsultasi Dokter Umum"
              defaultValue={editingDetail?.name ?? ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actionCategory">Kategori Tindakan</Label>
            <Select
              value={actionCategory ?? undefined}
              onValueChange={(value: string | null) =>
                setActionCategory(
                  !value || value === "__none__" ? null : (value as ActionCategory),
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Tidak ada kategori</SelectItem>
                {ACTION_CATEGORY_VALUES.map((val) => (
                  <SelectItem key={val} value={val}>
                    {ACTION_CATEGORY_LABELS[val]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actionType">Tipe</Label>
            <Select
              value={actionType}
              onValueChange={(value) =>
                setActionType(value as TindakanFormData["actionType"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPE_VALUES.map((val) => (
                  <SelectItem key={val} value={val}>
                    {ACTION_TYPE_LABELS[val]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icd9Code">Kode ICD-9</Label>
            <Input
              id="icd9Code"
              name="icd9Code"
              placeholder="e.g. 89.0"
              defaultValue={editingDetail?.icd9Code ?? ""}
            />
          </div>
        </div>
      </fieldset>

      {/* Section: Komponen Tarif */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Komponen Tarif</legend>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {lookups.tariffComponents.map((field) => {
            const defaultValue =
              editingDetail?.[field.fieldName] ?? 0;

            return (
            <div key={field.feeKey} className="space-y-2">
              <Label htmlFor={field.fieldName}>{field.name}</Label>
              <Input
                id={field.fieldName}
                name={field.fieldName}
                type="number"
                min={0}
                defaultValue={defaultValue}
              />
            </div>
            );
          })}
        </div>
      </fieldset>

      {/* Section: Obat & Alkes */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Obat & Alkes</legend>
        <MedicineSubTable
          rows={medicineRows}
          onChange={setMedicineRows}
          medicines={lookups.medicines}
          medicineUnits={lookups.medicineUnits}
        />
      </fieldset>

      {/* Actions */}
      <MasterFormActions
        onCancel={onCancel}
        isPending={isPending}
        submitLabel={isEditing ? "Simpan Perubahan" : "Simpan Tindakan"}
      />
    </form>
  );
}
