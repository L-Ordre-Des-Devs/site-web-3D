import * as THREE from "three";

export type Kind = "arrivee" | "attaque" | "poursuite" | "traversee" | "chandelle" | "eventail" | "patrouille";
export type Rand = () => number;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (t: number) => t * t * (3 - 2 * t);

export function rng(seed: number): Rand {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SIM_HZ = 60;
const DT = 1 / SIM_HZ;
export const SAMPLE = 10;
export const MAX_TIME = 20;
const MAX_STEPS = MAX_TIME * SIM_HZ;
export const MAX_CREW = 3;
const CHUNK = 20;

const CAM_Z = 10;
const TAN = Math.tan((15 * Math.PI) / 180);

const UP = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);

export class Guide {
  static readonly STEP = 0.5;
  readonly length: number;
  private pts: Float32Array;
  private count: number;

  constructor(ctrl: THREE.Vector3[], extend = 90) {
    const raw: number[] = [];
    const N = 160;
    for (let k = 0; k + 3 < ctrl.length; k += 3) {
      const p0 = ctrl[k];
      const p1 = ctrl[k + 1];
      const p2 = ctrl[k + 2];
      const p3 = ctrl[k + 3];
      for (let i = k ? 1 : 0; i <= N; i++) {
        const t = i / N;
        const u = 1 - t;
        const a = u * u * u;
        const b = 3 * u * u * t;
        const c = 3 * u * t * t;
        const d = t * t * t;
        raw.push(a * p0.x + b * p1.x + c * p2.x + d * p3.x, a * p0.y + b * p1.y + c * p2.y + d * p3.y, a * p0.z + b * p1.z + c * p2.z + d * p3.z);
      }
    }
    const m = raw.length / 3;
    const cum = new Float64Array(m);
    for (let i = 1; i < m; i++) cum[i] = cum[i - 1] + Math.hypot(raw[i * 3] - raw[i * 3 - 3], raw[i * 3 + 1] - raw[i * 3 - 2], raw[i * 3 + 2] - raw[i * 3 - 1]);
    this.length = cum[m - 1];
    const step = Guide.STEP;
    const core = Math.floor(this.length / step) + 1;
    const ext = Math.ceil(extend / step);
    const pts = new Float32Array((core + ext) * 3);
    let j = 0;
    for (let i = 0; i < core; i++) {
      const s = i * step;
      while (j < m - 2 && cum[j + 1] < s) j++;
      const f = (s - cum[j]) / Math.max(1e-9, cum[j + 1] - cum[j]);
      for (let c = 0; c < 3; c++) pts[i * 3 + c] = raw[j * 3 + c] + (raw[j * 3 + 3 + c] - raw[j * 3 + c]) * f;
    }
    const e = (m - 1) * 3;
    let tx = raw[e] - raw[e - 3];
    let ty = raw[e + 1] - raw[e - 2];
    let tz = raw[e + 2] - raw[e - 1];
    const tl = Math.hypot(tx, ty, tz) || 1;
    tx /= tl;
    ty /= tl;
    tz /= tl;
    const last = (core - 1) * 3;
    for (let i = 0; i < ext; i++) {
      const o = (core + i) * 3;
      const d = (i + 1) * step;
      pts[o] = pts[last] + tx * d;
      pts[o + 1] = pts[last + 1] + ty * d;
      pts[o + 2] = pts[last + 2] + tz * d;
    }
    this.pts = pts;
    this.count = core + ext;
  }

  at(s: number, out: THREE.Vector3) {
    const x = s / Guide.STEP;
    const i = Math.min(this.count - 2, Math.max(0, Math.floor(x)));
    const f = x - i;
    const P = this.pts;
    const o = i * 3;
    return out.set(P[o] + (P[o + 3] - P[o]) * f, P[o + 1] + (P[o + 4] - P[o + 1]) * f, P[o + 2] + (P[o + 5] - P[o + 2]) * f);
  }

  tangent(s: number, out: THREE.Vector3) {
    const i = Math.min(this.count - 2, Math.max(0, Math.floor(s / Guide.STEP)));
    const P = this.pts;
    const o = i * 3;
    return out.set(P[o + 3] - P[o], P[o + 4] - P[o + 1], P[o + 5] - P[o + 2]).normalize();
  }

  project(p: THREE.Vector3, from: number) {
    const P = this.pts;
    const i0 = Math.min(this.count - 2, Math.max(0, Math.floor(from / Guide.STEP) - 2));
    const i1 = Math.min(this.count - 2, i0 + 30);
    let best = Infinity;
    let bi = i0;
    for (let i = i0; i <= i1; i++) {
      const dx = P[i * 3] - p.x;
      const dy = P[i * 3 + 1] - p.y;
      const dz = P[i * 3 + 2] - p.z;
      const d = dx * dx + dy * dy + dz * dz;
      if (d < best) {
        best = d;
        bi = i;
      }
    }
    const o = bi * 3;
    const ax = P[o + 3] - P[o];
    const ay = P[o + 4] - P[o + 1];
    const az = P[o + 5] - P[o + 2];
    const k = clamp(((p.x - P[o]) * ax + (p.y - P[o + 1]) * ay + (p.z - P[o + 2]) * az) / (Guide.STEP * Guide.STEP));
    return Math.max(from, (bi + k) * Guide.STEP);
  }
}

