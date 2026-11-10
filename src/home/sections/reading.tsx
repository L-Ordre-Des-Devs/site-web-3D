import { Link } from "react-router-dom";
import { articles } from "../../pages/threads/index";
import { LOCALE, texts, to, useLang, type Lang } from "../../i18n";
import { local, type ArticleMeta } from "../../site/text";
import { GITHUB, Out } from "../ui";
import { PLAN_COLORS, PlanChart, PlanDetail, PlanDev, PlanDraw, PlanLabels, planInfoAt } from "./flightplan";

const TEXT = texts({
  fr: {
    readTime: (time: string) => `${time} de lecture`,
    readArticle: "Lire l'article",
    allCat: "Hors-série",
    allTitle: "Tous les articles",
    allBy: "La communauté",
    allCount: (n: number) => `${n} articles`,
    allWhen: "Depuis 2023",
    allCta: "Ouvrir les archives",
    head: "Archives",
    issue: "Numéro",
    no: "N°",
    titleTop: "Écrits par",
    titleGlow: "les membres",
    infos: "Bon à savoir",
    cards: [
      { title: "Gratuit", text: "Aucun abonnement. Le Patreon est un soutien facultatif : il n'ouvre ni salon, ni contenu, ni avantage réservé." },
      { title: "Tous niveaux", text: "Du premier « Hello World » à la pratique professionnelle. Les salons sont organisés par domaine : débutants et professionnels s'y croisent." },
      { title: "Cadre légal", text: "Tolérance zéro pour les demandes illégales ou non éthiques. Aucune aide n'est fournie pour ce genre d'activité." },
      { title: "Open source", text: "Le code du site est public sur GitHub.", link: "Voir le dépôt" },
      { title: "Freelances", text: "Un espace dédié pour publier une mission et collaborer avec les freelances de la communauté." },
      { title: "Francophone", text: "Les échanges se font majoritairement en français, quel que soit le pays d'où l'on écrit." },
    ] as { title: string; text: string; link?: string }[],
  },
  en: {
    readTime: (time: string) => `${time} read`,
    readArticle: "Read the article",
    allCat: "Special issue",
    allTitle: "All articles",
    allBy: "The community",
    allCount: (n: number) => `${n} articles`,
    allWhen: "Since 2023",
    allCta: "Open the archives",
    head: "Archives",
    issue: "Issue",
    no: "No.",
    titleTop: "Written by",
    titleGlow: "the members",
    infos: "Good to know",
    cards: [
      { title: "Free", text: "No subscription. Patreon is optional support: it doesn't unlock any channel, content or perk." },
      { title: "All levels", text: "From a first “Hello World” to professional practice. Channels are organized by field: beginners and professionals meet there." },
      { title: "Law-abiding", text: "Zero tolerance for illegal or unethical requests. No help is given for that kind of activity." },
      { title: "Open source", text: "The site's code is public on GitHub.", link: "View the repository" },
      { title: "Freelance", text: "A dedicated space to post a job and work with the community's freelancers." },
      { title: "French-speaking", text: "Conversations happen mostly in French, whatever country you're writing from." },
    ],
  },
});

interface Issue {
  key: string;
  href: string;
  n: number;
  cat: string;
  title: string;
  lede?: string;
  lines?: string[];
  by: string;
  read: string;
  when: string;
  cta: string;
  bg: string;
  snap: string;
  light?: boolean;
}

const LOOK: Record<string, { bg: string; snap: string }> = {
  "hello-world-collection": { bg: "#3e4a2c", snap: "c1" },
  "logiciels-developpement-jeux": { bg: "#78301a", snap: "c2" },
  "metiers-jeu-video": { bg: "#2b1e16", snap: "c3" },
  "premier-jeu-video-guide": { bg: "#1d2535", snap: "c4" },
  "vulnerabilities-blockchains": { bg: "#151318", snap: "c5" },
  "unity-ml-agents": { bg: "#4a3323", snap: "c6" },
};

