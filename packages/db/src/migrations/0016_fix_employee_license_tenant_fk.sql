CREATE UNIQUE INDEX "employee_clinic_id_unique_idx" ON "employee" USING btree ("clinic_id", "id");

ALTER TABLE "employee_license"
	DROP CONSTRAINT "employee_license_employee_id_employee_id_fk";

ALTER TABLE "employee_license"
	ADD CONSTRAINT "employee_license_clinic_employee_fk"
	FOREIGN KEY ("clinic_id", "employee_id")
	REFERENCES "public"."employee"("clinic_id", "id")
	ON DELETE cascade
	ON UPDATE no action;