export interface Pilot {
  G: number;
  aMax: number;
  wn: number;
  zeta: number;
  rollRate: number;
  bank: number;
  tau: number;
  lag: number;
  keen: number;
  wob: number[];
}

function pilot(r: Rand): Pilot {
  const wob: number[] = [];
  for (let k = 0; k < 3; k++) wob.push(0.45 + r() * 0.5, 1.3 + r() * 0.9);
  for (let k = 0; k < 6; k++) wob.push(r() * Math.PI * 2);
  return {
    G: 10 + r() * 5,
    aMax: 44 + r() * 24,
    wn: 4.2 + r() * 2.6,
    zeta: 0.5 + r() * 0.25,
    rollRate: 2.3 + r() * 1.3,
    bank: 1.22 + r() * 0.22,
    tau: 0.72 + r() * 0.26,
    lag: 0.26 + r() * 0.32,
    keen: 1.25 + r() * 0.65,
    wob,
  };
}

function wobble(P: Pilot, axis: number, t: number) {
  const w = P.wob;
  return 0.62 * Math.sin(w[axis * 2] * t + w[6 + axis * 2]) + 0.38 * Math.sin(w[axis * 2 + 1] * t + w[7 + axis * 2]);
}

export type MoveType = "jink" | "break" | "cross" | "weave";

export interface Move {
  type: MoveType;
  at: number;
  atProg: number;
  len: number;
  side: number;
  amp: number;
  lift: number;
  away: boolean;
  period: number;
  phase: number;
}

const move = (type: MoveType, at: number, len: number, side: number, amp: number, lift = 0, extra: Partial<Move> = {}): Move => ({
  type,
  at,
  atProg: -1,
  len,
  side,
  amp,
  lift,
  away: false,
  period: 2,
  phase: 0,
  ...extra,
});

export interface Crew {
  pilot: Pilot;
  slot: THREE.Vector3;
  follow: "guide" | "lead";
  breathe: [number, number, number];
  scatter: THREE.Vector3;
  delay: number;
  moves: Move[];
}

export interface Plan {
  kind: Kind;
  guide: Guide;
  speed: number;
  profile: [number, number][];
  launch: number;
  energy: number;
  crew: Crew[];
  fire: [number, number];
  portrait: boolean;
}

function profileAt(profile: [number, number][], x: number) {
  if (x <= profile[0][0]) return profile[0][1];
  for (let i = 1; i < profile.length; i++) {
    const [x1, v1] = profile[i];
    if (x <= x1) {
      const [x0, v0] = profile[i - 1];
      return v0 + (v1 - v0) * smooth(clamp((x - x0) / Math.max(1e-6, x1 - x0)));
    }
  }
  return profile[profile.length - 1][1];
}

export interface TrackInfo {
  speed: number;
  thrust: number;
  calm: number;
}

export class Track {
  readonly data = new Float32Array((MAX_STEPS + 2) * SAMPLE);
  n = 0;

  get duration() {
    return Math.max(0, this.n - 1) / SIM_HZ;
  }

  push(p: THREE.Vector3, q: THREE.Quaternion, speed: number, thrust: number, calm: number) {
    if ((this.n + 1) * SAMPLE > this.data.length) return;
    const o = this.n++ * SAMPLE;
    const d = this.data;
    d[o] = p.x;
    d[o + 1] = p.y;
    d[o + 2] = p.z;
    d[o + 3] = q.x;
    d[o + 4] = q.y;
    d[o + 5] = q.z;
    d[o + 6] = q.w;
    d[o + 7] = speed;
    d[o + 8] = thrust;
    d[o + 9] = calm;
  }

  read(t: number, pos: THREE.Vector3, quat: THREE.Quaternion, out: TrackInfo) {
    const last = Math.max(0, this.n - 1);
    const x = clamp(t * SIM_HZ, 0, last);
    const i = Math.min(Math.floor(x), Math.max(0, last - 1));
    const f = last > 0 ? x - i : 0;
    const d = this.data;
    const a = i * SAMPLE;
    const b = last > 0 ? a + SAMPLE : a;
    pos.set(d[a] + (d[b] - d[a]) * f, d[a + 1] + (d[b + 1] - d[a + 1]) * f, d[a + 2] + (d[b + 2] - d[a + 2]) * f);
    qa.set(d[a + 3], d[a + 4], d[a + 5], d[a + 6]);
    qb.set(d[b + 3], d[b + 4], d[b + 5], d[b + 6]);
    quat.slerpQuaternions(qa, qb, f);
    out.speed = d[a + 7] + (d[b + 7] - d[a + 7]) * f;
    out.thrust = d[a + 8] + (d[b + 8] - d[a + 8]) * f;
    out.calm = f < 0.5 ? d[a + 9] : d[b + 9];
    return out;
  }
}

