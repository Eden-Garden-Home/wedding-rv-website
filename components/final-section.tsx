import { AnimatedBranchStroke } from "@/components/animated-branch-stroke";
import { AnimatedRings } from "@/components/animated-rings";
import { Reveal } from "@/components/reveal";
import type { Couple, FinaleContent } from "@/data/site-content";

type FinalSectionProps = {
  content: FinaleContent;
  couple: Couple;
};

export function FinalSection({ content, couple }: FinalSectionProps) {
  return (
    <footer id="finale" className="section-wrap pt-24 sm:pt-28">
      <Reveal>
        <div className="paper-panel relative overflow-hidden rounded-[2.4rem] px-6 py-12 text-center sm:px-10 sm:py-16 md:rounded-[2.9rem]">
          <div
            className="absolute inset-0 bg-center bg-no-repeat opacity-[0.12]"
            style={{ backgroundImage: "url('/decor/branch-outline.svg')" }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.48),transparent_34%)]" />

          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto w-fit rounded-full border border-line/70 bg-white/42 px-4 py-2 text-[0.68rem] uppercase tracking-[0.34em] text-muted/80">
              Ultimo capitolo
            </div>

            <AnimatedRings
              className="mx-auto mt-6 w-28 sm:w-32"
              label="finale"
              value="V + R"
            />

            <p className="eyebrow mt-6">{content.eyebrow}</p>
            <h2 className="mt-5 font-serif text-[3rem] leading-[0.9] tracking-[-0.05em] text-ink sm:text-[4.5rem]">
              {content.title}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[1.02rem] leading-8 text-muted sm:text-[1.08rem]">
              {content.description}
            </p>
            <div className="section-divider mx-auto mt-9 max-w-md" />
            <p className="mt-8 text-sm uppercase tracking-[0.3em] text-muted">
              {couple.partnerOne} / {couple.partnerTwo}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">{content.signature}</p>
          </div>

          <AnimatedBranchStroke
            className="pointer-events-none absolute bottom-0 left-1/2 h-28 w-[74%] -translate-x-1/2 opacity-55 sm:h-32"
            tone="bronze"
          />
        </div>
      </Reveal>
    </footer>
  );
}
