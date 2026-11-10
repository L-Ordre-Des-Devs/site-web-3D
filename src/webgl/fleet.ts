import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { MAX_CREW, Track, clamp, preparing, rng, smooth } from "./flight";
import type { Kind, Plan, Sky, TrackInfo } from "./flight";

export type Part = "body" | "frame" | "dark" | "glass" | "panel";
export const PARTS: Part[] = ["body", "frame", "dark", "glass", "panel"];

const NOZZLES = [new THREE.Vector3(-0.12, -0.18, 0.6), new THREE.Vector3(0.12, -0.18, 0.6)];
const MUZZLES = [new THREE.Vector3(-0.2, -0.33, -0.72), new THREE.Vector3(0.2, -0.33, -0.72)];

export function fighterGeometry(): Record<Part, THREE.BufferGeometry> {
  const parts: Record<Part, THREE.BufferGeometry[]> = { body: [], frame: [], dark: [], glass: [], panel: [] };
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const one = new THREE.Vector3(1, 1, 1);
  const v = new THREE.Vector3();
  const put = (part: Part, geo: THREE.BufferGeometry, pos: [number, number, number] = [0, 0, 0], rot: [number, number, number] = [0, 0, 0], parent?: THREE.Matrix4) => {
    m.compose(v.set(...pos), q.setFromEuler(e.set(...rot)), one);
    if (parent) m.premultiply(parent);
    geo.applyMatrix4(m);
    parts[part].push(geo);
  };

  put("body", new THREE.SphereGeometry(0.52, 48, 32));
  put("dark", new THREE.TorusGeometry(0.525, 0.012, 6, 64));
  put("dark", new THREE.TorusGeometry(0.525, 0.012, 6, 64), [0, 0, 0], [Math.PI / 2, 0, 0]);
  put("dark", new THREE.TorusGeometry(0.525, 0.012, 6, 64), [0, 0, 0], [0, Math.PI / 2, 0]);
  put("frame", new THREE.TorusGeometry(0.17, 0.018, 6, 32), [0, 0.497, 0], [Math.PI / 2, 0, 0]);
  put("dark", new THREE.CylinderGeometry(0.15, 0.15, 0.03, 24), [0, 0.5, 0]);
  put("glass", new THREE.CircleGeometry(0.31, 8), [0, 0, -0.49], [0, Math.PI, Math.PI / 8]);
  put("frame", new THREE.TorusGeometry(0.32, 0.04, 6, 8), [0, 0, -0.48], [0, 0, Math.PI / 8]);
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    put("frame", new THREE.BoxGeometry(0.024, 0.3, 0.022), [Math.cos(a) * 0.15, Math.sin(a) * 0.15, -0.5], [0, 0, a + Math.PI / 2]);
  }
  put("frame", new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), [0, 0, -0.505], [Math.PI / 2, 0, 0]);
  for (const x of [-0.2, 0.2]) {
    put("dark", new THREE.CylinderGeometry(0.045, 0.05, 0.12, 12), [x, -0.33, -0.42], [Math.PI / 2, 0, 0]);
    put("frame", new THREE.CylinderGeometry(0.022, 0.022, 0.3, 8), [x, -0.33, -0.57], [Math.PI / 2, 0, 0]);
  }
  put("dark", new THREE.CylinderGeometry(0.22, 0.24, 0.05, 32), [0, 0, 0.5], [Math.PI / 2, 0, 0]);
  put("frame", new THREE.TorusGeometry(0.235, 0.02, 6, 40), [0, 0, 0.52]);
  for (const n of NOZZLES) put("dark", new THREE.CylinderGeometry(0.05, 0.065, 0.12, 16, 1, true), [n.x, n.y, 0.5], [Math.PI / 2, 0, 0]);

  const hex = new THREE.Shape();
  for (let k = 0; k < 6; k++) {
    const a = Math.PI / 2 + (k * Math.PI) / 3;
    if (k === 0) hex.moveTo(Math.cos(a) * 1.55, Math.sin(a) * 1.55);
    else hex.lineTo(Math.cos(a) * 1.55, Math.sin(a) * 1.55);
  }
  hex.closePath();
  const wingM = new THREE.Matrix4();
  for (const side of [-1, 1]) {
    put("body", new THREE.CylinderGeometry(0.085, 0.16, 0.86, 18), [side * 0.88, 0, 0], [0, 0, Math.PI / 2]);
    for (const off of [0.62, 1.02]) put("frame", new THREE.TorusGeometry(off < 0.8 ? 0.15 : 0.1, 0.022, 8, 24), [side * off, 0, 0], [0, Math.PI / 2, 0]);
    put("frame", new THREE.BoxGeometry(0.16, 0.34, 0.34), [side * 1.26, 0, 0]);
    wingM.compose(v.set(side * 1.36, 0, 0), q.setFromEuler(e.set(0, Math.PI / 2, 0)), one);
    const panel = new THREE.ExtrudeGeometry(hex, { depth: 0.04, bevelEnabled: false });
    panel.translate(0, 0, -0.02);
    const p = panel.attributes.position;
    const wing = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i++) {
      wing[i * 2] = p.getX(i);
      wing[i * 2 + 1] = p.getY(i);
    }
    panel.setAttribute("aWing", new THREE.BufferAttribute(wing, 2));
    put("panel", panel, [0, 0, 0], [0, 0, 0], wingM);
    for (let k = 0; k < 6; k++) {
      const a0 = Math.PI / 2 + (k * Math.PI) / 3;
      const a1 = a0 + Math.PI / 3;
      const x0 = Math.cos(a0) * 1.55, y0 = Math.sin(a0) * 1.55, x1 = Math.cos(a1) * 1.55, y1 = Math.sin(a1) * 1.55;
      put("frame", new THREE.BoxGeometry(Math.hypot(x1 - x0, y1 - y0) + 0.06, 0.085, 0.12), [(x0 + x1) / 2, (y0 + y1) / 2, 0], [0, 0, Math.atan2(y1 - y0, x1 - x0)], wingM);
      put("frame", new THREE.BoxGeometry(1.52, 0.05, 0.1), [x0 / 2, y0 / 2, 0], [0, 0, a0], wingM);
      put("dark", new THREE.CylinderGeometry(0.035, 0.035, 0.14, 10), [x0 * 0.97, y0 * 0.97, 0], [Math.PI / 2, 0, 0], wingM);
    }
    put("frame", new THREE.TorusGeometry(0.5, 0.025, 6, 6), [0, 0, 0], [0, 0, Math.PI / 2], wingM);
    put("frame", new THREE.CylinderGeometry(0.24, 0.24, 0.16, 24), [0, 0, 0], [Math.PI / 2, 0, 0], wingM);
    put("dark", new THREE.CylinderGeometry(0.12, 0.12, 0.2, 18), [0, 0, 0], [Math.PI / 2, 0, 0], wingM);
  }

  const out = {} as Record<Part, THREE.BufferGeometry>;
  for (const part of PARTS) {
    out[part] = mergeGeometries(parts[part])!;
    parts[part].forEach((g) => g.dispose());
  }
  return out;
}

