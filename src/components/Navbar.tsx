import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Products", href: "/products" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  return (
    <header className="w-full bg-[#f2f2f4]">
      <div className="mx-auto flex max-w-[1520px] items-center justify-between px-9 py-4">
        <Link href="/">
          <Image
            src="/assets/logo.svg"
            alt="Crypto"
            width={119}
            height={22}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-semibold text-xs tracking-[0.1em] text-[#2a2a2a] uppercase transition-colors hover:text-[#39079e]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="rounded-full bg-[#39079e] px-8 py-3 text-xs font-semibold tracking-[0.1em] text-white uppercase transition-transform duration-200 hover:scale-[1.03] hover:bg-[#2d0680] hover:shadow-lg"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
