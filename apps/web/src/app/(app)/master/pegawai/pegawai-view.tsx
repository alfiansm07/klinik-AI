"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Users } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { FormDialog } from "@/components/shared/form-dialog";
import { MASTER_ACTION_BUTTON_CLASSNAME } from "@/components/shared/master-data-ui";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

import { getNextPegawaiCode, type PegawaiRow } from "./actions";
import { JABATAN_OPTIONS, JABATAN_LABELS } from "./constants";
import { PegawaiForm } from "./pegawai-form";

function createColumns(): ColumnDef<PegawaiRow, unknown>[] {
  return [
    { accessorKey: "code", header: "Kode", enableSorting: true },
    { accessorKey: "fullName", header: "Nama", enableSorting: true },
    {
      accessorKey: "position",
      header: "Jabatan",
      cell: ({ row }) => JABATAN_LABELS[row.original.position as keyof typeof JABATAN_LABELS] ?? "-",
    },
    {
      id: "identity",
      header: "NIK / NIP",
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p>{row.original.nik ?? "-"}</p>
          <p className="text-muted-foreground">{row.original.nip ?? "-"}</p>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Kontak",
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p>{row.original.phone ?? "-"}</p>
          <p className="text-muted-foreground">{row.original.email ?? "-"}</p>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => <StatusBadge isActive={row.original.isActive} />,
    },
  ];
}

type PegawaiViewProps = {
  data: PegawaiRow[];
};

export function PegawaiView({ data }: PegawaiViewProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nextCode, setNextCode] = useState<string | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);

  async function handleAdd() {
    setDialogOpen(true);
    setIsLoadingCode(true);

    try {
      const code = await getNextPegawaiCode();
      setNextCode(code);
    } finally {
      setIsLoadingCode(false);
    }
  }

  return (
    <>
      <DataTable
        columns={createColumns()}
        data={data}
        searchableColumns={["code", "fullName", "nik", "nip", "phone"]}
        searchPlaceholder="Cari nama, kode, NIK, NIP, atau telepon..."
        showStatusFilter
        enumFilter={{
          columnId: "position",
          label: "Jabatan",
          options: JABATAN_OPTIONS.map((option) => ({
            value: option.key,
            label: option.label,
          })),
        }}
        emptyTitle="Belum ada data pegawai"
        emptyDescription="Tambahkan data pegawai pertama untuk mengelola tenaga kerja klinik."
        emptyAction={
          <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Tambah Pegawai
          </Button>
        }
        onRowClick={(row) => router.push(`/master/pegawai/${row.id}`)}
        toolbarActions={
          <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={handleAdd}>
            <Users className="h-4 w-4" />
            Tambah Pegawai
          </Button>
        }
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={(open) => setDialogOpen(open)}
        title="Tambah Pegawai"
        description="Lengkapi identitas, penempatan, dan izin praktik pegawai klinik."
        className="sm:max-w-6xl"
      >
        {isLoadingCode ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Memuat kode pegawai...
          </div>
        ) : (
          <PegawaiForm
            editingDetail={null}
            nextCode={nextCode}
            onCancel={() => setDialogOpen(false)}
            onSuccess={() => {
              setDialogOpen(false);
              router.refresh();
            }}
          />
        )}
      </FormDialog>
    </>
  );
}
