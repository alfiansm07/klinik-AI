import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  JABATAN_OPTIONS,
  formatJabatanLabel,
  normalizeLicenseRows,
  validateLicenseLifetimeRule,
} from "./pegawai-shared";
import { PEGAWAI_SCHEMA_ERROR_MESSAGE } from "./pegawai-schema";

describe("pegawai shared helpers", () => {
  test("exposes canonical jabatan options and formats labels", () => {
    assert.equal(JABATAN_OPTIONS[0]?.key, "staf_non_medis");
    assert.equal(formatJabatanLabel("apoteker"), "Apoteker");
    assert.equal(formatJabatanLabel("unknown"), "-");
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
});
