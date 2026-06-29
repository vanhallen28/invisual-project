"use client";
// src/app/admin/login/page.tsx
import { useActionState } from "react";
import { login, type LoginState } from "../auth-actions";

const initialState: LoginState = null;

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-5 rounded-lg border p-6"
      >
        <div className="space-y-1">
          <h1 className="text-xl font-bold">Masuk admin</h1>
          <p className="text-sm text-muted-foreground">
            Masukkan password untuk mengelola karya.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {state?.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Memeriksa…" : "Masuk"}
        </button>
      </form>
    </main>
  );
}
