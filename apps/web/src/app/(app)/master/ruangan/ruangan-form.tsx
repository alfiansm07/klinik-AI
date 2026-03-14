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

import {
  createRuangan,
  updateRuangan,
  type RuanganDetail,
  type RuanganFormData,
} from "./actions";
import {
  INSTALLATION_LABELS,
  VISIT_TYPE_LABELS,
  type RoomInstallation,
  type RoomVisitType,
} from "./constants";

type RuanganFormProps = {
  editingDetail: RuanganDetail | null;
  nextCode: string | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function RuanganForm({
  editingDetail,
  nextCode,
  onSuccess,
  onCancel,
}: RuanganFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!editingDetail;

  const [visitType, setVisitType] = useState<RoomVisitType>(
    editingDetail?.visitType ?? "rawat_jalan",
  );
  const noInstallationValue = "__none__";
  const [installation, setInstallation] = useState<RoomInstallation | "">(
    editingDetail?.installation ?? "",
  );
  const [isCallRoom, setIsCallRoom] = useState(editingDetail?.isCallRoom ?? false);
  const [isCallApotek, setIsCallApotek] = useState(
    editingDetail?.isCallApotek ?? false,
  );
  const [isCallLab, setIsCallLab] = useState(editingDetail?.isCallLab ?? false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: RuanganFormData = {
      name: formData.get("name") as string,
      visitType,
      installation: installation || null,
      pcarePoli: (formData.get("pcarePoli") as string) || null,
      voiceCode: (formData.get("voiceCode") as string) || null,
      isCallRoom,
      isCallApotek,
      isCallLab,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateRuangan(editingDetail.id, data)
        : await createRuangan(data);

      if (result.success) {
        toast.success(
          isEditing ? "Ruangan berhasil diperbarui" : "Ruangan berhasil ditambahkan",
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
        <legend className="text-sm font-semibold text-foreground">Informasi Ruangan</legend>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">
              Kode Ruangan <span className="text-destructive">*</span>
            </Label>
            <Input id="code" value={editingDetail?.code ?? nextCode ?? ""} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Nama Ruangan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. POLI UMUM"
              defaultValue={editingDetail?.name ?? ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visitType">
              Jenis Kunjungan <span className="text-destructive">*</span>
            </Label>
            <Select value={visitType} onValueChange={(value) => setVisitType(value as RoomVisitType)}>
              <SelectTrigger id="visitType" className="w-full">
                <SelectValue placeholder="Pilih jenis kunjungan" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VISIT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="installation">Instalasi</Label>
            <Select
              value={installation || noInstallationValue}
              onValueChange={(value) => {
                setInstallation(value === noInstallationValue ? "" : (value as RoomInstallation));
              }}
            >
              <SelectTrigger id="installation" className="w-full">
                <SelectValue placeholder="Pilih instalasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={noInstallationValue}>Tanpa instalasi</SelectItem>
                {Object.entries(INSTALLATION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pcarePoli">Mapping PCare</Label>
            <Input
              id="pcarePoli"
              name="pcarePoli"
              placeholder="e.g. UMUM"
              defaultValue={editingDetail?.pcarePoli ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voiceCode">Kode Suara</Label>
            <Input
              id="voiceCode"
              name="voiceCode"
              placeholder="e.g. A1"
              defaultValue={editingDetail?.voiceCode ?? ""}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Pengaturan Panggil</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Checkbox id="isCallRoom" checked={isCallRoom} onCheckedChange={(checked) => setIsCallRoom(checked === true)} />
            <Label htmlFor="isCallRoom" className="cursor-pointer">Panggil Ruangan</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="isCallApotek" checked={isCallApotek} onCheckedChange={(checked) => setIsCallApotek(checked === true)} />
            <Label htmlFor="isCallApotek" className="cursor-pointer">Panggil Apotek</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="isCallLab" checked={isCallLab} onCheckedChange={(checked) => setIsCallLab(checked === true)} />
            <Label htmlFor="isCallLab" className="cursor-pointer">Panggil Lab</Label>
          </div>
        </div>
      </fieldset>

      <MasterFormActions
        onCancel={onCancel}
        isPending={isPending}
        submitLabel={isEditing ? "Simpan Perubahan" : "Simpan"}
      />
    </form>
  );
}
