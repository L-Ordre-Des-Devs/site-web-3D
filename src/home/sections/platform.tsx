import { texts, useLang } from "../../i18n";
import { DISCORD, Lines, Out, Roll, Scrub, vars } from "../ui";

const TEXT = texts({
  fr: {
    kicker: "En préparation",
    title: "Les challenges et le classement arrivent.",
    intro:
      "Des exercices conçus par la communauté, à résoudre seul ou en équipe, dans sept catégories. La date d'ouverture sera annoncée sur le Discord.",
    done: "Fait",
    scopeTitle: "Périmètre\ndu premier lot",
    scope: ["Exploitation web", "Cryptographie", "Stéganographie", "Réseau", "Reverse engineering", "Forensics", "Pwn"],
    ongoing: "En cours",
    backendTitle: "Le backend du site",
    backendFlow: "Avancement du site",
    terminal: ["site --interface", "site --backend", "$ ouvrir --challenges"],
    backendText: "Le développement du backend du site est en cours.",
    soon: "À venir",
    openTitle: "L'ouverture",
    flag: "flag{bientôt}",
    openText: "La date sera annoncée sur le Discord.",
    notify: "Être prévenu sur Discord",
  },
  en: {
    kicker: "In the works",
    title: "Challenges and the leaderboard are on their way.",
    intro:
      "Exercises designed by the community, to solve alone or as a team, across seven categories. The opening date will be announced on the Discord.",
    done: "Done",
    scopeTitle: "Scope of\nthe first batch",
    scope: ["Web exploitation", "Cryptography", "Steganography", "Networking", "Reverse engineering", "Forensics", "Pwn"],
    ongoing: "In progress",
    backendTitle: "The site's backend",
    backendFlow: "Site progress",
    terminal: ["site --frontend", "site --backend", "$ open --challenges"],
    backendText: "Work on the site's backend is under way.",
    soon: "Coming up",
    openTitle: "The launch",
    flag: "flag{soon}",
    openText: "The date will be announced on the Discord.",
    notify: "Get notified on Discord",
  },
});

function CardHead({ index, status, dot }: { index: string; status: string; dot: string }) {
  return (
    <p className="oz-label flex items-center justify-between text-[10px] tracking-[0.06em]">
      <span className="font-oz-mono font-normal opacity-60">{index}</span>
      <span className="inline-flex items-center gap-[0.6em] rounded-full border border-current/20 px-[0.9em] py-[0.45em]">
        <i className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
        {status}
      </span>
    </p>
  );
}

