import { useState, type KeyboardEvent } from "react";
import { texts, useLang } from "../../i18n";
import { fr } from "../../site/text";
import { useExperience } from "../context";
import { DISCORD, Out } from "../ui";

type Kind = "forum" | "text" | "voice";
type Metal = "gold" | "silver" | "bronze";
type NeedId = "ask" | "learn" | "project" | "events" | "talk" | "staff";
type Channel = { name: string; kind: Kind; where?: string };

const CODE = "Temple du Code";
const INFOSEC = "Temple de l'Infosec";
const GENERAL = "Informatique Générale";
const TEMPLE = "Grand Temple";

const NEEDS: { id: NeedId; metal: Metal; channels: Channel[] }[] = [
  {
    id: "ask",
    metal: "gold",
    channels: [
      { name: "aide-dev", kind: "forum", where: CODE },
      { name: "aide-cybersec", kind: "forum", where: INFOSEC },
      { name: "aide-informatique", kind: "forum", where: GENERAL },
      { name: "aide en vocal", kind: "voice" },
    ],
  },
  {
    id: "learn",
    metal: "silver",
    channels: [
      { name: "ressources-dev", kind: "forum", where: CODE },
      { name: "ressources-cybersec", kind: "forum", where: INFOSEC },
      { name: "ressources-informatique", kind: "forum", where: GENERAL },
      { name: "challenges-dev", kind: "forum", where: CODE },
      { name: "challenges-cybersec", kind: "forum", where: INFOSEC },
      { name: "writeups", kind: "forum", where: INFOSEC },
    ],
  },
  {
    id: "project",
    metal: "bronze",
    channels: [
      { name: "vos-projets", kind: "forum", where: CODE },
      { name: "journal-du-développeur", kind: "forum", where: CODE },
      { name: "recrutement-rémunéré", kind: "forum", where: CODE },
    ],
  },
  {
    id: "events",
    metal: "silver",
    channels: [
      { name: "links", kind: "text", where: "Events CTF" },
      { name: "tryhard", kind: "voice", where: "Events CTF" },
      { name: "annonces-gamejam", kind: "text", where: "Events Game Jam" },
      { name: "général", kind: "text", where: "Events Game Jam" },
      { name: "git-logs", kind: "text", where: "Events Game Jam" },
      { name: "GJ voc", kind: "voice", where: "Events Game Jam" },
    ],
  },
  {
    id: "talk",
    metal: "gold",
    channels: [
      { name: "présentation", kind: "text", where: TEMPLE },
      { name: "discussion", kind: "text", where: TEMPLE },
      { name: "médias-memes", kind: "text", where: TEMPLE },
      { name: "chill", kind: "voice" },
    ],
  },
  {
    id: "staff",
    metal: "bronze",
    channels: [
      { name: "tickets", kind: "text", where: "Informations" },
      { name: "suggestions", kind: "text", where: TEMPLE },
    ],
  },
];

const ACCENT: Record<Metal, string> = { gold: "#dc5000", silver: "#7fb069", bronze: "#6fb4ff" };

const TEXT = texts({
  fr: {
    kicker: "Trouvez le bon",
    word: "Salon",
    hint: fr("Choisissez ce que vous venez faire : le site indique le salon où aller."),
    group: "Ce que vous venez faire",
    kinds: { forum: "Forum", text: "Salon", voice: "Vocal" } as Record<Kind, string>,
    needs: {
      ask: {
        label: "Poser une question",
        note: "Un post par question dans le forum du domaine, avec un titre clair, le code en bloc et l'erreur complète. Les questions de cybersécurité restent dans un cadre strictement légal. Pour expliquer à l'oral ou partager votre écran, passez en vocal.",
      },
      learn: {
        label: "Apprendre et s'entraîner",
        note: "Des sites et des supports pour apprendre, puis des défis pour s'entraîner, rangés par domaine. Les solutions de CTF se partagent dans #writeups.",
      },
      project: {
        label: "Projets et recrutement",
        note: "Présentez ce que vous construisez ou tenez le journal de son avancement. Les missions rémunérées se publient dans #recrutement-rémunéré, où le staff propose aussi ses services.",
      },
      events: { label: "CTF et game jams", note: "Les salons des CTF et des game jams en cours." },
      talk: { label: "Se présenter et discuter", note: "Présentez-vous en arrivant, puis discutez de tout dans les salons du Grand Temple." },
      staff: {
        label: "Staff et suggestions",
        note: "Ouvrez un ticket pour toute demande adressée au staff. Une idée pour le serveur ou pour le site va dans #suggestions.",
      },
    } as Record<NeedId, { label: string; note: string }>,
    newcomer: fr("Nouveau sur le serveur ? Lisez #règlement, puis présentez-vous dans #présentation."),
    open: "Ouvrir le Discord",
  },
  en: {
    kicker: "Find the right",
    word: "Channel",
    hint: "Pick what you're here to do: the site shows you where to go.",
    group: "What you're here to do",
    kinds: { forum: "Forum", text: "Channel", voice: "Voice" },
    needs: {
      ask: {
        label: "Ask a question",
        note: "One post per question in the forum for your field, with a clear title, the code in a block and the full error. Cybersecurity questions stay strictly within the law. To explain out loud or share your screen, join voice.",
      },
      learn: {
        label: "Learn and practice",
        note: "Sites and material to learn, then challenges to practice, sorted by field. CTF solutions are shared in #writeups.",
      },
      project: {
        label: "Projects and hiring",
        note: "Show what you're building or keep a log of its progress. Paid assignments are posted in #recrutement-rémunéré, where the staff also offer their services.",
      },
      events: { label: "CTFs and game jams", note: "The channels for ongoing CTFs and game jams." },
      talk: { label: "Introduce yourself and chat", note: "Introduce yourself when you arrive, then chat about anything in the Grand Temple channels." },
      staff: {
        label: "Staff and suggestions",
        note: "Open a ticket for any request to the staff. Ideas for the server or the site go in #suggestions.",
      },
    },
    newcomer: "New to the server? Read #règlement, then introduce yourself in #présentation.",
    open: "Open the Discord",
  },
});

