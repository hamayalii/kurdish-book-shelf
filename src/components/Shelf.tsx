import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Book } from "@/data/books";
import { BookSpine } from "./BookSpine";
import { BookDetail, type SpineRect } from "./BookDetail";

type Props = { books: Book[]; justAdded?: string | null };

const LOOP_THRESHOLD = 2600;

export function Shelf({ books, justAdded }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [copies, setCopies] = useState(1);
  const [open, setOpen] = useState<{ index: number; rect: SpineRect } | null>(null);

  const totalWidth = books.reduce((sum, b) => sum + b.width + 2, 0);

  useLayoutEffect(() => {
    setCopies(totalWidth > LOOP_THRESHOLD ? 3 : 1);
  }, [totalWidth]);

  // curved perspective
  const applyCurve = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const mid = rail.getBoundingClientRect().left + rail.clientWidth / 2;
    rail.querySelectorAll<HTMLElement>("[data-spine]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const tRaw = (r.left + r.width / 2 - mid) / (rail.clientWidth / 2);
      const clamped = Math.max(-1, Math.min(1, tRaw));
      const eased = Math.sign(clamped) * Math.pow(Math.abs(clamped), 1.35);
      el.style.setProperty("--ry", `${-eased * 34}deg`);
    });
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    if (copies === 3) rail.scrollLeft = rail.scrollWidth / 3;
    applyCurve();

    const onScroll = () => {
      if (copies === 3) {
        const seg = rail.scrollWidth / 3;
        if (rail.scrollLeft < seg * 0.5) rail.scrollLeft += seg;
        else if (rail.scrollLeft > seg * 1.5) rail.scrollLeft -= seg;
      }
      applyCurve();
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        rail.scrollLeft += e.deltaY;
      }
    };
    rail.addEventListener("scroll", onScroll, { passive: true });
    rail.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", applyCurve);

    const ro = new ResizeObserver(() => {
      setOverflowing(rail.scrollWidth > rail.clientWidth + 8);
      applyCurve();
    });
    ro.observe(rail);
    if (rowRef.current) ro.observe(rowRef.current);

    return () => {
      rail.removeEventListener("scroll", onScroll);
      rail.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", applyCurve);
      ro.disconnect();
    };
  }, [applyCurve, copies, books.length]);

  // drag to scroll
  const drag = useRef<{ x: number; left: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (!railRef.current) return;
    drag.current = { x: e.clientX, left: railRef.current.scrollLeft };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !railRef.current) return;
    railRef.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
  };
  const endDrag = () => { drag.current = null; };

  // arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open || !railRef.current) return;
      if (e.key === "ArrowRight") railRef.current.scrollLeft += 320;
      if (e.key === "ArrowLeft") railRef.current.scrollLeft -= 320;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!justAdded || !railRef.current) return;
    const el = railRef.current.querySelector<HTMLElement>(`[data-book-id="${justAdded}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [justAdded]);

  const openAt = (index: number, el: HTMLElement | null) => {
    const r = el?.getBoundingClientRect();
    if (!r) return;
    setOpen({ index, rect: { left: r.left, top: r.top, width: r.width, height: r.height } });
  };

  const rendered = Array.from({ length: copies }, (_, c) => c);

  return (
    <>
      <div
        ref={railRef}
        dir="ltr"
        className="no-scrollbar relative overflow-x-auto overflow-y-visible pt-16 pb-6"
        style={{ perspective: "1400px", perspectiveOrigin: "50% 65%" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <div
          ref={rowRef}
          className={`flex items-end gap-[2px] px-10 ${overflowing ? "" : "justify-center"}`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {rendered.map((c) =>
            books.map((book, i) => (
              <div
                key={`${c}-${book.id}`}
                data-spine
                data-book-id={c === 0 ? book.id : undefined}
                style={{ transformStyle: "preserve-3d" }}
                className={justAdded === book.id ? "animate-shelve-in" : undefined}
              >
                <BookSpine book={book} onOpen={(el) => openAt(i, el)} />
              </div>
            )),
          )}
        </div>

        {overflowing && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
          </>
        )}
      </div>

      <div className="mx-auto h-px w-full max-w-5xl bg-gradient-to-r from-transparent via-foreground/25 to-transparent" />
      <div className="mx-auto h-10 w-full max-w-5xl bg-gradient-to-b from-foreground/8 to-transparent" />

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
