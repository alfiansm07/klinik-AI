import { notFound } from "next/navigation";
import { FlaskConical } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getLaboratDetail } from "../actions";
import { LaboratDetailView } from "./detail-view";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LaboratDetailPage({ params }: Props) {
  const { id } = await params;
  const detail = await getLaboratDetail(id);

  if (!detail) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Data Jenis Laboratorium (${detail.name})`}
        description="Tinjau detail jenis pemeriksaan laboratorium dan status penggunaannya."
        icon={FlaskConical}
      />
      <LaboratDetailView detail={detail} />
    </div>
  );
}
