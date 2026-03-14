"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

import type { AppRole } from "@/lib/rbac";
import type { AppNavItem } from "@/lib/app-navigation";
import { MASTER_DATA_NAV, NAV_ICON_MAP } from "@/lib/app-navigation";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import UserMenu from "@/components/user-menu";
import { MobileSidebarNav } from "./app-sidebar";
import { MasterDataDropdown } from "./master-data-nav";

type AppHeaderProps = {
  userName: string;
  clinicName?: string;
  role?: AppRole;
  items: AppNavItem[];
  pathname?: string;
};

function Branding({ clinicName }: { clinicName?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
        K
      </div>
      <div className="min-w-0">
        <span className="font-heading text-sm font-semibold text-foreground">
          Klinikai
        </span>
        {clinicName && (
          <p className="hidden truncate text-xs text-muted-foreground lg:block">
            {clinicName}
          </p>
        )}
      </div>
    </div>
  );
}

function DesktopNav({ items, pathname }: { items: AppNavItem[]; pathname?: string }) {
  const clientPathname = usePathname();
  const currentPathname = clientPathname ?? pathname;

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
      {items.map((item) => {
        if (item.href === "/master") {
          return (
            <MasterDataDropdown
              key={item.href}
              icon={item.icon}
              label={item.label}
              sections={MASTER_DATA_NAV}
              pathname={currentPathname}
            />
          );
        }

        const Icon = NAV_ICON_MAP[item.icon];
        const isActive = currentPathname === item.href || currentPathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href as Route}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppHeader({
  userName,
  clinicName,
  role,
  items,
  pathname,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
      {/* Left: Mobile hamburger + Branding */}
      <div className="flex items-center gap-3">
        <MobileSidebarNav items={items} pathname={pathname} />
        <Branding clinicName={clinicName} />
      </div>

      {/* Center: Desktop navigation */}
      <div className="hidden flex-1 justify-center md:flex">
        <DesktopNav items={items} pathname={pathname} />
      </div>

      {/* Right: Role badge + utilities */}
      <div className="ml-auto flex items-center gap-2">
        {role && (
          <span className="hidden text-xs capitalize text-muted-foreground lg:inline-block">
            {role}
          </span>
        )}
        <ModeToggle />
        <UserMenu fallbackName={userName} />
      </div>
    </header>
  );
}
