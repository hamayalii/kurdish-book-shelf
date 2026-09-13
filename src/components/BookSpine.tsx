import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Book } from "@/data/books";
import { COVER_W, faceFont, finishSheen, paperTexture } from "./bookFaces";
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
  const fontSize = Math.max(9, Math.min(15, book.width * 0.42));
  const titleTrack = book.height * 0.72;

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
          className="absolute bottom-0 left-0 block rounded-[2px]"
          style={{
            width: book.width,
            height: book.height,
            transformStyle: "preserve-3d",
            transformOrigin: "bottom center",
            transform: `rotateY(var(--ry, 0deg)) rotateZ(${lean}deg) translateZ(${pull + book.depth}px) translateY(${lift}px)`,
            transition: "transform 620ms cubic-bezier(0.16,1,0.3,1)",
            backgroundColor: book.spine,
            boxShadow: "0 22px 34px -20px rgba(0,0,0,0.55)",
          }}
        >
          {/* head / foot rules in the accent band */}
          <span
            className="pointer-events-none absolute inset-x-0 top-[9%] h-[3px] opacity-80"
            style={{ backgroundColor: book.band ?? book.ink }}
          />
          <span
            className="pointer-events-none absolute inset-x-0 bottom-[13%] h-[3px] opacity-70"
            style={{ backgroundColor: book.band ?? book.ink }}
          />

          {/* vertical Kurdish title — rotated so Arabic-script shaping stays intact */}
          <span
            dir="rtl"
            lang="ckb"
            className={`${faceFont[book.face]} pointer-events-none absolute top-1/2 left-1/2 block overflow-hidden text-center whitespace-nowrap`}
            style={{
              width: titleTrack,
              transform: `translate(-50%, -50%) rotate(90deg) translateY(${book.width >= 44 ? -0.55 * fontSize : 0}px)`,
              transformOrigin: "center center",
              color: book.ink,
              fontSize,
              lineHeight: 1.05,
              letterSpacing: book.caps ? "0.06em" : "0.01em",
              textOverflow: "ellipsis",
            }}
          >
            {book.title}
          </span>

          {/* vertical author on wide spines only */}
          {book.width >= 44 && (
            <span
              dir="rtl"
              lang="ckb"
              className="pointer-events-none absolute top-1/2 left-1/2 block overflow-hidden text-center font-sans whitespace-nowrap"
              style={{
                width: titleTrack,
                transform: `translate(-50%, -50%) rotate(90deg) translateY(${0.85 * fontSize}px)`,
                color: book.ink,
                opacity: 0.75,
                fontSize: 10,
                textOverflow: "ellipsis",
              }}
            >
              {book.author}
            </span>
          )}

          {/* publisher / year mark at the foot */}
          {book.width >= 30 && (
            <span
              className="pointer-events-none absolute inset-x-0 bottom-[4%] text-center font-mono"
              style={{ color: book.ink, opacity: 0.6, fontSize: 7 }}
            >
              {book.year || ""}
            </span>
          )}

          {/* material texture, sheen, wear, inset highlight */}
          <span className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: paperTexture }} />
          <span className="pointer-events-none absolute inset-0" style={{ backgroundImage: finishSheen[book.finish] }} />
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: book.wear,
              backgroundImage:
                "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(0,0,0,0) 30%), linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 26%)",
            }}
          />
          <span
            className="pointer-events-none absolute inset-0 rounded-[2px]"
            style={{ boxShadow: "inset 1px 0 0 rgba(255,255,255,0.18), inset -1px 0 0 rgba(0,0,0,0.35)" }}
          />

          {/* hinged front cover face */}
          <span
            className="pointer-events-none absolute top-0 left-full h-full"
            style={{
              width: COVER_W,
              transformOrigin: "left center",
              transform: "rotateY(90deg)",
              backgroundColor: book.spine,
              backgroundImage: book.cover ? `url(${book.cover})` : undefined,
              backgroundSize: "cover",
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
