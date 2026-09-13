import type { Book } from "@/data/books";

/** Front-cover depth in un-scaled spine space. */
export const COVER_W = 178;

export const faceFont: Record<Book["face"], string> = {
  serif: "font-display",
  sans: "font-sans",
  mono: "font-mono",
};

export const finishSheen: Record<Book["finish"], string> = {
  cloth:
    "linear-gradient(90deg, rgba(0,0,0,0.34) 0%, rgba(255,255,255,0.06) 42%, rgba(255,255,255,0.10) 58%, rgba(0,0,0,0.30) 100%)",
  gloss:
    "linear-gradient(90deg, rgba(0,0,0,0.42) 0%, rgba(255,255,255,0.24) 34%, rgba(255,255,255,0.36) 52%, rgba(0,0,0,0.38) 100%)",
  matte:
    "linear-gradient(90deg, rgba(0,0,0,0.30) 0%, rgba(255,255,255,0.05) 46%, rgba(255,255,255,0.07) 60%, rgba(0,0,0,0.26) 100%)",
};

export const paperTexture =
  "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 3px)";
