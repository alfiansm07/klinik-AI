"use client";

import { useMemo, useState, useTransition } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  getNextGuarantorCode,
  toggleGuarantorStatus,
  type GuarantorDetail,
  type GuarantorRow,
} from "./actions";
import { GuarantorForm } from "./guarantor-form";
import {
  formatBooleanLabel,
  formatGuarantorTypeLabel,
  GUARANTOR_TYPE_LABELS,
  type GuarantorCategory,
  type InsuranceGuarantorType,
} from "./guarantor-shared";

type StatusCellProps = {
  row: GuarantorRow;
};

function StatusCell({ row }: StatusCellProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <StatusBadge isActive={row.isActive} />
      <Switch
        size="sm"
        checked={row.isActive}
        disabled={isPending}
        onClickCapture={(event) => event.stopPropagation()}
        onCheckedChange={(checked) => {
          startTransition(async () => {
            const result = await toggleGuarantorStatus(row.id, checked);
            if (!result.success) {
              toast.error(result.error);
            }
          });
        }}
      />
    </div>
  );
}

function createInsuranceColumns(): ColumnDef<GuarantorRow, unknown>[] {
  const insuranceTypeOptions: InsuranceGuarantorType[] = [
    "pribadi",
    "bpjs",
    "asuransi",
    "pemerintah",
  ];

  return [
    {
      accessorKey: "code",
      header: "Kode",
      enableSorting: true,
    },
    {
      accessorKey: "type",
      header: "Jenis Asuransi",
      enableSorting: true,
      cell: ({ row }) => {
        const value = row.original.type;
        return insuranceTypeOptions.includes(value as InsuranceGuarantorType)
          ? GUARANTOR_TYPE_LABELS[value]
          : formatGuarantorTypeLabel(value);
      },
    },
    {
      accessorKey: "name",
      header: "Nama Asuransi",
      enableSorting: true,
    },
    {
      accessorKey: "bpjsBridging",
      header: "Bridging BPJS",
      enableSorting: false,
      cell: ({ row }) => formatBooleanLabel(row.original.bpjsBridging),
    },
    {
      accessorKey: "showInsuranceNumber",
      header: "Tampilkan No Asuransi",
      enableSorting: false,
      cell: ({ row }) => formatBooleanLabel(row.original.showInsuranceNumber),
    },
    {
      accessorKey: "insuranceNumberRequired",
      header: "No Asuransi Wajib Isi",
      enableSorting: false,
      cell: ({ row }) => formatBooleanLabel(row.original.insuranceNumberRequired),
    },
    {
      accessorKey: "mandiriInhealthBridging",
      header: "Bridging Mandiri Inhealth",
      enableSorting: false,
      cell: ({ row }) =>
        formatBooleanLabel(row.original.mandiriInhealthBridging),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => <StatusCell row={row.original} />,
    },
  ];
}

function createCompanyColumns(): ColumnDef<GuarantorRow, unknown>[] {
  return [
    {
      accessorKey: "code",
      header: "Kode",
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: "Nama Penjamin",
      enableSorting: true,
    },
    {
      accessorKey: "address",
      header: "Alamat Penjamin",
      enableSorting: false,
      cell: ({ row }) => row.original.address || "-",
    },
    {
      accessorKey: "phone",
      header: "Nomor Kontak",
      enableSorting: false,
      cell: ({ row }) => row.original.phone || "-",
    },
    {
      accessorKey: "picName",
      header: "Nama PIC",
      enableSorting: false,
      cell: ({ row }) => row.original.picName || "-",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => <StatusCell row={row.original} />,
    },
  ];
}

type GuarantorsViewProps = {
  data: GuarantorRow[];
};