interface Body {
  p: THREE.Vector3;
  f: THREE.Vector3;
  u: THREE.Vector3;
  s: number;
  wr: number;
  prog: number;
  pull: number;
  thr: number;
  rec: boolean;
  starts: number[];
  away: boolean;
  t1: THREE.Vector3;
  t2: THREE.Vector3;
  seen: number;
}

const body = (): Body => ({
  p: new THREE.Vector3(),
  f: new THREE.Vector3(0, 0, -1),
  u: new THREE.Vector3(0, 1, 0),
  s: 0,
  wr: 0,
  prog: 0,
  pull: 0,
  thr: 0,
  rec: true,
  starts: [],
  away: false,
  t1: new THREE.Vector3(),
  t2: new THREE.Vector3(),
  seen: 0,
});

const qa = new THREE.Quaternion();
const qb = new THREE.Quaternion();
const yN = new THREE.Vector3();
const rN = new THREE.Vector3();
const vL = new THREE.Vector3();
const uT = new THREE.Vector3();
const cr = new THREE.Vector3();
const vel = new THREE.Vector3();
const acc = new THREE.Vector3();
const A = new THREE.Vector3();
const carrot = new THREE.Vector3();
const gT = new THREE.Vector3();
const gU = new THREE.Vector3();
const gR = new THREE.Vector3();
const lp = new THREE.Vector3();
const lf = new THREE.Vector3();
const target = new THREE.Vector3();
const tv = new THREE.Vector3();
const ta = new THREE.Vector3();
const dv = new THREE.Vector3();
const dir = new THREE.Vector3();
const right = new THREE.Vector3();
const back = new THREE.Vector3();
const mat = new THREE.Matrix4();
const quat = new THREE.Quaternion();

function level(f: THREE.Vector3, up: THREE.Vector3, rt: THREE.Vector3, ref: THREE.Vector3) {
  up.copy(UP).addScaledVector(f, -f.y);
  const l = up.length();
  if (l < 0.05) up.copy(ref).addScaledVector(f, -ref.dot(f)).normalize();
  else up.divideScalar(l);
  rt.crossVectors(f, up);
  return l;
}

function pursue(b: Body, aim: THREE.Vector3, aMax: number, out: THREE.Vector3) {
  dir.subVectors(aim, b.p);
  const dist = Math.max(2, dir.length());
  dir.normalize();
  const cosA = dir.dot(b.f);
  out.copy(dir).addScaledVector(b.f, -cosA);
  const sinA = out.length();
  if (sinA < 1e-6) return out.set(0, 0, 0);
  const a = cosA > 0 ? Math.min(aMax, (2 * b.s * b.s * sinA) / dist) : aMax;
  return out.multiplyScalar(a / sinA);
}

function step(b: Body, P: Pilot, want: THREE.Vector3, speed: number, bankMax: number, aMax: number, energy: number) {
  const f = b.f;
  const cosT = level(f, yN, rN, b.u);
  vL.copy(want).addScaledVector(yN, P.G * cosT);
  const lat = vL.dot(rN);
  const vert = Math.max(vL.dot(yN), P.G * cosT);
  const beta = clamp(Math.atan2(lat, vert), -bankMax, bankMax);
  uT.copy(yN).multiplyScalar(Math.cos(beta)).addScaledVector(rN, Math.sin(beta));
  cr.crossVectors(b.u, uT);
  const err = Math.atan2(cr.dot(f), b.u.dot(uT));
  b.wr += (P.wn * P.wn * err - 2 * P.zeta * P.wn * b.wr) * DT;
  b.wr = clamp(b.wr, -P.rollRate, P.rollRate);
  b.u.applyAxisAngle(f, b.wr * DT);
  b.pull = clamp(vL.dot(b.u), -0.3 * P.G, Math.hypot(aMax, P.G));
  b.thr = clamp(2.2 * (speed - b.s), -30, 18);
  const thrust = b.thr + P.G * f.y * (1 - energy);
  vel.copy(f).multiplyScalar(b.s);
  acc.copy(b.u).multiplyScalar(b.pull).addScaledVector(UP, -P.G).addScaledVector(f, thrust);
  vel.addScaledVector(acc, DT);
  const s = vel.length();
  f.copy(vel).divideScalar(s);
  b.s = Math.max(4, s);
  b.p.addScaledVector(f, b.s * DT);
  b.u.addScaledVector(f, -b.u.dot(f)).normalize();
}

