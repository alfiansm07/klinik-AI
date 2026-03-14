"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { EmptyState } from "./empty-state";
import {
  MASTER_LIST_SHELL_CLASSNAME,
  MASTER_PAGINATION_BUTTON_CLASSNAME,
  MASTER_TOOLBAR_CLASSNAME,
  MASTER_TOOLBAR_GROUP_CLASSNAME,
  MASTER_TOOLBAR_INPUT_CLASSNAME,
  MASTER_TOOLBAR_META_CLASSNAME,
  MASTER_TOOLBAR_SELECT_CLASSNAME,
} from "./master-data-ui";

// ─── Types ────────────────────────────────────────────────────

type StatusFilter = "all" | "active" | "inactive";

type FilterOption = {
  label: string;
  value: string;
};

type EnumFilterConfig = {
  columnId: string;
  label: string;
  options: FilterOption[];
};

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** Columns to search across (client-side). Defaults to ["code", "name"] */
  searchableColumns?: string[];
  searchPlaceholder?: string;
  /** Show aktif/nonaktif filter. Requires `isActive` field on data. */
  showStatusFilter?: boolean;
  /** Additional enum filter (e.g. guarantor type, payment method type) */
  enumFilter?: EnumFilterConfig;
  /** Page size options. Defaults to [10, 25, 50] */
  pageSizeOptions?: number[];
  /** Empty state config */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  /** Click row callback (e.g., click row = edit). Adds cursor-pointer to rows. */
  onRowClick?: (row: TData) => void;
  /** Toolbar action buttons (e.g., "Tambah Obat", "Upload"). Rendered right-aligned in toolbar. */
  toolbarActions?: React.ReactNode;
};

// ─── Component ────────────────────────────────────────────────

export function DataTable<TData extends Record<string, unknown>>({
  columns,
  data,
  searchableColumns = ["code", "name"],
  searchPlaceholder = "Cari kode atau nama...",
  showStatusFilter = true,
  enumFilter,
  pageSizeOptions = [10, 25, 50],
  emptyTitle = "Belum ada data",
  emptyDescription,
  emptyAction,
  onRowClick,
  toolbarActions,
}: DataTableProps<TData>) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [enumFilterValue, setEnumFilterValue] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Client-side filtering
  const filteredData = useMemo(() => {
    let result = data;

    // Status filter
    if (showStatusFilter && statusFilter !== "all") {
      const isActive = statusFilter === "active";
      result = result.filter((row) => row.isActive === isActive);
    }

    // Enum filter
    if (enumFilter && enumFilterValue !== "all") {
      result = result.filter(
        (row) => String(row[enumFilter.columnId]) === enumFilterValue,
      );
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((row) =>
        searchableColumns.some((col) => {
          const val = row[col];
          return typeof val === "string" && val.toLowerCase().includes(q);
        }),
      );
    }

    return result;
  }, [data, search, statusFilter, enumFilter, enumFilterValue, searchableColumns, showStatusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: pageSizeOptions[0] ?? 10 },
    },
  });

  return (
    <div className={MASTER_LIST_SHELL_CLASSNAME}>
      {/* Toolbar */}
      <div className={MASTER_TOOLBAR_CLASSNAME}>
        <div className={MASTER_TOOLBAR_GROUP_CLASSNAME}>
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={MASTER_TOOLBAR_INPUT_CLASSNAME}
          />

          {showStatusFilter && (
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                if (val) setStatusFilter(val as StatusFilter);
              }}
            >
              <SelectTrigger className={cn("w-40", MASTER_TOOLBAR_SELECT_CLASSNAME)}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          )}

          {enumFilter && (
            <Select
              value={enumFilterValue}
              onValueChange={(val) => {
                if (val) setEnumFilterValue(val);
              }}
            >
              <SelectTrigger className={cn("w-48", MASTER_TOOLBAR_SELECT_CLASSNAME)}>
                <SelectValue placeholder={enumFilter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua {enumFilter.label}</SelectItem>
                {enumFilter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <span className={MASTER_TOOLBAR_META_CLASSNAME}>
            {filteredData.length} dari {data.length} data
          </span>
          {toolbarActions ? (
            <div className="flex flex-wrap items-center gap-3 [&_a]:h-10 [&_a]:rounded-lg [&_a]:px-4 [&_a]:text-sm [&_button]:h-10 [&_button]:rounded-lg [&_button]:px-4 [&_button]:text-sm">
              {toolbarActions}
            </div>
          ) : null}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="flex items-center gap-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={(event) => {
                    const target = event.target;

                    if (
                      target instanceof Element &&
                      target.closest('[data-prevent-row-click="true"]')
                    ) {
                      return;
                    }

                    onRowClick?.(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredData.length > (pageSizeOptions[0] ?? 10) && (
        <div className="flex flex-col gap-4 border-t pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className={MASTER_TOOLBAR_META_CLASSNAME}>Tampilkan</span>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(val) => table.setPageSize(Number(val))}
            >
              <SelectTrigger className={cn("w-20", MASTER_TOOLBAR_SELECT_CLASSNAME)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className={MASTER_TOOLBAR_META_CLASSNAME}>data</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <span className={MASTER_TOOLBAR_META_CLASSNAME}>
              Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              className={MASTER_PAGINATION_BUTTON_CLASSNAME}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              className={MASTER_PAGINATION_BUTTON_CLASSNAME}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper: Sortable column header ───────────────────────────

export function SortableHeader({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1">
      {label}
    </span>
  );
}
