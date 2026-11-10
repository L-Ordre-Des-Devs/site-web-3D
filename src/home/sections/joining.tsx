import { useState } from "react";
import { texts, to, useLang } from "../../i18n";
import { DISCORD, GITHUB, Lines, Out, PATREON, Roll, X } from "../ui";

const TEXT = texts({
  fr: {
    questions: [
      {
        q: "Faut-il déjà savoir coder pour rejoindre ?",
        a: "Non. Le serveur accueille tous les niveaux, du premier « Hello World » à la pratique professionnelle. Les salons sont organisés par domaine : une question de débutant y a le même droit de cité qu'une relecture d'architecture.",
      },
      {
        q: "L'adhésion est-elle payante ?",
        a: "Non, l'accès au serveur et à ses activités est entièrement gratuit. Le Patreon est un soutien facultatif qui aide à couvrir les frais : il n'ouvre ni salon, ni contenu, ni avantage réservé.",
      },
      {
        q: "Quelle est la position de l'Ordre sur les demandes illégales ?",
        a: "Tolérance zéro. Aucune assistance n'est fournie pour des activités illicites ou non éthiques. La communauté défend un développement technologique responsable et respectueux des lois.",
      },
      {
        q: "Comment obtenir de l'aide technique ?",
        a: "Le serveur est structuré par pôles (DEV et CYBERSEC). Postez votre question dans le salon dédié, avec vos extraits de code et une description précise du problème.",
      },
      {
        q: "Peut-on recruter des développeurs pour un projet ?",
        a: "Oui. Un espace professionnel est dédié à la mise en relation : vous pouvez y publier vos offres et collaborer avec les freelances de la communauté.",
      },
    ],
    team: {
      q: "Qui sont les créateurs de la communauté ?",
      a: "L'Ordre des Devs a été créé par Mizari et Osiris : Mizari s'occupe de la partie développement, Osiris de la partie cybersécurité. Un staff les épaule pour faire vivre le serveur. L'équipe et les remerciements sont dans le humans.txt du site.",
      link: "Voir le humans.txt",
    },
    copyPrompt: "Copiez le texte :",
    faqKicker: "Foire aux questions",
    faqHint: "Une question qui n'est pas ici ? Posez-la directement sur le serveur.",
    endTitle: "Le serveur est ouvert,\nl'entrée est libre.",
    endInvite: "Il suffit d'une invitation Discord.",
    madeBy: "Fait par la communauté,",
    madeFor: "pour la communauté",
    share: "Partagez le serveur",
    copyInvite: "Copier l'invitation",
    inviteCopied: "Invitation copiée",
    platforms: "Plateformes",
    contact: "Contact",
    legal: "Mentions légales",
    disclaimer:
      "L'Ordre des Devs est une communauté bénévole indépendante, sans lien avec Discord Inc. ni avec Lucasfilm. « May the </> be with you » est un clin d'œil.",
  },
  en: {
    questions: [
      {
        q: "Do I need to know how to code to join?",
        a: "No. The server welcomes all levels, from a first “Hello World” to professional practice. Channels are organized by field: a beginner's question is just as welcome as an architecture review.",
      },
      {
        q: "Does membership cost anything?",
        a: "No, access to the server and its activities is completely free. Patreon is optional support that helps cover costs: it doesn't unlock any channel, content or perk.",
      },
      {
        q: "What is the Order's position on illegal requests?",
        a: "Zero tolerance. No help is given for illegal or unethical activities. The community stands for responsible, law-abiding technology work.",
      },
      {
        q: "How do I get technical help?",
        a: "The server is organized into tracks (DEV and CYBERSEC). Post your question in the matching channel, with your code snippets and a precise description of the problem.",
      },
      {
        q: "Can I hire developers for a project?",
        a: "Yes. A professional space is set aside for this: you can post your offers there and work with the community's freelancers.",
      },
    ],
    team: {
      q: "Who created the community?",
      a: "L'Ordre des Devs was created by Mizari and Osiris: Mizari looks after the development side, Osiris the cybersecurity side. A staff team helps them keep the server running. The team and acknowledgements are listed in the site's humans.txt.",
      link: "View humans.txt",
    },
    copyPrompt: "Copy the text:",
    faqKicker: "Frequently asked questions",
    faqHint: "Don't see your question? Ask it directly on the server.",
    endTitle: "The server is open,\nand anyone can join.",
    endInvite: "All it takes is a Discord invite.",
    madeBy: "Made by the community,",
    madeFor: "for the community",
    share: "Share the server",
    copyInvite: "Copy the invite",
    inviteCopied: "Invite copied",
    platforms: "Platforms",
    contact: "Contact",
    legal: "Legal notice",
    disclaimer:
      "L'Ordre des Devs is an independent volunteer community with no ties to Discord Inc. or Lucasfilm. “May the </> be with you” is a nod to Star Wars.",
  },
});

function useCopy(text: string, prompt: string) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 1800);
    } catch {
      window.prompt(prompt, text);
    }
  };
  return [done, copy] as const;
}

