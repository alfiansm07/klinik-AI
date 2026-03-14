import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ClipboardPlus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { RegistrationSteps } from "./registration-steps";

export default function NewPatientRegistrationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pendaftaran Kunjungan Rawat Jalan"
        description="Mulai pendaftaran dengan memilih pasien terlebih dahulu, lalu lanjutkan ke data pelayanan rawat jalan."
        icon={ClipboardPlus}
        action={
          <Link
            href={"/pendaftaran/pasien" as Route}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full justify-center sm:w-auto")}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar
          </Link>
        }
      />

      <RegistrationSteps />
    </div>
  );
}
