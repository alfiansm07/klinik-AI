"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Info, Plus } from "lucide-react";

import { MASTER_ACTION_BUTTON_CLASSNAME, MASTER_LIST_SHELL_CLASSNAME } from "@/components/shared/master-data-ui";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import {
  CONSENT_FILTER_OPTIONS,
  DEFAULT_REGISTRATION_WORKING_DATE,
  filterRegistrationRows,
  getRegistrationStatusSurface,
  GUARANTOR_FILTER_OPTIONS,
  PAYMENT_FILTER_OPTIONS,
  ROOM_FILTER_OPTIONS,
  SERVICE_FILTER_OPTIONS,
  SOURCE_FILTER_OPTIONS,
  type DailyRegistrationRow,
} from "./registration-list-shared";

type PatientViewProps = {
  data: DailyRegistrationRow[];
};

export function PatientView({ data }: PatientViewProps) {
  const router = useRouter();
  const addHref = "/pendaftaran/pasien/baru" as Route;
  const [summaryRow, setSummaryRow] = useState<DailyRegistrationRow | null>(null);
  const [draftSearch, setDraftSearch] = useState("");
  const [draftGuarantor, setDraftGuarantor] = useState<(typeof GUARANTOR_FILTER_OPTIONS)[number]["value"]>("all");
  const [draftPaymentStatus, setDraftPaymentStatus] = useState<(typeof PAYMENT_FILTER_OPTIONS)[number]["value"]>("all");
  const [draftRegistrationSource, setDraftRegistrationSource] = useState<(typeof SOURCE_FILTER_OPTIONS)[number]["value"]>("all");
  const [draftRoom, setDraftRoom] = useState<(typeof ROOM_FILTER_OPTIONS)[number]["value"]>("all");
  const [draftExamination, setDraftExamination] = useState<"all" | DailyRegistrationRow["status"]>("all");
  const [draftService, setDraftService] = useState<(typeof SERVICE_FILTER_OPTIONS)[number]["value"]>("all");
  const [draftConsentStatus, setDraftConsentStatus] = useState<(typeof CONSENT_FILTER_OPTIONS)[number]["value"]>("all");
  const [draftDate, setDraftDate] = useState(DEFAULT_REGISTRATION_WORKING_DATE);

  const [filters, setFilters] = useState({
    search: "",
    guarantor: "all" as (typeof GUARANTOR_FILTER_OPTIONS)[number]["value"],
    paymentStatus: "all" as (typeof PAYMENT_FILTER_OPTIONS)[number]["value"],
    registrationSource: "all" as (typeof SOURCE_FILTER_OPTIONS)[number]["value"],
    room: "all" as (typeof ROOM_FILTER_OPTIONS)[number]["value"],
    examination: "all" as "all" | DailyRegistrationRow["status"],
    service: "all" as (typeof SERVICE_FILTER_OPTIONS)[number]["value"],
    consentStatus: "all" as (typeof CONSENT_FILTER_OPTIONS)[number]["value"],
    date: DEFAULT_REGISTRATION_WORKING_DATE,
  });

  const filteredRows = useMemo(() => filterRegistrationRows(data, filters), [data, filters]);

  function applyFilters() {
    setFilters({
      search: draftSearch,
      guarantor: draftGuarantor,
      paymentStatus: draftPaymentStatus,
      registrationSource: draftRegistrationSource,
      room: draftRoom,
      examination: draftExamination,
      service: draftService,
      consentStatus: draftConsentStatus,
      date: draftDate,
    });
  }

  function resetFilters() {
    setDraftSearch("");
    setDraftGuarantor("all");
    setDraftPaymentStatus("all");
    setDraftRegistrationSource("all");
    setDraftRoom("all");
    setDraftExamination("all");
    setDraftService("all");
    setDraftConsentStatus("all");
    setDraftDate(DEFAULT_REGISTRATION_WORKING_DATE);
    setFilters({
      search: "",
      guarantor: "all",
      paymentStatus: "all",
      registrationSource: "all",
      room: "all",
      examination: "all",
      service: "all",
      consentStatus: "all",
      date: DEFAULT_REGISTRATION_WORKING_DATE,
    });
  }

  return (
    <section className={cn(MASTER_LIST_SHELL_CLASSNAME, "space-y-5")}> 
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <LegacySelect
          value={draftGuarantor}
          onValueChange={(value) => setDraftGuarantor((value ?? "all") as typeof draftGuarantor)}
          placeholder={GUARANTOR_FILTER_OPTIONS[0]?.label ?? "- Asuransi -"}
          options={GUARANTOR_FILTER_OPTIONS}
        />
        <LegacySelect
          value={draftPaymentStatus}
          onValueChange={(value) => setDraftPaymentStatus((value ?? "all") as typeof draftPaymentStatus)}
          placeholder={PAYMENT_FILTER_OPTIONS[0]?.label ?? "- Status Pembayaran -"}
          options={PAYMENT_FILTER_OPTIONS}
        />
        <LegacySelect
          value={draftRegistrationSource}
          onValueChange={(value) => setDraftRegistrationSource((value ?? "all") as typeof draftRegistrationSource)}
          placeholder={SOURCE_FILTER_OPTIONS[0]?.label ?? "- Asal Pendaftaran -"}
          options={SOURCE_FILTER_OPTIONS}
        />
        <LegacySelect
          value={draftRoom}
          onValueChange={(value) => setDraftRoom((value ?? "all") as typeof draftRoom)}
          placeholder={ROOM_FILTER_OPTIONS[0]?.label ?? "- Semua Ruangan -"}
          options={ROOM_FILTER_OPTIONS}
        />
        <LegacySelect
          value={draftExamination}
          onValueChange={(value) => setDraftExamination((value ?? "all") as typeof draftExamination)}
          placeholder="- Semua Pemeriksaan -"
          options={[
            { value: "all", label: "- Semua Pemeriksaan -" },
            { value: "belum_diperiksa", label: "Belum Diperiksa" },
            { value: "sedang_diperiksa", label: "Sedang Diperiksa" },
            { value: "sudah_diperiksa", label: "Sudah Diperiksa" },
          ]}
        />
        <LegacySelect
          value={draftService}
          onValueChange={(value) => setDraftService((value ?? "all") as typeof draftService)}
          placeholder={SERVICE_FILTER_OPTIONS[0]?.label ?? "- Semua Pelayanan -"}
          options={SERVICE_FILTER_OPTIONS}
        />
        <LegacySelect
          value={draftConsentStatus}
          onValueChange={(value) => setDraftConsentStatus((value ?? "all") as typeof draftConsentStatus)}
          placeholder={CONSENT_FILTER_OPTIONS[0]?.label ?? "- Semua Status General Consent -"}
          options={CONSENT_FILTER_OPTIONS}
        />
        <div className="w-full sm:w-48">
          <Input type="date" value={draftDate} onChange={(event) => setDraftDate(event.target.value)} className="h-10 rounded-md text-sm" />
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto lg:flex-1 lg:justify-end">
          <Input
            value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)}
            placeholder="Pencarian"
            className="h-10 rounded-md text-sm sm:w-60"
          />
          <Button type="button" onClick={applyFilters} className={cn(MASTER_ACTION_BUTTON_CLASSNAME, "h-10 rounded-lg px-5")}>
            Cari
          </Button>
          <Button type="button" variant="outline" onClick={resetFilters} className={cn(MASTER_ACTION_BUTTON_CLASSNAME, "h-10 rounded-lg px-5")}>
            Reset
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border bg-background">
        <Table className="[&_td]:border-r [&_td]:border-border/60 [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:border-border/60 [&_th:last-child]:border-r-0">
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">No.</TableHead>
              <TableHead className="w-14">ID</TableHead>
              <TableHead className="w-40">Tanggal Pendaftaran</TableHead>
              <TableHead className="w-28">No. Pendaftaran</TableHead>
              <TableHead className="min-w-[320px]">Data Pasien</TableHead>
              <TableHead className="w-32">Penyakit Khusus</TableHead>
              <TableHead className="w-28">Ruangan Daftar</TableHead>
              <TableHead className="w-36">Asuransi</TableHead>
              <TableHead className="w-40">Status Pembayaran</TableHead>
              <TableHead className="w-24">Status BPJS</TableHead>
              <TableHead className="w-24">Kunjungan</TableHead>
              <TableHead className="w-32">Status Pelayanan</TableHead>
              <TableHead className="w-40">Status General Consent</TableHead>
              <TableHead className="w-24">Cetak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => {
              const surface = getRegistrationStatusSurface(row.status);
              const detailHref = `/pendaftaran/pasien/${row.id}` as Route;

              return (
                <TableRow
                  key={row.id}
                  className={cn("cursor-pointer align-top border-b border-border/70 hover:bg-accent/40", surface.row)}
                  onDoubleClick={(event) => {
                    const target = event.target;

                    if (target instanceof Element && target.closest('[data-prevent-row-click="true"]')) {
                      return;
                    }

                    router.push(detailHref);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(detailHref);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                >
                  <TableCell>{row.rowNumber}</TableCell>
                  <TableCell>{row.registrationId}</TableCell>
                  <TableCell>{row.registrationDateTime}</TableCell>
                  <TableCell className="font-medium">{row.registrationNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-start justify-between gap-2 py-2 text-sm leading-5">
                      <p className="font-medium text-foreground">{row.patientName}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-prevent-row-click="true"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSummaryRow(row);
                        }}
                        className="h-8 rounded-md px-3"
                        aria-label={`Lihat ringkasan pasien ${row.patientName}`}
                      >
                        <Info className="h-3.5 w-3.5" />
                        Detail
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{row.specialConditionLabel}</TableCell>
                  <TableCell>{row.roomLabel}</TableCell>
                  <TableCell>{row.guarantorLabel}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 text-sm text-foreground">
                      <input type="checkbox" checked={row.paymentStatus === "sudah_bayar"} readOnly className="h-3.5 w-3.5" />
                      {row.paymentStatusLabel}
                    </span>
                  </TableCell>
                  <TableCell>{row.bpjsStatusLabel}</TableCell>
                  <TableCell>{row.visitKindLabel}</TableCell>
                  <TableCell>{row.serviceStatusLabel}</TableCell>
                  <TableCell>
                    <span className={cn(row.consentStatus === "belum" ? "text-red-600" : "text-emerald-700", "font-medium")}> 
                      {row.consentStatus === "belum" ? "Belum" : "Sudah"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex" data-prevent-row-click="true">
                      <Button type="button" className="h-9 rounded-r-none border-r-0 px-4">
                        Cetak
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              className="h-9 rounded-l-none px-2"
                            />
                          }
                        >
                          <ChevronDown className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-44">
                          {row.printActions.map((action) => (
                            <DropdownMenuItem key={action.id}>{action.label}</DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 rounded-md border bg-muted/20 p-4 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-6 text-foreground">
          <span>Keterangan :</span>
          <LegendBadge color="bg-white" label="Belum Diperiksa" />
          <LegendBadge color="bg-rose-100" label="Sedang Diperiksa" />
          <LegendBadge color="bg-lime-100" label="Sudah Diperiksa" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Menampilkan 1-{filteredRows.length} dari {filteredRows.length}</span>
        </div>
      </div>

      <div className="flex justify-between gap-3">
        <span className="text-sm text-muted-foreground">Klik dua kali pada baris untuk membuka detail pendaftaran.</span>
      </div>

      <PatientSummaryDialog row={summaryRow} onOpenChange={(open) => (!open ? setSummaryRow(null) : undefined)} />
    </section>
  );
}

function LegacySelect({
  value,
  onValueChange,
  placeholder,
  options,
}: {
  value: string;
  onValueChange: (value: string | null) => void;
  placeholder: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  const selectableOptions = options.filter((option) => option.value !== "all");

  return (
    <Select value={value === "all" ? null : value} onValueChange={onValueChange}>
      <SelectTrigger className="h-10 w-full rounded-md text-sm sm:w-48">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {selectableOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PatientSummaryDialog({
  row,
  onOpenChange,
}: {
  row: DailyRegistrationRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={row !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Ringkasan Pasien</DialogTitle>
          <DialogDescription>
            Ringkasan cepat identitas pasien untuk membantu petugas memverifikasi data sebelum membuka detail pendaftaran.
          </DialogDescription>
        </DialogHeader>

        {row ? (
          <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 text-sm sm:grid-cols-2">
            <SummaryItem label="Nama" value={row.patientName} />
            <SummaryItem label="Jenis Kelamin" value={row.genderLabel} />
            <SummaryItem label="eRM" value={row.patientIdLabel} />
            <SummaryItem label="NIK" value={row.nik} />
            <SummaryItem label="No. RM" value={row.medicalRecordNumber} />
            <SummaryItem label="No. RM Lama" value={row.legacyMedicalRecordNumber} />
            <SummaryItem label="Tanggal Lahir" value={row.birthDateLabel} />
            <SummaryItem label="Umur" value={row.ageLabel} />
            <SummaryItem label="Asuransi" value={row.guarantorLabel} />
            <SummaryItem label="Ruangan Daftar" value={row.roomLabel} />
            <SummaryItem label="Alamat" value={row.addressLabel} className="sm:col-span-2" />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function SummaryItem({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

function LegendBadge({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("h-6 w-6 rounded border", color)} />
      {label}
    </span>
  );
}
