"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/shared/form-dialog";
import { MASTER_ACTION_BUTTON_CLASSNAME } from "@/components/shared/master-data-ui";

import type { ClinicProfile } from "./actions";
import { KlinikForm } from "./klinik-form";
import { KlinikSettingsForm } from "./klinik-settings-form";

// ─── Helpers ──────────────────────────────────────────────────

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// ─── Stacked field layout (label above value) ─────────────────

type FieldItem = { label: string; value: ReactNode };

function FieldStack({ fields }: { fields: FieldItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.label} className="space-y-1">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {f.label}
          </dt>
          <dd className="text-sm text-foreground">{f.value ?? "—"}</dd>
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="font-heading text-base font-semibold text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

// ─── Main View ────────────────────────────────────────────────

type KlinikViewProps = {
  profile: ClinicProfile;
};

export function KlinikView({ profile }: KlinikViewProps) {
  const router = useRouter();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editSettingsOpen, setEditSettingsOpen] = useState(false);

  const settings = profile.settings ?? {};
  const social = settings.socialMedia ?? {};

  function handleEditProfileSuccess() {
    setEditProfileOpen(false);
    router.refresh();
  }

  function handleEditSettingsSuccess() {
    setEditSettingsOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Informasi Umum */}
      <Section
        title="Informasi Umum"
        description="Identitas dan kontak klinik."
      >
        <FieldStack
          fields={[
            { label: "Kode Klinik", value: profile.code },
            { label: "Nama Klinik", value: profile.name },
            { label: "Alamat", value: profile.address },
            { label: "Kota", value: profile.city },
            { label: "Telepon", value: profile.phone },
            { label: "Email", value: profile.email },
            {
              label: "Website",
              value: profile.website ? (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  {profile.website}
                </a>
              ) : null,
            },
          ]}
        />
      </Section>

      {/* Kepemilikan & Legalitas */}
      <Section
        title="Kepemilikan & Legalitas"
        description="Data pemilik, penanggung jawab medis, dan dokumen legal."
      >
        <FieldStack
          fields={[
            { label: "Nama Pemilik", value: profile.ownerName },
            {
              label: "Penanggung Jawab Medis",
              value: profile.responsibleDoctor,
            },
            { label: "Nomor SIP PJ", value: profile.sipNumber },
            { label: "Nomor Izin Operasional", value: profile.licenseNumber },
            { label: "NPWP", value: profile.npwpNumber },
          ]}
        />
      </Section>

      {/* Pengaturan Cetak */}
      <Section
        title="Pengaturan Cetak"
        description="Kop surat, tagline, dan catatan untuk struk dan kwitansi."
      >
        <FieldStack
          fields={[
            { label: "Tagline", value: settings.tagline },
            { label: "Kop Surat", value: settings.headerText },
            { label: "Catatan Bawah Struk", value: settings.footerText },
            { label: "Catatan Kwitansi", value: settings.receiptNote },
            { label: "Catatan Cetak", value: settings.printNote },
          ]}
        />
      </Section>

      {/* Media Sosial */}
      <Section
        title="Media Sosial"
        description="Akun media sosial klinik."
      >
        <FieldStack
          fields={[
            { label: "Facebook", value: social.facebook },
            { label: "Twitter / X", value: social.twitter },
            { label: "Instagram", value: social.instagram },
          ]}
        />
      </Section>

      {/* Status & Waktu */}
      <Section
        title="Status & Waktu"
        description="Status klinik dan informasi waktu pembuatan."
      >
        <FieldStack
          fields={[
            {
              label: "Status",
              value: profile.isActive ? "Aktif" : "Tidak Aktif",
            },
            { label: "Dibuat", value: formatDate(profile.createdAt) },
            {
              label: "Terakhir Diperbarui",
              value: formatDate(profile.updatedAt),
            },
          ]}
        />
      </Section>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          className={MASTER_ACTION_BUTTON_CLASSNAME}
          onClick={() => setEditSettingsOpen(true)}
        >
          <Pencil className="h-4 w-4" />
          Ubah Pengaturan
        </Button>
        <Button
          className={MASTER_ACTION_BUTTON_CLASSNAME}
          onClick={() => setEditProfileOpen(true)}
        >
          <Pencil className="h-4 w-4" />
          Ubah Profil
        </Button>
      </div>

      {/* Edit Profile Dialog */}
      <FormDialog
        open={editProfileOpen}
        onOpenChange={(open) => {
          if (!open) setEditProfileOpen(false);
        }}
        title="Ubah Profil Klinik"
        description="Perbarui informasi umum dan legalitas klinik."
        className="sm:max-w-2xl"
      >
        <KlinikForm
          profile={profile}
          onSuccess={handleEditProfileSuccess}
          onCancel={() => setEditProfileOpen(false)}
        />
      </FormDialog>

      {/* Edit Settings Dialog */}
      <FormDialog
        open={editSettingsOpen}
        onOpenChange={(open) => {
          if (!open) setEditSettingsOpen(false);
        }}
        title="Ubah Pengaturan Klinik"
        description="Perbarui pengaturan cetak dan media sosial."
        className="sm:max-w-2xl"
      >
        <KlinikSettingsForm
          settings={profile.settings}
          onSuccess={handleEditSettingsSuccess}
          onCancel={() => setEditSettingsOpen(false)}
        />
      </FormDialog>
    </div>
  );
}
