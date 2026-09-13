import { useCallback, useEffect, useRef, useState } from "react";
import type { Book } from "@/data/books";
import { BookSpine } from "./BookSpine";
import { BookDetail, type SpineRect } from "./BookDetail";

type Props = { books: Book[]; justAdded?: string | null };

export function Shelf({ books, justAdded }: Props) {
  const cabinetRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<{ index: number; rect: SpineRect } | null>(null);

  const applyCurve = useCallback(() => {
    const cabinet = cabinetRef.current;
    if (!cabinet) return;
    const bounds = cabinet.getBoundingClientRect();
    const mid = bounds.left + bounds.width / 2;
    cabinet.querySelectorAll<HTMLElement>("[data-spine]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const tRaw = (r.left + r.width / 2 - mid) / (bounds.width / 2);
      const clamped = Math.max(-1, Math.min(1, tRaw));
      const eased = Math.sign(clamped) * Math.pow(Math.abs(clamped), 1.35);
      el.style.setProperty("--ry", `${-eased * 11}deg`);
    });
  }, []);

  useEffect(() => {
    const cabinet = cabinetRef.current;
    if (!cabinet) return;
    applyCurve();
    window.addEventListener("resize", applyCurve);
    const ro = new ResizeObserver(applyCurve);
    ro.observe(cabinet);

    return () => {
      window.removeEventListener("resize", applyCurve);
      ro.disconnect();
    };
  }, [applyCurve, books.length]);

  // arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open || !cabinetRef.current) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") cabinetRef.current.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!justAdded || !cabinetRef.current) return;
    const el = cabinetRef.current.querySelector<HTMLElement>(`[data-book-id="${justAdded}"]`);
    el?.scrollIntoView({ inline: "center", block: "center", behavior: "smooth" });
  }, [justAdded]);

  const openAt = (index: number, el: HTMLElement | null) => {
    const r = el?.getBoundingClientRect();
    if (!r) return;
    const book = books[index];
    if (!book) return;
    const stacked = el?.dataset.stacked === "true";
    const scale = 0.58;
    const width = stacked ? book.width * scale : r.width;
    const height = stacked ? book.height * scale : r.height;
    setOpen({
      index,
      rect: {
        left: stacked ? r.left + r.width / 2 - width / 2 : r.left,
        top: stacked ? r.top + r.height / 2 - height / 2 : r.top,
        width,
        height,
      },
    });
  };

  const rows = [0, 1, 2].map((offset) => books.filter((_, index) => index % 3 === offset));

  return (
    <>
      <div className="cabinet-wrap mx-auto w-full max-w-6xl px-3 sm:px-6">
        <div ref={cabinetRef} tabIndex={-1} className="wood-cabinet relative outline-none" dir="ltr">
          <div className="cabinet-crown" aria-hidden="true" />
          <div className="cabinet-inner">
            {rows.map((row, rowIndex) => (
              <section key={rowIndex} className="shelf-bay" aria-label={`${rowIndex + 1}`}>
                <div className={`shelf-books shelf-books-${rowIndex + 1}`}>
                  {row.map((book) => {
                    const index = books.indexOf(book);
                    const stacked = rowIndex === 1 && row.length > 2 && book === row[row.length - 1];
                    return (
              <div
                key={book.id}
                data-spine
                data-book-id={book.id}
                style={{ transformStyle: "preserve-3d" }}
                className={`book-position ${stacked ? "book-position-stacked" : ""} ${justAdded === book.id ? "animate-shelve-in" : ""}`}
              >
                <BookSpine book={book} stacked={stacked} onOpen={(el) => openAt(index, el)} />
              </div>
                    );
                  })}
                </div>
                <div className="shelf-plank" aria-hidden="true" />
              </section>
            ))}
          </div>
          <div className="cabinet-plinth" aria-hidden="true" />
        </div>
      </div>

      {open && (
        <BookDetail
          books={books}
          index={open.index}
          rect={open.rect}
          onIndexChange={(i) => setOpen((o) => (o ? { ...o, index: i } : o))}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
