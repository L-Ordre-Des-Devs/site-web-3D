import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { texts, useLang } from "../../i18n";
import { fr } from "../../site/text";
import { useExperience } from "../context";
import { Lines, Roll } from "../ui";
import { AFFINE_A, DEFAULTS, METHODS, RAILS, detail, keyLetters, run, type Failure, type MethodId, type Params } from "./cipher-methods";

type Family = "sub" | "poly" | "trans" | "xor" | "enc";
type Info = { name: string; formula: string; note: string };

const FAMILY: Record<MethodId, Family> = {
  rot13: "sub",
  cesar: "sub",
  atbash: "sub",
  affine: "sub",
  vigenere: "poly",
  zigzag: "trans",
  rot47: "sub",
  xor: "xor",
  a1z26: "enc",
  morse: "enc",
  base64: "enc",
  hex: "enc",
  binaire: "enc",
};

const TEXT = texts({
  fr: {
    kicker: "Cybersécurité, niveau zéro",
    title: "Chiffrement\npar retournement",
    intro: "Collez un message, choisissez une méthode et retournez le sceau pour le chiffrer ou le déchiffrer.",
    message: "Que le code soit avec vous",
    tool: "Outil de chiffrement",
    pick: "Méthode",
    prev: "Méthode précédente",
    next: "Méthode suivante",
    clear: "Message en clair",
    secret: "Message chiffré",
    encoded: "Message encodé",
    copy: "Copier",
    copied: "Copié",
    flip: "Retourner le sceau",
    sense: { enc: fr("Sens : chiffrer"), dec: fr("Sens : déchiffrer"), encode: fr("Sens : encoder"), decode: fr("Sens : décoder") },
    noKey: "Sans clé",
    key: "clé",
    less: "Diminuer",
    more: "Augmenter",
    families: { sub: "Substitution", poly: "Polyalphabétique", trans: "Transposition", xor: "XOR à clé répétée", enc: "Encodage" } as Record<Family, string>,
    errors: {
      base64: fr("Le Base64 n'utilise que A-Z, a-z, 0-9, + et /, avec = à la fin."),
      hex: fr("L'hexadécimal s'écrit par paires de chiffres 0-9 et a-f."),
      binary: fr("Le binaire s'écrit par groupes de 8 bits."),
      morse: fr("Le Morse s'écrit avec . et -, une espace entre les lettres, / entre les mots."),
      a1z26: fr("Il faut des nombres de 1 à 26, reliés par - ; une espace entre les mots."),
      utf8: "Ces octets ne forment pas du texte UTF-8.",
      key: "La clé est vide.",
    } as Record<Failure, string>,
    methods: {
      rot13: { name: "ROT13", formula: "C = (P + 13) mod 26", note: fr("13 + 13 = 26 : appliqué deux fois, il rend le texte. Usenet s'en servait pour masquer les spoilers.") },
      cesar: { name: "César", formula: "C = (P + k) mod 26", note: fr("D'après Suétone, Jules César décalait de 3 : A devenait D. 25 clés seulement, à essayer à la main.") },
      atbash: { name: "Atbash", formula: "C = 25 − P", note: "L'alphabet retourné, A ↔ Z. Procédé hébreu antique, présent dans le livre de Jérémie." },
      affine: { name: "Affine", formula: "C = (a × P + b) mod 26", note: fr("a doit être premier avec 26, sinon deux lettres se chiffrent pareil : 12 valeurs de a, 312 clés en tout.") },
      vigenere: { name: "Vigenère", formula: "C[i] = (P[i] + K[i]) mod 26", note: fr("Décrit par Bellaso en 1553 ; tenu pour indéchiffrable jusqu'à Babbage et Kasiski, au XIXe siècle.") },
      zigzag: { name: "Zigzag", formula: "n rails, période 2 × (n − 1)", note: fr("Le rail fence, une transposition : les caractères restent les mêmes, espaces compris ; seul l'ordre change.") },
      rot47: { name: "ROT47", formula: "C = 33 + (P − 33 + 47) mod 94", note: fr("Les 94 caractères imprimables de l'ASCII, de ! à ~, décalés de moitié : appliqué deux fois, il rend le texte.") },
      xor: { name: "XOR", formula: "C[i] = P[i] ^ K[i mod |K|]", note: fr("Sortie en hexadécimal. Clé aléatoire, aussi longue que le message, jamais réutilisée : le masque jetable, incassable.") },
      a1z26: { name: "A1Z26", formula: "A = 1, B = 2 … Z = 26", note: "Chaque lettre devient son rang, - entre les lettres, une espace entre les mots. Casse, accents et ponctuation sont perdus." },
      morse: { name: "Morse", formula: ". et -, / entre les mots", note: fr("C'est un encodage : il n'utilise aucune clé. Casse et accents sont perdus.") },
      base64: { name: "Base64", formula: "3 octets → 4 caractères de 6 bits", note: fr("C'est un encodage : n'importe qui peut le décoder, sans clé. = complète le dernier groupe.") },
      hex: { name: "Hexadécimal", formula: "1 octet → 2 chiffres de 0 à f", note: fr("Les octets UTF-8 du texte : « é » en prend deux, c3 a9.") },
      binaire: { name: "Binaire", formula: "1 octet → 8 bits", note: fr("Les octets UTF-8 du texte, bit par bit : « A » vaut 65, soit 01000001.") },
    } as Record<MethodId, Info>,
  },
  en: {
    kicker: "Cybersecurity, level zero",
    title: "Flip\nencryption",
    intro: "Paste a message, pick a method and flip the seal to encrypt or decrypt it.",
    message: "May the code be with you",
    tool: "Encryption tool",
    pick: "Method",
    prev: "Previous method",
    next: "Next method",
    clear: "Plain text",
    secret: "Encrypted text",
    encoded: "Encoded text",
    copy: "Copy",
    copied: "Copied",
    flip: "Flip the seal",
    sense: { enc: "Direction: encrypt", dec: "Direction: decrypt", encode: "Direction: encode", decode: "Direction: decode" },
    noKey: "No key",
    key: "key",
    less: "Decrease",
    more: "Increase",
    families: { sub: "Substitution", poly: "Polyalphabetic", trans: "Transposition", xor: "Repeating-key XOR", enc: "Encoding" },
    errors: {
      base64: "Base64 only uses A-Z, a-z, 0-9, + and /, with = at the end.",
      hex: "Hexadecimal is written in pairs of digits 0-9 and a-f.",
      binary: "Binary is written in groups of 8 bits.",
      morse: "Morse uses . and -, a space between letters, / between words.",
      a1z26: "Numbers from 1 to 26 expected, joined by -, with a space between words.",
      utf8: "These bytes are not UTF-8 text.",
      key: "The key is empty.",
    },
    methods: {
      rot13: { name: "ROT13", formula: "C = (P + 13) mod 26", note: "13 + 13 = 26: applied twice, it gives the text back. Usenet used it to hide spoilers." },
      cesar: { name: "Caesar", formula: "C = (P + k) mod 26", note: "According to Suetonius, Julius Caesar shifted by 3: A became D. Only 25 keys, easy to try by hand." },
      atbash: { name: "Atbash", formula: "C = 25 − P", note: "The alphabet reversed, A ↔ Z. An ancient Hebrew method, found in the Book of Jeremiah." },
      affine: { name: "Affine", formula: "C = (a × P + b) mod 26", note: "a must be coprime with 26, or two letters would encrypt the same: 12 values of a, 312 keys in all." },
      vigenere: { name: "Vigenère", formula: "C[i] = (P[i] + K[i]) mod 26", note: "Described by Bellaso in 1553; thought unbreakable until Babbage and Kasiski, in the 19th century." },
      zigzag: { name: "Rail fence", formula: "n rails, period 2 × (n − 1)", note: "A transposition: the characters stay the same, spaces included; only their order changes." },
      rot47: { name: "ROT47", formula: "C = 33 + (P − 33 + 47) mod 94", note: "The 94 printable ASCII characters, from ! to ~, shifted by half: applied twice, it gives the text back." },
      xor: { name: "XOR", formula: "C[i] = P[i] ^ K[i mod |K|]", note: "Output in hexadecimal. A random key as long as the message, never reused: the one-time pad, unbreakable." },
      a1z26: { name: "A1Z26", formula: "A = 1, B = 2 … Z = 26", note: "Each letter becomes its rank, - between letters, a space between words. Case, accents and punctuation are lost." },
      morse: { name: "Morse", formula: ". and -, / between words", note: "This is an encoding: it uses no key. Case and accents are lost." },
      base64: { name: "Base64", formula: "3 bytes → 4 characters of 6 bits", note: "This is an encoding: anyone can decode it without a key. = pads the last group." },
      hex: { name: "Hex", formula: "1 byte → 2 digits from 0 to f", note: "The text's UTF-8 bytes: “é” takes two, c3 a9." },
      binaire: { name: "Binary", formula: "1 byte → 8 bits", note: "The text's UTF-8 bytes, bit by bit: “A” is 65, or 01000001." },
    },
  },
});

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ</>{}#$";
const wrap = (v: number, lo: number, hi: number) => lo + ((((v - lo) % (hi - lo + 1)) + (hi - lo + 1)) % (hi - lo + 1));
const pad = (v: number) => String(v).padStart(2, "0");