export function Challenges() {
  const t = TEXT[useLang()];
  return (
    <section id="challenges" aria-labelledby="challenges-titre" className="relative">
      <div className="relative h-[280vh]" data-walkers data-theme="dark">
        <div className="sticky top-0 h-svh overflow-hidden" data-look="walkers" data-pose="awayDown">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_10%,rgb(10_30_66/0.5),transparent)] max-lg:bg-[radial-gradient(ellipse_140%_62%_at_0%_0%,rgb(10_30_66/0.62),transparent)]" aria-hidden="true" />
          <div className="absolute left-pad top-[14vh] w-[min(50vw,800px)] [text-shadow:0_2px_26px_rgb(8_24_52/0.5)] max-lg:inset-x-pad max-lg:top-[12vh] max-lg:w-auto">
            <p className="oz-label text-oz-cream/70">{t.kicker}</p>
            <h2 id="challenges-titre" className="oz-display mt-[1.8vh] text-[length:max(30px,calc(62*var(--oz-u)))] leading-[1.02]">
              <Scrub text={t.title} />
            </h2>
            <p className="mt-[2.6vh] max-w-[46ch] text-oz-body3 text-oz-cream/85" data-reveal>
              {t.intro}
            </p>
          </div>
        </div>
      </div>

      <div data-look="cream" data-pose="awayDown" data-theme="light" className="oz-theme-light relative px-pad pb-[20vh] pt-[14vh]">
        <div className="grid grid-cols-3 gap-[1.1vw] max-lg:grid-cols-1 max-lg:gap-3">
          <article className="oz-ccard flex min-h-[64vh] flex-col bg-oz-green text-oz-cream max-lg:min-h-0" data-reveal>
            <CardHead index="01" status={t.done} dot="bg-[#9fd27f]" />
            <h3 className="oz-display mt-[3.5vh] text-[length:max(20px,calc(30*var(--oz-u)))] leading-[1.02]">
              <Lines text={t.scopeTitle} />
            </h3>
            <ol className="mt-auto grid grid-cols-2 gap-x-5 border-t border-dotted border-oz-cream/35 pt-5 max-lg:mt-8">
              {t.scope.map((c, i) => (
                <li key={c} className="flex items-baseline gap-2.5 border-b border-dotted border-oz-cream/20 py-2.5 text-oz-body3">
                  <span className="font-oz-mono text-[11px] text-oz-cream/55">{String(i + 1).padStart(2, "0")}</span>
                  {c}
                </li>
              ))}
            </ol>
          </article>

          <article className="oz-ccard flex min-h-[64vh] flex-col bg-oz-ink text-oz-cream max-lg:min-h-0" data-reveal style={vars({ "--delay": "0.1s" })}>
            <CardHead index="02" status={t.ongoing} dot="bg-oz-orange" />
            <h3 className="oz-display mt-[3.5vh] text-[length:max(20px,calc(30*var(--oz-u)))] leading-[1.02]">{t.backendTitle}</h3>
            <div className="mt-auto overflow-hidden rounded-[10px] border border-oz-cream/15 bg-[#0a0603] max-lg:mt-8" aria-label={t.backendFlow}>
              <p className="flex items-center gap-1.5 border-b border-oz-cream/10 px-3.5 py-2.5" aria-hidden="true">
                <i className="h-2 w-2 rounded-full bg-oz-cream/20" />
                <i className="h-2 w-2 rounded-full bg-oz-cream/20" />
                <i className="h-2 w-2 rounded-full bg-oz-cream/20" />
                <span className="ml-2 font-oz-mono text-[11px] text-oz-cream/40">backend</span>
              </p>
              <pre className="whitespace-pre-wrap px-3.5 py-3.5 font-oz-mono text-[length:max(12px,calc(15*var(--oz-u)))] leading-[1.9]">
                <code>
                  <span className="text-oz-cream/45">$ </span>
                  {`${t.terminal[0]} `}
                  <span className="text-[#9fd27f]">✓</span>
                  {"\n"}
                  <span className="text-oz-cream/45">$ </span>
                  {`${t.terminal[1]} `}
                  <span className="oz-blink text-oz-ember">▌</span>
                  {"\n"}
                  <span className="text-oz-cream/30">{t.terminal[2]}</span>
                </code>
              </pre>
            </div>
            <p className="mt-5 max-w-[38ch] text-oz-body3 text-oz-cream/80">{t.backendText}</p>
          </article>

          <article className="oz-ccard flex min-h-[64vh] flex-col bg-oz-orange text-oz-cream max-lg:min-h-0" data-reveal style={vars({ "--delay": "0.2s" })}>
            <CardHead index="03" status={t.soon} dot="border border-current" />
            <h3 className="oz-display mt-[3.5vh] text-[length:max(20px,calc(30*var(--oz-u)))] leading-[1.02]">{t.openTitle}</h3>
            <p className="mt-auto break-all font-oz-mono text-[length:max(26px,calc(46*var(--oz-u)))] leading-[1.05] max-lg:mt-8" aria-hidden="true">
              {t.flag}
            </p>
            <p className="mt-5 max-w-[38ch] text-oz-body3">{t.openText}</p>
            <Out href={DISCORD} className="oz-pill oz-pill--ink mt-[2.4vh] self-start">
              <Roll>{t.notify}</Roll>
            </Out>
          </article>
        </div>
      </div>
    </section>
  );
}
