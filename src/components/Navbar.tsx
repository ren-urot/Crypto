"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Download, Bell, HelpCircle, Globe, Menu, X } from "lucide-react";
import { useSession } from "@/lib/session-context";
import { COINS } from "@/lib/dashboard-data";
import { useClickOutside } from "@/hooks/useClickOutside";
import BuyCryptoDropdown from "./BuyCryptoDropdown";
import TradeDropdown from "./TradeDropdown";
import AccountDropdown from "./AccountDropdown";
import AssetsDropdown from "./AssetsDropdown";

const LOGGED_OUT_LINKS = [
  { label: "Products", href: "/products" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const LOGGED_IN_LINKS = [
  { label: "Buy Crypto", href: "/buy-crypto" },
  { label: "Markets", href: "/markets" },
  { label: "Trade", href: "/trade" },
  { label: "Grow", href: "/grow" },
  { label: "Learn", href: "/learn" },
  { label: "More", href: "/more" },
];

const MOBILE_QUICK_LINKS = [
  { label: "Deposit", href: "/buy-crypto" },
  { label: "My assets", href: "/assets" },
  { label: "Help", href: "/faq" },
];

type OpenMenu = "search" | "bell" | "globe" | null;

export default function Navbar() {
  const { isLoggedIn } = useSession();
  const navLinks = isLoggedIn ? LOGGED_IN_LINKS : LOGGED_OUT_LINKS;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-[#f2f2f4]">
      <div className="mx-auto flex max-w-[1520px] items-center justify-between px-4 py-4 md:px-9">
        <Link href="/" onClick={() => setMobileMenuOpen(false)}>
          <Image src="/assets/logo.svg" alt="Crypto" width={119} height={22} priority />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => {
            if (link.label === "Buy Crypto") {
              return <BuyCryptoDropdown key={link.label} />;
            }
            if (link.label === "Trade") {
              return <TradeDropdown key={link.label} />;
            }
            return (
              <Link
                key={link.label}
                href={link.href}
                className="font-semibold text-xs tracking-[0.1em] text-[#2a2a2a] uppercase transition-colors hover:text-[#39079e]"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <LoggedInActions />
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#39079e] px-5 py-2.5 text-xs font-semibold tracking-[0.1em] text-white uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#2d0680] hover:shadow-lg md:px-8 md:py-3"
            >
              Login
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="text-[#2a2a2a] hover:text-[#39079e] md:hidden"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[#e5e5e5] bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#2a2a2a] hover:bg-[#f2f2f4]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {isLoggedIn && (
            <>
              <div className="my-3 border-t border-[#e5e5e5]" />
              <nav className="flex flex-col gap-1">
                {MOBILE_QUICK_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#2a2a2a] hover:bg-[#f2f2f4]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </>
          )}
        </div>
      )}
    </header>
  );
}

function LoggedInActions() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpenMenu(null));

  function toggleMenu(menu: OpenMenu) {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const match = COINS.find(
      (coin) =>
        coin.symbol.toLowerCase() === query.trim().toLowerCase() ||
        coin.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
    if (match) {
      router.push(`/markets/${match.id.toLowerCase()}`);
      setOpenMenu(null);
      setQuery("");
    }
  }

  return (
    <div ref={containerRef} className="flex items-center gap-3 md:gap-4">
      <div className="relative hidden md:block">
        <button
          type="button"
          onClick={() => toggleMenu("search")}
          aria-label="Search markets"
          className="text-[#2a2a2a] hover:text-[#39079e]"
        >
          <Search size={20} />
        </button>
        {openMenu === "search" && (
          <form
            onSubmit={handleSearchSubmit}
            className="absolute top-full right-0 z-20 mt-2 w-64 rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-2xl"
          >
            <input
              type="text"
              autoFocus
              placeholder="Search a coin, e.g. BTC"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-[#e5e5e5] bg-[#f2f2f4] px-3 py-2 text-sm text-[#2a2a2a] placeholder:text-[#929292] focus:border-[#39079e] focus:outline-none"
            />
          </form>
        )}
      </div>

      <Link
        href="/buy-crypto"
        className="hidden rounded-full border border-[#39079e] px-5 py-2 text-xs font-semibold tracking-[0.05em] text-[#39079e] uppercase hover:bg-[#39079e] hover:text-white md:inline-block"
      >
        Deposit
      </Link>

      <div className="hidden md:block">
        <AssetsDropdown />
      </div>

      <AccountDropdown />

      <span className="hidden h-6 w-px bg-[#e5e5e5] md:block" />

      <Link
        href="/buy-crypto"
        aria-label="Deposit"
        className="hidden text-[#2a2a2a] hover:text-[#39079e] md:block"
      >
        <Download size={20} />
      </Link>

      <div className="relative hidden md:block">
        <button
          type="button"
          onClick={() => toggleMenu("bell")}
          aria-label="Notifications"
          className="text-[#2a2a2a] hover:text-[#39079e]"
        >
          <Bell size={20} />
        </button>
        {openMenu === "bell" && (
          <div className="absolute top-full right-0 z-20 mt-2 w-56 rounded-xl border border-[#e5e5e5] bg-white p-4 shadow-2xl">
            <p className="text-sm text-[#929292]">You&apos;re all caught up — no new notifications.</p>
          </div>
        )}
      </div>

      <Link
        href="/faq"
        aria-label="Help"
        className="hidden text-[#2a2a2a] hover:text-[#39079e] md:block"
      >
        <HelpCircle size={20} />
      </Link>

      <div className="relative hidden md:block">
        <button
          type="button"
          onClick={() => toggleMenu("globe")}
          aria-label="Language"
          className="text-[#2a2a2a] hover:text-[#39079e]"
        >
          <Globe size={20} />
        </button>
        {openMenu === "globe" && (
          <div className="absolute top-full right-0 z-20 mt-2 w-40 rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-2xl">
            <p className="rounded-lg bg-[#f2f2f4] px-3 py-2 text-sm font-semibold text-[#39079e]">
              English
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
