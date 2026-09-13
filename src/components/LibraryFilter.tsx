import { useEffect, useMemo, useState } from "react";
import type { Book } from "@/data/books";
import { searchBooks } from "@/lib/search";
import { genreLabels, t } from "@/lib/i18n";

type Props = {
  books: Book[];
  onChange: (visible: Book[] | null) => void;
};

export function LibraryFilter({ books, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [result, setResult] = useState<Book[] | null>(null);
  const [busy, setBusy] = useState(false);

  const pills = useMemo(() => {
    const counts = new Map<string, number>();
    books.forEach((b) => (b.genres ?? []).forEach((g) => counts.set(g, (counts.get(g) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [books]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResult(null);
      setBusy(false);
      return;
    }
    setBusy(true);
    const id = window.setTimeout(() => {
      setResult(searchBooks(query, books));
      setBusy(false);
    }, 600);
    return () => window.clearTimeout(id);
  }, [query, books]);

  useEffect(() => {
    if (!result && !genre) {
      onChange(null);
      return;
    }
    const base = result ?? books;
    const filtered = genre ? base.filter((b) => (b.genres ?? []).includes(genre)) : base;
    onChange(filtered);
  }, [result, genre, books, onChange]);

  const shownCount = result ? (genre ? result.filter((b) => (b.genres ?? []).includes(genre)).length : result.length) : null;

  return (
    <div dir="rtl" className="mt-8 w-full">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          lang="ckb"
          className="w-full rounded-full border border-border bg-card/70 px-6 py-3 text-right font-sans text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute inset-y-0 left-4 my-auto h-7 rounded-full px-3 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase hover:text-foreground"
          >
            {t.clear}
          </button>
        )}
      </div>

      <p className="mt-2 h-5 font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
        {busy ? "…گەڕان لە ڕەفەکان" : shownCount !== null ? t.found(shownCount) : ""}
      </p>

      <div className="no-scrollbar mt-2 flex flex-nowrap items-center gap-2 overflow-x-auto py-1">
        <Pill active={genre === null} onClick={() => setGenre(null)}>
          {t.all}
        </Pill>
        {pills.map(([g, n]) => (
          <Pill key={g} active={genre === g} onClick={() => setGenre(genre === g ? null : g)}>
            {(genreLabels[g] ?? g) + ` (${n})`}
          </Pill>
        ))}
      </div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-1.5 font-mono text-[11px] tracking-[0.1em] transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
