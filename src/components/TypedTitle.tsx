import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";

const FULL = t.welcome;

export function TypedTitle() {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (n >= FULL.length) return;
    const id = window.setTimeout(() => setN((v) => v + 1), 95);
    return () => window.clearTimeout(id);
  }, [n]);

  const done = n >= FULL.length;

  return (
    <h1
      aria-label={FULL}
      className="font-display text-4xl font-light italic leading-tight text-foreground sm:text-5xl md:text-6xl"
    >
      <span aria-hidden="true">{FULL.slice(0, n)}</span>
      <span
        aria-hidden="true"
        className={`ml-1 inline-block h-[1em] w-[2px] translate-y-[0.12em] bg-primary/70 align-middle ${
          done ? "animate-caret" : ""
        }`}
      />
    </h1>
  );
}