function leaderAt(hist: Float32Array, t: number, p: THREE.Vector3, f: THREE.Vector3) {
  const x = t * SIM_HZ;
  if (x <= 0) {
    p.set(hist[0], hist[1], hist[2]);
    f.set(hist[3], hist[4], hist[5]);
    p.addScaledVector(f, hist[6] * t);
    return hist[6];
  }
  const i = Math.floor(x);
  const k = x - i;
  const a = i * 7;
  const b = a + 7;
  p.set(hist[a] + (hist[b] - hist[a]) * k, hist[a + 1] + (hist[b + 1] - hist[a + 1]) * k, hist[a + 2] + (hist[b + 2] - hist[a + 2]) * k);
  f.set(hist[a + 3] + (hist[b + 3] - hist[a + 3]) * k, hist[a + 4] + (hist[b + 4] - hist[a + 4]) * k, hist[a + 5] + (hist[b + 5] - hist[a + 5]) * k).normalize();
  return hist[a + 6] + (hist[b + 6] - hist[a + 6]) * k;
}

function offscreen(p: THREE.Vector3, aspect: number) {
  const dz = CAM_Z - p.z;
  if (dz < 1 || dz > 330) return true;
  const h = dz * TAN;
  return Math.abs(p.y) > h + 5.2 || Math.abs(p.x) > h * aspect + 2.2;
}

export interface Sky {
  aspect: number;
  portrait: boolean;
  reduced: boolean;
}

export interface Flight {
  near: number;
  text: number;
  cut: boolean;
  duration: number;
  penalty: number;
}

const flight = (): Flight => ({ near: Infinity, text: 0, cut: false, duration: 0, penalty: 0 });

export type Probe = (ship: number, t: number, bank: number, pull: number, rollRate: number, speed: number) => void;

