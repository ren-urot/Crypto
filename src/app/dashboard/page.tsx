import PageHeader from "@/components/PageHeader";
import Dashboard from "@/components/dashboard/Dashboard";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your portfolio, holdings, and trading, all in one place."
      />
      <section className="bg-[#f2f2f4] px-9 pb-16">
        <div className="mx-auto max-w-[1228px]">
          <Dashboard />
        </div>
      </section>
    </>
  );
}
