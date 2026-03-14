"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { MasterFormActions } from "@/components/shared/master-data-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getDefaultTariffComponentDefinition,
  type TariffComponentDefinition,
} from "@/lib/tariff-components";

import {
  createTariffComponent,
  updateTariffComponent,
  type TariffComponentDetail,
} from "./actions";

type TariffComponentFormProps = {
  editingDetail: TariffComponentDetail | null;
  nextDefinition: TariffComponentDefinition | null;
  nextCode: string | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function TariffComponentForm({
  editingDetail,
  nextDefinition,
  nextCode,
  onSuccess,
  onCancel,
}: TariffComponentFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!editingDetail;
  const definition = editingDetail?.feeKey
    ? getDefaultTariffComponentDefinition(editingDetail.feeKey)
    : nextDefinition;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateTariffComponent(editingDetail.id, payload)
        : await createTariffComponent(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        isEditing
          ? "Komponen tarif berhasil diperbarui"
          : "Komponen tarif berhasil ditambahkan",
      );
      onSuccess();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">ID</Label>
          <Input
            id="code"
            value={editingDetail?.code ?? nextCode ?? definition?.code ?? "Otomatis"}
            disabled
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Komponen Tarif</Label>
          <Input
            id="name"
            name="name"
            defaultValue={editingDetail?.name ?? nextDefinition?.name ?? ""}
            placeholder="Masukkan nama komponen tarif"
            required
          />
        </div>
      </div>

      <MasterFormActions
        onCancel={onCancel}
        isPending={isPending}
        submitLabel={isEditing ? "Simpan Perubahan" : "Simpan"}
      />
    </form>
  );
}
