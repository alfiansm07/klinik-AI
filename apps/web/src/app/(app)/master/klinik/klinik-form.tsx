"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MasterFormActions } from "@/components/shared/master-data-ui";

import { updateClinicProfile, type ClinicProfile } from "./actions";

type KlinikFormProps = {
  profile: ClinicProfile;
  onSuccess: () => void;
  onCancel: () => void;
};

export function KlinikForm({ profile, onSuccess, onCancel }: KlinikFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateClinicProfile(formData);
      if (result.success) {
        toast.success("Profil klinik berhasil diperbarui");
        onSuccess();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informasi Umum */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">
          Informasi Umum
        </legend>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">Kode Klinik</Label>
            <Input
              id="code"
              name="code"
              defaultValue={profile.code ?? ""}
              disabled
              className="bg-muted"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Nama Klinik <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Nama klinik"
              defaultValue={profile.name}
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Alamat lengkap klinik"
              defaultValue={profile.address ?? ""}
              className="resize-none"
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Kota</Label>
            <Input
              id="city"
              name="city"
              placeholder="e.g. Jakarta"
              defaultValue={profile.city ?? ""}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telepon</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g. 021-1234567"
              defaultValue={profile.phone ?? ""}
              maxLength={30}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. info@klinik.com"
              defaultValue={profile.email ?? ""}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="e.g. https://klinik.com"
              defaultValue={profile.website ?? ""}
              maxLength={200}
            />
          </div>
        </div>
      </fieldset>

      {/* Kepemilikan & Legalitas */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">
          Kepemilikan & Legalitas
        </legend>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ownerName">Nama Pemilik</Label>
            <Input
              id="ownerName"
              name="ownerName"
              placeholder="Nama pemilik klinik"
              defaultValue={profile.ownerName ?? ""}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibleDoctor">Penanggung Jawab Medis</Label>
            <Input
              id="responsibleDoctor"
              name="responsibleDoctor"
              placeholder="dr. Nama Lengkap"
              defaultValue={profile.responsibleDoctor ?? ""}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sipNumber">Nomor SIP PJ</Label>
            <Input
              id="sipNumber"
              name="sipNumber"
              placeholder="Nomor SIP penanggung jawab"
              defaultValue={profile.sipNumber ?? ""}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">Nomor Izin Operasional</Label>
            <Input
              id="licenseNumber"
              name="licenseNumber"
              placeholder="Nomor izin operasional klinik"
              defaultValue={profile.licenseNumber ?? ""}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="npwpNumber">NPWP</Label>
            <Input
              id="npwpNumber"
              name="npwpNumber"
              placeholder="Nomor NPWP klinik"
              defaultValue={profile.npwpNumber ?? ""}
              maxLength={50}
            />
          </div>
        </div>
      </fieldset>

      <MasterFormActions
        onCancel={onCancel}
        isPending={isPending}
        submitLabel="Simpan Perubahan"
      />
    </form>
  );
}
