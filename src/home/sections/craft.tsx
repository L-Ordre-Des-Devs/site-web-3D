import { useState } from "react";
import { texts, useLang } from "../../i18n";

const TEXT = texts({
  fr: {
    macroKicker: "Relecture",
    macroTitle: "À la loupe",
    macroText:
      "Postez un extrait (code, désassemblage, configuration) dans le salon du bon pôle : des membres le relisent et expliquent ce qui coince, ligne par ligne.",
    tabs: "Exemple de relecture",
    reviews: [
      {
        tab: "Dichotomie · C",
        notes: [" // déborde"],
        review:
          "Sur un tableau de plus d'un milliard d'éléments, `lo + hi` dépasse la plus grande valeur d'un `int` : comportement indéfini, et en pratique un `mid` négatif qui fait lire hors du tableau. `lo + (hi - lo) / 2` calcule le même milieu sans dépasser.",
      },
      {
        tab: "Médiane · JS",
        notes: [" // trie du texte"],
        review:
          "Sans fonction de comparaison, `sort()` range les nombres comme du texte : `[9, 10, 100]` devient `[10, 100, 9]`, et la médiane donnait 100 au lieu de 10. Avec `(a, b) => a - b`, le tri se fait par valeur.",
      },
    ],
  },
  en: {
    macroKicker: "Code review",
    macroTitle: "Up close",
    macroText:
      "Post a snippet (code, disassembly, configuration) in the right track's channel: members review it and explain what's wrong, line by line.",
    tabs: "Example review",
    reviews: [
      {
        tab: "Binary search · C",
        notes: [" // overflows"],
        review:
          "On an array of more than a billion elements, `lo + hi` exceeds the largest `int` value: undefined behavior, and in practice a negative `mid` that reads outside the array. `lo + (hi - lo) / 2` computes the same midpoint without overflowing.",
      },
      {
        tab: "Median · JS",
        notes: [" // sorts as text"],
        review:
          "Without a compare function, `sort()` orders numbers as text: `[9, 10, 100]` becomes `[10, 100, 9]`, so the median came out as 100 instead of 10. With `(a, b) => a - b`, numbers are sorted by value.",
      },
    ],
  },
});

type Line = { code: string; note?: number; kind?: "del" | "add" };
type CodeLang = "c" | "js";

const REVIEWS: { id: string; file: string; lang: CodeLang; lines: Line[] }[] = [
  {
    id: "dichotomie",
    file: "binary_search.c",
    lang: "c",
    lines: [
      { code: "int binary_search(const int *t, int n, int x) {" },
      { code: "  int lo = 0, hi = n - 1;" },
      { code: "  while (lo <= hi) {" },
      { code: "    int mid = (lo + hi) / 2;", note: 0, kind: "del" },
      { code: "    int mid = lo + (hi - lo) / 2;", kind: "add" },
      { code: "    if (t[mid] == x) return mid;" },
      { code: "    if (t[mid] < x) lo = mid + 1;" },
      { code: "    else hi = mid - 1;" },
      { code: "  }" },
      { code: "  return -1;" },
      { code: "}" },
    ],
  },
  {
    id: "mediane",
    file: "median.js",
    lang: "js",
    lines: [
      { code: "function median(nums) {" },
      { code: "  const sorted = [...nums].sort();", note: 0, kind: "del" },
      { code: "  const sorted = [...nums].sort((a, b) => a - b);", kind: "add" },
      { code: "  const mid = Math.floor(sorted.length / 2);" },
      { code: "  return sorted.length % 2" },
      { code: "    ? sorted[mid]" },
      { code: "    : (sorted[mid - 1] + sorted[mid]) / 2;" },
      { code: "}" },
    ],
  },
];

type Token = "kw" | "type" | "fn" | "num" | "str" | "com" | "pun" | "id";
const KEYWORDS: Record<CodeLang, Set<string>> = {
  c: new Set(["const", "while", "for", "if", "else", "return", "break", "continue", "sizeof", "static", "struct"]),
  js: new Set(["function", "const", "let", "var", "return", "if", "else", "for", "while", "of", "in", "new"]),
};
const TYPES: Record<CodeLang, Set<string>> = {
  c: new Set(["int", "char", "void", "long", "short", "unsigned", "size_t", "float", "double", "bool"]),
  js: new Set(["Math", "Array", "Number", "String", "Object"]),
};
const TOKEN_CLASS: Record<Token, string> = {
  kw: "text-[#ff8a3d]",
  type: "text-[#e9c98a]",
  fn: "text-[#8cc4ff]",
  num: "text-[#c9b2ff]",
  str: "text-[#a8dc8a]",
  com: "italic text-oz-cream/45",
  pun: "text-oz-cream/55",
  id: "text-oz-cream/90",
};
const LEXEME = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\s\w$])/g;

