import { relations } from "drizzle-orm";

import { account, session, user } from "./auth";
import {
  visitAssessment,
  visitAssessmentExam,
  visitAssessmentRisk,
  visitBodyFinding,
  visitVitalSign,
} from "./assessment";
import {
  actionTariff,
  employee,
  employeeLicense,
  guarantor,
  laboratoryType,
  manufacturer,
  medicalAction,
  medicalActionMedicine,
  medicine,
  medicineCategory,
  medicinePharmacology,
  medicineUnit,
  supplier,
  tariffComponent,
  room,
} from "./master";
import { patient } from "./patient";
import { visit } from "./visit";
import { clinic, clinicMember } from "./tenant";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  clinicMembers: many(clinicMember),
  assessmentsStarted: many(visitAssessment, {
    relationName: "visit_assessment_assessed_by",
  }),
  assessmentsCompleted: many(visitAssessment, {
    relationName: "visit_assessment_completed_by",
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const clinicRelations = relations(clinic, ({ many }) => ({
  members: many(clinicMember),
  guarantors: many(guarantor),
  tariffComponents: many(tariffComponent),
  medicalActions: many(medicalAction),
  actionTariffs: many(actionTariff),
  medicalActionMedicines: many(medicalActionMedicine),
  medicineUnits: many(medicineUnit),
  medicineCategories: many(medicineCategory),
  medicinePharmacologies: many(medicinePharmacology),
  manufacturers: many(manufacturer),
  suppliers: many(supplier),
  medicines: many(medicine),
  laboratoryTypes: many(laboratoryType),
  rooms: many(room),
  patients: many(patient),
  visits: many(visit),
  visitAssessments: many(visitAssessment),
  visitAssessmentRisks: many(visitAssessmentRisk),
  visitVitalSigns: many(visitVitalSign),
  visitAssessmentExams: many(visitAssessmentExam),
  visitBodyFindings: many(visitBodyFinding),
  employees: many(employee),
  employeeLicenses: many(employeeLicense),
}));

export const patientRelations = relations(patient, ({ one, many }) => ({
  clinic: one(clinic, {
    fields: [patient.clinicId],
    references: [clinic.id],
  }),
  visits: many(visit),
  assessments: many(visitAssessment),
}));

export const clinicMemberRelations = relations(clinicMember, ({ one, many }) => ({
  clinic: one(clinic, {
    fields: [clinicMember.clinicId],
    references: [clinic.id],
  }),
  user: one(user, {
    fields: [clinicMember.userId],
    references: [user.id],
  }),
  assignedVisits: many(visit),
}));

export const visitRelations = relations(visit, ({ one, many }) => ({
  clinic: one(clinic, {
    fields: [visit.clinicId],
    references: [clinic.id],
  }),
  patient: one(patient, {
    fields: [visit.patientId],
    references: [patient.id],
  }),
  guarantor: one(guarantor, {
    fields: [visit.guarantorId],
    references: [guarantor.id],
  }),
  room: one(room, {
    fields: [visit.roomId],
    references: [room.id],
  }),
  doctorMember: one(clinicMember, {
    fields: [visit.doctorMemberId],
    references: [clinicMember.id],
  }),
  assessments: many(visitAssessment),
}));

export const visitAssessmentRelations = relations(visitAssessment, ({ one, many }) => ({
  clinic: one(clinic, {
    fields: [visitAssessment.clinicId],
    references: [clinic.id],
  }),
  visit: one(visit, {
    fields: [visitAssessment.visitId],
    references: [visit.id],
  }),
  patient: one(patient, {
    fields: [visitAssessment.patientId],
    references: [patient.id],
  }),
  assessedBy: one(user, {
    fields: [visitAssessment.assessedByUserId],
    references: [user.id],
    relationName: "visit_assessment_assessed_by",
  }),
  completedBy: one(user, {
    fields: [visitAssessment.completedByUserId],
    references: [user.id],
    relationName: "visit_assessment_completed_by",
  }),
  risk: one(visitAssessmentRisk),
  vitalSign: one(visitVitalSign),
  exam: one(visitAssessmentExam),
  bodyFindings: many(visitBodyFinding),
}));

export const visitAssessmentRiskRelations = relations(visitAssessmentRisk, ({ one }) => ({
  clinic: one(clinic, {
    fields: [visitAssessmentRisk.clinicId],
    references: [clinic.id],
  }),
  assessment: one(visitAssessment, {
    fields: [visitAssessmentRisk.assessmentId],
    references: [visitAssessment.id],
  }),
}));

export const visitVitalSignRelations = relations(visitVitalSign, ({ one }) => ({
  clinic: one(clinic, {
    fields: [visitVitalSign.clinicId],
    references: [clinic.id],
  }),
  assessment: one(visitAssessment, {
    fields: [visitVitalSign.assessmentId],
    references: [visitAssessment.id],
  }),
}));

export const visitAssessmentExamRelations = relations(visitAssessmentExam, ({ one }) => ({
  clinic: one(clinic, {
    fields: [visitAssessmentExam.clinicId],
    references: [clinic.id],
  }),
  assessment: one(visitAssessment, {
    fields: [visitAssessmentExam.assessmentId],
    references: [visitAssessment.id],
  }),
}));

export const visitBodyFindingRelations = relations(visitBodyFinding, ({ one }) => ({
  clinic: one(clinic, {
    fields: [visitBodyFinding.clinicId],
    references: [clinic.id],
  }),
  assessment: one(visitAssessment, {
    fields: [visitBodyFinding.assessmentId],
    references: [visitAssessment.id],
  }),
}));

export const guarantorRelations = relations(guarantor, ({ one, many }) => ({
  clinic: one(clinic, {
    fields: [guarantor.clinicId],
    references: [clinic.id],
  }),
  actionTariffs: many(actionTariff),
}));

export const tariffComponentRelations = relations(tariffComponent, ({ one }) => ({
  clinic: one(clinic, {
    fields: [tariffComponent.clinicId],
    references: [clinic.id],
  }),
}));

export const medicalActionRelations = relations(medicalAction, ({ one, many }) => ({
  clinic: one(clinic, {
    fields: [medicalAction.clinicId],
    references: [clinic.id],
  }),
  actionTariffs: many(actionTariff),
  actionMedicines: many(medicalActionMedicine),
}));

export const actionTariffRelations = relations(actionTariff, ({ one }) => ({
  clinic: one(clinic, {
    fields: [actionTariff.clinicId],
    references: [clinic.id],
  }),
  medicalAction: one(medicalAction, {
    fields: [actionTariff.medicalActionId],
    references: [medicalAction.id],
  }),
  guarantor: one(guarantor, {
    fields: [actionTariff.guarantorId],
    references: [guarantor.id],
  }),
}));

export const medicineUnitRelations = relations(medicineUnit, ({ one, many }) => ({
  clinic: one(clinic, {
    fields: [medicineUnit.clinicId],
    references: [clinic.id],
  }),
  medicinesAsSmallUnit: many(medicine, { relationName: "medicine_small_unit" }),
  medicinesAsPackageUnit: many(medicine, { relationName: "medicine_package_unit" }),
  medicinesAsPackageUnit2: many(medicine, { relationName: "medicine_package_unit_2" }),
  medicinesAsCompoundUnit: many(medicine, { relationName: "medicine_compound_unit" }),
  medicalActionMedicines: many(medicalActionMedicine),
}));

export const medicineCategoryRelations = relations(medicineCategory, ({ one, many }) => ({
  clinic: one(clinic, {
    fields: [medicineCategory.clinicId],
    references: [clinic.id],
  }),
  medicines: many(medicine),
}));

export const medicinePharmacologyRelations = relations(medicinePharmacology, ({ one, many }) => ({
  clinic: one(clinic, {
    fields: [medicinePharmacology.clinicId],
    references: [clinic.id],
  }),
  medicines: many(medicine),
}));

export const manufacturerRelations = relations(manufacturer, ({ one, many }) => ({
  clinic: one(clinic, {
    fields: [manufacturer.clinicId],
    references: [clinic.id],
  }),
  medicines: many(medicine),
}));

export const supplierRelations = relations(supplier, ({ one, many }) => ({
  clinic: one(clinic, {
    fields: [supplier.clinicId],
    references: [clinic.id],
  }),
  medicines: many(medicine),
}));

export const medicineRelations = relations(medicine, ({ one, many }) => ({
  clinic: one(clinic, {
    fields: [medicine.clinicId],
    references: [clinic.id],
  }),
  medicineCategory: one(medicineCategory, {
    fields: [medicine.medicineCategoryId],
    references: [medicineCategory.id],
  }),
  manufacturer: one(manufacturer, {
    fields: [medicine.manufacturerId],
    references: [manufacturer.id],
  }),
  pharmacology: one(medicinePharmacology, {
    fields: [medicine.pharmacologyId],
    references: [medicinePharmacology.id],
  }),
  supplier: one(supplier, {
    fields: [medicine.supplierId],
    references: [supplier.id],
  }),
  smallUnit: one(medicineUnit, {
    fields: [medicine.smallUnitId],
    references: [medicineUnit.id],
    relationName: "medicine_small_unit",
  }),
  packageUnit: one(medicineUnit, {
    fields: [medicine.packageUnitId],
    references: [medicineUnit.id],
    relationName: "medicine_package_unit",
  }),
  packageUnit2: one(medicineUnit, {
    fields: [medicine.packageUnit2Id],
    references: [medicineUnit.id],
    relationName: "medicine_package_unit_2",
  }),
  compoundUnit: one(medicineUnit, {
    fields: [medicine.compoundUnitId],
    references: [medicineUnit.id],
    relationName: "medicine_compound_unit",
  }),
  medicalActionMedicines: many(medicalActionMedicine),
}));

export const medicalActionMedicineRelations = relations(medicalActionMedicine, ({ one }) => ({
  clinic: one(clinic, {
    fields: [medicalActionMedicine.clinicId],
    references: [clinic.id],
  }),
  medicalAction: one(medicalAction, {
    fields: [medicalActionMedicine.medicalActionId],
    references: [medicalAction.id],
  }),
  medicine: one(medicine, {
    fields: [medicalActionMedicine.medicineId],
    references: [medicine.id],
  }),
  medicineUnit: one(medicineUnit, {
    fields: [medicalActionMedicine.medicineUnitId],
    references: [medicineUnit.id],
  }),
}));

export const laboratoryTypeRelations = relations(laboratoryType, ({ one }) => ({
  clinic: one(clinic, {
    fields: [laboratoryType.clinicId],
    references: [clinic.id],
  }),
}));

export const roomRelations = relations(room, ({ one }) => ({
  clinic: one(clinic, {
    fields: [room.clinicId],
    references: [clinic.id],
  }),
}));

export const employeeRelations = relations(employee, ({ one, many }) => ({
  clinic: one(clinic, {
    fields: [employee.clinicId],
    references: [clinic.id],
  }),
  licenses: many(employeeLicense),
}));

export const employeeLicenseRelations = relations(employeeLicense, ({ one }) => ({
  clinic: one(clinic, {
    fields: [employeeLicense.clinicId],
    references: [clinic.id],
  }),
  employee: one(employee, {
    fields: [employeeLicense.clinicId, employeeLicense.employeeId],
    references: [employee.clinicId, employee.id],
  }),
}));
