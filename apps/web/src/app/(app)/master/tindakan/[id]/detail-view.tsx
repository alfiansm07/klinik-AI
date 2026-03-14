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

import { deleteTindakan, type TindakanDetail } from "../actions";
import { formatActionCategoryLabel } from "../constants";
import {
  TindakanForm,
  formatCurrency,
  ACTION_TYPE_LABELS,
  type TindakanLookups,
} from "../tindakan-form";

// ─── Main Detail View ─────────────────────────────────────────

type TindakanDetailViewProps = {
  detail: TindakanDetail;
  lookups: TindakanLookups;
};

export function TindakanDetailView({ detail, lookups }: TindakanDetailViewProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const fields: MasterDetailField[] = [
    { label: "Kode", value: detail.code },
    { label: "Nama Tindakan", value: detail.name },
    {
      label: "Kategori Tindakan",
      value: formatActionCategoryLabel(detail.actionCategory),
    },
    { label: "Kode ICD-9", value: detail.icd9Code ?? "—" },
    {
      label: "Tipe",
      value: ACTION_TYPE_LABELS[detail.actionType] ?? detail.actionType,
    },
    {
      label: "Status",
      value: detail.isActive ? "Aktif" : "Tidak Aktif",
    },
  ];

  const tariffValues = {
    doctorFee: detail.doctorFee,
    clinicFee: detail.clinicFee,
    otherFee: detail.otherFee,
    midwifeFee: detail.midwifeFee,
    nurseFee: detail.nurseFee,
  } as const;

  const tariffFields: MasterDetailField[] = [
    ...lookups.tariffComponents.map((component) => ({
      label: component.name,
      value: formatCurrency(tariffValues[component.fieldName]),
    })),
    { label: "Total Tarif", value: formatCurrency(detail.totalFee) },
  ];

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteTindakan(detail.id);
      if (result.success) {
        toast.success("Tindakan berhasil dihapus");
        router.push("/master/tindakan");
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
        <Link href="/master/tindakan">
          <Button variant="outline" className={MASTER_ACTION_BUTTON_CLASSNAME}>Lihat Semua</Button>
        </Link>
      </div>

      <MasterDetailSection
        title="Informasi Tindakan"
        description="Ringkasan identitas, klasifikasi, dan status tindakan medis."
        fields={fields}
      />

      <MasterDetailSection
        title="Komponen Tarif"
        description="Rincian komponen biaya yang membentuk total tarif tindakan."
        fields={tariffFields}
      />

      {/* Medicines section (conditional) */}
      {detail.medicines.length > 0 && (
        <MasterDetailSection
          title="Obat & Alkes"
          description="Daftar obat atau alat kesehatan yang terasosiasi dengan tindakan ini."
        >
          <div className="overflow-hidden rounded-xl border bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Kode</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Nama Obat</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Satuan</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Qty</th>
                </tr>
              </thead>
              <tbody>
                {detail.medicines.map((med) => (
                  <tr key={med.id} className="border-b last:border-b-0">
                    <td className="px-4 py-2">{med.medicineCode}</td>
                    <td className="px-4 py-2">{med.medicineName}</td>
                    <td className="px-4 py-2">{med.medicineUnitName ?? "—"}</td>
                    <td className="px-4 py-2 text-right">{med.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MasterDetailSection>
      )}

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
            <AlertDialogTitle>Hapus Tindakan?</AlertDialogTitle>
            <AlertDialogDescription>
              Data &quot;{detail.name}&quot; akan dihapus permanen beserta tarif dan obat terkait. Tindakan ini tidak dapat dibatalkan.
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
        title="Edit Tindakan"
        description="Perbarui data tindakan medis."
        className="sm:max-w-4xl"
      >
        <TindakanForm
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
