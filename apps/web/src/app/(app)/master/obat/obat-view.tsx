"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/shared/data-table";
import { FormDialog } from "@/components/shared/form-dialog";
import { MASTER_ACTION_BUTTON_CLASSNAME } from "@/components/shared/master-data-ui";
import { StatusBadge } from "@/components/shared/status-badge";

import { toggleObatStatus, getNextObatCode, type ObatRow } from "./actions";
import { ObatForm, type ObatLookups } from "./obat-form";

function StatusCell({ row }: { row: ObatRow }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center" data-prevent-row-click="true">
      <Switch
        size="sm"
        checked={row.isActive}
        disabled={isPending}
        onCheckedChange={(checked) => {
          startTransition(async () => {
            const result = await toggleObatStatus(row.id, checked);
            if (!result.success) {
              toast.error(result.error);
            }
          });
        }}
      />
    </div>
  );
}

function createColumns(): ColumnDef<ObatRow, unknown>[] {
  return [
    {
      accessorKey: "code",
      header: "Kode Barang",
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: "Nama Barang",
      enableSorting: true,
    },
    {
      accessorKey: "categoryName",
      header: "Kategori",
      enableSorting: true,
      cell: ({ row }) => row.original.categoryName ?? "—",
    },
    {
      accessorKey: "smallUnitName",
      header: "Satuan",
      enableSorting: false,
      cell: ({ row }) => row.original.smallUnitName ?? "—",
    },
    {
      accessorKey: "kfaCode",
      header: "Kode KFA",
      enableSorting: false,
      cell: ({ row }) => row.original.kfaCode ?? "—",
    },
    {
      accessorKey: "manufacturerName",
      header: "Pabrik",
      enableSorting: true,
      cell: ({ row }) => row.original.manufacturerName ?? "—",
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

type ObatViewProps = {
  data: ObatRow[];
  lookups: ObatLookups;
};

export function ObatView({ data, lookups }: ObatViewProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [nextCode, setNextCode] = useState<string | null>(null);

  const columns = createColumns();

  async function handleAdd() {
    setIsLoadingCode(true);
    setDialogOpen(true);
    try {
      const code = await getNextObatCode();
      setNextCode(code);
    } catch {
      setNextCode(null);
    } finally {
      setIsLoadingCode(false);
    }
  }

  function handleRowClick(row: ObatRow) {
    router.push(`/master/obat/${row.id}`);
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
        searchPlaceholder="Cari kode atau nama obat..."
        showStatusFilter
        emptyTitle="Belum ada data obat"
        emptyDescription="Tambahkan obat pertama untuk memulai."
        emptyAction={
          <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Tambah Obat
          </Button>
        }
        onRowClick={handleRowClick}
        toolbarActions={
          <>
            <Link
              href="/master/obat/upload"
              className={`${buttonVariants({ variant: "outline" })} ${MASTER_ACTION_BUTTON_CLASSNAME}`}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Link>
            <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={handleAdd}>
              <Plus className="h-4 w-4" />
              Tambah Obat & Alkes
            </Button>
          </>
        }
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
        title="Tambah Obat & Alkes"
        description="Tambahkan obat atau alat kesehatan baru."
        className="sm:max-w-4xl"
      >
        {isLoadingCode ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Memuat data...</p>
          </div>
        ) : (
          <ObatForm
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
