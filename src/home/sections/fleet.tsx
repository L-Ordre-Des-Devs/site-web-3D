import { LOCALE, texts, useLang } from "../../i18n";
import { MEMBRES } from "../membres";
import { DISCORD, Out, Roll, Scrub } from "../ui";

const TEXT = texts({
  fr: {
    kicker: "Rejoindre l'Ordre",
    title: (n: string) => `Le serveur compte ${n} membres.`,
    text: "Développeurs et experts en cybersécurité y posent leurs questions, relisent du code et partagent ce qu'ils apprennent, majoritairement en français.",
    cta: "Rejoindre le Discord",
    seasonKicker: "Saison des fêtes",
    seasonTitle: "Noël sur le serveur",
    seasonText: "La bannière de fin d'année de la communauté. Réalisée sur Blender.",
    seasonAlt:
      "La bannière de Noël du serveur : sur une place enneigée, un droïde coiffé d'un bonnet de Père Noël tient le drapeau de l'Ordre des Devs près d'un grand sapin illuminé ; un croiseur flotte dans le ciel.",
  },
  en: {
    kicker: "Join the Order",
    title: (n: string) => `The server has ${n} members.`,
    text: "Developers and cybersecurity experts ask their questions there, review code and share what they learn, mostly in French.",
    cta: "Join the Discord",
    seasonKicker: "Holiday season",
    seasonTitle: "Christmas on the server",
    seasonText: "The community's end-of-year banner. Made in Blender.",
    seasonAlt:
      "The server's Christmas banner: in a snowy square, a droid in a Santa hat holds the flag of L'Ordre des Devs next to a tall lit-up Christmas tree; a cruiser floats in the sky.",
  },
});

const BANNER = (ext: "avif" | "jpg") => [1280, 1920, 2560, 3840].map((w) => `/noel/banniere-v2-${w}.${ext} ${w}w`).join(", ");
const BANNER_SIZES = "(max-width: 767px) calc(133vw - 53px), (max-width: 1023px) calc(100vw - 40px), (max-width: 1258px) 94vw, 1180px";

export function Fleet() {
  const lang = useLang();
  const t = TEXT[lang];
  return (
    <section id="escadrille" data-look="fleet" data-theme="dark" aria-labelledby="escadrille-titre" className="relative h-[240vh]" data-fleet>
      <div className="sticky top-0 h-svh overflow-hidden" data-pose="awayUp">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[50vh] bg-gradient-to-t from-[#04070d]/80 via-[#04070d]/40 to-transparent max-lg:h-[62vh]" aria-hidden="true" />
        <div className="absolute bottom-[12vh] left-pad w-[min(40vw,640px)] [text-shadow:0_2px_30px_rgb(4_7_13/0.8)] max-lg:inset-x-pad max-lg:bottom-[7vh] max-lg:w-auto">
          <p className="oz-label text-oz-cream/60">{t.kicker}</p>
          <h2 id="escadrille-titre" className="oz-display mt-[1.8vh] text-[length:max(26px,calc(46*var(--oz-u)))] leading-[1.02]">
            <Scrub text={t.title(MEMBRES.count.toLocaleString(LOCALE[lang]))} />
          </h2>
          <p className="mt-[2.4vh] max-w-[46ch] text-oz-body3 text-oz-cream/80" data-reveal>
            {t.text}
          </p>
          <div className="mt-[3.5vh]">
            <Out href={DISCORD} className="oz-pill oz-pill--cream [text-shadow:none]">
              <Roll>{t.cta}</Roll>
            </Out>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Season() {
  const t = TEXT[useLang()];
  return (
    <section id="noel" data-look="cream" data-pose="awayDown" data-theme="light" aria-labelledby="noel-titre" className="oz-theme-light relative px-pad pb-[18vh] pt-[4vh]">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex items-end justify-between gap-[4vw] max-lg:flex-col max-lg:items-start max-lg:gap-4" data-reveal>
          <div>
            <p className="oz-label text-oz-ink/60">{t.seasonKicker}</p>
            <h2 id="noel-titre" className="oz-display mt-[1.6vh] text-oz-h2">
              {t.seasonTitle}
            </h2>
          </div>
          <p className="max-w-[40ch] text-oz-body3 text-oz-ink/70">{t.seasonText}</p>
        </div>
        <figure className="oz-postcard mt-[5vh]" data-reveal>
          <picture className="contents">
            <source type="image/avif" srcSet={BANNER("avif")} sizes={BANNER_SIZES} />
            <img
              src="/noel/banniere-v2-1920.jpg"
              srcSet={BANNER("jpg")}
              sizes={BANNER_SIZES}
              width={1920}
              height={1080}
              alt={t.seasonAlt}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <span className="oz-snow" aria-hidden="true" />
          <span className="oz-snow oz-snow--far" aria-hidden="true" />
        </figure>
      </div>
    </section>
  );
}
