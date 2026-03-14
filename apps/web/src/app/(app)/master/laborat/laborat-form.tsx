"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { MasterFormActions } from "@/components/shared/master-data-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import {
  createLaborat,
  updateLaborat,
  type LaboratDetail,
  type LaboratFormData,
} from "./actions";

// ─── Form ─────────────────────────────────────────────────────

type LaboratFormProps = {
  editingDetail: LaboratDetail | null;
  nextCode: string | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function LaboratForm({
  editingDetail,
  nextCode,
  onSuccess,
  onCancel,
}: LaboratFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!editingDetail;

  const [isClinicalAndWater, setIsClinicalAndWater] = useState(
    editingDetail?.isClinicalAndWater ?? false,
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: LaboratFormData = {
      name: formData.get("name") as string,
      isClinicalAndWater,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateLaborat(editingDetail.id, data)
        : await createLaborat(data);

      if (result.success) {
        toast.success(
          isEditing
            ? "Jenis laboratorium berhasil diperbarui"
            : "Jenis laboratorium berhasil ditambahkan",
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
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">
              Kode <span className="text-destructive">*</span>
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
              Jenis Pemeriksaan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. HEMATOLOGI"
              defaultValue={editingDetail?.name ?? ""}
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2 sm:col-span-2">
            <Checkbox
              id="isClinicalAndWater"
              checked={isClinicalAndWater}
              onCheckedChange={(checked) =>
                setIsClinicalAndWater(checked === true)
              }
            />
            <Label htmlFor="isClinicalAndWater" className="cursor-pointer">
              Klinis Dan Air
            </Label>
          </div>
        </div>
      </fieldset>

      {/* Actions */}
      <MasterFormActions
        onCancel={onCancel}
        isPending={isPending}
        submitLabel={isEditing ? "Simpan Perubahan" : "Simpan"}
      />
    </form>
  );
}
