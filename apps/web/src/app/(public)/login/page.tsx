import { redirect } from "next/navigation";

import { getSafeSession } from "@/lib/auth-session.server";

import LoginView from "../../login/login-view";

export default async function LoginPage() {
  const session = await getSafeSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return <LoginView />;
}
