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

import {
  deleteLaborat,
  type LaboratDetail,
} from "../actions";
import { LaboratForm } from "../laborat-form";

// ─── Main Detail View ─────────────────────────────────────────

type LaboratDetailViewProps = {
  detail: LaboratDetail;
};

export function LaboratDetailView({ detail }: LaboratDetailViewProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const fields: MasterDetailField[] = [
    { label: "Kode", value: detail.code },
    { label: "Jenis Pemeriksaan", value: detail.name },
    {
      label: "Klinis Dan Air",
      value: detail.isClinicalAndWater ? "Ya" : "Tidak",
    },
    {
      label: "Status",
      value: detail.isActive ? "Aktif" : "Tidak Aktif",
    },
  ];

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteLaborat(detail.id);
      if (result.success) {
        toast.success("Jenis laboratorium berhasil dihapus");
        router.push("/master/laborat");
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
        <Link href="/master/laborat">
          <Button variant="outline" className={MASTER_ACTION_BUTTON_CLASSNAME}>Lihat Semua</Button>
        </Link>
      </div>

      <MasterDetailSection
        title="Informasi Jenis Laboratorium"
        description="Ringkasan data utama jenis pemeriksaan laboratorium."
        fields={fields}
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
            <AlertDialogTitle>Hapus Jenis Laboratorium?</AlertDialogTitle>
            <AlertDialogDescription>
              Data &quot;{detail.name}&quot; akan dihapus permanen. Tindakan
              ini tidak dapat dibatalkan.
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
        title="Edit Jenis Laboratorium"
        description="Perbarui data jenis laboratorium."
      >
        <LaboratForm
          key={detail.id}
          editingDetail={detail}
          nextCode={null}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditDialogOpen(false)}
        />
      </FormDialog>
    </>
  );
}
