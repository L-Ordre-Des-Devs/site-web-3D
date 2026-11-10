import * as THREE from "three";
import { METALS, THICK, TokenKit, type SealData, type TokenInstance } from "./token";
import { Fleet } from "./fleet";
import { Nebula } from "./nebula";
import { Plan3D, type PlanFrame } from "./plan";
import { Space } from "./space";
import { Walkers } from "./walkers";

const FOV = 30;
const CAM_Z = 10;
const FLOAT_Z = 2.4;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
const TAU = Math.PI * 2;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const damp = (a: number, b: number, lambda: number, dt: number) => lerp(a, b, 1 - Math.exp(-lambda * dt));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

export interface Pose {
  x: number;
  y: number;
  size: number;
  mx: number;
  my: number;
  msize: number;
  rx: number;
  ry: number;
  rz: number;
  spin: number;
  sway: number;
  explode: number;
  podium: number;
  stackable: number;
  tilt: number;
  wobble: number;
}
const BASE_POSE: Pose = {
  x: 0, y: 0, size: 0.42, mx: 0, my: 0, msize: 0.6,
  rx: 0, ry: 0, rz: 0, spin: 0, sway: 0, explode: 0, podium: 0, stackable: 0, tilt: 0.12, wobble: 1,
};
export const POSES: Record<string, Partial<Pose>> = {
  hero: { x: 0.0, y: -0.12, size: 0.42, mx: 0, my: -0.02, msize: 0.72, rx: -0.12, ry: 0.38, rz: 0.04, sway: 0.28, tilt: 0.14 },
  intro: { x: 0.02, size: 0.58, my: 0.04, msize: 0.86, rx: -0.32, ry: 0.25, sway: 0.55 },
  humans: { y: -0.12, size: 0.36, my: -0.04, msize: 0.62, rx: 0.08, tilt: 0.4 },
  entraide: { x: 0.37, size: 0.48, my: 0.46, msize: 0.5, rx: -0.32, ry: -0.5 },
  cyber: { x: 0.37, y: 0.02, size: 0.4, my: 0.46, msize: 0.42, rx: -1.0, ry: 0.72, rz: 0.25, explode: 1, tilt: 0.06 },
  events: { x: 0.42, y: 0.1, size: 0.36, my: 0.5, msize: 0.36, rx: -0.1, ry: -0.16, podium: 1, tilt: 0.08 },
  wordmark: { size: 0.3, msize: 0.3, wobble: 0, tilt: 0.05 },
  cipher: { x: -0.45, y: -0.3, size: 0.36, my: -1.6, msize: 0.4, rx: -1.1, tilt: 0.04, wobble: 0.4 },
  macro: { y: -1.55, size: 2.5, my: -0.27, msize: 1.75, rx: -0.62, tilt: 0.03, wobble: 0.2 },
  awayDown: { y: -1.9, my: -1.9 },
  cover: { rx: 0.12, ry: -0.3, sway: 0.35 },
  gallery: { rx: -0.1, ry: 0.2, wobble: 0.3 },
  awayRight: { x: 1.9, size: 0.36, mx: 1.9 },
  choiceHero: { size: 0.58, msize: 0.9, wobble: 0.6 },
  choice: { x: 0.62, y: 0.02, size: 0.34, my: 1.9, msize: 0.3, rx: -0.3, ry: -0.35, rz: 0.08, sway: 0.2, tilt: 0.16, stackable: 1 },
  awayUp: { y: 1.9, size: 0.36, my: 1.9 },
  end: { x: 0, y: 0.02, size: 0.3, mx: 0, my: 0, msize: 0.44, rx: 0, ry: 0, sway: 0.4, tilt: 0.06 },
};

