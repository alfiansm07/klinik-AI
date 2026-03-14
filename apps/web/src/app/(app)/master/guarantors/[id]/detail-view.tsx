"use client";

import { useState, useTransition } from "react";
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

import { deleteGuarantor, type GuarantorDetail } from "../actions";
import { GuarantorForm } from "../guarantor-form";
import {
  formatBooleanLabel,
  GUARANTOR_CATEGORY_LABELS,
  GUARANTOR_TYPE_LABELS,
} from "../guarantor-shared";

type GuarantorDetailViewProps = {
  detail: GuarantorDetail;
};

export function GuarantorDetailView({ detail }: GuarantorDetailViewProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, startDeleting] = useTransition();

  const generalFields: MasterDetailField[] = [
    { label: "Kode", value: detail.code },
    { label: "Nama Penjamin", value: detail.name },
    { label: "Kategori", value: GUARANTOR_CATEGORY_LABELS[detail.category] },
    { label: "Jenis", value: GUARANTOR_TYPE_LABELS[detail.type] },
    { label: "Status", value: detail.isActive ? "Aktif" : "Nonaktif" },
  ];

  const insuranceFields: MasterDetailField[] = [
    { label: "Bridging BPJS", value: formatBooleanLabel(detail.bpjsBridging) },
    {
      label: "Tampilkan Nomor Asuransi",
      value: formatBooleanLabel(detail.showInsuranceNumber),
    },
    {
      label: "Nomor Asuransi Wajib Isi",
      value: formatBooleanLabel(detail.insuranceNumberRequired),
    },
    {
      label: "Bridging Mandiri Inhealth",
      value: formatBooleanLabel(detail.mandiriInhealthBridging),
    },
    {
      label: "Setting Margin",
      value: formatBooleanLabel(detail.marginSettingEnabled),
    },
  ];

  const companyFields: MasterDetailField[] = [
    { label: "Nama PIC", value: detail.picName || "-" },
    { label: "Nomor Telepon", value: detail.phone || "-" },
    { label: "Alamat", value: detail.address || "-" },
  ];

  function handleDelete() {
    startDeleting(async () => {
      const result = await deleteGuarantor(detail.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Data penjamin berhasil dihapus");
      router.push("/master/guarantors");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          className={MASTER_ACTION_BUTTON_CLASSNAME}
          onClick={() => router.push("/master/guarantors")}
        >
          Lihat Semua
        </Button>
      </div>

      <MasterDetailSection
        title="Informasi Penjamin"
        description="Ringkasan identitas dan klasifikasi utama penjamin."
        fields={generalFields}
      />

      {detail.category === "insurance" ? (
        <MasterDetailSection
          title="Pengaturan Asuransi"
          description="Konfigurasi bridging dan kebutuhan nomor asuransi."
          fields={insuranceFields}
        />
      ) : (
        <MasterDetailSection
          title="Kontak Perusahaan"
          description="Kontak utama perusahaan penjamin lainnya."
          fields={companyFields}
        />
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="destructive"
          className={MASTER_ACTION_BUTTON_CLASSNAME}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Hapus
        </Button>
        <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={() => setEditDialogOpen(true)}>
          Ubah
        </Button>
      </div>

      <FormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Ubah Data Penjamin"
        description="Perbarui informasi penjamin sesuai kategori yang sedang dipilih."
      >
        <GuarantorForm
          editingDetail={detail}
          nextCode={null}
          defaultCategory={detail.category}
          onSuccess={() => {
            setEditDialogOpen(false);
            router.refresh();
          }}
          onCancel={() => setEditDialogOpen(false)}
        />
      </FormDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data penjamin?</AlertDialogTitle>
            <AlertDialogDescription>
              Data penjamin yang sudah dihapus tidak bisa dikembalikan. Jika data
              ini sudah dipakai transaksi lain, penghapusan akan ditolak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
