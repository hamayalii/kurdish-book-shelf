export const t = {
  archive: "ئەرشیفێکی کەسی",
  welcome: "بەخێربێن بۆ کتێبخانەی من",
  volumes: "بەرگ",
  searchPlaceholder: "بەدوای چی دەگەڕێی؟",
  recommend: "کتێبێک پێشنیار بکە",
  genres: "جۆرەکان",
  all: "هەموو",
  author: "نووسەر",
  translator: "وەرگێر",
  year: "ساڵ",
  publisher: "بڵاوکەرەوە",
  pages: "لاپەرە",
  originalTitle: "ناوی ئەسڵی",
  binding: "بەرگ‌بەستن",
  language: "زمان",
  kurdish: "کوردی (سۆرانی)",
  unrated: "هەڵنەسەنگێنراو",
  noMatch: "هیچ کتێبێک نەدۆزرایەوە",
  found: (n: number) => `${n} کتێب دۆزرایەوە`,
  clear: "سڕینەوە",
  close: "داخستن",
  prev: "پێشوو",
  next: "دواتر",
  noCover: "بەرگ بەردەست نییە",
  unknown: "نەزانراو",
};

export const genreLabels: Record<string, string> = {
  Fiction: "چیرۆک",
  Nonfiction: "زانیاری",
  Fantasy: "خەیاڵی",
  "Sci-Fi": "زانستی-خەیاڵی",
  "Mystery & Thriller": "نهێنی و ورووژێنەر",
  Romance: "ڕۆمانسی",
};

export const bindingLabels: Record<string, string> = {
  hardcover: "بەرگی ڕەق",
  paperback: "بەرگی نەرم",
  mass: "چاپی بچووک",
};
