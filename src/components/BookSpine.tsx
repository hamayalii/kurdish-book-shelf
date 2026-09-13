import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Book } from "@/data/books";
import { COVER_W } from "./bookFaces";
import { bindingLabels, genreLabels, t } from "@/lib/i18n";

const PULL = 58;
const LIFT = -10;

type Props = {
  book: Book;
  onOpen: (el: HTMLElement | null) => void;
  className?: string;
  stacked?: boolean;
};

export function BookSpine({ book, onOpen, className, stacked = false }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);
  const [card, setCard] = useState<{ left: number; top: number } | null>(null);
  const leave = useRef<number | null>(null);

  useEffect(() => () => { if (leave.current) window.clearTimeout(leave.current); }, []);

  const enter = () => {
    if (leave.current) window.clearTimeout(leave.current);
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setCard({ left: r.left + r.width / 2, top: r.top - 14 });
    setHover(true);
  };

  const exit = () => {
    leave.current = window.setTimeout(() => {
      setHover(false);
      setCard(null);
    }, 90);
  };

  const lean = hover ? 0 : book.lean;
  const pull = hover ? PULL : 0;
  const lift = hover ? LIFT : 0;
  const stackScale = 0.58;
  const frameWidth = stacked ? book.height * stackScale : book.width;
  const frameHeight = stacked ? book.width * stackScale : book.height;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => onOpen(btnRef.current)}
        onMouseEnter={enter}
        onMouseLeave={exit}
        onFocus={enter}
        onBlur={exit}
        aria-label={`${book.title} — ${book.author}`}
        data-stacked={stacked ? "true" : undefined}
        className={`relative shrink-0 cursor-pointer bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring ${className ?? ""}`}
        style={{
          width: frameWidth,
          height: frameHeight,
          zIndex: hover ? 40 : undefined,
          ["--spine-w" as string]: `${book.width}px`,
        }}
      >
        <span
          className="absolute block"
          style={{
            width: book.width,
            height: book.height,
            left: stacked ? "50%" : 0,
            bottom: stacked ? "50%" : 0,
            transformStyle: "preserve-3d",
            transformOrigin: stacked ? "center center" : "bottom center",
            transform: stacked
              ? `translate(-50%, 50%) rotate(-90deg) scale(${stackScale}) translateZ(${pull}px) translateY(${lift}px)`
              : `rotateY(var(--ry, 0deg)) rotateZ(${lean}deg) translateZ(${pull + book.depth}px) translateY(${lift}px)`,
            transition: "transform 820ms cubic-bezier(0.16,1,0.3,1), filter 820ms ease",
            filter: hover ? "drop-shadow(0 22px 14px var(--book-shadow-strong))" : "drop-shadow(0 10px 7px var(--book-shadow))",
          }}
        >
          {book.spineImage ? (
            <img
              src={book.spineImage}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="pointer-events-none h-full w-full object-contain"
            />
          ) : null}

          {/* hinged front cover face */}
          <span
            className="pointer-events-none absolute top-0 left-full h-full"
            style={{
              width: COVER_W,
              transformOrigin: "left center",
              transform: "rotateY(90deg)",
              backgroundColor: book.spine,
              backgroundImage: book.cover ? `url(${book.cover})` : undefined,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />

          {/* page block */}
          <span
            className="pointer-events-none absolute -top-[6px] left-0 h-[6px] w-full"
            style={{
              transformOrigin: "bottom center",
              transform: "rotateX(78deg)",
              background: "linear-gradient(90deg, #efe6d3, #cdc0a8)",
            }}
          />
          {book.binding === "hardcover" && (
            <span
              className="pointer-events-none absolute -top-[2px] left-0 h-[2px] w-full"
              style={{ backgroundColor: book.band ?? book.ink, opacity: 0.85 }}
            />
          )}
        </span>
      </button>

      {hover && card && typeof document !== "undefined" &&
        createPortal(
          <div
            dir="rtl"
            lang="ckb"
            className="pointer-events-none fixed z-[100] w-[248px] -translate-x-1/2 -translate-y-full rounded-lg border border-border/70 bg-card/95 p-4 text-right shadow-2xl backdrop-blur-md"
            style={{ left: card.left, top: card.top }}
          >
            <p className="font-display leading-snug text-card-foreground" style={{ fontSize: 20 }}>
              {book.title}
            </p>
            <p className="mt-1 text-muted-foreground" style={{ fontSize: 15 }}>
              {book.author}
            </p>
            <p className="mt-2 font-mono text-muted-foreground" style={{ fontSize: 14 }}>
              {[book.year ? book.year : null, bindingLabels[book.binding], book.pages ? `${book.pages} ${t.pages}` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {book.genres?.length ? (
              <p className="mt-1 text-primary" style={{ fontSize: 14 }}>
                {book.genres.map((g) => genreLabels[g] ?? g).join(" · ")}
              </p>
            ) : null}
          </div>,
          document.body,
        )}
    </>
  );
}
