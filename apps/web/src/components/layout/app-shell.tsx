import type { ReactNode } from "react";

import type { AppRole } from "@/lib/rbac";
import type { AppNavItem } from "@/lib/app-navigation";

import AppHeader from "./app-header";

type AppShellProps = {
  userName: string;
  clinicName?: string;
  role?: AppRole;
  items: AppNavItem[];
  pathname?: string;
  children: ReactNode;
};

export default function AppShell({
  userName,
  clinicName,
  role,
  items,
  pathname,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <AppHeader
        userName={userName}
        clinicName={clinicName}
        role={role}
        items={items}
        pathname={pathname}
      />
      <main className="min-w-0 flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
    </div>
  );
}
