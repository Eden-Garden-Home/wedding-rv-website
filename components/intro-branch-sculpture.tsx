"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";

type IntroBranchSculptureProps = {
  className?: string;
  isOpen?: boolean;
  mirrored?: boolean;
  tone?: "bronze" | "sage";
};

const palettes = {
  bronze: {
    branchDark: "#5C4538",
    branchMid: "#8A6B56",
    branchLight: "#D9B58D",
    leafDark: "#5F7257",
    leafLight: "#B6C3AA",
    leafVein: "rgba(255, 246, 232, 0.52)",
    glow: "rgba(201, 163, 118, 0.34)",
    sparkle: "rgba(246, 231, 210, 0.65)",
  },
  sage: {
    branchDark: "#465244",
    branchMid: "#68775E",
    branchLight: "#C9B08C",
    leafDark: "#6F8568",
    leafLight: "#CDD7C4",
    leafVein: "rgba(243, 248, 238, 0.48)",
    glow: "rgba(132, 152, 123, 0.3)",
    sparkle: "rgba(236, 239, 228, 0.56)",
  },
} as const;

const twigPaths = [
  {
    d: "M154 230C118 212 86 184 56 146",
    delay: 0.16,
    width: 8,
  },
  {
    d: "M242 164C212 136 184 104 156 62",
    delay: 0.24,
    width: 7.5,
  },
  {
    d: "M356 106C392 126 424 152 450 190",
    delay: 0.34,
    width: 7,
  },
  {
    d: "M472 72C514 86 550 114 590 158",
    delay: 0.42,
    width: 7.5,
  },
  {
    d: "M564 88C610 106 644 132 678 178",
    delay: 0.5,
    width: 6.5,
  },
];

const leaves = [
  { cx: 74, cy: 126, rx: 26, ry: 10, rotate: -42, delay: 0.18, sway: 3.2 },
  { cx: 110, cy: 172, rx: 24, ry: 9.5, rotate: -20, delay: 0.28, sway: 2.8 },
  { cx: 160, cy: 64, rx: 30, ry: 11, rotate: -46, delay: 0.38, sway: 3.6 },
  { cx: 210, cy: 112, rx: 28, ry: 10, rotate: -18, delay: 0.46, sway: 2.9 },
  { cx: 432, cy: 190, rx: 28, ry: 10, rotate: 34, delay: 0.56, sway: 3.3 },
  { cx: 472, cy: 142, rx: 25, ry: 9, rotate: 14, delay: 0.66, sway: 2.7 },
  { cx: 594, cy: 156, rx: 28, ry: 10.5, rotate: 26, delay: 0.78, sway: 3.4 },
  { cx: 646, cy: 186, rx: 30, ry: 10.5, rotate: 44, delay: 0.88, sway: 3.1 },
];

const sparkles = [
  { cx: 124, cy: 188, radius: 3.8, delay: 0.4 },
  { cx: 276, cy: 126, radius: 2.8, delay: 1.4 },
  { cx: 520, cy: 108, radius: 3.4, delay: 0.9 },
  { cx: 618, cy: 176, radius: 2.6, delay: 1.7 },
];

