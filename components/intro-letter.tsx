"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { startTransition, useEffect, useState } from "react";
import type { Couple, IntroContent } from "@/data/site-content";

type IntroLetterProps = {
  intro: IntroContent;
  couple: Couple;
};

const INTRO_STORAGE_KEY = "rv-wedding-intro-complete";

export function IntroLetter({ intro, couple }: IntroLetterProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<"loading" | "closed" | "open" | "transitioning" | "done">(
    "loading",
  );
  const [showLetterCopy, setShowLetterCopy] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const hasSeenIntro = window.sessionStorage.getItem(INTRO_STORAGE_KEY) === "1";
      setPhase(hasSeenIntro ? "done" : "closed");
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (phase === "done") {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "open" || prefersReducedMotion) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowLetterCopy(true);
    }, 260);

    return () => window.clearTimeout(timer);
  }, [phase, prefersReducedMotion]);

  useEffect(() => {
    if (phase !== "transitioning") {
      return;
    }

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
      setPhase("done");
    }, prefersReducedMotion ? 180 : 1180);

    return () => window.clearTimeout(timer);
  }, [phase, prefersReducedMotion]);

  if (phase === "loading" || phase === "done") {
    return null;
  }

  const handleOpen = () => {
    if (phase !== "closed") {
      return;
    }

    setShowLetterCopy(prefersReducedMotion);
    setPhase("open");
  };

  const handleSkip = () => {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    setPhase("done");
  };

  const handleEnter = () => {
    if (phase !== "open") {
      return;
    }

    if (prefersReducedMotion) {
      handleSkip();
      return;
    }

    startTransition(() => {
      setPhase("transitioning");
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 overflow-hidden bg-[linear-gradient(180deg,#f7f1e8,#f1ebe2)]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-[url('/textures/paper-grain.svg')] opacity-30" />

        <motion.div
          className="absolute left-[8%] top-[18%] hidden h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(171,141,103,0.18),transparent_68%)] blur-3xl md:block"
          animate={prefersReducedMotion ? undefined : { y: [-10, 12, -10] }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
          }
        />
        <motion.div
          className="absolute bottom-[12%] right-[6%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(95,109,87,0.16),transparent_70%)] blur-3xl"
          animate={prefersReducedMotion ? undefined : { y: [14, -10, 14] }}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
          }
        />

        <button
          type="button"
          onClick={handleSkip}
          className="absolute right-3 top-3 rounded-full border border-white/45 bg-white/78 px-3.5 py-2 text-[0.82rem] font-semibold text-muted shadow-[0_10px_24px_rgba(84,65,50,0.08)] backdrop-blur md:right-8 md:top-8 md:px-4 md:py-2 md:text-sm"
        >
          {intro.skipLabel}
        </button>

        <div className="section-wrap flex min-h-screen items-start pb-8 pt-20 sm:items-center sm:py-14">
          <div className="grid w-full items-start gap-6 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] md:items-center md:gap-16">
            <div className="hidden md:block">
              <p className="eyebrow">{intro.sceneEyebrow}</p>
              <h1 className="mt-5 max-w-md font-serif text-[4.6rem] leading-[0.9] tracking-[-0.05em] text-ink">
                {intro.sceneTitle}
              </h1>
              <p className="mt-6 max-w-md text-lg leading-8 text-muted">
                {intro.sceneDescription}
              </p>
              <div className="section-divider mt-8 max-w-sm" />
              <p className="mt-6 text-sm uppercase tracking-[0.28em] text-muted/90">
                {couple.partnerOne} / {couple.partnerTwo}
              </p>
            </div>

            <div className="relative">
              <div className="mb-5 text-center md:hidden">
                <p className="eyebrow">{couple.partnerOne} / {couple.partnerTwo}</p>
                <p className="mt-3 font-serif text-[2.5rem] leading-[0.94] tracking-[-0.04em] text-ink">
                  {intro.sceneEyebrow}
                </p>
                <p className="mx-auto mt-3 max-w-[20rem] text-[0.95rem] leading-6 text-muted">
                  {intro.closedDescription}
                </p>
              </div>

              <motion.div
                className="paper-panel relative mx-auto w-full max-w-[23.25rem] overflow-visible rounded-[1.65rem] p-2.5 shadow-[0_24px_64px_rgba(69,54,43,0.14)] md:max-w-[38rem] md:rounded-[2.5rem] md:p-5"
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="absolute -right-4 top-8 hidden h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(123,135,113,0.16),transparent_72%)] blur-2xl md:block" />
                <div className="absolute left-1/2 top-5 hidden h-px w-20 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(92,73,60,0.2),transparent)] md:block" />

                <div className="relative rounded-[1.45rem] border border-line/60 bg-[linear-gradient(180deg,rgba(255,250,243,0.82),rgba(250,244,235,0.78))] px-3.5 pb-3.5 pt-4 md:rounded-[2rem] md:px-7 md:pb-7 md:pt-8">
                  <div className="absolute inset-0 rounded-[inherit] bg-[url('/textures/paper-grain.svg')] opacity-30" />
                  <div className="absolute inset-x-[12%] top-3 h-px bg-[linear-gradient(90deg,transparent,rgba(92,73,60,0.18),transparent)]" />

                  <div className="[perspective:1800px]">
                    <motion.button
                      type="button"
                      onClick={handleOpen}
                      aria-expanded={phase !== "closed"}
                      className="relative block h-[22rem] w-full overflow-visible rounded-[1.2rem] focus:outline-none md:h-[28rem] md:rounded-[1.8rem]"
                      animate={phase === "open" ? { scale: 1.01 } : { scale: 1 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="paper-panel absolute inset-0 rounded-[inherit] border border-line/70" />

                      <motion.div
                        className="paper-panel absolute inset-x-2.5 top-2.5 bottom-3 rounded-[1rem] px-4 py-5 text-left md:inset-x-6 md:top-6 md:bottom-6 md:rounded-[1.45rem] md:px-8 md:py-8"
                        animate={
                          phase === "closed"
                            ? { y: 30, scale: 0.992 }
                            : { y: -46, scale: 1 }
                        }
                        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="absolute inset-0 rounded-[inherit] bg-[url('/textures/paper-grain.svg')] opacity-25" />

                        <div className="relative">
                          <AnimatePresence initial={false}>
                            {showLetterCopy && (
                              <motion.div
                                key="letter-copy"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                              >
                                <p className="eyebrow">{intro.letter.eyebrow}</p>
                                <h2 className="mt-4 max-w-[14rem] font-serif text-[2.05rem] leading-[0.94] tracking-[-0.04em] text-ink md:max-w-[23rem] md:text-[3rem]">
                                  {intro.letter.title}
                                </h2>
                                <p className="mt-4 max-w-[14rem] text-[0.92rem] leading-6 text-muted md:max-w-[24rem] md:text-[1.02rem] md:leading-7">
                                  {intro.letter.body}
                                </p>
                                <p className="mt-6 text-[0.72rem] uppercase tracking-[0.24em] text-muted md:mt-8 md:text-sm">
                                  {intro.letter.signature}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>

                      <motion.div
                        className="paper-panel absolute inset-x-0 top-0 h-[56%] origin-top rounded-t-[inherit] border border-line/70"
                        style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                        animate={
                          phase === "closed"
                            ? { rotateX: 0, opacity: 1 }
                            : { rotateX: -178, opacity: 0.98 }
                        }
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      />

                      <div
                        className="paper-panel absolute inset-x-0 bottom-0 h-[72%] rounded-b-[inherit] border border-line/70"
                        style={{
                          clipPath:
                            "polygon(0 12%, 50% 42%, 100% 12%, 100% 100%, 0 100%)",
                        }}
                      />

                      <motion.div
                        className="absolute left-1/2 top-[42%] z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#7b6755]/20 bg-[radial-gradient(circle_at_35%_35%,#d8c2a2,#9f7658_60%,#795340)] shadow-[0_16px_32px_rgba(96,63,40,0.28)] md:h-16 md:w-16"
                        animate={
                          phase === "closed"
                            ? { scale: [1, 1.03, 1] }
                            : { scale: 0.88, y: -36, opacity: 0.8 }
                        }
                        transition={
                          phase === "closed"
                            ? {
                                duration: 2.8,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                              }
                            : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                        }
                      >
                        <span className="h-7 w-7 rounded-full border border-white/28 bg-[radial-gradient(circle,rgba(255,255,255,0.5),transparent_70%)]" />
                      </motion.div>
                    </motion.button>
                  </div>

                  <div className="relative mt-4 flex flex-col items-center gap-2 px-1 text-center md:mt-7 md:gap-3 md:px-2">
                    <p className="text-[0.82rem] font-semibold uppercase tracking-[0.22em] text-muted md:text-sm md:tracking-[0.28em]">
                      {phase === "closed" ? intro.closedHint : intro.openHint}
                    </p>
                    <p className="max-w-[18rem] text-[0.95rem] leading-6 text-muted/92 md:max-w-[26rem] md:text-[0.95rem]">
                      {phase === "closed" ? intro.closedDescription : intro.openDescription}
                    </p>

                    {phase === "open" && (
                      <motion.button
                        type="button"
                        onClick={handleEnter}
                        className="action-primary mt-2 w-full"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {intro.enterLabel}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {phase === "transitioning" && (
            <motion.div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 1, 0] }}
              transition={{ duration: 1.12, times: [0, 0.72, 1], ease: "easeInOut" }}
            >
              <motion.div
                className="paper-panel relative h-full w-full overflow-hidden"
                initial={{ scale: 0.46, borderRadius: "2.6rem" }}
                animate={{ scale: 1, borderRadius: "0rem" }}
                transition={{ duration: 1.05, ease: [0.19, 1, 0.22, 1] }}
              >
                <div className="absolute inset-0 bg-[url('/textures/paper-grain.svg')] opacity-35" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_44%)]" />
                <div
                  className="absolute inset-y-0 right-0 hidden w-[42vw] bg-center bg-no-repeat opacity-22 md:block"
                  style={{ backgroundImage: "url('/decor/branch-outline.svg')" }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
