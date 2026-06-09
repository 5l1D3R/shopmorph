"use server";

import { redirect } from "next/navigation";
import { signInWithPassword } from "@/lib/auth";

export type LoginState = {
  error: string | null;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await signInWithPassword(email, password);

  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/dashboard");
}
