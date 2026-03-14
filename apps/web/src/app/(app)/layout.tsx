import { headers } from "next/headers";

import AppShell from "@/components/layout/app-shell";
import { getVisibleNavItems } from "@/lib/app-navigation";
import { getPageAuthContext } from "@/lib/auth-helpers";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const context = await getPageAuthContext();
  const activeMembership = context.activeMembership;
  const navItems = getVisibleNavItems(activeMembership?.role);
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? undefined;

  return (
    <AppShell
      userName={context.session.user.name ?? "User"}
      clinicName={activeMembership?.clinicName}
      role={activeMembership?.role}
      items={navItems}
      pathname={pathname}
    >
      {children}
    </AppShell>
  );
}