const month = (iso: string, lang: Lang) => new Date(iso).toLocaleDateString(LOCALE[lang], { month: "long", year: "numeric" });

function issues(lang: Lang): Issue[] {
  const t = TEXT[lang];
  const list = (articles as ArticleMeta[]).slice().sort((a, b) => b.date.localeCompare(a.date));
  return [
    ...list.map((a, i) => {
      const l = local(a, lang);
      return {
        key: a.slug,
        href: to(`/threads/${a.slug}`, lang),
        n: i + 1,
        cat: l.categories.join(" · "),
        title: l.title,
        lede: l.excerpt,
        by: a.author,
        read: t.readTime(a.readTime),
        when: month(a.date, lang),
        cta: t.readArticle,
        ...(LOOK[a.slug] ?? { bg: "#2b1e16", snap: "c3" }),
      };
    }),
    {
      key: "tous",
      href: to("/threads", lang),
      n: list.length + 1,
      cat: t.allCat,
      title: t.allTitle,
      lines: list.map((a) => local(a, lang).title),
      by: t.allBy,
      read: t.allCount(list.length),
      when: t.allWhen,
      cta: t.allCta,
      bg: "#efe1ca",
      snap: "c7",
      light: true,
    },
  ];
}

function Cover({ it }: { it: Issue }) {
  const t = TEXT[useLang()];
  return (
    <div className={`oz-mag ${it.light ? "oz-mag--light" : ""}`} style={{ background: it.bg }}>
      <p className="oz-mag__head">{t.head}</p>
      <p className="oz-mag__issue">
        <span>
          {t.issue} {String(it.n).padStart(2, "0")}
        </span>
        <span>{it.when}</span>
      </p>
      <div className="oz-mag__art">
        <img data-snap={it.snap} alt="" />
      </div>
      <div className="oz-mag__body">
        <p className="oz-mag__cat">{it.cat}</p>
        <p className="oz-mag__title">{it.title}</p>
        {it.lines ? (
          <ul className="oz-mag__lines">
            {it.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        ) : (
          <p className="oz-mag__lede">{it.lede}</p>
        )}
      </div>
      <p className="oz-mag__no">
        {t.no}
        <b>{it.n}</b>
      </p>
      <p className="oz-mag__by">
        {it.by}
        <br />
        {it.read}
      </p>
      <p className="oz-mag__cta">{it.cta} →</p>
      <span className="oz-mag__code" />
    </div>
  );
}

export function Archives() {
  const lang = useLang();
  const t = TEXT[lang];
  const list = issues(lang);
  return (
    <section id="articles" data-look="dark" data-theme="dark" aria-labelledby="articles-titre" className="relative h-[560vh]" data-gallery>
      <span className="pointer-events-none absolute left-0 top-0 w-px" data-pose="cover" data-anchor="[data-g-square]" data-anchor-ref="[data-g-sticky]" data-g-mark="a" />
      <span className="pointer-events-none absolute left-0 w-px" data-pose="gallery" data-anchor="[data-g-core]" data-anchor-ref="[data-g-sticky]" data-g-mark="c" />
      <div className="oz-g sticky top-0 h-svh" data-g-sticky>
        <span className="oz-g__square" data-g-square aria-hidden="true" />
        <span className="oz-g__core" data-g-core aria-hidden="true" />
        <div className="oz-g__thumbs" data-g-thumbs aria-hidden="true">
          {list.map((it, i) => (
            <div key={it.key} className="oz-g__thumb" data-g-thumb={i}>
              <Cover it={it} />
            </div>
          ))}
        </div>
        <div className="oz-g__clip" data-g-clip>
          {list.map((it, i) => (
            <Link key={it.key} to={it.href} className="oz-g__big" data-g-big={i}>
              <Cover it={it} />
            </Link>
          ))}
        </div>
        <div className="oz-g__frame" data-g-frame aria-hidden="true">
          <svg className="oz-g__sight" viewBox="0 0 100 100" preserveAspectRatio="none" data-g-sight>
            <circle cx="50" cy="50" r="41" />
            <path d="M50 0v5M50 95v5M0 50h5M95 50h5" />
          </svg>
          <span className="oz-g__dot" />
        </div>
        <h2 id="articles-titre" className="oz-g__head" data-g-head>
          <span className="oz-label block text-oz-sub1">{t.titleTop}</span>
          <span className="oz-glow block whitespace-nowrap text-oz-h3 font-bold leading-none tracking-[-0.03em]">{t.titleGlow}</span>
        </h2>
      </div>
    </section>
  );
}

export function Infos() {
  const t = TEXT[useLang()];
  return (
    <section id="infos" data-look="plan" data-theme="dark" aria-labelledby="infos-titre" className="oz-plan relative lg:h-[520vh]" data-plan data-lead-narrow="0.7">
      <div className="relative flex flex-col px-pad pb-[8vh] pt-[calc(max(54px,6.5vh)+3vh)] lg:sticky lg:top-0 lg:h-svh lg:pb-[11vh]" data-pose="awayRight" data-lead-narrow="0.7" data-plan-sticky>
        <div className="pointer-events-none absolute inset-x-0 top-[13vh] h-[55vh] max-lg:hidden" data-plan-fit aria-hidden="true" />
        <div className="relative flex items-baseline justify-between gap-8 max-lg:flex-col max-lg:gap-2">
          <h2 id="infos-titre" className="oz-label flex-none text-oz-cream/60">
            {t.infos}
          </h2>
          <PlanDev className="text-right max-lg:text-left" />
        </div>
        <div className="relative mt-[2vh] max-lg:h-[46vh] lg:absolute lg:inset-0 lg:mt-0" data-plan-draw>
          <PlanLabels />
          <div className="oz-plan__fallback lg:hidden">
            <PlanDraw variant="narrow" className="absolute inset-0 h-full w-full" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62vh] bg-gradient-to-t from-[#04070d] via-[#04070d]/85 to-transparent max-lg:hidden" aria-hidden="true" />
        <div className="relative min-h-0 flex-1 max-lg:hidden">
          <div className="oz-plan__fallback">
            <PlanDraw variant="wide" className="absolute inset-0 h-full w-full" />
          </div>
        </div>
        <div className="relative mt-[1.5vh] grid h-[15vh] grid-cols-[76fr_22fr] grid-rows-[minmax(0,1fr)] gap-[1.8vw] max-lg:mt-4 max-lg:h-auto max-lg:grid-cols-2 max-lg:grid-rows-none max-lg:gap-x-3 max-lg:gap-y-4">
          <PlanChart variant="wide" className="h-full w-full max-lg:hidden" />
          <PlanChart variant="narrow" className="col-span-2 h-[17vh] w-full lg:hidden" />
          <PlanDetail className="h-full w-full max-lg:col-span-2 max-lg:h-[22vh]" />
        </div>
        <ol className="relative mt-[3.5vh] grid grid-cols-6 gap-[1.8vw] max-lg:mt-8 max-lg:grid-cols-1 max-lg:gap-0">
          {t.cards.map((c, i) => (
            <li key={c.title} className="oz-plan__info" style={planInfoAt(i)}>
              <p className="oz-plan__infonum" style={{ color: PLAN_COLORS[i % 2] }}>
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-[1vh] font-oz-display text-[length:max(17px,calc(26*var(--oz-u)))] font-bold uppercase leading-none tracking-[-0.01em] max-lg:mt-0">
                {c.title}
              </h3>
              <p className="mt-[1.2vh] text-oz-body3 text-oz-cream/75 max-lg:mt-2">
                {c.text}{" "}
                {c.link && (
                  <Out href={GITHUB} className="underline underline-offset-[3px]">
                    {c.link}
                  </Out>
                )}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
