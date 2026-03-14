import { MODULE_ROUTE_PREFIXES } from "./rbac";

const PROTECTED_PREFIXES = Object.values(MODULE_ROUTE_PREFIXES).flat();

const AUTH_ONLY_PATHS = ["/login"] as const;

export function getRouteAccess(pathname: string) {
  const authOnly = AUTH_ONLY_PATHS.includes(pathname as (typeof AUTH_ONLY_PATHS)[number]);
  const protectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return {
    protected: protectedRoute,
    authOnly,
  };
}
