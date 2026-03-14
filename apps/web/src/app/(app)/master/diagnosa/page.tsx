import Link from "next/link";
import { type Route } from "next";
import { FileSpreadsheet, Search, Stethoscope } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  MASTER_ACTION_BUTTON_CLASSNAME,
  MASTER_LIST_SHELL_CLASSNAME,
  MASTER_PAGINATION_BUTTON_CLASSNAME,
} from "@/components/shared/master-data-ui";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ICD10_PAGE_SIZE_OPTIONS,
  getIcd10DiagnosisPage,
} from "@/lib/icd10-catalog";

type SearchParams = Record<string, string | string[] | undefined>;

type DiagnosaPageProps = {
  searchParams?: Promise<SearchParams> | SearchParams;
};

function getSingleValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return Math.floor(parsedValue);
}

function buildDiagnosaHref(params: { query?: string; page?: number; pageSize?: number }) {
  const searchParams = new URLSearchParams();

  if (params.query?.trim()) {
    searchParams.set("q", params.query.trim());
  }

  if (params.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const queryString = searchParams.toString();

  return (queryString
    ? `/master/diagnosa?${queryString}`
    : "/master/diagnosa") as Route;
}

function buildExportHref(query: string) {
  const searchParams = new URLSearchParams();

  if (query.trim()) {
    searchParams.set("q", query.trim());
  }

  const queryString = searchParams.toString();

  return (queryString
    ? `/master/diagnosa/export?${queryString}`
    : "/master/diagnosa/export") as Route;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages]);

  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  return [...pages].sort((left, right) => left - right);
}

export default async function DiagnosaPage({ searchParams }: DiagnosaPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const query = getSingleValue(resolvedSearchParams.q) ?? "";
  const page = parsePositiveInteger(getSingleValue(resolvedSearchParams.page), 1);
  const pageSize = parsePositiveInteger(
    getSingleValue(resolvedSearchParams.pageSize),
    ICD10_PAGE_SIZE_OPTIONS[0],
  );

  const diagnosisPage = await getIcd10DiagnosisPage({
    query,
    page,
    pageSize,
  });

  const pageLinks = getVisiblePages(diagnosisPage.page, diagnosisPage.totalPages);
  const resetHref = "/master/diagnosa" as Route;
  const exportHref = buildExportHref(diagnosisPage.query);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Diagnosa"
        description="Katalog diagnosa ICD-10 2010 untuk pencarian, penelusuran blok, dan ekspor data master."
        icon={Stethoscope}
        action={
          <Link
            href={exportHref}
            className={`${buttonVariants({ size: "lg" })} ${MASTER_ACTION_BUTTON_CLASSNAME}`}
          >
            <FileSpreadsheet className="h-5 w-5" />
            Export Excel
          </Link>
        }
      />

      <section className={MASTER_LIST_SHELL_CLASSNAME}>
        <form className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-wrap items-end gap-4">
            <label className="grid gap-2 text-base text-muted-foreground">
              <span>Tampilkan</span>
              <select
                name="pageSize"
                defaultValue={String(diagnosisPage.pageSize)}
                className="h-11 min-w-20 rounded-lg border bg-background px-4 text-base text-foreground shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {ICD10_PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <span className="pb-2 text-base text-muted-foreground">Data</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <input type="hidden" name="page" value="1" />
            <label className="grid gap-2 text-base text-muted-foreground">
              <span>Pencarian</span>
              <input
                type="search"
                name="q"
                defaultValue={diagnosisPage.query}
                placeholder="Cari kode, nama, atau nama induk"
                className="h-11 w-full min-w-0 rounded-lg border bg-background px-4 text-base text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:w-[26rem]"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                className={`${buttonVariants({ size: "lg" })} ${MASTER_ACTION_BUTTON_CLASSNAME}`}
              >
                <Search className="h-5 w-5" />
                Cari
              </button>
              <Link
                href={resetHref}
                className={`${buttonVariants({ size: "lg", variant: "outline" })} ${MASTER_ACTION_BUTTON_CLASSNAME}`}
              >
                Reset
              </Link>
            </div>
          </div>
        </form>

        <div className="mt-4 rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">No.</TableHead>
                <TableHead className="w-28">Kode</TableHead>
                <TableHead className="min-w-80 whitespace-normal">Nama</TableHead>
                <TableHead className="min-w-72 whitespace-normal">Nama Induk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagnosisPage.rows.length > 0 ? (
                diagnosisPage.rows.map((row, index) => (
                  <TableRow key={row.code}>
                    <TableCell className="text-center">
                      {diagnosisPage.startItem + index}
                    </TableCell>
                    <TableCell className="font-medium">{row.code}</TableCell>
                    <TableCell className="whitespace-normal">{row.name}</TableCell>
                    <TableCell className="whitespace-normal">{row.parentName}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Tidak ada data diagnosa yang cocok dengan pencarian saat ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-5 flex flex-col gap-4 text-base text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
          <p className="font-medium">
            Menampilkan {diagnosisPage.startItem}-{diagnosisPage.endItem} dari{" "}
            {diagnosisPage.totalItems}
          </p>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              href={buildDiagnosaHref({
                query: diagnosisPage.query,
                pageSize: diagnosisPage.pageSize,
                page: Math.max(1, diagnosisPage.page - 1),
              })}
              aria-disabled={diagnosisPage.page === 1}
              className={`${buttonVariants({ size: "lg", variant: "outline" })} ${MASTER_PAGINATION_BUTTON_CLASSNAME}`}
            >
              Sebelumnya
            </Link>

            {pageLinks.map((pageNumber, index) => {
              const previousPage = pageLinks[index - 1];
              const showEllipsis =
                typeof previousPage === "number" && pageNumber - previousPage > 1;

              return (
                <div key={pageNumber} className="flex items-center gap-3">
                  {showEllipsis ? (
                    <span className="px-2 text-base font-medium text-muted-foreground">...</span>
                  ) : null}
                  <Link
                    href={buildDiagnosaHref({
                      query: diagnosisPage.query,
                      pageSize: diagnosisPage.pageSize,
                      page: pageNumber,
                    })}
                    aria-current={pageNumber === diagnosisPage.page ? "page" : undefined}
                    className={`${buttonVariants({
                      size: "lg",
                      variant: pageNumber === diagnosisPage.page ? "default" : "outline",
                    })} ${MASTER_PAGINATION_BUTTON_CLASSNAME}`}
                  >
                    {pageNumber}
                  </Link>
                </div>
              );
            })}

            <Link
              href={buildDiagnosaHref({
                query: diagnosisPage.query,
                pageSize: diagnosisPage.pageSize,
                page: Math.min(diagnosisPage.totalPages, diagnosisPage.page + 1),
              })}
              aria-disabled={diagnosisPage.page === diagnosisPage.totalPages}
              className={`${buttonVariants({ size: "lg", variant: "outline" })} ${MASTER_PAGINATION_BUTTON_CLASSNAME}`}
            >
              Berikutnya
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