function solarMaterial() {
  const m = new THREE.MeshStandardMaterial({ color: 0x0f1319, metalness: 0.55, roughness: 0.42 });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec2 aWing;\nvarying vec2 vWing;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWing = aWing;");
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec2 vWing;
        float cellLine(vec2 p, float a, float gap) {
          float u = dot(p, vec2(cos(a), sin(a)));
          float d = abs(fract(u / gap + 0.5) - 0.5) * gap;
          return 1.0 - smoothstep(0.0, max(fwidth(u) * 1.2, 0.006), d);
        }
        float cells(vec2 p, float gap) {
          return max(max(cellLine(p, 0.0, gap), cellLine(p, 1.0472, gap)), cellLine(p, 2.0944, gap));
        }`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          float r = length(vWing) / 1.55;
          diffuseColor.rgb *= 1.0 + cells(vWing, 0.16) * 0.9 + cells(vWing, 0.48) * 1.4;
          diffuseColor.rgb *= mix(0.85, 1.15, smoothstep(0.3, 1.0, r));
        }`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        roughnessFactor = clamp(roughnessFactor + 0.2 * cells(vWing, 0.16), 0.1, 1.0);`,
      );
  };
  m.customProgramCacheKey = () => "odd-solar-2";
  return m;
}

const BOLT_VERT = `
  attribute vec3 aShape;
  attribute float aKind;
  varying vec2 vLocal;
  varying vec3 vShape;
  varying float vKind;
  void main() {
    vShape = aShape;
    vKind = aKind;
    vLocal = vec2(position.x * 2.0 * aShape.y, position.y * 2.0 * (aShape.x + aShape.y));
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    float dist = -mv.z;
    vShape.z *= (1.0 - smoothstep(170.0, 330.0, dist)) * smoothstep(2.5, 9.0, dist);
    gl_Position = projectionMatrix * mv;
  }
`;
const BOLT_FRAG = `
  varying vec2 vLocal;
  varying vec3 vShape;
  varying float vKind;
  void main() {
    float s = max(abs(vLocal.y) - vShape.x, 0.0);
    float d = length(vec2(s, vLocal.x)) / vShape.y;
    if (d > 1.0 || vShape.z < 0.002) discard;
    float core = exp(-d * d * 42.0);
    float halo = exp(-d * d * 5.5) * (1.0 - d);
    float along = vShape.x > 0.01 ? clamp(vLocal.y / vShape.x * 0.5 + 0.5, 0.0, 1.0) : 1.0;
    float head = mix(0.4, 1.0, along * along);
    vec3 coreCol = vKind < 0.5 ? vec3(3.2, 1.9, 1.8) : vec3(2.2, 2.6, 3.4);
    vec3 haloCol = vKind < 0.5 ? vec3(1.5, 0.07, 0.04) : vec3(0.35, 0.6, 1.5);
    gl_FragColor = vec4((coreCol * core + haloCol * halo) * head * vShape.z, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const GLOW_VERT = `
  attribute vec3 aColor;
  attribute float aSize;
  varying vec2 vP;
  varying vec3 vColor;
  void main() {
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * aSize;
    vP = position.xy * 2.0;
    vColor = aColor;
    gl_Position = projectionMatrix * mv;
  }
`;
const GLOW_FRAG = `
  varying vec2 vP;
  varying vec3 vColor;
  void main() {
    float r = length(vP);
    if (r > 1.0) discard;
    float g = exp(-r * r * 5.0) * (1.0 - r) + exp(-r * r * 40.0) * 0.6;
    gl_FragColor = vec4(vColor * g, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

interface Live {
  plan: Plan;
  start: number;
}

interface Ship {
  live: Live | null;
  crew: number;
  track: Track;
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  fwd: THREE.Vector3;
  phase: number;
  shown: boolean;
  burst: number;
  next: number;
  gun: number;
  flash: number;
  flashGun: number;
  jump: number;
}

type Slot = "arrival" | "next" | "patrol";
const SLOTS: Slot[] = ["arrival", "next", "patrol"];

interface Prep {
  kind: Kind;
  due: number;
  portrait: boolean;
  tracks: Track[];
  it: Generator<void, Plan, void>;
  plan: Plan | null;
}

const MAX_SHIPS = 8;
const CYCLE = 24;
const MAX_BOLTS = 160;
const MAX_GLOWS = MAX_SHIPS * 5;
const BUDGET = 1.2;
const PASSES: Kind[] = ["attaque", "poursuite", "traversee", "chandelle", "eventail"];

export interface FleetState {
  progress: number;
  amount: number;
  reduced: boolean;
  aspect: number;
  camera: THREE.Camera;
}

export class Fleet {
  group = new THREE.Group();
  private parts: THREE.InstancedMesh[] = [];
  private metals: [THREE.MeshStandardMaterial, number][] = [];
  private bolts: THREE.InstancedMesh;
  private boltShape: THREE.InstancedBufferAttribute;
  private boltKind: THREE.InstancedBufferAttribute;
  private glows: THREE.InstancedMesh;
  private glowColor: THREE.InstancedBufferAttribute;
  private glowSize: THREE.InstancedBufferAttribute;
  private ships: Ship[] = [];
  private shots: { on: boolean; p: THREE.Vector3; d: THREE.Vector3; speed: number; age: number }[] = [];
  private spare: Track[] = [];
  private preps = new Map<Slot, Prep>();
  private bag: Kind[] = [];
  private last: Kind | null = null;
  private upcoming: Kind;
  private nextAt = 0;
  private patrolAt = 0;
  private started = false;
  private leaving = false;
  private cycleAt = 0;
  private cycleOut = false;
  private disposables: { dispose(): void }[] = [];
  private rnd = rng(7);
  private info: TrackInfo = { speed: 0, thrust: 0, calm: 0 };
  private m = new THREE.Matrix4();
  private w = new THREE.Vector3();
  private b = new THREE.Vector3();
  private c = new THREE.Vector3();
  private d1 = new THREE.Vector3();
  private right = new THREE.Vector3();
  private up = new THREE.Vector3();
  private cam = new THREE.Vector3();
  private scale = new THREE.Vector3();
  private worldUp = new THREE.Vector3(0, 1, 0);

  constructor() {
    const mats: Record<Part, THREE.MeshStandardMaterial> = {
      body: new THREE.MeshStandardMaterial({ color: 0x4f565f, metalness: 0.5, roughness: 0.45 }),
      frame: new THREE.MeshStandardMaterial({ color: 0x7b828c, metalness: 0.55, roughness: 0.4 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x1c2026, metalness: 0.5, roughness: 0.55 }),
      glass: new THREE.MeshStandardMaterial({ color: 0x04060a, metalness: 0.95, roughness: 0.08 }),
      panel: solarMaterial(),
    };
    this.metals = [
      [mats.body, 0.55],
      [mats.frame, 0.6],
      [mats.dark, 0.35],
      [mats.glass, 1],
      [mats.panel, 0.28],
    ];
    const geos = fighterGeometry();
    for (const part of PARTS) {
      const mesh = new THREE.InstancedMesh(geos[part], mats[part], MAX_SHIPS);
      mesh.frustumCulled = false;
      mesh.count = 0;
      this.parts.push(mesh);
      this.group.add(mesh);
    }

    const boltGeo = new THREE.PlaneGeometry(1, 1);
    this.boltShape = new THREE.InstancedBufferAttribute(new Float32Array(MAX_BOLTS * 3), 3);
    this.boltKind = new THREE.InstancedBufferAttribute(new Float32Array(MAX_BOLTS), 1);
    boltGeo.setAttribute("aShape", this.boltShape);
    boltGeo.setAttribute("aKind", this.boltKind);
    this.bolts = new THREE.InstancedMesh(
      boltGeo,
      new THREE.ShaderMaterial({ vertexShader: BOLT_VERT, fragmentShader: BOLT_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
      MAX_BOLTS,
    );
    this.bolts.frustumCulled = false;
    this.bolts.count = 0;
    this.group.add(this.bolts);
    for (let i = 0; i < MAX_BOLTS; i++) this.shots.push({ on: false, p: new THREE.Vector3(), d: new THREE.Vector3(), speed: 0, age: 0 });

    const glowGeo = new THREE.PlaneGeometry(1, 1);
    this.glowColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_GLOWS * 3), 3);
    this.glowSize = new THREE.InstancedBufferAttribute(new Float32Array(MAX_GLOWS), 1);
    glowGeo.setAttribute("aColor", this.glowColor);
    glowGeo.setAttribute("aSize", this.glowSize);
    this.glows = new THREE.InstancedMesh(
      glowGeo,
      new THREE.ShaderMaterial({ vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
      MAX_GLOWS,
    );
    this.glows.frustumCulled = false;
    this.glows.count = 0;
    this.group.add(this.glows);

    for (let i = 0; i < MAX_SHIPS; i++) {
      this.ships.push({
        live: null,
        crew: 0,
        track: new Track(),
        pos: new THREE.Vector3(),
        quat: new THREE.Quaternion(),
        fwd: new THREE.Vector3(0, 0, -1),
        phase: i * 1.7,
        shown: false,
        burst: 0,
        next: 0,
        gun: 0,
        flash: 9,
        flashGun: 0,
        jump: -1,
      });
    }
    for (let i = 0; i < SLOTS.length * MAX_CREW; i++) this.spare.push(new Track());
    this.upcoming = this.pick();

    this.group.visible = false;
    this.group.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) this.disposables.push(mesh.geometry);
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((x) => this.disposables.push(x));
    });
  }

  setEnvironment(tex: THREE.Texture) {
    this.metals.forEach(([m, k]) => {
      m.envMap = tex;
      m.envMapIntensity = k;
      m.needsUpdate = true;
    });
    this.disposables.push(tex);
  }

  showAll(on: boolean) {
    this.group.visible = on;
    const n = on ? 1 : 0;
    this.m.identity();
    this.parts.forEach((p) => {
      p.setMatrixAt(0, this.m);
      p.count = n;
    });
    this.bolts.count = n;
    this.glows.count = n;
  }

  private pick(): Kind {
    if (!this.bag.length) {
      const kinds = [...PASSES, ...PASSES];
      for (let i = kinds.length - 1; i > 0; i--) {
        const j = Math.floor(this.rnd() * (i + 1));
        [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
      }
      this.bag = kinds;
    }
    let k = this.bag.length - 1;
    if (this.bag[k] === this.last) k = Math.max(0, this.bag.findIndex((x) => x !== this.last));
    const kind = this.bag.splice(k, 1)[0];
    this.last = kind;
    return kind;
  }

  private ready(slot: Slot, kind: Kind, due: number, sky: Sky) {
    let p = this.preps.get(slot);
    if (p && (p.kind !== kind || p.portrait !== sky.portrait)) {
      this.drop(slot);
      p = undefined;
    }
    if (!p) {
      if (this.spare.length < MAX_CREW) return null;
      const tracks = this.spare.splice(this.spare.length - MAX_CREW, MAX_CREW);
      p = { kind, due, portrait: sky.portrait, tracks, it: preparing(kind, this.rnd, sky, tracks), plan: null };
      this.preps.set(slot, p);
    }
    p.due = due;
    return p;
  }

  private drop(slot: Slot) {
    const p = this.preps.get(slot);
    if (!p) return;
    this.spare.push(...p.tracks);
    this.preps.delete(slot);
  }

  private pump(budget: number) {
    const t0 = performance.now();
    for (;;) {
      let p: Prep | null = null;
      for (const slot of SLOTS) {
        const q = this.preps.get(slot);
        if (q && !q.plan && (!p || q.due < p.due)) p = q;
      }
      if (!p) return;
      const x = p.it.next();
      if (x.done) p.plan = x.value;
      if (performance.now() - t0 > budget) return;
    }
  }

  private launch(slot: Slot, kind: Kind, time: number, sky: Sky) {
    const free = this.ships.filter((sh) => !sh.live);
    if (!free.length) return false;
    const p = this.ready(slot, kind, time, sky);
    if (!p) return false;
    while (!p.plan) {
      const x = p.it.next();
      if (x.done) p.plan = x.value;
    }
    this.preps.delete(slot);
    const plan = p.plan;
    const live: Live = { plan, start: time };
    p.tracks.forEach((track, i) => {
      const sh = i < plan.crew.length ? free[i] : undefined;
      if (!sh) {
        this.spare.push(track);
        return;
      }
      this.spare.push(sh.track);
      sh.track = track;
      sh.live = live;
      sh.crew = i;
      sh.phase = this.rnd() * 10;
      sh.burst = 0;
      sh.next = time + 0.2 + this.rnd() * 0.6;
      sh.gun = 0;
      sh.flash = 9;
      sh.jump = -1;
    });
    return true;
  }

  private jumpAway(time: number, all = false) {
    let k = 0;
    this.ships.forEach((sh) => {
      if (!sh.live || sh.jump >= 0) return;
      if (all && !sh.shown) sh.live = null;
      else if (sh.shown && (all || sh.fwd.z < -0.3)) sh.jump = time + (all ? 0.06 : 0.12) * k++;
    });
  }

  private fire(from: THREE.Vector3, dir: THREE.Vector3, speed: number) {
    const b = this.shots.find((x) => !x.on);
    if (!b) return;
    b.on = true;
    b.p.copy(from);
    b.d.copy(dir);
    b.speed = speed;
    b.age = 0;
  }

  update(dt: number, time: number, s: FleetState) {
    const on = s.amount > 0.01;
    const p = s.progress;
    this.group.visible = on && (p < 0.999 || s.amount > 0.9);
    if (!on) {
      if (this.started) {
        this.started = false;
        this.ships.forEach((sh) => (sh.live = null));
        this.shots.forEach((b) => (b.on = false));
      }
      this.leaving = false;
      return;
    }
    const sky: Sky = { aspect: s.aspect, portrait: s.aspect < 0.85, reduced: s.reduced };
    this.group.position.set(0, (p - 0.4) * 5, 0);
    this.cam.copy(s.camera.position).sub(this.group.position);

    const out = p > 0.9;
    const live = s.amount > 0.5 && !out;
    if (out && !this.leaving) {
      this.leaving = true;
      this.jumpAway(time, true);
      this.cycleOut = true;
      this.cycleAt = time + 3.4;
    }
    if (!out) this.leaving = false;
    const entry: Kind = s.reduced ? "patrouille" : "arrivee";
    if (!this.started) {
      this.ready("arrival", entry, time, sky);
      if (live && this.launch("arrival", entry, time, sky)) {
        this.started = true;
        this.nextAt = time + 2.4;
        this.patrolAt = time + 2.5;
        this.cycleAt = time + CYCLE;
        this.cycleOut = false;
      }
    } else if (live && !s.reduced) {
      if (!this.cycleOut && time >= this.cycleAt - 3.4) {
        this.cycleOut = true;
        this.jumpAway(time);
      }
      if (time >= this.cycleAt) {
        if (this.launch("arrival", "arrivee", time, sky)) {
          this.nextAt = time + 2.4;
          this.cycleAt = time + CYCLE;
          this.cycleOut = false;
        }
      } else if (!this.cycleOut && time >= this.nextAt) {
        if (this.launch("next", this.upcoming, time, sky)) {
          this.upcoming = this.pick();
          this.nextAt = time + 1.5 + this.rnd() * 1.3;
        } else this.nextAt = time + 0.3;
      }
      if (!this.cycleOut && time >= this.patrolAt) {
        this.launch("patrol", "patrouille", time, sky);
        this.patrolAt = time + 15 + this.rnd() * 6;
      }
    }
    if (this.started && !s.reduced) {
      this.ready("next", this.upcoming, this.nextAt, sky);
      this.ready("patrol", "patrouille", this.patrolAt, sky);
      this.ready("arrival", "arrivee", this.cycleAt, sky);
    }
    this.pump(BUDGET);

    let n = 0;
    let g = 0;
    const glowAt = (pos: THREE.Vector3, r: number, gr: number, b: number, size: number) => {
      if (g >= MAX_GLOWS) return;
      this.m.makeTranslation(pos.x, pos.y, pos.z);
      this.glows.setMatrixAt(g, this.m);
      this.glowColor.setXYZ(g, r, gr, b);
      this.glowSize.setX(g, size);
      g++;
    };
    let streaks = 0;
    const info = this.info;
    for (const ship of this.ships) {
      const L = ship.live;
      ship.shown = false;
      if (!L) continue;
      const t = time - L.start;
      if (t >= ship.track.duration || (ship.jump > 0 && time - ship.jump > 0.7)) {
        ship.live = null;
        continue;
      }
      const delay = L.plan.crew[ship.crew].delay;
      if (t < delay) continue;
      const pos = ship.pos;
      ship.track.read(t, pos, ship.quat, info);
      const fwd = ship.fwd.set(0, 0, -1).applyQuaternion(ship.quat);
      let stretch = 1;
      if (L.plan.kind === "arrivee") {
        const a = clamp((t - delay) / 0.55);
        const k = 1 - a;
        pos.addScaledVector(fwd, -k * k * 420);
        stretch = 1 + 10 * k * k;
        if (a > 0.7 && a < 1) glowAt(pos, 1.3, 1.6, 2.4, 6 * Math.sin(((a - 0.7) / 0.3) * Math.PI));
        if (k > 0.02) this.streak(streaks++, pos, fwd, 6 + k * 80, k);
      }
      if (ship.jump > 0 && time >= ship.jump) {
        const j = clamp((time - ship.jump) / 0.6);
        pos.addScaledVector(fwd, j * j * 520);
        if (pos.z > 2) continue;
        stretch = 1 + 10 * clamp(j / 0.35);
        if (j < 0.5) glowAt(pos, 1.3, 1.6, 2.4, 5 * Math.sin((j / 0.5) * Math.PI));
        this.streak(streaks++, pos, fwd, 6 + j * 90, Math.sin(j * Math.PI));
        if (j >= 0.95) continue;
      }
      ship.shown = true;
      this.scale.set(1, 1, stretch);
      this.m.compose(pos, ship.quat, this.scale);
      for (const part of this.parts) part.setMatrixAt(n, this.m);
      n++;

      const thrust = 0.7 + 0.6 * info.thrust;
      for (const nz of NOZZLES) {
        this.w.copy(nz).applyQuaternion(ship.quat).add(pos);
        const f = (0.85 + 0.15 * Math.sin(time * 23 + nz.x * 40 + ship.phase)) * thrust;
        glowAt(this.w, 0.95 * f, 0.36 * f, 0.18 * f, 0.36 * f);
      }
      if (!s.reduced && info.calm > 0.5 && time >= ship.next) {
        if (ship.burst <= 0) ship.burst = 4 + Math.floor(this.rnd() * 3);
        this.right.set(1, 0, 0).applyQuaternion(ship.quat);
        this.up.set(0, 1, 0).applyQuaternion(ship.quat);
        this.w.copy(MUZZLES[ship.gun]).applyQuaternion(ship.quat).add(pos);
        this.c.copy(fwd).addScaledVector(this.right, (this.rnd() - 0.5) * 0.012).addScaledVector(this.up, (this.rnd() - 0.5) * 0.012).normalize();
        this.fire(this.w, this.c, 230 + info.speed);
        ship.flash = 0;
        ship.flashGun = ship.gun;
        ship.gun = 1 - ship.gun;
        ship.burst--;
        ship.next = time + (ship.burst > 0 ? 0.075 : 0.5 + this.rnd() * 0.9);
      }
      ship.flash += dt;
      if (ship.flash < 0.07) {
        const k = 1 - ship.flash / 0.07;
        this.w.copy(MUZZLES[ship.flashGun]).applyQuaternion(ship.quat).add(pos);
        glowAt(this.w, 3.2 * k, 0.5 * k, 0.32 * k, 0.75 * k + 0.2);
      }
    }
    this.parts.forEach((part) => {
      part.count = n;
      part.instanceMatrix.needsUpdate = true;
    });

    let nb = streaks;
    for (const b of this.shots) {
      if (!b.on) continue;
      b.age += dt;
      b.p.addScaledVector(b.d, b.speed * dt);
      if (b.age > 1.15) {
        b.on = false;
        continue;
      }
      if (nb >= MAX_BOLTS) continue;
      const fade = Math.min(1, b.age / 0.03) * (1 - smooth(clamp((b.age - 0.9) / 0.25)));
      this.beam(nb++, b.p, b.d, 4.2, 0.3, fade, 0);
    }
    this.bolts.count = nb;
    this.bolts.instanceMatrix.needsUpdate = true;
    this.boltShape.needsUpdate = true;
    this.boltKind.needsUpdate = true;
    this.glows.count = g;
    this.glows.instanceMatrix.needsUpdate = true;
    this.glowColor.needsUpdate = true;
    this.glowSize.needsUpdate = true;
  }

  private streak(i: number, pos: THREE.Vector3, T: THREE.Vector3, len: number, alpha: number) {
    if (i >= 16) return;
    this.beam(i, pos, T, len, 0.7, alpha, 1);
  }

  private beam(i: number, head: THREE.Vector3, dir: THREE.Vector3, len: number, radius: number, alpha: number, kind: number) {
    const mid = this.w.copy(head).addScaledVector(dir, -len / 2);
    const view = this.b.subVectors(this.cam, mid).normalize();
    const axis = this.c.copy(dir).multiplyScalar(len);
    axis.addScaledVector(view, -axis.dot(view));
    let la = axis.length();
    if (la < 1e-4) {
      axis.crossVectors(view, this.worldUp);
      if (axis.lengthSq() < 1e-6) axis.set(1, 0, 0);
      la = 0;
    }
    axis.normalize();
    const side = this.d1.crossVectors(axis, view).normalize();
    const half = la / 2 + radius;
    const e = this.m.elements;
    e[0] = side.x * 2 * radius;
    e[1] = side.y * 2 * radius;
    e[2] = side.z * 2 * radius;
    e[3] = 0;
    e[4] = axis.x * 2 * half;
    e[5] = axis.y * 2 * half;
    e[6] = axis.z * 2 * half;
    e[7] = 0;
    e[8] = view.x;
    e[9] = view.y;
    e[10] = view.z;
    e[11] = 0;
    e[12] = mid.x;
    e[13] = mid.y;
    e[14] = mid.z;
    e[15] = 1;
    this.bolts.setMatrixAt(i, this.m);
    this.boltShape.setXYZ(i, la / 2, radius, alpha);
    this.boltKind.setX(i, kind);
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}
