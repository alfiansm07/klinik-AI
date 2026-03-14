"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { MasterFormActions } from "@/components/shared/master-data-ui";
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
  createGuarantor,
  updateGuarantor,
  type GuarantorDetail,
} from "./actions";
import {
  GUARANTOR_CATEGORY_LABELS,
  GUARANTOR_TYPE_LABELS,
  INSURANCE_GUARANTOR_TYPES,
  isInsuranceGuarantorType,
  type GuarantorCategory,
  type InsuranceGuarantorType,
} from "./guarantor-shared";

type GuarantorFormProps = {
  editingDetail: GuarantorDetail | null;
  nextCode: string | null;
  defaultCategory: GuarantorCategory;
  onSuccess: () => void;
  onCancel: () => void;
};

export function GuarantorForm({
  editingDetail,
  nextCode,
  defaultCategory,
  onSuccess,
  onCancel,
}: GuarantorFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!editingDetail;
  const category = editingDetail?.category ?? defaultCategory;

  const initialInsuranceType =
    editingDetail &&
    editingDetail.category === "insurance" &&
    isInsuranceGuarantorType(editingDetail.type)
      ? editingDetail.type
      : "pribadi";

  const [insuranceType, setInsuranceType] =
    useState<InsuranceGuarantorType>(initialInsuranceType);
  const [bpjsBridging, setBpjsBridging] = useState(
    editingDetail?.bpjsBridging ?? false,
  );
  const [showInsuranceNumber, setShowInsuranceNumber] = useState(
    editingDetail?.showInsuranceNumber ?? false,
  );
  const [insuranceNumberRequired, setInsuranceNumberRequired] = useState(
    editingDetail?.insuranceNumberRequired ?? false,
  );
  const [mandiriInhealthBridging, setMandiriInhealthBridging] = useState(
    editingDetail?.mandiriInhealthBridging ?? false,
  );
  const [marginSettingEnabled, setMarginSettingEnabled] = useState(
    editingDetail?.marginSettingEnabled ?? false,
  );

  function handleInsuranceTypeChange(value: InsuranceGuarantorType | null) {
    if (value && INSURANCE_GUARANTOR_TYPES.some((type) => type === value)) {
      setInsuranceType(value as InsuranceGuarantorType);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      category,
      name: String(formData.get("name") ?? ""),
      insuranceType: category === "insurance" ? insuranceType : undefined,
      bpjsBridging,
      showInsuranceNumber,
      insuranceNumberRequired,
      mandiriInhealthBridging,
      marginSettingEnabled,
      picName: String(formData.get("picName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateGuarantor(editingDetail.id, payload)
        : await createGuarantor(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        isEditing
          ? "Data penjamin berhasil diperbarui"
          : "Data penjamin berhasil ditambahkan",
      );
      onSuccess();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Kode</Label>
          <Input
            id="code"
            value={editingDetail?.code ?? nextCode ?? ""}
            disabled
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label>Kategori</Label>
          <Input value={GUARANTOR_CATEGORY_LABELS[category]} disabled className="bg-muted" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">
            {category === "insurance" ? "Nama Asuransi" : "Nama Penjamin"}
          </Label>
          <Input
            id="name"
            name="name"
            placeholder={
              category === "insurance"
                ? "Contoh: BPJS Kesehatan"
                : "Contoh: PT Penjamin Sehat Indonesia"
            }
            defaultValue={editingDetail?.name ?? ""}
            required
          />
        </div>

        {category === "insurance" ? (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="insuranceType">Jenis Asuransi</Label>
            <Select value={insuranceType} onValueChange={handleInsuranceTypeChange}>
              <SelectTrigger id="insuranceType" className="w-full">
                <SelectValue placeholder="Pilih jenis asuransi" />
              </SelectTrigger>
              <SelectContent>
                {INSURANCE_GUARANTOR_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {GUARANTOR_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="picName">Nama PIC</Label>
              <Input
                id="picName"
                name="picName"
                placeholder="Contoh: Amar"
                defaultValue={editingDetail?.picName ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Contoh: 081234567890"
                defaultValue={editingDetail?.phone ?? ""}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                name="address"
                rows={4}
                placeholder="Masukkan alamat perusahaan penjamin"
                defaultValue={editingDetail?.address ?? ""}
              />
            </div>
          </>
        )}
      </div>

      {category === "insurance" ? (
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium">Pengaturan Asuransi</h3>
            <p className="text-sm text-muted-foreground">
              Sesuaikan perilaku bridging dan tampilan nomor asuransi.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border p-4 text-sm">
              <Checkbox
                checked={bpjsBridging}
                onCheckedChange={(checked) => setBpjsBridging(checked === true)}
              />
              <span>
                <span className="font-medium">Bridging BPJS</span>
                <span className="mt-1 block text-muted-foreground">
                  Aktifkan jika penjamin memakai integrasi BPJS.
                </span>
              </span>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-4 text-sm">
              <Checkbox
                checked={showInsuranceNumber}
                onCheckedChange={(checked) =>
                  setShowInsuranceNumber(checked === true)
                }
              />
              <span>
                <span className="font-medium">Tampilkan Nomor Asuransi</span>
                <span className="mt-1 block text-muted-foreground">
                  Menampilkan input nomor asuransi pada alur pelayanan.
                </span>
              </span>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-4 text-sm">
              <Checkbox
                checked={insuranceNumberRequired}
                onCheckedChange={(checked) =>
                  setInsuranceNumberRequired(checked === true)
                }
              />
              <span>
                <span className="font-medium">Nomor Asuransi Wajib Isi</span>
                <span className="mt-1 block text-muted-foreground">
                  Wajibkan nomor asuransi saat data pasien diproses.
                </span>
              </span>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-4 text-sm">
              <Checkbox
                checked={mandiriInhealthBridging}
                onCheckedChange={(checked) =>
                  setMandiriInhealthBridging(checked === true)
                }
              />
              <span>
                <span className="font-medium">Bridging Mandiri Inhealth</span>
                <span className="mt-1 block text-muted-foreground">
                  Tandai jika perlu integrasi khusus Mandiri Inhealth.
                </span>
              </span>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-4 text-sm md:col-span-2">
              <Checkbox
                checked={marginSettingEnabled}
                onCheckedChange={(checked) =>
                  setMarginSettingEnabled(checked === true)
                }
              />
              <span>
                <span className="font-medium">Setting Margin</span>
                <span className="mt-1 block text-muted-foreground">
                  Gunakan pengaturan margin khusus untuk penjamin ini.
                </span>
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <MasterFormActions
        onCancel={onCancel}
        isPending={isPending}
        submitLabel={isEditing ? "Simpan Perubahan" : "Simpan"}
      />
    </form>
  );
}
