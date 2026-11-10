import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { PLAN, type PlanShip } from "../home/sections/plan-data";
import { ANCHOR, BALLOONS, CROSSINGS, GRID, P1, PLAN_HEAD, SECONDS, STEP, T0, T1, T_END, timeAt } from "../home/sections/plan-time";
import { fighterGeometry, PARTS } from "./fleet";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

const COLORS = ["#ff7a2a", "#43c6ff"].map((c) => new THREE.Color(c));
const CREAM = new THREE.Color("#ffedd7");
const BLUE = new THREE.Color("#43c6ff");
const CAM_Z = 10;
const TAN = Math.tan((15 * Math.PI) / 180);
const SIZE = 12;

function wireFighter(seg: number) {
  const out: number[] = [];
  const line = (a: number[], b: number[]) => out.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  const circle = (c: number[], u: number[], v: number[], r: number, n: number) => {
    let prev: number[] | null = null;
    for (let k = 0; k <= n; k++) {
      const a = (k / n) * Math.PI * 2;
      const p = [0, 1, 2].map((i) => c[i] + (u[i] * Math.cos(a) + v[i] * Math.sin(a)) * r);
      if (prev) line(prev, p);
      prev = p;
    }
  };
  const X = [1, 0, 0];
  const Y = [0, 1, 0];
  const Z = [0, 0, 1];
  const half = Math.max(8, Math.round(seg / 2));
  circle([0, 0, 0], X, Y, 0.52, seg);
  circle([0, 0, 0], Y, Z, 0.52, seg);
  circle([0, 0, 0], X, Z, 0.52, seg);
  circle([0, 0.3, 0], X, Z, 0.425, Math.round(seg * 0.75));
  circle([0, -0.3, 0], X, Z, 0.425, Math.round(seg * 0.75));
  const oct = Array.from({ length: 8 }, (_, k) => {
    const a = Math.PI / 8 + (k * Math.PI) / 4;
    return [Math.cos(a) * 0.31, Math.sin(a) * 0.31, -0.49];
  });
  oct.forEach((p, k) => {
    line(p, oct[(k + 1) % 8]);
    line([0, 0, -0.505], p);
  });
  circle([0, 0, 0.52], X, Y, 0.235, half);
  circle([0, 0.497, 0], X, Z, 0.17, half);
  for (const x of [-0.2, 0.2]) line([x, -0.33, -0.36], [x, -0.33, -0.72]);
  for (const s of [-1, 1]) {
    const rin = s > 0 ? 0.085 : 0.16;
    const rout = s > 0 ? 0.16 : 0.085;
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      line([s * 0.45, Math.cos(a) * rin, Math.sin(a) * rin], [s * 1.31, Math.cos(a) * rout, Math.sin(a) * rout]);
    }
    circle([s * 0.62, 0, 0], Y, Z, 0.15, half);
    circle([s * 1.02, 0, 0], Y, Z, 0.1, half);
    const hx = s * 1.36;
    const vert = (r: number, k: number, dx = 0) => {
      const a = Math.PI / 2 + (k * Math.PI) / 3;
      return [hx + dx, Math.sin(a) * r, -Math.cos(a) * r];
    };
    for (let k = 0; k < 6; k++) {
      for (const dx of [-0.06, 0.06]) line(vert(1.55, k, dx), vert(1.55, k + 1, dx));
      line(vert(1.55, k, -0.06), vert(1.55, k, 0.06));
      line([hx, 0, 0], vert(1.55, k));
      line(vert(0.5, k), vert(0.5, k + 1));
    }
    circle([hx, 0, 0], Y, Z, 0.24, half);
  }
  return new Float32Array(out);
}

const qa = new THREE.Quaternion();
const qb = new THREE.Quaternion();
function sample(s: PlanShip, t: number, pos: THREE.Vector3, quat: THREE.Quaternion) {
  const n = s.bank.length;
  const x = clamp(t * PLAN.hz, 0, n - 1);
  const i = Math.min(Math.floor(x), n - 2);
  const f = x - i;
  pos.set(lerp(s.p[i * 3], s.p[i * 3 + 3], f), lerp(s.p[i * 3 + 1], s.p[i * 3 + 4], f), lerp(s.p[i * 3 + 2], s.p[i * 3 + 5], f));
  qa.fromArray(s.q, i * 4);
  qb.fromArray(s.q, i * 4 + 4);
  quat.slerpQuaternions(qa, qb, f);
  return { bank: lerp(s.bank[i], s.bank[i + 1], f), speed: lerp(s.speed[i], s.speed[i + 1], f) };
}