function lex(code: string, lang: CodeLang): [Token, string][] {
  const out: [Token, string][] = [];
  for (const m of code.matchAll(LEXEME)) {
    const [text, com, str, num, word, space] = m;
    if (com) out.push(["com", text]);
    else if (str) out.push(["str", text]);
    else if (num) out.push(["num", text]);
    else if (word) {
      const next = code.slice((m.index ?? 0) + text.length).trimStart()[0];
      out.push([KEYWORDS[lang].has(word) ? "kw" : TYPES[lang].has(word) ? "type" : next === "(" ? "fn" : "id", text]);
    } else if (space) out.push(["id", text]);
    else out.push(["pun", text]);
  }
  return out;
}

function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 ? (
          <code key={i} className="rounded-[3px] bg-oz-cream/[0.08] px-[0.35em] py-[0.05em] text-[0.94em] text-oz-cream">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

function lines(r: (typeof REVIEWS)[number], notes: string[]) {
  let n = 0;
  return r.lines.map((l, i) => {
    const num = l.kind === "del" ? "" : String(++n);
    return (
      <span
        key={i}
        className={`block whitespace-pre ${
          l.kind === "del" ? "bg-[#ff9a8a]/10 shadow-[inset_2px_0_0_#ff9a8a]" : l.kind === "add" ? "bg-[#a8dc8a]/10 shadow-[inset_2px_0_0_#a8dc8a]" : ""
        }`}
      >
        <span className="mr-3 inline-block w-[2ch] select-none text-right text-oz-cream/25 max-sm:hidden" aria-hidden="true">
          {num}
        </span>
        <span className={l.kind === "del" ? "text-[#ff9a8a]" : "text-[#a8dc8a]"}>{l.kind === "del" ? "-" : l.kind === "add" ? "+" : " "}</span>
        <span className={l.kind === "del" ? "opacity-75" : ""}>
          {lex(l.code, r.lang).map(([kind, s], j) => (
            <span key={j} className={TOKEN_CLASS[kind]}>
              {s}
            </span>
          ))}
        </span>
        {l.note !== undefined && <span className={TOKEN_CLASS.com}>{notes[l.note]}</span>}
      </span>
    );
  });
}

export function Macro() {
  const t = TEXT[useLang()];
  const [which, setWhich] = useState(0);
  const r = REVIEWS[which];
  const text = t.reviews[which];
  return (
    <section id="relecture" data-look="macro" data-theme="dark" aria-labelledby="loupe-titre" className="relative h-[170vh]">
      <div className="sticky top-0 h-svh overflow-hidden" data-pose="macro">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[50vh] bg-gradient-to-b from-[#0a0705] via-[#0a0705]/85 to-transparent max-lg:h-[28vh]" aria-hidden="true" />
        <div className="absolute inset-x-0 top-[9vh] px-pad text-center [text-shadow:0_2px_30px_rgb(10_7_5/0.9)]">
          <p className="oz-label">{t.macroKicker}</p>
          <h2 id="loupe-titre" className="oz-display mt-[1.6vh] text-[length:max(28px,calc(56*var(--oz-u)))] leading-[1.0]">
            {t.macroTitle}
          </h2>
          <p className="mx-auto mt-[2.4vh] max-w-[50ch] text-oz-body3 text-oz-cream/85">{t.macroText}</p>
        </div>
        <figure
          className="absolute inset-x-0 top-[47vh] mx-auto w-[min(92vw,560px)] overflow-hidden rounded-md border border-oz-cream/25 bg-oz-ink/80 shadow-[0_30px_80px_rgb(0_0_0/0.45)] backdrop-blur-md max-lg:top-[48vh]"
          data-reveal
        >
          <figcaption className="flex items-center justify-between gap-3 bg-oz-cream px-2 py-1.5 text-oz-ink">
            <span role="tablist" aria-label={t.tabs} className="flex gap-1">
              {REVIEWS.map((x, i) => (
                <button
                  key={x.id}
                  type="button"
                  role="tab"
                  id={`loupe-tab-${x.id}`}
                  aria-selected={i === which}
                  aria-controls="loupe-fiche"
                  onClick={() => setWhich(i)}
                  className={`oz-label rounded-full px-[1.1em] py-[0.55em] text-[10px] transition-colors ${i === which ? "bg-oz-ink text-oz-cream" : "hover:bg-oz-ink/10"}`}
                >
                  {t.reviews[i].tab}
                </button>
              ))}
            </span>
            <span className="oz-label pr-1 text-[10px] max-sm:hidden">{r.file}</span>
          </figcaption>
          <div id="loupe-fiche" role="tabpanel" aria-labelledby={`loupe-tab-${r.id}`}>
            <pre className="overflow-x-auto px-3 py-2.5 font-oz-mono text-[12px] leading-[1.65] max-sm:text-[10.5px]">
              <code>{lines(r, text.notes)}</code>
            </pre>
            <p className="border-t border-dotted border-oz-cream/30 px-3 py-2.5 text-[12.5px] leading-snug text-oz-cream/85">
              <Inline text={text.review} />
            </p>
          </div>
        </figure>
      </div>
    </section>
  );
}
