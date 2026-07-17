"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success";

export function useFakeSubmit(delayMs = 500) {
  const [status, setStatus] = useState<Status>("idle");

  function submit(isValid: boolean) {
    if (!isValid) return;
    setStatus("submitting");
    setTimeout(() => setStatus("success"), delayMs);
  }

  function reset() {
    setStatus("idle");
  }

  return { status, submit, reset };
}
