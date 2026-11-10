export type MethodId = "rot13" | "cesar" | "atbash" | "affine" | "vigenere" | "zigzag" | "rot47" | "xor" | "a1z26" | "morse" | "base64" | "hex" | "binaire";

export type Failure = "base64" | "hex" | "binary" | "morse" | "a1z26" | "utf8" | "key";

export interface Params {
  k: number;
  a: number;
  b: number;
  key: string;
  rails: number;
  xkey: string;
}

export interface Method {
  id: MethodId;
  encoding: boolean;
  enc: (s: string, p: Params) => string;
  dec: (s: string, p: Params) => string;
}

export class Fail extends Error {
  code: Failure;
  constructor(code: Failure) {
    super(code);
    this.code = code;
  }
}

export const DEFAULTS: Params = { k: 3, a: 5, b: 8, key: "JEDI", rails: 3, xkey: "ordre" };
export const AFFINE_A = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
export const RAILS = { min: 2, max: 9 };
export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const mod = (n: number, m: number) => ((n % m) + m) % m;

const letters = (s: string, f: (x: number, i: number) => number) => {
  let i = 0;
  return s.replace(/[a-z]/gi, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(base + mod(f(c.charCodeAt(0) - base, i++), 26));
  });
};

const inverse = (a: number) => {
  for (let x = 1; x < 26; x++) if ((a * x) % 26 === 1) return x;
  return 1;
};

export const keyLetters = (key: string) => key.toUpperCase().replace(/[^A-Z]/g, "");

const shifts = (key: string) => {
  const k = [...keyLetters(key)].map((c) => c.charCodeAt(0) - 65);
  if (!k.length) throw new Fail("key");
  return k;
};

export const plain = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/æ/g, "ae")
    .replace(/Æ/g, "AE");

export const rail = (i: number, n: number) => {
  const p = 2 * (n - 1);
  const r = i % p;
  return r < n ? r : p - r;
};

const zigzag = (s: string, n: number) => {
  const rows: string[][] = Array.from({ length: n }, () => []);
  [...s].forEach((c, i) => rows[rail(i, n)].push(c));
  return rows.flat().join("");
};

const unzigzag = (s: string, n: number) => {
  const chars = [...s];
  const at = chars.map((_, i) => rail(i, n));
  const rows: string[][] = [];
  let o = 0;
  for (let r = 0; r < n; r++) {
    const count = at.filter((x) => x === r).length;
    rows.push(chars.slice(o, o + count));
    o += count;
  }
  const next = new Array(n).fill(0);
  return at.map((r) => rows[r][next[r]++]).join("");
};

const rot47 = (s: string) => s.replace(/[!-~]/g, (c) => String.fromCharCode(33 + mod(c.charCodeAt(0) - 33 + 47, 94)));

const encoder = new TextEncoder();
export const bytes = (s: string) => encoder.encode(s);

const text = (b: Uint8Array) => {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(b);
  } catch {
    throw new Fail("utf8");
  }
};

export const hexOf = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join(" ");
export const bitsOf = (b: Uint8Array) => Array.from(b, (x) => x.toString(2).padStart(8, "0")).join(" ");

const fromHex = (s: string) => {
  const h = s.replace(/0x/gi, "").replace(/[\s:,-]/g, "");
  if (h.length % 2 || /[^0-9a-f]/i.test(h)) throw new Fail("hex");
  return Uint8Array.from(h.match(/../g) ?? [], (x) => parseInt(x, 16));
};

const fromBits = (s: string) => {
  const t = s.replace(/\s/g, "");
  if (t.length % 8 || /[^01]/.test(t)) throw new Fail("binary");
  return Uint8Array.from(t.match(/.{8}/g) ?? [], (x) => parseInt(x, 2));
};

const toBase64 = (b: Uint8Array) => {
  let bin = "";
  b.forEach((x) => (bin += String.fromCharCode(x)));
  return btoa(bin);
};

const fromBase64 = (s: string) => {
  let t = s.replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (/[^A-Za-z0-9+/=]/.test(t) || /=[^=]/.test(t) || t.length % 4 === 1) throw new Fail("base64");
  t = t.replace(/=+$/, "");
  t += "=".repeat((4 - (t.length % 4)) % 4);
  try {
    return Uint8Array.from(atob(t), (c) => c.charCodeAt(0));
  } catch {
    throw new Fail("base64");
  }
};

const xor = (b: Uint8Array, key: string) => {
  const k = bytes(key);
  if (!k.length) throw new Fail("key");
  return b.map((x, i) => x ^ k[i % k.length]);
};

export const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--",
  N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...",
  ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", _: "..--.-", '"': ".-..-.", $: "...-..-", "@": ".--.-.",
};
const FROM_MORSE = Object.fromEntries(Object.entries(MORSE).map(([c, m]) => [m, c]));

const toMorse = (s: string) =>
  plain(s)
    .toUpperCase()
    .split(/\s+/)
    .map((w) => [...w].map((c) => MORSE[c]).filter(Boolean).join(" "))
    .filter(Boolean)
    .join(" / ");

const fromMorse = (s: string) =>
  s.trim()
    ? s
        .trim()
        .split(/\s*\/\s*/)
        .map((w) =>
          w
            .split(/\s+/)
            .filter(Boolean)
            .map((code) => {
              const c = FROM_MORSE[code.replace(/[·•]/g, ".").replace(/[−–—_]/g, "-")];
              if (!c) throw new Fail("morse");
              return c;
            })
            .join(""),
        )
        .join(" ")
    : "";

