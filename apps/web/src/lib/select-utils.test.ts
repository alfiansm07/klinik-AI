import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  getRelationalSelectTriggerLabel,
  getSelectedOptionLabel,
  hasUnavailableSelectedOption,
  type RelationalSelectOption,
} from "./select-utils";

describe("select-utils", () => {
  const options: RelationalSelectOption[] = [
    { value: "g-1", label: "BPJS" },
    { value: "g-2", label: "Umum" },
  ];

  test("returns the selected label for a matching option value", () => {
    assert.equal(getSelectedOptionLabel(options, "g-1"), "BPJS");
  });

  test("returns undefined for empty or unknown values", () => {
    assert.equal(getSelectedOptionLabel(options, ""), undefined);
    assert.equal(getSelectedOptionLabel(options, undefined), undefined);
    assert.equal(getSelectedOptionLabel(options, null), undefined);
    assert.equal(getSelectedOptionLabel(options, "missing"), undefined);
  });

  test("detects unavailable selected values", () => {
    assert.equal(hasUnavailableSelectedOption(options, "g-1"), false);
    assert.equal(hasUnavailableSelectedOption(options, "missing"), true);
    assert.equal(hasUnavailableSelectedOption(options, ""), false);
  });

  test("builds honest trigger labels for empty, missing, and selected states", () => {
    assert.equal(
      getRelationalSelectTriggerLabel(options, "g-2", "Tidak dipilih", "Tidak ada data"),
      "Umum",
    );
    assert.equal(
      getRelationalSelectTriggerLabel(options, "", "Tidak dipilih", "Tidak ada data"),
      "Tidak dipilih",
    );
    assert.equal(
      getRelationalSelectTriggerLabel([], "", "Tidak dipilih", "Tidak ada data"),
      "Tidak ada data",
    );
    assert.equal(
      getRelationalSelectTriggerLabel(options, "missing", "Tidak dipilih", "Tidak ada data"),
      "Pilihan tersimpan tidak tersedia",
    );
  });
});
