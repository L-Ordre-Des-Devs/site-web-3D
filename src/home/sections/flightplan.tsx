import type { CSSProperties } from "react";
import { useMemo } from "react";
import { LOCALE, texts, useLang, type Lang } from "../../i18n";
import { PLAN, type PlanShip } from "./plan-data";
import { ANCHOR, BALLOONS, GRID, SECONDS, T0, T1, T_END, balloonAt, pAt } from "./plan-time";

const TEXT = texts({
  fr: {
    dev: (attempts: number, penalty: string, near: string, text: string) => `traversee #${PLAN.seed}   essais ${attempts}   pénalité ${penalty}   proche ${near}   texte ${text}s`,
    crew: ["chef", "ailier1"],
    crossing: "croisement",
    gap: "écart",
    time: "temps (s)",
    bank: "inclinaison φ (°)",
    drawn: "partie dessinée",
    detail: "DÉTAIL A · vue de face",
  },
  en: {
    dev: (attempts: number, penalty: string, near: string, text: string) => `traversee #${PLAN.seed}   attempts ${attempts}   penalty ${penalty}   nearest ${near}   text ${text}s`,
    crew: ["lead", "wing1"],
    crossing: "crossing",
    gap: "gap",
    time: "time (s)",
    bank: "bank φ (°)",
    drawn: "drawn part",
    detail: "DETAIL A · front view",
  },
});

export const PLAN_COLORS = ["#ff8a3d", "#43c6ff"];
const WING = 1.36;
const HEX = 1.55;
const COCKPIT = 0.52;
const WINDOW = 0.31;
const GUN = 0.2;
const CAM_Z = 10;
const TAN = Math.tan((15 * Math.PI) / 180);

type V3 = [number, number, number];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

function rot(q: number[], v: V3): V3 {
  const [x, y, z, w] = q;
  const tx = 2 * (y * v[2] - z * v[1]);
  const ty = 2 * (z * v[0] - x * v[2]);
  const tz = 2 * (x * v[1] - y * v[0]);
  return [v[0] + w * tx + (y * tz - z * ty), v[1] + w * ty + (z * tx - x * tz), v[2] + w * tz + (x * ty - y * tx)];
}

interface State {
  t: number;
  p: V3;
  R: V3;
  U: V3;
  F: V3;
  bank: number;
  speed: number;
}

function state(s: PlanShip, t: number): State {
  const n = s.bank.length;
  const x = Math.min(Math.max(t * PLAN.hz, 0), n - 1);
  const i = Math.min(Math.floor(x), n - 2);
  const f = x - i;
  const lin = (arr: number[], stride: number, c: number) => arr[i * stride + c] + (arr[(i + 1) * stride + c] - arr[i * stride + c]) * f;
  const p: V3 = [lin(s.p, 3, 0), lin(s.p, 3, 1), lin(s.p, 3, 2)];
  const qa = s.q.slice(i * 4, i * 4 + 4);
  const qb = s.q.slice(i * 4 + 4, i * 4 + 8);
  const sign = qa[0] * qb[0] + qa[1] * qb[1] + qa[2] * qb[2] + qa[3] * qb[3] < 0 ? -1 : 1;
  const q = qa.map((v, c) => v + (qb[c] * sign - v) * f);
  const l = Math.hypot(...q) || 1;
  const qn = q.map((v) => v / l);
  return { t, p, R: rot(qn, [1, 0, 0]), U: rot(qn, [0, 1, 0]), F: rot(qn, [0, 0, -1]), bank: lin(s.bank, 1, 0), speed: lin(s.speed, 1, 0) };
}

const proj = (p: V3): [number, number] => {
  const k = 1 / ((CAM_Z - p[2]) * TAN);
  return [p[0] * k, -p[1] * k];
};
const sizeAt = (p: V3) => 1 / ((CAM_Z - p[2]) * TAN);

