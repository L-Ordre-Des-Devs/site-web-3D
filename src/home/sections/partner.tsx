import { useEffect, useRef, useState } from "react";
import { texts, useLang } from "../../i18n";
import { Roll } from "../ui";

const SITE = "https://hostnatpro.fr/";
const CODE = "ORDRE";

const TEXT = texts({
  fr: {
    kicker: "Partenaire hébergeur",
    text: "VPS, serveurs de jeu et hébergement web, sur une infrastructure en France et du matériel qui leur appartient. Protection DDoS, sauvegardes et support humain inclus.",
    specs: ["VPS", "Serveurs de jeu", "Hébergement web", "NVMe", "IPv4 et IPv6", "Réseau 1 Gbit/s"],
    offer: "10 % de réduction sur tout le site",
    with: "avec le code",
    copy: "Copier le code",
    copied: "Code copié",
    visit: "Voir HostNatPro",
  },
  en: {
    kicker: "Hosting partner",
    text: "VPS, game servers and web hosting, on infrastructure in France running on hardware they own. DDoS protection, backups and human support included.",
    specs: ["VPS", "Game servers", "Web hosting", "NVMe", "IPv4 and IPv6", "1 Gbit/s network"],
    offer: "10% off the whole site",
    with: "with the code",
    copy: "Copy the code",
    copied: "Code copied",
    visit: "Visit HostNatPro",
  },
});

export function Partner() {
  const t = TEXT[useLang()];
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  const code = useRef<HTMLParagraphElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CODE);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      if (code.current) window.getSelection()?.selectAllChildren(code.current);
    }
  };

  return (
    <section id="partenaire" data-look="black" data-pose="awayUp" data-theme="dark" aria-labelledby="partenaire-titre" className="relative px-pad pb-[6vh] pt-[2vh]">
      <div
        className="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-[4vw] rounded-[18px] border border-dotted border-oz-cream/20 bg-oz-cream/[0.04] p-[max(24px,2.6vw)] max-lg:grid-cols-1 max-lg:gap-7"
        data-reveal
      >
        <div>
          <p className="oz-label text-[10px] text-oz-orange">{t.kicker}</p>
          <h2 id="partenaire-titre" className="oz-display mt-[1.6vh] text-oz-h3 leading-[0.95]">
            HostNatPro
          </h2>
          <p className="mt-[2vh] max-w-[52ch] text-oz-body3 text-oz-cream/75">{t.text}</p>
          <ul className="mt-[2.4vh] flex flex-wrap gap-2">
            {t.specs.map((s) => (
              <li key={s} className="rounded-full border border-dotted border-oz-cream/25 px-[0.9em] py-[0.35em] font-oz-mono text-[11.5px] text-oz-cream/70">
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-between rounded-[14px] bg-oz-orange p-[max(20px,1.8vw)] text-oz-cream">
          <p className="text-oz-sub1 font-bold leading-[1.15]">{t.offer}</p>
          <div className="mt-[3vh]">
            <p className="oz-label text-[10px] text-oz-cream/80">{t.with}</p>
            <p ref={code} className="mt-[0.6vh] font-oz-mono text-[length:max(34px,calc(64*var(--oz-u)))] leading-none tracking-[0.04em]">
              {CODE}
            </p>
          </div>
          <div className="mt-[3vh] flex flex-wrap gap-2">
            <button type="button" onClick={copy} className="oz-pill oz-pill--ink">
              <Roll>{copied ? t.copied : t.copy}</Roll>
            </button>
            <a href={SITE} target="_blank" rel="sponsored noopener noreferrer" className="oz-pill oz-pill--cream">
              <Roll>{t.visit}</Roll>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
