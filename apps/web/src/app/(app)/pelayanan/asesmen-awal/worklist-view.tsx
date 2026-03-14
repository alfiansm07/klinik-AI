"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Search, SlidersHorizontal, Stethoscope, TriangleAlert } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  MASTER_ACTION_BUTTON_CLASSNAME,
  MASTER_LIST_SHELL_CLASSNAME,
  MASTER_TOOLBAR_INPUT_CLASSNAME,
  MASTER_TOOLBAR_SELECT_CLASSNAME,
} from "@/components/shared/master-data-ui";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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

import type { AssessmentWorklistRow } from "./actions";
import { getAssessmentWorklistStatusSurface, type AssessmentWorklistStatus } from "./worklist-shared";

type AssessmentWorklistViewProps = {
  rows: AssessmentWorklistRow[];
};

type FilterState = {
  date: string;
  room: string;
  status: "all" | AssessmentWorklistStatus;
  search: string;
};

const STATUS_OPTIONS: Array<{ value: FilterState["status"]; label: string }> = [
  { value: "all", label: "Semua status" },
  { value: "menunggu_asesmen", label: getAssessmentWorklistStatusSurface("menunggu_asesmen").label },
  { value: "draft", label: getAssessmentWorklistStatusSurface("draft").label },
  { value: "ready_for_doctor", label: getAssessmentWorklistStatusSurface("ready_for_doctor").label },
  { value: "priority_handover", label: getAssessmentWorklistStatusSurface("priority_handover").label },
  { value: "observation", label: getAssessmentWorklistStatusSurface("observation").label },
];

export function AssessmentWorklistView({ rows }: AssessmentWorklistViewProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    date: searchParams.get("date") ?? "",
    room: searchParams.get("room") ?? "all",
    status: (searchParams.get("status") as FilterState["status"] | null) ?? "all",
    search: searchParams.get("search") ?? "",
  });

  useEffect(() => {
    const nextFilters: FilterState = {
      date: searchParams.get("date") ?? "",
      room: searchParams.get("room") ?? "all",
      status: (searchParams.get("status") as FilterState["status"] | null) ?? "all",
      search: searchParams.get("search") ?? "",
    };

    setFilters((current) =>
      current.date === nextFilters.date &&
      current.room === nextFilters.room &&
      current.status === nextFilters.status &&
      current.search === nextFilters.search
        ? current
        : nextFilters,
    );
  }, [searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());

    syncQueryParam(nextParams, "date", filters.date);
    syncQueryParam(nextParams, "room", filters.room === "all" ? "" : filters.room);
    syncQueryParam(nextParams, "status", filters.status === "all" ? "" : filters.status);
    syncQueryParam(nextParams, "search", filters.search);

    const nextQuery = nextParams.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace((nextQuery ? `${pathname}?${nextQuery}` : pathname) as Route, { scroll: false });
    }
  }, [filters, pathname, router, searchParams]);

  const roomOptions = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.roomLabel))).sort((left, right) =>
      left.localeCompare(right, "id-ID"),
    );
  }, [rows]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return rows.filter((row) => {
      if (filters.date && row.visitDate !== filters.date) {
        return false;
      }

      if (filters.room !== "all" && row.roomLabel !== filters.room) {
        return false;
      }

      if (filters.status !== "all" && row.status !== filters.status) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchHaystack = [
        row.registrationNumber,
        row.patientName,
        row.medicalRecordNumber,
        row.roomLabel,
        row.guarantorLabel,
      ]
        .join(" ")
        .toLowerCase();

      return searchHaystack.includes(normalizedSearch);
    });
  }, [filters, rows]);

  const tableRows = useMemo(() => {
    return filteredRows.map((row) => ({
      ...row,
      detailHref: `/pelayanan/asesmen-awal/${row.visitId}` as Route,
      visibleAlerts: row.alertBadges.slice(0, 2),
      remainingAlertCount: Math.max(row.alertBadges.length - 2, 0),
    }));
  }, [filteredRows]);

  function openDetail(href: Route) {
    router.push(href);
  }

  function resetFilters() {
    setFilters({
      date: "",
      room: "all",
      status: "all",
      search: "",
    });
  }

  return (
    <section className={cn(MASTER_LIST_SHELL_CLASSNAME, "space-y-5 overflow-hidden")}> 
      <div className="rounded-xl border bg-card/95 shadow-sm ring-1 ring-border/60">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Filter Antrean Asesmen</p>
            <p className="text-sm text-muted-foreground">Cari cepat pasien, sempitkan ruangan, dan fokuskan status yang perlu ditindaklanjuti.</p>
          </div>
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary md:flex">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-12">
            <div className="space-y-1 lg:col-span-5">
              <label htmlFor="assessment-search-filter" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Cari pasien
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="assessment-search-filter"
                  value={filters.search}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, search: event.target.value }))
                  }
                  placeholder="Cari no. daftar, pasien, no. RM, atau ruangan…"
                  className={cn(MASTER_TOOLBAR_INPUT_CLASSNAME, "h-10 w-full rounded-lg border-border/70 bg-background pl-9 text-sm shadow-none")}
                  aria-label="Cari antrean asesmen"
                />
              </div>
            </div>

            <div className="space-y-1 lg:col-span-3">
              <label htmlFor="assessment-date-filter" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tanggal kunjungan
              </label>
              <Input
                id="assessment-date-filter"
                type="date"
                value={filters.date}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, date: event.target.value }))
                }
                className="h-10 rounded-lg border-border/70 bg-background text-sm shadow-none"
              />
            </div>

            <div className="lg:col-span-2">
              <FilterSelect
                id="assessment-room-filter"
                label="Ruangan"
                value={filters.room}
                placeholder="Semua ruangan"
                options={roomOptions.map((room) => ({ value: room, label: room }))}
                onValueChange={(value) =>
                  setFilters((current) => ({ ...current, room: value ?? "all" }))
                }
              />
            </div>

            <div className="lg:col-span-2">
              <FilterSelect
                id="assessment-status-filter"
                label="Status asesmen"
                value={filters.status}
                placeholder="Semua status"
                options={STATUS_OPTIONS}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    status: (value ?? "all") as FilterState["status"],
                  }))
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-background/70 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 font-medium text-foreground">
                <Stethoscope className="h-4 w-4 text-primary" />
                {tableRows.length} pasien siap ditindaklanjuti
              </span>
              <span>{rows.length} total antrean asesmen aktif</span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
              className={cn(MASTER_ACTION_BUTTON_CLASSNAME, "h-10 rounded-lg border-border/70 bg-background px-4 hover:bg-accent/50")}
            >
              Reset filter
            </Button>
          </div>
        </div>
      </div>

      {tableRows.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Tidak ada antrean asesmen"
          description={
            rows.length === 0
              ? "Belum ada kunjungan yang masuk ke antrean asesmen awal untuk klinik aktif."
              : "Filter saat ini belum menemukan pasien yang cocok. Ubah kata kunci atau reset filter untuk melihat antrean lain."
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
            <Table className="min-w-[860px] [&_tbody_tr:last-child_td]:border-b-0 [&_td]:border-b [&_td]:border-border/60 [&_th]:bg-muted/20 [&_th]:text-muted-foreground/90">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[28%]">Pasien</TableHead>
                  <TableHead className="w-[18%]">Kunjungan</TableHead>
                  <TableHead className="w-[22%]">Status</TableHead>
                  <TableHead className="w-[22%]">Ringkasan</TableHead>
                  <TableHead className="w-[10%] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row) => (
                  <TableRow
                    key={row.visitId}
                    tabIndex={0}
                    role="link"
                    className={cn(
                      "align-top cursor-pointer bg-transparent hover:bg-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                      row.rowClassName,
                    )}
                    onDoubleClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest("[data-prevent-row-click]")) return;
                      openDetail(row.detailHref);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openDetail(row.detailHref);
                      }
                    }}
                  >
                    <TableCell className="whitespace-normal">
                      <div className="space-y-2 py-1">
                        <div>
                        <Link
                          href={row.detailHref}
                          data-prevent-row-click
                          className="text-sm font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                        >
                            {row.patientName}
                          </Link>
                          <p className="text-sm text-muted-foreground">No. RM {row.medicalRecordNumber}</p>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>{row.genderLabel}</span>
                          <span>{row.ageLabel}</span>
                          <span>{row.guarantorLabel}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="space-y-1 py-1 text-sm">
                        <p className="font-medium text-foreground">{row.registrationNumber}</p>
                        <p className="text-muted-foreground">{row.registrationDateTime}</p>
                        <p className="text-muted-foreground">{row.roomLabel}</p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="space-y-2 py-1">
                        <StateBadge label={row.statusLabel} className={row.badgeClassName} />
                        <AlertBadgeList
                          alerts={row.visibleAlerts}
                          remainingCount={row.remainingAlertCount}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <p className="line-clamp-3 py-1 text-sm leading-6 text-foreground">{row.statusSummary}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end py-1">
                        <Link
                          href={row.detailHref}
                          data-prevent-row-click
                          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 rounded-lg border-primary/30 bg-primary/10 px-3 text-primary hover:bg-primary/15 hover:text-primary")}
                        >
                          {row.ctaLabel}
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Klik dua kali pada baris untuk membuka detail asesmen.
          </p>
        </>
      )}
    </section>
  );
}

