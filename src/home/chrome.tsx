import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getLenis } from "../hooks/useSmoothScroll";
import { texts, to, twin, useLang, type Lang } from "../i18n";
import { MARK_PATH } from "./markPath";
import { DISCORD, Out, Roll, vars } from "./ui";

const TEXT = texts({
  fr: {
    loading: "Chargement de la page",
    loader: "Chargement",
    skip: "Aller au contenu",
    menu: "Menu",
    close: "Fermer",
    brand: "L'Ordre des Devs, retour en haut",
    join: "Rejoindre",
    nav: "Menu principal",
    joinServer: "Rejoindre le serveur",
    write: "Écrire à l'Ordre",
    read: "Lire",
    allArticles: "Tous les articles",
    language: "Langue",
    scroll: "Défiler pour continuer",
    entries: [
      { label: "Accueil", fig: "Le sceau, de face" },
      { label: "Communauté", fig: "Le sceau, de trois quarts" },
      { label: "Pôles", fig: "Frappe argent" },
      { label: "Challenges", fig: "Frappe bronze" },
      { label: "Articles", fig: "La tranche cannelée" },
      { label: "FAQ", fig: "Le revers" },
    ],
  },
  en: {
    loading: "Loading the page",
    loader: "Loading",
    skip: "Skip to content",
    menu: "Menu",
    close: "Close",
    brand: "L'Ordre des Devs, back to top",
    join: "Join",
    nav: "Main menu",
    joinServer: "Join the server",
    write: "Email the Order",
    read: "Read",
    allArticles: "All articles",
    language: "Language",
    scroll: "Scroll to continue",
    entries: [
      { label: "Home", fig: "The seal, front view" },
      { label: "Community", fig: "The seal, three-quarter view" },
      { label: "Tracks", fig: "Struck in silver" },
      { label: "Challenges", fig: "Struck in bronze" },
      { label: "Articles", fig: "The reeded edge" },
      { label: "FAQ", fig: "The reverse" },
    ],
  },
});

const SPLASH_STARS = (() => {
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 170 }, () => ({ x: rnd() * 100, y: rnd() * 100, r: 0.04 + Math.pow(rnd(), 4) * 0.2, o: 0.25 + rnd() * 0.75 }));
})();

export function Sky({ className = "", scale = 1 }: { className?: string; scale?: number }) {
  return (
    <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {SPLASH_STARS.map((st, i) => (
        <circle key={i} cx={st.x} cy={st.y} r={st.r * scale} fill="#ffedd7" opacity={st.o} />
      ))}
    </svg>
  );
}

export function SkipLink() {
  return (
    <a href="#contenu" className="fixed left-pad top-[-100px] z-[100] rounded-full bg-oz-cream px-5 py-3 font-bold text-oz-ink focus:top-3">
      {TEXT[useLang()].skip}
    </a>
  );
}

export function Loader() {
  const t = TEXT[useLang()];
  return (
    <div
      className="oz-loader"
      role="progressbar"
      aria-label={t.loading}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      data-loader
      style={vars({ "--p": 0 })}
    >
      <Sky className="oz-loader__sky absolute inset-0 h-full w-full" />
      <div className="oz-loader__mark absolute left-1/2 top-1/2 w-[min(46vmin,420px)] -translate-x-1/2 -translate-y-1/2">
        <svg viewBox="-1.08 -1.08 2.16 2.16" className="h-auto w-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="oz-gold" x1="0" y1="-1" x2="0.4" y2="1" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#f6dfa7" />
              <stop offset="0.45" stopColor="#d9b46f" />
              <stop offset="0.7" stopColor="#a8783e" />
              <stop offset="1" stopColor="#e9c98a" />
            </linearGradient>
          </defs>
          <path className="ghost" d={MARK_PATH} />
          <path className="fill" d={MARK_PATH} fillRule="evenodd" />
          <path className="ink" d={MARK_PATH} pathLength={1} />
        </svg>
      </div>
      <p className="oz-loader__brand oz-label absolute left-pad top-[max(22px,4vh)] text-oz-cream/70">L'Ordre des Devs</p>
      <p className="oz-loader__label oz-label absolute bottom-[max(26px,5vh)] left-pad text-oz-cream/60">{t.loader}</p>
      <p className="oz-loader__count oz-display absolute bottom-[max(18px,4vh)] right-pad flex items-start text-[length:clamp(56px,8vw,140px)] leading-[0.8] text-oz-cream">
        <span className="tabular-nums" data-pct>
          0
        </span>
        <span className="ml-[0.08em] text-[0.32em] leading-none text-oz-orange">%</span>
      </p>
      <span className="oz-loader__bar absolute inset-x-0 bottom-0 h-[2px] origin-left bg-oz-orange" aria-hidden="true" />
    </div>
  );
}

