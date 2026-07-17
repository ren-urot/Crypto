import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustedPartners from "@/components/TrustedPartners";
import WhyChoose from "@/components/WhyChoose";
import MarketSentiments from "@/components/MarketSentiments";
import InvestSmart from "@/components/InvestSmart";
import DetailedStats from "@/components/DetailedStats";
import GrowProfit from "@/components/GrowProfit";
import StartMining from "@/components/StartMining";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <Hero />
      <TrustedPartners />
      <WhyChoose />
      <MarketSentiments />
      <InvestSmart />
      <DetailedStats />
      <GrowProfit />
      <StartMining />
      <Footer />
    </div>
  );
}
