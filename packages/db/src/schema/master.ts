import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { clinic } from "./tenant";

export const guarantorTypeEnum = pgEnum("guarantor_type", [
  "pribadi",
  "bpjs",
  "asuransi",
  "pemerintah",
  "perusahaan_lainnya",
]);

export const medicalActionTypeEnum = pgEnum("medical_action_type", [
  "regular",
  "tindakan",
  "radiologi",
  "laboratorium",
]);

export const actionCategoryEnum = pgEnum("action_category", [
  "prosedur_terapeutik",
  "prosedur_diagnostik",
  "prosedur_pembedahan",
  "konseling",
  "edukasi",
  "pelayanan_psikiatri",
  "pelayanan_sosial",
  "terapi_chiropractic",
]);

export const tariffComponentFeeKeyEnum = pgEnum("tariff_component_fee_key", [
  "clinic_fee",
  "other_fee",
  "doctor_fee",
  "midwife_fee",
  "nurse_fee",
]);

export const pricingMethodEnum = pgEnum("pricing_method", ["hpp", "markup"]);

export const inventoryMethodEnum = pgEnum("inventory_method", [
  "fifo",
  "lifo",
  "average",
]);

export const roomVisitTypeEnum = pgEnum("room_visit_type", [
  "rawat_jalan",
]);

export const roomInstallationEnum = pgEnum("room_installation", [
  "instalasi_rawat_jalan",
  "instalasi_farmasi",
  "instalasi_laboratorium",
  "instalasi_radiologi",
]);

export const guarantor = pgTable(
  "guarantor",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    type: guarantorTypeEnum("type").notNull(),
    bpjsBridging: boolean("bpjs_bridging").default(false).notNull(),
    showInsuranceNumber: boolean("show_insurance_number").default(false).notNull(),
    insuranceNumberRequired: boolean("insurance_number_required").default(false).notNull(),
    mandiriInhealthBridging: boolean("mandiri_inhealth_bridging").default(false).notNull(),
    marginSettingEnabled: boolean("margin_setting_enabled").default(false).notNull(),
    picName: text("pic_name"),
    phone: text("phone"),
    address: text("address"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("guarantor_clinic_code_idx").on(table.clinicId, table.code),
    index("guarantor_clinic_id_idx").on(table.clinicId),
    index("guarantor_clinic_type_idx").on(table.clinicId, table.type),
  ],
);

export const tariffComponent = pgTable(
  "tariff_component",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    feeKey: tariffComponentFeeKeyEnum("fee_key"),
    sortOrder: smallint("sort_order").default(1).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("tariff_component_clinic_code_idx").on(table.clinicId, table.code),
    uniqueIndex("tariff_component_clinic_fee_key_idx").on(table.clinicId, table.feeKey),
    index("tariff_component_clinic_id_idx").on(table.clinicId),
    index("tariff_component_clinic_sort_order_idx").on(table.clinicId, table.sortOrder),
    check("tariff_component_sort_order_check", sql`${table.sortOrder} > 0`),
  ],
);