const MENU = ["accueil", "communaute", "poles", "challenges", "articles", "faq"];
const WIDE = "(min-width: 1024px)";
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

const LANGS: { lang: Lang; name: string }[] = [
  { lang: "fr", name: "Français" },
  { lang: "en", name: "English" },
];

export function Header({ base = "" }: { base?: string }) {
  const lang = useLang();
  const t = TEXT[lang];
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(0);
  const [stack, setStack] = useState<number[]>(() => MENU.map((_, i) => (i === 0 ? 1 : 0)));
  const [warm, setWarm] = useState(false);
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const was = useRef(false);

  useEffect(() => {
    const query = window.matchMedia(WIDE);
    const change = () => setWide(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    if (warm || !wide) return undefined;
    const html = document.documentElement;
    const idle = typeof window.requestIdleCallback === "function";
    let id = 0;
    let asked = false;
    const go = () => {
      if (asked || document.readyState !== "complete" || !html.classList.contains("oz-ready")) return;
      asked = true;
      id = idle ? window.requestIdleCallback(() => setWarm(true), { timeout: 3000 }) : window.setTimeout(() => setWarm(true), 1200);
    };
    const watch = new MutationObserver(go);
    watch.observe(html, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("load", go);
    go();
    return () => {
      watch.disconnect();
      window.removeEventListener("load", go);
      if (idle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, [warm, wide]);

  useEffect(() => {
    document.documentElement.classList.toggle("oz-menu-open", open);
    if (open) getLenis()?.stop();
    else if (was.current) getLenis()?.start();
    was.current = open;
    if (!open) return;
    const first = window.setTimeout(() => panel.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true }), 420);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = [button.current, ...Array.from(panel.current?.querySelectorAll<HTMLElement>("a") ?? [])].filter((el): el is HTMLElement => !!el);
      const i = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === items.length - 1 ? 0 : i + 1;
      e.preventDefault();
      items[next]?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(first);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(
    () => () => {
      document.documentElement.classList.remove("oz-menu-open");
      if (was.current) getLenis()?.start();
    },
    [],
  );

  const show = (i: number) => {
    if (i === shown) return;
    setShown(i);
    setStack((s) => s.map((z, k) => (k === i ? Math.max(...s) + 1 : z)));
  };
  const close = () => setOpen(false);

  return (
    <>
      <header className="oz-top pointer-events-none fixed inset-x-0 top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-center px-pad py-[max(14px,calc(var(--oz-pad)*0.55))] [&>*]:pointer-events-auto">
        <button
          ref={button}
          type="button"
          className="oz-menu-btn oz-label flex items-center gap-[0.9em] justify-self-start py-[0.8em] text-[length:max(12px,calc(15*var(--oz-u)))]"
          aria-expanded={open}
          aria-controls="oz-menu"
          onClick={() => setOpen((o) => !o)}
          onPointerEnter={() => setWarm(true)}
          onFocus={() => setWarm(true)}
        >
          <span className="oz-burger" aria-hidden="true">
            <span />
            <span />
          </span>
          <span className="oz-burger__label">
            <span>{t.menu}</span>
            <span aria-hidden="true">{t.close}</span>
          </span>
        </button>
        <a
          href={base || "#accueil"}
          className="oz-brand inline-flex items-center gap-[0.55em] text-[length:max(15px,calc(21*var(--oz-u)))] font-bold leading-none tracking-[-0.01em]"
          aria-label={t.brand}
          onClick={close}
        >
          <span className="oz-brand__mark" aria-hidden="true" />
          <span className="max-sm:hidden">L'Ordre des Devs</span>
        </a>
        <Out href={DISCORD} className="oz-label justify-self-end py-[0.8em] text-[length:max(11px,calc(13*var(--oz-u)))]">
          <Roll>{t.join}</Roll>
        </Out>
      </header>

      <div id="oz-menu" ref={panel} className="oz-menu" data-open={open} aria-hidden={!open} data-lenis-prevent>
        <Sky className="oz-menu__sky" scale={0.45} />
        <div className="oz-menu__grid">
          <figure className="oz-menu__figure" aria-hidden="true">
            <div className="oz-menu__frame">
              {MENU.map((id, i) => (
                <img
                  key={id}
                  src={(warm || open) && wide ? `/menu/sceau-${i + 1}.webp` : undefined}
                  width={1112}
                  height={1391}
                  alt=""
                  decoding="async"
                  loading={warm || open ? "eager" : "lazy"}
                  data-on={shown === i}
                  style={{ zIndex: stack[i] }}
                />
              ))}
            </div>
            <figcaption className="oz-menu__caption">
              <span>
                Fig. {ROMAN[shown]} · {t.entries[shown].label}
              </span>
              <span>{t.entries[shown].fig}</span>
            </figcaption>
          </figure>

          <nav className="oz-menu__nav" aria-label={t.nav}>
            <ol className="oz-menu__list">
              {MENU.map((id, i) => (
                <li key={id} style={vars({ "--i": i })}>
                  <a
                    href={`${base}#${id}`}
                    data-nav={id}
                    className="oz-menu__link"
                    tabIndex={open ? 0 : -1}
                    onPointerEnter={() => show(i)}
                    onFocus={() => show(i)}
                    onClick={close}
                  >
                    <span className="oz-menu__n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="oz-menu__mask">
                      <span className="oz-menu__word">{t.entries[i].label}</span>
                    </span>
                    <span className="oz-menu__arrow" aria-hidden="true">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ol>
            <div className="oz-menu__foot">
              <p>
                <span className="oz-label">{t.joinServer}</span>
                <Out href={DISCORD} tabIndex={open ? 0 : -1}>
                  discord.gg/WUhvBf6vqw
                </Out>
              </p>
              <p>
                <span className="oz-label">{t.write}</span>
                <a href="mailto:contact@ordre-des-devs.org" tabIndex={open ? 0 : -1}>
                  contact@ordre-des-devs.org
                </a>
              </p>
              <p>
                <span className="oz-label">{t.read}</span>
                <Link to={to("/threads", lang)} tabIndex={open ? 0 : -1} onClick={close}>
                  {t.allArticles}
                </Link>
              </p>
              <p>
                <span className="oz-label">{t.language}</span>
                <span className="oz-menu__lang">
                  {LANGS.map((l) => (
                    <Link
                      key={l.lang}
                      to={twin(pathname, l.lang)}
                      lang={l.lang}
                      hrefLang={l.lang}
                      aria-current={l.lang === lang ? "page" : undefined}
                      tabIndex={open ? 0 : -1}
                      onClick={close}
                    >
                      {l.name}
                    </Link>
                  ))}
                </span>
              </p>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

export function ScrollUI() {
  const t = TEXT[useLang()];
  return (
    <>
      <div className="pointer-events-none fixed inset-y-0 right-0 z-[38] w-[7px]" aria-hidden="true">
        <span
          className="oz-thumb pointer-events-auto absolute right-0 top-0 h-[14vh] w-full cursor-grab rounded-l-[3px] before:absolute before:inset-y-0 before:-left-[5px] before:right-0 before:content-['']"
          data-thumb
        />
      </div>
      <button
        type="button"
        className="oz-hint oz-label fixed bottom-[2.4vh] left-1/2 z-30 flex -translate-x-1/2 items-center gap-[0.9em] whitespace-nowrap text-[length:max(10px,calc(12*var(--oz-u)))] max-lg:hidden"
        data-next
      >
        <span className="oz-hint__icon relative h-[22px] w-[22px] rounded-full border border-dotted border-current" aria-hidden="true" />
        {t.scroll}
      </button>
    </>
  );
}