class LineSet {
  pos: number[] = [];
  t: number[] = [];
  col: number[] = [];
  add(a: ArrayLike<number>, b: ArrayLike<number>, t: number, c: THREE.Color, k: number) {
    this.pos.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    this.t.push(t, t);
    this.col.push(c.r * k, c.g * k, c.b * k, c.r * k, c.g * k, c.b * k);
  }
  dashed(a: THREE.Vector3, b: THREE.Vector3, t: number, c: THREE.Color, k: number, n: number) {
    const p = new THREE.Vector3();
    const q = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      p.lerpVectors(a, b, i / n);
      q.lerpVectors(a, b, (i + 0.55) / n);
      this.add(p.toArray(), q.toArray(), t, c, k);
    }
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("aT", new THREE.Float32BufferAttribute(this.t, 1));
    g.setAttribute("aColor", new THREE.Float32BufferAttribute(this.col, 3));
    return g;
  }
}

const LINE_VERT = `
  attribute float aT;
  attribute vec3 aColor;
  uniform float uHead;
  uniform float uAmount;
  varying vec3 vColor;
  void main() {
    float on = smoothstep(aT, aT + 0.06, uHead);
    float fresh = 1.0 + 0.8 * exp(-max(uHead - aT, 0.0) * 7.0) * on;
    vColor = aColor * on * fresh * uAmount;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const LINE_FRAG = `
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
const SOLID_VERT = `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;
const SOLID_FRAG = `
  uniform vec3 uColor;
  uniform float uAmount;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec3 n = normalize(vN);
    vec3 v = normalize(vV);
    if (dot(n, v) < 0.0) n = -n;
    float f = 1.0 - dot(n, v);
    float l = max(dot(n, normalize(vec3(-0.45, 0.75, 0.5))), 0.0);
    vec3 c = vec3(0.016, 0.026, 0.045) * (0.5 + 1.6 * l) + uColor * (0.015 + 0.09 * l + 0.9 * pow(f, 3.0));
    gl_FragColor = vec4(c, uAmount);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
