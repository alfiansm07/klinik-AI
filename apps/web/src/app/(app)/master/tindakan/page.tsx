import { Stethoscope } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

import { getTindakanList, getTindakanLookups } from "./actions";
import { TindakanView } from "./tindakan-view";

export default async function TindakanPage() {
  const [data, lookups] = await Promise.all([
    getTindakanList(),
    getTindakanLookups(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tindakan"
        description="Kelola data tindakan medis, radiologi, dan laboratorium."
        icon={Stethoscope}
      />
      <TindakanView data={data} lookups={lookups} />
    </div>
  );
}