export function GuarantorsView({ data }: GuarantorsViewProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<GuarantorCategory>(
    "insurance",
  );
  const [nextCode, setNextCode] = useState<string | null>(null);
  const [isPreparingDialog, startPreparingDialog] = useTransition();

  const insuranceRows = useMemo(
    () => data.filter((row) => row.category === "insurance"),
    [data],
  );
  const companyRows = useMemo(
    () => data.filter((row) => row.category === "company"),
    [data],
  );

  const insuranceColumns = useMemo(() => createInsuranceColumns(), []);
  const companyColumns = useMemo(() => createCompanyColumns(), []);

  function handleSuccess() {
    setDialogOpen(false);
    setNextCode(null);
  }

  function handleCancel() {
    setDialogOpen(false);
    setNextCode(null);
  }

  function handleRowClick(row: GuarantorRow) {
    router.push(`/master/guarantors/${row.id}` as Route);
  }

  function handleAdd(category: GuarantorCategory) {
    startPreparingDialog(async () => {
      try {
        const code = await getNextGuarantorCode();
        setDialogCategory(category);
        setNextCode(code);
        setDialogOpen(true);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Gagal menyiapkan kode penjamin";
        toast.error(message);
      }
    });
  }

  const editingDetail: GuarantorDetail | null = null;

  return (
    <>
      <Tabs defaultValue="insurance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="insurance">Asuransi</TabsTrigger>
          <TabsTrigger value="company">Perusahaan Lainnya</TabsTrigger>
        </TabsList>

        <TabsContent value="insurance">
          <DataTable
            columns={insuranceColumns}
            data={insuranceRows}
            searchableColumns={["code", "name"]}
            searchPlaceholder="Cari kode atau nama asuransi..."
            showStatusFilter
            enumFilter={{
              columnId: "type",
              label: "Jenis",
              options: [
                { value: "pribadi", label: GUARANTOR_TYPE_LABELS.pribadi },
                { value: "bpjs", label: GUARANTOR_TYPE_LABELS.bpjs },
                { value: "asuransi", label: GUARANTOR_TYPE_LABELS.asuransi },
                { value: "pemerintah", label: GUARANTOR_TYPE_LABELS.pemerintah },
              ],
            }}
            emptyTitle="Belum ada data asuransi"
            emptyDescription="Tambahkan data asuransi atau penjamin pemerintah untuk memulai."
            emptyAction={
              <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={() => handleAdd("insurance")}>
                <Plus className="h-4 w-4" />
                Buat Baru
              </Button>
            }
            toolbarActions={
              <Button
                className={MASTER_ACTION_BUTTON_CLASSNAME}
                onClick={() => handleAdd("insurance")}
                disabled={isPreparingDialog}
              >
                <Plus className="h-4 w-4" />
                Buat Baru
              </Button>
            }
            onRowClick={handleRowClick}
          />
        </TabsContent>

        <TabsContent value="company">
          <DataTable
            columns={companyColumns}
            data={companyRows}
            searchableColumns={["code", "name", "phone", "picName", "address"]}
            searchPlaceholder="Cari nama perusahaan, PIC, atau nomor kontak..."
            showStatusFilter
            emptyTitle="Belum ada perusahaan penjamin"
            emptyDescription="Tambahkan perusahaan penjamin lainnya untuk mulai digunakan."
            emptyAction={
              <Button className={MASTER_ACTION_BUTTON_CLASSNAME} onClick={() => handleAdd("company")}>
                <Plus className="h-4 w-4" />
                Buat Baru
              </Button>
            }
            toolbarActions={
              <Button
                className={MASTER_ACTION_BUTTON_CLASSNAME}
                onClick={() => handleAdd("company")}
                disabled={isPreparingDialog}
              >
                <Plus className="h-4 w-4" />
                Buat Baru
              </Button>
            }
            onRowClick={handleRowClick}
          />
        </TabsContent>
      </Tabs>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={
          dialogCategory === "insurance"
            ? "Buat Baru Asuransi"
            : "Buat Baru Perusahaan Penjamin"
        }
        description={
          dialogCategory === "insurance"
            ? "Tambahkan data asuransi, BPJS, umum, atau penjamin pemerintah."
            : "Tambahkan perusahaan penjamin lainnya beserta data kontak utamanya."
        }
      >
        <GuarantorForm
          editingDetail={editingDetail}
          nextCode={nextCode}
          defaultCategory={dialogCategory}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </FormDialog>
    </>
  );
}
