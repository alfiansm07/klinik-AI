"use client";

import { useState } from "react";
import { FileStack } from "lucide-react";

import { MasterDetailSection } from "@/components/shared/master-data-ui";
import { cn } from "@/lib/utils";

import type { PatientSearchRow } from "../actions";
import { StepDataPasien } from "./step-data-pasien";
import { StepDataPelayanan } from "./step-data-pelayanan";

export function RegistrationSteps() {
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchRow | null>(null);
  const hasPatient = selectedPatient !== null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      {/* Step 1 — Data Pasien */}
      <MasterDetailSection
        title="1. Data Pasien"
        description="Cari pasien yang sudah terdaftar atau buat data pasien baru."
      >
        <StepDataPasien onPatientSelected={setSelectedPatient} />
      </MasterDetailSection>

      {/* Step 2 — Data Pelayanan (disabled until patient selected) */}
      <MasterDetailSection
        title="2. Data Pelayanan"
        description={
          hasPatient
            ? "Lengkapi data kunjungan rawat jalan untuk pasien terpilih."
            : "Panel pelayanan akan aktif setelah pasien dipilih di panel kiri."
        }
        className={cn(!hasPatient && "pointer-events-none opacity-50")}
      >
        {hasPatient ? (
          <StepDataPelayanan patient={selectedPatient} />
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed bg-muted/20 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileStack className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    Data pelayanan akan dilanjutkan
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Akan menampung data kunjungan, penjamin, poli atau ruangan,
                    tenaga medis, keluhan utama, dan screening ringan rawat
                    jalan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </MasterDetailSection>
    </div>
  );
}
