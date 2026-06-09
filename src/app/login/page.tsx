import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen bg-slate-50">
      <section
        className="hidden flex-1 bg-cover bg-center lg:block"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?auto=format&fit=crop&w=1600&q=80')"
        }}
      />
      <section className="flex w-full items-center justify-center px-5 py-10 lg:w-[520px]">
        <div className="w-full max-w-[390px]">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              ShopMorph
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">
              Sign in
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Access your storefront tools and account workspace.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
