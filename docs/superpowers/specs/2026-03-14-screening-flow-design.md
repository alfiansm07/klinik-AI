# Screening Flow Design for Klinikai

## Goal

Design a screening and initial assessment flow for Klinikai that is more operable than the reference application while keeping a comparable level of completeness. The flow starts after patient registration, uses an adaptive wizard, and produces a handover summary that doctors can read quickly.

## Product Context

- Klinikai MVP Phase 1 focuses on outpatient care.
- Registration creates the patient visit and queue context.
- Initial assessment belongs to the care phase, not registration.
- The main operator is the nurse, midwife, or assistant nurse, depending on clinic workflow.
- The doctor should receive a concise and clinically useful summary, not a long raw form.

## Design Direction

### Chosen Approach

Use an adaptive operational wizard with this order:

1. Intake
2. Risk Screening
3. Vital Sign and Triage
4. Adaptive Examination by Clinic or Condition
5. Handover to Doctor

### Why This Approach

- It keeps the full breadth of data from the reference flow.
- It matches how nurses think during real work.
- It reduces cognitive load because users answer one type of question at a time.
- It allows specialty-specific sections without forcing every clinic to see every field.
- It produces a usable doctor-facing summary at the end.

## End-to-End Visit Flow

1. Registration finishes.
2. System creates a `visit`.
3. System sets visit status to `menunggu_asesmen`.
4. Visit appears in the nurse worklist for the target clinic or service.
5. Nurse opens the visit and sees patient, visit, and registration context.
6. Nurse completes the assessment wizard.
7. System calculates risk labels, alerts, and summary data.
8. Nurse finalizes the assessment or saves a draft.
9. System updates visit status to one of:
   - `ready_for_doctor`
   - `priority_handover`
   - `observation`
10. Doctor opens the visit and sees the handover summary before SOAP.

## Visit Lifecycle Statuses

- `menunggu_asesmen` after registration and before the nurse starts input
- `draft` after the nurse starts the assessment but has not finalized it
- `ready_for_doctor` when the core assessment is complete and the patient can proceed normally
- `priority_handover` when the core assessment is complete and urgent flags require fast doctor review
- `observation` when the nurse chooses monitoring before doctor handover

## Wizard Structure

### Step 1 - Intake

Purpose: capture the initial clinical context.

Main fields:

- assessing staff
- assisting staff
- chief complaint
- additional complaints
- duration of illness
- registration note snapshot
- initial allergy flag
- nurse intake note

Outputs:

- concise reason for visit
- initial illness timeline
- trigger candidates for adaptive sections

### Step 2 - Risk Screening

Purpose: identify problems that should stand out early.

Sections:

- functional screening
- communication barrier screening
- fall risk screening
- pain screening
- nutrition screening
- special risk markers such as elderly, mobility limitation, and need for companion

System outputs:

- `fall_risk_level`
- `pain_summary`
- `nutrition_risk_level`
- communication and mobility flags

### Step 3 - Vital Sign and Triage

Purpose: capture objective condition and urgency.

Main fields:

- consciousness
- blood pressure site
- systolic and diastolic
- heart rate
- respiratory rate
- SpO2
- temperature
- cardiac rhythm
- waist circumference when relevant
- height
- weight
- BMI auto-calculated
- triage level

System outputs:

- `bmi`
- `bmi_category`
- `vital_alert_level`
- urgency escalation when triage or vital signs are concerning

### Step 4 - Adaptive Examination

Purpose: keep the assessment complete without making the form universally heavy.

This step has a core block for all clinics and additional blocks based on specialty, age, complaint, and prior answers.

#### Core Block for All Clinics

- history of present illness
- past medical history
- family medical history
- allergy detail
- medication history
- psychosocial or spiritual note
- additional note
- observation note
- initial care plan
- nursing action note
- lifestyle markers such as smoking, alcohol, and low fruit or vegetable intake

#### Dental Adaptive Block

- extraoral findings
- intraoral findings
- gum condition
- caries-related data
- percussion, palpation, pressure pain
- local swelling or pain findings

#### General Clinic Adaptive Block

- physical exam checklist by body area
- finding summary by area
- optional body finding entries

#### Condition-Based Adaptive Blocks

- detailed pain block when pain score is above zero
- detailed allergy block when allergy is present
- enhanced fall prevention block when fall risk is high
- enhanced communication block when communication barrier exists
- enhanced nutrition detail when malnutrition risk appears

### Step 5 - Handover to Doctor

Purpose: convert the full assessment into a short, useful summary.

Main items:

- system-generated handover summary
- manual handover note
- doctor attention flags
- disposition status
- transfer assistance flag
- immediate review flag
- completion metadata

Outputs:

