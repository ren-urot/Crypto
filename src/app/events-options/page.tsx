import PageHeader from "@/components/PageHeader";
import EventsOptionsView from "@/components/events-options/EventsOptionsView";

export default function EventsOptionsPage() {
  return (
    <>
      <PageHeader
        title="Events & Options"
        description="Trade on crypto price movements with events and options."
      />
      <section className="bg-[#f2f2f4] px-4 md:px-9 py-16">
        <EventsOptionsView />
      </section>
    </>
  );
}
