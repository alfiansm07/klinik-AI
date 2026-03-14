import { Shield } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getGuarantors } from "./actions";
import { GuarantorsView } from "./guarantors-view";

export default async function GuarantorsPage() {
  const data = await getGuarantors();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penjamin"
        description="Kelola data penjamin pembayaran."
        icon={Shield}
      />
      <GuarantorsView data={data} />
    </div>
  );
}