- doctor-facing summary panel
- updated visit status
- clinically relevant badges for the doctor queue or visit header

## Detailed Field Map

### Intake

- `visit_id`
- `patient_id`
- `clinic_id`
- `assessed_by_user_id`
- `assistant_user_id`
- `assessment_at`
- `chief_complaint`
- `additional_complaints`
- `illness_duration_year`
- `illness_duration_month`
- `illness_duration_day`
- `registration_note_snapshot`
- `initial_allergy_flag`
- `intake_note`
- `special_attention_flag`

### Risk Screening

- `functional_disability_flag`
- `functional_disability_note`
- `ambulation_status`
- `communication_barrier_flag`
- `communication_barrier_note`
- `fall_unsteady_flag`
- `fall_assistive_device_flag`
- `fall_support_while_sitting_flag`
- `fall_risk_score`
- `fall_risk_level`
- `pain_score`
- `pain_recurrence_timing`
- `pain_character`
- `pain_summary`
- `nutrition_weight_loss_score`
- `nutrition_appetite_loss_flag`
- `nutrition_appetite_score`
- `nutrition_special_diagnosis_flag`
- `nutrition_special_diagnosis_name`
- `nutrition_detail_note`
- `nutrition_total_score`
- `nutrition_risk_level`
- `elderly_flag`
- `mobility_limitation_flag`
- `needs_companion_flag`
- `risk_screening_note`

### Vital Sign and Triage

- `consciousness_level`
- `blood_pressure_site`
- `systolic`
- `diastolic`
- `heart_rate`
- `respiratory_rate`
- `spo2`
- `temperature_celsius`
- `cardiac_rhythm`
- `waist_circumference_cm`
- `height_cm`
- `height_measurement_method`
- `weight_kg`
- `bmi`
- `bmi_category`
- `triage_level`
- `vital_alert_level`
- `vital_note`

### Core Clinical History

- `history_present_illness`
- `past_medical_history`
- `family_medical_history`
- `history_source_type`
- `history_source_name`
- `history_source_relationship`
- `psychosocial_spiritual_note`
- `additional_clinical_note`

### Allergy Detail

- `allergy_none_flag`
- `drug_allergy_note`
- `food_allergy_note`
- `air_allergy_note`
- `other_allergy_note`
- `allergy_severity_note`
- `allergy_verification_note`

### Medication History

- `current_steroid_medication`
- `current_anticoagulant_medication`
- `current_mucolytic_medication`
- `current_chronic_disease_medication`
- `current_other_medication`
- `frequently_used_medication`
- `medication_history_note`

### Generic Examination and Nursing

- `initial_care_plan`
- `nursing_action_note`
- `observation_note`
- `smoking_flag`
- `alcohol_flag`
- `low_fruit_vegetable_flag`

### Dental Block

- `dental_extraoral_swelling_flag`
- `dental_extraoral_consistency`
- `dental_extraoral_skin_color`
- `dental_extraoral_skin_temperature`
- `dental_intraoral_tooth_mobility_flag`
- `dental_intraoral_gingiva_color`
- `dental_intraoral_caries_tooth`
- `dental_intraoral_swelling_flag`
- `dental_intraoral_percussion_pain_flag`
- `dental_intraoral_pressure_pain_flag`
- `dental_intraoral_palpation_pain_flag`
- `dental_caries_status`
- `dental_exam_note`

### General Clinic Physical Exam Block

- `exam_skin_flag`
- `exam_nails_flag`
- `exam_head_flag`
- `exam_eyes_flag`
- `exam_ears_flag`
- `exam_nose_sinus_flag`
- `exam_mouth_lips_flag`
- `exam_neck_flag`
- `exam_chest_back_flag`
- `exam_cardiovascular_flag`
- `exam_abdomen_flag`
- `exam_upper_extremities_flag`
- `exam_lower_extremities_flag`
- `exam_male_genitalia_flag`
- `physical_exam_note`

### Anatomical Findings

- `body_finding_entries[]`
  - `body_part_code`
  - `body_part_label`
  - `finding_note`
  - `finding_pain_flag`
  - `finding_swelling_flag`
  - `finding_side`

### Handover

- `handover_summary_auto`
- `handover_note_manual`
- `doctor_attention_flags[]`
- `disposition_status`
- `requires_transfer_assistance_flag`
- `requires_immediate_review_flag`
- `assessment_completion_status`
- `completed_at`
- `completed_by_user_id`

### System-Derived Fields

- `pain_label`
- `fall_risk_level`
- `nutrition_risk_level`
- `bmi`
- `bmi_category`
- `vital_alert_level`
- `adaptive_blocks_triggered[]`
- `doctor_summary_snapshot`
- `queue_status_after_assessment`

## Adaptive Rules

