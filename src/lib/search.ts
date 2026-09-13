import type { Book } from "@/data/books";
import { genreLabels } from "@/lib/i18n";

/** Normalize Kurdish/Arabic/Persian letter variants, digits and diacritics. */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u200c\u200f\u200e]/g, "")
    .replace(/[أإآٱا]/g, "ا")
    .replace(/[يیۍئ]/g, "ی")
    .replace(/[كک]/g, "ک")
    .replace(/[ةه]/g, "ه")
    .replace(/[ؤو]/g, "و")
    .replace(/ڕ/g, "ر")
    .replace(/ڵ/g, "ل")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Kurdish + English intent words mapped onto the genre set. */
const genreHints: Record<string, string[]> = {
  Fiction: ["چیرۆک", "رومان", "ئەدەبی", "fiction", "novel", "story", "literary"],
  Nonfiction: [
    "زانیاری",
    "زانستی",
    "مێژوو",
    "فەلسەفە",
    "دەرووندروستی",
    "پەروەردە",
    "nonfiction",
    "history",
    "philosophy",
    "self",
    "help",
    "habit",
    "power",
  ],
  Fantasy: ["خەیاڵی", "ئەفسانە", "fantasy", "magic", "hobbit", "tolkien"],
  "Sci-Fi": ["زانستی خەیاڵی", "sci", "scifi", "space"],
  "Mystery & Thriller": ["نهێنی", "ورووژێنەر", "mystery", "thriller", "crime"],
  Romance: ["رومانسی", "ئەوین", "romance", "love"],
};

function haystacks(book: Book) {
  const genres = book.genres ?? [];
  return [
    { text: book.title, weight: 8 },
    { text: book.originalTitle ?? "", weight: 6 },
    { text: book.author, weight: 6 },
    { text: book.translator ?? "", weight: 4 },
    { text: genres.join(" "), weight: 4 },
    { text: genres.map((g) => genreLabels[g] ?? g).join(" "), weight: 4 },
    { text: book.publisher, weight: 2 },
    { text: book.year ? String(book.year) : "", weight: 2 },
    { text: book.blurb, weight: 2 },
  ].map((h) => ({ ...h, text: normalize(h.text) }));
}

/**
 * Natural-language-ish scoring search that works in Kurdish Sorani, English or
 * a mix of both. Purely client-side: no API key required, so the shelf works
 * offline and Kurdish text is never rewritten by a model.
 */
export function searchBooks(query: string, list: Book[]): Book[] | null {
  const q = normalize(query);
  if (q.length < 2) return null;
  const tokens = q.split(" ").filter((w) => w.length > 1);
  if (!tokens.length) return null;

  const wantedGenres = Object.entries(genreHints)
    .filter(([, hints]) => hints.some((h) => tokens.some((tk) => normalize(h).includes(tk) || tk.includes(normalize(h)))))
    .map(([g]) => g);

  const scored = list.map((book) => {
    const fields = haystacks(book);
    let score = 0;
    for (const token of tokens) {
      for (const field of fields) {
        if (!field.text) continue;
        if (field.text.includes(token)) score += field.weight;
        else if (token.length > 3 && field.text.split(" ").some((w) => w.startsWith(token.slice(0, 3))))
          score += field.weight * 0.3;
      }
    }
    if (wantedGenres.some((g) => (book.genres ?? []).includes(g))) score += 5;
    return { book, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.book);
}
