import "server-only";

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import { ICD10_BLOCKS, ICD10_CHAPTERS } from "./icd10-metadata";

export const ICD10_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

type SearchParamsInput = {
  query?: string;
  page?: number;
  pageSize?: number;
};

export type Icd10DiagnosisRow = {
  code: string;
  name: string;
  parentName: string;
  chapterTitle: string;
  version: string;
};

export type Icd10DiagnosisPage = {
  rows: Icd10DiagnosisRow[];
  query: string;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startItem: number;
  endItem: number;
};

const CHAPTER_TITLE_BY_NUMBER = new Map(
  ICD10_CHAPTERS.map((chapter) => [chapter.number, chapter.title]),
);

function resolveIcd10CsvPath() {
  const candidates = [
    path.resolve(
      process.cwd(),
      "docs",
      "icd10",
      "[PUBLIC] ICD-10 e-klaim.xlsx - ICD10 (1).csv",
    ),
    path.resolve(
      process.cwd(),
      "..",
      "..",
      "docs",
      "icd10",
      "[PUBLIC] ICD-10 e-klaim.xlsx - ICD10 (1).csv",
    ),
  ];

  const csvPath = candidates.find((candidate) => existsSync(candidate));

  if (!csvPath) {
    throw new Error("ICD-10 CSV source file not found.");
  }

  return csvPath;
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current);

  return values;
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function getCategoryCode(code: string) {
  return code.split(".")[0] ?? code;
}

function getParentBlock(categoryCode: string) {
  return ICD10_BLOCKS.find(
    (block) => block.start <= categoryCode && categoryCode <= block.end,
  );
}

const getIcd10Diagnoses = cache(async (): Promise<Icd10DiagnosisRow[]> => {
  const csvPath = resolveIcd10CsvPath();
  const fileContent = await readFile(csvPath, "utf8");
  const lines = fileContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.slice(1).map((line) => {
    const [rawCode = "", rawName = "", rawVersion = ""] = parseCsvLine(line);
    const code = normalizeCode(rawCode);
    const categoryCode = getCategoryCode(code);
    const block = getParentBlock(categoryCode);

    return {
      code,
      name: rawName.trim(),
      parentName: block?.title ?? "-",
      chapterTitle: block
        ? (CHAPTER_TITLE_BY_NUMBER.get(block.chapterNumber) ?? "-")
        : "-",
      version: rawVersion.trim(),
    } satisfies Icd10DiagnosisRow;
  });
});

function normalizeQuery(query?: string) {
  return query?.trim().toLowerCase() ?? "";
}

function filterDiagnoses(rows: Icd10DiagnosisRow[], query?: string) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return rows;
  }

  return rows.filter((row) =>
    [row.code, row.name, row.parentName, row.chapterTitle].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    ),
  );
}

function sanitizePositiveInteger(value: number | undefined, fallback: number) {
  if (!value || Number.isNaN(value) || value < 1) {
    return fallback;
  }

  return Math.floor(value);
}

function sanitizePageSize(pageSize: number | undefined) {
  const fallback = ICD10_PAGE_SIZE_OPTIONS[0];

  if (!pageSize) {
    return fallback;
  }

  return ICD10_PAGE_SIZE_OPTIONS.includes(
    pageSize as (typeof ICD10_PAGE_SIZE_OPTIONS)[number],
  )
    ? pageSize
    : fallback;
}

export async function getIcd10DiagnosisPage(
  params: SearchParamsInput,
): Promise<Icd10DiagnosisPage> {
  const allRows = await getIcd10Diagnoses();
  const filteredRows = filterDiagnoses(allRows, params.query);
  const pageSize = sanitizePageSize(params.pageSize);
  const totalItems = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const requestedPage = sanitizePositiveInteger(params.page, 1);
  const page = Math.min(requestedPage, totalPages);
  const startIndex = (page - 1) * pageSize;
  const rows = filteredRows.slice(startIndex, startIndex + pageSize);
  const startItem = totalItems === 0 ? 0 : startIndex + 1;
  const endItem = totalItems === 0 ? 0 : startIndex + rows.length;

  return {
    rows,
    query: params.query?.trim() ?? "",
    page,
    pageSize,
    totalItems,
    totalPages,
    startItem,
    endItem,
  };
}

export async function getIcd10DiagnosisExportRows(query?: string) {
  const allRows = await getIcd10Diagnoses();

  return filterDiagnoses(allRows, query);
}

function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

export function buildIcd10DiagnosisCsv(rows: Icd10DiagnosisRow[]) {
  const header = ["Kode", "Nama", "Nama Induk", "Bab", "Versi"];
  const body = rows.map((row) => [
    row.code,
    row.name,
    row.parentName,
    row.chapterTitle,
    row.version,
  ]);

  return [header, ...body]
    .map((columns) => columns.map(escapeCsvValue).join(","))
    .join("\n");
}
