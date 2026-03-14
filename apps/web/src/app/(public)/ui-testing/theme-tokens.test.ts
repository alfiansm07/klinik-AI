import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import path from "node:path";

const cssPath = path.resolve(process.cwd(), "apps/web/src/index.css");

describe("theme tokens", () => {
  test("uses the requested lime clinic palette", () => {
    const css = readFileSync(cssPath, "utf8");

    assert.match(css, /--background:\s*rgb\(251, 252, 248\);/);
    assert.match(css, /--primary:\s*rgb\(175, 243, 62\);/);
    assert.match(css, /--secondary:\s*rgb\(51, 65, 85\);/);
    assert.match(css, /--accent:\s*rgb\(240, 253, 244\);/);
    assert.match(css, /--radius:\s*1rem;/);
  });
});
