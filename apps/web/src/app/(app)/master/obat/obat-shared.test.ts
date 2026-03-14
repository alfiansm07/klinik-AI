import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  INVENTORY_METHOD_LABELS,
  PRICING_METHOD_LABELS,
  formatInventoryMethodLabel,
  formatPricingMethodLabel,
} from "./obat-shared";

describe("obat shared labels", () => {
  test("formats supported pricing and inventory methods into human-readable labels", () => {
    for (const [value, label] of Object.entries(PRICING_METHOD_LABELS)) {
      assert.equal(formatPricingMethodLabel(value), label);
      assert.doesNotMatch(formatPricingMethodLabel(value), /_/);
    }

    for (const [value, label] of Object.entries(INVENTORY_METHOD_LABELS)) {
      assert.equal(formatInventoryMethodLabel(value), label);
      assert.doesNotMatch(formatInventoryMethodLabel(value), /_/);
    }
  });

  test("does not leak raw enum values when pricing or inventory mapping is missing", () => {
    assert.equal(formatPricingMethodLabel("harga_khusus"), "Metode harga tidak dikenal");
    assert.equal(
      formatInventoryMethodLabel("moving_average"),
      "Metode inventori tidak dikenal",
    );
  });
});
