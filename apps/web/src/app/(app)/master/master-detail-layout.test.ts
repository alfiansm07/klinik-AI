import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";

const MASTER_DETAIL_PAGE_PATHS = [
  "apps/web/src/app/(app)/master/ruangan/[id]/page.tsx",
  "apps/web/src/app/(app)/master/obat/[id]/page.tsx",
  "apps/web/src/app/(app)/master/tindakan/[id]/page.tsx",
  "apps/web/src/app/(app)/master/guarantors/[id]/page.tsx",
  "apps/web/src/app/(app)/master/tariff-components/[id]/page.tsx",
  "apps/web/src/app/(app)/master/laborat/[id]/page.tsx",
];

describe("master detail page layout", () => {
  test("keeps detail pages in a centered compact container", () => {
    for (const relativePath of MASTER_DETAIL_PAGE_PATHS) {
      const source = readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

      assert.match(
        source,
        /mx-auto\s+w-full\s+max-w-5xl\s+space-y-6/,
        `${relativePath} should use compact detail wrapper`,
      );
    }
  });
});
