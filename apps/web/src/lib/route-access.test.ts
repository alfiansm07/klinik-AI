import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { getRouteAccess } from "./route-access";

describe("route-access", () => {
  test("marks dashboard as protected", () => {
    assert.deepEqual(getRouteAccess("/dashboard"), {
      protected: true,
      authOnly: false,
    });
  });

  test("marks login as auth-only public route", () => {
    assert.deepEqual(getRouteAccess("/login"), {
      protected: false,
      authOnly: true,
    });
  });

  test("ignores public landing page", () => {
    assert.deepEqual(getRouteAccess("/"), {
      protected: false,
      authOnly: false,
    });
  });

  test("treats nested master routes as protected", () => {
    assert.deepEqual(getRouteAccess("/master/obat"), {
      protected: true,
      authOnly: false,
    });
  });

  test("treats nested registration routes as protected", () => {
    assert.deepEqual(getRouteAccess("/pendaftaran/pasien"), {
      protected: true,
      authOnly: false,
    });
  });

  test("treats pelayanan routes as protected", () => {
    assert.deepEqual(getRouteAccess("/pelayanan/asesmen-awal"), {
      protected: true,
      authOnly: false,
    });
  });

  test("does not match near-prefix public route names", () => {
    assert.deepEqual(getRouteAccess("/dashboarding"), {
      protected: false,
      authOnly: false,
    });
  });

  test("does not match removed route prefixes anymore", () => {
    assert.deepEqual(getRouteAccess("/patients/123"), {
      protected: false,
      authOnly: false,
    });
  });
});
