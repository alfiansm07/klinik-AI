"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { DoorOpen, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/shared/data-table";
import { FormDialog } from "@/components/shared/form-dialog";
import { MASTER_ACTION_BUTTON_CLASSNAME } from "@/components/shared/master-data-ui";
import { StatusBadge } from "@/components/shared/status-badge";

import {
  getNextRuanganCode,
  toggleRuanganStatus,
  type RuanganRow,
} from "./actions";
import { INSTALLATION_LABELS, VISIT_TYPE_LABELS } from "./constants";
import { RuanganForm } from "./ruangan-form";

function StatusCell({ row }: { row: RuanganRow }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center" data-prevent-row-click="true">
      <Switch
        size="sm"
        checked={row.isActive}
        disabled={isPending}
        onCheckedChange={(checked) => {
          startTransition(async () => {
            const result = await toggleRuanganStatus(row.id, checked);
            if (!result.success) toast.error(result.error);
          });
        }}
      />
    </div>
  );
}

function createColumns(): ColumnDef<RuanganRow, unknown>[] {
  return [
    {
      accessorKey: "code",
      header: "Kode",
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: "Nama Ruangan",
      enableSorting: true,
    },
    {
      accessorKey: "visitType",
      header: "Jenis Kunjungan",
      enableSorting: false,
      cell: ({ row }) => VISIT_TYPE_LABELS[row.original.visitType],
    },
    {
      accessorKey: "installation",
      header: "Instalasi",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.installation
          ? INSTALLATION_LABELS[row.original.installation]
          : "—",
    },
    {
      accessorKey: "pcarePoli",
      header: "Mapping PCare",
      enableSorting: false,
      cell: ({ row }) => row.original.pcarePoli ?? "—",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => <StatusBadge isActive={row.original.isActive} />,
    },
    {
      id: "toggle",
      header: "",
      enableSorting: false,
      cell: ({ row }) => <StatusCell row={row.original} />,
    },
  ];
}

type RuanganViewProps = {
  data: RuanganRow[];
};

export function RuanganView({ data }: RuanganViewProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [nextCode, setNextCode] = useState<string | null>(null);

  const columns = createColumns();

  async function handleAdd() {
    setIsLoadingCode(true);
    setDialogOpen(true);
    try {
      const code = await getNextRuanganCode();
      setNextCode(code);
    } catch {
      setNextCode(null);
    } finally {
      setIsLoadingCode(false);
    }
  }

  function handleRowClick(row: RuanganRow) {
    router.push(`/master/ruangan/${row.id}`);
  }

  function handleSuccess() {
    setDialogOpen(false);
  }

  function handleCancel() {
    setDialogOpen(false);
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchableColumns={["code", "name"]}
        searchPlaceholder="Cari kode atau nama ruangan..."
        showStatusFilter
        emptyTitle="Belum ada data ruangan"
        emptyDescription="Tambahkan ruangan pertama untuk memulai." 
        emptyAction={
          <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Tambah Ruangan
          </Button>
        }
        onRowClick={handleRowClick}
        toolbarActions={
          <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={handleAdd}>
            <DoorOpen className="h-4 w-4" />
            Tambah Ruangan
          </Button>
        }
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
        title="Tambah Ruangan"
        description="Tambahkan ruangan baru untuk kebutuhan operasional klinik."
        className="sm:max-w-3xl"
      >
        {isLoadingCode ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Memuat data...</p>
          </div>
        ) : (
          <RuanganForm
            key="new"
            editingDetail={null}
            nextCode={nextCode}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </FormDialog>
    </>
  );
}
