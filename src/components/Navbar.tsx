import Image from "next/image";

const NAV_LINKS = ["Products", "Features", "About", "Contact"];

export default function Navbar() {
  return (
    <header className="w-full bg-[#f2f2f4]">
      <div className="mx-auto flex max-w-[1520px] items-center justify-between px-9 py-4">
        <Image
          src="/assets/logo.svg"
          alt="Crypto"
          width={119}
          height={22}
          priority
        />

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="font-semibold text-xs tracking-[0.1em] text-[#2a2a2a] uppercase hover:text-[#39079e]"
            >
              {link}
            </a>
          ))}
        </nav>

        <a
          href="#"
          className="rounded-full bg-[#39079e] px-8 py-3 text-xs font-semibold tracking-[0.1em] text-white uppercase hover:bg-[#2d0680]"
        >
          Login
        </a>
      </div>
    </header>
  );
}