export function Faq() {
  const t = TEXT[useLang()];
  const [open, setOpen] = useState(0);
  const answer = (a: string) => <p className="max-w-[62ch] text-oz-body3 text-oz-cream/80">{a}</p>;
  const items = [
    ...t.questions.map((item) => ({ q: item.q, body: answer(item.a) })),
    {
      q: t.team.q,
      body: (
        <>
          {answer(t.team.a)}
          <Out href="/humans.txt" className="oz-pill oz-pill--brown mt-[2.4vh] inline-flex">
            <Roll>{t.team.link}</Roll>
          </Out>
        </>
      ),
    },
  ];
  return (
    <section id="faq" data-look="black" data-pose="awayUp" data-theme="dark" aria-labelledby="faq-titre" className="relative px-pad py-[16vh] max-lg:py-[12vh]">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)] gap-[6vw] max-lg:grid-cols-1 max-lg:gap-[5vh]">
        <div className="lg:sticky lg:top-[18vh] lg:self-start">
          <p className="oz-label text-[length:max(10px,calc(13*var(--oz-u)))] text-oz-cream/60">{t.faqKicker}</p>
          <h2 id="faq-titre" className="oz-display mt-[2vh] text-oz-h2">
            FAQ
          </h2>
          <p className="mt-[3vh] max-w-[32ch] text-oz-body3 text-oz-cream/70">{t.faqHint}</p>
          <div className="mt-[4vh] flex flex-wrap gap-2.5">
            {[
              ["Discord", DISCORD],
              ["GitHub", GITHUB],
              ["Patreon", PATREON],
              ["X", X],
            ].map(([label, href]) => (
              <Out key={label} href={href} className="oz-pill oz-pill--brown">
                <Roll>{label}</Roll>
              </Out>
            ))}
          </div>
        </div>
        <ol className="border-t border-dotted border-oz-cream/30">
          {items.map((it, i) => {
            const on = open === i;
            return (
              <li key={i} className="border-b border-dotted border-oz-cream/30">
                <h3>
                  <button
                    type="button"
                    id={`faq-q${i}`}
                    aria-expanded={on}
                    aria-controls={`faq-r${i}`}
                    onClick={() => setOpen(on ? -1 : i)}
                    className="flex w-full items-baseline gap-[1.4vw] py-[2.6vh] text-left max-lg:gap-3"
                  >
                    <span className="font-oz-mono text-[12px] text-oz-cream/50">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 text-[length:max(17px,calc(24*var(--oz-u)))] font-bold leading-[1.25]">{it.q}</span>
                    <span className="oz-plus" aria-hidden="true" />
                  </button>
                </h3>
                <div id={`faq-r${i}`} role="region" aria-labelledby={`faq-q${i}`} className="oz-acc" data-open={on}>
                  <div>
                    <div className="pb-[3vh] pl-[calc(12px+1.4vw)] max-lg:pl-[calc(12px+0.75rem)]">{it.body}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function End() {
  const lang = useLang();
  const t = TEXT[lang];
  const [copied, copy] = useCopy(DISCORD, t.copyPrompt);
  return (
    <footer
      id="rejoindre"
      data-look="end"
      data-pose="end"
      data-theme="dark"
      aria-labelledby="fin-titre"
      className="relative z-[1] grid min-h-svh grid-cols-12 grid-rows-[auto_1fr_auto] gap-x-[1.5vw] gap-y-[4vh] px-pad pb-[3.5vh] pt-[13vh] max-lg:grid-cols-1 max-lg:pt-[30vh]"
    >
      <div className="col-start-5 col-end-[-1] text-right max-lg:col-span-1">
        <p id="fin-titre" className="oz-display text-[length:max(18px,calc(28*var(--oz-u)))] leading-[1.08]">
          <Lines text={t.endTitle} />
        </p>
        <p className="oz-display mt-[3.2vh] text-[length:max(18px,calc(28*var(--oz-u)))] leading-[1.08] text-oz-cream/70">{t.endInvite}</p>
        <Out href={DISCORD} className="oz-pill oz-pill--brown mt-[5vh] text-[length:max(13px,calc(17*var(--oz-u)))] normal-case tracking-normal">
          <Roll>discord.gg/WUhvBf6vqw</Roll>
        </Out>
      </div>
      <div className="col-span-3 row-start-2 grid content-start justify-items-start gap-[1.6vh] self-end border border-dotted border-oz-cream/45 px-[1.4vw] py-[2vh] max-lg:col-span-1 max-lg:row-auto max-lg:px-4">
        <p className="oz-label">
          {t.madeBy}
          <br />
          <span className="text-oz-orange">{t.madeFor}</span>
        </p>
        <p className="oz-label">{t.share}</p>
        <button type="button" className="oz-pill oz-pill--dotted px-[1.2em] py-[0.8em] text-[10px]" onClick={copy}>
          {copied ? t.inviteCopied : t.copyInvite}
        </button>
      </div>
      <div className="col-start-5 col-end-10 row-start-2 flex gap-[6vw] self-end max-lg:col-span-1 max-lg:row-auto">
        <div className="oz-label grid content-start gap-[1.1vh]">
          <p className="mb-[0.6vh] text-oz-cream/45">{t.platforms}</p>
          <Out href={DISCORD}>
            <Roll>Discord</Roll>
          </Out>
          <Out href={GITHUB}>
            <Roll>GitHub</Roll>
          </Out>
          <Out href={PATREON}>
            <Roll>Patreon</Roll>
          </Out>
          <Out href={X}>
            <Roll>X</Roll>
          </Out>
        </div>
        <div className="oz-label grid content-start gap-[1.1vh]">
          <p className="mb-[0.6vh] text-oz-cream/45">{t.contact}</p>
          <a href="mailto:contact@ordre-des-devs.org" className="normal-case">
            contact@ordre-des-devs.org
          </a>
          <a href={to("/legal", lang)}>
            <Roll>{t.legal}</Roll>
          </a>
        </div>
      </div>
      <p className="oz-label col-span-6 row-start-3 self-end text-[10px] text-oz-cream/45 max-lg:col-span-1 max-lg:row-auto">© 2023-2026 L'Ordre des Devs</p>
      <p className="oz-label col-start-7 col-end-[-1] row-start-3 max-w-[72ch] justify-self-end text-right text-[10px] text-oz-cream/45 max-lg:col-span-1 max-lg:row-auto max-lg:justify-self-start max-lg:text-left">
        {t.disclaimer}
      </p>
    </footer>
  );
}