### By Clinic or Service

- General clinic shows generic history, allergies, medications, and physical exam by body area.
- Dental clinic shows generic history, allergies, medications, and full dental examination.
- Future specialties can add their own block without changing the core wizard.

### By Age

- Pediatric visits emphasize nutrition, fever, breathing, allergies, and caregiver-provided history.
- Adult visits follow the standard block set.
- Elderly visits emphasize fall risk, functional status, communication, and chronic medication.

### By Chief Complaint

- Pain complaints trigger detailed pain fields.
- Respiratory complaints prioritize breathing-related values and respiratory context.
- Fever complaints emphasize temperature and nutrition or intake context.
- Dental complaints trigger the dental block.
- Weakness, dizziness, or fall-related complaints emphasize mobility and fall risk.

### By Prior Answers

- Allergy positive answers require allergy detail.
- Pain score above zero requires pain details.
- High fall risk requires mitigation context.
- Positive communication barrier requires detail.
- Positive nutrition risk requires condition detail.

### By Vital Sign or Triage

- High urgency triage enables fast handover mode.
- Critical or abnormal vital signs produce visual alerts.
- Stable vital signs allow the normal wizard path.

## Fast Handover Mode

Fast handover mode exists for urgent patients so nurses can complete the minimum safe dataset and escalate quickly.

### Trigger

- `triage_level` is `gawat` or `darurat`
- or `vital_alert_level` is `kritis`

### Still Required

- `assessed_by_user_id`
- `assessment_at`
- `chief_complaint`
- `initial_allergy_flag`
- `consciousness_level`
- `systolic`
- `diastolic`
- `heart_rate`
- `respiratory_rate`
- `temperature_celsius`
- `spo2`
- `triage_level`
- `handover_note_manual`
- `disposition_status`

### Can Be Deferred

- `nutrition_detail_note`
- extended medication history
- psychosocial note
- anatomical findings
- non-urgent clinic-specific detail blocks

### Output

- an urgent handover summary with chief complaint, vital signs, triage, allergy status, and immediate nurse note
- visit status becomes `priority_handover`
- doctor queue and visit header show urgent badges

## Doctor Handover Summary

The doctor sees a compact summary instead of the full raw assessment.

### Summary Blocks

1. Visit identity
2. Reason for visit
3. Clinical alerts
4. Vital sign summary
5. Clinical history summary
6. Early findings and nurse observation
7. Nurse disposition

### Design Rules

- Show positive findings first.
- Show abnormal findings before normal ones.
- Keep the main summary within one screen area.
- Allow drill-down to the original step details.

## Validation and Completion Rules

### Minimum for Draft Save

- `visit_id`
- `assessed_by_user_id`
- `assessment_at`
- either `chief_complaint` or `intake_note`

### Minimum for Final Submit

- intake core complete
- risk screening core complete
- vital sign core complete
- triage complete
- handover disposition complete
- system handover summary successfully generated

### Adaptive Required Rules

- allergy detail becomes required when allergy is present
- pain detail becomes required when pain score is above zero
- communication detail becomes required when communication barrier exists
- `functional_disability_note` becomes required when disability exists
- `nutrition_detail_note` becomes required when nutrition risk or special diagnosis applies
- clinic-specific blocks become required when the active clinic requires them

### Optional but Available

- assistant information
- additional complaints
- psychosocial note
- extended medication note
- anatomical findings
- extra observation detail

## Visit Status Transitions

- `menunggu_asesmen` after registration and before assessment starts
- `draft` when the assessment is incomplete
- `ready_for_doctor` when core assessment is complete and patient can proceed normally
- `priority_handover` when core assessment is complete and urgent flags exist
- `observation` when the nurse decides continued observation is needed before doctor handover

## UX Guidelines

- Show clear labels for `required`, `optional`, and `required if relevant`.
- Let users save drafts at any step.
- Collapse non-relevant or low-priority sections instead of deleting them.
- Permit fast handover for urgent triage.
- Show validation errors at the field and step level.
- Keep doctor-facing information short, useful, and clinically prioritized.

## Why This Design Is Better Than the Reference

- It preserves comparable completeness.
- It follows the nurse's workflow instead of stacking long sections.
- It turns raw answers into system-derived clinical signals.
- It adapts by clinic and condition.
- It improves doctor handover by presenting a concise summary.
- It is easier to scale to new clinic types later.

## MVP Recommendation

Implement the full core wizard first, then activate specialty-specific blocks in stages:

1. Intake
2. Risk Screening
3. Vital Sign and Triage
4. Core Clinical History, Allergy, Medication, and Observation
5. Doctor Handover Summary
6. Dental block and extended physical exam blocks

This keeps the MVP usable early while preserving the path to a complete assessment system.
