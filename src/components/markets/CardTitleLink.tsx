import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function CardTitleLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 font-semibold text-[#39079e] hover:underline"
    >
      {children}
      <ChevronRight className="size-4" />
    </Link>
  );
}
