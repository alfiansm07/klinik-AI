"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AppNavItem } from "@/lib/app-navigation";
import { groupNavItems, MASTER_DATA_NAV, NAV_ICON_MAP } from "@/lib/app-navigation";
import { MasterDataNav } from "./master-data-nav";

type MobileSidebarNavProps = {
  items: AppNavItem[];
  pathname?: string;
};

function SidebarBranding() {
  return (
    <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
        K
      </div>
      <span className="font-heading text-sm font-semibold text-sidebar-foreground">Klinikai</span>
    </div>
  );
}

function SidebarNavContent({ items, pathname, closeOnNavigate = false }: MobileSidebarNavProps & { closeOnNavigate?: boolean }) {
  const clientPathname = usePathname();
  const currentPathname = clientPathname ?? pathname;
  const groups = groupNavItems(items);

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {groups.map((group) => (
        <div key={group.group} className="mb-4">
          <p className="mb-1 px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const Icon = NAV_ICON_MAP[item.icon];

              if (item.href === "/master") {
                return (
                  <MasterDataNav
                    key={item.href}
                    icon={item.icon}
                    label={item.label}
                    sections={MASTER_DATA_NAV}
                    pathname={currentPathname}
                  />
                );
              }

              const isActive = currentPathname === item.href || currentPathname?.startsWith(`${item.href}/`);
              const className = [
                "flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              ].join(" ");

              if (closeOnNavigate) {
                return (
                  <SheetClose
                    key={item.href}
                    render={<Link href={item.href as Route} className={className} />}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </SheetClose>
                );
              }

              return (
                <Link key={item.href} href={item.href as Route} className={className}>
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function MobileSidebarNav({ items, pathname }: MobileSidebarNavProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            className="md:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="h-4 w-4" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[88vw] max-w-sm border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigasi aplikasi</SheetTitle>
        </SheetHeader>
        <SidebarBranding />
        <SidebarNavContent items={items} pathname={pathname} closeOnNavigate />
      </SheetContent>
    </Sheet>
  );
}