function Stepper({ name, value, onStep, less, more }: { name: string; value: number; onStep: (d: number) => void; less: string; more: string }) {
  return (
    <span className="inline-flex items-center gap-[0.5em]">
      <span className="font-oz-mono text-oz-ink/60">{name}</span>
      <button type="button" className="oz-step oz-step--sm" onClick={() => onStep(-1)} aria-label={`${less} ${name}`}>
        <span aria-hidden="true">−</span>
      </button>
      <output className="min-w-[2ch] text-center font-oz-mono text-oz-ink" aria-live="polite">
        {pad(value)}
      </output>
      <button type="button" className="oz-step oz-step--sm" onClick={() => onStep(1)} aria-label={`${more} ${name}`}>
        <span aria-hidden="true">+</span>
      </button>
    </span>
  );
}

function KeyField({ label, value, onChange, upper }: { label: string; value: string; onChange: (v: string) => void; upper?: boolean }) {
  return (
    <label className="inline-flex items-center gap-[0.6em]">
      <span className="font-oz-mono text-oz-ink/60">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={16}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize={upper ? "characters" : "off"}
        className="w-[10ch] border-b border-dotted border-oz-ink/55 bg-transparent px-[0.2em] py-[0.1em] font-oz-mono text-oz-ink outline-none transition-colors focus:border-solid"
      />
    </label>
  );
}

