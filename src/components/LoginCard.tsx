"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFakeSubmit } from "@/hooks/useFakeSubmit";

export default function LoginCard() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { status, submit, reset } = useFakeSubmit();

  useEffect(() => {
    if (status === "success") {
      router.push("/dashboard");
    }
  }, [status, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(Boolean(email.trim() && password.trim()));
  }

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    reset();
  }

  return (
    <div className="mx-auto max-w-[440px] rounded-[20px] bg-white p-10 md:p-16">
      <div className="flex gap-2 rounded-full bg-[#f2f2f4] p-1">
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            mode === "signin" ? "bg-[#39079e] text-white" : "text-[#2a2a2a]"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-full py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors ${
            mode === "signup" ? "bg-[#39079e] text-white" : "text-[#2a2a2a]"
          }`}
        >
          Sign up
        </button>
      </div>

      <h1 className="mt-8 font-semibold text-2xl text-[#39079e]">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label
            htmlFor="login-email"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="login-password"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === "submitting" || status === "success"}
          className="w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "idle"
            ? mode === "signin"
              ? "Sign In"
              : "Sign Up"
            : "Please wait..."}
        </button>
      </form>
    </div>
  );
}
