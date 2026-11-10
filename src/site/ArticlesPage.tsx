import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { texts, to, useLang } from "../i18n";
import { articles } from "../pages/threads/index";
import { PAGES } from "../seo/site.mjs";
import { SiteLayout } from "./SiteLayout";
import { asList, categoryName, local, shortDate, type ArticleMeta } from "./text";

const TEXT = texts({
  fr: {
    kicker: "Les archives",
    title: "Articles",
    intro: "Articles techniques, tutoriels et guides écrits par les membres de la communauté.",
    searchLabel: "Rechercher un article",
    search: "Rechercher…",
    filter: "Filtrer par catégorie",
    all: "Tous",
    count: (n: number) => `${n} article${n > 1 ? "s" : ""}`,
    list: "Liste des articles",
    no: "N°",
    read: "Lire →",
    none: "Aucun article ne correspond",
    reset: "Réinitialiser",
  },
  en: {
    kicker: "The archives",
    title: "Articles",
    intro: "Technical articles, tutorials and guides written by members of the community.",
    searchLabel: "Search articles",
    search: "Search…",
    filter: "Filter by category",
    all: "All",
    count: (n: number) => `${n} article${n === 1 ? "" : "s"}`,
    list: "Article list",
    no: "No.",
    read: "Read →",
    none: "No matching articles",
    reset: "Reset",
  },
});

export default function ArticlesPage() {
  const lang = useLang();
  const t = TEXT[lang];
  useSeo({ ...PAGES["/threads"][lang], path: "/threads" });
  const list = articles as ArticleMeta[];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const categories = useMemo(() => [null, ...Array.from(new Set(list.flatMap((a) => asList(a.category))))], [list]);
  const shown = list
    .filter((a) => category === null || asList(a.category).includes(category))
    .filter((a) => {
      const q = query.trim().toLowerCase();
      const l = local(a, lang);
      return !q || `${l.title} ${l.excerpt} ${a.author}`.toLowerCase().includes(q);
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <SiteLayout>
      <section className="px-pad pb-[7vh] pt-[22vh] max-lg:pt-[18vh]">
        <p className="oz-label text-oz-cream/60">{t.kicker}</p>
        <h1 className="oz-display mt-[1.6vh] text-oz-h1 max-lg:text-[13vw]">{t.title}</h1>
        <p className="mt-[3vh] max-w-[52ch] text-oz-body2 text-oz-cream/80">{t.intro}</p>
        <div className="mt-[5vh] flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="oz-search">
            {t.searchLabel}
          </label>
          <input
            id="oz-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            className="w-[min(100%,340px)] rounded-full border border-dotted border-oz-cream/40 bg-oz-cream/[0.04] px-5 py-3 font-oz-mono text-[13px] text-oz-cream outline-none placeholder:text-oz-cream/40 focus:border-solid focus:border-oz-cream/80"
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.filter}>
            {categories.map((c) => (
              <button
                key={c ?? ""}
                type="button"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className={`oz-label rounded-full border px-[1.2em] py-[0.8em] text-[11px] transition-colors ${
                  category === c ? "border-oz-cream bg-oz-cream text-oz-ink" : "border-oz-cream/20 bg-oz-cream/[0.04] hover:border-oz-cream/50"
                }`}
              >
                {c === null ? t.all : categoryName(c, lang)}
              </button>
            ))}
          </div>
        </div>
        <p className="oz-label mt-[3vh] text-[10px] text-oz-cream/45" aria-live="polite">
          {t.count(shown.length)}
        </p>
      </section>

      <section className="grid grid-cols-3 gap-[1.2vw] px-pad pb-[16vh] max-lg:grid-cols-1 max-lg:gap-4" aria-label={t.list}>
        {shown.map((a, i) => {
          const l = local(a, lang);
          return (
            <Link
              key={a.slug}
              to={to(`/threads/${a.slug}`, lang)}
              className="group flex min-h-[46vh] flex-col rounded-[14px] bg-[#f3e3cc] p-[max(22px,2vw)] text-oz-ink shadow-[0_40px_80px_-40px_rgb(0_0_0/0.6)] transition-transform duration-500 hover:-translate-y-2 max-lg:min-h-0"
            >
              <span className="flex items-center justify-between font-oz-mono text-[11px]">
                <span className="opacity-55">
                  {t.no} {String(i + 1).padStart(2, "0")}
                </span>
                <span className="oz-label text-[10px] text-oz-ink/60">{l.categories.join(" · ")}</span>
              </span>
              <span className="mt-[4vh] font-oz-serif text-[length:max(24px,calc(36*var(--oz-u)))] font-medium leading-[1.1]">{l.title}</span>
              <span className="mt-[2.4vh] text-oz-body3 text-oz-ink/70">{l.excerpt}</span>
              <span className="mt-auto flex items-end justify-between border-t border-dotted border-oz-ink/30 pt-4 max-lg:mt-8">
                <span className="font-oz-mono text-[11px] text-oz-ink/55">
                  {a.author} · {shortDate(a.date, lang)} · {a.readTime}
                </span>
                <span className="oz-label text-[11px] underline-offset-4 group-hover:underline">{t.read}</span>
              </span>
            </Link>
          );
        })}
        {shown.length === 0 && (
          <div className="col-span-3 rounded-[14px] border border-dotted border-oz-cream/30 p-10 text-center max-lg:col-span-1">
            <p className="oz-display text-oz-h4">{t.none}</p>
            <button
              type="button"
              className="oz-pill oz-pill--brown mt-6"
              onClick={() => {
                setQuery("");
                setCategory(null);
              }}
            >
              {t.reset}
            </button>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
