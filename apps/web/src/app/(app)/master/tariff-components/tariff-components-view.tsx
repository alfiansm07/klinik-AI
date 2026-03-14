"use client";

import { useEffect, useState, useTransition } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/shared/data-table";
import { FormDialog } from "@/components/shared/form-dialog";
import { MASTER_ACTION_BUTTON_CLASSNAME } from "@/components/shared/master-data-ui";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { TariffComponentForm } from "./tariff-component-form";
import {
  getNextTariffComponentCode,
  toggleTariffComponentStatus,
  type TariffComponentDetail,
  type TariffComponentRow,
} from "./actions";

function StatusCell({ row }: { row: TariffComponentRow }) {
  return <StatusBadge isActive={row.isActive} />;
}

function ToggleCell({
  row,
  onStatusChange,
}: {
  row: TariffComponentRow;
  onStatusChange: (id: string, isActive: boolean) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className="flex items-center justify-end"
      data-prevent-row-click="true"
    >
      <Switch
        size="sm"
        checked={row.isActive}
        disabled={isPending}
        onCheckedChange={(checked) => {
          startTransition(async () => {
            await onStatusChange(row.id, checked);
          });
        }}
      />
    </div>
  );
}

function createColumns(
  onStatusChange: (id: string, isActive: boolean) => Promise<void>,
): ColumnDef<TariffComponentRow, unknown>[] {
  return [
    {
      accessorKey: "code",
      header: "ID",
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: "Komponen Tarif",
      enableSorting: true,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => <StatusCell row={row.original} />,
    },
    {
      id: "toggle",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <ToggleCell row={row.original} onStatusChange={onStatusChange} />
      ),
    },
  ];
}

type TariffComponentsViewProps = {
  data: TariffComponentRow[];
};

export function TariffComponentsView({ data }: TariffComponentsViewProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rows, setRows] = useState(data);
  const [nextCode, setNextCode] = useState<string | null>(null);
  const [isPreparingDialog, startPreparingDialog] = useTransition();

  useEffect(() => {
    setRows(data);
  }, [data]);

  async function handleStatusChange(id: string, isActive: boolean) {
    const previousRows = rows;

    setRows((currentRows) =>
      currentRows.map((row) => (row.id === id ? { ...row, isActive } : row)),
    );

    const result = await toggleTariffComponentStatus(id, isActive);
    if (!result.success) {
      setRows(previousRows);
      toast.error(result.error);
      return;
    }

    toast.success(
      isActive
        ? "Komponen tarif berhasil diaktifkan"
        : "Komponen tarif berhasil dinonaktifkan",
    );
    router.refresh();
  }

  function handleCreate() {
    startPreparingDialog(async () => {
      try {
        const code = await getNextTariffComponentCode();
        setNextCode(code);
        setDialogOpen(true);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal menyiapkan kode komponen tarif",
        );
      }
    });
  }

  const columns = createColumns(handleStatusChange);

  const editingDetail: TariffComponentDetail | null = null;

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        searchableColumns={["code", "name"]}
        searchPlaceholder="Cari ID atau nama komponen tarif..."
        showStatusFilter
        emptyTitle="Belum ada komponen tarif"
        emptyDescription="Tambahkan komponen tarif utama untuk digunakan pada master tindakan."
        emptyAction={
          <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={handleCreate} disabled={isPreparingDialog}>
            <Plus className="h-4 w-4" />
            Buat Baru
          </Button>
        }
        toolbarActions={
          <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={handleCreate} disabled={isPreparingDialog}>
            <Plus className="h-4 w-4" />
            Buat Baru
          </Button>
        }
        onRowClick={(row) =>
          router.push(`/master/tariff-components/${row.id}` as Route)
        }
      />

      <FormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setNextCode(null);
          }
        }}
        title="Buat Baru Komponen Tarif"
        description="Tambahkan komponen tarif baru. Lima komponen awal tetap bisa dipakai sebagai komponen inti tindakan, sedangkan komponen berikutnya akan disimpan sebagai komponen custom."
      >
        <TariffComponentForm
          editingDetail={editingDetail}
          nextDefinition={null}
          nextCode={nextCode}
          onSuccess={() => {
            setDialogOpen(false);
            setNextCode(null);
          }}
          onCancel={() => {
            setDialogOpen(false);
            setNextCode(null);
          }}
        />
      </FormDialog>
    </>
  );
}
