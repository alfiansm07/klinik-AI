"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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
import { FormDialog } from "@/components/shared/form-dialog";
import {
  MASTER_ACTION_BUTTON_CLASSNAME,
  MasterDetailSection,
  type MasterDetailField,
} from "@/components/shared/master-data-ui";

import { deleteObat, type ObatDetailWithNames } from "../actions";
import {
  ObatForm,
  type ObatLookups,
} from "../obat-form";
import {
  formatInventoryMethodLabel,
  formatPricingMethodLabel,
} from "../obat-shared";

// ─── Main Detail View ─────────────────────────────────────────

type ObatDetailViewProps = {
  detail: ObatDetailWithNames;
  lookups: ObatLookups;
};

export function ObatDetailView({ detail, lookups }: ObatDetailViewProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const basicFields: MasterDetailField[] = [
    { label: "Kode Barang", value: detail.code },
    { label: "Nama Barang", value: detail.name },
    { label: "Golongan Obat", value: detail.categoryName ?? "—" },
    { label: "Pabrik", value: detail.manufacturerName ?? "—" },
    { label: "Farmakologi", value: detail.pharmacologyName ?? "—" },
    { label: "Distributor", value: detail.supplierName ?? "—" },
    { label: "Lokasi Penyimpanan", value: detail.storageLocation ?? "—" },
    { label: "Obat Racikan", value: detail.isCompound ? "Ya" : "Tidak" },
    { label: "Status", value: detail.isActive ? "Aktif" : "Tidak Aktif" },
  ];

  const unitFields: MasterDetailField[] = [
    { label: "Satuan Terkecil", value: detail.smallUnitName ?? "—" },
    {
      label: "Kemasan 1",
      value: detail.packageUnitName
        ? `${detail.packageUnitName} (isi: ${detail.packageConversion ?? "—"})`
        : "—",
    },
    {
      label: "Kemasan 2",
      value: detail.packageUnit2Name
        ? `${detail.packageUnit2Name} (isi: ${detail.packageConversion2 ?? "—"})`
        : "—",
    },
    {
      label: "Satuan Racikan",
      value: detail.compoundUnitName
        ? `${detail.compoundUnitName} (qty: ${detail.compoundQuantity ?? "—"})`
        : "—",
    },
  ];

  const priceFields: MasterDetailField[] = [
    {
      label: "Metode Harga",
      value: formatPricingMethodLabel(detail.pricingMethod),
    },
    {
      label: "Metode Inventori",
      value: formatInventoryMethodLabel(detail.inventoryMethod),
    },
    { label: "PPN Default (%)", value: `${detail.defaultTaxPct}%` },
  ];

  const integrationFields: MasterDetailField[] = [
    { label: "Kode KFA", value: detail.kfaCode ?? "—" },
    { label: "Kode BPJS", value: detail.bpjsCode ?? "—" },
  ];

  const specFields: MasterDetailField[] = [
    { label: "Komposisi", value: detail.composition ?? "—" },
    { label: "Indikasi", value: detail.indications ?? "—" },
    { label: "Kontra Indikasi", value: detail.contraindications ?? "—" },
    { label: "Interaksi Obat", value: detail.drugInteractions ?? "—" },
    { label: "Peringatan", value: detail.warnings ?? "—" },
    { label: "Informasi Dosis", value: detail.dosageInfo ?? "—" },
  ];

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteObat(detail.id);
      if (result.success) {
        toast.success("Obat berhasil dihapus");
        router.push("/master/obat");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleEditSuccess() {
    setEditDialogOpen(false);
    router.refresh();
  }

  return (
    <>
      {/* Top actions */}
      <div className="flex justify-end">
        <Link href="/master/obat">
          <Button variant="outline" className={MASTER_ACTION_BUTTON_CLASSNAME}>Lihat Semua</Button>
        </Link>
      </div>

      {/* Sections */}
      <MasterDetailSection
        title="Informasi Dasar"
        description="Ringkasan identitas, kategori, dan status obat atau alat kesehatan."
        fields={basicFields}
      />
      <MasterDetailSection
        title="Satuan & Konversi"
        description="Struktur satuan yang dipakai untuk stok, kemasan, dan racikan."
        fields={unitFields}
      />
      <MasterDetailSection
        title="Harga & Metode"
        description="Pengaturan metode harga, inventori, dan pajak default."
        fields={priceFields}
      />
      <MasterDetailSection
        title="Kode Integrasi"
        description="Kode referensi integrasi eksternal bila tersedia."
        fields={integrationFields}
      />
      <MasterDetailSection
        title="Spesifikasi"
        description="Informasi klinis dan farmasi yang mendukung penggunaan obat."
        fields={specFields}
      />

      {/* Bottom actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          className={MASTER_ACTION_BUTTON_CLASSNAME}
          disabled={isDeleting}
          onClick={() => setDeleteDialogOpen(true)}
        >
          {isDeleting ? "Menghapus..." : "Hapus"}
        </Button>
        <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={() => setEditDialogOpen(true)}>
          Ubah
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Obat?</AlertDialogTitle>
            <AlertDialogDescription>
              Data &quot;{detail.name}&quot; akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <FormDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          if (!open) setEditDialogOpen(false);
        }}
        title="Edit Obat"
        description="Perbarui data obat atau alat kesehatan."
        className="sm:max-w-4xl"
      >
        <ObatForm
          key={detail.id}
          editingDetail={detail}
          nextCode={null}
          lookups={lookups}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditDialogOpen(false)}
        />
      </FormDialog>
    </>
  );
}
