import { notFound } from "next/navigation";
import { Shield } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getGuarantorDetail } from "../actions";
import { GuarantorDetailView } from "./detail-view";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function GuarantorDetailPage({ params }: Props) {
  const { id } = await params;
  const detail = await getGuarantorDetail(id);

  if (!detail) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        title={`Data Penjamin (${detail.name})`}
        description="Tinjau detail penjamin dan perbarui konfigurasi sesuai kebutuhan pembayaran."
        icon={Shield}
      />
      <GuarantorDetailView detail={detail} />
    </div>
  );
}