interface LookDef {
  base: string;
  glow: string;
  glowP: number[];
  glow2: string;
  glow2P: number[];
  iris: number;
  gobo: number;
  grain: number;
  nebula: number;
  deep: number;
  stars: number;
  planet: number;
  warp: number;
  key: number;
  sun: number;
  rim: number;
  env: number;
  fleet: number;
  plan: number;
  walkers: number;
}
const BASE_LOOK: LookDef = {
  base: "#160f0a", glow: "#b8430c", glowP: [0, 0, 0.6, 0], glow2: "#4a230e", glow2P: [0.5, 1, 0.5, 0],
  iris: 0, gobo: 0, grain: 0.03, nebula: 0, deep: 0, stars: 0.28, planet: 0, warp: 0, key: 2.2, sun: 1.6, rim: 0.9, env: 0.9, fleet: 0, plan: 0, walkers: 0,
};
export const LOOKS: Record<string, Partial<LookDef>> = {
  space: { base: "#07050a", glow: "#7a2a08", glowP: [0.95, 0.05, 0.55, 0.35], glow2: "#14183a", glow2P: [0.1, 0.95, 0.7, 0.35], nebula: 1, stars: 1, planet: 1, grain: 0.035, key: 2.0, sun: 3.2, rim: 1.2, env: 1 },
  dark: { glowP: [0.02, 0.0, 0.62, 0.55], glow2P: [0.55, 1.05, 0.55, 0.32] },
  iris: { base: "#1b120c", glowP: [0, 0, 0.55, 0.3], glow2: "#3a2a20", glow2P: [0.5, 0.45, 0.6, 0.15], iris: 1, stars: 0.15 },
  poles: { base: "#140e09", glow: "#a63c0a", glowP: [0, 0.05, 0.6, 0.5], glow2: "#33401f", glow2P: [0.92, 0.95, 0.6, 0.3] },
  sand: { base: "#f6e0c6", glow: "#fff4e6", glowP: [0.75, 0.85, 0.7, 0.5], glow2: "#e7c29a", glow2P: [0.08, 0.1, 0.6, 0.35], gobo: 1, grain: 0.018, stars: 0, key: 2.6, sun: 1.0, rim: 0.3, env: 1.1 },
  macro: { base: "#0a0705", glow: "#c2500f", glowP: [0.5, 1.1, 0.7, 0.45], glow2P: [0.5, 0, 0.6, 0], stars: 0.2, key: 1.9, sun: 1.8, env: 0.82 },
  cream: { base: "#ffedd7", glow: "#ffffff", glowP: [0.8, 0.9, 0.6, 0.3], glow2: "#f3d4b0", glow2P: [0.1, 0.0, 0.6, 0.3], gobo: 0.85, grain: 0.016, stars: 0, key: 2.6, sun: 1.0, rim: 0.3, env: 1.1 },
  black: { base: "#0f0904", glow: "#6a2c0c", glowP: [0.5, 1.08, 0.5, 0.5], glow2P: [0.5, 0, 0.5, 0], stars: 0.2 },
  plan: { base: "#04070d", glow: "#16304f", glowP: [0.18, 0.0, 0.75, 0.42], glow2: "#3a1606", glow2P: [0.85, 1.05, 0.6, 0.3], nebula: 0.12, stars: 0.18, grain: 0.03, plan: 1 },
  warp: { base: "#05040a", glow: "#2a1408", glowP: [0.5, 0.5, 0.6, 0.3], glow2: "#101a3a", glow2P: [0.5, 0.5, 0.35, 0.35], stars: 0.5, warp: 1 },
  end: { base: "#05040a", glow: "#3a1a08", glowP: [0.5, -0.05, 0.75, 0.45], glow2: "#101a3a", glow2P: [0.5, 0.5, 0.45, 0.4], stars: 0.6, warp: 1 },
  walkers: { base: "#a9bccd", glow: "#c9dae8", glowP: [0.5, 0.2, 0.7, 0.3], glow2: "#2a5d9e", glow2P: [0.5, 1.0, 0.7, 0.3], stars: 0, grain: 0.02, key: 0, sun: 0, rim: 0, env: 0.5, walkers: 1 },
  fleet: { base: "#04070d", glow: "#173356", glowP: [0.0, 1.0, 0.55, 0.38], glow2: "#14254d", glow2P: [0.75, 0.0, 0.85, 0.42], nebula: 0, deep: 1, stars: 1, grain: 0.03, key: 1.2, sun: 0.0, rim: 1.6, env: 0.4, fleet: 1 },
};

interface Look {
  base: number[];
  glow: number[];
  glowP: number[];
  glow2: number[];
  glow2P: number[];
  iris: number;
  gobo: number;
  grain: number;
  nebula: number;
  deep: number;
  stars: number;
  planet: number;
  warp: number;
  key: number;
  sun: number;
  rim: number;
  env: number;
  fleet: number;
  plan: number;
  walkers: number;
}
type Values = Record<string, number | number[]>;

const hexRGB = (hex: string) => {
  const c = new THREE.Color(hex);
  c.convertLinearToSRGB();
  return [c.r, c.g, c.b];
};
function lookValues(name: string): Look {
  const l = { ...BASE_LOOK, ...LOOKS[name] };
  return { ...l, base: hexRGB(l.base), glow: hexRGB(l.glow), glowP: [...l.glowP], glow2: hexRGB(l.glow2), glow2P: [...l.glow2P] };
}
const poseValues = (name: string, override?: Partial<Pose>): Pose => ({ ...BASE_POSE, ...POSES[name], ...override });

function assign<T extends object>(out: T, a: T): T {
  const o = out as Values;
  for (const [k, v] of Object.entries(a as Values)) o[k] = Array.isArray(v) ? v.slice() : v;
  return out;
}
function mix<T extends object>(out: T, a: T, b: T, t: number): T {
  const o = out as Values;
  const bb = b as Values;
  for (const [k, v] of Object.entries(a as Values)) {
    if (Array.isArray(v)) {
      const arr = (Array.isArray(o[k]) ? o[k] : (o[k] = [])) as number[];
      const w = bb[k] as number[];
      for (let i = 0; i < v.length; i++) arr[i] = lerp(v[i], w[i], t);
    } else o[k] = lerp(v, bb[k] as number, t);
  }
  return out;
}
function approach<T extends object>(cur: T, target: T, lambda: number, dt: number) {
  const c = cur as Values;
  for (const [k, v] of Object.entries(target as Values)) {
    if (Array.isArray(v)) {
      const arr = c[k] as number[];
      for (let i = 0; i < v.length; i++) arr[i] = damp(arr[i], v[i], lambda, dt);
    } else c[k] = damp(c[k] as number, v, lambda, dt);
  }
}

