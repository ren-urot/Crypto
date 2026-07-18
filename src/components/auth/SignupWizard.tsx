"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "@/lib/session-context";
import { useFakeSubmit } from "@/hooks/useFakeSubmit";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Philippines",
  "Singapore",
  "Australia",
  "India",
  "Canada",
  "Germany",
];

const PASSWORD_RULES: { label: string; test: (pw: string) => boolean }[] = [
  { label: "8-32 characters", test: (pw) => pw.length >= 8 && pw.length <= 32 },
  {
    label: "At least 1 lowercase character (a-z)",
    test: (pw) => /[a-z]/.test(pw),
  },
  {
    label: "At least 1 uppercase character (A-Z)",
    test: (pw) => /[A-Z]/.test(pw),
  },
  { label: "At least 1 number", test: (pw) => /[0-9]/.test(pw) },
  {
    label: "At least 1 special character e.g. !@#$%",
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

export default function SignupWizard({
  onBackToSignIn,
}: {
  onBackToSignIn: () => void;
}) {
  const router = useRouter();
  const { login } = useSession();
  const { status, submit } = useFakeSubmit();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  const [country, setCountry] = useState(COUNTRIES[0]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [resendSeconds, setResendSeconds] = useState(60);

  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [verificationType, setVerificationType] = useState<
    "individual" | "institutional"
  >("individual");

  useEffect(() => {
    if (step === 3 && otp.every((digit) => digit !== "")) {
      setStep(4);
    }
  }, [otp, step]);

  useEffect(() => {
    if (step !== 3 || resendSeconds <= 0) return;
    const timer = setTimeout(
      () => setResendSeconds((seconds) => seconds - 1),
      1000,
    );
    return () => clearTimeout(timer);
  }, [step, resendSeconds]);

  useEffect(() => {
    if (status === "success") {
      login();
      router.push("/trade");
    }
  }, [status, login, router]);

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    label: rule.label,
    passed: rule.test(password),
  }));
  const passwordValid = passwordChecks.every((check) => check.passed);

  if (step === 1) {
    return (
      <div>
        <h1 className="font-semibold text-2xl text-[#39079e]">
          Select your location
        </h1>
        <p className="mt-2 text-sm text-[#2d2d2d]">
          This helps us provide the right experience for where you live.
        </p>

        <div className="mt-6">
          <label
            htmlFor="signup-country"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Country/region
          </label>
          <select
            id="signup-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          >
            {COUNTRIES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <label className="mt-6 flex items-start gap-3 text-sm text-[#2d2d2d]">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1"
          />
          <span>
            By creating an account, I agree to Crypto&apos;s{" "}
            <Link
              href="/terms"
              className="font-semibold text-[#39079e] underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              className="font-semibold text-[#39079e] underline"
            >
              Privacy Notice
            </Link>
            .
          </span>
        </label>

        <button
          type="button"
          disabled={!agreedToTerms}
          onClick={() => setStep(2)}
          className="mt-6 w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          Create account
        </button>

        <p className="mt-4 text-center text-sm text-[#929292]">
          Have an account?{" "}
          <button
            type="button"
            onClick={onBackToSignIn}
            className="font-semibold text-[#39079e] underline"
          >
            Log in
          </button>
        </p>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div>
        <h1 className="font-semibold text-2xl text-[#39079e]">
          What&apos;s your email?
        </h1>
        <p className="mt-2 text-sm text-[#2d2d2d]">
          You&apos;ll use this email to log in and access your account.
        </p>

        <div className="mt-6">
          <label
            htmlFor="signup-email"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
        </div>

        <div className="mt-6">
          <label
            htmlFor="signup-referral"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Referral code (optional)
          </label>
          <input
            id="signup-referral"
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
          />
        </div>

        <button
          type="button"
          disabled={!email.trim()}
          onClick={() => {
            setResendSeconds(60);
            setStep(3);
          }}
          className="mt-6 w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          Sign up
        </button>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div>
        <h1 className="font-semibold text-2xl text-[#39079e]">
          Enter the 6-digit code sent to your email
        </h1>
        <p className="mt-2 text-sm text-[#2d2d2d]">
          We&apos;ve sent it to <span className="font-semibold">{email}</span>
          . If you don&apos;t see it, check your spam folder.
        </p>

        <div className="mt-6 flex gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                otpRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              className="h-14 w-full rounded-xl border border-[#e5e5e5] text-center text-lg text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
            />
          ))}
        </div>

        <button
          type="button"
          disabled={resendSeconds > 0}
          onClick={() => setResendSeconds(60)}
          className="mt-6 w-full rounded-full bg-[#f2f2f4] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resendSeconds > 0 ? `Resend code (${resendSeconds}s)` : "Resend code"}
        </button>

        <p className="mt-4 text-center text-sm text-[#929292]">
          Unable to verify?{" "}
          <button
            type="button"
            onClick={() => setStep(2)}
            className="font-semibold text-[#39079e] underline"
          >
            change email
          </button>
        </p>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div>
        <h1 className="font-semibold text-2xl text-[#39079e]">
          What&apos;s your phone number?
        </h1>
        <p className="mt-2 text-sm text-[#2d2d2d]">
          We&apos;ll use this number for extra account security.
        </p>

        <div className="mt-6">
          <label
            htmlFor="signup-phone"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Phone number
          </label>
          <div className="mt-2 flex items-center gap-2 border-b border-[#e5e5e5] pb-3">
            <span className="text-base text-[#2a2a2a]">+1</span>
            <input
              id="signup-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent text-base text-[#2a2a2a] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={!phone.trim()}
          onClick={() => setStep(5)}
          className="mt-6 w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          Verify now
        </button>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div>
        <h1 className="font-semibold text-2xl text-[#39079e]">
          Create password
        </h1>

        <div className="mt-6">
          <label
            htmlFor="signup-password"
            className="text-sm font-semibold text-[#2a2a2a]"
          >
            Password
          </label>
          <div className="mt-2 flex items-center border-b border-[#e5e5e5] pb-3">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-base text-[#2a2a2a] focus:outline-none"
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? (
                <EyeOff className="size-5 text-[#929292]" />
              ) : (
                <Eye className="size-5 text-[#929292]" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-[#2a2a2a]">
            Your password must contain:
          </p>
          {passwordChecks.map((check) => (
            <p
              key={check.label}
              className={`text-sm ${
                check.passed ? "text-green-600" : "text-[#929292]"
              }`}
            >
              {check.passed ? "✓" : "○"} {check.label}
            </p>
          ))}
        </div>

        <button
          type="button"
          disabled={!passwordValid}
          onClick={() => setStep(6)}
          className="mt-6 w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          Confirm
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-semibold text-2xl text-[#39079e]">
        Let&apos;s verify your account
      </h1>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => setVerificationType("individual")}
          className={`w-full rounded-2xl border p-4 text-left ${
            verificationType === "individual"
              ? "border-[#39079e]"
              : "border-[#e5e5e5]"
          }`}
        >
          <p className="font-semibold text-[#2a2a2a]">
            Individual verification
          </p>
          <p className="mt-1 text-sm text-[#929292]">
            For users who want to trade, send, receive, and manage crypto
            for themselves
          </p>
        </button>

        <button
          type="button"
          onClick={() => setVerificationType("institutional")}
          className={`w-full rounded-2xl border p-4 text-left ${
            verificationType === "institutional"
              ? "border-[#39079e]"
              : "border-[#e5e5e5]"
          }`}
        >
          <p className="font-semibold text-[#2a2a2a]">
            Institutional verification
          </p>
          <p className="mt-1 text-sm text-[#929292]">
            For institutions who want to save, invest, receive, pay, and
            manage crypto on behalf of others
          </p>
        </button>
      </div>

      <button
        type="button"
        disabled={status === "submitting"}
        onClick={() => submit(true)}
        className="mt-6 w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Please wait..." : "Verify identity"}
      </button>
    </div>
  );
}
