import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { books, type Book } from "@/data/books";
import { Shelf } from "@/components/Shelf";
import { TypedTitle } from "@/components/TypedTitle";
import { LibraryFilter } from "@/components/LibraryFilter";
import { t } from "@/lib/i18n";

const TITLE = "کتێبخانەی کوردی من | Kurdish Virtual Library";
const DESC =
  "ڕەفەیەکی سێ‌ڕەهەندی کتێب بە زمانی کوردیی سۆرانی — کتێبە کوردی و وەرگێردراوەکانم بگەڕێ و بەرگ و زانیارییەکانیان ببینە.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [shown, setShown] = useState<Book[] | null>(null);
  const handleChange = useCallback((visible: Book[] | null) => setShown(visible), []);
  const list = shown ?? books;

  return (
    <div dir="rtl" lang="ckb" className="grain relative min-h-screen overflow-hidden bg-background">
      <div className="animate-drift pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_10%,var(--color-glow),transparent_70%)]" />

      <header className="relative mx-auto max-w-4xl px-6 pt-16 text-center sm:pt-24">
        <p className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground uppercase">{t.archive}</p>
        <div className="mt-4">
          <TypedTitle />
        </div>
        <p className="mt-4 font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
          {books.length} {t.volumes}
        </p>
        <LibraryFilter books={books} onChange={handleChange} />
      </header>

      <main className="relative mt-6 pb-16">
        {list.length ? (
          <Shelf books={list} />
        ) : (
          <p className="py-24 text-center font-display text-2xl text-muted-foreground">{t.noMatch}</p>
        )}
      </main>
    </div>
  );
}
