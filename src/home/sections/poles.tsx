import { texts, useLang } from "../../i18n";
import { Construct } from "../ui";

const TEXT = texts({
  fr: {
    title: "Sur le serveur",
    poles: [
      {
        name: "Entraide",
        text: "Des salons par langage et par domaine pour poser ses questions, et des membres qui relisent le code qu'on y poste.",
        tags: ["Salons par langage", "Relecture de code", "Tous niveaux"],
      },
      {
        name: "Cybersécurité",
        text: "Un pôle dédié à la sécurité offensive et défensive, avec des exercices conçus par la communauté, dans un cadre strictement légal.",
        tags: ["Offensive", "Défensive", "Cadre légal"],
      },
      {
        name: "Événements",
        text: "Des hackathons, des CTF et des game jams, à faire seul ou en équipe, contre la montre.",
        tags: ["Hackathons", "CTF", "Game jams"],
      },
    ],
    seal: "Le sceau de l'Ordre",
  },
  en: {
    title: "On the server",
    poles: [
      {
        name: "Help",
        text: "Channels for each language and field where you can ask questions, and members who review the code you post there.",
        tags: ["Channels by language", "Code review", "All levels"],
      },
      {
        name: "Cybersecurity",
        text: "A track for offensive and defensive security, with exercises designed by the community, strictly within the law.",
        tags: ["Offensive", "Defensive", "Within the law"],
      },
      {
        name: "Events",
        text: "Hackathons, CTFs and game jams, solo or in teams, against the clock.",
        tags: ["Hackathons", "CTF", "Game jams"],
      },
    ],
    seal: "The Order's seal",
  },
});

const MARKS = ["entraide", "cyber", "events"];

export function Poles() {
  const t = TEXT[useLang()];
  return (
    <section id="poles" data-look="poles" data-theme="dark" aria-labelledby="poles-titre" className="relative h-[390vh]" data-poles>
      {MARKS.map((m, i) => (
        <span
          key={m}
          className="pointer-events-none absolute left-0 w-px"
          style={{ top: `${i * 110}vh`, height: i === MARKS.length - 1 ? "170vh" : "110vh" }}
          data-pose={m}
          data-mark
        />
      ))}
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-y-0 left-pad flex w-[min(48vw,760px)] flex-col justify-center max-lg:inset-x-pad max-lg:bottom-[3.5vh] max-lg:top-auto max-lg:w-auto">
          <h2 id="poles-titre" className="oz-label flex items-baseline justify-between text-oz-cream/60">
            {t.title}
            <span className="font-oz-mono font-normal normal-case tracking-normal">
              <b className="font-medium text-oz-cream" data-count>
                01
              </b>{" "}
              / 03
            </span>
          </h2>
          <ol className="mt-[3vh] max-lg:mt-[1.6vh]">
            {t.poles.map((p, i) => (
              <li key={MARKS[i]} className={`oz-pole ${i === 0 ? "is-active" : ""}`} data-step={i}>
                <h3 className="flex items-baseline gap-[1.1vw] max-lg:gap-3">
                  <span className="oz-pole__n font-oz-mono text-[length:max(11px,calc(14*var(--oz-u)))]">0{i + 1}</span>
                  <span className="oz-pole__name oz-display text-[length:max(26px,calc(62*var(--oz-u)))] leading-[0.95] max-lg:text-[min(7vw,30px)]">
                    {p.name}
                  </span>
                </h3>
                <div className="oz-pole__more">
                  <div>
                    <p className="max-w-[46ch] pt-[1.8vh] text-oz-body3 text-oz-cream/80">{p.text}</p>
                    <ul className="oz-label flex flex-wrap gap-x-[1.4em] gap-y-1 pb-[0.4vh] pt-[1.6vh] text-[length:max(10px,calc(12*var(--oz-u)))] text-oz-cream/55">
                      {p.tags.map((tag) => (
                        <li key={tag} className="flex items-center gap-[0.7em] before:h-[3px] before:w-[3px] before:rounded-full before:bg-current">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Wordmark() {
  const t = TEXT[useLang()];
  return (
    <section data-look="warp" data-theme="dark" aria-label="L'Ordre des Devs" className="relative h-[150vh]">
      <div className="sticky top-0 h-svh overflow-hidden" data-pose="wordmark" data-anchor="[data-o]">
        <p
          className="oz-display absolute inset-0 flex items-center justify-center whitespace-nowrap text-[13vw] leading-none max-lg:text-[15vw]"
          aria-hidden="true"
        >
          <span className="oz-wordmark inline-block">
            L'
            <span data-o className="relative mx-[0.03em] inline-block h-[0.7em] w-[0.7em]">
              <Construct className="absolute -left-1/4 -top-1/4 h-[150%] w-[150%]" />
            </span>
            rdre
          </span>
        </p>
        <p className="oz-label absolute inset-x-0 bottom-[16vh] text-center text-oz-cream/60">
          {t.seal} · <span className="font-oz-mono normal-case">May the &lt;/&gt; be with you</span>
        </p>
      </div>
    </section>
  );
}
