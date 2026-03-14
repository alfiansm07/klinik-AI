import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { pickActiveMembership } from "./tenant-context";

describe("tenant-context", () => {
  test("picks the first active membership", () => {
    const membership = pickActiveMembership([
      { id: "m1", clinicId: "c1", role: "doctor", isActive: false },
      { id: "m2", clinicId: "c2", role: "admin", isActive: true },
      { id: "m3", clinicId: "c3", role: "cashier", isActive: true },
    ]);

    assert.equal(membership?.id, "m2");
  });

  test("returns null when no active membership exists", () => {
    const membership = pickActiveMembership([
      { id: "m1", clinicId: "c1", role: "doctor", isActive: false },
    ]);

    assert.equal(membership, null);
  });
});
