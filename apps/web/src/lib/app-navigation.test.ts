import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { getVisibleNavItems, groupNavItems } from "./app-navigation";

describe("app-navigation", () => {
  test("receptionist sees dashboard, registration, and master links", () => {
    const items = getVisibleNavItems("receptionist");

    assert.deepEqual(
      items.map((item) => item.href),
      ["/dashboard", "/pendaftaran/pasien", "/master"],
    );
  });

  test("admin sees dashboard, registration, and master links", () => {
    const items = getVisibleNavItems("admin");

    assert.deepEqual(
      items.map((item) => item.href),
      ["/dashboard", "/pendaftaran/pasien", "/pelayanan/asesmen-awal", "/master"],
    );
  });

  test("nurse sees dashboard, care, and master links", () => {
    const items = getVisibleNavItems("nurse");

    assert.deepEqual(
      items.map((item) => item.href),
      ["/dashboard", "/pelayanan/asesmen-awal", "/master"],
    );
  });

  test("doctor sees dashboard, care, and master links", () => {
    const items = getVisibleNavItems("doctor");

    assert.deepEqual(
      items.map((item) => item.href),
      ["/dashboard", "/pelayanan/asesmen-awal", "/master"],
    );
  });

  test("superadmin sees dashboard, registration, and master links", () => {
    const items = getVisibleNavItems("superadmin");

    assert.deepEqual(
      items.map((item) => item.href),
      ["/dashboard", "/pendaftaran/pasien", "/pelayanan/asesmen-awal", "/master"],
    );
  });

  test("cashier sees only dashboard and master links", () => {
    const items = getVisibleNavItems("cashier");

    assert.deepEqual(
      items.map((item) => item.href),
      ["/dashboard", "/master"],
    );
  });

  test("no role only sees dashboard link", () => {
    const items = getVisibleNavItems();

    assert.deepEqual(items.map((item) => item.href), ["/dashboard"]);
  });

  test("receptionist does not see care link", () => {
    const items = getVisibleNavItems("receptionist");

    assert.equal(
      items.some((item) => item.href === "/pelayanan/asesmen-awal"),
      false,
    );
  });

  test("groups care navigation under operasional", () => {
    const groups = groupNavItems(getVisibleNavItems("nurse"));

    assert.deepEqual(
      groups.map((group) => ({
        group: group.group,
        items: group.items.map((item) => item.href),
      })),
      [
        { group: "main", items: ["/dashboard"] },
        { group: "operations", items: ["/pelayanan/asesmen-awal"] },
        { group: "management", items: ["/master"] },
      ],
    );
  });
});