export interface Key {
  name: string;
  start: number;
  end: number;
  override?: Partial<Pose>;
}
interface Step<T> {
  start: number;
  end: number;
  value: T;
}

class Timeline<T extends object> {
  private keys: Step<T>[] = [];
  set(keys: Step<T>[]) {
    this.keys = keys.slice().sort((a, b) => a.start - b.start);
  }
  at(y: number, out: T): T {
    const k = this.keys;
    if (!k.length) return out;
    if (y <= k[0].start) return assign(out, k[0].value);
    for (let i = 0; i < k.length; i++) {
      const a = k[i];
      if (y <= a.end) return assign(out, a.value);
      const b = k[i + 1];
      if (!b) return assign(out, a.value);
      if (y < b.start) return mix(out, a.value, b.value, easeInOut((y - a.end) / Math.max(1, b.start - a.end)));
    }
    return out;
  }
  transition(y: number, i: number) {
    const a = this.keys[i];
    const b = this.keys[i + 1];
    if (!a || !b) return 0;
    return easeInOut(Math.min(1, Math.max(0, (y - a.end) / Math.max(1, b.start - a.end))));
  }
}

function makeEnvironment(renderer: THREE.WebGLRenderer) {
  return bakeEnvironment(renderer, [[0.16, 0.15, 0.17], [0.06, 0.045, 0.04], [0.22, 0.09, 0.03]], [
    [11, 7, "#fff1e2", 3.8, [-7, 7, 9]],
    [5, 2.2, "#ffb067", 9, [9, -2.5, -5]],
    [3, 1.2, "#ffd29a", 7, [11, -1, -2]],
    [18, 0.8, "#6fb4ff", 3.2, [0, 8, -6]],
    [16, 2, "#ff7a2e", 2.6, [-3, -8, 2]],
    [3, 3, "#ffe9d6", 1.4, [3, 1, 9]],
  ]);
}

function makeSpaceEnvironment(renderer: THREE.WebGLRenderer) {
  return bakeEnvironment(renderer, [[0.035, 0.045, 0.07], [0.012, 0.016, 0.028], [0.02, 0.028, 0.05]], [
    [11, 7, "#e9f0ff", 3.0, [-7, 7, 9]],
    [4, 9, "#dfe7f5", 4.0, [-12, -1.8, 0.8]],
    [18, 0.8, "#6fb4ff", 3.2, [0, 8, -6]],
    [10, 2, "#7f9ed8", 1.6, [5.4, -8.2, 6.9]],
    [2, 2, "#ffffff", 6, [8, 3, -8]],
  ]);
}

function makeMistEnvironment(renderer: THREE.WebGLRenderer) {
  return bakeEnvironment(renderer, [[0.2, 0.33, 0.55], [0.4, 0.47, 0.55], [0.045, 0.05, 0.058]], [
    [6, 2.2, "#fff0dc", 8, [1, 1.5, -14]],
    [30, 6, "#bcd3ea", 1.5, [0, 2, -12]],
    [30, 6, "#9fb7d2", 0.8, [0, 2, 12]],
    [26, 26, "#6e9bd2", 0.9, [0, 14, 0]],
  ]);
}

type EnvPanel = [w: number, h: number, color: string, k: number, pos: [number, number, number]];

