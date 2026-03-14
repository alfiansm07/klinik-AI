"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MasterFormActions } from "@/components/shared/master-data-ui";

import { updateClinicSettings } from "./actions";
import type { ClinicSettings } from "@klinik-AI/db/schema/tenant";

type KlinikSettingsFormProps = {
  settings: ClinicSettings | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function KlinikSettingsForm({
  settings,
  onSuccess,
  onCancel,
}: KlinikSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const s = settings ?? {};
  const social = s.socialMedia ?? {};

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateClinicSettings(formData);
      if (result.success) {
        toast.success("Pengaturan klinik berhasil diperbarui");
        onSuccess();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pengaturan Cetak */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">
          Pengaturan Cetak
        </legend>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              name="tagline"
              placeholder="Tagline klinik"
              defaultValue={s.tagline ?? ""}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="headerText">Kop Surat</Label>
            <Input
              id="headerText"
              name="headerText"
              placeholder="Teks kop surat"
              defaultValue={s.headerText ?? ""}
              maxLength={200}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="footerText">Catatan Bawah Struk</Label>
            <Textarea
              id="footerText"
              name="footerText"
              placeholder="Catatan yang tercetak di bawah struk"
              defaultValue={s.footerText ?? ""}
              className="resize-none"
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="receiptNote">Catatan Kwitansi</Label>
            <Textarea
              id="receiptNote"
              name="receiptNote"
              placeholder="Catatan tambahan untuk kwitansi"
              defaultValue={s.receiptNote ?? ""}
              className="resize-none"
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="printNote">Catatan Cetak</Label>
            <Textarea
              id="printNote"
              name="printNote"
              placeholder="Catatan umum untuk cetakan"
              defaultValue={s.printNote ?? ""}
              className="resize-none"
              rows={2}
              maxLength={500}
            />
          </div>
        </div>
      </fieldset>

      {/* Media Sosial */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">
          Media Sosial
        </legend>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="socialFacebook">Facebook</Label>
            <Input
              id="socialFacebook"
              name="socialFacebook"
              placeholder="URL atau username Facebook"
              defaultValue={social.facebook ?? ""}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialTwitter">Twitter / X</Label>
            <Input
              id="socialTwitter"
              name="socialTwitter"
              placeholder="URL atau username Twitter"
              defaultValue={social.twitter ?? ""}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialInstagram">Instagram</Label>
            <Input
              id="socialInstagram"
              name="socialInstagram"
              placeholder="URL atau username Instagram"
              defaultValue={social.instagram ?? ""}
              maxLength={200}
            />
          </div>
        </div>
      </fieldset>

      <MasterFormActions
        onCancel={onCancel}
        isPending={isPending}
        submitLabel="Simpan Pengaturan"
      />
    </form>
  );
}
