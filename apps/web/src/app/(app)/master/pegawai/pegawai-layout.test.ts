import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";

const pegawaiDetailPagePath = path.resolve(
  process.cwd(),
  "apps/web/src/app/(app)/master/pegawai/[id]/page.tsx",
);
const pegawaiListViewPath = path.resolve(
  process.cwd(),
  "apps/web/src/app/(app)/master/pegawai/pegawai-view.tsx",
);
const pegawaiDetailViewPath = path.resolve(
  process.cwd(),
  "apps/web/src/app/(app)/master/pegawai/[id]/detail-view.tsx",
);

describe("pegawai compact layout", () => {
  test("keeps detail page content in a centered compact container", () => {
    const pageSource = readFileSync(pegawaiDetailPagePath, "utf8");

    assert.match(pageSource, /mx-auto\s+w-full\s+max-w-5xl\s+space-y-6/);
  });

  test("uses a narrower form dialog width for add and edit pegawai", () => {
    const listViewSource = readFileSync(pegawaiListViewPath, "utf8");
    const detailViewSource = readFileSync(pegawaiDetailViewPath, "utf8");

    assert.match(listViewSource, /className="sm:max-w-4xl"/);
    assert.match(detailViewSource, /className="sm:max-w-4xl"/);
    assert.doesNotMatch(listViewSource, /className="sm:max-w-6xl"/);
    assert.doesNotMatch(detailViewSource, /className="sm:max-w-6xl"/);
  });
});
