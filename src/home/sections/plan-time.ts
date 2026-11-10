import { PLAN } from "./plan-data";

export const T0 = 1.9;
export const T1 = 4.6;
export const T_END = 4.8;
export const P0 = 0.06;
export const P1 = 0.58;
export const STEP = 0.2;
export const SECONDS = [2, 3, 4];
export const BALLOONS = [2.15, 2.6, 3.05, 3.5, 3.95, 4.4];
export const GRID = { cols: 8, rows: 4 };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const pAt = (t: number) => P0 + ((P1 - P0) * clamp(t, 0, T_END)) / T_END;
export const timeAt = (p: number) => clamp((p - P0) / (P1 - P0)) * T_END;
export const balloonAt = (i: number) => 0.62 + i * 0.05;

export const ANCHOR = {
  live: 0,
  sight: 2,
  seconds: 3,
  cross: 3 + SECONDS.length * 2,
  balloons: 4 + SECONDS.length * 2,
  cols: 10 + SECONDS.length * 2,
  rows: 10 + SECONDS.length * 2 + GRID.cols,
  count: 10 + SECONDS.length * 2 + GRID.cols + GRID.rows,
};

export const PLAN_HEAD = 8;

function crossings() {
  const [a, b] = PLAN.ships;
  const out: { t: number; k: number }[] = [];
  const n = Math.min(a.bank.length, b.bank.length);
  let prev = 0;
  for (let k = 0; k < n; k++) {
    const dz = a.p[k * 3 + 2] - b.p[k * 3 + 2];
    if (k && Math.sign(dz) !== Math.sign(prev)) out.push({ t: (k - 1 + prev / (prev - dz)) / PLAN.hz, k });
    prev = dz;
  }
  return out.filter((c) => c.t <= T_END);
}
export const CROSSINGS = crossings().map((c) => c.t);
