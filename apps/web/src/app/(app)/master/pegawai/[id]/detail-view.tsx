"use client";

import type { Route } from "next";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { FormDialog } from "@/components/shared/form-dialog";
import {
  MASTER_ACTION_BUTTON_CLASSNAME,
  MasterDetailSection,
  type MasterDetailField,
} from "@/components/shared/master-data-ui";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { deletePegawai, type PegawaiDetail } from "../actions";
import { PegawaiForm } from "../pegawai-form";
import {
  formatJabatanLabel,
  formatPegawaiDisplayName,
  formatPegawaiGenderLabel,
  formatPegawaiLicenseTypeLabel,
  formatPegawaiMaritalStatusLabel,
  formatPegawaiReligionLabel,
} from "../pegawai-shared";

type PegawaiDetailViewProps = {
  detail: PegawaiDetail;
};

export function PegawaiDetailView({ detail }: PegawaiDetailViewProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const fields: MasterDetailField[] = [
    { label: "Kode Pegawai", value: detail.code },
    { label: "Nama Lengkap", value: formatPegawaiDisplayName(detail) },
    { label: "NIK", value: detail.nik ?? "-" },
    { label: "NIP/NRP", value: detail.nip ?? "-" },
    { label: "Referensi Eksternal", value: detail.externalReference ?? "-" },
    { label: "Jenis Kelamin", value: formatPegawaiGenderLabel(detail.gender) },
    { label: "Tempat Lahir", value: detail.birthPlace ?? "-" },
    {
      label: "Tanggal Lahir",
      value: detail.birthDate ? detail.birthDate.toLocaleDateString("id-ID") : "-",
    },
    { label: "Agama", value: formatPegawaiReligionLabel(detail.religion) },
    { label: "Status Perkawinan", value: formatPegawaiMaritalStatusLabel(detail.maritalStatus) },
    { label: "Alamat", value: detail.address ?? "-" },
    { label: "Email", value: detail.email ?? "-" },
    { label: "Telp/HP", value: detail.phone ?? "-" },
    { label: "Jabatan", value: formatJabatanLabel(detail.position) },
    { label: "Instansi Induk", value: detail.parentInstitutionName ?? "-" },
    { label: "Nama Tempat Bekerja Sekarang", value: detail.workplaceName },
    { label: "Status", value: detail.isActive ? "Aktif" : "Tidak Aktif" },
  ];

  return (
    <>
      <div className="flex justify-end">
        <Link href={"/master/pegawai" as Route}>
          <Button variant="outline" className={MASTER_ACTION_BUTTON_CLASSNAME}>Lihat Semua</Button>
        </Link>
      </div>

      <MasterDetailSection
        title="Informasi Pegawai"
        description="Ringkasan identitas, kontak, dan penempatan kerja pegawai."
        fields={fields}
      />

      <MasterDetailSection title="Perizinan" description="Daftar izin praktik dan legalitas pegawai.">
        {detail.licenses.length > 0 ? (
          <>
            <div className="grid gap-4 md:hidden">
              {detail.licenses.map((license) => (
                <div key={license.id} className="rounded-xl border bg-background p-4 text-sm">
                  <div className="grid gap-3">
                    <LicenseField label="Jenis" value={formatPegawaiLicenseTypeLabel(license.licenseType)} />
                    <LicenseField label="Nomor" value={license.licenseNumber} />
                    <LicenseField label="Terbit" value={license.issuedDate ? license.issuedDate.toLocaleDateString("id-ID") : "-"} />
                    <LicenseField
                      label="Berlaku Sampai"
                      value={license.isLifetime ? "Seumur Hidup" : license.validUntil ? license.validUntil.toLocaleDateString("id-ID") : "-"}
                    />
                    <LicenseField label="Catatan" value={license.notes ?? "-"} />
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border bg-background md:block">
              <table className="min-w-[720px] w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/60 text-left">
                    <th className="px-4 py-3 font-medium">Jenis</th>
                    <th className="px-4 py-3 font-medium">Nomor</th>
                    <th className="px-4 py-3 font-medium">Terbit</th>
                    <th className="px-4 py-3 font-medium">Berlaku Sampai</th>
                    <th className="px-4 py-3 font-medium">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.licenses.map((license) => (
                    <tr key={license.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3 break-words">{formatPegawaiLicenseTypeLabel(license.licenseType)}</td>
                      <td className="px-4 py-3 break-words">{license.licenseNumber}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{license.issuedDate ? license.issuedDate.toLocaleDateString("id-ID") : "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{license.isLifetime ? "Seumur Hidup" : license.validUntil ? license.validUntil.toLocaleDateString("id-ID") : "-"}</td>
                      <td className="px-4 py-3 break-words">{license.notes ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="rounded-xl border bg-background px-4 py-6 text-center text-sm text-muted-foreground">
            Belum ada data izin.
          </div>
        )}
      </MasterDetailSection>

      <div className="flex justify-end gap-2">
        <Button variant="outline" className={MASTER_ACTION_BUTTON_CLASSNAME} disabled={isDeleting} onClick={() => setDeleteDialogOpen(true)}>
          {isDeleting ? "Menghapus..." : "Hapus"}
        </Button>
        <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={() => setEditDialogOpen(true)}>
          Ubah
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pegawai?</AlertDialogTitle>
            <AlertDialogDescription>
              Data "{detail.fullName}" akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                startDeleteTransition(async () => {
                  const result = await deletePegawai(detail.id);
                  if (!result.success) {
                    toast.error(result.error);
                    return;
                  }

                  toast.success("Pegawai berhasil dihapus");
                  router.push("/master/pegawai" as Route);
                });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Ubah Pegawai"
        description="Perbarui data pegawai dan perizinannya."
        className="sm:max-w-6xl"
      >
        <PegawaiForm
          editingDetail={detail}
          nextCode={null}
          onCancel={() => setEditDialogOpen(false)}
          onSuccess={() => {
            setEditDialogOpen(false);
            router.refresh();
          }}
        />
      </FormDialog>
    </>
  );
}

function LicenseField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="break-words text-foreground">{value}</p>
    </div>
  );
}
