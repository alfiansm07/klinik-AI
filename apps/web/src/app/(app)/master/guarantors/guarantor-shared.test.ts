import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  ALL_GUARANTOR_TYPES,
  GUARANTOR_TYPE_LABELS,
  formatGuarantorTypeLabel,
} from "./guarantor-shared";

describe("guarantor shared labels", () => {
  test("formats supported guarantor types into human-readable labels", () => {
    for (const value of ALL_GUARANTOR_TYPES) {
      assert.equal(formatGuarantorTypeLabel(value), GUARANTOR_TYPE_LABELS[value]);
      assert.doesNotMatch(formatGuarantorTypeLabel(value), /_/);
    }
  });

  test("does not leak raw enum values when guarantor type mapping is missing", () => {
    assert.equal(
      formatGuarantorTypeLabel("jenis_baru"),
      "Jenis penjamin tidak dikenal",
    );
  });
});
