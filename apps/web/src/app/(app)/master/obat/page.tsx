import { Pill } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getObatList, getObatLookups } from "./actions";
import { ObatView } from "./obat-view";

export default async function ObatPage() {
  const [data, lookups] = await Promise.all([getObatList(), getObatLookups()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Obat & Alkes"
        description="Kelola data obat dan alat kesehatan klinik."
        icon={Pill}
      />
      <ObatView data={data} lookups={lookups} />
    </div>
  );
}
