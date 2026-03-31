import { AnimatedBranchStroke } from "@/components/animated-branch-stroke";
import { AnimatedRings } from "@/components/animated-rings";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import type { CeremonyContent } from "@/data/site-content";

type CeremonySectionProps = {
  content: CeremonyContent;
};

export function CeremonySection({ content }: CeremonySectionProps) {
  return (
    <section id="cerimonia" className="section-wrap pt-24 sm:pt-28">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-10">
        <Reveal>
          <div className="max-w-xl">
            <div className="mb-6 flex items-center gap-4">
              <span className="rounded-full border border-line/70 bg-white/38 px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.34em] text-muted/75">
                Capitolo I
              </span>
              <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(92,73,60,0.2),transparent)]" />
            </div>

            <SectionHeading
              eyebrow={content.eyebrow}
              title={content.title}
              description={content.description}
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="paper-panel relative overflow-hidden rounded-[2.2rem] p-4 sm:p-5 md:rounded-[2.6rem]">
            <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.24),transparent_45%)]" />

            <div className="grid gap-4 md:grid-cols-[minmax(13rem,0.7fr)_minmax(0,1fr)]">
              <div className="relative isolate overflow-hidden rounded-[1.7rem] border border-line/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(251,246,238,0.58))] p-5 sm:p-6">
                <AnimatedRings
                  className="absolute left-1/2 top-1/2 w-[11.5rem] -translate-x-1/2 -translate-y-1/2 opacity-80 sm:w-[13rem]"
                  label={content.dateCard.month}
                  value={content.dateCard.year}
                />

                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <p className="eyebrow">{content.dateCard.weekday}</p>
                    <p className="text-[0.66rem] uppercase tracking-[0.34em] text-muted/70">
                      15:30
                    </p>
                  </div>

                  <p className="mt-8 font-serif text-[5.4rem] leading-none tracking-[-0.06em] text-ink sm:text-[6.4rem]">
                    {content.dateCard.day}
                  </p>

                  <div className="mt-5 rounded-full border border-line/60 bg-white/42 px-4 py-2 text-[0.68rem] uppercase tracking-[0.34em] text-muted/80">
                    Chiesa di S. Stefano
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {content.details.map((detail, index) => (
                  <div
                    key={detail.label}
                    className="relative overflow-hidden rounded-[1.7rem] border border-line/70 bg-white/42 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] sm:p-6"
                  >
                    <p className="text-[0.62rem] uppercase tracking-[0.34em] text-muted/65">
                      0{index + 1}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.28em] text-muted/85">
                      {detail.label}
                    </p>
                    <p className="mt-3 text-base leading-7 text-ink sm:text-[1.02rem]">
                      {detail.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-divider my-5 sm:my-6" />

            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <p className="px-2 text-sm leading-7 text-muted sm:px-1 sm:text-base">
                {content.note}
              </p>

              <div className="rounded-[1.2rem] border border-line/70 bg-white/40 px-4 py-3 text-right backdrop-blur-sm">
                <p className="text-[0.62rem] uppercase tracking-[0.34em] text-muted/70">
                  Mood
                </p>
                <p className="mt-2 font-serif text-[1.45rem] leading-none tracking-[-0.04em] text-ink">
                  raccolto
                </p>
              </div>
            </div>

            <AnimatedBranchStroke
              className="pointer-events-none absolute bottom-0 right-[-2%] h-28 w-[72%] opacity-60 sm:h-32"
              tone="bronze"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
