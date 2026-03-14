import { auth } from "@klinik-AI/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import LoginView from "../../login/login-view";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/dashboard");
  }

  return <LoginView />;
}
