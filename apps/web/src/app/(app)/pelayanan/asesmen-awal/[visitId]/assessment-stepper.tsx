"use client";

import { AlertCircle, CheckCircle2, Clock3, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { assessmentWizardSteps } from "../assessment-shared";

type AssessmentStepperProps = {
  patientName: string;
  medicalRecordNumber: string;
  registrationNumber: string;
  roomLabel: string;
  guarantorLabel: string;
  visitDate: string;
  statusLabel: string;
  statusClassName: string;
  alerts: string[];
  currentStepIndex: number;
  stepErrors: Partial<Record<(typeof assessmentWizardSteps)[number]["id"], string>>;
  canEdit: boolean;
  onStepChange: (index: number) => void;
};

export function AssessmentStepper({
  patientName,
  medicalRecordNumber,
  registrationNumber,
  roomLabel,
  guarantorLabel,
  visitDate,
  statusLabel,
  statusClassName,
  alerts,
  currentStepIndex,
  stepErrors,
  canEdit,
  onStepChange,
}: AssessmentStepperProps) {
  const progressValue = ((currentStepIndex + 1) / assessmentWizardSteps.length) * 100;

  return (
    <Card className="rounded-2xl border-border/70">
      <CardHeader className="gap-4 border-b pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("h-7 rounded-md border px-3 text-xs font-semibold", statusClassName)}>
                {statusLabel}
              </Badge>
              <Badge variant="outline" className="h-7 rounded-md px-3 text-xs font-medium">
                {roomLabel}
              </Badge>
              <Badge variant="outline" className="h-7 rounded-md px-3 text-xs font-medium">
                {guarantorLabel}
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold sm:text-xl">{patientName}</CardTitle>
            <CardDescription className="text-sm leading-6">
              No. RM {medicalRecordNumber} · No. daftar {registrationNumber} · Tanggal kunjungan {visitDate}
            </CardDescription>
          </div>

          <div className="rounded-xl border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <UserRound className="h-4 w-4 text-primary" />
              Identitas kunjungan
            </div>
            <p className="mt-1">Pasien rawat jalan aktif untuk asesmen awal.</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-foreground">Progres asesmen</span>
            <span className="text-muted-foreground">
              Langkah {currentStepIndex + 1} dari {assessmentWizardSteps.length}
            </span>
          </div>
          <Progress value={progressValue} className="gap-0" />
        </div>

        {alerts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {alerts.map((alert) => (
              <Badge
                key={alert}
                variant="outline"
                className="h-7 rounded-md border-amber-200 bg-amber-50 px-3 text-xs font-medium text-amber-800"
              >
                <AlertCircle className="mr-1 h-3.5 w-3.5" />
                {alert}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            Belum ada alert klinis menonjol dari draft saat ini.
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pt-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {assessmentWizardSteps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const hasError = Boolean(stepErrors[step.id]);

            return (
              <Button
                key={step.id}
                type="button"
                variant="outline"
                onClick={() => onStepChange(index)}
                disabled={!canEdit}
                className={cn(
                  "h-auto min-h-14 flex-col items-start gap-1 rounded-xl px-4 py-3 text-left text-base",
                  isActive && "border-primary bg-primary/5 text-foreground",
                  isCompleted && "border-emerald-200 bg-emerald-50 text-emerald-900",
                  hasError && "border-destructive/50 bg-destructive/5 text-destructive",
                  !canEdit && "cursor-default opacity-100",
                )}
              >
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                  {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                  Langkah {index + 1}
                </span>
                <span className="text-sm font-semibold sm:text-base">{step.label}</span>
                {hasError ? <span className="text-xs font-medium">{stepErrors[step.id]}</span> : null}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