export const medicalAction = pgTable(
  "medical_action",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    actionCategory: actionCategoryEnum("action_category"),
    actionType: medicalActionTypeEnum("action_type").default("regular").notNull(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    icd9Code: text("icd9_code"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("medical_action_clinic_code_idx").on(table.clinicId, table.code),
    index("medical_action_clinic_id_idx").on(table.clinicId),
    index("medical_action_clinic_type_idx").on(table.clinicId, table.actionType),
    index("medical_action_category_idx").on(table.clinicId, table.actionCategory),
    index("medical_action_name_trgm_idx").using("gin", sql`(lower(${table.name})) gin_trgm_ops`),
  ],
);

export const actionTariff = pgTable(
  "action_tariff",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    medicalActionId: text("medical_action_id")
      .notNull()
      .references(() => medicalAction.id, { onDelete: "cascade" }),
    guarantorId: text("guarantor_id")
      .notNull()
      .references(() => guarantor.id, { onDelete: "cascade" }),
    doctorFee: integer("doctor_fee").default(0).notNull(),
    clinicFee: integer("clinic_fee").default(0).notNull(),
    otherFee: integer("other_fee").default(0).notNull(),
    midwifeFee: integer("midwife_fee").default(0).notNull(),
    nurseFee: integer("nurse_fee").default(0).notNull(),
    referralFee: integer("referral_fee").default(0).notNull(),
    totalFee: integer("total_fee").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("action_tariff_unique_idx").on(
      table.clinicId,
      table.medicalActionId,
      table.guarantorId,
    ),
    index("action_tariff_clinic_id_idx").on(table.clinicId),
    index("action_tariff_medical_action_id_idx").on(table.medicalActionId),
    index("action_tariff_guarantor_id_idx").on(table.guarantorId),
    check("action_tariff_doctor_fee_check", sql`${table.doctorFee} >= 0`),
    check("action_tariff_clinic_fee_check", sql`${table.clinicFee} >= 0`),
    check("action_tariff_other_fee_check", sql`${table.otherFee} >= 0`),
    check("action_tariff_midwife_fee_check", sql`${table.midwifeFee} >= 0`),
    check("action_tariff_nurse_fee_check", sql`${table.nurseFee} >= 0`),
    check("action_tariff_referral_fee_check", sql`${table.referralFee} >= 0`),
    check("action_tariff_total_fee_check", sql`${table.totalFee} >= 0`),
  ],
);

export const medicineUnit = pgTable(
  "medicine_unit",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("medicine_unit_clinic_code_idx").on(table.clinicId, table.code),
    index("medicine_unit_clinic_id_idx").on(table.clinicId),
  ],
);

export const medicineCategory = pgTable(
  "medicine_category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("medicine_category_clinic_code_idx").on(table.clinicId, table.code),
    index("medicine_category_clinic_id_idx").on(table.clinicId),
  ],
);

export const medicinePharmacology = pgTable(
  "medicine_pharmacology",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("medicine_pharmacology_clinic_code_idx").on(table.clinicId, table.code),
    index("medicine_pharmacology_clinic_id_idx").on(table.clinicId),
  ],
);

export const manufacturer = pgTable(
  "manufacturer",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("manufacturer_clinic_code_idx").on(table.clinicId, table.code),
    index("manufacturer_clinic_id_idx").on(table.clinicId),
  ],
);

export const supplier = pgTable(
  "supplier",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("supplier_clinic_code_idx").on(table.clinicId, table.code),
    index("supplier_clinic_id_idx").on(table.clinicId),
  ],
);

