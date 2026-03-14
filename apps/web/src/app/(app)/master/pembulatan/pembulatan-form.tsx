"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  MASTER_DETAIL_SECTION_CLASSNAME,
  MasterFormActions,
} from "@/components/shared/master-data-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateRoundingSettings } from "../klinik/actions";

type PembulatanFormProps = {
  defaultValues: {
    name: string;
    value: number;
  } | null;
};

export function PembulatanForm({ defaultValues }: PembulatanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateRoundingSettings(formData);
      if (result.success) {
        toast.success("Konfigurasi pembulatan berhasil diperbarui");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <section className={MASTER_DETAIL_SECTION_CLASSNAME}>
      <div>
        <h2 className="text-base font-semibold text-foreground">Konfigurasi Pembulatan</h2>
        <p className="text-sm text-muted-foreground">
          Tentukan nama konfigurasi dan nilai pembulatan yang dipakai klinik.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-2">
            <Label htmlFor="roundingName">
              Nama Pembulatan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="roundingName"
              name="roundingName"
              placeholder="Pembulatan"
              defaultValue={defaultValues?.name ?? "Pembulatan"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roundingValue">
              Nilai Pembulatan <span className="text-destructive">*</span>
            </Label>
            <div className="flex overflow-hidden rounded-lg border bg-background">
              <div className="flex items-center border-r bg-muted px-3 text-sm font-medium text-muted-foreground">
                Rp.
              </div>
              <Input
                id="roundingValue"
                name="roundingValue"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                className="border-0 rounded-none"
                placeholder="10000"
                defaultValue={defaultValues?.value ?? 10000}
                required
              />
            </div>
          </div>
        </div>

        <MasterFormActions
          onCancel={() => router.push("/master")}
          cancelLabel="Reset"
          isPending={isPending}
          submitLabel="Simpan"
        />
      </form>
    </section>
  );
}
