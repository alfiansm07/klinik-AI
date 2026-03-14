import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import path from "node:path";

const buttonPath = path.resolve(process.cwd(), "apps/web/src/components/ui/button.tsx");
const cardPath = path.resolve(process.cwd(), "apps/web/src/components/ui/card.tsx");
const inputPath = path.resolve(process.cwd(), "apps/web/src/components/ui/input.tsx");
const dropdownPath = path.resolve(process.cwd(), "apps/web/src/components/ui/dropdown-menu.tsx");

describe("ui theme classes", () => {
  test("button, card, input, and dropdown use theme radius and shadow styling", () => {
    const button = readFileSync(buttonPath, "utf8");
    const card = readFileSync(cardPath, "utf8");
    const input = readFileSync(inputPath, "utf8");
    const dropdown = readFileSync(dropdownPath, "utf8");

    assert.match(button, /rounded-lg/);
    assert.match(button, /shadow-sm/);
    assert.match(card, /rounded-xl/);
    assert.match(card, /shadow-sm/);
    assert.match(input, /rounded-lg/);
    assert.match(dropdown, /rounded-xl/);
    assert.match(dropdown, /shadow-lg/);
  });
});
