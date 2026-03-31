"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { startTransition, useEffect, useState } from "react";
import { IntroBranchSculpture } from "@/components/intro-branch-sculpture";
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
    }, 420);

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

  const completeIntro = () => {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    setPhase("done");
  };

  const handleEnter = () => {
    if (phase !== "open") {
      return;
    }

    if (prefersReducedMotion) {
      completeIntro();
      return;
    }

    startTransition(() => {
      setPhase("transitioning");
    });
  };

  const isClosed = phase === "closed";
  const isLetterOpen = phase !== "closed";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 overflow-hidden bg-[linear-gradient(180deg,#f7f1e8,#f1ebe2)]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-[url('/textures/paper-grain.svg')] opacity-30" />
        <div
          className="pointer-events-none absolute left-[-14%] top-[-8%] h-[40rem] w-[20rem] bg-top bg-contain bg-no-repeat opacity-[0.15] mix-blend-multiply sm:h-[48rem] sm:w-[24rem] md:left-[-10%] md:top-[-10%] md:h-[58rem] md:w-[29rem]"
          style={{ backgroundImage: "url('/decor/branch-outline.svg')" }}
        />
        <div
          className="pointer-events-none absolute bottom-[-14%] right-[-12%] h-[42rem] w-[20rem] scale-x-[-1] bg-bottom bg-contain bg-no-repeat opacity-[0.14] mix-blend-multiply sm:h-[50rem] sm:w-[25rem] md:bottom-[-18%] md:right-[-8%] md:h-[60rem] md:w-[30rem]"
          style={{ backgroundImage: "url('/decor/branch-outline.svg')" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[8%] hidden h-[24rem] w-[18rem] -translate-x-1/2 bg-center bg-contain bg-no-repeat opacity-[0.08] mix-blend-soft-light lg:block"
          style={{ backgroundImage: "url('/decor/branch-outline.svg')" }}
        />

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

            <div className="relative isolate">
              <IntroBranchSculpture
                className="pointer-events-none absolute -bottom-12 right-[-18%] z-0 h-[8.75rem] w-[126%] opacity-95 sm:-bottom-14 sm:h-[10rem] md:-bottom-18 md:right-[-20%] md:h-[13rem] md:w-[134%]"
                mirrored
                tone="sage"
                isOpen={isLetterOpen}
              />
              <IntroBranchSculpture
                className="pointer-events-none absolute -top-12 left-[-16%] z-30 h-[8rem] w-[122%] sm:-top-14 sm:h-[9rem] md:-top-20 md:left-[-18%] md:h-[12.5rem] md:w-[130%]"
                tone="bronze"
                isOpen={isLetterOpen}
              />

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
                className="paper-panel relative z-10 mx-auto w-full max-w-[23.25rem] overflow-visible rounded-[1.65rem] p-2.5 shadow-[0_24px_64px_rgba(69,54,43,0.14)] md:max-w-[38rem] md:rounded-[2.5rem] md:p-5"
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
                      aria-label={phase === "closed" ? intro.openHint : intro.enterLabel}
                      className="relative block h-[22rem] w-full overflow-visible rounded-[1.2rem] focus:outline-none md:h-[28rem] md:rounded-[1.8rem]"
                      animate={
                        isClosed
                          ? prefersReducedMotion
                            ? { scale: 1, y: 0 }
                            : {
                                scale: [1, 1.015, 1],
                                y: [0, -4, 0],
                                rotate: [0.6, -0.8, 0.6],
                              }
                          : { scale: 1.025, y: -8, rotate: -1.4 }
                      }
                      transition={
                        isClosed
                          ? prefersReducedMotion
                            ? { duration: 0.2 }
                            : {
                                duration: 6.4,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                              }
                          : {
                              type: "spring",
                              stiffness: 150,
                              damping: 20,
                              mass: 0.92,
                            }
                      }
                    >
                      <motion.div
                        className="pointer-events-none absolute inset-x-[16%] bottom-[-1rem] h-7 rounded-full bg-[radial-gradient(circle,rgba(93,67,49,0.26),transparent_74%)] blur-xl md:bottom-[-1.15rem] md:h-9"
                        animate={
                          isClosed
                            ? prefersReducedMotion
                              ? { opacity: 0.28, scaleX: 1 }
                              : {
                                  opacity: [0.24, 0.34, 0.24],
                                  scaleX: [0.96, 1.04, 0.96],
                                }
                            : { opacity: 0.4, scaleX: 1.12, y: 4 }
                        }
                        transition={
                          isClosed
                            ? prefersReducedMotion
                              ? undefined
                              : {
                                  duration: 5.8,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "easeInOut",
                                }
                            : {
                                type: "spring",
                                stiffness: 150,
                                damping: 18,
                              }
                        }
                      />
                      <motion.div
                        className="pointer-events-none absolute inset-y-[10%] left-[-24%] w-[34%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.56),transparent)] blur-xl"
                        animate={
                          isClosed && !prefersReducedMotion
                            ? {
                                x: ["0%", "178%", "178%"],
                                opacity: [0, 0.78, 0],
                              }
                            : { opacity: 0, x: "178%" }
                        }
                        transition={
                          isClosed && !prefersReducedMotion
                            ? {
                                duration: 4.8,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatDelay: 1.4,
                                ease: "easeInOut",
                              }
                            : { duration: 0.35 }
                        }
                      />
                      <div className="intro-envelope-shell absolute inset-[-0.28rem] rounded-[1.35rem] md:inset-[-0.38rem] md:rounded-[2rem]" />
                      <div className="intro-envelope-outline absolute inset-0 rounded-[inherit]" />
                      <div className="intro-envelope-core absolute inset-0 rounded-[inherit]" />
                      <div className="absolute inset-[0.38rem] rounded-[0.95rem] border border-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] md:rounded-[1.55rem]" />

                      <motion.div
                        className="intro-letter-sheet absolute inset-x-2.5 top-2.5 bottom-3 rounded-[1rem] px-4 pb-5 pt-11 text-left md:inset-x-6 md:top-6 md:bottom-6 md:rounded-[1.45rem] md:px-8 md:pb-8 md:pt-14"
                        animate={
                          isClosed
                            ? { y: 34, scale: 0.968, rotateX: -16, rotateZ: -1.2 }
                            : { y: -66, scale: 1.02, rotateX: 0, rotateZ: 0.6 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 128,
                          damping: 18,
                          mass: 0.94,
                        }}
                      >
                        <div className="absolute inset-0 rounded-[inherit] bg-[url('/textures/paper-grain.svg')] opacity-22" />
                        <div className="absolute inset-x-5 top-5 flex items-center gap-3 md:inset-x-8 md:top-7">
                          <div className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(184,152,120,0.48),rgba(227,212,193,0.08))]" />
                          <p className="font-serif text-[0.62rem] uppercase tracking-[0.44em] text-[#9f8267] md:text-[0.68rem]">
                            V R
                          </p>
                          <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(227,212,193,0.08),rgba(184,152,120,0.48),transparent)]" />
                        </div>

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
                        className="intro-envelope-flap absolute inset-x-0 top-0 h-[56%] origin-top rounded-t-[inherit]"
                        style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                        animate={
                          isClosed
                            ? { rotateX: 0, y: 0, scaleY: 1, opacity: 1 }
                            : { rotateX: -174, y: -10, scaleY: 0.98, opacity: 0.98 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 140,
                          damping: 18,
                          mass: 0.88,
                        }}
                      />

                      <motion.div
                        className="intro-envelope-pocket absolute inset-x-0 bottom-0 h-[72%] rounded-b-[inherit]"
                        style={{
                          clipPath:
                            "polygon(0 12%, 50% 42%, 100% 12%, 100% 100%, 0 100%)",
                        }}
                        animate={isClosed ? { y: 0 } : { y: 5 }}
                        transition={{
                          type: "spring",
                          stiffness: 150,
                          damping: 20,
                          mass: 0.9,
                        }}
                      />

                      <motion.div
                        className="wax-seal absolute left-1/2 top-[42%] z-20 flex h-[4.2rem] w-[4.2rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center md:h-[4.8rem] md:w-[4.8rem]"
                        animate={
                          isClosed
                            ? { scale: [1, 1.045, 1], rotate: [-2, 1.8, -2] }
                            : { scale: 0.74, y: -44, opacity: 0.48, rotate: 16 }
                        }
                        transition={
                          phase === "closed"
                            ? {
                                duration: 3.4,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                              }
                            : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                        }
                      >
                        <span className="wax-seal__monogram font-serif text-[0.98rem] tracking-[0.34em] text-[#f7ded1] md:text-[1.08rem]">
                          V R
                        </span>
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
