import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { guarantor, room } from "./master";
import { patient } from "./patient";
import { clinic, clinicMember } from "./tenant";

export const visitKindEnum = pgEnum("visit_kind", ["baru", "lama"]);
export const serviceTypeEnum = pgEnum("service_type", ["sakit", "sehat"]);
export const registrationSourceEnum = pgEnum("registration_source", [
  "datang_langsung",
  "telepon",
  "rujukan_internal",
]);
export const visitStatusEnum = pgEnum("visit_status", [
  "registered",
  "menunggu_asesmen",
  "draft",
  "ready_for_doctor",
  "priority_handover",
  "observation",
  "in_examination",
  "completed",
  "cancelled",
]);
export const allergyStatusEnum = pgEnum("allergy_status", [
  "tidak_ada",
  "ada",
  "belum_dikaji",
]);

export const visit = pgTable(
  "visit",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    patientId: text("patient_id")
      .notNull()
      .references(() => patient.id, { onDelete: "restrict" }),
    registrationNumber: text("registration_number").notNull(),
    registeredAt: timestamp("registered_at").defaultNow().notNull(),
    visitDate: date("visit_date", { mode: "string" }).notNull(),
    visitKind: visitKindEnum("visit_kind").notNull(),
    serviceType: serviceTypeEnum("service_type").notNull(),
    registrationSource: registrationSourceEnum("registration_source").notNull(),
    guarantorId: text("guarantor_id")
      .notNull()
      .references(() => guarantor.id, { onDelete: "restrict" }),
    roomId: text("room_id")
      .notNull()
      .references(() => room.id, { onDelete: "restrict" }),
    doctorMemberId: text("doctor_member_id").references(() => clinicMember.id, {
      onDelete: "set null",
    }),
    chiefComplaint: text("chief_complaint"),
    allergyStatus: allergyStatusEnum("allergy_status").default("belum_dikaji").notNull(),
    allergyNote: text("allergy_note"),
    heightCm: numeric("height_cm", { precision: 5, scale: 2 }),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
    frontOfficeNote: text("front_office_note"),
    referralSource: text("referral_source"),
    referrerName: text("referrer_name"),
    status: visitStatusEnum("status").default("registered").notNull(),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    updatedByUserId: text("updated_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    uniqueIndex("visit_clinic_registration_number_idx").on(
      table.clinicId,
      table.registrationNumber,
    ),
    uniqueIndex("visit_clinic_visit_patient_idx").on(table.clinicId, table.id, table.patientId),
    check("visit_height_cm_check", sql`${table.heightCm} >= 0`),
    check("visit_weight_kg_check", sql`${table.weightKg} >= 0`),
    index("visit_clinic_date_idx").on(table.clinicId, table.visitDate),
    index("visit_clinic_patient_idx").on(table.clinicId, table.patientId),
    index("visit_clinic_room_idx").on(table.clinicId, table.roomId),
    index("visit_clinic_status_idx").on(table.clinicId, table.status),
  ],
);
