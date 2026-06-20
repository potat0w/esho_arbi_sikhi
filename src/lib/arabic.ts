// Normalize Arabic text: strip diacritics (tashkeel), tatweel, and unify alif/yaa/taa marbuta.
export function normalizeArabic(input: string): string {
  if (!input) return "";
  let s = input.trim();
  // Remove tashkeel (U+064B..U+065F, U+0670) and tatweel U+0640
  s = s.replace(/[\u064B-\u065F\u0670\u0640]/g, "");
  // Unify alif variants
  s = s.replace(/[\u0622\u0623\u0625]/g, "\u0627");
  // Unify yaa
  s = s.replace(/\u0649/g, "\u064A");
  // Taa marbuta -> haa (loose match)
  s = s.replace(/\u0629/g, "\u0647");
  // Hamza variations
  s = s.replace(/\u0624/g, "\u0648").replace(/\u0626/g, "\u064A");
  // Strip definite article "ال" at start for lenient compare
  // (don't strip globally — only leading)
  s = s.replace(/^ال/, "");
  // Remove non-arabic chars and whitespace
  s = s.replace(/\s+/g, "");
  return s;
}

export function arabicMatches(user: string, correct: string): boolean {
  if (!user) return false;
  const u = normalizeArabic(user);
  // correct may have alternatives separated by "-" or "،"
  const variants = correct.split(/[-،\/]/).map((v) => normalizeArabic(v));
  return variants.some((v) => v && (v === u || v.includes(u) || u.includes(v)));
}