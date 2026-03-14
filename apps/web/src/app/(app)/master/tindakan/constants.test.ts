import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  ACTION_CATEGORY_LABELS,
  ACTION_CATEGORY_VALUES,
  formatActionCategoryLabel,
} from "./constants";

describe("tindakan action category labels", () => {
  test("formats stored category values into human-readable labels", () => {
    assert.equal(
      formatActionCategoryLabel("prosedur_terapeutik"),
      "Prosedur Terapeutik",
    );
    assert.equal(
      formatActionCategoryLabel("pelayanan_psikiatri"),
      "Pelayanan Psikiatri",
    );
    assert.equal(formatActionCategoryLabel(null), "Tidak ada kategori");
  });

  test("keeps all configured category labels aligned with supported values", () => {
    for (const value of ACTION_CATEGORY_VALUES) {
      assert.equal(formatActionCategoryLabel(value), ACTION_CATEGORY_LABELS[value]);
      assert.doesNotMatch(formatActionCategoryLabel(value), /_/);
    }
  });

  test("does not leak raw enum values when category mapping is missing", () => {
    assert.equal(
      formatActionCategoryLabel("kategori_baru" as never),
      "Kategori tindakan tidak dikenal",
    );
  });
});
