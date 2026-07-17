"use client";

import { useEffect, useRef, useState } from "react";

type Status = "idle" | "submitting" | "success";

export function useFakeSubmit(delayMs = 500) {
  const [status, setStatus] = useState<Status>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function submit(isValid: boolean) {
    if (!isValid) return;
    setStatus("submitting");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setStatus("success");
    }, delayMs);
  }

  function reset() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setStatus("idle");
  }

  return { status, submit, reset };
}