function FilterSelect({
  label,
  id,
  value,
  placeholder,
  options,
  onValueChange,
}: {
  label: string;
  id: string;
  value: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  onValueChange: (value: string | null) => void;
}) {
  const labelId = `${id}-label`;
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <div className="space-y-1">
      <p id={labelId} className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          aria-labelledby={labelId}
          className={cn(MASTER_TOOLBAR_SELECT_CLASSNAME, "h-10 w-full rounded-lg border-border/70 bg-background text-sm shadow-none")}
        >
          <SelectValue>{selectedLabel ?? placeholder}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options
            .filter((option) => option.value !== "all")
            .map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function syncQueryParam(searchParams: URLSearchParams, key: string, value: string) {
  const normalized = value.trim();

  if (normalized.length === 0) {
    searchParams.delete(key);
    return;
  }

  searchParams.set(key, normalized);
}

function StateBadge({ label, className }: { label: string; className: string }) {
  return (
    <Badge className={cn("h-6 rounded-md px-2.5 text-[11px] font-semibold shadow-none", className)}>
      {label}
    </Badge>
  );
}

function AlertBadgeList({
  alerts,
  remainingCount,
}: {
  alerts: string[];
  remainingCount: number;
}) {
  if (alerts.length === 0 && remainingCount === 0) {
    return (
      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <TriangleAlert className="h-3.5 w-3.5" />
        Tidak ada alert khusus
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {alerts.map((alert) => (
        <Badge
          key={alert}
          variant="outline"
          className="h-6 rounded-md border-amber-500/25 bg-amber-500/10 px-2 text-[11px] font-medium text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200"
        >
          {alert}
        </Badge>
      ))}
      {remainingCount > 0 ? (
        <Badge variant="outline" className="h-6 rounded-md border-border/70 bg-background px-2 text-[11px] font-medium text-muted-foreground">
          +{remainingCount} alert
        </Badge>
      ) : null}
    </div>
  );
}
