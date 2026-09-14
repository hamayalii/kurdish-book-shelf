import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Book } from "@/data/books";
import { COVER_W } from "./bookFaces";
import { bindingLabels, genreLabels, t } from "@/lib/i18n";

const PULL = 96;
const LIFT = -26;

type Props = {
  book: Book;
  onOpen: (el: HTMLElement | null) => void;
  className?: string;
};

export function BookSpine({ book, onOpen, className }: Props) {
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
        className={`relative shrink-0 cursor-pointer bg-transparent outline-none ${className ?? ""}`}
        style={{
          width: book.width,
          height: book.height,
          zIndex: hover ? 40 : undefined,
          ["--spine-w" as string]: `${book.width}px`,
        }}
      >
        <span
          className="absolute bottom-0 left-0 block"
          style={{
            width: book.width,
            height: book.height,
            transformStyle: "preserve-3d",
            transformOrigin: "bottom center",
            transform: `rotateY(var(--ry, 0deg)) rotateZ(${lean}deg) translateZ(${pull + book.depth}px) translateY(${lift}px)`,
            transition: "transform 620ms cubic-bezier(0.16,1,0.3,1)",
            filter: hover ? "drop-shadow(0 22px 12px rgb(0 0 0 / 0.28))" : "drop-shadow(0 12px 9px rgb(0 0 0 / 0.22))",
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
