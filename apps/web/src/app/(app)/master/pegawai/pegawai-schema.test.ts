import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  hasRequiredEmployeeColumns,
  hasRequiredEmployeeLicenseColumns,
  readColumnNames,
} from "./pegawai-schema";

describe("pegawai schema helpers", () => {
  test("accepts the current employee table columns", () => {
    const result = hasRequiredEmployeeColumns([
      "id",
      "clinic_id",
      "code",
      "nik",
      "nip",
      "full_name",
      "title_prefix",
      "title_suffix",
      "gender",
      "birth_place",
      "birth_date",
      "religion",
      "marital_status",
      "address",
      "email",
      "phone",
      "position",
      "workplace_name",
      "parent_institution_name",
      "external_reference",
      "is_active",
    ]);

    assert.equal(result, true);
  });

  test("rejects the legacy employee table columns", () => {
    const result = hasRequiredEmployeeColumns([
      "id",
      "clinic_id",
      "user_id",
      "code",
      "display_name",
      "nik",
      "sip_number",
      "sip_expiry_date",
      "str_number",
      "str_expiry_date",
      "bpjs_doctor_code",
      "specialization",
      "employment_type",
      "integrations",
      "is_active",
    ]);

    assert.equal(result, false);
  });

  test("accepts the current employee license table columns", () => {
    const result = hasRequiredEmployeeLicenseColumns([
      "id",
      "clinic_id",
      "employee_id",
      "license_type",
      "license_number",
      "issued_date",
      "valid_until",
      "is_lifetime",
      "notes",
      "sort_order",
    ]);

    assert.equal(result, true);
  });

  test("reads column names from information schema rows", () => {
    const result = readColumnNames([
      { column_name: "id" },
      { column_name: "clinic_id" },
      { column_name: 123 },
    ]);

    assert.deepEqual(result, ["id", "clinic_id"]);
  });
});
