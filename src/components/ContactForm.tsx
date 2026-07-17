"use client";

import { useState } from "react";
import { useFakeSubmit } from "@/hooks/useFakeSubmit";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { status, submit } = useFakeSubmit();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(Boolean(name.trim() && email.trim() && message.trim()));
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-[600px] rounded-[40px] bg-white p-10 text-center md:p-16">
        <h2 className="font-semibold text-2xl text-[#39079e]">
          Message sent
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#2d2d2d]">
          Thanks for reaching out. We&apos;ll be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-[600px] space-y-6 rounded-[40px] bg-white p-10 md:p-16"
    >
      <div>
        <label htmlFor="name" className="text-sm font-semibold text-[#2a2a2a]">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-[#2a2a2a]">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="text-sm font-semibold text-[#2a2a2a]"
        >
          Message
        </label>
        <textarea
          id="message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 w-full border-b border-[#e5e5e5] bg-transparent pb-3 text-base text-[#2a2a2a] focus:border-[#39079e] focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-[#ffb506] px-10 py-4 text-sm font-bold tracking-[0.05em] text-[#39079e] uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#e6a205] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
      >
        {status === "submitting" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