function bakeEnvironment(renderer: THREE.WebGLRenderer, sky: [number, number, number][], panels: EnvPanel[]) {
  const env = new THREE.Scene();
  const sphere = new THREE.SphereGeometry(30, 48, 24);
  const [top, mid, low] = sky.map((c) => new THREE.Vector3(...c));
  env.add(
    new THREE.Mesh(
      sphere,
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: { uTop: { value: top }, uMid: { value: mid }, uLow: { value: low } },
        vertexShader: `
          varying vec3 vD;
          void main() { vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: `
          uniform vec3 uTop;
          uniform vec3 uMid;
          uniform vec3 uLow;
          varying vec3 vD;
          void main() {
            float up = vD.y;
            vec3 c = up > 0.0 ? mix(uMid, uTop, pow(up, 0.8)) : mix(uMid, uLow, pow(-up, 0.7));
            gl_FragColor = vec4(c, 1.0);
          }
        `,
      }),
    ),
  );
  const box = new THREE.BoxGeometry(1, 1, 1);
  for (const [w, h, color, k, pos] of panels) {
    const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k) }));
    m.scale.set(w, h, 0.1);
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    env.add(m);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.03).texture;
  pmrem.dispose();
  box.dispose();
  sphere.dispose();
  env.traverse((o) => ((o as THREE.Mesh).material as THREE.Material | undefined)?.dispose());
  return tex;
}

const BACKDROP_FRAG = `
  uniform vec3 uBase;
  uniform vec3 uGlow;
  uniform vec4 uGlowP;
  uniform vec3 uGlow2;
  uniform vec4 uGlow2P;
  uniform float uIris;
  uniform float uGobo;
  uniform float uGrain;
  uniform float uNebula;
  uniform float uDeep;
  uniform sampler2D uNebTex;
  uniform vec4 uNebMap;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uRes;
  uniform sampler2D uLeaves;
  varying vec2 vUv;
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  float vn(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float a = 0.5;
    float s = 0.0;
    for (int i = 0; i < 5; i++) {
      s += a * vn(p);
      p = p * 2.02 + 7.3;
      a *= 0.5;
    }
    return s;
  }
  void main() {
    vec2 asp = vec2(uRes.x / uRes.y, 1.0);
    vec3 col = uBase;
    float d1 = length((vUv - uGlowP.xy) * asp);
    col += uGlow * uGlowP.w * exp(-(d1 * d1) / (uGlowP.z * uGlowP.z));
    float d2 = length((vUv - uGlow2P.xy) * asp);
    col += uGlow2 * uGlow2P.w * exp(-(d2 * d2) / (uGlow2P.z * uGlow2P.z));
    if (uNebula > 0.001) {
      vec2 q = (vUv + vec2(0.0, uScroll * 0.15)) * asp * 1.6;
      vec2 w = vec2(fbm(q + uTime * 0.006), fbm(q + 5.2 - uTime * 0.004));
      float n = fbm(q + w * 1.8);
      float lanes = smoothstep(0.42, 0.85, n);
      float place = smoothstep(1.25, 0.15, length((vUv - vec2(0.82, 0.88)) * asp)) + smoothstep(1.0, 0.0, length((vUv - vec2(0.05, 0.2)) * asp)) * 0.35;
      vec3 neb = mix(vec3(0.32, 0.09, 0.03), vec3(0.95, 0.55, 0.3), smoothstep(0.55, 0.95, n));
      neb = mix(neb, vec3(0.12, 0.16, 0.38), smoothstep(0.5, 0.2, n) * 0.6);
      col += neb * lanes * place * uNebula * 0.32;
    }
    if (uDeep > 0.001) {
      vec2 s = (vUv - 0.5) * 2.0 * asp;
      col += texture2D(uNebTex, (s * uNebMap.xy + uNebMap.zw) * 0.5 + 0.5).rgb * uDeep;
    }
    if (uIris > 0.001) {
      vec2 q = (vUv - 0.5) * asp;
      vec2 hs = 0.5 * asp;
      float r = 0.07;
      vec2 dq = abs(q) - (hs - r);
      float sd = length(max(dq, 0.0)) + min(max(dq.x, dq.y), 0.0) - r;
      float glow = exp(sd * 10.0) * 0.8 + exp(sd * 34.0) * 0.7;
      float ang = atan(q.y, q.x) / 6.2831853 + uTime * 0.04;
      vec3 hue = 0.55 + 0.45 * cos(6.2831853 * (ang + vec3(0.0, 0.33, 0.67)));
      col += hue * glow * uIris;
    }
    if (uGobo > 0.001) {
      vec2 box = vec2(max(uRes.x * 0.68, uRes.y * 0.62), uRes.y);
      box.y = min(box.y, box.x / 0.9);
      vec2 lu = 1.0 - (1.0 - vUv) * uRes / box + vec2(sin(uTime * 0.21) * 0.006, cos(uTime * 0.17) * 0.004);
      float leaf = texture2D(uLeaves, clamp(lu, 0.0, 1.0)).r;
      col *= mix(1.0, leaf, uGobo * 0.75);
    }
    vec2 vq = (vUv - 0.5) * asp;
    col *= 1.0 - dot(vq, vq) * 0.18;
    col += (hash(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * uGrain;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function leavesTexture() {
  const size = 1024;
  const draw = document.createElement("canvas");
  draw.width = draw.height = size;
  const g = draw.getContext("2d")!;
  g.fillStyle = "#fff";
  g.fillRect(0, 0, size, size);
  g.fillStyle = "rgb(150, 138, 130)";
  g.strokeStyle = "rgb(150, 138, 130)";
  let seed = 11;
  const rnd = (lo: number, hi: number) => lo + ((seed = (seed * 16807) % 2147483647) / 2147483647) * (hi - lo);
  const leaf = (len: number, wid: number) => {
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(len * 0.45, -wid, len, 0);
    g.quadraticCurveTo(len * 0.45, wid, 0, 0);
    g.fill();
  };
  for (let b = 0; b < 5; b++) {
    let x = size * rnd(0.72, 1.05);
    let y = size * rnd(-0.08, 0.22);
    let a = rnd(2.25, 3.35);
    g.lineWidth = size * 0.006;
    for (let k = 0; k < 30; k++) {
      const nx = x + Math.cos(a) * size * 0.022;
      const ny = y + Math.sin(a) * size * 0.022;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(nx, ny);
      g.stroke();
      x = nx;
      y = ny;
      a += rnd(-0.18, 0.18);
      const side = k % 2 ? 1 : -1;
      g.save();
      g.translate(x, y);
      g.rotate(a + side * rnd(0.5, 1.0));
      leaf(size * rnd(0.05, 0.085), size * rnd(0.012, 0.02));
      g.restore();
    }
  }
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const gc = c.getContext("2d")!;
  gc.filter = "blur(7px)";
  gc.drawImage(draw, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  return t;
}

export interface SnapshotOptions {
  width: number;
  height: number;
  bg: string;
  rx?: number;
  ry?: number;
  rz?: number;
  metal?: keyof typeof METALS;
  accent?: string;
  lift?: number;
  studio?: boolean;
}

export class Stage {
  renderer: THREE.WebGLRenderer;
  maxDpr: number;
  dpr: number;
  hover = 0;
  width = 1;
  height = 1;
  private quality: number;
  private reduced: boolean;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 420);
  private backdrop: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private key = new THREE.DirectionalLight(0xfff1e2, 2.2);
  private sun = new THREE.DirectionalLight(0xff9a52, 1.6);
  private rim = new THREE.DirectionalLight(0x8cc4ff, 0.9);
  private fleetRake = new THREE.DirectionalLight(0xdfe7f5, 0);
  private fleetFill = new THREE.DirectionalLight(0x7f9ed8, 0);
  private holder = new THREE.Group();
  private flipper = new THREE.Group();
  private spinner = new THREE.Group();
  private podium: { holder: THREE.Group; token: TokenInstance; offset: THREE.Vector3; turn: number }[] = [];
  private kit?: TokenKit;
  private token?: TokenInstance;
  private twin?: TokenInstance;
  private warm: TokenInstance[] = [];
  private space?: Space;
  private fleet?: Fleet;
  private fleetProgress = 0;
  private nebula?: Nebula;
  private nebulaState: "idle" | "baking" | "ready" = "idle";
  private nebulaFade = 0;
  private disposed = false;
  private plan?: Plan3D;
  private planProgress = 0;
  private planFrame: PlanFrame = { x: 0, y: 0, w: 0, h: 0 };
  private walkers?: Walkers;
  private walkersProgress = 0;
  private leaves?: THREE.Texture;
  private pose = poseValues("hero");
  private poseTarget = poseValues("hero");
  private look = lookValues("space");
  private lookTarget = lookValues("space");
  private poses = new Timeline<Pose>();
  private looks = new Timeline<Look>();
  private pointer = new THREE.Vector2();
  private pointerS = new THREE.Vector2();
  private focus = new THREE.Vector2();
  private flip = { angle: 0, velocity: 0, target: 0 };
  private idle = { y: 0 };
  private turn = { x: 0, y: 0 };
  private stack = { value: 0, target: 0 };
  private wheel = { angle: 0, target: 0 };
  private podiumIn = 0;
  private intro = 1;
  private readonly baseAccent = new THREE.Color("#dc5000");
  private accent = new THREE.Color("#dc5000");
  private accentNow = new THREE.Color("#dc5000");
  private twinAccent = new THREE.Color("#7fb069");
  private metal: keyof typeof METALS = "gold";
  private aspect = 1;
  private worldPerPx = 1;
  private v = new THREE.Vector3();
  private q = new THREE.Quaternion();
  private e = new THREE.Euler();

  constructor(canvas: HTMLCanvasElement, { quality = 1, reduced = false } = {}) {
    this.quality = quality;
    this.reduced = reduced;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", stencil: false });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer = renderer;
    this.maxDpr = Math.min(window.devicePixelRatio || 1, quality >= 1 ? 1.75 : 1.5);
    this.dpr = this.maxDpr;

    this.camera.position.set(0, 0, CAM_Z);
    this.camera.updateMatrixWorld();
    this.scene.fog = new THREE.Fog(0x0e1628, 80, 420);

    this.backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }",
        fragmentShader: BACKDROP_FRAG,
        uniforms: {
          uBase: { value: new THREE.Vector3() },
          uGlow: { value: new THREE.Vector3() },
          uGlowP: { value: new THREE.Vector4() },
          uGlow2: { value: new THREE.Vector3() },
          uGlow2P: { value: new THREE.Vector4() },
          uIris: { value: 0 },
          uGobo: { value: 0 },
          uGrain: { value: 0.03 },
          uNebula: { value: 0 },
          uDeep: { value: 0 },
          uNebTex: { value: null },
          uNebMap: { value: new THREE.Vector4(1, 1, 0, 0) },
          uTime: { value: 0 },
          uScroll: { value: 0 },
          uRes: { value: new THREE.Vector2(1, 1) },
          uLeaves: { value: null },
        },
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.backdrop.frustumCulled = false;
    this.backdrop.renderOrder = -1000;
    this.scene.add(this.backdrop);

    this.key.position.set(-4.5, 5.5, 9);
    this.sun.position.set(8, -2, -4);
    this.rim.position.set(-2, 6, -6);
    this.fleetRake.position.set(-60, -9, 4);
    this.fleetFill.position.set(16, -24, 20);
    this.scene.add(this.key, this.sun, this.rim, this.fleetRake, this.fleetFill);

    this.holder.add(this.flipper);
    this.flipper.add(this.spinner);
    this.scene.add(this.holder);
  }

  async init(data: SealData, progress: (p: number) => void = () => {}, photos: Partial<SnapshotOptions>[] = []) {
    const r = this.renderer;
    const frame = () => new Promise<void>((res) => requestAnimationFrame(() => res()));
    this.scene.environment = makeEnvironment(r);
    progress(0.15);
    await frame();
    this.kit = new TokenKit(data, { quality: this.quality });
    this.token = this.kit.build("gold", "#dc5000");
    this.twin = this.kit.build("silver", "#7fb069");
    this.spinner.add(this.token.group, this.twin.group);
    (
      [
        ["silver", "#6fb4ff", new THREE.Vector3(-1.3, -0.62, -0.7), 0.3],
        ["bronze", "#ffedd7", new THREE.Vector3(1.3, -0.72, -0.85), -0.34],
      ] as const
    ).forEach(([metal, accent, offset, turn]) => {
      const holder = new THREE.Group();
      const token = this.kit!.build(metal, accent);
      holder.add(token.group);
      holder.visible = false;
      this.scene.add(holder);
      this.podium.push({ holder, token, offset: offset.clone(), turn });
    });
    progress(0.5);
    await frame();
    this.nebula = new Nebula({ quality: this.quality });
    this.backdrop.material.uniforms.uNebTex.value = this.nebula.texture;
    this.backdrop.material.uniforms.uNebMap.value = this.nebula.map;
    this.space = new Space({ quality: this.quality });
    this.scene.add(this.space.group, this.space.stars, this.space.dust, this.space.warp, this.space.flare);
    this.fleet = new Fleet();
    this.fleet.setEnvironment(makeSpaceEnvironment(r));
    this.scene.add(this.fleet.group);
    this.plan = new Plan3D();
    this.scene.add(this.plan.group);
    this.walkers = new Walkers({ quality: this.quality });
    this.walkers.setEnvironment(makeMistEnvironment(r));
    this.scene.add(this.walkers.group);
    this.leaves = leavesTexture();
    this.backdrop.material.uniforms.uLeaves.value = this.leaves;
    progress(0.7);
    await frame();
    this.resize(this.width, this.height);
    const hidden = [this.twin.group, this.space.warp, this.space.flare, ...this.podium.map((p) => p.holder)];
    hidden.forEach((o) => (o.visible = true));
    this.fleet.showAll(true);
    this.plan.showAll(true);
    this.walkers.showAll(true);
    const lightings = [...new Set(photos.map((p) => !!p.studio))];
    const warmups = lightings.map((studio) => this.photoScene({ width: 1, height: 1, bg: "#000000", studio }));
    this.warm = warmups.map((w) => w.token);
    await Promise.all([r.compileAsync(this.scene, this.camera), this.walkers.compile(r, this.camera), ...warmups.map((w) => r.compileAsync(w.scene, w.cam))]);
    hidden.forEach((o) => (o.visible = false));
    this.fleet.showAll(false);
    this.plan.showAll(false);
    this.walkers.showAll(false);
    progress(1);
  }

  setKeys(poseKeys: Key[], lookKeys: Key[]) {
    this.poses.set(poseKeys.map((k) => ({ start: k.start, end: k.end, value: poseValues(k.name, k.override) })));
    this.looks.set(lookKeys.map((k) => ({ start: k.start, end: k.end, value: lookValues(k.name) })));
  }

  frame(z: number) {
    const h = 2 * (CAM_Z - z) * TAN;
    return { w: h * this.aspect, h };
  }

  poseFromRect(rect: { x: number; y: number; width: number; height: number }): Partial<Pose> {
    const x = ((rect.x + rect.width / 2) / this.width) * 2 - 1;
    const y = -(((rect.y + rect.height / 2) / this.height) * 2 - 1);
    return { x, y, size: rect.height / this.height, mx: x, my: y, msize: rect.height / this.width };
  }

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.aspect = w / h;
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = this.aspect;
    this.camera.updateProjectionMatrix();
    this.worldPerPx = this.frame(0).h / h;
    this.space?.layout((z) => this.frame(z));
    this.backdrop.material.uniforms.uRes.value.set(w, h);
  }

  setDpr(dpr: number) {
    if (Math.abs(dpr - this.dpr) < 0.01) return;
    this.dpr = dpr;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.width, this.height, false);
  }

  setFleet(p: number) {
    this.fleetProgress = p;
  }

  setWalkers(p: number) {
    this.walkersProgress = p;
  }

  setPlan(p: number, frame: PlanFrame) {
    this.planProgress = p;
    this.planFrame = frame;
  }

  planAnchors() {
    return this.plan?.anchors ?? null;
  }

  setIntro(v: number) {
    this.intro = v;
  }

  setPointer(nx: number, ny: number) {
    this.pointer.set(nx, ny);
  }

  flipOver() {
    this.flip.target += Math.PI;
    return Math.round(this.flip.target / Math.PI) % 2 === 1;
  }

  turnWheel(dir: number) {
    const w = this.wheel;
    const k = Math.round(w.target / TAU) * TAU;
    w.target -= k + dir * TAU;
    w.angle -= k;
  }

  setStyle(metal: keyof typeof METALS, accent: string, twin?: string) {
    this.metal = metal;
    this.accent.set(accent);
    if (twin) this.twinAccent.set(twin);
    this.stack.target = twin ? 1 : 0;
  }

  tokenScreen() {
    const v = this.v.copy(this.holder.position).project(this.camera);
    const dist = CAM_Z - this.holder.position.z;
    return {
      x: (v.x * 0.5 + 0.5) * this.width,
      y: (-v.y * 0.5 + 0.5) * this.height,
      r: (this.holder.scale.x / (dist * TAN)) * (this.height / 2),
    };
  }

  update(scroll: number, dt: number, time: number) {
    const { pose, look, token, twin, space } = this;
    if (!token || !twin || !space) return;
    this.poses.at(scroll, this.poseTarget);
    this.looks.at(scroll, this.lookTarget);
    approach(pose, this.poseTarget, this.reduced ? 60 : 6.5, dt);
    approach(look, this.lookTarget, this.reduced ? 60 : 9, dt);
    const live = this.reduced ? 0 : 1;

    const portrait = this.aspect < 0.85;
    const fz = this.frame(FLOAT_Z);
    this.holder.position.set(((portrait ? pose.mx : pose.x) * fz.w) / 2, ((portrait ? pose.my : pose.y) * fz.h) / 2, FLOAT_Z);
    this.holder.scale.setScalar(portrait ? (pose.msize * fz.w) / 2 : (pose.size * fz.h) / 2);
    this.holder.quaternion.setFromEuler(this.e.set(pose.rx, pose.ry, pose.rz));

    this.pointerS.x = damp(this.pointerS.x, this.pointer.x, 4, dt);
    this.pointerS.y = damp(this.pointerS.y, this.pointer.y, 4, dt);
    if (Math.abs(pose.spin) > 0.01 && live) this.idle.y += pose.spin * dt;
    else this.idle.y = damp(this.idle.y, Math.round(this.idle.y / TAU) * TAU, 2.2, dt);

    const s = this.tokenScreen();
    const dx = (this.pointer.x * 0.5 + 0.5) * this.width - s.x;
    const dy = (-this.pointer.y * 0.5 + 0.5) * this.height - s.y;
    this.hover = damp(this.hover, Math.hypot(dx, dy) < s.r * 1.05 ? 1 : 0, 5, dt);

    const wob = pose.wobble * live;
    const tilt = (pose.tilt + this.hover * 0.22) * live;
    this.turn.y = damp(this.turn.y, this.poses.transition(scroll, 0) * TAU * live, 6, dt);
    this.turn.x = damp(this.turn.x, this.poses.transition(scroll, 1) * TAU * live, 6, dt);
    this.wheel.angle = this.reduced ? this.wheel.target : damp(this.wheel.angle, this.wheel.target, 4.2, dt);
    this.spinner.rotation.set(
      Math.sin(time * 0.6) * 0.035 * wob - this.pointerS.y * tilt + this.turn.x,
      this.idle.y + Math.sin(time * 0.45) * 0.05 * wob + Math.sin(time * 0.32) * pose.sway * live + this.pointerS.x * tilt + this.turn.y,
      Math.sin(time * 0.27) * 0.02 * wob + this.wheel.angle,
    );
    this.holder.position.y += Math.sin(time * 0.8) * 0.015 * wob * this.holder.scale.x;
    const intro = this.intro;
    if (intro > 0.0005) {
      this.holder.position.z -= intro * intro * 34;
      this.spinner.rotation.y += intro * intro * 5;
    }

    const f = this.flip;
    if (this.reduced) f.angle = f.target;
    else {
      f.velocity += (f.target - f.angle) * 60 * dt;
      f.velocity *= Math.exp(-11 * dt);
      f.angle += f.velocity * dt;
    }
    this.flipper.rotation.x = f.angle;
    this.flipper.position.z = Math.abs(Math.sin(f.angle)) * 0.5;

    token.setExplode(pose.explode);
    const k = 1 - Math.exp(-6 * dt);
    const styled = Math.min(1, Math.max(0, pose.stackable));
    this.accentNow.copy(this.baseAccent).lerp(this.accent, styled);
    token.accent.value.lerp(this.accentNow, k);
    token.lerpMetal(METALS[styled > 0.5 ? this.metal : "gold"], k);
    twin.accent.value.lerp(this.twinAccent, k);
    this.stack.value = damp(this.stack.value, this.stack.target * pose.stackable, 6, dt);
    const st = this.stack.value;
    twin.group.visible = st > 0.01;
    twin.group.position.set(0.62 * st, -0.46 * st, -(THICK + 0.03) * st);
    twin.group.rotation.z = 0.7 * st;

    this.podiumIn = damp(this.podiumIn, pose.podium, 4.5, dt);
    const pin = this.podiumIn;
    this.podium.forEach((p, i) => {
      p.holder.visible = pin > 0.01;
      if (!p.holder.visible) return;
      const sc = this.holder.scale.x;
      const t = easeOutBack(Math.min(1, pin * 1.15 - i * 0.12));
      p.holder.position.copy(this.holder.position).addScaledVector(p.offset, sc);
      p.holder.position.y -= (1 - pin) * sc * 2.2;
      p.holder.scale.setScalar(Math.max(0.0001, sc * 0.8 * t));
      p.holder.rotation.set(
        pose.rx + Math.sin(time * 0.5 + i) * 0.04 * live - this.pointerS.y * tilt,
        pose.ry + p.turn + Math.sin(time * 0.4 + i * 2) * 0.06 * live + this.pointerS.x * tilt,
        Math.sin(time * 0.3 + i) * 0.03,
      );
    });

    this.fleetRake.intensity = look.fleet * 2.6;
    this.fleetFill.intensity = look.fleet * 1.1;
    this.fleet?.update(dt, time, { progress: this.fleetProgress, amount: look.fleet, reduced: this.reduced, aspect: this.aspect, camera: this.camera });
    this.walkers?.update(dt, time, { amount: look.walkers, progress: this.walkersProgress, aspect: this.aspect, reduced: this.reduced, veil: look.base });
    this.plan?.update({ amount: look.plan, p: this.planProgress, frame: this.planFrame, width: this.width, height: this.height, camera: this.camera, reduced: this.reduced });
    this.bakeNebula();
    this.nebulaFade = damp(this.nebulaFade, this.nebulaState === "ready" ? 1 : 0, this.reduced ? 60 : 2.5, dt);
    const deep = look.deep * this.nebulaFade;
    if (deep > 0.001) this.nebula?.update({ aspect: this.aspect, pointer: this.pointerS, progress: this.fleetProgress, time, reduced: this.reduced });
    space.update(dt, time, { scroll, worldPerPx: this.worldPerPx, stars: look.stars, planet: look.planet, warp: this.reduced ? 0 : Math.max(look.warp, Math.min(1, intro * 1.3)), dpr: this.dpr, pointer: this.pointerS, aspect: this.aspect, focus: this.focus.set(portrait ? pose.mx : pose.x, portrait ? pose.my : pose.y) }, this.camera);

    const u = this.backdrop.material.uniforms;
    u.uBase.value.fromArray(look.base);
    u.uGlow.value.fromArray(look.glow);
    u.uGlowP.value.fromArray(look.glowP);
    u.uGlow2.value.fromArray(look.glow2);
    u.uGlow2P.value.fromArray(look.glow2P);
    u.uIris.value = look.iris * (1 + this.hover * 0.35);
    u.uGobo.value = look.gobo;
    u.uGrain.value = look.grain;
    u.uNebula.value = look.nebula;
    u.uDeep.value = deep;
    u.uTime.value = time;
    u.uScroll.value = scroll / Math.max(1, this.height);
    this.key.intensity = look.key;
    this.sun.intensity = look.sun;
    this.rim.intensity = look.rim;
    this.scene.environmentIntensity = look.env;
  }

  private bakeNebula() {
    const nebula = this.nebula;
    if (!nebula || this.nebulaState !== "idle" || this.intro > 0.001) return;
    this.nebulaState = "baking";
    const frame = () => new Promise<void>((res) => requestAnimationFrame(() => res()));
    nebula
      .bake(this.renderer, frame, () => this.disposed)
      .then((ok) => ok && (this.nebulaState = "ready"))
      .catch(() => {});
  }

  render() {
    this.walkers?.prepass(this.renderer, this.camera);
    this.renderer.render(this.scene, this.camera);
  }

  snapshot(options: SnapshotOptions) {
    const r = this.renderer;
    if (!this.kit) throw new Error("Scène non initialisée");
    const { width, height } = options;
    const dpr = r.getPixelRatio();
    const k = Math.min(1, this.width / width, this.height / height);
    const pw = Math.round(width * k * dpr) / dpr;
    const ph = Math.round(height * k * dpr) / dpr;
    const { scene, cam, token } = this.photoScene(options);
    r.setScissorTest(true);
    r.setViewport(0, 0, pw, ph);
    r.setScissor(0, 0, pw, ph);
    r.render(scene, cam);
    const out = document.createElement("canvas");
    out.width = Math.round(width);
    out.height = Math.round(height);
    out.getContext("2d")!.drawImage(r.domElement, 0, r.domElement.height - ph * dpr, pw * dpr, ph * dpr, 0, 0, out.width, out.height);
    r.setScissorTest(false);
    r.setViewport(0, 0, this.width, this.height);
    token.dispose();
    return out;
  }

  private photoScene({ width, height, bg, rx = 0, ry = 0, rz = 0, metal = "gold", accent = "#dc5000", lift = 0, studio = false }: SnapshotOptions) {
    const scene = new THREE.Scene();
    scene.environment = this.scene.environment;
    scene.environmentIntensity = studio ? 0.5 : 1;
    scene.background = new THREE.Color(bg);
    const token = this.kit!.build(metal, accent);
    token.group.rotation.set(rx, ry, rz);
    token.group.position.y = lift;
    const key = this.key.clone();
    key.intensity = studio ? 3.6 : 2.4;
    if (studio) key.position.set(-7.5, 5, 4);
    const sun = this.sun.clone();
    sun.intensity = studio ? 1.3 : 1.8;
    scene.add(token.group, key, sun);
    if (studio) {
      const rim = new THREE.DirectionalLight(0xbcd6ff, 2.2);
      rim.position.set(6, 5, -7);
      scene.add(rim);
    }
    const aspect = width / height;
    const cam = new THREE.PerspectiveCamera(22, aspect, 0.1, 60);
    const t = Math.tan(THREE.MathUtils.degToRad(11));
    cam.position.set(0, 0, Math.max(6.6, 2.5 / (2 * t * aspect)));
    return { scene, cam, token };
  }

  dispose() {
    this.disposed = true;
    this.kit?.dispose();
    this.token?.dispose();
    this.twin?.dispose();
    this.warm.forEach((t) => t.dispose());
    this.podium.forEach((p) => p.token.dispose());
    this.space?.dispose();
    this.fleet?.dispose();
    this.nebula?.dispose();
    this.plan?.dispose();
    this.walkers?.dispose();
    this.leaves?.dispose();
    this.renderer.dispose();
  }
}
