"use client";

import { motion, useReducedMotion } from "framer-motion";

const particles = [
  { left: "8%", top: "12%", delay: 0.2, duration: 12 },
  { left: "22%", top: "28%", delay: 0.9, duration: 14 },
  { left: "78%", top: "18%", delay: 0.5, duration: 11 },
  { left: "72%", top: "56%", delay: 1.1, duration: 15 },
  { left: "18%", top: "68%", delay: 0.3, duration: 13 },
  { left: "54%", top: "76%", delay: 1.4, duration: 12 },
];

export function AmbientBackdrop() {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-x-[-8%] top-[-5rem] h-[28rem] bg-[radial-gradient(circle_at_top,rgba(191,166,132,0.18),transparent_60%)] blur-3xl" />
      <div className="absolute left-[-8rem] top-[24rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(108,123,98,0.12),transparent_66%)] blur-3xl" />
      <div className="absolute right-[-10rem] top-[42rem] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(171,141,103,0.13),transparent_68%)] blur-3xl" />

      <div className="absolute inset-x-[8%] top-[38rem] h-px bg-[linear-gradient(90deg,transparent,rgba(127,106,85,0.12),transparent)]" />
      <div className="absolute inset-x-[16%] top-[89rem] h-px bg-[linear-gradient(90deg,transparent,rgba(127,106,85,0.12),transparent)]" />

      {particles.map((particle) => (
        <motion.span
          key={`${particle.left}-${particle.top}`}
          className="absolute h-1.5 w-1.5 rounded-full bg-[rgba(171,141,103,0.32)] blur-[0.4px]"
          style={{ left: particle.left, top: particle.top }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  y: [0, -18, 0],
                  opacity: [0.15, 0.65, 0.15],
                  scale: [1, 1.25, 1],
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </div>
  );
}
