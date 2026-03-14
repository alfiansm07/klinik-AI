import {
  Building2,
  Calculator,
  WalletCards,
  Database,
  DoorOpen,
  FlaskConical,
  LayoutDashboard,
  ListOrdered,
  Pill,
  Shield,
  Stethoscope,
  Users,
} from "lucide-react";

import { canAccessModule, type AppModule, type AppRole } from "./rbac";

export const NAV_ICON_MAP = {
  "building-2": Building2,
  calculator: Calculator,
  database: Database,
  "door-open": DoorOpen,
  "flask-conical": FlaskConical,
  "layout-dashboard": LayoutDashboard,
  "list-ordered": ListOrdered,
  pill: Pill,
  shield: Shield,
  stethoscope: Stethoscope,
  users: Users,
  "wallet-cards": WalletCards,
} as const;

export type NavIconName = keyof typeof NAV_ICON_MAP;

export type NavGroup = "main" | "operations" | "management";

export type AppNavItem = {
  href: string;
  label: string;
  module: AppModule;
  icon: NavIconName;
  group: NavGroup;
};

export type MasterNavItem = {
  href: string;
  label: string;
  icon: NavIconName;
};

export type MasterNavSection = {
  label: string;
  items: MasterNavItem[];
};

export const MASTER_DATA_NAV: readonly MasterNavSection[] = [
  {
    label: "Master Klinik",
    items: [
      { href: "/master/klinik", label: "Profil Klinik", icon: "building-2" },
      { href: "/master/pembulatan", label: "Pembulatan", icon: "calculator" },
      { href: "/master/tindakan", label: "Tindakan", icon: "stethoscope" },
      { href: "/master/diagnosa", label: "Diagnosa", icon: "list-ordered" },
      {
        href: "/master/laborat",
        label: "Jenis Laboratorium",
        icon: "flask-conical",
      },
      { href: "/master/ruangan", label: "Ruangan", icon: "door-open" },
      { href: "/master/guarantors", label: "Penjamin", icon: "shield" },
      {
        href: "/master/tariff-components",
        label: "Komponen Tarif",
        icon: "list-ordered",
      },
      { href: "/master/obat", label: "Obat & Alkes", icon: "pill" },
      {
        href: "/master/payment-methods",
        label: "Metode Pembayaran",
        icon: "wallet-cards",
      },
    ],
  },
];

const NAV_ITEMS: readonly AppNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    module: "dashboard",
    icon: "layout-dashboard",
    group: "main",
  },
  {
    href: "/pendaftaran/pasien",
    label: "Pasien",
    module: "registration",
    icon: "users",
    group: "operations",
  },
  {
    href: "/pelayanan/asesmen-awal",
    label: "Asesmen Awal",
    module: "care",
    icon: "stethoscope",
    group: "operations",
  },
  {
    href: "/master",
    label: "Master Data",
    module: "master",
    icon: "database",
    group: "management",
  },
];

export const NAV_GROUP_LABELS: Record<NavGroup, string> = {
  main: "Menu Utama",
  operations: "Operasional",
  management: "Manajemen",
};

export function getVisibleNavItems(role?: AppRole): AppNavItem[] {
  if (!role) {
    return NAV_ITEMS.filter((item) => item.href === "/dashboard") as AppNavItem[];
  }

  return NAV_ITEMS.filter((item) => canAccessModule(role, item.module)) as AppNavItem[];
}

export const getNavigationItems = getVisibleNavItems;

export function groupNavItems(items: AppNavItem[]): { group: NavGroup; label: string; items: AppNavItem[] }[] {
  const groups: NavGroup[] = ["main", "operations", "management"];

  return groups
    .map((group) => ({
      group,
      label: NAV_GROUP_LABELS[group],
      items: items.filter((item) => item.group === group),
    }))
    .filter((group) => group.items.length > 0);
}
