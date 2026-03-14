import { notFound } from "next/navigation";
import { Pill } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getObatDetailWithNames, getObatLookups } from "../actions";
import { ObatDetailView } from "./detail-view";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ObatDetailPage({ params }: Props) {
  const { id } = await params;
  const [detail, lookups] = await Promise.all([
    getObatDetailWithNames(id),
    getObatLookups(),
  ]);

  if (!detail) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Data Obat (${detail.name})`}
        description="Tinjau detail obat atau alat kesehatan beserta informasi satuan dan integrasinya."
        icon={Pill}
      />
      <ObatDetailView detail={detail} lookups={lookups} />
    </div>
  );
}
