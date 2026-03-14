import { notFound } from "next/navigation";
import { ClipboardList } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getRegistrationDetail } from "../actions";
import { RegistrationDetailView } from "./detail-view";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RegistrationDetailPage({ params }: Props) {
  const { id } = await params;
  const detail = await getRegistrationDetail(id);

  if (!detail) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lihat Data Pendaftaran"
        description="Tinjau ringkasan administrasi, data pelayanan, dan status placeholder registrasi pasien rawat jalan."
        icon={ClipboardList}
      />
      <RegistrationDetailView detail={detail} />
    </div>
  );
}
