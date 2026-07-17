"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Is Crypto safe to use?",
    a: "Yes. Funds are secured with multi-layer encryption and the majority of assets are held in cold storage, offline and out of reach of online threats.",
  },
  {
    q: "What cryptocurrencies can I buy?",
    a: "Crypto supports all major coins including Bitcoin, Ethereum, and a growing list of altcoins, with more added regularly based on demand.",
  },
  {
    q: "How do I start mining?",
    a: "Choose a mining pool from the Detailed Statistics dashboard, select a plan, and you can start mining in minutes. No hardware required.",
  },
  {
    q: "What are the fees?",
    a: "Trading fees are a flat 0.1% per transaction, with no hidden charges. Withdrawal fees vary by network and are shown before you confirm.",
  },
  {
    q: "How long do withdrawals take?",
    a: "Most withdrawals are processed within minutes, though network congestion can occasionally extend this to a few hours.",
  },
  {
    q: "Do you offer customer support?",
    a: "Our support team is available around the clock through the Contact page and responds to most requests within a few hours.",
  },
  {
    q: "Is there a mobile app?",
    a: "A mobile app is in development. In the meantime, the platform is fully responsive and works great from any mobile browser.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-[800px] space-y-4">
      {FAQS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.q} className="rounded-[24px] bg-white p-6 md:p-8">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 text-left font-semibold text-[#39079e]"
            >
              <span>{item.q}</span>
              <span
                className={`shrink-0 text-2xl leading-none transition-transform duration-200 ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <p className="mt-4 text-sm leading-relaxed text-[#2d2d2d]">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
