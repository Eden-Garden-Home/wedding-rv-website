"use client";

import { motion, useReducedMotion } from "framer-motion";

type AnimatedRingsProps = {
  className?: string;
  tone?: "bronze" | "sage";
  label?: string;
  value?: string;
};

const toneClasses = {
  bronze: {
    stroke: "rgba(171,141,103,0.72)",
    soft: "rgba(171,141,103,0.12)",
    text: "text-bronze",
  },
  sage: {
    stroke: "rgba(102,122,93,0.72)",
    soft: "rgba(102,122,93,0.12)",
    text: "text-sage",
  },
} as const;

export function AnimatedRings({
  className,
  tone = "bronze",
  label,
  value,
}: AnimatedRingsProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const currentTone = toneClasses[tone];

  return (
    <motion.div
      className={`relative aspect-square ${className ?? ""}`}
      animate={
        prefersReducedMotion
          ? undefined
          : {
              rotate: [0, 5, 0],
              y: [0, -6, 0],
            }
      }
      transition={
        prefersReducedMotion
          ? undefined
          : {
              duration: 14,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }
      }
    >
      <div
        className="absolute inset-[11%] rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${currentTone.soft}, transparent 72%)` }}
      />

      <svg
        viewBox="0 0 220 220"
        className="relative h-full w-full"
        aria-hidden="true"
        fill="none"
      >
        {[98, 82, 65, 48, 31].map((radius, index) => (
          <motion.circle
            key={radius}
            cx="110"
            cy="110"
            r={radius}
            stroke={currentTone.stroke}
            strokeWidth={index === 0 ? 1.2 : 0.9}
            strokeDasharray={index % 2 === 0 ? "4 6" : "2 7"}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}

        <motion.path
          d="M110 20C139 26 165 43 181 69C196 92 201 119 195 146"
          stroke={currentTone.stroke}
          strokeWidth="1.1"
          strokeLinecap="round"
          initial={{ opacity: 0, pathLength: 0.2 }}
          whileInView={{ opacity: 1, pathLength: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.1, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d="M38 130C41 157 53 178 75 194C96 209 120 214 143 212"
          stroke={currentTone.stroke}
          strokeWidth="1.1"
          strokeLinecap="round"
          initial={{ opacity: 0, pathLength: 0.2 }}
          whileInView={{ opacity: 1, pathLength: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.1, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        />

        <circle cx="110" cy="110" r="4.6" fill={currentTone.stroke} />
        <circle cx="176" cy="74" r="2.6" fill={currentTone.stroke} />
        <circle cx="56" cy="158" r="2.3" fill={currentTone.stroke} />
      </svg>

      {(label || value) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {label && (
            <p className={`text-[0.58rem] uppercase tracking-[0.34em] ${currentTone.text}`}>
              {label}
            </p>
          )}
          {value && (
            <p className="mt-2 font-serif text-[1.55rem] leading-none tracking-[-0.05em] text-ink">
              {value}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
