import "server-only";

import { db } from "@klinik-AI/db";
import { sql } from "drizzle-orm";

import {
  canReadPegawaiTables,
  PegawaiSchemaError,
  readColumnNames,
} from "./pegawai-schema";

async function getTableColumns(tableName: "employee" | "employee_license") {
  const result = await db.execute(sql<{ column_name: string }>`
    select column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = ${tableName}
    order by ordinal_position
  `);

  return readColumnNames(
    result.rows.map((row) => ({
      column_name: row.column_name,
    })),
  );
}

export async function assertPegawaiSchemaReady() {
  const status = await canReadPegawaiTables(
    () => getTableColumns("employee"),
    () => getTableColumns("employee_license"),
  );

  if (!status.employeeReady || !status.employeeLicenseReady) {
    throw new PegawaiSchemaError();
  }
}
