import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { CeremonySection } from "@/components/ceremony-section";
import { FinalSection } from "@/components/final-section";
import { FloatingNav } from "@/components/floating-nav";
import { GiftSection } from "@/components/gift-section";
import { HeroSection } from "@/components/hero-section";
import { IntroLetter } from "@/components/intro-letter";
import { ReceptionSection } from "@/components/reception-section";
import { siteContent } from "@/data/site-content";

export default function Home() {
  return (
    <>
      <IntroLetter intro={siteContent.intro} couple={siteContent.couple} />
      <FloatingNav items={siteContent.navigation} />

      <main className="relative pb-32 pt-6 sm:pt-8">
        <AmbientBackdrop />

        <HeroSection couple={siteContent.couple} content={siteContent.hero} />
        <CeremonySection content={siteContent.ceremony} />
        <ReceptionSection content={siteContent.reception} />
        <GiftSection content={siteContent.gift} />
        <FinalSection content={siteContent.finale} couple={siteContent.couple} />
      </main>
    </>
  );
}
