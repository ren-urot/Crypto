import Image from "next/image";
import Link from "next/link";

const MAIN_LINKS = [
  { label: "Products", href: "/products" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
const OTHER_LINKS = [
  { label: "Terms", href: "/terms" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

function PaymentCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex h-[75px] w-[141px] items-center justify-center rounded-xl bg-white ${className}`}
    >
      {children}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#f2f2f4]">
      <div className="border-t border-[#e5e5e5]" />

      <div className="mx-auto grid max-w-[1520px] grid-cols-2 gap-x-8 gap-y-12 px-9 py-16 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Image
            src="/assets/footer/logo-footer.svg"
            alt="Crypto"
            width={119}
            height={22}
          />
        </div>

        <div>
          <h3 className="font-semibold text-lg text-[#2a2a2a]">Main</h3>
          <ul className="mt-5 space-y-3">
            {MAIN_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-[#2a2a2a] hover:text-[#39079e]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-[#2a2a2a]">Others</h3>
          <ul className="mt-5 space-y-3">
            {OTHER_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-[#2a2a2a] hover:text-[#39079e]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1">
          <h3 className="font-semibold text-xl leading-tight text-[#2a2a2a]">
            We accept following
            <br />
            payment systems
          </h3>
          <div className="mt-6 flex gap-4">
            <PaymentCard>
              <Image
                src="/assets/footer/visa.svg"
                alt="Visa"
                width={79}
                height={25}
              />
            </PaymentCard>
            <PaymentCard>
              <Image
                src="/assets/footer/mastercard.svg"
                alt="Mastercard"
                width={51}
                height={40}
              />
            </PaymentCard>
            <PaymentCard>
              <div className="relative size-11">
                <Image
                  src="/assets/footer/bitcoin-1.svg"
                  alt=""
                  fill
                  className="object-contain"
                />
                <Image
                  src="/assets/footer/bitcoin-2.svg"
                  alt="Bitcoin"
                  fill
                  className="object-contain"
                />
              </div>
            </PaymentCard>
          </div>
        </div>
      </div>

      <div className="bg-white py-6 text-center text-xs text-[#787878]">
        © {new Date().getFullYear()} Crypto. All rights Reserved.
      </div>
    </footer>
  );
}
