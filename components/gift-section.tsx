"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { AnimatedBranchStroke } from "@/components/animated-branch-stroke";
import { AnimatedRings } from "@/components/animated-rings";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import type { GiftContent, GiftOption } from "@/data/site-content";
import { hasConfiguredValue } from "@/lib/utils";

type GiftSectionProps = {
  content: GiftContent;
};

export function GiftSection({ content }: GiftSectionProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [activeOption, setActiveOption] = useState(content.defaultOption);
  const [feedback, setFeedback] = useState("");

  const selectedOption =
    content.options.find((option) => option.key === activeOption) ?? content.options[0];

  const handleCopy = async (option: Extract<GiftOption, { key: "iban" }>) => {
    if (!hasConfiguredValue(option.value)) {
      return;
    }

    try {
      await navigator.clipboard.writeText(option.value);
      setFeedback(content.copyFeedbackSuccess);
    } catch {
      setFeedback(content.copyFeedbackError);
    }

    window.setTimeout(() => {
      setFeedback("");
    }, 2400);
  };

  return (
    <section id="regalo" className="section-wrap pt-24 sm:pt-28">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:gap-10">
        <Reveal>
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="surface-panel relative overflow-hidden rounded-[2.1rem] p-4 sm:p-5 md:rounded-[2.5rem]">
            <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.28),transparent_45%)]" />
            <AnimatedRings
              className="absolute right-3 top-3 w-24 opacity-70 sm:right-5 sm:top-5 sm:w-28"
              tone="bronze"
              label="dono"
            />

            <div className="relative flex flex-wrap gap-2 rounded-full border border-line/70 bg-white/44 p-2">
              {content.options.map((option) => {
                const isActive = option.key === selectedOption.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setActiveOption(option.key)}
                    className={`relative rounded-full px-4 py-3 text-sm font-semibold ${
                      isActive ? "text-ink" : "text-muted"
                    }`}
                    aria-pressed={isActive}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="gift-pill"
                        className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(248,243,235,0.88))] shadow-[0_14px_24px_rgba(81,62,48,0.08)]"
                        transition={
                          prefersReducedMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 360, damping: 32 }
                        }
                      />
                    )}
                    <span className="relative">{option.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="paper-panel relative mt-4 overflow-hidden rounded-[1.8rem] p-6 sm:p-7">
              <AnimatedBranchStroke
                className="pointer-events-none absolute bottom-0 right-[-8%] h-24 w-[65%] opacity-55 sm:h-28"
                tone="bronze"
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedOption.key}
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative"
                >
                  <p className="eyebrow">{selectedOption.eyebrow}</p>
                  <h3 className="mt-4 font-serif text-[2.15rem] leading-[0.94] tracking-[-0.04em] text-ink sm:text-[2.7rem]">
                    {selectedOption.title}
                  </h3>
                  <p className="mt-4 max-w-[34rem] text-base leading-7 text-muted">
                    {selectedOption.description}
                  </p>

                  {selectedOption.key === "iban" ? (
                    <IbanCard
                      option={selectedOption}
                      onCopy={() => handleCopy(selectedOption)}
                      feedback={feedback}
                    />
                  ) : (
                    <RegistryCard option={selectedOption} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function IbanCard({
  option,
  onCopy,
  feedback,
}: {
  option: Extract<GiftOption, { key: "iban" }>;
  onCopy: () => void;
  feedback: string;
}) {
  const hasValue = hasConfiguredValue(option.value);

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="rounded-[1.7rem] border border-line/70 bg-white/48 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] sm:p-6">
        <p className="text-[0.62rem] uppercase tracking-[0.34em] text-muted/70">
          Coordinate
        </p>
        <p className="text-xs uppercase tracking-[0.28em] text-muted/85">
          {option.beneficiaryLabel}
        </p>
        <p className="mt-3 text-base leading-7 text-ink">{option.beneficiary}</p>

        <div className="section-divider my-5" />

        <p className="text-xs uppercase tracking-[0.28em] text-muted/85">{option.valueLabel}</p>
        <p className="mt-4 break-all font-medium leading-8 text-ink">
          {hasValue ? option.value : option.placeholder}
        </p>

        <p className="mt-4 text-sm leading-6 text-muted">{option.note}</p>
      </div>

      <div className="flex flex-col justify-between gap-3">
        <button
          type="button"
          onClick={onCopy}
          disabled={!hasValue}
          className="action-primary min-h-14 min-w-40 disabled:cursor-not-allowed disabled:border-line disabled:bg-white/60 disabled:text-muted disabled:shadow-none"
        >
          {option.copyLabel}
        </button>

        <div className="min-h-6 text-sm text-muted" aria-live="polite">
          {feedback}
        </div>
      </div>
    </div>
  );
}

function RegistryCard({
  option,
}: {
  option: Extract<GiftOption, { key: "registry" }>;
}) {
  const isConfigured = hasConfiguredValue(option.href);

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="rounded-[1.7rem] border border-line/70 bg-white/48 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] sm:p-6">
        <p className="text-[0.62rem] uppercase tracking-[0.34em] text-muted/70">
          Selezione
        </p>
        <p className="text-xs uppercase tracking-[0.28em] text-muted/85">{option.linkLabel}</p>
        <p className="mt-3 text-base leading-7 text-ink">
          {isConfigured ? option.linkDescription : option.placeholder}
        </p>
        <p className="mt-4 text-sm leading-6 text-muted">{option.note}</p>
      </div>

      {isConfigured ? (
        <a
          href={option.href}
          target="_blank"
          rel="noopener noreferrer"
          className="action-secondary min-h-14 min-w-40"
        >
          {option.ctaLabel}
        </a>
      ) : (
        <div className="action-secondary min-h-14 min-w-40 cursor-default text-muted">
          {option.ctaLabel}
        </div>
      )}
    </div>
  );
}
