import { Suspense, lazy, type ComponentType, type LazyExoticComponent, type ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { texts, to, useLang, type Lang } from "../i18n";
import { articles, getArticle, loadArticle } from "../pages/threads/index";
import { SiteLayout } from "./SiteLayout";
import { local, shortDate, type ArticleMeta } from "./text";

const TEXT = texts({
  fr: {
    newer: "← Plus récent",
    older: "Plus ancien →",
    all: "← Tous les articles",
    author: "Auteur",
    published: "Publié le",
    reading: "Lecture",
    translated: "",
    original: "",
    loading: "Chargement de l'article…",
    more: "Autres articles",
  },
  en: {
    newer: "← Newer",
    older: "Older →",
    all: "← All articles",
    author: "Author",
    published: "Published",
    reading: "Reading time",
    translated: "Translated from",
    original: "French",
    loading: "Loading the article…",
    more: "More articles",
  },
});

type Body = LazyExoticComponent<ComponentType<{ darkMode?: boolean }>>;

const BODIES = new Map<string, Body>();
const bodyOf = (slug: string, lang: Lang): Body | null => {
  const key = `${lang}/${slug}`;
  let body = BODIES.get(key);
  if (!body) {
    const loader = loadArticle(slug, lang) as (() => Promise<{ default: ComponentType<{ darkMode?: boolean }> }>) | undefined;
    if (!loader) return null;
    body = lazy(loader);
    BODIES.set(key, body);
  }
  return body;
};

export default function ArticlePage() {
  const lang = useLang();
  const t = TEXT[lang];
  const { slug = "" } = useParams();
  const article = getArticle(slug) as ArticleMeta | undefined;
  const Body = bodyOf(slug, lang);
  const meta = article ? local(article, lang) : null;
  const raw = article && (lang === "en" ? article.en : article);
  useSeo({
    title: raw?.title,
    description: raw?.excerpt,
    path: `/threads/${slug}`,
    type: "article",
    article,
  });

  if (!article || !meta || !Body) return <Navigate to={to("/threads", lang)} replace />;

  const list = (articles as ArticleMeta[]).slice().sort((a, b) => b.date.localeCompare(a.date));
  const i = list.findIndex((a) => a.slug === slug);
  const around = [
    { a: list[i - 1], label: t.newer, side: "" },
    { a: list[i + 1], label: t.older, side: "col-start-2 text-right max-lg:col-start-1 max-lg:text-left" },
  ].filter((n): n is { a: ArticleMeta; label: string; side: string } => !!n.a);

  const facts: [string, ReactNode][] = [
    [t.author, article.author],
    [t.published, shortDate(article.date, lang)],
    [t.reading, article.readTime],
  ];
  if (t.translated)
    facts.push([
      t.translated,
      <Link to={`/threads/${slug}`} hrefLang="fr" className="underline decoration-dotted underline-offset-4 hover:decoration-solid">
        {t.original}
      </Link>,
    ]);

  return (
    <SiteLayout>
      <article>
        <header className="mx-auto max-w-[1100px] px-pad pb-[6vh] pt-[20vh] max-lg:pt-[16vh]">
          <Link to={to("/threads", lang)} className="oz-label text-oz-cream/60 transition-colors hover:text-oz-cream">
            {t.all}
          </Link>
          <p className="oz-label mt-[5vh] text-oz-cream/60">{meta.categories.join(" · ")}</p>
          <h1 className="mt-[2vh] font-oz-serif text-[length:clamp(34px,5.2vw,76px)] font-medium leading-[1.04]">{meta.title}</h1>
          <p className="mt-[3vh] max-w-[60ch] text-oz-body2 text-oz-cream/80">{meta.excerpt}</p>
          <dl className="mt-[4vh] flex flex-wrap gap-x-10 gap-y-3 border-t border-dotted border-oz-cream/30 pt-5 font-oz-mono text-[12px]">
            {facts.map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-oz-cream/45">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="oz-prose mx-auto max-w-[900px] px-pad pb-[12vh]">
          <Suspense fallback={<p className="oz-label py-20 text-center text-oz-cream/50">{t.loading}</p>}>
            <Body darkMode />
          </Suspense>
        </div>
      </article>

      {around.length > 0 && (
        <nav className="mx-auto grid max-w-[1100px] grid-cols-2 gap-4 px-pad pb-[14vh] max-lg:grid-cols-1" aria-label={t.more}>
          {around.map(({ a, label, side }) => {
            const l = local(a, lang);
            return (
              <Link
                key={a.slug}
                to={to(`/threads/${a.slug}`, lang)}
                className={`group rounded-[14px] border border-dotted border-oz-cream/30 p-6 transition-colors hover:border-oz-cream/70 ${side}`}
              >
                <span className="oz-label text-[10px] text-oz-cream/50">{label}</span>
                <span className="oz-label mt-4 block text-[10px] text-oz-cream/50">{l.categories.join(" · ")}</span>
                <span className="mt-3 block font-oz-serif text-[22px] font-medium leading-[1.15] underline-offset-4 group-hover:underline">
                  {l.title}
                </span>
                <span className="mt-3 block font-oz-mono text-[11px] text-oz-cream/50">
                  {a.author} · {a.readTime}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </SiteLayout>
  );
}
