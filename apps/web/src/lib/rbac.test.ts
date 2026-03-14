import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { canAccessModule, hasAnyRole } from "./rbac";

describe("rbac", () => {
  test("matches the expected role-module access matrix", () => {
    const matrix = [
      { role: "superadmin", module: "care", allowed: true },
      { role: "admin", module: "care", allowed: true },
      { role: "receptionist", module: "registration", allowed: true },
      { role: "receptionist", module: "care", allowed: false },
      { role: "nurse", module: "care", allowed: true },
      { role: "doctor", module: "care", allowed: true },
      { role: "cashier", module: "dashboard", allowed: true },
      { role: "cashier", module: "registration", allowed: false },
    ] as const;

    for (const entry of matrix) {
      assert.equal(
        canAccessModule(entry.role, entry.module),
        entry.allowed,
        `${entry.role} -> ${entry.module}`,
      );
    }
  });

  test("admin matches one of many roles", () => {
    assert.equal(hasAnyRole("admin", ["doctor", "admin"]), true);
  });
});
