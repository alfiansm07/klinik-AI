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

import { deleteRuangan, type RuanganDetail } from "../actions";
import { INSTALLATION_LABELS, VISIT_TYPE_LABELS } from "../constants";
import { RuanganForm } from "../ruangan-form";

type RuanganDetailViewProps = {
  detail: RuanganDetail;
};

export function RuanganDetailView({ detail }: RuanganDetailViewProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const fields: MasterDetailField[] = [
    { label: "Kode", value: detail.code },
    { label: "Nama Ruangan", value: detail.name },
    { label: "Jenis Kunjungan", value: VISIT_TYPE_LABELS[detail.visitType] },
    {
      label: "Instalasi",
      value: detail.installation ? INSTALLATION_LABELS[detail.installation] : "—",
    },
    { label: "Mapping PCare", value: detail.pcarePoli ?? "—" },
    { label: "Kode Suara", value: detail.voiceCode ?? "—" },
    { label: "Panggil Ruangan", value: detail.isCallRoom ? "Ya" : "Tidak" },
    { label: "Panggil Apotek", value: detail.isCallApotek ? "Ya" : "Tidak" },
    { label: "Panggil Lab", value: detail.isCallLab ? "Ya" : "Tidak" },
    { label: "Status", value: detail.isActive ? "Aktif" : "Tidak Aktif" },
  ];

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteRuangan(detail.id);
      if (result.success) {
        toast.success("Ruangan berhasil dihapus");
        router.push("/master/ruangan");
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
      <div className="flex justify-end">
        <Link href="/master/ruangan">
          <Button variant="outline" className={MASTER_ACTION_BUTTON_CLASSNAME}>Lihat Semua</Button>
        </Link>
      </div>

      <MasterDetailSection
        title="Informasi Ruangan"
        description="Ringkasan data utama ruangan dan pengaturan panggil dasar."
        fields={fields}
      />

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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Ruangan?</AlertDialogTitle>
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

      <FormDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          if (!open) setEditDialogOpen(false);
        }}
        title="Edit Ruangan"
        description="Perbarui data ruangan dan pengaturan panggil dasar."
        className="sm:max-w-3xl"
      >
        <RuanganForm
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
