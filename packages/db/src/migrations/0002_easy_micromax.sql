ALTER TABLE "billing" ADD CONSTRAINT "billing_total_amount_check" CHECK ("billing"."total_amount" >= 0);--> statement-breakpoint
ALTER TABLE "billing" ADD CONSTRAINT "billing_total_discount_check" CHECK ("billing"."total_discount" >= 0);--> statement-breakpoint
ALTER TABLE "billing" ADD CONSTRAINT "billing_total_paid_check" CHECK ("billing"."total_paid" >= 0);--> statement-breakpoint
ALTER TABLE "billing" ADD CONSTRAINT "billing_remaining_balance_check" CHECK ("billing"."remaining_balance" >= 0);--> statement-breakpoint
ALTER TABLE "billing_item" ADD CONSTRAINT "billing_item_unit_price_check" CHECK ("billing_item"."unit_price" >= 0);--> statement-breakpoint
ALTER TABLE "billing_item" ADD CONSTRAINT "billing_item_qty_check" CHECK ("billing_item"."qty" > 0);--> statement-breakpoint
ALTER TABLE "billing_item" ADD CONSTRAINT "billing_item_discount_check" CHECK ("billing_item"."discount" >= 0);--> statement-breakpoint
ALTER TABLE "billing_item" ADD CONSTRAINT "billing_item_subtotal_check" CHECK ("billing_item"."subtotal" >= 0);--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_cash_amount_check" CHECK ("payment"."cash_amount" >= 0);--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_card_amount_check" CHECK ("payment"."card_amount" >= 0);--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_claim_amount_check" CHECK ("payment"."claim_amount" >= 0);--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_total_bill_amount_check" CHECK ("payment"."total_bill_amount" >= 0);--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_total_paid_amount_check" CHECK ("payment"."total_paid_amount" >= 0);--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_total_discount_check" CHECK ("payment"."total_discount" >= 0);--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_cash_received_check" CHECK ("payment"."cash_received" >= 0);--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_cash_back_check" CHECK ("payment"."cash_back" >= 0);--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_remaining_balance_check" CHECK ("payment"."remaining_balance" >= 0);--> statement-breakpoint
ALTER TABLE "emr_action" ADD CONSTRAINT "emr_action_qty_check" CHECK ("emr_action"."qty" > 0);--> statement-breakpoint
ALTER TABLE "emr_action" ADD CONSTRAINT "emr_action_unit_tariff_check" CHECK ("emr_action"."unit_tariff" >= 0);--> statement-breakpoint
ALTER TABLE "emr_action" ADD CONSTRAINT "emr_action_discount_check" CHECK ("emr_action"."discount" >= 0);--> statement-breakpoint
ALTER TABLE "emr_action" ADD CONSTRAINT "emr_action_subtotal_check" CHECK ("emr_action"."subtotal" >= 0);--> statement-breakpoint
ALTER TABLE "emr_diagnosis" ADD CONSTRAINT "emr_diagnosis_primary_secondary_check" CHECK (not ("emr_diagnosis"."is_primary" and "emr_diagnosis"."is_secondary"));--> statement-breakpoint
ALTER TABLE "prescription_item" ADD CONSTRAINT "prescription_item_qty_check" CHECK ("prescription_item"."qty" > 0);--> statement-breakpoint
ALTER TABLE "prescription_item" ADD CONSTRAINT "prescription_item_selling_price_check" CHECK ("prescription_item"."selling_price" >= 0);--> statement-breakpoint
ALTER TABLE "prescription_item" ADD CONSTRAINT "prescription_item_subtotal_check" CHECK ("prescription_item"."subtotal" >= 0);--> statement-breakpoint
ALTER TABLE "prescription_item" ADD CONSTRAINT "prescription_item_compounding_fee_check" CHECK ("prescription_item"."compounding_fee" >= 0);--> statement-breakpoint
ALTER TABLE "action_tariff" ADD CONSTRAINT "action_tariff_doctor_fee_check" CHECK ("action_tariff"."doctor_fee" >= 0);--> statement-breakpoint
ALTER TABLE "action_tariff" ADD CONSTRAINT "action_tariff_clinic_fee_check" CHECK ("action_tariff"."clinic_fee" >= 0);--> statement-breakpoint
ALTER TABLE "action_tariff" ADD CONSTRAINT "action_tariff_other_fee_check" CHECK ("action_tariff"."other_fee" >= 0);--> statement-breakpoint
ALTER TABLE "action_tariff" ADD CONSTRAINT "action_tariff_referral_fee_check" CHECK ("action_tariff"."referral_fee" >= 0);--> statement-breakpoint
ALTER TABLE "action_tariff" ADD CONSTRAINT "action_tariff_total_fee_check" CHECK ("action_tariff"."total_fee" >= 0);--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_default_tax_pct_check" CHECK ("medicine"."default_tax_pct" between 0 and 100);--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_last_purchase_price_check" CHECK ("medicine"."last_purchase_price" >= 0);--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_highest_purchase_price_check" CHECK ("medicine"."highest_purchase_price" >= 0);--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_avg_purchase_price_check" CHECK ("medicine"."avg_purchase_price" >= 0);--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_max_retail_price_check" CHECK ("medicine"."max_retail_price" >= 0);--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_package_conversion_check" CHECK ("medicine"."package_conversion" is null or "medicine"."package_conversion" > 0);--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_package_conversion2_check" CHECK ("medicine"."package_conversion2" is null or "medicine"."package_conversion2" > 0);--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_compound_quantity_check" CHECK ("medicine"."compound_quantity" is null or "medicine"."compound_quantity" > 0);--> statement-breakpoint
ALTER TABLE "medicine_price" ADD CONSTRAINT "medicine_price_profit_margin_pct_check" CHECK ("medicine_price"."profit_margin_pct" between 0 and 100);--> statement-breakpoint
ALTER TABLE "medicine_price" ADD CONSTRAINT "medicine_price_additional_cost_check" CHECK ("medicine_price"."additional_cost" >= 0);--> statement-breakpoint
ALTER TABLE "registration_tariff" ADD CONSTRAINT "registration_tariff_doctor_fee_check" CHECK ("registration_tariff"."doctor_fee" >= 0);--> statement-breakpoint
ALTER TABLE "registration_tariff" ADD CONSTRAINT "registration_tariff_clinic_fee_check" CHECK ("registration_tariff"."clinic_fee" >= 0);--> statement-breakpoint
ALTER TABLE "registration_tariff" ADD CONSTRAINT "registration_tariff_total_fee_check" CHECK ("registration_tariff"."total_fee" >= 0);--> statement-breakpoint
ALTER TABLE "doctor_schedule" ADD CONSTRAINT "doctor_schedule_day_of_week_check" CHECK ("doctor_schedule"."day_of_week" between 0 and 6);--> statement-breakpoint
ALTER TABLE "doctor_schedule" ADD CONSTRAINT "doctor_schedule_max_patients_check" CHECK ("doctor_schedule"."max_patients" is null or "doctor_schedule"."max_patients" >= 0);--> statement-breakpoint
ALTER TABLE "dispensing" ADD CONSTRAINT "dispensing_total_compounding_fee_check" CHECK ("dispensing"."total_compounding_fee" >= 0);--> statement-breakpoint
ALTER TABLE "dispensing" ADD CONSTRAINT "dispensing_total_amount_check" CHECK ("dispensing"."total_amount" >= 0);--> statement-breakpoint
ALTER TABLE "dispensing_item" ADD CONSTRAINT "dispensing_item_qty_check" CHECK ("dispensing_item"."qty" > 0);--> statement-breakpoint
ALTER TABLE "dispensing_item" ADD CONSTRAINT "dispensing_item_ending_stock_check" CHECK ("dispensing_item"."ending_stock" is null or "dispensing_item"."ending_stock" >= 0);--> statement-breakpoint
ALTER TABLE "dispensing_item" ADD CONSTRAINT "dispensing_item_selling_price_check" CHECK ("dispensing_item"."selling_price" >= 0);--> statement-breakpoint
ALTER TABLE "dispensing_item" ADD CONSTRAINT "dispensing_item_subtotal_check" CHECK ("dispensing_item"."subtotal" >= 0);--> statement-breakpoint
ALTER TABLE "dispensing_item" ADD CONSTRAINT "dispensing_item_compounding_fee_check" CHECK ("dispensing_item"."compounding_fee" >= 0);--> statement-breakpoint
ALTER TABLE "stock_entry" ADD CONSTRAINT "stock_entry_total_discount_check" CHECK ("stock_entry"."total_discount" >= 0);--> statement-breakpoint
ALTER TABLE "stock_entry" ADD CONSTRAINT "stock_entry_total_amount_check" CHECK ("stock_entry"."total_amount" >= 0);--> statement-breakpoint
ALTER TABLE "stock_entry_item" ADD CONSTRAINT "stock_entry_item_qty_check" CHECK ("stock_entry_item"."qty" > 0);--> statement-breakpoint
ALTER TABLE "stock_entry_item" ADD CONSTRAINT "stock_entry_item_purchase_price_check" CHECK ("stock_entry_item"."purchase_price" >= 0);--> statement-breakpoint
ALTER TABLE "stock_entry_item" ADD CONSTRAINT "stock_entry_item_discount_check" CHECK ("stock_entry_item"."discount" >= 0);--> statement-breakpoint
ALTER TABLE "stock_entry_item" ADD CONSTRAINT "stock_entry_item_tax_pct_check" CHECK ("stock_entry_item"."tax_pct" between 0 and 100);--> statement-breakpoint
ALTER TABLE "stock_entry_item" ADD CONSTRAINT "stock_entry_item_subtotal_check" CHECK ("stock_entry_item"."subtotal" >= 0);--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_location_difference_check" CHECK ("stock_movement"."source_stock_location_id" <> "stock_movement"."target_stock_location_id");--> statement-breakpoint
ALTER TABLE "stock_movement_item" ADD CONSTRAINT "stock_movement_item_principle_qty_check" CHECK ("stock_movement_item"."principle_qty" >= 0);--> statement-breakpoint
ALTER TABLE "stock_movement_item" ADD CONSTRAINT "stock_movement_item_moved_qty_check" CHECK ("stock_movement_item"."moved_qty" >= 0);--> statement-breakpoint
ALTER TABLE "stock_movement_item" ADD CONSTRAINT "stock_movement_item_available_stock_check" CHECK ("stock_movement_item"."available_stock" >= 0);--> statement-breakpoint
ALTER TABLE "stock_movement_item" ADD CONSTRAINT "stock_movement_item_target_stock_check" CHECK ("stock_movement_item"."target_stock" >= 0);--> statement-breakpoint
ALTER TABLE "stock_movement_item" ADD CONSTRAINT "stock_movement_item_hna_check" CHECK ("stock_movement_item"."hna" >= 0);--> statement-breakpoint
ALTER TABLE "stock_movement_item" ADD CONSTRAINT "stock_movement_item_subtotal_check" CHECK ("stock_movement_item"."subtotal" >= 0);--> statement-breakpoint
ALTER TABLE "stock_opname_item" ADD CONSTRAINT "stock_opname_item_system_stock_check" CHECK ("stock_opname_item"."system_stock" >= 0);--> statement-breakpoint
ALTER TABLE "stock_opname_item" ADD CONSTRAINT "stock_opname_item_physical_stock_check" CHECK ("stock_opname_item"."physical_stock" >= 0);--> statement-breakpoint
ALTER TABLE "stock_opname_item" ADD CONSTRAINT "stock_opname_item_cost_price_check" CHECK ("stock_opname_item"."cost_price" >= 0);