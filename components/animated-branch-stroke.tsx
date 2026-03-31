"use client";

import { motion, useReducedMotion } from "framer-motion";

type AnimatedBranchStrokeProps = {
  className?: string;
  mirrored?: boolean;
  tone?: "bronze" | "sage";
};

const strokeTones = {
  bronze: {
    main: "#A88B67",
    leaf: "rgba(168,139,103,0.34)",
  },
  sage: {
    main: "#6A7A61",
    leaf: "rgba(106,122,97,0.28)",
  },
} as const;

export function AnimatedBranchStroke({
  className,
  mirrored = false,
  tone = "bronze",
}: AnimatedBranchStrokeProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const currentTone = strokeTones[tone];

  return (
    <motion.svg
      viewBox="0 0 520 240"
      className={className}
      aria-hidden="true"
      fill="none"
      style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
      animate={prefersReducedMotion ? undefined : { y: [0, -5, 0] }}
      transition={
        prefersReducedMotion
          ? undefined
          : {
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }
      }
    >
      <motion.path
        d="M32 204C94 184 138 156 182 108C218 70 254 44 306 32C358 20 411 37 488 86"
        stroke={currentTone.main}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.35"
        initial={{ opacity: 0, pathLength: 0.14 }}
        whileInView={{ opacity: 0.95, pathLength: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M178 112C150 102 126 82 110 58"
        stroke={currentTone.main}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        initial={{ opacity: 0, pathLength: 0.16 }}
        whileInView={{ opacity: 0.9, pathLength: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 1.15, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M284 44C304 66 332 84 366 95"
        stroke={currentTone.main}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        initial={{ opacity: 0, pathLength: 0.16 }}
        whileInView={{ opacity: 0.9, pathLength: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 1.15, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M382 44C396 62 420 76 454 84"
        stroke={currentTone.main}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        initial={{ opacity: 0, pathLength: 0.16 }}
        whileInView={{ opacity: 0.9, pathLength: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 1.15, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
      />

      {[
        { cx: 110, cy: 56, rx: 14, ry: 6, rot: -22 },
        { cx: 148, cy: 88, rx: 13, ry: 5.6, rot: -44 },
        { cx: 364, cy: 95, rx: 12, ry: 5.5, rot: 18 },
        { cx: 454, cy: 84, rx: 13, ry: 5.8, rot: 12 },
      ].map((leaf, index) => (
        <motion.ellipse
          key={`${leaf.cx}-${leaf.cy}`}
          cx={leaf.cx}
          cy={leaf.cy}
          rx={leaf.rx}
          ry={leaf.ry}
          transform={`rotate(${leaf.rot} ${leaf.cx} ${leaf.cy})`}
          fill={currentTone.leaf}
          initial={{ opacity: 0, scale: 0.88 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, delay: 0.22 + index * 0.08 }}
        />
      ))}
    </motion.svg>
  );
}
