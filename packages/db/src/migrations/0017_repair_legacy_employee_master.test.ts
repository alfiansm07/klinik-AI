import { join } from "node:path";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const migrationPath = join(
  fileURLToPath(new URL(".", import.meta.url)),
  "0017_repair_legacy_employee_master.sql",
);
const migrationSql = readFileSync(migrationPath, "utf8");

describe("0017_repair_legacy_employee_master migration", () => {
  test("upgrades the legacy employee table in place", () => {
    assert.match(migrationSql, /ALTER TABLE "employee" ALTER COLUMN "user_id" DROP NOT NULL;/);
    assert.match(migrationSql, /ADD COLUMN IF NOT EXISTS "full_name" text;/);
    assert.match(
      migrationSql,
      /full_name = COALESCE\(NULLIF\(employee\.display_name, ''\), employee\.code, 'Pegawai'\)/,
    );
    assert.match(migrationSql, /CREATE UNIQUE INDEX IF NOT EXISTS "employee_clinic_id_unique_idx"/);
  });

  test("creates employee_license and migrates legacy STR\/SIP data", () => {
    assert.match(migrationSql, /CREATE TABLE IF NOT EXISTS "employee_license" \(/);
    assert.match(migrationSql, /INSERT INTO "employee_license"/);
    assert.match(migrationSql, /'str'/);
    assert.match(migrationSql, /'sip'/);
    assert.match(migrationSql, /employee_license_clinic_employee_fk/);
  });
});
