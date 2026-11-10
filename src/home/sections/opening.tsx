import { LOCALE, texts, useLang } from "../../i18n";
import { MEMBRES } from "../membres";
import { Lines, Scrub, vars } from "../ui";

const TEXT = texts({
  fr: {
    since: "Communauté francophone depuis 2023.",
    pitch: (n: string) => `Rejoignez ${n} développeurs et experts en cybersécurité. Apprenez, partagez, et construisez l'avenir ensemble.`,
    introTitle: "Ce qu'on trouve sur le serveur.",
    introText:
      "Des salons par domaine, des relectures de code, un pôle cybersécurité et des événements réguliers. Le tout animé par des membres bénévoles.",
    askKicker: "Avant de poster sur le serveur",
    askTitle: "Bien poser\nsa question",
    tips: [
      { title: "Le bon salon", text: "Celui du pôle concerné : DEV ou CYBERSEC." },
      { title: "Le code concerné", text: "Collé dans un bloc de code, pour qu'on puisse le copier." },
      { title: "L'erreur complète", text: "Le message d'erreur en entier, tel qu'il s'affiche." },
      { title: "Ce que vous avez essayé", text: "Pour éviter qu'on vous propose la même piste." },
    ],
  },
  en: {
    since: "French-speaking community since 2023.",
    pitch: (n: string) => `Join ${n} developers and cybersecurity experts. Learn, share and build projects together.`,
    introTitle: "What you'll find on the server.",
    introText: "Channels for each field, code reviews, a cybersecurity track and regular events. All run by volunteer members.",
    askKicker: "Before you post on the server",
    askTitle: "How to ask\nyour question",
    tips: [
      { title: "The right channel", text: "The one for your track: DEV or CYBERSEC." },
      { title: "The code involved", text: "Pasted in a code block, so others can copy it." },
      { title: "The full error", text: "The whole error message, exactly as it appears." },
      { title: "What you've tried", text: "So nobody suggests something you've already ruled out." },
    ],
  },
});

export function Hero() {
  const lang = useLang();
  const t = TEXT[lang];
  return (
    <section id="accueil" data-look="space" data-pose="hero" data-theme="dark" aria-labelledby="hero-titre" className="relative h-svh">
      <div className="absolute left-pad top-[max(74px,9.5vh)] [text-shadow:0_2px_40px_rgb(16_9_4/0.35)] max-lg:top-[84px]">
        <h1 id="hero-titre" className="oz-display text-[length:max(44px,calc(132*var(--oz-u)))] leading-[0.9] text-oz-cream max-lg:text-[min(13vw,11vh)]">
          <span className="oz-line">
            <span>L'Ordre</span>
          </span>
          <span className="oz-line">
            <span style={vars({ "--delay": "0.08s" })}>des Devs</span>
          </span>
        </h1>
        <p className="oz-enter oz-label mt-[2.2vh] text-[length:max(12px,calc(19*var(--oz-u)))] text-oz-cream/80" style={vars({ "--delay": "0.45s" })}>
          {t.since}
        </p>
      </div>

      <p
        className="oz-enter absolute right-[calc(var(--oz-pad)+3vw)] top-[47vh] w-[min(29vw,540px)] text-oz-body2 font-medium [text-shadow:0_1px_24px_rgb(16_9_4/0.5)] max-lg:inset-x-pad max-lg:bottom-[calc(var(--oz-pad)+40px)] max-lg:top-auto max-lg:w-auto max-lg:text-[17px]"
        style={vars({ "--delay": "0.35s" })}
      >
        {t.pitch(MEMBRES.count.toLocaleString(LOCALE[lang]))}
      </p>
    </section>
  );
}

export function Intro() {
  const t = TEXT[useLang()];
  return (
    <section id="communaute" data-look="dark" data-theme="dark" aria-labelledby="intro-titre" className="relative h-[175vh]">
      <div className="sticky top-0 h-svh overflow-hidden" data-pose="intro">
        <h2
          id="intro-titre"
          className="oz-display absolute left-[7.5vw] top-1/2 max-w-[30vw] -translate-y-1/2 text-[length:max(24px,calc(40*var(--oz-u)))] leading-[1.02] max-lg:inset-x-pad max-lg:top-[14vh] max-lg:max-w-none max-lg:translate-y-0 max-lg:text-[30px]"
        >
          <Scrub text={t.introTitle} />
        </h2>
        <p className="absolute right-[7vw] top-1/2 w-[min(25vw,460px)] -translate-y-1/2 text-oz-body2 font-medium max-lg:inset-x-pad max-lg:bottom-[16vh] max-lg:top-auto max-lg:w-auto max-lg:translate-y-0 max-lg:text-[17px]">
          <Scrub text={t.introText} />
        </p>
      </div>
    </section>
  );
}

const TIPS = [
  { side: "left", row: 0 },
  { side: "left", row: 1 },
  { side: "right", row: 0 },
  { side: "right", row: 1 },
] as const;

export function Ask() {
  const t = TEXT[useLang()];
  return (
    <section id="question" data-look="iris" data-theme="dark" aria-labelledby="question-titre" className="relative h-[175vh]">
      <div className="sticky top-0 h-svh overflow-hidden" data-pose="humans">
        <p className="oz-label absolute inset-x-0 top-[11vh] text-center text-oz-orange max-lg:top-[12vh]">{t.askKicker}</p>
        <h2
          id="question-titre"
          className="oz-display absolute inset-x-0 top-[15vh] text-center text-[length:max(30px,calc(64*var(--oz-u)))] leading-[0.98] max-lg:top-[15.5vh]"
        >
          <Lines text={t.askTitle} />
        </h2>
        <ol className="max-lg:absolute max-lg:inset-x-pad max-lg:bottom-[5vh] max-lg:grid max-lg:grid-cols-2 max-lg:gap-x-4 max-lg:gap-y-4">
          {TIPS.map(({ side, row }, i) => (
            <li
              key={i}
              className={`oz-tip lg:absolute lg:w-[min(22vw,330px)] ${side === "left" ? "lg:right-[66vw] lg:text-right" : "lg:left-[66vw]"} ${
                row === 0 ? "lg:top-[44vh]" : "lg:top-[64vh]"
              }`}
              data-side={side}
              data-reveal
              style={vars({ "--delay": `${0.1 * i}s` })}
            >
              <span className="font-oz-mono text-[12px] text-oz-orange">0{i + 1}</span>
              <h3 className="oz-label mt-1 text-oz-sub1 max-lg:text-[13px]">{t.tips[i].title}</h3>
              <p className="mt-1 text-oz-body3 text-oz-cream/75 max-lg:text-[12.5px]">{t.tips[i].text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
