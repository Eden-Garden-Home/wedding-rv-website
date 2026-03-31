import { AnimatedBranchStroke } from "@/components/animated-branch-stroke";
import { AnimatedRings } from "@/components/animated-rings";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import type { ReceptionContent } from "@/data/site-content";

type ReceptionSectionProps = {
  content: ReceptionContent;
};

export function ReceptionSection({ content }: ReceptionSectionProps) {
  return (
    <section id="ricevimento" className="section-wrap pt-24 sm:pt-28">
      <div className="paper-panel relative overflow-hidden rounded-[2.3rem] px-5 pb-6 pt-8 sm:px-8 sm:pb-9 sm:pt-10 md:rounded-[2.8rem]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_40%)]" />
        <div
          className="absolute inset-y-0 right-0 hidden w-[38%] bg-center bg-no-repeat opacity-14 md:block"
          style={{ backgroundImage: "url('/decor/branch-outline.svg')" }}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)] lg:gap-10">
          <Reveal>
            <div className="max-w-xl">
              <div className="mb-6 flex items-center gap-4">
                <span className="rounded-full border border-line/70 bg-white/38 px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.34em] text-muted/75">
                  Capitolo II
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
            <div className="grid gap-4">
              <div className="surface-panel relative overflow-hidden rounded-[1.9rem] p-6 sm:p-7">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(171,141,103,0.12),transparent_46%)]" />
                <AnimatedRings
                  className="absolute right-4 top-4 w-24 opacity-70 sm:w-28"
                  tone="bronze"
                  label="sera"
                />

                <div className="relative">
                  <p className="eyebrow">{content.venueLabel}</p>
                  <p className="mt-4 max-w-[12ch] font-serif text-[2.7rem] leading-[0.92] tracking-[-0.045em] text-ink sm:text-[3.4rem]">
                    {content.venue}
                  </p>
                  <p className="mt-4 max-w-[30rem] text-base leading-7 text-muted">
                    {content.venueDescription}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="surface-panel relative overflow-hidden rounded-[1.9rem] p-6 sm:p-7">
                  <p className="text-[0.62rem] uppercase tracking-[0.34em] text-muted/70">
                    Traccia
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.28em] text-muted/85">
                    {content.addressLabel}
                  </p>
                  <p className="mt-3 max-w-[28rem] text-base leading-7 text-ink">
                    {content.address}
                  </p>
                  <p className="mt-4 max-w-[28rem] text-sm leading-6 text-muted">
                    {content.logisticsNote}
                  </p>

                  <AnimatedBranchStroke
                    className="pointer-events-none absolute bottom-0 right-[-6%] h-24 w-[68%] opacity-55"
                    mirrored
                    tone="sage"
                  />
                </div>

                <a
                  href={content.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-secondary min-h-16 min-w-40 self-start px-6 text-center"
                >
                  {content.mapLabel}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
