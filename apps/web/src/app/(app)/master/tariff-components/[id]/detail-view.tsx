"use client";

import type { Route } from "next";
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
import { getDefaultTariffComponentDefinition } from "@/lib/tariff-components";

import { deleteTariffComponent, type TariffComponentDetail } from "../actions";
import { TariffComponentForm } from "../tariff-component-form";

export function TariffComponentDetailView({
  detail,
}: {
  detail: TariffComponentDetail;
}) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, startDeleting] = useTransition();
  const definition = detail.feeKey
    ? getDefaultTariffComponentDefinition(detail.feeKey)
    : null;

  const fields: MasterDetailField[] = [
    { label: "ID", value: detail.code },
    { label: "Komponen Tarif", value: detail.name },
    { label: "Komponen Bawaan", value: definition?.name ?? "Komponen Custom" },
    { label: "Status", value: detail.isActive ? "Aktif" : "Nonaktif" },
  ];

  function handleDelete() {
    startDeleting(async () => {
      const result = await deleteTariffComponent(detail.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Komponen tarif berhasil dihapus");
      router.push("/master/tariff-components" as Route);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          className={MASTER_ACTION_BUTTON_CLASSNAME}
          onClick={() => router.push("/master/tariff-components" as Route)}
        >
          Lihat Semua
        </Button>
      </div>

      <MasterDetailSection
        title="Informasi Komponen Tarif"
        description="Ringkasan identitas dan status komponen tarif yang dipakai pada tindakan."
        fields={fields}
      />

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
        title="Ubah Komponen Tarif"
        description="Perbarui nama komponen tarif untuk dipakai di master tindakan."
      >
        <TariffComponentForm
          editingDetail={detail}
          nextDefinition={null}
          nextCode={null}
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
            <AlertDialogTitle>Hapus komponen tarif?</AlertDialogTitle>
            <AlertDialogDescription>
              Komponen yang dihapus akan kembali memakai label bawaan pada master tindakan.
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
