import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  canReadSessionStore,
  hasRequiredSessionColumns,
  hasSessionTokenCookie,
  readSessionColumnNames,
  resolveSafeSession,
} from "./auth-session";

describe("auth-session", () => {
  test("detects Better Auth session cookies", () => {
    assert.equal(hasSessionTokenCookie("better-auth.session_token=abc"), true);
    assert.equal(hasSessionTokenCookie("__Secure-better-auth.session_token=abc"), true);
    assert.equal(hasSessionTokenCookie("better-auth-session_token=abc"), true);
    assert.equal(hasSessionTokenCookie("__Secure-better-auth-session_token=abc"), true);
  });

  test("ignores unrelated cookies", () => {
    assert.equal(hasSessionTokenCookie("theme=light; locale=id"), false);
    assert.equal(hasSessionTokenCookie(null), false);
  });

  test("accepts the expected Better Auth session columns", () => {
    const result = hasRequiredSessionColumns([
      "id",
      "expires_at",
      "token",
      "created_at",
      "updated_at",
      "ip_address",
      "user_agent",
      "user_id",
    ]);

    assert.equal(result, true);
  });

  test("rejects incomplete Better Auth session columns", () => {
    const result = hasRequiredSessionColumns([
      "id",
      "expires_at",
      "token",
      "created_at",
      "user_id",
    ]);

    assert.equal(result, false);
  });

  test("reads column names from information schema rows", () => {
    const result = readSessionColumnNames([
      { column_name: "id" },
      { column_name: "token" },
      { column_name: 123 },
    ]);

    assert.deepEqual(result, ["id", "token"]);
  });

  test("treats the session store as usable when required columns exist", async () => {
    const result = await canReadSessionStore(async () => [
      "id",
      "expires_at",
      "token",
      "created_at",
      "updated_at",
      "ip_address",
      "user_agent",
      "user_id",
    ]);

    assert.equal(result, true);
  });

  test("treats the session store as unusable when column lookup throws", async () => {
    const result = await canReadSessionStore(async () => {
      throw new Error("db unavailable");
    });

    assert.equal(result, false);
  });

  test("returns the session when lookup succeeds", async () => {
    const session = { user: { id: "user_1" } };

    const result = await resolveSafeSession(async () => session);

    assert.deepEqual(result, session);
  });

  test("returns null when lookup returns null", async () => {
    const result = await resolveSafeSession(async () => null);

    assert.equal(result, null);
  });

  test("returns null when lookup throws", async () => {
    const result = await resolveSafeSession(async () => {
      throw new Error("query failed");
    });

    assert.equal(result, null);
  });
});
