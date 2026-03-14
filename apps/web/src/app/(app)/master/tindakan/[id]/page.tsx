import { notFound } from "next/navigation";
import { Stethoscope } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getTindakanDetail, getTindakanLookups } from "../actions";
import { TindakanDetailView } from "./detail-view";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TindakanDetailPage({ params }: Props) {
  const { id } = await params;
  const [detail, lookups] = await Promise.all([
    getTindakanDetail(id),
    getTindakanLookups(),
  ]);

  if (!detail) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Data Tindakan (${detail.name})`}
        description="Tinjau detail tindakan medis, tarif, dan obat terkait dalam satu tampilan."
        icon={Stethoscope}
      />
      <TindakanDetailView detail={detail} lookups={lookups} />
    </div>
  );
}
