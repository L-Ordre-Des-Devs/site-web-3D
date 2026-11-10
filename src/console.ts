import { DISCORD } from "./home/ui";
import { langOf, type Lang } from "./i18n";

declare global {
  interface Window {
    ordre?: Record<string, (...args: string[]) => unknown>;
  }
}

const lang = (): Lang => langOf(window.location.pathname);

const rot13 = (s: string) => s.replace(/[a-z]/gi, (c) => String.fromCharCode(((c.toLowerCase().charCodeAt(0) - 97 + 13) % 26) + (c <= "Z" ? 65 : 97)));

const TEXT = {
  fr: {
    motto: "Que le code soit avec vous.",
    commands: [
      ["ordre.aide()", "cette liste"],
      ['ordre.dechiffrer("…")', "ROT13, comme le sceau qu'on retourne sur l'accueil"],
      ["ordre.hyperespace()", "passer en vitesse lumière (depuis l'accueil)"],
      ["ordre.rejoindre()", "l'invitation au serveur"],
      ["ordre.sceau()", "réafficher le sceau"],
    ],
    solved: "Bien joué. C'est la devise de l'Ordre, et le message que cache le sceau.",
    jump: "Accrochez-vous : passage en vitesse lumière.",
    noJump: "Le saut se fait depuis l'accueil, avec la 3D active : https://ordre-des-devs.org/",
    open: "Le serveur est ouvert, l'entrée est libre : ",
    hello: "Tu ouvres la console ? Alors tu es des nôtres. Le serveur est ici : ",
    secret: "Un message chiffré traîne dans le coin : ",
    howTo: ["Pour le lire : ", "ordre.dechiffrer()", "   ·   toutes les commandes : ", "ordre.aide()"],
  },
  en: {
    motto: "May the code be with you.",
    commands: [
      ["ordre.help()", "this list"],
      ['ordre.decode("…")', "ROT13, like the seal you flip on the home page"],
      ["ordre.hyperspace()", "jump to lightspeed (from the home page)"],
      ["ordre.join()", "the server invite"],
      ["ordre.seal()", "show the seal again"],
    ],
    solved: "Well done. That's the Order's motto, and the message hidden in the seal.",
    jump: "Hold on tight: jumping to lightspeed.",
    noJump: "The jump works from the home page, with 3D enabled: https://ordre-des-devs.org/en",
    open: "The server is open, and anyone can join: ",
    hello: "Opening the console? Then you're one of us. The server is here: ",
    secret: "An encrypted message is lying around: ",
    howTo: ["To read it: ", "ordre.decode()", "   ·   all commands: ", "ordre.help()"],
  },
};

const GLYPHS = [
  ["  ██╗", " ██╔╝", "██╔╝ ", "╚██╗ ", " ╚██╗", "  ╚═╝"],
  ["    ██╗", "   ██╔╝", "  ██╔╝ ", " ██╔╝  ", "██╔╝   ", "╚═╝    "],
  ["██╗  ", "╚██╗ ", " ╚██╗", " ██╔╝", "██╔╝ ", "╚═╝  "],
];
const BANNER = GLYPHS[0].map((_, i) => GLYPHS.map((g) => g[i]).join("   ")).join("\n");

const S = {
  banner: "color:#e9c98a;font:12px/1.1 ui-monospace,Consolas,monospace;text-shadow:0 0 10px rgba(220,80,0,.6)",
  title: 'color:#ffedd7;font:800 26px/1.3 "Archivo Variable",Archivo,system-ui,sans-serif;font-stretch:125%;letter-spacing:.01em;text-shadow:0 0 18px rgba(255,160,90,.45)',
  motto: "color:#dc5000;font:500 12px ui-monospace,Consolas,monospace;letter-spacing:.08em",
  text: 'color:#d8c6b0;font:500 13px/1.6 "Figtree Variable",Figtree,system-ui,sans-serif',
  code: "color:#9fd27f;background:#1a120c;font:500 12px ui-monospace,Consolas,monospace;padding:2px 6px;border-radius:4px",
  dim: "color:#8a7a68;font:500 12px ui-monospace,Consolas,monospace",
};

let hyperspace: (() => boolean) | null = null;
export const setHyperspace = (fn: (() => boolean) | null) => {
  hyperspace = fn;
};

const seal = () => {
  console.log(`%c${BANNER}`, S.banner);
  console.log("%cL'ORDRE DES DEVS", S.title);
  console.log("%cMAY THE </> BE WITH YOU", S.motto);
};

let greeted = false;

export function greet() {
  if (greeted || typeof window === "undefined") return;
  greeted = true;
  const help = () => {
    const t = TEXT[lang()];
    t.commands.forEach(([cmd, what]) => console.log(`%c${cmd}%c  ${what}`, S.code, S.text));
    return t.motto;
  };
  const decode = (text = rot13(TEXT[lang()].motto)) => {
    const t = TEXT[lang()];
    const clear = rot13(String(text));
    console.log(`%c${text}%c  →  %c${clear}`, S.dim, S.text, S.code);
    if (clear === t.motto) console.log(`%c${t.solved}`, S.text);
    return clear;
  };
  const jump = () => {
    const t = TEXT[lang()];
    return hyperspace?.() ? t.jump : t.noJump;
  };
  const join = () => {
    console.log(`%c${TEXT[lang()].open}%c${DISCORD}`, S.text, S.code);
    return DISCORD;
  };
  const showSeal = () => {
    seal();
    return "May the </> be with you.";
  };
  window.ordre = {
    aide: help,
    help,
    dechiffrer: decode,
    decode,
    hyperespace: jump,
    hyperspace: jump,
    rejoindre: join,
    join,
    sceau: showSeal,
    seal: showSeal,
  };
  const t = TEXT[lang()];
  seal();
  console.log(`%c${t.hello}${DISCORD}`, S.text);
  console.log(`%c${t.secret}%c${rot13(t.motto)}`, S.text, S.code);
  console.log(`%c${t.howTo[0]}%c${t.howTo[1]}%c${t.howTo[2]}%c${t.howTo[3]}`, S.text, S.code, S.text, S.code);
}