export const medicine = pgTable(
  "medicine",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    isCompound: boolean("is_compound").default(false).notNull(),
    medicineCategoryId: text("medicine_category_id").references(() => medicineCategory.id, {
      onDelete: "set null",
    }),
    manufacturerId: text("manufacturer_id").references(() => manufacturer.id, {
      onDelete: "set null",
    }),
    storageLocation: text("storage_location"),
    defaultTaxPct: smallint("default_tax_pct").default(0).notNull(),
    pricingMethod: pricingMethodEnum("pricing_method").default("hpp").notNull(),
    inventoryMethod: inventoryMethodEnum("inventory_method").default("average").notNull(),
    lastPurchasePrice: integer("last_purchase_price").default(0).notNull(),
    highestPurchasePrice: integer("highest_purchase_price").default(0).notNull(),
    avgPurchasePrice: integer("avg_purchase_price").default(0).notNull(),
    maxRetailPrice: integer("max_retail_price").default(0).notNull(),
    smallUnitId: text("small_unit_id").references(() => medicineUnit.id, {
      onDelete: "set null",
    }),
    packageUnitId: text("package_unit_id").references(() => medicineUnit.id, {
      onDelete: "set null",
    }),
    packageConversion: integer("package_conversion"),
    packageUnit2Id: text("package_unit2_id").references(() => medicineUnit.id, {
      onDelete: "set null",
    }),
    packageConversion2: integer("package_conversion2"),
    compoundUnitId: text("compound_unit_id").references(() => medicineUnit.id, {
      onDelete: "set null",
    }),
    compoundQuantity: integer("compound_quantity"),
    dosageInfo: text("dosage_info"),
    drugInteractions: text("drug_interactions"),
    composition: text("composition"),
    mechanismOfAction: text("mechanism_of_action"),
    indications: text("indications"),
    contraindications: text("contraindications"),
    warnings: text("warnings"),
    pharmacologyId: text("pharmacology_id").references(() => medicinePharmacology.id, {
      onDelete: "set null",
    }),
    supplierId: text("supplier_id").references(() => supplier.id, {
      onDelete: "set null",
    }),
    kfaCode: text("kfa_code"),
    bpjsCode: text("bpjs_code"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("medicine_clinic_code_idx").on(table.clinicId, table.code),
    index("medicine_clinic_id_idx").on(table.clinicId),
    index("medicine_category_id_idx").on(table.medicineCategoryId),
    index("medicine_manufacturer_id_idx").on(table.manufacturerId),
    index("medicine_pharmacology_id_idx").on(table.pharmacologyId),
    index("medicine_supplier_id_idx").on(table.supplierId),
    index("medicine_name_trgm_idx").using("gin", sql`(lower(${table.name})) gin_trgm_ops`),
    check("medicine_default_tax_pct_check", sql`${table.defaultTaxPct} between 0 and 100`),
    check("medicine_last_purchase_price_check", sql`${table.lastPurchasePrice} >= 0`),
    check("medicine_highest_purchase_price_check", sql`${table.highestPurchasePrice} >= 0`),
    check("medicine_avg_purchase_price_check", sql`${table.avgPurchasePrice} >= 0`),
    check("medicine_max_retail_price_check", sql`${table.maxRetailPrice} >= 0`),
    check(
      "medicine_package_conversion_check",
      sql`${table.packageConversion} is null or ${table.packageConversion} > 0`,
    ),
    check(
      "medicine_package_conversion2_check",
      sql`${table.packageConversion2} is null or ${table.packageConversion2} > 0`,
    ),
    check(
      "medicine_compound_quantity_check",
      sql`${table.compoundQuantity} is null or ${table.compoundQuantity} > 0`,
    ),
  ],
);

export const medicalActionMedicine = pgTable(
  "medical_action_medicine",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    medicalActionId: text("medical_action_id")
      .notNull()
      .references(() => medicalAction.id, { onDelete: "cascade" }),
    medicineId: text("medicine_id")
      .notNull()
      .references(() => medicine.id, { onDelete: "cascade" }),
    medicineUnitId: text("medicine_unit_id").references(() => medicineUnit.id, {
      onDelete: "set null",
    }),
    quantity: integer("quantity").default(1).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("medical_action_medicine_unique_idx").on(table.medicalActionId, table.medicineId),
    index("medical_action_medicine_clinic_id_idx").on(table.clinicId),
    index("medical_action_medicine_action_id_idx").on(table.medicalActionId),
    index("medical_action_medicine_medicine_id_idx").on(table.medicineId),
    check("medical_action_medicine_qty_check", sql`${table.quantity} > 0`),
  ],
);

export const laboratoryType = pgTable(
  "laboratory_type",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    isClinicalAndWater: boolean("is_clinical_and_water").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("laboratory_type_clinic_code_idx").on(table.clinicId, table.code),
    index("laboratory_type_clinic_id_idx").on(table.clinicId),
  ],
);

export const room = pgTable(
  "room",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    clinicId: text("clinic_id")
      .notNull()
      .references(() => clinic.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    visitType: roomVisitTypeEnum("visit_type").default("rawat_jalan").notNull(),
    installation: roomInstallationEnum("installation"),
    pcarePoli: text("pcare_poli"),
    voiceCode: text("voice_code"),
    isCallRoom: boolean("is_call_room").default(false).notNull(),
    isCallApotek: boolean("is_call_apotek").default(false).notNull(),
    isCallLab: boolean("is_call_lab").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("room_clinic_code_idx").on(table.clinicId, table.code),
    index("room_clinic_id_idx").on(table.clinicId),
    index("room_clinic_visit_type_idx").on(table.clinicId, table.visitType),
    index("room_clinic_installation_idx").on(table.clinicId, table.installation),
  ],
);

// Relations defined in ./relations.ts to avoid circular imports
