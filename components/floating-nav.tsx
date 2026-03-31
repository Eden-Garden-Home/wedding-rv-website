import type { NavigationItem } from "@/data/site-content";

type FloatingNavProps = {
  items: NavigationItem[];
};

export function FloatingNav({ items }: FloatingNavProps) {
  return (
    <nav
      aria-label="Navigazione della pagina"
      className="fixed inset-x-0 bottom-3 z-30 flex justify-center px-3 sm:bottom-4 sm:px-4"
    >
      <div className="surface-panel flex w-full max-w-[24rem] items-center gap-1 overflow-x-auto rounded-[1.35rem] px-1.5 py-1.5 shadow-[0_18px_36px_rgba(67,52,43,0.14)] sm:max-w-max sm:gap-2 sm:rounded-full sm:px-2 sm:py-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="min-w-0 flex-1 whitespace-nowrap rounded-[1rem] px-3 py-2.5 text-center text-[0.76rem] font-semibold tracking-[0.02em] text-ink/72 hover:bg-white/70 hover:text-ink sm:flex-none sm:rounded-full sm:px-4 sm:py-2 sm:text-sm"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