const FLOOR_VERT = `
  varying vec2 vP;
  void main() {
    vP = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const FLOOR_FRAG = `
  uniform vec3 uColor;
  uniform float uAmount;
  uniform vec2 uHalf;
  uniform vec2 uMajor;
  uniform float uMinor;
  varying vec2 vP;
  float grid(vec2 p, vec2 cell) {
    vec2 g = p / cell;
    vec2 d = abs(fract(g - 0.5) - 0.5) / fwidth(g);
    return 1.0 - min(min(d.x, d.y), 1.0);
  }
  void main() {
    float minor = grid(vP, vec2(uMinor));
    float major = grid(vP + uMajor * 0.5, uMajor);
    vec2 e = abs(vP) / uHalf;
    float fade = (1.0 - smoothstep(0.82, 1.0, e.x)) * (1.0 - smoothstep(0.7, 1.0, e.y));
    gl_FragColor = vec4(uColor * (minor * 0.09 + major * 0.32) * fade * uAmount, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export interface PlanFrame {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlanState {
  amount: number;
  p: number;
  frame: PlanFrame;
  width: number;
  height: number;
  camera: THREE.Camera;
  reduced: boolean;
}

export class Plan3D {
  group = new THREE.Group();
  readonly anchors = new Float32Array(PLAN_HEAD + ANCHOR.count * 3);
  private pivot = new THREE.Group();
  private content = new THREE.Group();
  private lines: THREE.LineSegments<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private live: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private livePos: THREE.BufferAttribute;
  private liveCol: THREE.BufferAttribute;
  private floor: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private crafts: { solid: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>; wire: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> }[] = [];
  private floorY: number;
  private center = new THREE.Vector3();
  private half = new THREE.Vector3();
  private scale: number;
  private extent: THREE.Vector3[] = [];
  private rot: THREE.Vector3[] = [];
  private dists = [0, 0];
  private fits = [
    { d: 0, x: 0, y: 0 },
    { d: 0, x: 0, y: 0 },
  ];
  private near = Array.from({ length: 40 }, () => new THREE.Vector3());
  private tp = new THREE.Vector3();
  private tq = new THREE.Quaternion();
  private fixed: (THREE.Vector3 | null)[] = [];
  private disposables: { dispose(): void }[] = [];
  private v = new THREE.Vector3();
  private w = new THREE.Vector3();
  private side = new THREE.Vector3();
  private back = new THREE.Vector3();
  private pos = [new THREE.Vector3(), new THREE.Vector3()];
  private quat = [new THREE.Quaternion(), new THREE.Quaternion()];

  constructor() {
    this.group.add(this.pivot);
    this.pivot.add(this.content);

    const min = new THREE.Vector3(Infinity, Infinity, Infinity);
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    PLAN.ships.forEach((s) => {
      for (let t = T0; t <= T1 + 1e-6; t += 1 / PLAN.hz) {
        sample(s, t, p, q);
        min.min(p);
        max.max(p);
      }
    });
    this.floorY = min.y - 2.4;
    const fx = [min.x - 4, max.x + 4];
    const fz = [min.z - 4, max.z + 4];
    this.center.set((fx[0] + fx[1]) / 2, (this.floorY + max.y + 2) / 2, (fz[0] + fz[1]) / 2);
    this.half.set((fx[1] - fx[0]) / 2, (max.y + 2 - this.floorY) / 2, (fz[1] - fz[0]) / 2);
    this.scale = SIZE / (this.half.x * 2);
    for (const x of fx) for (const z of fz) this.extent.push(new THREE.Vector3(x, this.floorY, z).sub(this.center));
    for (const x of [min.x - 1.6, max.x + 1.6]) for (const y of [min.y - 1.6, max.y + 1.6]) for (const z of [min.z - 1.6, max.z + 1.6]) this.extent.push(new THREE.Vector3(x, y, z).sub(this.center));
    this.rot = Array.from({ length: Math.max(this.extent.length, 40) }, () => new THREE.Vector3());
    this.content.scale.setScalar(this.scale);
    this.content.position.copy(this.center).multiplyScalar(-this.scale);

    const cellX = (this.half.x * 2) / GRID.cols;
    const cellZ = (this.half.z * 2) / GRID.rows;
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(this.half.x * 2, this.half.z * 2),
      new THREE.ShaderMaterial({
        vertexShader: FLOOR_VERT,
        fragmentShader: FLOOR_FRAG,
        uniforms: {
          uColor: { value: BLUE.clone() },
          uAmount: { value: 0 },
          uHalf: { value: new THREE.Vector2(this.half.x, this.half.z) },
          uMajor: { value: new THREE.Vector2(cellX, cellZ) },
          uMinor: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.set(this.center.x, this.floorY, this.center.z);
    this.content.add(this.floor);

    const L = new LineSet();
    const light = wireFighter(16);
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const m = new THREE.Matrix4();
    const one = new THREE.Vector3(1, 1, 1);
    PLAN.ships.forEach((s, i) => {
      const c = COLORS[i];
      for (let k = Math.ceil(T0 / STEP - 1e-6); k * STEP <= T1 + 1e-6; k++) {
        const t = Math.round(k * STEP * 1000) / 1000;
        const whole = Math.abs(t - Math.round(t)) < 1e-3;
        sample(s, t, p, q);
        m.compose(p, q, one);
        for (let j = 0; j < light.length; j += 6) {
          a.fromArray(light, j).applyMatrix4(m);
          b.fromArray(light, j + 3).applyMatrix4(m);
          L.add(a.toArray(), b.toArray(), t, c, (whole ? 0.6 : 0.17) * (i ? 1 : 0.85));
        }
      }
      let prev: THREE.Vector3 | null = null;
      for (let t = T0; t <= T1 + 1e-6; t += 1 / PLAN.hz) {
        sample(s, t, p, q);
        if (prev) {
          L.add(prev.toArray(), p.toArray(), t, c, 0.6);
          L.add([prev.x, this.floorY, prev.z], [p.x, this.floorY, p.z], t, c, 0.3);
        }
        prev = (prev ?? new THREE.Vector3()).copy(p);
      }
      for (const sec of SECONDS) {
        sample(s, sec, p, q);
        L.add(p.toArray(), [p.x, this.floorY, p.z], sec, c, 0.5);
        L.add([p.x - 0.8, this.floorY, p.z], [p.x + 0.8, this.floorY, p.z], sec, c, 0.7);
        L.add([p.x, this.floorY, p.z - 0.8], [p.x, this.floorY, p.z + 0.8], sec, c, 0.7);
      }
    });
    for (let t = Math.ceil(T0 * 2) / 2; t <= T1 + 1e-6; t += 0.5) {
      sample(PLAN.ships[0], t, a, q);
      sample(PLAN.ships[1], t, b, q);
      L.dashed(a, b, t, CREAM, 0.35, 7);
    }
    const main = this.mainCrossing();
    if (main !== null) {
      sample(PLAN.ships[0], main, a, q);
      sample(PLAN.ships[1], main, b, q);
      const mx = (a.x + b.x) / 2;
      const mz = (a.z + b.z) / 2;
      L.add([a.x, a.y, a.z], [mx, a.y, mz], main, CREAM, 0.45);
      L.add([b.x, b.y, b.z], [mx, b.y, mz], main, CREAM, 0.45);
      L.add([mx, a.y, mz], [mx, b.y, mz], main, CREAM, 0.9);
      for (const y of [a.y, b.y]) L.add([mx - 0.35, y - 0.35, mz], [mx + 0.35, y + 0.35, mz], main, CREAM, 0.9);
      L.dashed(a, b, main, CREAM, 0.6, 9);
      const low = Math.min(a.y, b.y);
      L.dashed(new THREE.Vector3(mx, low, mz), new THREE.Vector3(mx, this.floorY, mz), main, CREAM, 0.45, 6);
    }
    this.lines = new THREE.LineSegments(
      L.geometry(),
      new THREE.ShaderMaterial({
        vertexShader: LINE_VERT,
        fragmentShader: LINE_FRAG,
        uniforms: { uHead: { value: 0 }, uAmount: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.lines.frustumCulled = false;
    this.content.add(this.lines);

    const parts = fighterGeometry();
    parts.panel.deleteAttribute("aWing");
    const flat = PARTS.map((k) => (parts[k].index ? parts[k].toNonIndexed() : parts[k]));
    const merged = mergeGeometries(flat)!;
    PARTS.forEach((k) => parts[k].dispose());
    flat.forEach((g) => g.dispose());
    const wire = new THREE.BufferGeometry();
    wire.setAttribute("position", new THREE.BufferAttribute(wireFighter(40), 3));
    PLAN.ships.forEach((_, i) => {
      const solid = new THREE.Mesh(
        merged,
        new THREE.ShaderMaterial({
          vertexShader: SOLID_VERT,
          fragmentShader: SOLID_FRAG,
          uniforms: { uColor: { value: COLORS[i].clone() }, uAmount: { value: 0 } },
          transparent: true,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        }),
      );
      const lines = new THREE.LineSegments(
        wire,
        new THREE.LineBasicMaterial({ color: COLORS[i], transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
      );
      solid.frustumCulled = false;
      lines.frustumCulled = false;
      this.content.add(solid, lines);
      this.crafts.push({ solid, wire: lines });
    });

    this.livePos = new THREE.BufferAttribute(new Float32Array(96 * 3), 3);
    this.liveCol = new THREE.BufferAttribute(new Float32Array(96 * 3), 3);
    this.livePos.setUsage(THREE.DynamicDrawUsage);
    this.liveCol.setUsage(THREE.DynamicDrawUsage);
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", this.livePos);
    lg.setAttribute("color", this.liveCol);
    this.live = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    this.live.frustumCulled = false;
    this.content.add(this.live);

    this.fixed = Array.from({ length: ANCHOR.count }, () => null);
    PLAN.ships.forEach((s, i) =>
      SECONDS.forEach((sec, j) => {
        sample(s, sec, p, q);
        this.fixed[ANCHOR.seconds + i * SECONDS.length + j] = new THREE.Vector3(p.x, this.floorY, p.z);
      }),
    );
    if (main !== null) {
      sample(PLAN.ships[0], main, a, q);
      sample(PLAN.ships[1], main, b, q);
      this.fixed[ANCHOR.cross] = new THREE.Vector3((a.x + b.x) / 2, this.floorY, (a.z + b.z) / 2);
    }
    BALLOONS.forEach((t, i) => {
      sample(PLAN.ships[i % 2], t, p, q);
      this.fixed[ANCHOR.balloons + i] = p.clone();
    });
    for (let k = 0; k < GRID.cols; k++) this.fixed[ANCHOR.cols + k] = new THREE.Vector3(this.center.x - this.half.x + cellX * (k + 0.5), this.floorY, this.center.z + this.half.z);
    for (let k = 0; k < GRID.rows; k++) this.fixed[ANCHOR.rows + k] = new THREE.Vector3(this.center.x - this.half.x, this.floorY, this.center.z - this.half.z + cellZ * (k + 0.5));

    this.group.visible = false;
    this.group.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) this.disposables.push(mesh.geometry);
      const mat = mesh.material as THREE.Material | undefined;
      if (mat) this.disposables.push(mat);
    });
  }

  private mainCrossing() {
    let best: number | null = null;
    let gap = 0.6;
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const q = new THREE.Quaternion();
    for (const t of CROSSINGS) {
      if (t < T0 || t > T1) continue;
      sample(PLAN.ships[0], t, a, q);
      sample(PLAN.ships[1], t, b, q);
      if (Math.abs(a.y - b.y) > gap) {
        gap = Math.abs(a.y - b.y);
        best = t;
      }
    }
    return best;
  }

  private around(head: number, narrow: boolean) {
    let n = 0;
    for (const dt of narrow ? [-1, -0.4, 0.2, 0.8] : [-1, -0.45, 0.1, 0.6]) {
      const t = clamp(head + dt, T0 - 0.6, T_END);
      for (let i = 0; i < 2; i++) {
        sample(PLAN.ships[i], t, this.tp, this.tq);
        for (const [dx, dz] of [
          [-2.2, -2.2],
          [2.2, 2.2],
          [-2.2, 2.2],
          [2.2, -2.2],
        ])
          this.near[n++].set(this.tp.x + dx, this.tp.y + 2, this.tp.z + dz).sub(this.center);
        this.near[n++].set(this.tp.x, this.floorY, this.tp.z).sub(this.center);
      }
    }
    return this.near;
  }

  private fit(pts: THREE.Vector3[], count: number, s: PlanState, slot: number) {
    const aspect = s.width / s.height;
    const rw = s.frame.w / s.width;
    const rh = s.frame.h / s.height;
    const rx = ((s.frame.x + s.frame.w / 2) / s.width) * 2 - 1;
    const ry = -(((s.frame.y + s.frame.h / 2) / s.height) * 2 - 1);
    const R = this.rot;
    for (let i = 0; i < count; i++) R[i].copy(pts[i]).multiplyScalar(this.scale).applyQuaternion(this.pivot.quaternion);
    let d = this.dists[slot] || SIZE * 2;
    let x0 = 0;
    let x1 = 0;
    let y0 = 0;
    let y1 = 0;
    for (let it = 0; it < 4; it++) {
      x0 = y0 = Infinity;
      x1 = y1 = -Infinity;
      for (let i = 0; i < count; i++) {
        const r = R[i];
        const k = 1 / Math.max(0.5, d - r.z);
        x0 = Math.min(x0, r.x * k);
        x1 = Math.max(x1, r.x * k);
        y0 = Math.min(y0, r.y * k);
        y1 = Math.max(y1, r.y * k);
      }
      d *= Math.max((x1 - x0) / (TAN * aspect * 2 * rw * 0.97), (y1 - y0) / (TAN * 2 * rh * 0.95));
    }
    this.dists[slot] = d;
    const out = this.fits[slot];
    out.d = d;
    out.x = rx * d * TAN * aspect - ((x0 + x1) / 2) * d;
    out.y = ry * d * TAN - ((y0 + y1) / 2) * d;
    return out;
  }

  showAll(on: boolean) {
    this.group.visible = on;
  }

  update(s: PlanState) {
    const A = this.anchors;
    const on = s.amount > 0.01 && s.frame.w > 1 && s.frame.h > 1;
    this.group.visible = on;
    A[0] = on ? s.amount : 0;
    if (!on) return;
    const head = s.reduced ? T_END : timeAt(s.p);
    A[1] = head;
    this.lines.material.uniforms.uHead.value = head;
    this.lines.material.uniforms.uAmount.value = s.amount;
    this.floor.material.uniforms.uAmount.value = s.amount;

    const k = s.reduced ? 0.5 : smooth(clamp(s.p / 0.95));
    const narrow = s.frame.w / s.frame.h < 1.5;
    this.pivot.rotation.set(narrow ? lerp(0.52, 0.44, k) : lerp(0.46, 0.34, k), narrow ? lerp(-0.4, 0.12, k) : lerp(-0.42, 0.26, k), 0);
    this.pivot.updateMatrix();
    const back = narrow ? 0 : s.reduced ? 1 : smooth(clamp((s.p - P1) / 0.12));
    const near = this.fit(this.around(head, narrow), 40, s, 0);
    let d = near.d;
    let gx = near.x;
    let gy = near.y;
    if (back > 0) {
      const all = this.fit(this.extent, this.extent.length, s, 1);
      d = lerp(d, all.d, back);
      gx = lerp(gx, all.x, back);
      gy = lerp(gy, all.y, back);
    }
    this.group.position.set(gx, gy, CAM_Z - d);

    const show = clamp((head - (T0 - 0.6)) / 0.5) * s.amount;
    PLAN.ships.forEach((ship, i) => {
      const { bank, speed } = sample(ship, head, this.pos[i], this.quat[i]);
      A[2 + i * 2] = bank;
      A[3 + i * 2] = speed;
      const c = this.crafts[i];
      c.solid.position.copy(this.pos[i]);
      c.solid.quaternion.copy(this.quat[i]);
      c.wire.position.copy(this.pos[i]);
      c.wire.quaternion.copy(this.quat[i]);
      c.solid.visible = c.wire.visible = show > 0.01;
      c.solid.material.uniforms.uAmount.value = show;
      c.wire.material.opacity = show * 0.9;
    });
    A[6] = this.pos[0].distanceTo(this.pos[1]);
    A[7] = show;

    const P = this.livePos;
    const C = this.liveCol;
    let n = 0;
    const seg = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: THREE.Color, k2: number) => {
      if (n + 2 > P.count) return;
      P.setXYZ(n, x0, y0, z0);
      C.setXYZ(n++, c.r * k2, c.g * k2, c.b * k2);
      P.setXYZ(n, x1, y1, z1);
      C.setXYZ(n++, c.r * k2, c.g * k2, c.b * k2);
    };
    const [a, b] = this.pos;
    for (let j = 0; j < 9; j++) {
      this.v.lerpVectors(a, b, j / 9);
      this.w.lerpVectors(a, b, (j + 0.55) / 9);
      seg(this.v.x, this.v.y, this.v.z, this.w.x, this.w.y, this.w.z, CREAM, 0.7);
    }
    this.pos.forEach((p, i) => {
      const c = COLORS[i];
      seg(p.x, p.y, p.z, p.x, this.floorY, p.z, c, 0.75);
      seg(p.x - 1, this.floorY, p.z, p.x + 1, this.floorY, p.z, c, 0.9);
      seg(p.x, this.floorY, p.z - 1, p.x, this.floorY, p.z + 1, c, 0.9);
      this.v.set(0, 0, -1).applyQuaternion(this.quat[i]);
      const len = A[3 + i * 2] * 0.3;
      this.w.copy(p).addScaledVector(this.v, len);
      seg(p.x, p.y, p.z, this.w.x, this.w.y, this.w.z, c, 1);
      const side = this.side.crossVectors(this.v, THREE.Object3D.DEFAULT_UP).normalize().multiplyScalar(0.45);
      const back = this.back.copy(this.v).multiplyScalar(-0.7);
      seg(this.w.x, this.w.y, this.w.z, this.w.x + back.x + side.x, this.w.y + back.y + side.y, this.w.z + back.z + side.z, c, 1);
      seg(this.w.x, this.w.y, this.w.z, this.w.x + back.x - side.x, this.w.y + back.y - side.y, this.w.z + back.z - side.z, c, 1);
    });
    this.live.geometry.setDrawRange(0, n);
    P.needsUpdate = true;
    C.needsUpdate = true;
    this.live.material.opacity = show;

    this.group.updateMatrixWorld(true);
    const M = this.content.matrixWorld;
    for (let i = 0; i < ANCHOR.count; i++) {
      let src = this.fixed[i];
      if (i === ANCHOR.live || i === ANCHOR.live + 1) src = this.side.copy(this.pos[i - ANCHOR.live]).add(this.back.set(0, i === ANCHOR.live ? 2.4 : -2.4, 0));
      else if (i === ANCHOR.sight) src = this.w.lerpVectors(a, b, 0.5);
      const o = PLAN_HEAD + i * 3;
      if (!src) {
        A[o + 2] = 0;
        continue;
      }
      this.v.copy(src).applyMatrix4(M).project(s.camera);
      A[o] = (this.v.x * 0.5 + 0.5) * s.width;
      A[o + 1] = (-this.v.y * 0.5 + 0.5) * s.height;
      A[o + 2] = this.v.z < 1 ? 1 : 0;
    }
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}
