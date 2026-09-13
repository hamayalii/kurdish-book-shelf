import { useEffect, useMemo, useState } from "react";
import type { Book } from "@/data/books";
import { COVER_W } from "./bookFaces";
import { bindingLabels, genreLabels, t } from "@/lib/i18n";

export type SpineRect = { left: number; top: number; width: number; height: number };

type Props = {
  books: Book[];
  index: number;
  rect: SpineRect;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

export function BookDetail({ books, index, rect, onIndexChange, onClose }: Props) {
  const book = books[index];
  const [out, setOut] = useState(false);
  const [vp, setVp] = useState({ w: 1280, h: 800 });

  useEffect(() => {
    const read = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOut(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const retract = () => {
    setOut(false);
    window.setTimeout(onClose, 620);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") retract();
      // RTL layout: ArrowLeft advances forward
      if (e.key === "ArrowLeft") onIndexChange((index + 1) % books.length);
      if (e.key === "ArrowRight") onIndexChange((index - 1 + books.length) % books.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, books.length]);

  const pose = useMemo(() => {
    const narrow = vp.w < 720;
    const coverH = narrow ? vp.h * 0.42 : Math.min(vp.h * 0.6, 480);
    const scale = coverH / rect.height;
    const coverW = COVER_W * scale;
    // RTL: cover sits on the right, metadata reads down the left.
    const targetX = narrow ? vp.w / 2 - coverW / 2 : vp.w * 0.74 - coverW / 2;
    const targetY = narrow ? vp.h * 0.1 : vp.h / 2 - coverH / 2;
    return {
      dx: targetX - rect.left,
      dy: targetY - rect.top,
      scale,
      coverW,
      coverH,
      narrow,
    };
  }, [rect, vp]);

  if (!book) return null;

  return (
    <div dir="rtl" lang="ckb" className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label={t.close}
        onClick={retract}
        className="absolute inset-0 bg-background/70 backdrop-blur-xl transition-opacity duration-700"
        style={{ opacity: out ? 1 : 0 }}
      />

      {/* the pulled-out book */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          transformStyle: "preserve-3d",
          transformOrigin: "left center",
          transform: out
            ? `translate3d(${pose.dx}px, ${pose.dy}px, 0) scale(${pose.scale}) rotateY(-90deg)`
            : "translate3d(0,0,0) scale(1) rotateY(-26deg)",
          transition: "transform 900ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: book.spine, transformStyle: "preserve-3d" }}>
          <div
            className="absolute top-0 left-full h-full overflow-hidden"
            style={{
              width: COVER_W,
              transformOrigin: "left center",
              transform: "rotateY(90deg)",
              backgroundColor: book.spine,
              boxShadow: "0 30px 60px -24px rgba(0,0,0,0.6)",
            }}
          >
            {book.cover ? (
              <img src={book.cover} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div
                className="flex h-full w-full flex-col justify-between p-4 text-right"
                style={{ color: book.ink }}
              >
                <span className="font-mono" style={{ fontSize: 5, opacity: 0.7 }}>
                  {book.year || ""}
                </span>
                <span className="font-display leading-tight" style={{ fontSize: 13 }}>
                  {book.title}
                </span>
                <span className="font-sans" style={{ fontSize: 7, opacity: 0.8 }}>
                  {book.author}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* metadata panel */}
      <div
        className={`no-scrollbar absolute overflow-y-auto ${pose.narrow ? "inset-x-0 bottom-0 max-h-[46vh] px-6 pb-8" : "top-[12vh] left-[7%] max-h-[76vh] w-[min(420px,36vw)]"} text-right transition-all duration-700`}
        style={{
          opacity: out ? 1 : 0,
          transform: `translateY(${out ? 0 : 18}px)`,
          transitionDelay: "260ms",
        }}
      >
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          {book.recommender ? book.recommender : t.kurdish}
        </p>
        <h2 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">{book.title}</h2>
        {book.originalTitle && (
          <p dir="ltr" className="mt-1 text-left font-display text-base italic text-muted-foreground">
            {book.originalTitle}
          </p>
        )}

        <dl className="mt-5 space-y-1.5 text-sm">
          <Row label={t.author} value={book.author} />
          {book.translator && <Row label={t.translator} value={book.translator} />}
          <Row label={t.year} value={book.year ? String(book.year) : t.unknown} />
          <Row label={t.publisher} value={book.publisher || t.unknown} />
          <Row label={t.pages} value={book.pages ? String(book.pages) : t.unknown} />
          <Row label={t.binding} value={bindingLabels[book.binding] ?? ""} />
          {book.genres?.length ? (
            <Row label={t.genres} value={book.genres.map((g) => genreLabels[g] ?? g).join(" · ")} />
          ) : null}
        </dl>

        {book.blurb && <p className="mt-5 leading-relaxed text-muted-foreground">{book.blurb}</p>}
        {!book.rating && (
          <p className="mt-4 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{t.unrated}</p>
        )}

        <div className="mt-7 flex flex-wrap gap-2">
          <Ctrl onClick={() => onIndexChange((index + 1) % books.length)}>{t.next}</Ctrl>
          <Ctrl onClick={() => onIndexChange((index - 1 + books.length) % books.length)}>{t.prev}</Ctrl>
          <Ctrl onClick={retract}>{t.close}</Ctrl>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-end gap-2">
      <dd className="text-foreground">{value}</dd>
      <dt className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase leading-6">{label}</dt>
    </div>
  );
}

function Ctrl({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border bg-card/70 px-4 py-1.5 font-mono text-[11px] tracking-[0.14em] text-foreground uppercase transition-colors hover:bg-accent"
    >
      {children}
    </button>
  );
}
