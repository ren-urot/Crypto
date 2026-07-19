import Link from "next/link";

export default function TransferPage() {
  return (
    <section className="bg-[#f2f2f4] px-9 py-16">
      <div className="mx-auto max-w-[600px] rounded-[20px] bg-white p-8 text-center">
        <h2 className="font-semibold text-lg text-[#39079e]">Transfer</h2>
        <p className="mt-3 text-base leading-relaxed text-[#2d2d2d]">
          This demo uses a single unified balance for spot, trading, and any strategies you set
          up — there&apos;s no separate Funding/Trading/Earn account structure to move funds
          between, so nothing to transfer here.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/buy-crypto"
            className="rounded-full bg-[#39079e] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2d0680]"
          >
            Deposit
          </Link>
          <Link
            href="/withdraw"
            className="rounded-full border border-[#e5e5e5] px-6 py-2.5 text-sm font-semibold text-[#2a2a2a] hover:bg-[#f2f2f4]"
          >
            Withdraw
          </Link>
        </div>
      </div>
    </section>
  );
}