export function Cipher() {
  const t = TEXT[useLang()];
  const exp = useExperience();
  const frame = useRef(0);
  const timer = useRef(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const out = useRef<HTMLOutputElement>(null);
  const [kind, setKind] = useState(0);
  const [dir, setDir] = useState(0);
  const [params, setParams] = useState<Params>(DEFAULTS);
  const [decode, setDecode] = useState(false);
  const [text, setText] = useState(t.message);
  const [shown, setShown] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const method = METHODS[kind];
  const info = t.methods[method.id];
  const busy = shown !== null;
  const result = useMemo(() => run(method, decode, text, params), [method, decode, text, params]);
  const clear = decode ? (result.ok ? result.value : "") : text;
  const lines = useMemo(() => detail(method, params, clear), [method, params, clear]);
  const coded = method.encoding ? t.encoded : t.secret;

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      window.clearTimeout(timer.current);
    },
    [],
  );

  const set = <K extends keyof Params>(k: K, v: Params[K]) => setParams((p) => ({ ...p, [k]: v }));

  const go = (d: 1 | -1) => {
    if (busy) return;
    setDir(d);
    setKind((k) => (k + d + METHODS.length) % METHODS.length);
    exp.current?.turnWheel(d);
  };

  const flip = () => {
    if (busy || !result.ok) return;
    const from = text;
    const to = result.value;
    const done = () => {
      setShown(null);
      setText(to);
      setDecode((v) => !v);
    };
    exp.current?.flip();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || Math.max(from.length, to.length) > 600) {
      done();
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 700);
      if (p >= 1) {
        done();
        return;
      }
      const n = Math.round(from.length + (to.length - from.length) * p);
      const k = Math.floor(p * n);
      let s = to.slice(0, k);
      for (let i = k; i < n; i++) {
        const c = from[i] ?? to[i] ?? " ";
        s += /\s/.test(c) ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setShown(s);
      frame.current = requestAnimationFrame(step);
    };
    setShown(from);
    frame.current = requestAnimationFrame(step);
  };

  const copy = async () => {
    if (!result.ok || !result.value) return;
    try {
      await navigator.clipboard.writeText(result.value);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      if (out.current) window.getSelection()?.selectAllChildren(out.current);
    }
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    go(e.key === "ArrowLeft" ? -1 : 1);
  };

  const onDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement;
    swipe.current = target.closest("[data-swipe]") && !target.closest("button, input, textarea") ? { x: e.clientX, y: e.clientY } : null;
  };

  const onUp = (e: PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) go(dx < 0 ? 1 : -1);
  };

  const swap = dir > 0 ? "oz-swap oz-swap--next" : dir < 0 ? "oz-swap oz-swap--prev" : "";
  const field =
    "mt-[0.8vh] block h-[4.4em] w-full rounded-[10px] px-[0.9em] py-[0.7em] font-oz-mono text-[15px] leading-[1.45] text-oz-ink max-lg:text-[13px]";
  const sense = decode ? (method.encoding ? t.sense.decode : t.sense.dec) : method.encoding ? t.sense.encode : t.sense.enc;

  let settings = <span className="font-oz-mono text-oz-ink/45">{t.noKey}</span>;
  if (method.id === "cesar") settings = <Stepper name="k" value={params.k} onStep={(d) => set("k", wrap(params.k + d, 1, 25))} less={t.less} more={t.more} />;
  if (method.id === "zigzag")
    settings = <Stepper name="n" value={params.rails} onStep={(d) => set("rails", Math.min(RAILS.max, Math.max(RAILS.min, params.rails + d)))} less={t.less} more={t.more} />;
  if (method.id === "affine")
    settings = (
      <>
        <Stepper name="a" value={params.a} onStep={(d) => set("a", AFFINE_A[wrap(AFFINE_A.indexOf(params.a) + d, 0, AFFINE_A.length - 1)])} less={t.less} more={t.more} />
        <Stepper name="b" value={params.b} onStep={(d) => set("b", wrap(params.b + d, 0, 25))} less={t.less} more={t.more} />
      </>
    );
  if (method.id === "vigenere") settings = <KeyField label={t.key} value={params.key} onChange={(v) => set("key", keyLetters(v).slice(0, 12))} upper />;
  if (method.id === "xor") settings = <KeyField label={t.key} value={params.xkey} onChange={(v) => set("xkey", v.slice(0, 16))} />;

  return (
    <section id="chiffrement" data-look="sand" data-theme="light" aria-labelledby="chiffrement-titre" className="oz-theme-light relative h-[165vh]">
      <div className="sticky top-0 h-svh overflow-hidden" data-pose="cipher" data-anchor="#oz-sceau">
        <div className="grid h-full grid-cols-[minmax(0,1fr)_minmax(0,560px)] gap-x-[5vw] px-pad pb-[6vh] pt-[14vh] max-lg:flex max-lg:flex-col max-lg:gap-0 max-lg:pb-3 max-lg:pt-[max(64px,9svh)]">
          <div className="flex min-h-0 flex-col max-lg:contents">
            <p className="oz-label max-lg:text-center">{t.kicker}</p>
            <h2 id="chiffrement-titre" className="oz-display mt-[1.6vh] text-[length:max(24px,calc(56*var(--oz-u)))] leading-[1.0] max-lg:text-center max-lg:text-[length:min(24px,5.9vw)]">
              <Lines text={t.title} />
            </h2>
            <p className="mt-[2.4vh] max-w-[44ch] text-oz-body3 max-lg:hidden">{t.intro}</p>
            <div className="flex min-h-0 flex-1 items-center justify-center pt-[3vh] max-lg:py-2 max-lg:[@media(max-height:600px)]:hidden">
              <div id="oz-sceau" className="aspect-square h-full max-h-[42vh] max-lg:max-h-[22svh]" aria-hidden="true" />
            </div>
          </div>

          <div
            role="group"
            aria-label={t.tool}
            className="w-full self-center rounded-[18px] border border-dotted border-oz-ink/45 bg-[#fff8ef]/55 p-[22px] shadow-[0_30px_60px_-38px_rgb(16_9_4/0.4)] max-lg:mt-2 max-lg:flex-none max-lg:p-[14px]"
            onPointerDown={onDown}
            onPointerUp={onUp}
            onPointerCancel={() => (swipe.current = null)}
          >
            <div data-swipe role="group" aria-label={t.pick} onKeyDown={onKey} className="flex touch-pan-y select-none items-center gap-3">
              <button type="button" className="oz-step" onClick={() => go(-1)} aria-label={t.prev}>
                <span aria-hidden="true">←</span>
              </button>
              <p className="min-w-0 flex-1 overflow-hidden text-center" aria-live="polite">
                <span key={kind} className={`block ${swap}`}>
                  <span className="oz-display block truncate text-[length:max(20px,calc(34*var(--oz-u)))] leading-none">{info.name}</span>
                  <span className="mt-[0.9vh] block font-oz-mono text-[11px] uppercase tracking-[0.08em] text-oz-ink/55 max-lg:text-[10px]">
                    {pad(kind + 1)} / {METHODS.length} · {t.families[FAMILY[method.id]]}
                  </span>
                </span>
              </p>
              <button type="button" className="oz-step" onClick={() => go(1)} aria-label={t.next}>
                <span aria-hidden="true">→</span>
              </button>
            </div>

            <div data-swipe className="mt-[1.8vh] touch-pan-y select-none border-t border-dotted border-oz-ink/30 pt-[1.6vh] max-lg:mt-3 max-lg:pt-2.5">
              <div key={kind} className={dir ? "oz-swap oz-swap--fade" : ""}>
                <p className="font-oz-mono text-[13px] text-oz-ink/85 max-lg:text-[11.5px]">{info.formula}</p>
                <pre className="mt-[0.9vh] overflow-hidden font-oz-mono text-[12px] leading-[1.4] tracking-[0.06em] text-oz-ink/55 max-lg:text-[10.5px] max-lg:[@media(max-height:600px)]:hidden" aria-hidden="true">
                  {lines[0] || " "}
                  {"\n"}
                  {lines[1] || " "}
                </pre>
                <p className="mt-[0.9vh] min-h-[2.9em] text-[14px] leading-[1.45] text-oz-ink/70 max-lg:text-[12px] max-lg:[@media(max-height:720px)]:hidden">{info.note}</p>
              </div>
            </div>

            <div className="mt-[1.4vh] flex min-h-[34px] flex-wrap items-center gap-x-[1.6em] gap-y-1 border-t border-dotted border-oz-ink/30 pt-[1.4vh] text-[14px] max-lg:mt-2.5 max-lg:pt-2 max-lg:text-[12.5px]">
              {settings}
            </div>

            <div className="mt-[1.6vh] max-lg:mt-2.5">
              <label htmlFor="oz-message" className="oz-label block text-[10px] text-oz-ink/55">
                {decode ? coded : t.clear}
              </label>
              <textarea
                id="oz-message"
                data-lenis-prevent
                value={shown ?? text}
                readOnly={busy}
                onChange={(e) => setText(e.target.value)}
                maxLength={2000}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                className={`${field} resize-none border border-dotted border-oz-ink/55 bg-white/35 outline-none transition-colors focus:border-solid focus:bg-white/55`}
              />
            </div>

            <div className="mt-[1.4vh] max-lg:mt-2">
              <div className="flex items-center justify-between gap-3">
                <span id="oz-sortie" className="oz-label text-[10px] text-oz-ink/55">
                  {decode ? t.clear : coded}
                </span>
                <button
                  type="button"
                  onClick={copy}
                  disabled={!result.ok || !result.value}
                  className="oz-label text-[10px] underline decoration-dotted underline-offset-4 transition-opacity disabled:opacity-30"
                >
                  {copied ? t.copied : t.copy}
                </button>
              </div>
              <output ref={out} aria-labelledby="oz-sortie" data-lenis-prevent className={`${field} overflow-y-auto whitespace-pre-wrap break-words bg-oz-ink/[0.06]`}>
                {result.ok ? result.value : <span className="font-oz text-oz-ink/55">{t.errors[result.code]}</span>}
              </output>
            </div>

            <div className="mt-[1.8vh] flex items-center justify-between gap-3 max-lg:mt-3">
              <button type="button" onClick={flip} disabled={busy || !result.ok} className="oz-pill oz-pill--ink px-[1.7em] py-[1em] transition-opacity disabled:opacity-50">
                <Roll>{t.flip}</Roll>
              </button>
              <span className="oz-label text-right text-[10px] text-oz-ink/50">{sense}</span>
            </div>
            <p className="sr-only" aria-live="polite">
              {copied ? t.copied : result.ok ? "" : t.errors[result.code]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
