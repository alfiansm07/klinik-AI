"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  Check,
  Loader2,
  RefreshCw,
  Search,
  UserPlus,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  getNextMedicalRecordNumber,
  searchPatients,
  type PatientSearchRow,
} from "../actions";
import { PatientForm } from "../patient-form";

type StepDataPasienProps = {
  onPatientSelected: (patient: PatientSearchRow | null) => void;
};

type ViewMode = "search" | "selected" | "create";

export function StepDataPasien({ onPatientSelected }: StepDataPasienProps) {
  const [mode, setMode] = useState<ViewMode>("search");
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchRow | null>(null);

  function handleSelect(patient: PatientSearchRow) {
    setSelectedPatient(patient);
    setMode("selected");
    onPatientSelected(patient);
  }

  function handleDeselect() {
    setSelectedPatient(null);
    setMode("search");
    onPatientSelected(null);
  }

  function handleCreateNew() {
    setMode("create");
    onPatientSelected(null);
  }

  function handleBackToSearch() {
    setMode("search");
  }

  function handlePatientCreated(patient: PatientSearchRow | null) {
    if (patient) {
      handleSelect(patient);
      return;
    }

    setMode("search");
  }

  if (mode === "selected" && selectedPatient) {
    return (
      <SelectedPatientSummary
        patient={selectedPatient}
        onDeselect={handleDeselect}
      />
    );
  }

  if (mode === "create") {
    return (
      <CreatePatientView
        onBack={handleBackToSearch}
        onCreated={handlePatientCreated}
      />
    );
  }

  return (
    <PatientSearchView
      onSelect={handleSelect}
      onCreateNew={handleCreateNew}
    />
  );
}

// ---------------------------------------------------------------------------
// Search View
// ---------------------------------------------------------------------------

function PatientSearchView({
  onSelect,
  onCreateNew,
}: {
  onSelect: (patient: PatientSearchRow) => void;
  onCreateNew: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientSearchRow[]>([]);
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const runSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();

      if (trimmed.length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      startTransition(async () => {
        const data = await searchPatients(trimmed);
        setResults(data);
        setHasSearched(true);
      });
    },
    [],
  );

  function handleInputChange(value: string) {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      runSearch(value);
    }, 350);
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari NIK atau nama pasien..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          className="h-11 pl-10 text-sm"
          autoFocus
        />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Hint text */}
      {!hasSearched && !isPending && (
        <p className="text-sm leading-6 text-muted-foreground">
          Ketik minimal 2 karakter untuk mencari pasien yang sudah terdaftar berdasarkan NIK atau nama.
          Jika pasien baru, gunakan tombol di bawah.
        </p>
      )}

      {/* Results */}
      {hasSearched && results.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {results.length} pasien ditemukan
          </p>
          <ul className="divide-y overflow-hidden rounded-lg border bg-background">
            {results.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => onSelect(row)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {row.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(row.nik ?? row.medicalRecordNumber)} &middot; {row.genderLabel} &middot; {row.ageLabel}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    Pilih
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {hasSearched && results.length === 0 && !isPending && (
        <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center">
          <p className="text-sm font-medium text-foreground">
            Tidak ada pasien ditemukan
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Coba kata kunci lain atau buat pasien baru.
          </p>
        </div>
      )}

      {/* Create new patient button — always visible */}
      <div className="border-t pt-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onCreateNew}
          className="w-full justify-center gap-2 rounded-lg"
        >
          <UserPlus className="h-4 w-4" />
          Buat Pasien Baru
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Selected Patient Summary
// ---------------------------------------------------------------------------

function SelectedPatientSummary({
  patient,
  onDeselect,
}: {
  patient: PatientSearchRow;
  onDeselect: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Confirmation banner */}
      <div className="flex items-center gap-3 rounded-lg bg-success/10 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
          <Check className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            Pasien terpilih
          </p>
          <p className="text-xs text-muted-foreground">
            Lanjutkan ke Data Pelayanan di panel kanan.
          </p>
        </div>
      </div>

      {/* Patient detail card */}
      <div className="overflow-hidden rounded-lg border bg-background">
        <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-foreground">
              {patient.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {patient.nik ?? patient.medicalRecordNumber}
            </p>
          </div>
        </div>

        <div className="grid gap-px bg-border sm:grid-cols-2">
          <SummaryField label="No. RM" value={patient.medicalRecordNumber} />
          <SummaryField label="NIK" value={patient.nik ?? "-"} />
          <SummaryField label="Jenis Kelamin" value={patient.genderLabel} />
          <SummaryField label="Umur" value={patient.ageLabel} />
          <SummaryField label="Tanggal Lahir" value={formatDisplayDate(patient.dateOfBirth)} />
          <SummaryField label="No. HP" value={patient.mobilePhone ?? "-"} />
          <SummaryField
            label="Alamat"
            value={patient.address ?? "-"}
            className="sm:col-span-2"
          />
        </div>
      </div>

      {/* Change patient action */}
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onDeselect}
        className="w-full justify-center gap-2 rounded-lg"
      >
        <RefreshCw className="h-4 w-4" />
        Ganti Pasien
      </Button>
    </div>
  );
}

function SummaryField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("bg-card px-4 py-3", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-foreground">{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create Patient View (embeds existing PatientForm)
// ---------------------------------------------------------------------------

function CreatePatientView({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: (patient: PatientSearchRow | null) => void;
}) {
  const [nextMrn, setNextMrn] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const mrn = await getNextMedicalRecordNumber();
      if (!cancelled) setNextMrn(mrn);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke pencarian
      </button>

      <PatientForm
        nextMedicalRecordNumber={nextMrn}
        onSuccess={onCreated}
        onCancel={onBack}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDisplayDate(dateString: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) return dateString;
  return `${match[3]}-${match[2]}-${match[1]}`;
}
