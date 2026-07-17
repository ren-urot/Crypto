import Reveal from "@/components/Reveal";
import Hero from "@/components/Hero";
import TrustedPartners from "@/components/TrustedPartners";
import WhyChoose from "@/components/WhyChoose";
import MarketSentiments from "@/components/MarketSentiments";
import InvestSmart from "@/components/InvestSmart";
import DetailedStats from "@/components/DetailedStats";
import GrowProfit from "@/components/GrowProfit";
import StartMining from "@/components/StartMining";

export default function Home() {
  return (
    <>
      <Hero />
      <Reveal>
        <TrustedPartners />
      </Reveal>
      <Reveal>
        <WhyChoose />
      </Reveal>
      <Reveal>
        <MarketSentiments />
      </Reveal>
      <Reveal>
        <InvestSmart />
      </Reveal>
      <Reveal>
        <DetailedStats />
      </Reveal>
      <Reveal>
        <GrowProfit />
      </Reveal>
      <Reveal>
        <StartMining />
      </Reveal>
    </>
  );
}
