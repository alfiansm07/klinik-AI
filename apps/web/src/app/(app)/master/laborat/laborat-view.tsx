"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/shared/data-table";
import { FormDialog } from "@/components/shared/form-dialog";
import { MASTER_ACTION_BUTTON_CLASSNAME } from "@/components/shared/master-data-ui";
import { StatusBadge } from "@/components/shared/status-badge";

import {
  toggleLaboratStatus,
  getNextLaboratCode,
  type LaboratRow,
} from "./actions";
import { LaboratForm } from "./laborat-form";

// ─── Columns ──────────────────────────────────────────────────

function StatusCell({ row }: { row: LaboratRow }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center" data-prevent-row-click="true">
      <Switch
        size="sm"
        checked={row.isActive}
        disabled={isPending}
        onCheckedChange={(checked) => {
          startTransition(async () => {
            const result = await toggleLaboratStatus(row.id, checked);
            if (!result.success) {
              toast.error(result.error);
            }
          });
        }}
      />
    </div>
  );
}

function createColumns(): ColumnDef<LaboratRow, unknown>[] {
  return [
    {
      accessorKey: "code",
      header: "Kode",
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: "Jenis Pemeriksaan",
      enableSorting: true,
    },
    {
      accessorKey: "isClinicalAndWater",
      header: "Jenis Transaksi",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.isClinicalAndWater ? "KLINIS DAN AIR" : "—",
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

// ─── Main View ────────────────────────────────────────────────

type LaboratViewProps = {
  data: LaboratRow[];
};

export function LaboratView({ data }: LaboratViewProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [nextCode, setNextCode] = useState<string | null>(null);

  const columns = createColumns();

  async function handleAdd() {
    setIsLoadingCode(true);
    setDialogOpen(true);
    try {
      const code = await getNextLaboratCode();
      setNextCode(code);
    } catch {
      setNextCode(null);
    } finally {
      setIsLoadingCode(false);
    }
  }

  function handleRowClick(row: LaboratRow) {
    router.push(`/master/laborat/${row.id}`);
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
        searchPlaceholder="Cari kode atau jenis pemeriksaan..."
        showStatusFilter
        emptyTitle="Belum ada data jenis laboratorium"
        emptyDescription="Tambahkan jenis laboratorium pertama untuk memulai."
        emptyAction={
          <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Tambah Jenis Laboratorium
          </Button>
        }
        onRowClick={handleRowClick}
        toolbarActions={
          <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Tambah Jenis Laboratorium
          </Button>
        }
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
        title="Tambah Jenis Laboratorium"
        description="Tambahkan jenis laboratorium baru."
      >
        {isLoadingCode ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Memuat data...</p>
          </div>
        ) : (
          <LaboratForm
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
