export const LEG = {
  hipX: 5.15,
  hipY: 14.45,
  z: 3.9,
  thigh: 5.0,
  shin: 8.6,
  ankle: 1.55,
  foot: 1.95,
} as const;

export const STEP = {
  period: 7.0,
  duty: 0.75,
  speed: 1.05,
  lift: 1.5,
} as const;

export const STRIDE = STEP.speed * STEP.period;

export interface LegDef {
  fore: number;
  side: number;
  phase: number;
}

export const LEGS: LegDef[] = [
  { fore: -1, side: -1, phase: 0 },
  { fore: 1, side: -1, phase: 0.25 },
  { fore: -1, side: 1, phase: 0.5 },
  { fore: 1, side: 1, phase: 0.75 },
];

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const minjerk = (t: number) => t * t * t * (10 - 15 * t + 6 * t * t);
const frac = (x: number) => x - Math.floor(x);

export interface Foot {
  along: number;
  lift: number;
  pitch: number;
  contact: boolean;
  since: number;
  u: number;
}

export const newFoot = (): Foot => ({ along: 0, lift: 0, pitch: 0, contact: true, since: 0, u: 0 });

export function footAt(leg: LegDef, s: number, out: Foot): Foot {
  const S = STRIDE;
  const b = STEP.duty;
  const psi = frac(s / S - leg.phase);
  const hip = leg.fore * LEG.hipX;
  out.since = psi * STEP.period;
  if (psi < b) {
    out.along = s - psi * S + hip + (b * S) / 2;
    out.lift = 0;
    out.pitch = 0;
    out.contact = true;
    out.u = 0;
    return out;
  }
  const u = (psi - b) / (1 - b);
  const start = s - (psi - b) * S + hip - (b * S) / 2;
  out.along = start + S * minjerk(clamp01((u - 0.1) / 0.78));
  out.lift = STEP.lift * smoothstep(0, 0.32, u) * (1 - smoothstep(0.6, 1, u));
  out.pitch = -0.09 * Math.sin(Math.PI * u);
  out.contact = false;
  out.u = u;
  return out;
}

export interface Sway {
  bob: number;
  roll: number;
  pitch: number;
  surge: number;
}

export const newSway = (): Sway => ({ bob: 0, roll: 0, pitch: 0, surge: 0 });

export function swayAt(feet: Foot[], s: number, out: Sway): Sway {
  let dip = 0;
  let roll = 0;
  let pitch = 0;
  for (let i = 0; i < LEGS.length; i++) {
    const leg = LEGS[i];
    const f = feet[i];
    const k = f.lift / STEP.lift;
    roll += leg.side * k;
    pitch -= leg.fore * k;
    const t = f.since;
    dip += Math.exp(-t / 0.34) * (1 - Math.exp(-t / 0.04)) + 0.3 * Math.exp(-t / 0.16) * Math.sin(t * 38);
  }
  out.bob = -0.15 * dip;
  out.roll = 0.011 * roll;
  out.pitch = 0.008 * pitch;
  out.surge = 0.05 * Math.sin((2 * Math.PI * 4 * s) / STRIDE - 0.9);
  return out;
}

export interface Knee {
  kx: number;
  ky: number;
  ax: number;
  ay: number;
  reach: number;
}

export const newKnee = (): Knee => ({ kx: 0, ky: 0, ax: 0, ay: 0, reach: 0 });

export function ik(hx: number, hy: number, ax: number, ay: number, out: Knee): Knee {
  const L1 = LEG.thigh;
  const L2 = LEG.shin;
  const dx = ax - hx;
  const dy = ay - hy;
  const d = Math.hypot(dx, dy);
  out.reach = d / (L1 + L2);
  const dm = Math.min(Math.max(d, Math.abs(L1 - L2) + 0.01), (L1 + L2) * 0.9995);
  const phi = Math.atan2(dy, dx);
  const c = (L1 * L1 + dm * dm - L2 * L2) / (2 * L1 * dm);
  const a = Math.acos(Math.max(-1, Math.min(1, c)));
  const t = phi + a;
  out.kx = hx + L1 * Math.cos(t);
  out.ky = hy + L1 * Math.sin(t);
  out.ax = hx + dm * Math.cos(phi);
  out.ay = hy + dm * Math.sin(phi);
  return out;
}

export interface Gaze {
  yaw: number;
  pitch: number;
}

export function gazeAt(time: number, seed: number, out: Gaze): Gaze {
  out.yaw = 0.13 * Math.sin(0.105 * time + seed) + 0.05 * Math.sin(0.29 * time + seed * 2.3);
  out.pitch = -0.035 + 0.03 * Math.sin(0.16 * time + seed * 1.7);
  return out;
}

export function groundY(x: number, z: number) {
  return 0.45 * Math.sin(x * 0.043 + 1.3) * Math.cos(z * 0.031 - 0.4) + 0.22 * Math.sin((x - z) * 0.071 + 2.1);
}
