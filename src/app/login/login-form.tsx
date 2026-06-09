"use client";

import { useActionState } from "react";
import { LogIn, Mail, Lock } from "lucide-react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {
  error: null
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="email"
        >
          Email
        </label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
          <input
            autoComplete="email"
            className="h-12 w-full rounded-md border border-slate-300 bg-white pl-11 pr-4 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
            id="email"
            name="email"
            placeholder="you@shopmorph.com"
            required
            type="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <Lock
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
          <input
            autoComplete="current-password"
            className="h-12 w-full rounded-md border border-slate-300 bg-white pl-11 pr-4 text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
            id="password"
            name="password"
            placeholder="Enter your password"
            required
            type="password"
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      <button
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-teal-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-600/25 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isPending}
        type="submit"
      >
        <LogIn aria-hidden="true" className="h-5 w-5" />
        {isPending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
