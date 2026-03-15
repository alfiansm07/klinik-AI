const REQUIRED_SESSION_COLUMNS = [
  "id",
  "expires_at",
  "token",
  "created_at",
  "updated_at",
  "ip_address",
  "user_agent",
  "user_id",
] as const;

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  "better-auth-session_token",
  "__Secure-better-auth-session_token",
] as const;

export function hasSessionTokenCookie(cookieHeader: string | null | undefined) {
  if (!cookieHeader) {
    return false;
  }

  return SESSION_COOKIE_NAMES.some((cookieName) =>
    cookieHeader.includes(`${cookieName}=`),
  );
}

export function readSessionColumnNames(rows: ReadonlyArray<{ column_name: unknown }>) {
  return rows
    .map((row) => row.column_name)
    .filter((column): column is string => typeof column === "string");
}

export function hasRequiredSessionColumns(columns: readonly string[]) {
  return REQUIRED_SESSION_COLUMNS.every((column) => columns.includes(column));
}

export async function canReadSessionStore(
  getColumns: () => Promise<readonly string[]>,
): Promise<boolean> {
  try {
    return hasRequiredSessionColumns(await getColumns());
  } catch {
    return false;
  }
}

export async function resolveSafeSession<T>(
  getSession: () => Promise<T | null | undefined>,
): Promise<T | null> {
  try {
    return (await getSession()) ?? null;
  } catch {
    return null;
  }
}
