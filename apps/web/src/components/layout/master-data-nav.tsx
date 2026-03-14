"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_ICON_MAP, type NavIconName, type MasterNavSection } from "@/lib/app-navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MasterDataNavProps = {
  icon: NavIconName;
  label: string;
  sections: readonly MasterNavSection[];
  pathname?: string;
};

/** Sidebar accordion — used inside mobile Sheet */
export function MasterDataNav({
  icon,
  label,
  sections,
  pathname,
}: MasterDataNavProps) {
  const clientPathname = usePathname();
  const currentPathname = clientPathname ?? pathname;
  const isInMaster = currentPathname?.startsWith("/master");
  const [open, setOpen] = useState(isInMaster ?? false);
  const Icon = NAV_ICON_MAP[icon];

  useEffect(() => {
    setOpen(isInMaster ?? false);
  }, [isInMaster]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150",
          isInMaster
            ? "text-sidebar-accent-foreground"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {label}
        <ChevronRight
          className={cn(
            "ml-auto h-4 w-4 transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      </button>

      {open && (
        <div className="mt-1 ml-2 border-l border-sidebar-border pl-2">
          {sections.map((section) => (
            <div key={section.label} className="mb-2">
              <p className="mb-0.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.label}
              </p>
              {section.items.map((item) => {
                const ItemIcon = NAV_ICON_MAP[item.icon];
                const isActive = currentPathname === item.href || currentPathname?.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    className={cn(
                      "flex h-8 items-center gap-2.5 rounded-md px-3 text-[13px] font-medium transition-colors duration-150",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <ItemIcon className="h-3.5 w-3.5 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Desktop top-nav dropdown — renders Master Data items in a dropdown menu */
export function MasterDataDropdown({
  icon,
  label,
  sections,
  pathname,
}: MasterDataNavProps) {
  const clientPathname = usePathname();
  const currentPathname = clientPathname ?? pathname;
  const isInMaster = currentPathname?.startsWith("/master");
  const Icon = NAV_ICON_MAP[icon];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isInMaster
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span>{label}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-64 p-1"
      >
        {sections.map((section) => (
          <DropdownMenuGroup key={section.label}>
            <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {section.label}
            </DropdownMenuLabel>
            {section.items.map((item) => {
              const ItemIcon = NAV_ICON_MAP[item.icon];
              const isActive = currentPathname === item.href || currentPathname?.startsWith(`${item.href}/`);

              return (
                <DropdownMenuItem
                  key={item.href}
                  className={cn(
                    "cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm",
                    isActive && "bg-accent text-accent-foreground",
                  )}
                  render={<Link href={item.href as Route} />}
                >
                  <ItemIcon className="h-3.5 w-3.5 flex-shrink-0" />
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
