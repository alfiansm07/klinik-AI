import { notFound } from "next/navigation";
import { ListOrdered } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getTariffComponentDetail } from "../actions";
import { TariffComponentDetailView } from "./detail-view";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TariffComponentDetailPage({ params }: Props) {
  const { id } = await params;
  const detail = await getTariffComponentDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title={`Komponen Tarif (${detail.name})`}
        description="Tinjau detail komponen tarif dan perbarui bila diperlukan."
        icon={ListOrdered}
      />
      <TariffComponentDetailView detail={detail} />
    </div>
  );
}