export function Salons() {
  const t = TEXT[useLang()];
  const exp = useExperience();
  const [need, setNeed] = useState(0);
  const current = NEEDS[need];
  const info = t.needs[current.id];

  const pick = (i: number) => {
    if (i === need) return;
    exp.current?.turnWheel(i > need ? 1 : -1);
    exp.current?.setStyle(NEEDS[i].metal, ACCENT[NEEDS[i].metal]);
    setNeed(i);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (need + d + NEEDS.length) % NEEDS.length;
    pick(next);
    e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=radio]")[next]?.focus();
  };

  return (
    <section id="salons" data-look="black" data-theme="dark" aria-labelledby="salons-titre" className="relative">
      <div className="relative grid h-svh place-items-center text-center" data-pose="choiceHero">
        <p className="oz-label absolute inset-x-0 top-1/2 mt-[min(-70px,calc(-150*var(--oz-u)))] text-oz-sub1">{t.kicker}</p>
        <h2
          id="salons-titre"
          className="oz-display text-[length:max(64px,calc(220*var(--oz-u)))] leading-[0.8] [text-shadow:0_10px_60px_rgb(16_9_4/0.4)] max-lg:text-[17vw]"
        >
          {t.word}
        </h2>
      </div>

      <div
        className="relative grid min-h-svh grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)_minmax(0,0.8fr)] items-center gap-[3vw] px-pad py-[12vh] max-lg:grid-cols-1 max-lg:gap-6 max-lg:py-[8vh]"
        data-pose="choice"
      >
        <div className="lg:ml-[2vw]">
          <p className="max-w-[40ch] text-oz-body3 text-oz-cream/75">{t.hint}</p>
          <div className="mt-[3vh] flex flex-wrap gap-2 lg:grid lg:gap-[0.6vh]" role="radiogroup" aria-label={t.group} onKeyDown={onKey}>
            {NEEDS.map(({ id }, i) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={need === i}
                tabIndex={need === i ? 0 : -1}
                onClick={() => pick(i)}
                className="oz-tab oz-label rounded-full border border-transparent bg-[#24170e] px-[1.4em] py-[0.9em] text-left transition-[border-color,box-shadow,background-color] hover:bg-[#2f1e12] lg:w-fit"
              >
                {t.needs[id].label}
              </button>
            ))}
          </div>
        </div>

        <div aria-live="polite">
          <div key={current.id} className="oz-swap oz-swap--fade rounded-[18px] border border-dotted border-oz-cream/25 bg-[#0b0704]/80 p-[max(20px,1.8vw)]">
            <p className="oz-label text-[10px] text-oz-orange">{info.label}</p>
            <p className="mt-[1.4vh] text-oz-body3 text-oz-cream/80">{info.note}</p>
            <ul className="mt-[2.4vh]">
              {current.channels.map((c) => (
                <li key={c.name} className="flex items-baseline gap-3 border-t border-dotted border-oz-cream/20 py-[1.2vh] max-lg:py-2.5">
                  <span className="w-[6.5ch] flex-none font-oz-mono text-[10.5px] uppercase tracking-[0.06em] text-oz-cream/45">{t.kinds[c.kind]}</span>
                  <span className="min-w-0 break-words font-oz-mono text-[15px] text-oz-cream max-lg:text-[14px] sm:flex-none">
                    {c.kind === "voice" ? c.name : `#${c.name}`}
                  </span>
                  {c.where && <span className="ml-auto min-w-0 text-right text-[12.5px] text-oz-cream/45 max-sm:hidden">{c.where}</span>}
                </li>
              ))}
            </ul>
            <Out href={DISCORD} className="oz-label mt-[2vh] inline-block text-[11px] text-oz-cream underline decoration-dotted underline-offset-4">
              {t.open}
            </Out>
          </div>
          <p className="mt-[2.2vh] max-w-[46ch] text-[13.5px] leading-[1.45] text-oz-cream/55">{t.newcomer}</p>
        </div>

        <div aria-hidden="true" className="max-lg:hidden" />
      </div>
    </section>
  );
}
