import { getPageAuthContext, requireModuleAccess } from "@/lib/auth-helpers";
import { LayoutDashboard } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import Dashboard from "../../dashboard/dashboard";

export default async function DashboardPage() {
  const context = await getPageAuthContext();

  if (!context.activeMembership) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description={`Selamat datang, ${context.session.user.name ?? "User"}. Akun Anda belum memiliki klinik aktif, jadi ringkasan operasional belum bisa ditampilkan.`}
          icon={LayoutDashboard}
        />
        <div className="rounded-2xl border border-dashed border-border bg-card/60 px-5 py-6 text-sm leading-6 text-muted-foreground sm:px-6">
          Hubungkan akun ini ke klinik aktif untuk melihat KPI harian, prioritas operasional, dan navigasi modul yang lengkap.
        </div>
      </div>
    );
  }

  requireModuleAccess(context, "dashboard");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Halo ${context.session.user.name ?? "User"}, ini ringkasan operasional ${context.activeMembership.clinicName} yang sudah dioptimalkan untuk layar mobile, tablet, dan desktop.`}
        icon={LayoutDashboard}
      />
      <Dashboard
        userName={context.session.user.name ?? "User"}
        clinicName={context.activeMembership.clinicName}
        role={context.activeMembership.role}
      />
    </div>
  );
}
