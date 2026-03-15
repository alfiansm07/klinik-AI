import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  JABATAN_OPTIONS,
  getPegawaiSchemaActionError,
  formatJabatanLabel,
  getSelectNextValue,
  getSelectOptionLabel,
  getSelectValue,
  normalizeLicenseRows,
  validateLicenseLifetimeRule,
  withPegawaiSchemaFallback,
} from "./pegawai-shared";
import {
  PegawaiSchemaError,
  PEGAWAI_SCHEMA_ERROR_MESSAGE,
} from "./pegawai-schema";

describe("pegawai shared helpers", () => {
  test("exposes canonical jabatan options and formats labels", () => {
    assert.equal(JABATAN_OPTIONS[0]?.key, "staf_non_medis");
    assert.equal(formatJabatanLabel("apoteker"), "Apoteker");
    assert.equal(formatJabatanLabel("unknown"), "-");
  });

  test("returns human-readable labels for select values", () => {
    assert.equal(getSelectOptionLabel(JABATAN_OPTIONS, "analis_farmasi"), "Analis Farmasi");
    assert.equal(getSelectOptionLabel(JABATAN_OPTIONS, "unknown"), null);
  });

  test("keeps select values controlled with empty string fallback", () => {
    assert.equal(getSelectValue(undefined), "");
    assert.equal(getSelectValue(null), "");
    assert.equal(getSelectValue("dokter"), "dokter");
  });

  test("maps clear select sentinel back to empty string", () => {
    assert.equal(getSelectNextValue("__empty__"), "");
    assert.equal(getSelectNextValue("perawat"), "perawat");
  });

  test("drops blank license rows and trims values", () => {
    assert.deepEqual(
      normalizeLicenseRows([
        {
          id: "  ",
          licenseType: "",
          licenseNumber: "",
          issuedDate: null,
          validUntil: null,
          isLifetime: false,
          notes: "  ",
        },
        {
          id: " row-1 ",
          licenseType: "sip",
          licenseNumber: " ABC-123 ",
          issuedDate: new Date("2026-01-01"),
          validUntil: new Date("2027-01-01"),
          isLifetime: false,
          notes: " Catatan ",
        },
      ]),
      [
        {
          id: "row-1",
          licenseType: "sip",
          licenseNumber: "ABC-123",
          issuedDate: new Date("2026-01-01"),
          validUntil: new Date("2027-01-01"),
          isLifetime: false,
          notes: "Catatan",
        },
      ],
    );
  });

  test("validates lifetime license date rules", () => {
    assert.equal(
      validateLicenseLifetimeRule({ isLifetime: true, validUntil: null }),
      true,
    );
    assert.equal(
      validateLicenseLifetimeRule({
        isLifetime: true,
        validUntil: new Date("2026-01-01"),
      }),
      false,
    );
    assert.equal(
      validateLicenseLifetimeRule({ isLifetime: false, validUntil: null }),
      false,
    );
    assert.equal(
      validateLicenseLifetimeRule({
        isLifetime: false,
        validUntil: new Date("2026-01-01"),
      }),
      true,
    );
  });

  test("exposes a clear schema mismatch message", () => {
    assert.match(PEGAWAI_SCHEMA_ERROR_MESSAGE, /migrasi database terbaru/i);
  });

  test("maps schema mismatch to a safe action error message", () => {
    assert.equal(
      getPegawaiSchemaActionError(),
      "Modul pegawai belum siap digunakan. Jalankan migrasi database terbaru terlebih dahulu.",
    );
  });

  test("returns fallback when schema is not ready for client actions", async () => {
    const fallback = { success: false, error: getPegawaiSchemaActionError() };

    const result = await withPegawaiSchemaFallback(
      async () => {
        throw new PegawaiSchemaError();
      },
      async () => {
        return { success: true };
      },
      fallback,
    );

    assert.deepEqual(result, fallback);
  });

  test("rethrows schema errors when no fallback is provided", async () => {
    await assert.rejects(
      withPegawaiSchemaFallback(
        async () => {},
        async () => {
          throw new PegawaiSchemaError();
        },
      ),
      PegawaiSchemaError,
    );
  });

  test("checks schema readiness before returning fallback", async () => {
    let called = false;

    const result = await withPegawaiSchemaFallback(
      async () => {
        called = true;
        throw new PegawaiSchemaError();
      },
      async () => "PGW999",
      "PGW001",
    );

    assert.equal(called, true);
    assert.equal(result, "PGW001");
  });
});