export function* flying(plan: Plan, tracks: Track[], sky: Sky, res: Flight, probe?: Probe): Generator<void, void, void> {
  const G = plan.guide;
  const crew = plan.crew;
  const n = crew.length;
  const bodies = crew.map(body);
  const hist = new Float32Array(MAX_STEPS * 7 + 7);
  const lead = bodies[0];
  G.at(0, lead.p);
  G.tangent(0, lead.f);
  level(lead.f, lead.u, right, UP);
  const s0 = plan.speed * profileAt(plan.profile, 0) * plan.launch;
  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    const c = crew[i];
    if (i > 0) {
      b.f.copy(lead.f);
      b.u.copy(lead.u);
      b.p.copy(lead.p).addScaledVector(right, c.slot.x).addScaledVector(lead.u, c.slot.y).addScaledVector(lead.f, -c.slot.z).add(c.scatter);
    }
    b.s = s0;
    b.pull = c.pilot.G;
    for (let j = 0; j < c.moves.length; j++) b.starts.push(-1);
    tracks[i].n = 0;
  }

  for (let k = 0; k < MAX_STEPS; k++) {
    const t = k * DT;
    const leadFrac = lead.prog / G.length;
    let busy = false;
    for (let i = 0; i < n; i++) {
      const b = bodies[i];
      const c = crew[i];
      const P = c.pilot;
      if (c.follow === "guide") b.prog = G.project(b.p, b.prog);
      if (i === 0) {
        const o = k * 7;
        hist[o] = b.p.x;
        hist[o + 1] = b.p.y;
        hist[o + 2] = b.p.z;
        hist[o + 3] = b.f.x;
        hist[o + 4] = b.f.y;
        hist[o + 5] = b.f.z;
        hist[o + 6] = b.s;
      }

      const reach = Math.max(10, b.s * 0.8);
      let ox = c.breathe[0] * wobble(P, 0, t);
      let oy = c.breathe[1] * wobble(P, 1, t);
      const oz = c.breathe[2] * wobble(P, 2, t);
      let sx = c.slot.x;
      let sy = c.slot.y;
      let sz = c.slot.z;
      let calm = 1;
      let brk: Move | null = null;
      let brkK = 0;
      let cruise = false;
      for (let j = 0; j < c.moves.length; j++) {
        const m = c.moves[j];
        if (b.starts[j] < 0 && (m.atProg >= 0 ? b.prog / G.length >= m.atProg : t >= m.at)) b.starts[j] = t;
        const st = b.starts[j];
        if (st < 0) continue;
        const q = (t - st) / m.len;
        if (m.type === "jink") {
          if (q < 1) {
            const w = Math.sin(Math.PI * q);
            ox += m.side * m.amp * reach * w;
            oy += m.lift * reach * w;
            calm = 0;
          }
        } else if (m.type === "cross") {
          const e = smooth(clamp(q));
          const w = Math.sin(Math.PI * e);
          sx *= Math.cos(Math.PI * e);
          sz += 2.8 * w;
          sy -= 1.4 * w;
          if (q < 1) calm = 0;
        } else if (m.type === "weave") {
          if (q < 1) {
            const env = smooth(clamp(q * 4)) * smooth(clamp((1 - q) * 4));
            ox += m.amp * Math.cos((Math.PI * 2 * (t - st)) / m.period + m.phase) * env;
            oy += m.lift * env;
          }
        } else if (q < 1) {
          brk = m;
          brkK = q;
        } else if (m.away) {
          b.away = true;
          cruise = true;
        }
      }

      let speed: number;
      let bankMax = P.bank;
      let aMax = P.aMax;
      if (brk) {
        level(b.f, gU, gR, b.u);
        const lift = brk.lift * 0.9;
        A.copy(gR).multiplyScalar(brk.side * Math.cos(lift)).addScaledVector(gU, Math.sin(lift));
        aMax *= 1.3;
        A.multiplyScalar(Math.min(aMax, ((brk.amp * 1.3) / brk.len) * b.s * Math.sin(Math.PI * Math.min(1, brkK * 1.15 + 0.08))));
        bankMax = Math.min(1.5, P.bank + 0.16);
        speed = Math.max(b.s, plan.speed) * 1.12;
        calm = 0;
      } else if (cruise) {
        level(b.f, gU, gR, b.u);
        A.copy(gU).multiplyScalar(-b.f.y * b.s * 0.5);
        speed = Math.max(b.s, plan.speed * 1.1);
      } else if (c.follow === "guide") {
        const L = Math.max(10, b.s * P.tau);
        G.at(b.prog + L, carrot);
        G.tangent(b.prog + L, gT);
        level(gT, gU, gR, b.u);
        if (i > 0) {
          ox += sx;
          oy += sy;
        }
        carrot.addScaledVector(gR, ox).addScaledVector(gU, oy);
        pursue(b, carrot, aMax, A);
        if (i === 0) speed = plan.speed * profileAt(plan.profile, b.prog / G.length) * (1 + 0.04 * wobble(P, 2, t));
        else {
          const want = lead.prog - sz - oz;
          speed = lead.s + clamp((want - b.prog) * 0.9, -0.3 * lead.s, 0.45 * lead.s);
        }
      } else {
        const ls = leaderAt(hist, t - P.lag, lp, lf);
        level(lf, gU, gR, b.u);
        target.copy(lp).addScaledVector(lf, ls * P.lag - sz - oz).addScaledVector(gR, sx + ox).addScaledVector(gU, sy + oy);
        if (b.seen < 2) {
          tv.copy(lf).multiplyScalar(ls);
          ta.set(0, 0, 0);
        } else {
          tv.subVectors(target, b.t1).divideScalar(DT);
          ta.copy(target).addScaledVector(b.t1, -2).add(b.t2).divideScalar(DT * DT);
          if (ta.length() > aMax) ta.setLength(aMax);
        }
        b.t2.copy(b.t1);
        b.t1.copy(target);
        b.seen++;
        const w = P.keen;
        dir.subVectors(target, b.p);
        dv.copy(tv).addScaledVector(b.f, -b.s);
        A.copy(ta).addScaledVector(dir, w * w).addScaledVector(dv, 1.7 * w);
        A.addScaledVector(b.f, -A.dot(b.f));
        if (A.length() > aMax) A.setLength(aMax);
        const tvs = tv.length();
        const along = ta.dot(b.f) + dir.dot(b.f) * 0.5 * w * w + dv.dot(b.f) * 1.4 * w;
        speed = clamp(b.s + clamp(along, -24, 16) / 2.2, Math.max(4, 0.6 * tvs), 1.5 * tvs + 2);
      }

      if (b.rec) {
        busy = true;
        const cosT = level(b.f, yN, rN, b.u);
        right.crossVectors(b.f, b.u);
        back.copy(b.f).negate();
        mat.makeBasis(right, b.u, back);
        quat.setFromRotationMatrix(mat);
        quat.multiply(qa.setFromAxisAngle(X_AXIS, clamp((b.pull - P.G * cosT) * 0.0026, -0.05, 0.13)));
        const bank = Math.atan2(cr.crossVectors(yN, b.u).dot(b.f), yN.dot(b.u));
        const fire = calm && leadFrac > plan.fire[0] && leadFrac < plan.fire[1] && Math.abs(bank) < 0.8 && Math.abs(b.wr) < 1.4 ? 1 : 0;
        tracks[i].push(b.p, quat, b.s, clamp(0.5 + b.thr / 36), fire);
        probe?.(i, t, bank, b.pull, b.wr, b.s);
        const dz = CAM_Z - b.p.z;
        if (dz > 0.5) {
          const h = dz * TAN;
          const nx = b.p.x / (h * sky.aspect);
          const ny = b.p.y / h;
          const rad = 1.8 / h;
          if (Math.abs(nx) - rad / sky.aspect < 1.2 && Math.abs(ny) - rad < 1.2) res.near = Math.min(res.near, Math.hypot(b.p.x, b.p.y, dz));
          const seen = Math.abs(nx) < 1 + rad && Math.abs(ny) < 1 + rad;
          const behind = sky.portrait ? ny - rad < 0.02 : nx - rad / sky.aspect < -0.12 && ny - rad < 0;
          if (seen && behind && dz < 40) res.text += clamp((40 - dz) / 22) / SIM_HZ;
        }
        const done = i === 0 ? b.prog >= G.length * 0.97 : leadFrac >= 0.8 || b.away;
        const off = offscreen(b.p, sky.aspect);
        if (off && done && t > 0.5) b.rec = false;
        else if (k >= MAX_STEPS - 1) {
          b.rec = false;
          if (!off) res.cut = true;
        }
        if (!b.rec) res.duration = Math.max(res.duration, tracks[i].duration);
      }
      step(b, P, A, speed, bankMax, aMax, plan.energy);
    }
    if (!busy) break;
    if (k % CHUNK === CHUNK - 1) yield;
  }
  const nearMin = plan.kind === "poursuite" ? 4.5 : 6.5;
  res.penalty = res.text * 4 + Math.max(0, nearMin - res.near) * 1.2 + (res.cut ? 4 : 0);
}

