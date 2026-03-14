import { db } from "@klinik-AI/db";
import { eq } from "drizzle-orm";
import type { AnyPgColumn, PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";

/**
 * Generate the next auto-incremented code for a master data table.
 *
 * Pattern: PREFIX + zero-padded number (e.g. OBT001, TND001)
 *
 * Queries for the highest existing numeric suffix matching the prefix
 * within the given clinic, then increments by 1.
 *
 * @param clinicId - The clinic to scope the query to
 * @param prefix - Code prefix (e.g. "OBT", "TND")
 * @param table - Drizzle table reference (must have `code` and `clinic_id` columns)
 * @param padLength - Zero-pad length for the numeric part (default: 3)
 * @returns Next code string (e.g. "OBT001", "OBT042")
 */
export async function generateNextCode(
  clinicId: string,
  prefix: string,
  options: {
    table: unknown;
    codeColumn: AnyPgColumn;
    clinicIdColumn: AnyPgColumn;
  },
  padLength = 3,
): Promise<string> {
  const { table, codeColumn, clinicIdColumn } = options;

  const rows = await db
    .select({ code: codeColumn })
    .from(table as PgTableWithColumns<TableConfig>)
    .where(eq(clinicIdColumn, clinicId));

  const pattern = new RegExp(`^${prefix}(\\d+)$`);

  const maxNum = rows.reduce((currentMax, row) => {
    const matched = pattern.exec(String(row.code));
    if (!matched) {
      return currentMax;
    }

    const parsed = Number.parseInt(matched[1], 10);
    if (!Number.isFinite(parsed)) {
      return currentMax;
    }

    return Math.max(currentMax, parsed);
  }, 0);

  const nextNum = maxNum + 1;
  return `${prefix}${String(nextNum).padStart(padLength, "0")}`;
}
