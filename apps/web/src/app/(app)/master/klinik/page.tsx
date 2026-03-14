import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getClinicProfile } from "./actions";
import { KlinikView } from "./klinik-view";

export default async function KlinikPage() {
  const profile = await getClinicProfile();

  if (!profile) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <PageHeader
        title="Profil Klinik"
        description="Informasi umum, legalitas, dan pengaturan klinik Anda."
        icon={Building2}
      />
      <KlinikView profile={profile} />
    </div>
  );
}