function crossings() {
  const [a, b] = PLAN.ships;
  const out: { t: number; gap: number; d: number }[] = [];
  const n = Math.min(a.bank.length, b.bank.length);
  let prev = 0;
  for (let k = 0; k < n; k++) {
    const dz = a.p[k * 3 + 2] - b.p[k * 3 + 2];
    if (k && Math.sign(dz) !== Math.sign(prev)) {
      const t = (k - 1 + prev / (prev - dz)) / PLAN.hz;
      const sa = state(a, t);
      const sb = state(b, t);
      out.push({ t, gap: Math.abs(sa.p[1] - sb.p[1]), d: dist(sa.p, sb.p) });
    }
    prev = dz;
  }
  return out.filter((c) => c.t <= T_END);
}

const fmt = (v: number, digits: number, lang: Lang) =>
  `${v < 0 ? "−" : ""}${Math.abs(v).toLocaleString(LOCALE[lang], { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
const f4 = (v: number) => (Math.round(v * 10000) / 10000).toString();
const at = (a: number, d = 0.04) => ({ "--a": a.toFixed(4), "--d": d.toFixed(4) }) as CSSProperties;

const VARIANTS = {
  wide: { t0: T0, t1: T1, step: 0.2, font: 0.0095, room: 1.07, compact: false, balloons: BALLOONS },
  narrow: { t0: 2.5, t1: 4.3, step: 0.2, font: 0.029, room: 1.2, compact: true, balloons: [2.6, 2.9, 3.2, 3.5, 3.8, 4.1] },
};
export type PlanVariant = keyof typeof VARIANTS;

function fighter(st: State) {
  const c = st.p;
  let wings = "";
  let arms = "";
  const [cx, cy] = proj(c);
  for (const side of [-1, 1]) {
    const wc = add(c, mul(st.R, side * WING));
    const at = (r: number, a: number) => proj(add(wc, add(mul(st.U, Math.sin(a) * r), mul(st.F, -Math.cos(a) * r))));
    const corners = Array.from({ length: 6 }, (_, k) => at(HEX, Math.PI / 2 + (k * Math.PI) / 3));
    const ring = Array.from({ length: 6 }, (_, k) => at(0.5, Math.PI / 2 + (k * Math.PI) / 3));
    const [wx, wy] = proj(wc);
    wings += `M${corners.map(([x, y]) => `${f4(x)},${f4(y)}`).join("L")}Z`;
    wings += `M${ring.map(([x, y]) => `${f4(x)},${f4(y)}`).join("L")}Z`;
    wings += corners.map(([x, y]) => `M${f4(wx)},${f4(wy)}L${f4(x)},${f4(y)}`).join("");
    arms += `M${f4(cx)},${f4(cy)}L${f4(wx)},${f4(wy)}`;
  }
  return { wings, arms, cx, cy, r: COCKPIT * sizeAt(c) };
}

function Attitude({ x, y, r, bank, color }: { x: number; y: number; r: number; bank: number; color: string }) {
  return (
    <g transform={`translate(${f4(x)} ${f4(y)})`}>
      <circle r={r} className="oz-plan__soft" />
      <path d={`M${f4(-r * 1.25)},0H${f4(r * 1.25)}`} className="oz-plan__soft" strokeDasharray="2 2" />
      <g transform={`rotate(${bank.toFixed(1)})`} stroke={color}>
        <path d={`M${f4(-r * 0.62)},${f4(-r * 0.6)}V${f4(r * 0.6)}M${f4(r * 0.62)},${f4(-r * 0.6)}V${f4(r * 0.6)}M${f4(-r * 0.62)},0H${f4(-r * 0.24)}M${f4(r * 0.24)},0H${f4(r * 0.62)}`} />
        <circle r={r * 0.24} />
      </g>
    </g>
  );
}

export function PlanDraw({ variant, className }: { variant: PlanVariant; className?: string }) {
  const lang = useLang();
  const t = TEXT[lang];
  const V = VARIANTS[variant];
  const plan = useMemo(() => {
    const ships = PLAN.ships.map((s) => {
      const frames: State[] = [];
      for (let k = Math.ceil(V.t0 / V.step - 1e-6); k * V.step <= V.t1 + 1e-6; k++) frames.push(state(s, Math.round(k * V.step * 1000) / 1000));
      const course: [number, number][] = [];
      for (let tt = V.t0; tt <= V.t1 + 1e-6; tt += 1 / PLAN.hz) course.push(proj(state(s, tt).p));
      return { frames, course };
    });
    const xs: number[] = [];
    const ys: number[] = [];
    ships.forEach((s) =>
      s.frames.forEach((st) => {
        for (const side of [-1, 1])
          for (const a of [Math.PI / 2, -Math.PI / 2, 0, Math.PI]) {
            const v = proj(add(add(st.p, mul(st.R, side * WING)), add(mul(st.U, Math.sin(a) * HEX), mul(st.F, -Math.cos(a) * HEX))));
            xs.push(v[0]);
            ys.push(v[1]);
          }
      }),
    );
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const w = (maxX - minX) * V.room;
    const fs = w * V.font;
    const band = { top: Math.min(...ys), bottom: Math.max(...ys) };
    const rows = { balloonsUp: band.top - fs * 4.3, tagsUp: band.top - fs * 1.9, tagsDown: band.bottom + fs * 1.9, balloonsDown: band.bottom + fs * 4.3, cross: band.bottom + fs * 6.6 };
    const vb = { x: minX - (maxX - minX) * 0.035, y: band.top - fs * 7.4, w, h: band.bottom - band.top + fs * 15.2 };
    return { ships, vb, fs, band, rows };
  }, [V]);
  const { vb, fs, rows } = plan;
  const crosses = useMemo(crossings, []);
  const grid = vb.w / (variant === "wide" ? 48 : 16);
  const id = `plan-grid-${variant}`;
  const stroke = vb.w * (variant === "wide" ? 0.0009 : 0.0032);

  const marks = V.balloons.map((tt, i) => {
    const ship = i % 2;
    const [x, y] = proj(state(PLAN.ships[ship], tt).p);
    return { i, x, y, by: ship ? rows.balloonsDown : rows.balloonsUp, r: fs * 1.15, color: PLAN_COLORS[ship] };
  });

  const cols = Array.from({ length: Math.floor(vb.w / (grid * 6)) + 1 }, (_, k) => vb.x + grid * 6 * (k + 0.5)).filter((x) => x < vb.x + vb.w - fs);
  const lines = Array.from({ length: Math.floor(vb.h / (grid * 6)) + 1 }, (_, k) => vb.y + grid * 6 * (k + 0.5)).filter((y) => y < vb.y + vb.h - fs);

  return (
    <svg className={`oz-plan__svg ${className ?? ""}`} viewBox={`${f4(vb.x)} ${f4(vb.y)} ${f4(vb.w)} ${f4(vb.h)}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ fontSize: fs }}>
      <defs>
        <pattern id={id} width={grid} height={grid} patternUnits="userSpaceOnUse" x={vb.x} y={vb.y}>
          <path d={`M${grid},0H0V${grid}`} className="oz-plan__grid" />
        </pattern>
      </defs>
      <g data-show style={at(0)}>
        <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill={`url(#${id})`} />
        {cols.map((x, k) => (
          <g key={`c${k}`}>
            <path d={`M${f4(x)},${f4(vb.y + fs * 2.2)}V${f4(vb.y + vb.h)}`} className="oz-plan__axis" />
            <circle cx={x} cy={vb.y + fs * 1.1} r={fs * 0.95} className="oz-plan__soft" />
            <text x={x} y={vb.y + fs * 1.45} textAnchor="middle" className="oz-plan__ref">
              {String.fromCharCode(65 + k)}
            </text>
          </g>
        ))}
        {lines.map((y, k) => (
          <g key={`r${k}`}>
            <path d={`M${f4(vb.x + fs * 2.2)},${f4(y)}H${f4(vb.x + vb.w)}`} className="oz-plan__axis" />
            <text x={vb.x + fs * 0.9} y={y + fs * 0.35} textAnchor="middle" className="oz-plan__ref">
              {k + 1}
            </text>
          </g>
        ))}
      </g>

      {plan.ships.map((s, i) => (
        <path
          key={`course${i}`}
          d={`M${s.course.map(([x, y]) => `${f4(x)},${f4(y)}`).join("L")}`}
          pathLength={1}
          data-draw
          style={at(pAt(V.t0), pAt(V.t1) - pAt(V.t0))}
          stroke={PLAN_COLORS[i]}
          strokeWidth={stroke}
          className="oz-plan__course"
        />
      ))}

      {Array.from({ length: Math.floor((V.t1 - V.t0) / 0.5) + 1 }, (_, k) => Math.ceil(V.t0 * 2) / 2 + k * 0.5)
        .filter((tt) => tt <= V.t1)
        .map((tt) => {
          const a = state(PLAN.ships[0], tt);
          const b = state(PLAN.ships[1], tt);
          const [ax, ay] = proj(a.p);
          const [bx, by] = proj(b.p);
          return (
            <g key={`v${tt}`} data-show style={at(pAt(tt) + 0.004)}>
              <path d={`M${f4(ax)},${f4(ay)}L${f4(bx)},${f4(by)}`} className="oz-plan__sight" />
              <text x={(ax + bx) / 2 + fs * 0.45} y={(ay + by) / 2 + fs * 0.35} className="oz-plan__small">
                d {fmt(dist(a.p, b.p), 2, lang)}
              </text>
            </g>
          );
        })}

      {plan.ships.flatMap((s, i) =>
        s.frames.map((st) => {
          const g = fighter(st);
          const whole = Math.abs(st.t - Math.round(st.t)) < 1e-3;
          return (
            <g key={`f${i}-${st.t.toFixed(2)}`} data-show style={at(pAt(st.t))} stroke={PLAN_COLORS[i]} fill={PLAN_COLORS[i]} className={whole ? "oz-plan__frame is-whole" : "oz-plan__frame"}>
              <path d={g.wings} />
              <path d={g.arms} />
              <circle cx={g.cx} cy={g.cy} r={g.r} />
            </g>
          );
        }),
      )}

      {plan.ships.flatMap((s, i) =>
        s.frames
          .filter((st) => Math.abs(st.t - Math.round(st.t)) < 1e-3)
          .map((st) => {
            const [x, y] = proj(st.p);
            const ty = i ? rows.tagsDown : rows.tagsUp;
            const r = fs * 1.15;
            const left = x + r * 1.55 + fs * 7.4 > vb.x + vb.w;
            const tx = left ? x - r * 1.55 : x + r * 1.55;
            const anchor = left ? "end" : "start";
            return (
              <g key={`a${i}-${st.t}`} data-show style={at(pAt(st.t) + 0.006)}>
                <path d={`M${f4(x)},${f4(y)}V${f4(ty + (i ? -r : r))}`} className="oz-plan__leader" stroke={PLAN_COLORS[i]} />
                <Attitude x={x} y={ty} r={r} bank={st.bank} color={PLAN_COLORS[i]} />
                <text x={tx} y={ty - fs * 0.12} textAnchor={anchor} className="oz-plan__label" style={{ fill: PLAN_COLORS[i] }}>
                  {V.compact ? `${Math.round(st.t)}s φ${fmt(st.bank, 0, lang)}°` : `${Math.round(st.t)} s · φ ${fmt(st.bank, 0, lang)}°`}
                </text>
                <text x={tx} y={ty + fs * 1.0} textAnchor={anchor} className="oz-plan__small">
                  v {fmt(st.speed, 1, lang)}
                </text>
              </g>
            );
          }),
      )}

      {crosses
        .filter((c) => c.t >= V.t0 && c.t <= V.t1 && c.gap > 0.6)
        .map((c) => {
          const a = proj(state(PLAN.ships[0], c.t).p);
          const b = proj(state(PLAN.ships[1], c.t).p);
          const mx = (a[0] + b[0]) / 2;
          const k = fs * 0.32;
          return (
            <g key={`x${c.t}`} data-show style={at(pAt(c.t) + 0.008)} className="oz-plan__cross">
              <path d={`M${f4(a[0])},${f4(a[1])}H${f4(mx + fs)}M${f4(b[0])},${f4(b[1])}H${f4(mx + fs)}`} className="oz-plan__soft" />
              <path d={`M${f4(mx + fs * 0.6)},${f4(a[1])}V${f4(b[1])}M${f4(mx + fs * 0.6 - k)},${f4(a[1] + k)}l${f4(2 * k)},${f4(-2 * k)}M${f4(mx + fs * 0.6 - k)},${f4(b[1] + k)}l${f4(2 * k)},${f4(-2 * k)}`} />
              <path d={`M${f4(mx + fs * 0.6)},${f4(Math.max(a[1], b[1]))}V${f4(rows.cross - fs * 1.1)}`} className="oz-plan__sight" />
              <text x={mx + fs * 0.6} y={rows.cross} textAnchor="middle" className="oz-plan__label">
                {t.crossing} · {fmt(c.t, 2, lang)} s
              </text>
              <text x={mx + fs * 0.6} y={rows.cross + fs * 1.2} textAnchor="middle" className="oz-plan__small">
                {t.gap} {fmt(c.gap, 2, lang)} · d {fmt(c.d, 2, lang)}
              </text>
            </g>
          );
        })}

      {marks.map((m) => (
        <g key={`m${m.i}`} data-show style={at(0.62 + m.i * 0.05)} stroke={m.color}>
          <path d={`M${f4(m.x)},${f4(m.y)}V${f4(m.by + (m.by > m.y ? -m.r : m.r))}`} className="oz-plan__leader" />
          <circle cx={m.x} cy={m.y} r={fs * 0.28} fill={m.color} />
          <circle cx={m.x} cy={m.by} r={m.r} className="oz-plan__balloon" />
          <text x={m.x} y={m.by + fs * 0.36} textAnchor="middle" className="oz-plan__num" style={{ fill: m.color }}>
            {String(m.i + 1).padStart(2, "0")}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function PlanChart({ variant, className }: { variant: PlanVariant; className?: string }) {
  const lang = useLang();
  const t = TEXT[lang];
  const V = VARIANTS[variant];
  const W = 1000;
  const H = variant === "wide" ? 150 : 330;
  const fs = variant === "wide" ? 13 : 30;
  const L = fs * 3.4;
  const R = fs * 0.8;
  const T = fs * 1.6;
  const B = fs * 1.9;
  const x = (tt: number) => L + (tt / T_END) * (W - L - R);
  const y = (b: number) => T + ((90 - b) / 180) * (H - T - B);
  const curves = useMemo(
    () =>
      PLAN.ships.map((s) => {
        const pts: string[] = [];
        let lo = { t: 0, b: Infinity };
        let hi = { t: 0, b: -Infinity };
        for (let k = 0; k / PLAN.hz <= T_END && k < s.bank.length; k++) {
          const tt = k / PLAN.hz;
          const b = s.bank[k];
          pts.push(`${(L + (tt / T_END) * (W - L - R)).toFixed(1)},${(T + ((90 - b) / 180) * (H - T - B)).toFixed(1)}`);
          if (b < lo.b) lo = { t: tt, b };
          if (b > hi.b) hi = { t: tt, b };
        }
        return { d: `M${pts.join("L")}`, lo, hi };
      }),
    [H, L, R, T, B],
  );
  const crosses = useMemo(crossings, []);
  return (
    <svg className={`oz-plan__svg ${className ?? ""}`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ fontSize: fs }}>
      <g data-show style={at(0.03)}>
        <rect x={x(V.t0)} y={T} width={x(V.t1) - x(V.t0)} height={H - T - B} className="oz-plan__band" />
        <text x={x(V.t0)} y={T - fs * 0.55} className="oz-plan__small">
          {t.drawn}
        </text>
        {[-90, -45, 0, 45, 90].map((b) => (
          <g key={b}>
            <path d={`M${L},${y(b)}H${W - R}`} className={b ? "oz-plan__axis" : "oz-plan__soft"} />
            <text x={L - fs * 0.5} y={y(b) + fs * 0.35} textAnchor="end" className="oz-plan__small">
              {fmt(b, 0, lang)}°
            </text>
          </g>
        ))}
        {Array.from({ length: Math.floor(T_END * 2) + 1 }, (_, k) => k / 2).map((tt) => (
          <g key={tt}>
            <path d={`M${x(tt)},${H - B}v${fs * (tt % 1 ? 0.35 : 0.6)}`} className="oz-plan__soft" />
            {tt % 1 === 0 && (
              <text x={x(tt)} y={H - B + fs * 1.55} textAnchor="middle" className="oz-plan__small">
                {tt}
              </text>
            )}
          </g>
        ))}
        <text x={L} y={T - fs * 0.55} className="oz-plan__label">
          {t.bank}
        </text>
        <text x={W - R} y={H - fs * 0.15} textAnchor="end" className="oz-plan__small">
          {t.time}
        </text>
      </g>
      {crosses.map((c, i) => {
        const near = (j: number) => j > 0 && x(crosses[j].t) - x(crosses[j - 1].t) < fs * 4.5;
        let label = `× ${fmt(c.t, 2, lang)}`;
        for (let j = i + 1; j < crosses.length && near(j); j++) label += ` · ${fmt(crosses[j].t, 2, lang)}`;
        return (
          <g key={c.t} data-show style={at(pAt(c.t))}>
            <path d={`M${x(c.t)},${T}V${H - B}`} className="oz-plan__sight" />
            {!near(i) && (
              <text x={x(c.t) + fs * 0.3} y={T + fs * 0.9} className="oz-plan__small">
                {label}
              </text>
            )}
          </g>
        );
      })}
      {curves.map((c, i) => (
        <g key={i} stroke={PLAN_COLORS[i]} fill={PLAN_COLORS[i]}>
          <path d={c.d} pathLength={1} data-draw style={at(pAt(0), pAt(T_END) - pAt(0))} strokeWidth={variant === "wide" ? 1.8 : 4} className="oz-plan__curve" />
          {[c.lo, c.hi].map((e) => (
            <g key={e.t} data-show style={at(pAt(e.t) + 0.004)}>
              <circle cx={x(e.t)} cy={y(e.b)} r={fs * 0.22} stroke="none" />
              <text x={x(e.t) + fs * 0.45} y={y(e.b) + (e.b < 0 ? fs * 1.05 : -fs * 0.4)} stroke="none" className="oz-plan__small">
                {fmt(e.b, 1, lang)}°
              </text>
            </g>
          ))}
        </g>
      ))}
      <g data-plan-cursor data-x0={x(0)} data-x1={x(T_END)} transform={`translate(${x(0)} 0)`}>
        <path d={`M0,${T - fs * 0.3}V${H - B}`} className="oz-plan__cursor" />
      </g>
    </svg>
  );
}

export function PlanLabels({ className }: { className?: string }) {
  const lang = useLang();
  const t = TEXT[lang];
  const seconds = useMemo(() => PLAN.ships.map((s) => SECONDS.map((tt) => state(s, tt))), []);
  const cross = useMemo(
    () =>
      crossings()
        .filter((c) => c.t >= T0 && c.t <= T1 && c.gap > 0.6)
        .sort((a, b) => b.gap - a.gap)[0],
    [],
  );
  return (
    <div className={`oz-plan3d ${className ?? ""}`} aria-hidden="true">
      <p className="oz-plan3d__clock" data-plan-clock>
        t = {fmt(0, 2, lang)} s
      </p>
      {PLAN.ships.map((_, i) => (
        <p key={`l${i}`} className={`oz-plan3d__tag oz-plan3d__live ${i ? "is-b" : "is-a"}`} data-plan-anchor={ANCHOR.live + i} data-plan-live={i} style={{ color: PLAN_COLORS[i] }}>
          <b>{t.crew[i]}</b> <span data-v />
        </p>
      ))}
      <p className="oz-plan3d__tag oz-plan3d__dist" data-plan-anchor={ANCHOR.sight} data-plan-live="d" />
      {seconds.flatMap((row, i) =>
        row.map((st, j) => (
          <p key={`s${i}-${j}`} className={`oz-plan3d__tag oz-plan3d__sec ${i ? "is-b" : "is-a"}`} data-plan-anchor={ANCHOR.seconds + i * SECONDS.length + j} data-plan-t={SECONDS[j]} style={{ color: PLAN_COLORS[i] }}>
            {SECONDS[j]} s · φ {fmt(st.bank, 0, lang)}°<small>v {fmt(st.speed, 1, lang)}</small>
          </p>
        )),
      )}
      {cross && (
        <p className="oz-plan3d__tag oz-plan3d__cross" data-plan-anchor={ANCHOR.cross} data-plan-t={cross.t}>
          {t.crossing} · {fmt(cross.t, 2, lang)} s
          <small>
            {t.gap} {fmt(cross.gap, 2, lang)} · d {fmt(cross.d, 2, lang)}
          </small>
        </p>
      )}
      {BALLOONS.map((_, i) => (
        <p key={`b${i}`} className={`oz-plan3d__balloon ${i % 2 ? "is-down" : "is-up"}`} data-plan-anchor={ANCHOR.balloons + i} data-plan-p={balloonAt(i)} style={{ color: PLAN_COLORS[i % 2] }}>
          <span>{String(i + 1).padStart(2, "0")}</span>
        </p>
      ))}
      {Array.from({ length: GRID.cols }, (_, k) => (
        <p key={`c${k}`} className="oz-plan3d__ref" data-plan-anchor={ANCHOR.cols + k} data-plan-p={0.02}>
          {String.fromCharCode(65 + k)}
        </p>
      ))}
      {Array.from({ length: GRID.rows }, (_, k) => (
        <p key={`r${k}`} className="oz-plan3d__ref" data-plan-anchor={ANCHOR.rows + k} data-plan-p={0.02}>
          {k + 1}
        </p>
      ))}
    </div>
  );
}

function Dim({ x1, y1, x2, y2, label, off, fs, vertical }: { x1: number; y1: number; x2: number; y2: number; label: string; off: number; fs: number; vertical?: boolean }) {
  const t = fs * 0.35;
  if (vertical) {
    const x = x1 + off;
    return (
      <g>
        <path d={`M${f4(x1)},${f4(y1)}H${f4(x + Math.sign(off) * t)}M${f4(x2)},${f4(y2)}H${f4(x + Math.sign(off) * t)}`} className="oz-plan__soft" />
        <path d={`M${f4(x)},${f4(y1)}V${f4(y2)}M${f4(x - t)},${f4(y1 + t)}L${f4(x + t)},${f4(y1 - t)}M${f4(x - t)},${f4(y2 + t)}L${f4(x + t)},${f4(y2 - t)}`} className="oz-plan__dim" />
        <text x={x + Math.sign(off) * fs * 0.45} y={(y1 + y2) / 2 + fs * 0.35} textAnchor={off > 0 ? "start" : "end"} className="oz-plan__dimtext">
          {label}
        </text>
      </g>
    );
  }
  const y = y1 + off;
  return (
    <g>
      <path d={`M${f4(x1)},${f4(y1)}V${f4(y + Math.sign(off) * t)}M${f4(x2)},${f4(y2)}V${f4(y + Math.sign(off) * t)}`} className="oz-plan__soft" />
      <path d={`M${f4(x1)},${f4(y)}H${f4(x2)}M${f4(x1 - t)},${f4(y + t)}L${f4(x1 + t)},${f4(y - t)}M${f4(x2 - t)},${f4(y + t)}L${f4(x2 + t)},${f4(y - t)}`} className="oz-plan__dim" />
      <text x={(x1 + x2) / 2} y={y - fs * 0.4} textAnchor="middle" className="oz-plan__dimtext">
        {label}
      </text>
    </g>
  );
}

export function PlanDetail({ className }: { className?: string }) {
  const lang = useLang();
  const t = TEXT[lang];
  const fs = 0.2;
  const n = (v: number) => fmt(v, 2, lang);
  const oct = Array.from({ length: 8 }, (_, k) => {
    const a = Math.PI / 8 + (k * Math.PI) / 4;
    return `${f4(Math.cos(a) * WINDOW)},${f4(Math.sin(a) * WINDOW)}`;
  }).join("L");
  return (
    <svg className={`oz-plan__svg ${className ?? ""}`} viewBox="-2.75 -2.55 5.5 5.15" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ fontSize: fs }}>
      <g data-show style={at(0.42)}>
        <text x={-2.7} y={-2.3} className="oz-plan__label" fill="currentColor">
          {t.detail}
        </text>
      </g>
      <g stroke={PLAN_COLORS[1]} strokeWidth={0.03} className="oz-plan__part">
        {[-1, 1].map((s) => (
          <g key={s}>
            <rect x={s * WING - 0.06} y={-HEX} width={0.12} height={HEX * 2} pathLength={1} data-draw style={at(0.44, 0.06)} />
            <path d={`M${f4(s * 0.45)},-0.085L${f4(s * 1.31)},-0.16M${f4(s * 0.45)},0.085L${f4(s * 1.31)},0.16`} pathLength={1} data-draw style={at(0.46, 0.05)} />
            <path d={`M${f4(s * 0.62)},-0.15V0.15M${f4(s * 1.02)},-0.1V0.1`} pathLength={1} data-draw style={at(0.47, 0.04)} />
          </g>
        ))}
        <circle r={COCKPIT} pathLength={1} data-draw style={at(0.44, 0.06)} />
        <path d={`M${oct}Z`} pathLength={1} data-draw style={at(0.47, 0.05)} />
        {[-1, 1].map((s) => (
          <circle key={s} cx={s * GUN} cy={0.33} r={0.05} data-show style={at(0.5)} />
        ))}
      </g>
      <g data-show style={at(0.52)} className="oz-plan__dims">
        <Dim x1={WING + 0.06} y1={-HEX} x2={WING + 0.06} y2={HEX} off={0.42} fs={fs} vertical label={n(HEX * 2)} />
        <Dim x1={-WING} y1={-HEX} x2={WING} y2={-HEX} off={-0.32} fs={fs} label={n(WING * 2)} />
        <Dim x1={-COCKPIT} y1={COCKPIT} x2={COCKPIT} y2={COCKPIT} off={0.62} fs={fs} label={`Ø ${n(COCKPIT * 2)}`} />
        <Dim x1={-GUN} y1={0.38} x2={GUN} y2={0.38} off={1.32} fs={fs} label={n(GUN * 2)} />
      </g>
    </svg>
  );
}

export function PlanDev({ className }: { className?: string }) {
  const lang = useLang();
  const t = TEXT[lang];
  const moves = PLAN.ships.map((s, i) => `${t.crew[i]}(${s.follow}: ${s.moves})`).join("   ");
  return (
    <div className={`oz-plan__dev ${className ?? ""}`} aria-hidden="true">
      <p data-type style={at(0.015, 0.09)}>{t.dev(PLAN.attempts, PLAN.penalty.toFixed(2), PLAN.near.toFixed(1), PLAN.text.toFixed(2))}</p>
      <p data-type style={at(0.05, 0.09)}>{moves}</p>
    </div>
  );
}

export const planInfoAt = (i: number) => at(0.64 + i * 0.05);