export function IntroBranchSculpture({
  className,
  isOpen = false,
  mirrored = false,
  tone = "bronze",
}: IntroBranchSculptureProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const palette = palettes[tone];
  const id = useId().replace(/:/g, "");

  const branchGradientId = `intro-branch-gradient-${id}`;
  const highlightGradientId = `intro-branch-highlight-${id}`;
  const leafGradientId = `intro-leaf-gradient-${id}`;
  const glowFilterId = `intro-branch-glow-${id}`;
  const shadowFilterId = `intro-branch-shadow-${id}`;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={
        prefersReducedMotion
          ? { opacity: 1, scale: 1, y: 0 }
          : {
              opacity: 1,
              scale: 1,
              x: [0, 10, -7, 0],
              y: [0, -10, 6, 0],
              rotate: isOpen ? [-4, -1.5, -5.5, -4] : [-2.5, 0.5, -3.6, -2.5],
            }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
          : {
              duration: isOpen ? 10.5 : 13.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }
      }
    >
      <motion.div
        className="absolute inset-[16%_12%_20%_12%] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${palette.glow}, transparent 72%)`,
        }}
        animate={
          prefersReducedMotion
            ? { opacity: 0.55 }
            : {
                opacity: [0.36, 0.72, 0.42, 0.36],
                scale: [0.96, 1.08, 1.01, 0.96],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: isOpen ? 7.2 : 9.4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }
        }
      />

      <motion.svg
        viewBox="0 0 720 340"
        className="h-full w-full overflow-visible"
        aria-hidden="true"
        fill="none"
        style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
      >
        <defs>
          <linearGradient id={branchGradientId} x1="48" y1="290" x2="664" y2="66">
            <stop offset="0" stopColor={palette.branchDark} />
            <stop offset="0.56" stopColor={palette.branchMid} />
            <stop offset="1" stopColor={palette.branchLight} />
          </linearGradient>

          <linearGradient id={highlightGradientId} x1="96" y1="248" x2="652" y2="82">
            <stop offset="0" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="0.42" stopColor="rgba(255,244,225,0.9)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.06)" />
          </linearGradient>

          <radialGradient id={leafGradientId} cx="34%" cy="32%" r="78%">
            <stop offset="0" stopColor={palette.leafLight} />
            <stop offset="0.6" stopColor={palette.leafDark} />
            <stop offset="1" stopColor={palette.branchDark} />
          </radialGradient>

          <filter
            id={glowFilterId}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="10" />
          </filter>

          <filter
            id={shadowFilterId}
            x="-20%"
            y="-20%"
            width="150%"
            height="150%"
            colorInterpolationFilters="sRGB"
          >
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodOpacity="0.24" />
          </filter>
        </defs>

        <motion.path
          d="M40 290C120 270 182 234 242 170C286 122 342 80 412 54C496 24 584 42 684 104"
          stroke={palette.glow}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="28"
          filter={`url(#${glowFilterId})`}
          initial={{ opacity: 0, pathLength: 0.08 }}
          animate={{ opacity: 0.72, pathLength: 1 }}
          transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.path
          d="M40 290C120 270 182 234 242 170C286 122 342 80 412 54C496 24 584 42 684 104"
          stroke={`url(#${branchGradientId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="14"
          filter={`url(#${shadowFilterId})`}
          initial={{ opacity: 0, pathLength: 0.08 }}
          animate={{ opacity: 0.98, pathLength: 1 }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.path
          d="M42 286C120 264 180 228 242 170C286 126 342 86 412 60C494 32 578 48 678 108"
          stroke={`url(#${highlightGradientId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4.4"
          initial={{ opacity: 0, pathLength: 0.1 }}
          animate={{ opacity: 0.82, pathLength: 1 }}
          transition={{ duration: 1.25, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        />

        {twigPaths.map((twig) => (
          <motion.path
            key={twig.d}
            d={twig.d}
            stroke={`url(#${branchGradientId})`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={twig.width}
            initial={{ opacity: 0, pathLength: 0.16 }}
            animate={{ opacity: 0.95, pathLength: 1 }}
            transition={{
              duration: 0.94,
              delay: twig.delay,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}

        {twigPaths.map((twig) => (
          <motion.path
            key={`${twig.d}-highlight`}
            d={twig.d}
            stroke={`url(#${highlightGradientId})`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={Math.max(2.2, twig.width * 0.28)}
            initial={{ opacity: 0, pathLength: 0.2 }}
            animate={{ opacity: 0.7, pathLength: 1 }}
            transition={{
              duration: 0.98,
              delay: twig.delay + 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}

        {leaves.map((leaf) => (
          <motion.g
            key={`${leaf.cx}-${leaf.cy}`}
            initial={{ opacity: 0, scale: 0.82, y: 10 }}
            animate={
              prefersReducedMotion
                ? { opacity: 1, scale: 1, y: 0 }
                : {
                    opacity: 1,
                    scale: [1, 1.05, 1],
                    y: [0, -leaf.sway, 0],
                  }
            }
            transition={
              prefersReducedMotion
                ? {
                    duration: 0.54,
                    delay: leaf.delay,
                    ease: [0.22, 1, 0.36, 1],
                  }
                : {
                    opacity: {
                      duration: 0.42,
                      delay: leaf.delay,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    scale: {
                      duration: 4.2 + leaf.delay,
                      delay: leaf.delay,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                    y: {
                      duration: 5.1 + leaf.delay,
                      delay: leaf.delay,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                  }
            }
          >
            <ellipse
              cx={leaf.cx}
              cy={leaf.cy}
              rx={leaf.rx}
              ry={leaf.ry}
              transform={`rotate(${leaf.rotate} ${leaf.cx} ${leaf.cy})`}
              fill={`url(#${leafGradientId})`}
              filter={`url(#${shadowFilterId})`}
            />
            <ellipse
              cx={leaf.cx - 1}
              cy={leaf.cy - 1}
              rx={Math.max(leaf.rx * 0.54, 9)}
              ry={Math.max(leaf.ry * 0.28, 3)}
              transform={`rotate(${leaf.rotate} ${leaf.cx - 1} ${leaf.cy - 1})`}
              fill={palette.leafVein}
              opacity="0.7"
            />
          </motion.g>
        ))}

        {sparkles.map((sparkle) => (
          <motion.circle
            key={`${sparkle.cx}-${sparkle.cy}`}
            cx={sparkle.cx}
            cy={sparkle.cy}
            r={sparkle.radius}
            fill={palette.sparkle}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={
              prefersReducedMotion
                ? { opacity: 0.5, scale: 1 }
                : {
                    opacity: [0.12, 0.82, 0.18, 0.12],
                    scale: [0.72, 1.2, 0.9, 0.72],
                    y: [0, -5, 0],
                  }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.5, delay: sparkle.delay }
                : {
                    duration: 4.8 + sparkle.delay,
                    delay: sparkle.delay,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }
            }
          />
        ))}
      </motion.svg>
    </motion.div>
  );
}
