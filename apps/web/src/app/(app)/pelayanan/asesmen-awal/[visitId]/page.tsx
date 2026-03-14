import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardPlus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getPageAuthContext } from "@/lib/auth-helpers";
import { cn } from "@/lib/utils";

import { getAssessmentVisitDetailForClinic } from "../actions";
import { AssessmentShell } from "./assessment-shell";

type Props = {
  params: Promise<{ visitId: string }>;
};

export default async function AssessmentVisitPage({ params }: Props) {
  const { visitId } = await params;
  const context = await getPageAuthContext("care");

  if (!context.activeMembership) {
    notFound();
  }

  const visit = await getAssessmentVisitDetailForClinic({
    visitId,
    clinicId: context.activeMembership.clinicId,
    currentUserId: context.session.user.id,
  });

  if (!visit) {
    notFound();
  }

  const isDoctor = context.activeMembership.role === "doctor";

  return (
    <div className="space-y-6">
      <PageHeader
        title={isDoctor ? "Ringkasan Asesmen Awal" : "Asesmen Awal Pasien"}
        description={
          isDoctor
            ? "Tinjau handover perawat yang sudah final sebelum SOAP tersedia pada slice berikutnya."
            : "Lengkapi asesmen awal perawat, simpan draft bila perlu, lalu finalkan handover untuk dokter."
        }
        icon={ClipboardPlus}
        action={
          <Link
            href={"/pelayanan/asesmen-awal" as Route}
            className={cn(buttonVariants({ variant: "outline" }), "h-11 rounded-lg px-4 text-sm")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke antrean
          </Link>
        }
      />

      <AssessmentShell
        currentRole={context.activeMembership.role}
        assessorName={context.session.user.name ?? context.session.user.email ?? "Petugas klinik"}
        visit={visit}
      />
    </div>
  );
}