export function fly(plan: Plan, tracks: Track[], sky: Sky, probe?: Probe) {
  const res = flight();
  const it = flying(plan, tracks, sky, res, probe);
  while (!it.next().done);
  return res;
}

const side = (r: Rand) => (r() < 0.5 ? -1 : 1);

function jinks(r: Rand, c: Crew, count: number, a: number, b: number, amp: number, taken: number[]) {
  for (let k = 0; k < count; k++) {
    for (let tries = 0; tries < 8; tries++) {
      const at = a + r() * (b - a);
      if (taken.some((x) => Math.abs(x - at) < 0.6)) continue;
      taken.push(at);
      c.moves.push(move("jink", at, 0.6 + r() * 0.35, side(r), amp * (0.75 + r() * 0.5), (r() - 0.5) * amp * 0.6));
      break;
    }
  }
}

export function choreograph(kind: Kind, r: Rand, sky: Sky): Plan {
  const portrait = sky.portrait;
  const V = (x: number, y: number, z: number) =>
    new THREE.Vector3(portrait ? x * 0.42 : x, portrait ? y + 2.6 + (z > -25 ? 2.6 : 0) : y + (x < 0 && z > -25 ? 3 : 0), z);
  const S = (x: number, y: number, z: number) => new THREE.Vector3(portrait ? x * 0.5 : x, portrait ? y * 2 : y, z);
  const member = (slot: THREE.Vector3, follow: "guide" | "lead", breathe: [number, number, number]): Crew => ({
    pilot: pilot(r),
    slot,
    follow,
    breathe: portrait ? [breathe[0] * 0.5, breathe[1], breathe[2]] : breathe,
    scatter: new THREE.Vector3(),
    delay: 0,
    moves: [],
  });
  const leader = () => member(S(0, 0, 0), "guide", [1.2, 0.6, 0]);
  const vee = (n: number, spread = 1) => {
    const w = side(r);
    const out = [leader()];
    if (n > 1) out.push(member(S(w * (4.2 + r() * 1.4) * spread, -(0.4 + r() * 0.9), 4 + r() * 2.5), "lead", [1.1, 0.5, 1.4]));
    if (n > 2) out.push(member(S(-w * (4.2 + r() * 1.4) * spread, -(0.5 + r() * 0.9), 5 + r() * 3), "lead", [1.1, 0.5, 1.4]));
    return out;
  };
  const echelon = (n: number, w: number, follow: "guide" | "lead") => {
    const out = [leader()];
    for (let i = 1; i < n; i++) out.push(member(S(w * (4.4 + r() * 0.9) * i, -(0.6 + r() * 0.4) * i, (4.8 + r() * 1.4) * i), follow, [0.9, 0.45, 1.2]));
    return out;
  };
  const plan = (guide: THREE.Vector3[], crew: Crew[], speed: number, o: Partial<Plan> = {}): Plan => ({
    kind,
    guide: new Guide(guide),
    speed,
    profile: [
      [0, 1],
      [1, 1],
    ],
    launch: 1,
    energy: 0.3,
    crew,
    fire: [2, 2],
    portrait,
    ...o,
  });

  switch (kind) {
    case "arrivee": {
      const s = portrait ? side(r) : r() < 0.8 ? 1 : -1;
      const crew = vee(MAX_CREW);
      crew.forEach((c, i) => {
        c.delay = i * (0.1 + r() * 0.08);
        if (i) c.scatter.set((r() - 0.5) * 4, (r() - 0.5) * 2, (r() - 0.5) * 5);
      });
      const w = crew[1 + Math.floor(r() * (crew.length - 1))];
      const x = r();
      if (x < 0.45) w.moves.push(move("cross", 2.6 + r() * 1.4, 1.6 + r() * 0.6, 1, 0));
      else if (x < 0.8) w.moves.push(move("break", 2.4 + r() * 1.6, 0.8 + r() * 0.4, Math.sign(w.slot.x) || 1, 0.35 + r() * 0.25, (r() - 0.4) * 0.6));
      if (r() < 0.3) jinks(r, crew[0], 1, 3, 5, 0.12, []);
      return plan([V(s * -3, 4.5, -95), V(s * -0.5, 3.5, -55), V(s * 5.5, 1.5, -22), V(s * 17, -2, 6)], crew, 16 + r() * 3, {
        profile: [
          [0, 1],
          [0.55, 0.95],
          [1, 1.15],
        ],
        launch: 3.4,
        fire: [0.2, 0.85],
      });
    }
    case "attaque": {
      const s = side(r);
      const brk = portrait ? s : r() < 0.85 ? 1 : -1;
      const speed = 46 + r() * 8;
      const guide = [V(s * (2 + r() * 6), 1 + r() * 4, -175), V(s * r() * 3, 0.5 + r() * 2.5, -70), V(brk * (0.6 + r() * 1.4), r() * 1.5, -14), V(brk * (10 + r() * 3), -2 + r() * 5, 14)];
      const crew = [leader()];
      crew[0].pilot.tau = 0.5 + r() * 0.12;
      if (r() < 0.45) {
        const w = member(S(brk * (4.6 + r()), -(0.4 + r() * 0.8), 5 + r() * 3), "lead", [1, 0.5, 1.2]);
        w.pilot.keen = 1.6 + r() * 0.5;
        w.pilot.lag = 0.25 + r() * 0.15;
        crew.push(w);
      }
      const dur = new Guide(guide).length / speed;
      const taken: number[] = [];
      jinks(r, crew[0], r() < 0.5 ? 2 : 1, 0.4, dur * 0.5, 0.12, taken);
      if (crew[1]) {
        jinks(r, crew[1], r() < 0.6 ? 1 : 0, 0.5, dur * 0.55, 0.11, taken);
        crew[1].moves.push(move("break", dur * (0.64 + r() * 0.1), 0.85 + r() * 0.3, brk, 1 + r() * 0.3, 0.35 + r() * 0.35, { away: true }));
      }
      return plan(guide, crew, speed, {
        profile: [
          [0, 1],
          [0.62, 0.94],
          [0.82, 1.12],
          [1, 1.22],
        ],
        energy: 0.25,
        fire: [0.12, 0.7],
      });
    }
    case "poursuite": {
      const s = portrait ? side(r) : r() < 0.8 ? 1 : -1;
      const crew = echelon(r() < 0.6 ? 2 : 3, s, "lead");
      if (r() < 0.45) crew[1 + Math.floor(r() * (crew.length - 1))].moves.push(move("cross", 1.5 + r() * 0.9, 1.4 + r() * 0.5, 1, 0));
      if (r() < 0.3) crew[crew.length - 1].moves.push(move("break", 2.6 + r() * 0.8, 0.9 + r() * 0.3, side(r), 0.7 + r() * 0.3, 0.4 + r() * 0.4, { away: true }));
      if (r() < 0.4) jinks(r, crew[0], 1, 1.2, 2.5, 0.1, []);
      return plan([V(s * (4.5 + r() * 2.5), -3.5 + r() * 2, 18), V(s * (2 + r() * 3), -1.2 + r() * 2, -14), V(-s * (r() * 6), 1.5 + r() * 3, -70), V(-s * (2 + r() * 10), 3 + r() * 6, -210)], crew, 42 + r() * 8, {
        profile: [
          [0, 1.12],
          [0.25, 1],
          [1, 1.06],
        ],
        fire: [0.16, 0.75],
      });
    }
    case "traversee": {
      const s = side(r);
      let crew: Crew[];
      if (r() < 0.45) {
        const amp = (portrait ? 1.3 : 3) * (0.9 + r() * 0.25);
        const period = 2.2 + r() * 0.7;
        const phase = r() * Math.PI * 2;
        const at = 0.5 + r() * 0.5;
        const len = 3.6 + r() * 1;
        crew = [member(S(0, 0, 0), "guide", [0.5, 0.3, 0]), member(S(0, 0, 2.2 + r()), "guide", [0.5, 0.3, 0])];
        crew.forEach((c) => (c.pilot.tau = 0.45 + r() * 0.1));
        crew[0].moves.push(move("weave", at, len, 1, amp, 0.8, { period, phase }));
        crew[1].moves.push(move("weave", at, len, 1, -amp * (0.9 + r() * 0.2), -0.8, { period, phase }));
      } else {
        crew = vee(2);
        const x = r();
        if (x < 0.4) crew[1].moves.push(move("cross", 1.6 + r() * 1.6, 1.5 + r() * 0.5, 1, 0));
        else if (x < 0.75) crew[1].moves.push(move("break", 1.6 + r() * 1.8, 0.8 + r() * 0.4, Math.sign(crew[1].slot.x) || 1, 0.3 + r() * 0.25, (r() - 0.4) * 0.6));
      }
      return plan([V(s * -46, 2 + r() * 4, -52), V(s * -16, 4 + r() * 3, -28), V(s * 14, r() * 3, -34), V(s * 50, 2 + r() * 5, -66)], crew, 18 + r() * 4, {
        profile: [
          [0, 1],
          [0.5, 0.92],
          [1, 1.1],
        ],
        energy: 0.35,
        fire: [0.25, 0.7],
      });
    }
    case "chandelle": {
      const s = side(r);
      const crew = [leader()];
      if (r() < 0.5) {
        const w = member(S(-s * (3.5 + r()), -(1 + r()), 6 + r() * 3), "lead", [1, 0.6, 1.5]);
        w.pilot.lag = 0.5 + r() * 0.25;
        crew.push(w);
      }
      return plan([V(s * -42, -1 + r() * 2, -46), V(s * 14, r() * 2, -40), V(s * 22, 16 + r() * 4, -78), V(s * -18, 7 + r() * 3, -96)], crew, 24 + r() * 4, {
        profile: [
          [0, 1.05],
          [0.35, 0.95],
          [0.6, 0.8],
          [1, 1.1],
        ],
        energy: 0.55,
        fire: [0.08, 0.3],
      });
    }
    case "eventail": {
      const s = portrait ? side(r) : r() < 0.75 ? 1 : -1;
      const y0 = 9 + r() * 3;
      const first = [V(s * -58, y0, -68), V(s * -40, y0 + 0.5, -66), V(s * -24, y0, -64), V(s * -10, y0 - 0.5, -62)];
      const guide = [...first, V(s * 2, y0 - 1, -61), V(s * 12, 3, -40), V(s * 14, -2, -10)];
      const corner = new Guide(first).length / new Guide(guide).length;
      const crew = echelon(MAX_CREW, -s, "guide");
      const fan = r() < 0.5 ? [1, 2] : [2, 1];
      crew.forEach((c, i) => {
        if (!i) return;
        const steep = fan[i - 1] === 2;
        const amp = steep ? 1.05 + r() * 0.25 : 0.75 + r() * 0.2;
        const lift = steep ? -(0.45 + r() * 0.25) : -(0.05 + r() * 0.2);
        c.moves.push(move("break", 0, 1 + r() * 0.5, s, amp, lift, { atProg: corner + 0.06 * i + r() * 0.04, away: true }));
      });
      return plan(guide, crew, 24 + r() * 4, {
        profile: [
          [0, 1],
          [0.5, 0.95],
          [0.7, 1.12],
          [1, 1.25],
        ],
        energy: 0.4,
        fire: [0.1, 0.45],
      });
    }
    default: {
      const s = side(r);
      const crew = vee(MAX_CREW, 1.4);
      crew.forEach((c, i) => {
        c.pilot.tau = 1 + r() * 0.3;
        c.pilot.keen = 0.9 + r() * 0.4;
        c.pilot.lag = 0.4 + r() * 0.3;
        if (i) c.breathe = sky.reduced ? [0.8, 0.4, 1.2] : [2, 1, 3];
      });
      if (!sky.reduced && r() < 0.4) crew[1].moves.push(move("break", 4 + r() * 5, 1.2, Math.sign(crew[1].slot.x) || 1, 0.3, 0));
      return plan([V(s * -120, 9 + r() * 6, -170), V(s * -40, 12 + r() * 4, -150), V(s * 40, 10 + r() * 4, -150), V(s * 125, 8 + r() * 6, -175)], crew, 16 + r() * 3);
    }
  }
}

export function* preparing(kind: Kind, r: Rand, sky: Sky, tracks: Track[]): Generator<void, Plan, void> {
  let best: Plan | null = null;
  let score = Infinity;
  let last: Plan | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const plan = choreograph(kind, r, sky);
    last = plan;
    const res = flight();
    yield* flying(plan, tracks, sky, res);
    if (res.penalty < score) {
      score = res.penalty;
      best = plan;
    }
    if (res.penalty < 0.25) break;
  }
  if (best && best !== last) yield* flying(best, tracks, sky, flight());
  return best ?? last!;
}

export function prepare(kind: Kind, r: Rand, sky: Sky, tracks: Track[]) {
  const it = preparing(kind, r, sky, tracks);
  let x = it.next();
  while (!x.done) x = it.next();
  return x.value;
}
