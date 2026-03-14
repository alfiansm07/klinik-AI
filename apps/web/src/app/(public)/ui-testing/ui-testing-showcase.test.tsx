import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { UiTestingShowcase } from "./ui-testing-showcase";

describe("UiTestingShowcase", () => {
  test("renders the core UI preview sections", () => {
    const markup = renderToStaticMarkup(<UiTestingShowcase />);

    assert.match(markup, /Klinikai UI Testing/i);
    assert.match(markup, /Buttons/i);
    assert.match(markup, /Form Fields/i);
    assert.match(markup, /Cards/i);
    assert.match(markup, /Dropdown Menu/i);
    assert.match(markup, /Loading and Skeleton/i);
  });

  test("renders the toast preview actions for theme review", () => {
    const markup = renderToStaticMarkup(<UiTestingShowcase />);

    assert.match(markup, /Toast Preview/i);
    assert.match(markup, /Toast success/i);
    assert.match(markup, /Toast warning/i);
    assert.match(markup, /Toast error/i);
  });
});
