import "server-only";

import { auth } from "@klinik-AI/auth";
import { db } from "@klinik-AI/db";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";

import {
  canReadSessionStore,
  hasSessionTokenCookie,
  readSessionColumnNames,
  resolveSafeSession,
} from "./auth-session";

async function getSessionStoreColumns() {
  const result = await db.execute(sql<{ column_name: string }>`
    select column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'session'
    order by ordinal_position
  `);

  return readSessionColumnNames(
    result.rows.map((row) => ({
      column_name: row.column_name,
    })),
  );
}

export async function getSafeSession() {
  const requestHeaders = await headers();

  if (!hasSessionTokenCookie(requestHeaders.get("cookie"))) {
    return null;
  }

  const sessionStoreReady = await canReadSessionStore(getSessionStoreColumns);

  if (!sessionStoreReady) {
    return null;
  }

  return resolveSafeSession(async () =>
    auth.api.getSession({
      headers: requestHeaders,
    }),
  );
}
