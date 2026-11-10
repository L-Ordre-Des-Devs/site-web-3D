import { getLenis } from "../hooks/useSmoothScroll";
import type { SealData } from "../webgl/token";
import type { Key, Stage } from "../webgl/stage";
import { PLAN_HEAD, T_END, timeAt } from "./sections/plan-time";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => t * t * (3 - 2 * t);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SNAPS: Record<string, { rx?: number; ry?: number; rz?: number; metal?: "gold" | "silver" | "bronze"; accent?: string; lift?: number; studio?: boolean }> = {
  c1: { rx: -0.32, ry: 0.55, rz: 0.08 },
  c2: { rx: -0.22, ry: -0.6, rz: -0.1, metal: "bronze" },
  c3: { rx: -0.55, ry: 0.2, rz: 0.04 },
  c4: { rx: -0.3, ry: 0.72, rz: 0.12, metal: "silver" },
  c5: { rx: -0.12, ry: -0.42, rz: -0.06, metal: "silver" },
  c6: { rx: -0.42, ry: 0.36, rz: 0.06, metal: "bronze" },
  c7: { rx: -0.28, ry: -0.35, rz: -0.04 },
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const NAV: Record<string, string[]> = {
  accueil: ["accueil"],
  communaute: ["communaute", "question", "salons"],
  poles: ["poles", "chiffrement", "relecture"],
  challenges: ["challenges"],
  articles: ["articles", "infos"],
  faq: ["faq"],
};

interface Span {
  top: number;
  height: number;
}
interface Gallery {
  section: HTMLElement;
  head: HTMLElement;
  frame: HTMLElement;
  sight: HTMLElement | null;
  clip: HTMLElement;
  thumbsBox: HTMLElement;
  bigs: HTMLElement[];
  thumbs: HTMLElement[];
  portrait: boolean;
  n: number;
  top: number;
  a: number;
  b: number;
  step: number;
  length: number;
  fw: number;
  fh: number;
  fx: number;
  fy: number;
  sq: number;
  sqy: number;
  tw: number;
  gap: number;
  s: number;
  dx: number;
  dy: number;
  m: number;
  p: number;
  on: number;
}
interface PlanItem {
  el: HTMLElement | SVGElement;
  kind: 0 | 1 | 2 | 3;
  a: number;
  d: number;
  k: number;
}
interface PlanLabel {
  el: HTMLElement;
  i: number;
  t: number;
  p: number;
  live: string | null;
  value: HTMLElement;
  text: string;
  x: number;
  y: number;
  o: number;
  right?: boolean;
}
interface ScrubGroup {
  words: HTMLElement[];
  start: number;
  end: number;
  last: number[];
}

export class Experience {
  private stage: Stage | null = null;
  private raf = 0;
  private loaderRaf = 0;
  private disposed = false;
  private ready = false;
  private last = 0;
  private shown = 0;
  private target = 0;
  private lastY = Number.NaN;
  private vw = window.innerWidth;
  private vh = window.innerHeight;
  private max = 1;
  private cleanup: (() => void)[] = [];
  private urls: string[] = [];
  private perf = { acc: 0, n: 0, cool: 0, calm: 0, wait: 6, up: false };
  private themes: { span: Span; theme: string }[] = [];
  private navs: { link: HTMLElement; spans: Span[]; on: boolean }[] = [];
  private scrubs: ScrubGroup[] = [];
  private poles?: { switches: number[]; steps: HTMLElement[]; count: HTMLElement | null };
  private step = -1;
  private introStart = 0;
  private gallery?: Gallery;
  private fleet?: { span: Span; p: number };
  private walkers?: { span: Span; p: number };
  private bound = false;
  private plan?: {
    span: Span;
    section: Span;
    pinned: boolean;
    p: number;
    drawn: number;
    items: PlanItem[];
    box: { x: number; top: number; w: number; h: number; offset: number };
    fit: { x: number; top: number; w: number; h: number; offset: number };
    frame: { x: number; y: number; w: number; h: number };
    origin: { x: number; y: number };
    labels: PlanLabel[];
    cursors: { el: SVGGElement; x0: number; x1: number; x: number }[];
    clock: HTMLElement | null;
    clockText: string;
    head: number;
    locale: string;
  };
  private header = "";
  private flags = { hero: true, end: false };
  private thumb: HTMLElement | null = null;

  constructor(
    private root: HTMLElement,
    private canvas: HTMLCanvasElement,
    private opts: { reduced: boolean; quality: number },
  ) {}

  async start() {
    const html = document.documentElement;
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    html.classList.add("oz-in-hero");
    getLenis()?.stop();
    this.loaderLoop();
    try {
      const fetchScene = () => Promise.all([import("../webgl/stage"), import("../webgl/sceau.json")]);
      const scene = fetchScene()
        .catch(() => wait(800).then(fetchScene))
        .catch(() => wait(2500).then(fetchScene));
      scene.catch(() => {});
      const fonts = Promise.all(
        ['700 100px "Figtree Variable"', '500 20px "DM Mono"', '500 40px "Literata"'].map((font) =>
          document.fonts.load(font).catch(() => []),
        ),
      );
      await Promise.race([fonts, wait(3500)]);
      this.target = 0.12;
      const [{ Stage }, json] = await scene;
      if (this.disposed) return;
      this.target = 0.22;
      const data = ((json as { default?: unknown }).default ?? json) as SealData;
      let stage: Stage;
      try {
        stage = new Stage(this.canvas, { quality: this.opts.quality, reduced: this.opts.reduced });
      } catch (err) {
        this.fail(err);
        return;
      }
      this.stage = stage;
      if (this.opts.reduced) stage.setIntro(0);
      stage.resize(this.vw, this.vh);
      await stage.init(data, (p) => (this.target = 0.22 + p * 0.7), Object.values(SNAPS));
      if (this.disposed) {
        stage.dispose();
        return;
      }
      this.bind();
      this.layout();
      stage.update(0, 1 / 60, 0);
      this.snapshots();
      stage.render();
      this.target = 1;
      await wait(550);
      if (this.disposed) return;
      this.ready = true;
      html.classList.add("oz-ready");
      getLenis()?.start();
      this.introStart = performance.now();
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
      const hash = decodeURIComponent(window.location.hash.slice(1));
      const target = hash && document.getElementById(hash);
      if (target) window.setTimeout(() => !this.disposed && this.scrollTo(target), 900);
    } catch (err) {
      this.fail(err);
    }
  }

  private fail(err: unknown) {
    console.error("[accueil] 3D indisponible :", err);
    const html = document.documentElement;
    html.classList.add("oz-no-webgl", "oz-ready");
    html.classList.remove("oz-in-hero");
    try {
      this.stage?.dispose();
    } catch {}
    this.stage = null;
    this.ready = true;
    getLenis()?.start();
    try {
      this.bind();
      this.layout();
      cancelAnimationFrame(this.raf);
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    } catch (e) {
      console.error("[accueil]", e);
    }
  }

  private loaderLoop = () => {
    this.shown += (this.target - this.shown) * 0.1;
    if (Math.abs(this.target - this.shown) < 0.002) this.shown = this.target;
    const loader = this.root.querySelector<HTMLElement>("[data-loader]");
    if (loader) {
      const pct = Math.round(this.shown * 100);
      loader.style.setProperty("--p", this.shown.toFixed(3));
      loader.setAttribute("aria-valuenow", String(pct));
      const label = loader.querySelector("[data-pct]");
      if (label) label.textContent = String(pct);
    }
    if (!this.ready && !this.disposed) this.loaderRaf = requestAnimationFrame(this.loaderLoop);
  };

  private snapshots() {
    const stage = this.stage!;
    const groups = new Map<string, HTMLImageElement[]>();
    this.root.querySelectorAll<HTMLImageElement>("img[data-snap]").forEach((img) => {
      const key = img.dataset.snap ?? "";
      groups.set(key, [...(groups.get(key) ?? []), img]);
    });
    groups.forEach((imgs, key) => {
      const opt = SNAPS[key];
      const cards = imgs.map((img) => img.parentElement).filter((c): c is HTMLElement => !!c);
      if (!opt || !cards.length) return;
      const sized = cards.map((card) => ({ card, r: card.getBoundingClientRect() }));
      const { card, r } = sized.reduce((a, b) => (b.r.width > a.r.width ? b : a));
      if (r.width < 1 || r.height < 1) return;
      const k = Math.min(1, 560 / Math.max(r.width, r.height));
      const canvas = stage.snapshot({ width: r.width * k, height: r.height * k, bg: getComputedStyle(card).backgroundColor, ...opt });
      canvas.toBlob(
        (blob) => {
          if (!blob || this.disposed) return;
          const url = URL.createObjectURL(blob);
          this.urls.push(url);
          imgs.forEach((img) => {
            img.onload = () => img.classList.add("is-loaded");
            img.src = url;
          });
        },
        "image/webp",
        0.9,
      );
    });
  }

  private layout() {
    const stage = this.stage;
    this.vw = window.innerWidth;
    this.vh = window.innerHeight;
    const { vh, vw } = this;
    stage?.resize(vw, vh);

    this.gallery = this.sizeGallery();

    const y0 = window.scrollY;
    const span = (el: Element): Span => {
      const r = el.getBoundingClientRect();
      return { top: r.top + y0, height: r.height };
    };
    if (stage) {
      const keysOf = (attr: string): Key[] =>
        Array.from(this.root.querySelectorAll<HTMLElement>(`[${attr}]`)).map((el) => {
          const sticky = getComputedStyle(el).position === "sticky";
          const b = span(sticky && el.parentElement ? el.parentElement : el);
          const tall = b.height > vh * 1.02;
          const lead = vw < 1024 ? Number(el.dataset.leadNarrow || 0) * vh : 0;
          const start = (tall ? b.top : b.top + b.height / 2 - vh / 2) - lead;
          const key: Key = { name: el.getAttribute(attr) ?? "", start, end: tall ? b.top + b.height - vh : start + lead };
          const anchor = attr === "data-pose" && el.dataset.anchor ? this.root.querySelector(el.dataset.anchor) : null;
          const ar = anchor?.getBoundingClientRect();
          if (anchor && ar && ar.width > 0 && ar.height > 0) {
            const ref = (el.dataset.anchorRef && this.root.querySelector(el.dataset.anchorRef)) || el;
            const sr = ref.getBoundingClientRect();
            key.override = stage.poseFromRect({ x: ar.left - sr.left, y: ar.top - sr.top, width: ar.width, height: ar.height });
          }
          return key;
        });
      stage.setKeys(keysOf("data-pose"), keysOf("data-look"));
    }

    this.max = Math.max(1, document.documentElement.scrollHeight - vh);
    this.themes = Array.from(this.root.querySelectorAll<HTMLElement>("[data-theme]")).map((el) => ({ span: span(el), theme: el.dataset.theme ?? "dark" }));
    this.navs = Array.from(this.root.querySelectorAll<HTMLElement>("[data-nav]")).map((link) => ({
      link,
      on: link.classList.contains("is-current"),
      spans: (NAV[link.dataset.nav ?? ""] ?? []).map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e).map(span),
    }));

    const groups = new Map<Element, HTMLElement[]>();
    this.root.querySelectorAll<HTMLElement>("[data-scrub]").forEach((el) => {
      const owner = el.closest(".sticky") ?? el;
      groups.set(owner, [...(groups.get(owner) ?? []), ...Array.from(el.querySelectorAll<HTMLElement>(".oz-w"))]);
    });
    this.scrubs = Array.from(groups, ([owner, words]) => {
      const inSticky = owner.classList.contains("sticky") && owner.parentElement;
      const b = span(inSticky ? owner.parentElement! : owner);
      const start = inSticky ? b.top - vh * 0.35 : b.top - vh * 0.85;
      const end = inSticky ? b.top + b.height - vh * 1.15 : b.top - vh * 0.3;
      return { words, start, end, last: words.map(() => -1) };
    });

    const polesEl = this.root.querySelector<HTMLElement>("[data-poles]");
    if (polesEl) {
      const marks = Array.from(polesEl.querySelectorAll<HTMLElement>("[data-mark]")).map(span);
      this.poles = {
        switches: marks.slice(1).map((m, i) => (marks[i].top + marks[i].height - vh + m.top) / 2),
        steps: Array.from(polesEl.querySelectorAll<HTMLElement>("[data-step]")),
        count: polesEl.querySelector("[data-count]"),
      };
    }

    if (this.gallery) this.gallery.top = span(this.gallery.section).top;
    this.plan?.items.forEach(({ el }) => {
      const st = el.style;
      st.opacity = "";
      st.translate = "";
      st.strokeDashoffset = "";
      st.clipPath = "";
    });
    const planEl = this.root.querySelector<HTMLElement>("[data-plan]");
    if (planEl) {
      const pin = planEl.querySelector<HTMLElement>("[data-plan-sticky]");
      const pinned = !!pin && getComputedStyle(pin).position === "sticky";
      const draw = planEl.querySelector<HTMLElement>("[data-plan-draw]");
      const items: PlanItem[] = [];
      planEl.querySelectorAll<HTMLElement | SVGElement>("[data-draw],[data-show],[data-type],.oz-plan__info").forEach((el) => {
        const info = el.classList.contains("oz-plan__info");
        if ((info && !pinned) || !el.getClientRects().length) return;
        const kind = info ? 3 : el.hasAttribute("data-draw") ? 0 : el.hasAttribute("data-show") ? 1 : 2;
        items.push({ el, kind, a: parseFloat(el.style.getPropertyValue("--a")) || 0, d: parseFloat(el.style.getPropertyValue("--d")) || 0.05, k: -1 });
      });
      const pinTop = pin ? pin.getBoundingClientRect().top : 0;
      const place = (el: Element | null | undefined) => {
        const r = el && el.getClientRects().length ? el.getBoundingClientRect() : null;
        return r ? { x: r.left, top: r.top + y0, w: r.width, h: r.height, offset: r.top - pinTop } : null;
      };
      const box = place(draw) ?? { x: 0, top: 0, w: 0, h: 0, offset: 0 };
      const fit = place(planEl.querySelector("[data-plan-fit]")) ?? box;
      const labels: PlanLabel[] = Array.from(planEl.querySelectorAll<HTMLElement>("[data-plan-anchor]")).map((el) => ({
        el,
        i: Number(el.dataset.planAnchor),
        t: el.dataset.planT ? Number(el.dataset.planT) : Number.NaN,
        p: el.dataset.planP ? Number(el.dataset.planP) : Number.NaN,
        live: el.dataset.planLive ?? null,
        value: el.querySelector<HTMLElement>("[data-v]") ?? el,
        text: "",
        x: Number.NaN,
        y: Number.NaN,
        o: -1,
      }));
      const cursors = Array.from(planEl.querySelectorAll<SVGGElement>("[data-plan-cursor]"))
        .filter((el) => el.getClientRects().length)
        .map((el) => ({ el, x0: Number(el.dataset.x0), x1: Number(el.dataset.x1), x: Number.NaN }));
      const clock = planEl.querySelector<HTMLElement>("[data-plan-clock]");
      const locale = document.documentElement.lang === "en" ? "en-US" : "fr-FR";
      this.plan = {
        span: span(pinned || !draw ? planEl : draw),
        section: span(planEl),
        pinned,
        p: Number.NaN,
        drawn: Number.NaN,
        items,
        box,
        fit,
        frame: { x: fit.x, y: 0, w: fit.w, h: fit.h },
        origin: { x: box.x, y: 0 },
        labels,
        cursors,
        clock,
        clockText: "",
        head: Number.NaN,
        locale,
      };
    } else this.plan = undefined;
    const fleetEl = this.root.querySelector<HTMLElement>("[data-fleet]");
    this.fleet = fleetEl ? { span: span(fleetEl), p: Number.NaN } : undefined;
    const walkersEl = this.root.querySelector<HTMLElement>("[data-walkers]");
    this.walkers = walkersEl ? { span: span(walkersEl), p: Number.NaN } : undefined;
    this.lastY = Number.NaN;
  }

  private sizeGallery(): Gallery | undefined {
    const section = this.root.querySelector<HTMLElement>("[data-gallery]");
    const q = (sel: string) => section?.querySelector<HTMLElement>(sel) ?? null;
    const sticky = q("[data-g-sticky]");
    const head = q("[data-g-head]");
    const frame = q("[data-g-frame]");
    const clip = q("[data-g-clip]");
    const thumbsBox = q("[data-g-thumbs]");
    if (!section || !sticky || !head || !frame || !clip || !thumbsBox) return undefined;
    const { vw, vh } = this;
    const portrait = vw / vh < 0.85;
    const fx = vw / 2;
    let fw: number, fh: number, fy: number, sq: number, sqy: number, tw: number, th: number, ty: number;
    if (portrait) {
      fw = Math.min(vw * 0.86, vh * 0.56 * 0.76);
      fh = fw / 0.76;
      fy = vh * 0.47;
      sq = fw * 0.86;
      sqy = vh * 0.4;
      tw = Math.min(vw * 0.16, vh * 0.09);
      th = tw / 0.76;
      ty = vh - Math.max(th / 2 + 18, vh * 0.12);
    } else {
      fh = Math.min(vh * 0.76, (vw * 0.42) / 0.76);
      fw = fh * 0.76;
      fy = vh * 0.51;
      sq = Math.min(vh * 0.46, fw);
      sqy = vh * 0.43;
      th = fh * 0.3;
      tw = th * 0.76;
      ty = fy;
    }
    const px = (k: string, v: number) => sticky.style.setProperty(k, `${v.toFixed(1)}px`);
    px("--fw", fw);
    px("--fh", fh);
    px("--fx", fx);
    px("--fy", fy);
    px("--sq", sq);
    px("--sqy", sqy);
    px("--tw", tw);
    px("--th", th);
    px("--ty", ty);

    const bigs = Array.from(section.querySelectorAll<HTMLElement>("[data-g-big]"));
    const thumbs = Array.from(section.querySelectorAll<HTMLElement>("[data-g-thumb]"));
    const n = bigs.length;
    const a = vh * 0.45;
    const b = a + vh * 0.8;
    const step = vh * 0.6;
    const length = b + (n - 1) * step + vh * 0.35;
    section.style.height = `${vh + length}px`;
    const markA = q('[data-g-mark="a"]');
    const markC = q('[data-g-mark="c"]');
    if (markA) Object.assign(markA.style, { top: "0px", height: `${vh + a}px` });
    if (markC) Object.assign(markC.style, { top: `${b}px`, height: `${vh + length - b}px` });

    head.style.transform = "";
    const g = head.getBoundingClientRect();
    const st = sticky.getBoundingClientRect();
    const s = Math.min((vw * 0.86) / g.width, (vh * (portrait ? 0.15 : 0.2)) / g.height);
    const cy = portrait ? vh * 0.76 : vh * 0.81;
    return {
      section,
      head,
      frame,
      sight: frame.querySelector<HTMLElement>("[data-g-sight]"),
      clip,
      thumbsBox,
      bigs,
      thumbs,
      portrait,
      n,
      top: 0,
      a,
      b,
      step,
      length,
      fw,
      fh,
      fx,
      fy,
      sq,
      sqy,
      tw,
      gap: portrait ? 8 : Math.max(10, vh * 0.016),
      s,
      dx: vw / 2 - (g.width * s) / 2 - (g.left - st.left),
      dy: cy - (g.height * s) / 2 - (g.top - st.top),
      m: -1,
      p: Number.NaN,
      on: -1,
    };
  }

  private drawGallery(m: number, p: number) {
    const G = this.gallery!;
    if (m === G.m && p === G.p) return;
    G.m = m;
    G.p = p;
    const e = 1 - m;
    G.head.style.transform = e > 0.0005 ? `translate3d(${(G.dx * e).toFixed(1)}px, ${(G.dy * e).toFixed(1)}px, 0) scale(${(1 + (G.s - 1) * e).toFixed(4)})` : "";
    const w = lerp(G.sq, G.fw, m);
    const h = lerp(G.sq, G.fh, m);
    const cy = lerp(G.sqy, G.fy, m);
    const left = G.fx - w / 2;
    const top = cy - h / 2;
    Object.assign(G.frame.style, { transform: `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`, width: `${w.toFixed(1)}px`, height: `${h.toFixed(1)}px` });
    if (G.sight) G.sight.style.opacity = clamp(1 - m * 2.5).toFixed(3);
    const side = ((G.fw - w) / 2).toFixed(1);
    G.clip.style.clipPath = `inset(${(top - (G.fy - G.fh / 2)).toFixed(1)}px ${side}px ${(G.fy + G.fh / 2 - cy - h / 2).toFixed(1)}px ${side}px)`;
    G.bigs.forEach((el, k) => (el.style.transform = `translate3d(${((k - p) * G.fw).toFixed(1)}px, 0, 0)`));
    G.thumbsBox.style.opacity = m.toFixed(3);
    const pitch = G.tw + G.gap;
    G.thumbs.forEach((el, k) => {
      const d = k - p;
      const x = G.portrait
        ? G.fx + d * pitch - G.tw / 2
        : d >= 0
          ? G.fx + w / 2 + G.gap + (d - 1) * pitch
          : G.fx - w / 2 - G.gap + (d + 1) * pitch - G.tw;
      el.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
    });
    const on = Math.round(clamp(p, 0, G.n - 1));
    if (on !== G.on) {
      G.on = on;
      G.thumbs.forEach((el, k) => el.classList.toggle("is-on", G.portrait && k === on));
    }
  }

  private galleryTo(k: number) {
    const G = this.gallery;
    if (G && Number.isFinite(k)) this.scrollTo(G.top + G.b + k * G.step);
  }

  private bind() {
    if (this.bound) return;
    this.bound = true;
    const on = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
      window.addEventListener(type, fn, opts);
      this.cleanup.push(() => window.removeEventListener(type, fn));
    };

    let timer = 0;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    on("resize", () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (coarse && w === this.vw && Math.abs(h - this.vh) < 140) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => this.layout(), 120);
    });
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => this.layout(), 150);
    });
    ro.observe(this.root);
    this.cleanup.push(() => {
      ro.disconnect();
      window.clearTimeout(timer);
    });

    on(
      "pointermove",
      (e) => this.stage?.setPointer((e.clientX / this.vw) * 2 - 1, -((e.clientY / this.vh) * 2 - 1)),
      { passive: true },
    );

    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const thumb = el.closest<HTMLElement>("[data-g-thumb]");
      if (thumb) {
        this.galleryTo(Number(thumb.dataset.gThumb));
        return;
      }
      const next = el.closest("[data-next]");
      if (next) {
        const y = window.scrollY;
        const sections = Array.from(this.root.querySelectorAll<HTMLElement>("main > section, footer"));
        const after = sections.map((s) => s.getBoundingClientRect().top + y).find((t) => t > y + 8);
        if (after !== undefined) this.scrollTo(after);
        return;
      }
      const a = el.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      const target = id === "accueil" ? 0 : document.getElementById(id);
      if (target === null) return;
      e.preventDefault();
      this.scrollTo(target);
      window.history.replaceState(null, "", id === "accueil" ? window.location.pathname : `#${id}`);
    };
    this.root.addEventListener("click", onClick);
    this.cleanup.push(() => this.root.removeEventListener("click", onClick));
    const onFocus = (e: FocusEvent) => {
      const big = (e.target as HTMLElement).closest?.<HTMLElement>("[data-g-big]");
      if (big) this.galleryTo(Number(big.dataset.gBig));
    };
    this.root.addEventListener("focusin", onFocus);
    this.cleanup.push(() => this.root.removeEventListener("focusin", onFocus));

    const thumb = this.root.querySelector<HTMLElement>("[data-thumb]");
    this.thumb = thumb;
    if (thumb) {
      let grab: { y: number; scroll: number } | null = null;
      const down = (e: PointerEvent) => {
        grab = { y: e.clientY, scroll: window.scrollY };
        thumb.setPointerCapture(e.pointerId);
        thumb.style.cursor = "grabbing";
      };
      const move = (e: PointerEvent) => {
        if (!grab) return;
        const ratio = this.max / (this.vh * 0.86);
        const y = clamp(grab.scroll + (e.clientY - grab.y) * ratio, 0, this.max);
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y);
      };
      const up = () => {
        grab = null;
        thumb.style.cursor = "";
      };
      thumb.addEventListener("pointerdown", down);
      thumb.addEventListener("pointermove", move);
      thumb.addEventListener("pointerup", up);
      thumb.addEventListener("pointercancel", up);
      this.cleanup.push(() => {
        thumb.removeEventListener("pointerdown", down);
        thumb.removeEventListener("pointermove", move);
        thumb.removeEventListener("pointerup", up);
        thumb.removeEventListener("pointercancel", up);
      });
    }

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    this.root.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    this.cleanup.push(() => io.disconnect());
  }

  scrollTo(target: number | HTMLElement) {
    const y = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.6, force: true });
    else window.scrollTo({ top: y, behavior: this.opts.reduced ? "auto" : "smooth" });
  }

  jump() {
    if (!this.stage || this.opts.reduced) return false;
    this.introStart = performance.now();
    return true;
  }

  flip() {
    return this.stage ? this.stage.flipOver() : undefined;
  }

  turnWheel(dir: number) {
    this.stage?.turnWheel(dir);
  }

  setStyle(metal: "gold" | "silver" | "bronze", accent: string, twin?: string) {
    this.stage?.setStyle(metal, accent, twin);
  }

  private tick = (now: number) => {
    this.raf = requestAnimationFrame(this.tick);
    const stage = this.stage;
    const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000));
    this.last = now;
    const y = window.scrollY;
    this.planFrame(y);
    if (stage) {
      if (this.introStart) {
        const t = Math.min(1, (now - this.introStart) / 2600);
        stage.setIntro(this.opts.reduced ? 0 : 1 - (1 - Math.pow(1 - t, 3)));
        if (t >= 1) this.introStart = 0;
      }
      stage.update(y, dt, now / 1000);
      stage.render();
    }
    this.dom(y);
    if (stage) this.adapt(dt);
  };

  private dom(y: number) {
    const html = document.documentElement;
    const { vh } = this;
    const moved = y !== this.lastY;
    this.lastY = y;

    if (moved) {
      this.thumb?.style.setProperty("--sp", (y / this.max).toFixed(4));
      const hero = y < vh * 0.55;
      if (hero !== this.flags.hero) html.classList.toggle("oz-in-hero", (this.flags.hero = hero));
      const end = y > this.max - vh * 0.5;
      if (end !== this.flags.end) html.classList.toggle("oz-at-end", (this.flags.end = end));
      const probe = y + 32;
      const theme = this.themes.find((t) => probe >= t.span.top && probe < t.span.top + t.span.height)?.theme ?? "dark";
      if (theme !== this.header) html.dataset.header = this.header = theme;
      const mid = y + vh / 2;
      this.navs.forEach((n) => {
        const on = n.spans.some((s) => mid >= s.top && mid < s.top + s.height);
        if (on !== n.on) n.link.classList.toggle("is-current", (n.on = on));
      });

      this.scrubs.forEach((g) => {
        const p = clamp((y - g.start) / Math.max(1, g.end - g.start));
        const n = g.words.length;
        const w = Math.max(2, n * 0.18);
        g.words.forEach((el, i) => {
          const k = Math.round(clamp((p * (n + w) - i) / w) * 50) / 50;
          if (k !== g.last[i]) el.style.setProperty("--k", String((g.last[i] = k)));
        });
      });

      const F = this.fleet;
      if (F) {
        const p = clamp((y - F.span.top) / Math.max(1, F.span.height - vh));
        if (p !== F.p) this.stage?.setFleet((F.p = p));
      }

      const W = this.walkers;
      if (W) {
        const p = clamp((y - W.span.top) / Math.max(1, W.span.height - vh));
        if (p !== W.p) this.stage?.setWalkers((W.p = p));
      }

      const G = this.gallery;
      if (G) {
        const t = y - G.top;
        if (t > -vh * 1.2 && t < G.length + vh * 1.2) {
          const m = ease(clamp((t - G.a) / (G.b - G.a)));
          this.drawGallery(m, t < G.b ? m - 1 : Math.min(G.n - 1, (t - G.b) / G.step));
        }
      }

      if (this.poles) {
        const step = this.poles.switches.filter((s) => y >= s).length;
        if (step !== this.step) this.setStep(step);
      }
    }
    this.planDom();
  }

  private planFrame(y: number) {
    const P = this.plan;
    if (!P) return;
    const { vh } = this;
    const raw = P.pinned ? (y - P.span.top) / Math.max(1, P.span.height - vh) : (y + vh * 0.85 - P.span.top) / Math.max(1, P.span.height + vh * 0.45);
    P.p = this.opts.reduced ? 1 : Math.round(clamp(raw) * 1000) / 1000;
    const S = P.section;
    const panel = Math.min(Math.max(S.top - y, 0), S.top + S.height - vh - y);
    P.frame.y = P.pinned ? panel + P.fit.offset : P.fit.top - y;
    P.origin.y = P.pinned ? panel + P.box.offset : P.box.top - y;
    this.stage?.setPlan(P.p, P.frame);
  }

  private planDom() {
    const P = this.plan;
    if (!P) return;
    const p = P.p;
    if (p !== P.drawn) {
      P.drawn = p;
      for (const it of P.items) {
        const k = Math.round(clamp(it.kind === 0 || it.kind === 2 ? (p - it.a) / it.d : (p - it.a) * (it.kind === 3 ? 25 : 30)) * 100) / 100;
        if (k === it.k) continue;
        it.k = k;
        const s = it.el.style;
        if (it.kind === 0) s.strokeDashoffset = String(1 - k);
        else if (it.kind === 1) s.opacity = String(k);
        else if (it.kind === 2) s.clipPath = k >= 1 ? "" : `inset(0 ${Math.round(100 - k * 100)}% 0 0)`;
        else {
          s.opacity = String(k);
          s.translate = k >= 1 ? "" : `0 ${(14 * (1 - k)).toFixed(1)}px`;
        }
      }
    }
    const A = this.stage?.planAnchors() ?? null;
    const amount = A ? A[0] : 0;
    const head = A && amount > 0 ? A[1] : timeAt(p);
    const fmt = (v: number, d: number) => `${v < 0 ? "−" : ""}${Math.abs(v).toLocaleString(P.locale, { minimumFractionDigits: d, maximumFractionDigits: d })}`;
    if (head !== P.head) {
      P.head = head;
      const text = `t = ${fmt(head, 2)} s`;
      if (P.clock && text !== P.clockText) P.clock.textContent = P.clockText = text;
      for (const c of P.cursors) {
        const x = Math.round((c.x0 + (c.x1 - c.x0) * (head / T_END)) * 10) / 10;
        if (x !== c.x) c.el.setAttribute("transform", `translate(${(c.x = x)} 0)`);
      }
    }
    for (const L of P.labels) {
      let o = 0;
      if (A && amount > 0.01) {
        const k = PLAN_HEAD + L.i * 3;
        const reveal = L.live !== null ? A[7] : !Number.isNaN(L.p) ? clamp((p - L.p) * 25) : !Number.isNaN(L.t) ? clamp((head - L.t) / 0.12) : 1;
        const below = P.pinned ? clamp((P.frame.y + P.frame.h + 24 - A[k + 1]) / 56) : 1;
        o = amount * reveal * A[k + 2] * below;
        if (o > 0.01) {
          const x = Math.round((A[k] - P.origin.x) * 2) / 2;
          const y = Math.round((A[k + 1] - P.origin.y) * 2) / 2;
          if (x !== L.x || y !== L.y) L.el.style.transform = `translate3d(${(L.x = x)}px, ${(L.y = y)}px, 0)`;
          if (L.live) {
            const right = x > P.box.w * 0.66;
            if (right !== L.right) L.el.classList.toggle("is-right", (L.right = right));
            const i = Number(L.live);
            const text = L.live === "d" ? `d ${fmt(A[6], 2)}` : `φ ${fmt(A[2 + i * 2], 0)}° · v ${fmt(A[3 + i * 2], 1)}`;
            if (text !== L.text) L.value.textContent = L.text = text;
          }
        }
      }
      o = Math.round(o * 20) / 20;
      if (o !== L.o) L.el.style.opacity = String((L.o = o));
    }
  }

  private setStep(step: number) {
    const p = this.poles!;
    this.step = step;
    p.steps.forEach((el, i) => el.classList.toggle("is-active", i === step));
    if (p.count) p.count.textContent = `0${step + 1}`;
  }

  private adapt(dt: number) {
    const stage = this.stage!;
    const pf = this.perf;
    pf.acc += dt;
    pf.n++;
    pf.cool -= dt;
    pf.calm += dt;
    if (pf.acc < 0.75 || pf.n < 20) return;
    const avg = pf.acc / pf.n;
    pf.acc = 0;
    pf.n = 0;
    if (pf.cool > 0) return;
    if (avg > 1 / 45 && stage.dpr > 1) {
      stage.setDpr(Math.max(1, stage.dpr - (avg > 1 / 28 ? 0.5 : 0.25)));
      if (pf.up && pf.calm < 3) pf.wait = Math.min(60, pf.wait * 2);
      pf.up = false;
      pf.cool = 1;
      pf.calm = 0;
    } else if (avg < 1 / 58 && stage.dpr < stage.maxDpr && pf.calm > pf.wait) {
      stage.setDpr(Math.min(stage.maxDpr, stage.dpr + 0.25));
      pf.up = true;
      pf.cool = 2;
      pf.calm = 0;
    }
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    cancelAnimationFrame(this.loaderRaf);
    this.cleanup.forEach((f) => f());
    this.urls.forEach((u) => URL.revokeObjectURL(u));
    this.stage?.dispose();
    this.stage = null;
    getLenis()?.start();
    const html = document.documentElement;
    html.classList.remove("oz-ready", "oz-in-hero", "oz-at-end", "oz-no-webgl");
    this.thumb?.style.removeProperty("--sp");
    delete html.dataset.header;
  }
}
