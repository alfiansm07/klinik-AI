import { ListOrdered } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getTariffComponents } from "./actions";
import { TariffComponentsView } from "./tariff-components-view";

export default async function TariffComponentsPage() {
  const data = await getTariffComponents();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Komponen Tarif"
        description="Kelola komponen tarif yang dipakai dalam struktur biaya tindakan."
        icon={ListOrdered}
      />
      <TariffComponentsView data={data} />
    </div>
  );
}
