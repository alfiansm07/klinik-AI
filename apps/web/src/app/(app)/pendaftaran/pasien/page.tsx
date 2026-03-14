import Link from "next/link";
import type { Route } from "next";
import { Plus, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getPageAuthContext } from "@/lib/auth-helpers";
import { cn } from "@/lib/utils";

import { getDailyRegistrationList } from "./actions";
import { PatientView } from "./patient-view";

export default async function PatientRegistryPage() {
  const [context, data] = await Promise.all([
    getPageAuthContext("registration"),
    getDailyRegistrationList(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pendaftaran Pasien"
        description={`Kelola daftar registrasi harian ${context.activeMembership?.clinicName ?? "klinik aktif"} dan mulai pendaftaran rawat jalan dari satu halaman kerja yang ringkas.`}
        icon={Users}
        action={
          <Link
            href={"/pendaftaran/pasien/baru" as Route}
            className={cn(buttonVariants({ size: "lg" }), "w-full justify-center sm:w-auto")}
          >
            <Plus className="h-4 w-4" />
            Tambah
          </Link>
        }
      />
      <PatientView data={data} />
    </div>
  );
}
