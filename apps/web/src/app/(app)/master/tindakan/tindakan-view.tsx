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
  toggleTindakanStatus,
  getNextTindakanCode,
  type TindakanRow,
} from "./actions";
import { formatActionCategoryLabel } from "./constants";
import {
  TindakanForm,
  formatCurrency,
  type TindakanLookups,
  ACTION_TYPE_LABELS,
} from "./tindakan-form";

function StatusCell({ row }: { row: TindakanRow }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center" data-prevent-row-click="true">
      <Switch
        size="sm"
        checked={row.isActive}
        disabled={isPending}
        onCheckedChange={(checked) => {
          startTransition(async () => {
            const result = await toggleTindakanStatus(row.id, checked);
            if (!result.success) {
              toast.error(result.error);
            }
          });
        }}
      />
    </div>
  );
}

function createColumns(): ColumnDef<TindakanRow, unknown>[] {
  return [
    {
      accessorKey: "code",
      header: "ID",
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: "Deskripsi",
      enableSorting: true,
    },
    {
      accessorKey: "actionCategory",
      header: "Kategori Tindakan",
      enableSorting: true,
      cell: ({ row }) => formatActionCategoryLabel(row.original.actionCategory),
    },
    {
      accessorKey: "icd9Code",
      header: "ICD-9",
      enableSorting: false,
      cell: ({ row }) => row.original.icd9Code ?? "—",
    },
    {
      accessorKey: "totalFee",
      header: "Tarif",
      enableSorting: true,
      cell: ({ row }) => formatCurrency(row.original.totalFee),
    },
    {
      accessorKey: "actionType",
      header: "Tipe",
      enableSorting: true,
      cell: ({ row }) =>
        ACTION_TYPE_LABELS[row.original.actionType] ?? row.original.actionType,
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

type TindakanViewProps = {
  data: TindakanRow[];
  lookups: TindakanLookups;
};

export function TindakanView({ data, lookups }: TindakanViewProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [nextCode, setNextCode] = useState<string | null>(null);

  const columns = createColumns();

  async function handleAdd() {
    setIsLoadingCode(true);
    setDialogOpen(true);
    try {
      const code = await getNextTindakanCode();
      setNextCode(code);
    } catch {
      setNextCode(null);
    } finally {
      setIsLoadingCode(false);
    }
  }

  function handleRowClick(row: TindakanRow) {
    router.push(`/master/tindakan/${row.id}`);
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
        searchPlaceholder="Cari kode atau nama tindakan..."
        showStatusFilter
        emptyTitle="Belum ada data tindakan"
        emptyDescription="Tambahkan tindakan pertama untuk memulai."
        emptyAction={
          <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Tambah Tindakan
          </Button>
        }
        onRowClick={handleRowClick}
        toolbarActions={
          <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Tambah Tindakan
          </Button>
        }
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
        title="Tambah Tindakan"
        description="Tambahkan tindakan medis baru."
        className="sm:max-w-4xl"
      >
        {isLoadingCode ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Memuat data...</p>
          </div>
        ) : (
          <TindakanForm
            key="new"
            editingDetail={null}
            nextCode={nextCode}
            lookups={lookups}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </FormDialog>
    </>
  );
}
