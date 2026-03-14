import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ============================================================
// Enums
// ============================================================

export const memberRoleEnum = pgEnum("member_role", [
  "superadmin",
  "admin",
  "receptionist",
  "nurse",
  "doctor",
  "pharmacist",
  "cashier",
]);

// ============================================================
// Types
// ============================================================

/**
 * Clinic settings stored as JSONB.
 * Expandable — add fields as needed without migration.
 */
export type ClinicSettings = {
  headerText?: string; // Kop surat
  footerText?: string; // Catatan bawah struk
  receiptNote?: string; // Catatan tambahan kwitansi
  tagline?: string; // Tagline klinik
  printNote?: string; // Catatan cetak
  rounding?: {
    name?: string;
    value?: number;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
};

// ============================================================
// Tables
// ============================================================

/**
 * clinic — Tenant utama.
 * Setiap klinik adalah satu tenant dalam sistem multi-tenant.
 */
export const clinic = pgTable("clinic", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text("code"), // Kode unik klinik
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  ownerName: text("owner_name"), // Nama pemilik klinik
  responsibleDoctor: text("responsible_doctor"), // Penanggung jawab medis
  sipNumber: text("sip_number"), // SIP penanggung jawab
  licenseNumber: text("license_number"), // Nomor izin operasional
  npwpNumber: text("npwp_number"), // NPWP klinik
  npwpFileUrl: text("npwp_file_url"), // Upload scan NPWP
  sktFileUrl: text("skt_file_url"), // Upload scan SKT
  logoUrl: text("logo_url"),
  settings: jsonb("settings").$type<ClinicSettings>().default({}),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * clinic_member — Mapping user ↔ clinic ↔ role.
 *
 * Satu user bisa jadi member di beberapa clinic (multi-tenant),
 * tapi hanya boleh punya SATU role per clinic.
 *
 * Ini menggantikan "User Role Menu" + "User Account" dari referensi app:
 * - Role didefinisikan sebagai fixed enum (bukan tabel custom)
 * - Permission per role diatur di code (authorization matrix), bukan di DB
 */
export const clinicMember = pgTable(
  "clinic_member",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // Satu user hanya boleh punya satu role per clinic
    uniqueIndex("clinic_member_clinic_user_idx").on(
      table.clinicId,
      table.userId,
    ),
    index("clinic_member_clinic_id_idx").on(table.clinicId),
    index("clinic_member_user_id_idx").on(table.userId),
  ],
);

// Relations defined in ./relations.ts to avoid circular imports
