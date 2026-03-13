"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MasterFormActions } from "@/components/shared/master-data-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  type RelationalSelectOption,
} from "@/lib/select-utils";

import {
  createObat,
  updateObat,
  type ObatDetail,
  type ObatFormData,
  type LookupOption,
} from "./actions";

export type ObatLookups = {
  categories: LookupOption[];
  units: LookupOption[];
  pharmacologies: LookupOption[];
  manufacturers: LookupOption[];
  suppliers: LookupOption[];
};

export const PRICING_METHOD_LABELS: Record<string, string> = {
  hpp: "HPP",
  markup: "Markup",
};

export const INVENTORY_METHOD_LABELS: Record<string, string> = {
  fifo: "FIFO",
  lifo: "LIFO",
  average: "Rata-rata",
};

const NO_LOOKUP_VALUE = "__none__";

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value?.length ?? 0;
  return (
    <span className="text-xs text-muted-foreground">
      {len}/{max}
    </span>
  );
}

type ObatFormProps = {
  editingDetail: ObatDetail | null;
  nextCode: string | null;
  lookups: ObatLookups;
  onSuccess: () => void;
  onCancel: () => void;
};

export function ObatForm({
  editingDetail,
  nextCode,
  lookups,
  onSuccess,
  onCancel,
}: ObatFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!editingDetail;

  const [composition, setComposition] = useState(editingDetail?.composition ?? "");
  const [indications, setIndications] = useState(editingDetail?.indications ?? "");
  const [contraindications, setContraindications] = useState(
    editingDetail?.contraindications ?? "",
  );
  const [drugInteractions, setDrugInteractions] = useState(
    editingDetail?.drugInteractions ?? "",
  );
  const [warnings, setWarnings] = useState(editingDetail?.warnings ?? "");
  const [dosageInfo, setDosageInfo] = useState(editingDetail?.dosageInfo ?? "");
  const [medicineCategoryId, setMedicineCategoryId] = useState(
    editingDetail?.medicineCategoryId ?? "",
  );
  const [manufacturerId, setManufacturerId] = useState(
    editingDetail?.manufacturerId ?? "",
  );
  const [pharmacologyId, setPharmacologyId] = useState(
    editingDetail?.pharmacologyId ?? "",
  );
  const [supplierId, setSupplierId] = useState(editingDetail?.supplierId ?? "");
  const [smallUnitId, setSmallUnitId] = useState(editingDetail?.smallUnitId ?? "");
  const [packageUnitId, setPackageUnitId] = useState(
    editingDetail?.packageUnitId ?? "",
  );
  const [packageUnit2Id, setPackageUnit2Id] = useState(
    editingDetail?.packageUnit2Id ?? "",
  );
  const [compoundUnitId, setCompoundUnitId] = useState(
    editingDetail?.compoundUnitId ?? "",
  );

  const categoryOptions: RelationalSelectOption[] = lookups.categories.map((option) => ({
    value: option.id,
    label: option.name,
  }));
  const manufacturerOptions: RelationalSelectOption[] = lookups.manufacturers.map(
    (option) => ({
      value: option.id,
      label: option.name,
    }),
  );
  const pharmacologyOptions: RelationalSelectOption[] = lookups.pharmacologies.map(
    (option) => ({
      value: option.id,
      label: option.name,
    }),
  );
  const supplierOptions: RelationalSelectOption[] = lookups.suppliers.map((option) => ({
    value: option.id,
    label: option.name,
  }));
  const unitOptions: RelationalSelectOption[] = lookups.units.map((option) => ({
    value: option.id,
    label: option.name,
  }));
  const hasCategoryOptions = categoryOptions.length > 0;
  const hasManufacturerOptions = manufacturerOptions.length > 0;
  const hasPharmacologyOptions = pharmacologyOptions.length > 0;
  const hasSupplierOptions = supplierOptions.length > 0;
  const hasUnitOptions = unitOptions.length > 0;
  const hasUnavailableCategoryValue = hasUnavailableSelectedOption(
    categoryOptions,
    medicineCategoryId,
  );
  const hasUnavailableManufacturerValue = hasUnavailableSelectedOption(
    manufacturerOptions,
    manufacturerId,
  );
  const hasUnavailablePharmacologyValue = hasUnavailableSelectedOption(
    pharmacologyOptions,
    pharmacologyId,
  );
  const hasUnavailableSupplierValue = hasUnavailableSelectedOption(
    supplierOptions,
    supplierId,
  );
  const hasUnavailableSmallUnitValue = hasUnavailableSelectedOption(unitOptions, smallUnitId);
  const hasUnavailablePackageUnitValue = hasUnavailableSelectedOption(
    unitOptions,
    packageUnitId,
  );
  const hasUnavailablePackageUnit2Value = hasUnavailableSelectedOption(
    unitOptions,
    packageUnit2Id,
  );
  const hasUnavailableCompoundUnitValue = hasUnavailableSelectedOption(
    unitOptions,
    compoundUnitId,
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: ObatFormData = {
      name: formData.get("name") as string,
      isCompound: formData.get("isCompound") === "on",
      medicineCategoryId: medicineCategoryId || null,
      manufacturerId: manufacturerId || null,
      storageLocation: (formData.get("storageLocation") as string) || null,
      defaultTaxPct: Number(formData.get("defaultTaxPct") || 0),
      pricingMethod:
        (formData.get("pricingMethod") as "hpp" | "markup") || "hpp",
      inventoryMethod:
        (formData.get("inventoryMethod") as "fifo" | "lifo" | "average") ||
        "average",
      smallUnitId: smallUnitId || null,
      packageUnitId: packageUnitId || null,
      packageConversion: Number(formData.get("packageConversion") || 0) || null,
      packageUnit2Id: packageUnit2Id || null,
      packageConversion2: Number(formData.get("packageConversion2") || 0) || null,
      compoundUnitId: compoundUnitId || null,
      compoundQuantity: Number(formData.get("compoundQuantity") || 0) || null,
      composition,
      indications,
      contraindications,
      drugInteractions,
      warnings,
      dosageInfo,
      pharmacologyId: pharmacologyId || null,
      supplierId: supplierId || null,
      kfaCode: (formData.get("kfaCode") as string) || null,
      bpjsCode: (formData.get("bpjsCode") as string) || null,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateObat(editingDetail.id, data)
        : await createObat(data);

      if (result.success) {
        toast.success(
          isEditing ? "Obat berhasil diperbarui" : "Obat berhasil ditambahkan",
        );
        onSuccess();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">
          Informasi Dasar
        </legend>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">
              Kode Barang <span className="text-destructive">*</span>
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
              Nama Barang <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. AMOXICILLIN 500MG"
              defaultValue={editingDetail?.name ?? ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicineCategoryId">Golongan Obat</Label>
            <Select
              value={medicineCategoryId || NO_LOOKUP_VALUE}
              onValueChange={(value) =>
                setMedicineCategoryId(value === NO_LOOKUP_VALUE ? "" : (value ?? ""))
              }
            >
              <SelectTrigger
                className="w-full"
                disabled={!hasCategoryOptions && !hasUnavailableCategoryValue}
              >
                <SelectValue>
                  {getRelationalSelectTriggerLabel(
                    categoryOptions,
                    medicineCategoryId,
                    "Tidak dipilih",
                    "Tidak ada data golongan",
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_LOOKUP_VALUE}>Tidak dipilih</SelectItem>
                {hasCategoryOptions ? (
                  categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty_category__" disabled>
                    Tidak ada data golongan
                  </SelectItem>
                )}
                {hasUnavailableCategoryValue ? (
                  <SelectItem value="__missing_category__" disabled>
                    Pilihan tersimpan tidak tersedia
                  </SelectItem>
                ) : null}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturerId">Pabrik</Label>
            <Select
              value={manufacturerId || NO_LOOKUP_VALUE}
              onValueChange={(value) =>
                setManufacturerId(value === NO_LOOKUP_VALUE ? "" : (value ?? ""))
              }
            >
              <SelectTrigger
                className="w-full"
                disabled={!hasManufacturerOptions && !hasUnavailableManufacturerValue}
              >
                <SelectValue>
                  {getRelationalSelectTriggerLabel(
                    manufacturerOptions,
                    manufacturerId,
                    "Tidak dipilih",
                    "Tidak ada data pabrik",
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_LOOKUP_VALUE}>Tidak dipilih</SelectItem>
                {hasManufacturerOptions ? (
                  manufacturerOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty_manufacturer__" disabled>
                    Tidak ada data pabrik
                  </SelectItem>
                )}
                {hasUnavailableManufacturerValue ? (
                  <SelectItem value="__missing_manufacturer__" disabled>
                    Pilihan tersimpan tidak tersedia
                  </SelectItem>
                ) : null}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pharmacologyId">Farmakologi</Label>
            <Select
              value={pharmacologyId || NO_LOOKUP_VALUE}
              onValueChange={(value) =>
                setPharmacologyId(value === NO_LOOKUP_VALUE ? "" : (value ?? ""))
              }
            >
              <SelectTrigger
                className="w-full"
                disabled={!hasPharmacologyOptions && !hasUnavailablePharmacologyValue}
              >
                <SelectValue>
                  {getRelationalSelectTriggerLabel(
                    pharmacologyOptions,
                    pharmacologyId,
                    "Tidak dipilih",
                    "Tidak ada data farmakologi",
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_LOOKUP_VALUE}>Tidak dipilih</SelectItem>
                {hasPharmacologyOptions ? (
                  pharmacologyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty_pharmacology__" disabled>
                    Tidak ada data farmakologi
                  </SelectItem>
                )}
                {hasUnavailablePharmacologyValue ? (
                  <SelectItem value="__missing_pharmacology__" disabled>
                    Pilihan tersimpan tidak tersedia
                  </SelectItem>
                ) : null}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierId">Distributor</Label>
            <Select
              value={supplierId || NO_LOOKUP_VALUE}
              onValueChange={(value) =>
                setSupplierId(value === NO_LOOKUP_VALUE ? "" : (value ?? ""))
              }
            >
              <SelectTrigger
                className="w-full"
                disabled={!hasSupplierOptions && !hasUnavailableSupplierValue}
              >
                <SelectValue>
                  {getRelationalSelectTriggerLabel(
                    supplierOptions,
                    supplierId,
                    "Tidak dipilih",
                    "Tidak ada data distributor",
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_LOOKUP_VALUE}>Tidak dipilih</SelectItem>
                {hasSupplierOptions ? (
                  supplierOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty_supplier__" disabled>
                    Tidak ada data distributor
                  </SelectItem>
                )}
                {hasUnavailableSupplierValue ? (
                  <SelectItem value="__missing_supplier__" disabled>
                    Pilihan tersimpan tidak tersedia
                  </SelectItem>
                ) : null}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storageLocation">Lokasi Penyimpanan</Label>
            <Input
              id="storageLocation"
              name="storageLocation"
              placeholder="e.g. Rak A-1"
              defaultValue={editingDetail?.storageLocation ?? ""}
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <Switch
              id="isCompound"
              name="isCompound"
              defaultChecked={editingDetail?.isCompound ?? false}
            />
            <Label htmlFor="isCompound">Obat Racikan</Label>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">
          Satuan & Konversi
        </legend>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="smallUnitId">Satuan Terkecil</Label>
            <Select
              value={smallUnitId || NO_LOOKUP_VALUE}
              onValueChange={(value) =>
                setSmallUnitId(value === NO_LOOKUP_VALUE ? "" : (value ?? ""))
              }
            >
              <SelectTrigger
                className="w-full"
                disabled={!hasUnitOptions && !hasUnavailableSmallUnitValue}
              >
                <SelectValue>
                  {getRelationalSelectTriggerLabel(
                    unitOptions,
                    smallUnitId,
                    "Tidak dipilih",
                    "Tidak ada data satuan",
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_LOOKUP_VALUE}>Tidak dipilih</SelectItem>
                {hasUnitOptions ? (
                  unitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty_unit_small__" disabled>
                    Tidak ada data satuan
                  </SelectItem>
                )}
                {hasUnavailableSmallUnitValue ? (
                  <SelectItem value="__missing_unit_small__" disabled>
                    Pilihan tersimpan tidak tersedia
                  </SelectItem>
                ) : null}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="packageUnitId">Satuan Kemasan 1</Label>
            <div className="flex gap-2">
              <Select
                value={packageUnitId || NO_LOOKUP_VALUE}
                onValueChange={(value) =>
                  setPackageUnitId(value === NO_LOOKUP_VALUE ? "" : (value ?? ""))
                }
              >
                <SelectTrigger
                  className="w-full"
                  disabled={!hasUnitOptions && !hasUnavailablePackageUnitValue}
                >
                  <SelectValue>
                    {getRelationalSelectTriggerLabel(
                      unitOptions,
                      packageUnitId,
                      "Tidak dipilih",
                      "Tidak ada data satuan",
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_LOOKUP_VALUE}>Tidak dipilih</SelectItem>
                  {hasUnitOptions ? (
                    unitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty_unit_package_1__" disabled>
                      Tidak ada data satuan
                    </SelectItem>
                  )}
                  {hasUnavailablePackageUnitValue ? (
                    <SelectItem value="__missing_unit_package_1__" disabled>
                      Pilihan tersimpan tidak tersedia
                    </SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
              <Input
                name="packageConversion"
                type="number"
                min={1}
                max={99999}
                placeholder="Isi"
                className="w-24"
                defaultValue={editingDetail?.packageConversion ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="packageUnit2Id">Satuan Kemasan 2</Label>
            <div className="flex gap-2">
              <Select
                value={packageUnit2Id || NO_LOOKUP_VALUE}
                onValueChange={(value) =>
                  setPackageUnit2Id(value === NO_LOOKUP_VALUE ? "" : (value ?? ""))
                }
              >
                <SelectTrigger
                  className="w-full"
                  disabled={!hasUnitOptions && !hasUnavailablePackageUnit2Value}
                >
                  <SelectValue>
                    {getRelationalSelectTriggerLabel(
                      unitOptions,
                      packageUnit2Id,
                      "Tidak dipilih",
                      "Tidak ada data satuan",
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_LOOKUP_VALUE}>Tidak dipilih</SelectItem>
                  {hasUnitOptions ? (
                    unitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty_unit_package_2__" disabled>
                      Tidak ada data satuan
                    </SelectItem>
                  )}
                  {hasUnavailablePackageUnit2Value ? (
                    <SelectItem value="__missing_unit_package_2__" disabled>
                      Pilihan tersimpan tidak tersedia
                    </SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
              <Input
                name="packageConversion2"
                type="number"
                min={1}
                max={99999}
                placeholder="Isi"
                className="w-24"
                defaultValue={editingDetail?.packageConversion2 ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="compoundUnitId">Satuan Racikan</Label>
            <div className="flex gap-2">
              <Select
                value={compoundUnitId || NO_LOOKUP_VALUE}
                onValueChange={(value) =>
                  setCompoundUnitId(value === NO_LOOKUP_VALUE ? "" : (value ?? ""))
                }
              >
                <SelectTrigger
                  className="w-full"
                  disabled={!hasUnitOptions && !hasUnavailableCompoundUnitValue}
                >
                  <SelectValue>
                    {getRelationalSelectTriggerLabel(
                      unitOptions,
                      compoundUnitId,
                      "Tidak dipilih",
                      "Tidak ada data satuan",
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_LOOKUP_VALUE}>Tidak dipilih</SelectItem>
                  {hasUnitOptions ? (
                    unitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty_unit_compound__" disabled>
                      Tidak ada data satuan
                    </SelectItem>
                  )}
                  {hasUnavailableCompoundUnitValue ? (
                    <SelectItem value="__missing_unit_compound__" disabled>
                      Pilihan tersimpan tidak tersedia
                    </SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
              <Input
                name="compoundQuantity"
                type="number"
                min={1}
                max={99999}
                placeholder="Qty"
                className="w-24"
                defaultValue={editingDetail?.compoundQuantity ?? ""}
              />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">
          Harga & Metode
        </legend>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pricingMethod">Metode Harga</Label>
            <Select
              name="pricingMethod"
              defaultValue={editingDetail?.pricingMethod ?? "hpp"}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRICING_METHOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inventoryMethod">Metode Inventori</Label>
            <Select
              name="inventoryMethod"
              defaultValue={editingDetail?.inventoryMethod ?? "average"}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INVENTORY_METHOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultTaxPct">PPN Default (%)</Label>
            <Input
              id="defaultTaxPct"
              name="defaultTaxPct"
              type="number"
              min={0}
              max={100}
              defaultValue={editingDetail?.defaultTaxPct ?? 0}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">
          Kode Integrasi
        </legend>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="kfaCode">Kode KFA</Label>
            <Input
              id="kfaCode"
              name="kfaCode"
              placeholder="Kode Katalog Farmasi & Alkes"
              defaultValue={editingDetail?.kfaCode ?? ""}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bpjsCode">Kode BPJS</Label>
            <Input
              id="bpjsCode"
              name="bpjsCode"
              placeholder="Kode e-Catalog BPJS"
              defaultValue={editingDetail?.bpjsCode ?? ""}
              maxLength={100}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">
          Spesifikasi
        </legend>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="composition">Komposisi</Label>
              <CharCounter value={composition} max={800} />
            </div>
            <Textarea
              id="composition"
              name="composition"
              placeholder="Komposisi obat..."
              maxLength={800}
              value={composition}
              onChange={(e) => setComposition(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="indications">Indikasi</Label>
              <CharCounter value={indications} max={255} />
            </div>
            <Textarea
              id="indications"
              name="indications"
              placeholder="Indikasi penggunaan..."
              maxLength={255}
              value={indications}
              onChange={(e) => setIndications(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="contraindications">Kontra Indikasi</Label>
              <CharCounter value={contraindications} max={255} />
            </div>
            <Textarea
              id="contraindications"
              name="contraindications"
              placeholder="Kontra indikasi..."
              maxLength={255}
              value={contraindications}
              onChange={(e) => setContraindications(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="drugInteractions">Interaksi Obat</Label>
              <CharCounter value={drugInteractions} max={255} />
            </div>
            <Textarea
              id="drugInteractions"
              name="drugInteractions"
              placeholder="Interaksi obat..."
              maxLength={255}
              value={drugInteractions}
              onChange={(e) => setDrugInteractions(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="warnings">Peringatan</Label>
              <CharCounter value={warnings} max={255} />
            </div>
            <Textarea
              id="warnings"
              name="warnings"
              placeholder="Peringatan penggunaan..."
              maxLength={255}
              value={warnings}
              onChange={(e) => setWarnings(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="dosageInfo">Informasi Dosis</Label>
              <CharCounter value={dosageInfo} max={255} />
            </div>
            <Textarea
              id="dosageInfo"
              name="dosageInfo"
              placeholder="Informasi dosis..."
              maxLength={255}
              value={dosageInfo}
              onChange={(e) => setDosageInfo(e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <MasterFormActions
        onCancel={onCancel}
        isPending={isPending}
        submitLabel={isEditing ? "Simpan Perubahan" : "Simpan Obat"}
      />
    </form>
  );
}
