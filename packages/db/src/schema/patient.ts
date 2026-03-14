import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { clinic } from "./tenant";

export const patientGenderEnum = pgEnum("patient_gender", ["laki_laki", "perempuan"]);

export const patient = pgTable(
  "patient",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    medicalRecordNumber: text("medical_record_number").notNull(),
    nik: text("nik"),
    name: text("name").notNull(),
    gender: patientGenderEnum("gender").notNull(),
    dateOfBirth: date("date_of_birth", { mode: "string" }).notNull(),
    mobilePhone: text("mobile_phone"),
    address: text("address"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("patient_clinic_mrn_idx").on(table.clinicId, table.medicalRecordNumber),
    uniqueIndex("patient_clinic_nik_idx")
      .on(table.clinicId, table.nik)
      .where(sql`${table.nik} IS NOT NULL`),
    index("patient_clinic_id_idx").on(table.clinicId),
    index("patient_clinic_name_idx").on(table.clinicId, table.name),
    index("patient_clinic_active_idx").on(table.clinicId, table.isActive),
  ],
);
