import { NextResponse } from "next/server";

import { getPageAuthContext } from "@/lib/auth-helpers";
import {
  buildIcd10DiagnosisCsv,
  getIcd10DiagnosisExportRows,
} from "@/lib/icd10-catalog";

export async function GET(request: Request) {
  await getPageAuthContext("master");

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const rows = await getIcd10DiagnosisExportRows(query);
  const csv = buildIcd10DiagnosisCsv(rows);

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="diagnosa-icd10.csv"',
      "cache-control": "no-store",
    },
  });
}
