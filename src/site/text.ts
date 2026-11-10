import { LOCALE, type Lang } from "../i18n";

export interface ArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string | string[];
  readTime: string;
  en: { title: string; excerpt: string };
}

const CATEGORY_EN: Record<string, string> = { Programmation: "Programming" };

export const categoryName = (c: string, lang: Lang) => (lang === "en" ? CATEGORY_EN[c] ?? c : c);

export const local = (a: ArticleMeta, lang: Lang) => ({
  title: lang === "en" ? a.en.title : fr(a.title),
  excerpt: lang === "en" ? a.en.excerpt : fr(a.excerpt),
  categories: asList(a.category).map((c) => categoryName(c, lang)),
});

export const asList = (v: string | string[]) => (Array.isArray(v) ? v : [v]);

export const fr = (s: string) => s.replace(/ ([:;!?»])/g, " $1").replace(/« /g, "« ");

export const shortDate = (iso: string, lang: Lang) => new Date(iso).toLocaleDateString(LOCALE[lang], { day: "numeric", month: "short", year: "numeric" });
