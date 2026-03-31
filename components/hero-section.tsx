import { AnimatedBranchStroke } from "@/components/animated-branch-stroke";
import { AnimatedRings } from "@/components/animated-rings";
import { Reveal } from "@/components/reveal";
import type { Couple, HeroContent } from "@/data/site-content";

type HeroSectionProps = {
  couple: Couple;
  content: HeroContent;
};

const motifs = ["Radici", "Luce", "Futuro"];

export function HeroSection({ couple, content }: HeroSectionProps) {
  return (
    <section id="hero" className="section-wrap pt-16 sm:pt-24">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)] lg:gap-8">
        <Reveal>
          <div className="paper-panel relative overflow-hidden rounded-[1.95rem] px-5 pb-6 pt-7 sm:px-9 sm:pb-10 sm:pt-10 md:rounded-[2.8rem]">
            <div className="absolute inset-0 bg-[url('/textures/paper-grain.svg')] opacity-24" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.6),transparent_34%)]" />
            <div
              className="absolute -right-10 top-0 hidden h-full w-[44%] bg-center bg-no-repeat opacity-15 md:block"
              style={{ backgroundImage: "url('/decor/branch-outline.svg')" }}
            />

            <div className="relative">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="eyebrow">{content.eyebrow}</p>
                  <p className="mt-6 text-sm uppercase tracking-[0.28em] text-muted/85">
                    {couple.partnerOne} / {couple.partnerTwo}
                  </p>
                </div>

                <div className="hidden items-start gap-4 sm:flex">
                  <div className="pt-5 text-right">
                    <p className="text-[0.65rem] uppercase tracking-[0.36em] text-muted/75">
                      Capitolo
                    </p>
                    <p className="mt-2 font-serif text-[2rem] leading-none tracking-[-0.05em] text-ink">
                      I
                    </p>
                  </div>
                  <AnimatedRings
                    className="w-28 shrink-0 sm:w-32"
                    label="22 maggio"
                    value="2027"
                  />
                </div>
              </div>

              <h1 className="mt-4 max-w-[12ch] font-serif text-[3.45rem] leading-[0.9] tracking-[-0.055em] text-ink sm:text-[5.4rem] lg:text-[6.6rem]">
                {content.title}
              </h1>

              <p className="mt-5 max-w-[36rem] text-[0.98rem] leading-7 text-muted sm:mt-6 sm:text-[1.08rem] sm:leading-8">
                {content.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={content.primaryCta.href} className="action-primary">
                  {content.primaryCta.label}
                </a>
                <a href={content.secondaryCta.href} className="action-secondary">
                  {content.secondaryCta.label}
                </a>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div className="grid gap-2 sm:grid-cols-3">
                  {motifs.map((motif, index) => (
                    <div
                      key={motif}
                      className="rounded-[1.15rem] border border-line/70 bg-white/36 px-4 py-3 backdrop-blur-md"
                    >
                      <p className="text-[0.62rem] uppercase tracking-[0.34em] text-muted/70">
                        0{index + 1}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-ink">{motif}</p>
                    </div>
                  ))}
                </div>

                <div className="hidden h-px w-20 bg-[linear-gradient(90deg,rgba(92,73,60,0.28),transparent)] sm:block" />
              </div>

              <div className="section-divider mt-10" />

              <div className="mt-6 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <p className="max-w-md text-sm leading-7 text-muted/90 sm:text-base">
                  {content.note}
                </p>

                <div className="rounded-full border border-line/70 bg-white/45 px-4 py-2 text-[0.68rem] uppercase tracking-[0.32em] text-muted/80">
                  Editorial single page
                </div>
              </div>
            </div>

            <AnimatedBranchStroke
              className="pointer-events-none absolute -bottom-6 right-[-3%] h-32 w-[78%] opacity-70 md:h-40"
              tone="bronze"
            />
          </div>
        </Reveal>

        <div className="grid gap-6">
          <Reveal delay={0.08}>
            <div className="surface-panel relative overflow-hidden rounded-[1.8rem] p-5 sm:rounded-[2rem] sm:p-7">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.32),transparent_48%)]" />
              <AnimatedRings
                className="absolute right-3 top-3 w-24 opacity-75 sm:right-5 sm:top-5 sm:w-28"
                tone="sage"
                label="giorno"
              />

              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <p className="eyebrow">Il giorno</p>
                  <p className="text-[0.68rem] uppercase tracking-[0.36em] text-muted/70">
                    Overview
                  </p>
                </div>

                <p className="mt-4 max-w-[12ch] font-serif text-[2.7rem] leading-[0.92] tracking-[-0.045em] text-ink sm:mt-5 sm:text-[4rem]">
                  {content.summaryTitle}
                </p>

                <div className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-4">
                  {content.summaryDetails.map((detail) => (
                    <div
                      key={detail.label}
                      className="rounded-[1.35rem] border border-line/70 bg-white/42 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.46)] sm:rounded-[1.5rem]"
                    >
                      <p className="text-xs uppercase tracking-[0.28em] text-muted/85">
                        {detail.label}
                      </p>
                      <p className="mt-3 text-base leading-7 text-ink">{detail.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="surface-panel relative overflow-hidden rounded-[1.8rem] p-5 sm:rounded-[2rem] sm:p-7">
              <div className="absolute inset-y-0 right-0 w-[38%] bg-[radial-gradient(circle_at_center,rgba(171,141,103,0.1),transparent_72%)]" />

              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <p className="eyebrow">{content.quoteEyebrow}</p>
                  <p className="font-serif text-[2.4rem] leading-none text-bronze/55">“</p>
                </div>

                <blockquote className="mt-4 max-w-[22rem] font-serif text-[2rem] leading-[0.96] tracking-[-0.045em] text-ink sm:text-[2.8rem]">
                  {content.quote}
                </blockquote>
                <p className="mt-5 max-w-[25rem] text-sm leading-7 text-muted sm:text-base">
                  {content.quoteNote}
                </p>
              </div>

              <AnimatedBranchStroke
                className="pointer-events-none absolute bottom-0 right-[-5%] h-28 w-[74%] opacity-60"
                mirrored
                tone="sage"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
