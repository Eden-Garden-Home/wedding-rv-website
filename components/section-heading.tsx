type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  const alignment =
    align === "center"
      ? "mx-auto max-w-2xl text-center"
      : "max-w-xl text-left";

  return (
    <div className={`${alignment} ${className ?? ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 font-serif text-[2.9rem] leading-[0.92] tracking-[-0.04em] text-ink sm:text-[3.8rem]">
        {title}
      </h2>
      <p className="mt-5 text-[1rem] leading-7 text-muted sm:text-[1.05rem]">
        {description}
      </p>
    </div>
  );
}