const toA1z26 = (s: string) =>
  plain(s)
    .toUpperCase()
    .split(/\s+/)
    .map((w) =>
      [...w]
        .filter((c) => c >= "A" && c <= "Z")
        .map((c) => c.charCodeAt(0) - 64)
        .join("-"),
    )
    .filter(Boolean)
    .join(" ");

const fromA1z26 = (s: string) =>
  s.trim()
    ? s
        .trim()
        .split(/\s+/)
        .map((w) =>
          w
            .split("-")
            .map((n) => {
              if (!/^\d{1,2}$/.test(n) || +n < 1 || +n > 26) throw new Fail("a1z26");
              return String.fromCharCode(64 + +n);
            })
            .join(""),
        )
        .join(" ")
    : "";

export const METHODS: Method[] = [
  { id: "rot13", encoding: false, enc: (s) => letters(s, (x) => x + 13), dec: (s) => letters(s, (x) => x + 13) },
  { id: "cesar", encoding: false, enc: (s, p) => letters(s, (x) => x + p.k), dec: (s, p) => letters(s, (x) => x - p.k) },
  { id: "atbash", encoding: false, enc: (s) => letters(s, (x) => 25 - x), dec: (s) => letters(s, (x) => 25 - x) },
  { id: "affine", encoding: false, enc: (s, p) => letters(s, (x) => p.a * x + p.b), dec: (s, p) => letters(s, (x) => inverse(p.a) * (x - p.b)) },
  {
    id: "vigenere",
    encoding: false,
    enc: (s, p) => {
      const k = shifts(p.key);
      return letters(s, (x, i) => x + k[i % k.length]);
    },
    dec: (s, p) => {
      const k = shifts(p.key);
      return letters(s, (x, i) => x - k[i % k.length]);
    },
  },
  { id: "zigzag", encoding: false, enc: (s, p) => zigzag(s, p.rails), dec: (s, p) => unzigzag(s, p.rails) },
  { id: "rot47", encoding: false, enc: rot47, dec: rot47 },
  { id: "xor", encoding: false, enc: (s, p) => hexOf(xor(bytes(s), p.xkey)), dec: (s, p) => text(xor(fromHex(s), p.xkey)) },
  { id: "a1z26", encoding: true, enc: toA1z26, dec: fromA1z26 },
  { id: "morse", encoding: true, enc: toMorse, dec: fromMorse },
  { id: "base64", encoding: true, enc: (s) => toBase64(bytes(s)), dec: (s) => text(fromBase64(s)) },
  { id: "hex", encoding: true, enc: (s) => hexOf(bytes(s)), dec: (s) => text(fromHex(s)) },
  { id: "binaire", encoding: true, enc: (s) => bitsOf(bytes(s)), dec: (s) => text(fromBits(s)) },
];

export type Result = { ok: true; value: string } | { ok: false; code: Failure };

export const run = (m: Method, decode: boolean, s: string, p: Params): Result => {
  try {
    return { ok: true, value: decode ? m.dec(s, p) : m.enc(s, p) };
  } catch (e) {
    if (e instanceof Fail) return { ok: false, code: e.code };
    throw e;
  }
};

const columns = (pairs: [string, string][]) => {
  let top = "";
  let bottom = "";
  for (const [a, b] of pairs) {
    const w = Math.max([...a].length, [...b].length) + 1;
    top += a + " ".repeat(w - [...a].length);
    bottom += b + " ".repeat(w - [...b].length);
  }
  return [top.trimEnd(), bottom.trimEnd()] as [string, string];
};

export const detail = (m: Method, p: Params, clear: string): [string, string] => {
  const chars = [...clear];
  switch (m.id) {
    case "rot13":
    case "cesar":
    case "atbash":
    case "affine":
      return [ALPHABET, m.enc(ALPHABET, p)];
    case "rot47": {
      const src = Array.from({ length: 26 }, (_, i) => String.fromCharCode(33 + i)).join("");
      return [src, rot47(src)];
    }
    case "vigenere": {
      const k = keyLetters(p.key) || "?";
      const l = keyLetters(plain(clear)).slice(0, 26);
      return [l, l.replace(/./g, (_, i: number) => k[i % k.length])];
    }
    case "zigzag": {
      const c = chars.slice(0, 26);
      return [c.map((x) => (x === " " ? "·" : x)).join(""), c.map((_, i) => String(rail(i, p.rails) + 1)).join("")];
    }
    case "xor": {
      const kb = bytes(p.xkey);
      const b = Array.from(bytes(clear).slice(0, 8));
      const pad = (x: number) => x.toString(16).padStart(2, "0");
      return [`P ${b.map(pad).join(" ")}`, `K ${kb.length ? b.map((_, i) => pad(kb[i % kb.length])).join(" ") : "-"}`];
    }
    case "a1z26":
      return columns(
        [...keyLetters(plain(clear))].slice(0, 9).map((c) => [c, String(c.charCodeAt(0) - 64)]),
      );
    case "morse":
      return columns(
        [...plain(clear).toUpperCase()]
          .filter((c) => MORSE[c])
          .slice(0, 6)
          .map((c) => [c, MORSE[c]]),
      );
    case "base64": {
      const b = bytes(clear).slice(0, 3);
      if (!b.length) return ["", ""];
      const bits = Array.from(b, (x) => x.toString(2).padStart(8, "0")).join("").padEnd(Math.ceil((b.length * 8) / 6) * 6, "0");
      const groups = bits.match(/.{6}/g) ?? [];
      return columns(groups.map((g, i) => [g, toBase64(b)[i]]));
    }
    case "hex":
    case "binaire": {
      const show = m.id === "hex" ? hexOf : bitsOf;
      return columns(chars.slice(0, m.id === "hex" ? 8 : 3).map((c) => [c === " " ? "·" : c, show(bytes(c))]));
    }
  }
};
