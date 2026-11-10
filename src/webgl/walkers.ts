import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { LEG, LEGS, STEP, STRIDE, footAt, gazeAt, groundY, ik, newFoot, newKnee, newSway, smoothstep, swayAt, type Foot, type Gaze, type Knee, type Sway } from "./gait";

const HULL = 0;
const DARK = 1;
const GLASS = 2;
const TRIM = 3;
const WEAR = 4;
const CHROME = 5;

type V3 = [number, number, number];
type P2 = [number, number];

const filled = (n: number, v: number) => new THREE.Float32BufferAttribute(new Float32Array(n).fill(v), 1);

class Kit {
  private list: THREE.BufferGeometry[] = [];
  private parent = new THREE.Matrix4();
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private e = new THREE.Euler();
  private v = new THREE.Vector3();
  private one = new THREE.Vector3(1, 1, 1);
  private up = new THREE.Vector3(0, 1, 0);

  private place(g: THREE.BufferGeometry, pos: V3, rot: V3, order: THREE.EulerOrder) {
    this.m.compose(this.v.set(pos[0], pos[1], pos[2]), this.q.setFromEuler(this.e.set(rot[0], rot[1], rot[2], order)), this.one).premultiply(this.parent);
    g.applyMatrix4(this.m);
    this.list.push(g);
  }

  within(pos: V3, rot: V3, fn: () => void, order: THREE.EulerOrder = "XYZ") {
    const saved = this.parent.clone();
    this.m.compose(this.v.set(pos[0], pos[1], pos[2]), this.q.setFromEuler(this.e.set(rot[0], rot[1], rot[2], order)), this.one);
    this.parent.multiply(this.m);
    fn();
    this.parent.copy(saved);
  }

  add(geo: THREE.BufferGeometry, mat: number, pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0], order: THREE.EulerOrder = "XYZ") {
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (g !== geo) geo.dispose();
    if (g.getAttribute("uv")) g.deleteAttribute("uv");
    g.setAttribute("aMat", filled(g.getAttribute("position").count, mat));
    this.place(g, pos, rot, order);
  }

  box(w: number, h: number, d: number, mat: number, pos?: V3, rot?: V3, order?: THREE.EulerOrder) {
    this.add(new THREE.BoxGeometry(w, h, d), mat, pos, rot, order);
  }

  cylX(r: number, len: number, seg: number, mat: number, pos: V3, r1 = r) {
    this.add(new THREE.CylinderGeometry(r1, r, len, seg), mat, pos, [0, 0, Math.PI / 2]);
  }

  cylY(r: number, len: number, seg: number, mat: number, pos: V3, r1 = r) {
    this.add(new THREE.CylinderGeometry(r1, r, len, seg), mat, pos);
  }

  cylZ(r: number, len: number, seg: number, mat: number, pos: V3) {
    this.add(new THREE.CylinderGeometry(r, r, len, seg), mat, pos, [Math.PI / 2, 0, 0]);
  }

  pipe(a: V3, b: V3, r: number, mat: number, seg = 10) {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const d = new THREE.Vector3(b[0], b[1], b[2]).sub(A);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.applyQuaternion(this.q.setFromUnitVectors(this.up, d.clone().normalize()));
    const mid = A.addScaledVector(d, 0.5);
    this.add(g, mat, [mid.x, mid.y, mid.z]);
  }

  bolts(c: V3, axis: "x" | "y" | "z", radius: number, count: number, r: number, h: number, mat: number) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const u = Math.cos(a) * radius;
      const w = Math.sin(a) * radius;
      if (axis === "z") this.cylZ(r, h, 6, mat, [c[0] + u, c[1] + w, c[2]]);
      else if (axis === "x") this.cylX(r, h, 6, mat, [c[0], c[1] + u, c[2] + w]);
      else this.cylY(r, h, 6, mat, [c[0] + u, c[1], c[2] + w]);
    }
  }

  vent(w: number, h: number, n: number) {
    this.box(w, h, 0.1, DARK, [0, 0, -0.02]);
    this.box(w + 0.16, 0.08, 0.16, TRIM, [0, h / 2 + 0.04, 0]);
    this.box(w + 0.16, 0.08, 0.16, TRIM, [0, -h / 2 - 0.04, 0]);
    this.box(0.08, h, 0.16, TRIM, [w / 2 + 0.04, 0, 0]);
    this.box(0.08, h, 0.16, TRIM, [-w / 2 - 0.04, 0, 0]);
    for (let i = 0; i < n; i++) this.box(w - 0.02, 0.05, 0.16, WEAR, [0, -h / 2 + (i + 0.5) * (h / n), 0.03], [0.55, 0, 0]);
  }

  loft(axis: "x" | "y", sections: { at: number; pts: P2[] }[], mat: number, edge = -1, ends = false, pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0]) {
    const P = (at: number, p: P2) => (axis === "x" ? new THREE.Vector3(at, p[1], p[0]) : new THREE.Vector3(p[0], at, p[1]));
    const rings = sections.map((s) => s.pts.map((p) => P(s.at, p)));
    const all = new THREE.Vector3();
    let count = 0;
    for (const r of rings) {
      for (const p of r) {
        all.add(p);
        count++;
      }
    }
    all.divideScalar(count);
    const pos3: number[] = [];
    const mats: number[] = [];
    const ab = new THREE.Vector3();
    const ac = new THREE.Vector3();
    const mid = new THREE.Vector3();
    const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, hint: THREE.Vector3, m: number) => {
      ab.subVectors(b, a);
      ac.subVectors(c, a);
      const n = ab.cross(ac);
      if (n.lengthSq() < 1e-12) return;
      mid.copy(a).add(b).add(c).divideScalar(3).sub(hint);
      const [p, q] = n.dot(mid) < 0 ? [c, b] : [b, c];
      pos3.push(a.x, a.y, a.z, p.x, p.y, p.z, q.x, q.y, q.z);
      mats.push(m, m, m);
    };
    const centroid = (r: THREE.Vector3[]) => r.reduce((s, p) => s.add(p), new THREE.Vector3()).divideScalar(r.length);
    for (let i = 0; i < rings.length - 1; i++) {
      const r0 = rings[i];
      const r1 = rings[i + 1];
      const hint = centroid(r0).add(centroid(r1)).multiplyScalar(0.5);
      for (let j = 0; j < r0.length; j++) {
        const k = (j + 1) % r0.length;
        const m = edge >= 0 && ((ends && (i === 0 || i === rings.length - 2)) || j % 2 === 0) ? edge : mat;
        tri(r0[j], r0[k], r1[k], hint, m);
        tri(r0[j], r1[k], r1[j], hint, m);
      }
    }
    for (const r of [rings[0], rings[rings.length - 1]]) {
      const c = centroid(r);
      for (let j = 0; j < r.length; j++) tri(c, r[j], r[(j + 1) % r.length], all, mat);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos3, 3));
    geo.setAttribute("aMat", new THREE.Float32BufferAttribute(mats, 1));
    geo.computeVertexNormals();
    this.place(geo, pos, rot, "XYZ");
  }

  slab(w: number, h: number, d: number, c: number, mat: number, pos: V3, rot: V3 = [0, 0, 0], edge = WEAR) {
    const inner = oct(d / 2 - c, h / 2 - c, 0.002);
    const outer = oct(d / 2, h / 2, c);
    this.loft("x", [
      { at: -w / 2, pts: inner },
      { at: -w / 2 + c, pts: outer },
      { at: w / 2 - c, pts: outer },
      { at: w / 2, pts: inner },
    ], mat, edge, true, pos, rot);
  }

  build() {
    const g = mergeGeometries(this.list)!;
    this.list.forEach((x) => x.dispose());
    this.list = [];
    g.computeBoundingSphere();
    return g;
  }
}

const oct = (hx: number, hz: number, c: number): P2[] => [
  [hx - c, hz],
  [hx, hz - c],
  [hx, -(hz - c)],
  [hx - c, -hz],
  [-(hx - c), -hz],
  [-hx, -(hz - c)],
  [-hx, hz - c],
  [-(hx - c), hz],
];

const hullSection = (w: number, top: number, cut: number, low: number, lowW: number, bottom: number): P2[] => [
  [w - cut, top],
  [w, top - cut],
  [w, low],
  [lowW, bottom],
  [-lowW, bottom],
  [-w, low],
  [-w, top - cut],
  [-(w - cut), top],
];

const headSection = (hw: number, yb: number, yt: number): P2[] => [
  [hw * 0.62, yt],
  [hw, yt - 0.45],
  [hw, yb + 0.55],
  [hw * 0.72, yb],
  [-hw * 0.72, yb],
  [-hw, yb + 0.55],
  [-hw, yt - 0.45],
  [-hw * 0.62, yt],
];

export const NECK: V3 = [6.95, 2.75, 0];
export const HEAD_OFFSET: V3 = [2.35, -0.3, 0];
const THIGH_PIN: V3 = [-1.15, -1.0, 0];
const SHIN_PIN: V3 = [-0.85, -1.6, 0];

function bodyGeometry() {
  const k = new Kit();
  const main = hullSection(3.05, 5.8, 0.6, 1.55, 2.05, -0.6);
  const end = hullSection(2.8, 5.4, 0.75, 1.6, 1.85, -0.35);
  k.loft("x", [
    { at: -6.85, pts: end },
    { at: -6.3, pts: main },
    { at: 6.25, pts: main },
    { at: 6.85, pts: end },
  ], TRIM);
  for (const s of [-1, 1]) {
    const z = s * 3.2;
    k.slab(3.3, 3.0, 0.3, 0.09, HULL, [4.25, 3.3, z]);
    k.slab(3.6, 3.0, 0.3, 0.09, HULL, [0.05, 3.3, z]);
    k.slab(3.4, 3.0, 0.3, 0.09, HULL, [-4.2, 3.3, z]);
    for (const x of [6.05, 2.25, -2.05, -6.0]) k.box(0.2, 3.2, 0.34, DARK, [x, 3.3, s * 3.12]);
    k.slab(2.2, 2.4, 0.12, 0.04, TRIM, [0.05, 3.2, s * 3.38]);
    for (const x of [-0.5, 0.6]) k.box(0.06, 2.2, 0.06, DARK, [x, 3.2, s * 3.45]);
    k.box(1.7, 0.06, 0.06, DARK, [0.05, 4.0, s * 3.45]);
    for (const y of [2.45, 3.95]) k.cylY(0.08, 0.36, 8, CHROME, [-1.0, y, s * 3.42]);
    k.box(0.5, 0.12, 0.1, DARK, [0.65, 3.0, s * 3.47]);
    k.slab(12.7, 0.5, 0.36, 0.1, HULL, [0, 5.0, s * 3.1]);
    k.slab(12.5, 0.3, 0.3, 0.08, TRIM, [0, 1.66, s * 3.1]);
    k.pipe([-6.1, 1.28, s * 3.08], [6.1, 1.28, s * 3.08], 0.1, DARK);
    k.pipe([-5.7, 1.05, s * 3.0], [5.7, 1.05, s * 3.0], 0.07, CHROME);
    for (let i = 0; i < 7; i++) k.box(0.16, 0.42, 0.3, TRIM, [-5.4 + i * 1.8, 1.17, s * 3.05]);
    for (let i = 0; i < 5; i++) k.within([-4.4 + i * 2.2, 0.47, s * 2.62], [s * 0.435, s > 0 ? 0 : Math.PI, 0], () => k.vent(1.5, 0.62, 4));
    for (const fore of [-1, 1]) {
      const hx = fore * LEG.hipX;
      k.box(2.2, 2.0, 1.4, DARK, [hx, 0.2, s * 2.7]);
      k.cylZ(1.55, 0.36, 28, TRIM, [hx, 0, s * 3.22]);
      k.cylZ(1.46, 0.14, 28, WEAR, [hx, 0, s * 3.44]);
      k.cylZ(1.32, 0.18, 28, HULL, [hx, 0, s * 3.55]);
      k.bolts([hx, 0, s * 3.65], "z", 1.24, 10, 0.07, 0.08, CHROME);
      k.pipe([hx - fore * 2.0, 1.45, s * 3.0], [hx - fore * 0.7, 0.35, s * 3.08], 0.15, DARK);
      k.pipe([hx - fore * 1.9, 1.5, s * 3.0], [hx - fore * 1.15, 0.85, s * 3.08], 0.08, CHROME);
    }
    k.slab(0.8, 2.6, 0.35, 0.08, HULL, [6.55, 3.0, s * 2.6], [0, s * 0.35, 0]);
  }
  for (let i = 0; i < 5; i++) k.slab(2.0, 0.3, 2.6, 0.07, HULL, [-4.6 + i * 2.2, 5.95, 0]);
  for (const z of [-1.8, 1.8]) k.slab(12.2, 0.22, 0.6, 0.06, TRIM, [-0.2, 5.9, z]);
  for (const x of [2.0, -2.4]) {
    k.cylY(0.62, 0.14, 20, TRIM, [x, 6.16, 0]);
    k.cylY(0.52, 0.2, 20, HULL, [x, 6.22, 0]);
    k.box(0.5, 0.08, 0.1, CHROME, [x, 6.36, 0]);
  }
  k.within([-0.2, 6.12, 0], [-Math.PI / 2, 0, 0], () => k.vent(1.5, 1.2, 6));
  k.within([4.2, 6.12, 0], [-Math.PI / 2, 0, 0], () => k.vent(1.5, 1.4, 6));
  k.slab(0.9, 0.5, 0.9, 0.08, TRIM, [4.7, 6.35, -1.6]);
  k.cylY(0.05, 1.4, 6, DARK, [4.95, 7.2, -1.6]);
  k.slab(0.5, 1.1, 4.8, 0.12, HULL, [6.62, 5.0, 0], [0, 0, -0.55]);
  k.cylX(1.9, 0.3, 32, TRIM, [6.88, NECK[1], 0]);
  k.cylX(1.74, 0.18, 32, WEAR, [7.04, NECK[1], 0]);
  k.cylX(1.48, 0.5, 28, DARK, [7.15, NECK[1], 0]);
  k.bolts([7.1, NECK[1], 0], "x", 1.62, 12, 0.07, 0.06, CHROME);
  k.slab(0.35, 0.7, 3.4, 0.08, HULL, [6.86, 0.55, 0]);
  k.slab(0.4, 3.6, 5.0, 0.1, HULL, [-6.98, 3.35, 0], [0, 0, 0.16]);
  k.within([-7.24, 3.3, 0], [0, -Math.PI / 2, 0], () => k.vent(3.4, 1.9, 7));
  for (const s of [-1, 1]) {
    k.cylX(0.45, 0.5, 16, DARK, [-7.05, 0.45, s * 1.45]);
    k.cylX(0.52, 0.1, 16, WEAR, [-7.3, 0.45, s * 1.45]);
  }
  k.slab(7.6, 0.5, 2.4, 0.1, DARK, [0, -0.85, 0]);
  for (const z of [-0.85, 0.85]) k.pipe([-4.4, -1.15, z], [4.4, -1.15, z], 0.13, CHROME);
  for (const x of [-2.6, 0, 2.6]) k.slab(1.2, 0.5, 1.6, 0.08, TRIM, [x, -1.15, 0]);
  return k.build();
}

function headGeometry() {
  const k = new Kit();
  k.loft("x", [
    { at: 0, pts: headSection(1.55, -1.5, 1.35) },
    { at: 0.35, pts: headSection(1.75, -1.7, 1.55) },
    { at: 3.2, pts: headSection(1.8, -1.75, 1.3) },
    { at: 4.55, pts: headSection(1.55, -1.55, 0.75) },
    { at: 5.25, pts: headSection(1.25, -1.15, 0.35) },
  ], HULL);
  k.cylX(1.15, 0.45, 24, DARK, [-0.1, 0, 0]);
  k.cylX(1.28, 0.14, 24, WEAR, [0.08, 0, 0]);
  k.slab(1.0, 0.24, 2.6, 0.06, HULL, [4.55, 0.86, 0], [0, 0, -0.52]);
  k.slab(2.4, 0.22, 2.4, 0.06, TRIM, [1.9, 1.62, 0]);
  k.box(0.06, 0.44, 2.0, DARK, [5.27, 0.02, 0]);
  for (const s of [-1, 1]) {
    k.box(0.06, 0.2, 0.52, GLASS, [5.31, 0.03, s * 0.45]);
    k.box(0.07, 0.3, 0.64, TRIM, [5.29, 0.03, s * 0.45]);
  }
  k.slab(0.24, 0.78, 2.1, 0.06, HULL, [5.2, -0.66, 0]);
  for (const s of [-1, 1]) {
    k.slab(2.6, 1.5, 0.18, 0.06, HULL, [2.5, -0.55, s * 1.86]);
    k.slab(2.9, 0.7, 0.16, 0.05, TRIM, [1.9, 0.75, s * 1.8]);
    k.within([0.72, -0.45, s * 1.8], [0, s > 0 ? 0 : Math.PI, 0], () => k.vent(0.85, 0.8, 4));
    k.cylX(0.32, 1.2, 16, HULL, [5.0, -1.3, s * 0.62]);
    for (let i = 0; i < 4; i++) k.cylX(0.21, 0.08, 12, TRIM, [5.85 + i * 0.28, -1.3, s * 0.62]);
    k.cylX(0.13, 2.6, 10, DARK, [6.85, -1.3, s * 0.62]);
    k.cylX(0.2, 0.36, 10, DARK, [8.0, -1.3, s * 0.62]);
    k.cylX(0.16, 0.08, 10, WEAR, [8.2, -1.3, s * 0.62]);
    k.box(0.5, 0.3, 0.4, DARK, [4.2, -0.2, s * 1.72]);
    k.slab(1.1, 0.55, 0.5, 0.06, HULL, [4.2, -0.2, s * 2.0]);
    k.cylX(0.09, 1.7, 8, DARK, [5.55, -0.2, s * 2.0]);
    k.cylX(0.13, 0.12, 8, TRIM, [4.85, -0.2, s * 2.0]);
  }
  k.cylY(0.48, 0.12, 16, TRIM, [1.0, 1.75, 0]);
  k.cylY(0.4, 0.16, 16, HULL, [1.0, 1.8, 0]);
  k.slab(0.7, 0.32, 0.5, 0.06, TRIM, [3.0, 1.5, 0.62]);
  k.cylY(0.04, 0.9, 6, DARK, [3.2, 1.95, 0.62]);
  k.slab(2.6, 0.3, 1.8, 0.06, DARK, [2.0, -1.85, 0]);
  return k.build();
}

function ringGeometry() {
  const k = new Kit();
  k.cylX(1.06, 0.3, 24, HULL, [0, 0, 0]);
  for (const x of [-0.16, 0.16]) k.cylX(1.1, 0.05, 24, WEAR, [x, 0, 0]);
  k.cylX(0.86, 0.62, 18, DARK, [0, 0, 0]);
  for (const s of [-1, 1]) {
    k.cylX(0.12, 0.5, 8, DARK, [0, -0.55, s * 1.12]);
    k.cylX(0.08, 0.5, 8, CHROME, [0, 0.55, s * 1.08]);
  }
  return k.build();
}

function thighGeometry() {
  const k = new Kit();
  k.cylZ(1.15, 0.95, 28, HULL, [0, 0, 0]);
  for (const s of [-1, 1]) {
    k.cylZ(1.02, 0.06, 28, WEAR, [0, 0, s * 0.5]);
    k.cylZ(0.62, 0.14, 20, DARK, [0, 0, s * 0.55]);
    k.cylZ(0.3, 0.1, 12, CHROME, [0, 0, s * 0.64]);
    k.bolts([0, 0, s * 0.53], "z", 0.84, 8, 0.07, 0.07, TRIM);
    k.slab(1.25, 2.9, 0.12, 0.04, TRIM, [0, -2.5, s * 0.5]);
  }
  k.loft("y", [
    { at: -0.5, pts: oct(0.9, 0.46, 0.18) },
    { at: -4.4, pts: oct(0.72, 0.44, 0.16) },
  ], HULL, WEAR);
  k.slab(0.24, 3.3, 1.0, 0.07, HULL, [0.86, -2.45, 0], [0, 0, 0.046]);
  k.box(0.3, 3.4, 0.4, DARK, [-0.88, -2.4, 0]);
  k.box(0.42, 0.52, 0.62, DARK, [-0.98, -1.0, 0]);
  k.cylZ(0.95, 1.05, 24, DARK, [0, -LEG.thigh, 0]);
  for (const s of [-1, 1]) k.cylZ(0.98, 0.05, 24, WEAR, [0, -LEG.thigh, s * 0.53]);
  return k.build();
}

function shinGeometry() {
  const k = new Kit();
  k.cylZ(1.02, 0.8, 28, HULL, [0, 0, 0]);
  for (const s of [-1, 1]) {
    k.cylZ(1.06, 0.05, 28, WEAR, [0, 0, s * 0.4]);
    k.cylZ(0.5, 0.1, 16, DARK, [0, 0, s * 0.44]);
    k.bolts([0, 0, s * 0.42], "z", 0.75, 6, 0.06, 0.06, CHROME);
  }
  k.slab(0.6, 1.9, 1.05, 0.08, HULL, [0.72, -0.35, 0], [0, 0, -0.12]);
  k.loft("y", [
    { at: -0.7, pts: oct(0.7, 0.5, 0.17) },
    { at: -7.6, pts: oct(0.55, 0.42, 0.14) },
  ], HULL, WEAR);
  for (const y of [-2.3, -3.8, -5.3, -6.6]) {
    const t = (-0.7 - y) / 6.9;
    const hx = 0.75 - 0.15 * t;
    const hz = 0.55 - 0.08 * t;
    k.loft("y", [
      { at: y + 0.11, pts: oct(hx, hz, 0.15) },
      { at: y - 0.11, pts: oct(hx, hz, 0.15) },
    ], TRIM, WEAR);
  }
  for (const s of [-1, 1]) k.box(0.1, 6.0, 0.12, TRIM, [0.66, -4.2, s * 0.24], [0, 0, 0.012]);
  k.cylY(0.22, 4.4, 12, DARK, [-0.72, -3.4, 0]);
  k.cylY(0.1, 1.8, 10, CHROME, [-0.72, -6.4, 0]);
  k.cylY(0.26, 0.2, 12, WEAR, [-0.72, -5.6, 0]);
  k.box(0.36, 0.5, 0.44, DARK, [-0.82, -1.6, 0]);
  k.box(0.36, 0.4, 0.44, DARK, [-0.7, -7.3, 0]);
  k.cylY(0.62, 0.5, 20, DARK, [0, -7.8, 0]);
  k.cylY(0.66, 0.08, 20, WEAR, [0, -7.58, 0]);
  for (const s of [-1, 1]) k.slab(0.7, 1.0, 0.22, 0.05, DARK, [0, -8.35, s * 0.5]);
  return k.build();
}

function footGeometry() {
  const k = new Kit();
  k.cylZ(0.5, 1.25, 16, DARK, [0, 0, 0]);
  for (const s of [-1, 1]) k.cylZ(0.54, 0.06, 16, WEAR, [0, 0, s * 0.62]);
  k.slab(0.8, 0.9, 0.72, 0.06, HULL, [0, -0.45, 0]);
  k.cylY(1.85, 0.6, 12, HULL, [0, -1.0, 0], 1.15);
  k.cylY(1.9, 0.1, 24, WEAR, [0, -1.33, 0]);
  k.cylY(1.95, 0.24, 24, DARK, [0, -1.43, 0]);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    k.within([Math.cos(a) * 1.62, -1.12, Math.sin(a) * 1.62], [0, -a, -0.708], () => k.slab(1.05, 0.34, 0.95, 0.07, HULL, [0, 0, 0]), "YZX");
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    k.box(0.7, 0.14, 0.16, TRIM, [Math.cos(a) * 1.42, -0.88, Math.sin(a) * 1.42], [0, -a, -0.708], "YZX");
  }
  return k.build();
}

function rodGeometry() {
  const k = new Kit();
  k.cylY(0.12, 2.6, 12, CHROME, [0, 1.3, 0]);
  k.cylY(0.16, 0.12, 12, WEAR, [0, 0.06, 0]);
  return k.build();
}

function sleeveGeometry() {
  const k = new Kit();
  k.cylY(0.23, 3.3, 14, DARK, [0, 1.65, 0]);
  k.cylY(0.28, 0.3, 14, TRIM, [0, 0.15, 0]);
  k.cylY(0.26, 0.08, 14, WEAR, [0, 3.26, 0]);
  return k.build();
}

function rockGeometry() {
  const g = new THREE.IcosahedronGeometry(1, 1).toNonIndexed();
  const p = g.getAttribute("position");
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = Math.sin(v.x * 3.1 + 1.3) * Math.sin(v.y * 2.7 + 0.4) * Math.sin(v.z * 3.7 + 2.2);
    v.multiplyScalar(0.82 + 0.3 * n);
    v.y = Math.max(v.y, -0.3) * 0.72;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.deleteAttribute("uv");
  g.deleteAttribute("normal");
  g.computeVertexNormals();
  return g;
}

function noiseTexture(size = 256) {
  const data = new Uint8Array(size * size * 4);
  const lattice = (f: number, seed: number) => {
    const g = new Float32Array(f * f);
    let s = seed;
    for (let i = 0; i < g.length; i++) g[i] = (s = (s * 16807) % 2147483647) / 2147483647;
    return g;
  };
  const sets = [
    { seed: 11, freqs: [4, 8, 16, 32, 64] },
    { seed: 977, freqs: [4, 8, 16, 32, 64] },
    { seed: 4127, freqs: [16, 32, 64, 128] },
  ].map(({ seed, freqs }) => freqs.map((f, i) => ({ f, g: lattice(f, seed + i * 131), a: Math.pow(0.5, i) })));
  const channels = sets.map(() => new Float32Array(size * size));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      sets.forEach((oct, c) => {
        let sum = 0;
        for (const { f, g, a } of oct) {
          const fx = u * f;
          const fy = v * f;
          const ix = Math.floor(fx);
          const iy = Math.floor(fy);
          const tx = fx - ix;
          const ty = fy - iy;
          const sx = tx * tx * (3 - 2 * tx);
          const sy = ty * ty * (3 - 2 * ty);
          const i0 = ix % f;
          const i1 = (ix + 1) % f;
          const j0 = iy % f;
          const j1 = (iy + 1) % f;
          const A = g[j0 * f + i0];
          const B = g[j0 * f + i1];
          const C = g[j1 * f + i0];
          const D = g[j1 * f + i1];
          sum += a * (A + (B - A) * sx + (C - A) * sy + (A - B - C + D) * sx * sy);
        }
        channels[c][y * size + x] = sum;
      });
    }
  }
  channels.forEach((ch, c) => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const v of ch) {
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
    for (let i = 0; i < ch.length; i++) data[i * 4 + c] = Math.round(((ch[i] - lo) / (hi - lo)) * 255);
  });
  for (let i = 0; i < size * size; i++) data[i * 4 + 3] = 255;
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}

const MIST = `
  uniform sampler2D uNoise;
  uniform vec3 uCam;
  uniform vec4 uFog;
  uniform vec4 uFog2;
  uniform vec3 uSunDir;
  uniform vec3 uHaze;
  uniform vec3 uGlow;
  uniform vec4 uVeil;
  float mistPatch(vec2 xz) {
    vec2 q = xz * 0.0055 + uFog2.zw;
    float n = texture2D(uNoise, q).r * 0.62 + texture2D(uNoise, q * 2.3 + 0.41).g * 0.38;
    return uFog2.x + uFog2.y * smoothstep(0.3, 0.8, n);
  }
  float slab(float y0, float ry, float seg, float H) {
    float x = ry * seg / H;
    float f = abs(x) < 0.001 ? 1.0 - 0.5 * x : (1.0 - exp(-x)) / x;
    return exp(-y0 / H) * seg * f;
  }
  float mistDepth(vec3 ro, vec3 rd, float L) {
    float seg = L / 5.0;
    float tau = 0.0;
    for (int k = 0; k < 5; k++) {
      float s0 = seg * float(k);
      float y0 = ro.y + rd.y * s0;
      vec3 mid = ro + rd * (s0 + seg * 0.5);
      tau += uFog.x * slab(y0, rd.y, seg, uFog.y) * mistPatch(mid.xz) * smoothstep(14.0, 75.0, s0 + seg * 0.5) + uFog.z * slab(y0, rd.y, seg, uFog.w);
    }
    return tau;
  }
  vec3 mistColor(vec3 rd) {
    float s = max(dot(rd, uSunDir), 0.0);
    return mix(uHaze, uGlow, min(1.0, pow(s, 14.0) * 0.7 + pow(s, 90.0) * 0.5));
  }
  vec3 mistApply(vec3 col, vec3 wpos, float extra) {
    vec3 d = wpos - uCam;
    float L = length(d);
    vec3 rd = d / max(L, 0.001);
    float T = exp(-mistDepth(uCam, rd, L) - extra);
    col = mix(mistColor(rd), col, T);
    return mix(col, uVeil.rgb, 1.0 - exp(-uVeil.a * L));
  }
`;

const lin = (hex: string) => new THREE.Color(hex);
const srgb = (hex: string) => {
  const c = new THREE.Color(hex);
  c.convertLinearToSRGB();
  return new THREE.Vector3(c.r, c.g, c.b);
};

type Uniforms = Record<string, THREE.IUniform>;

const RELIEF = `
  uniform vec3 uSunView;
  uniform vec3 uRim;
  vec3 relief(vec3 n, float h) {
    vec3 dpx = dFdx(-vViewPosition);
    vec3 dpy = dFdy(-vViewPosition);
    vec3 r1 = cross(dpy, n);
    vec3 r2 = cross(n, dpx);
    float det = dot(dpx, r1);
    vec3 g = sign(det) * (dFdx(h) * r1 + dFdy(h) * r2);
    return normalize(abs(det) * n - g);
  }
  vec3 rimLight(vec3 n) {
    float ndv = clamp(dot(n, normalize(vViewPosition)), 0.0, 1.0);
    return uRim * pow(1.0 - ndv, 3.0) * smoothstep(-0.25, 0.75, dot(n, uSunView));
  }
`;

function walkerMaterial(shared: Uniforms) {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.1, fog: false });
  const own: Uniforms = {
    uHull: { value: lin("#97958f") },
    uTrim: { value: lin("#7b7a75") },
    uDark: { value: lin("#2d2c2b") },
    uWear: { value: lin("#c2beb4") },
    uMud: { value: lin("#4f4a41") },
    uEye: { value: new THREE.Color(2.6, 0.95, 0.26) },
  };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, shared, own);
    sh.vertexShader = sh.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        attribute float aMat;
        attribute float aFade;
        varying float vMat;
        varying float vFade;
        varying vec3 vObj;
        varying vec3 vObjN;
        varying vec3 vW;`,
      )
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvMat = aMat;\nvObj = position;\nvObjN = normal;")
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 wq = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
        wq = instanceMatrix * wq;
        #endif
        vW = wq.xyz;
        vFade = aFade;`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        ${MIST}
        ${RELIEF}
        uniform vec3 uHull;
        uniform vec3 uTrim;
        uniform vec3 uDark;
        uniform vec3 uWear;
        uniform vec3 uMud;
        uniform vec3 uEye;
        varying float vMat;
        varying float vFade;
        varying vec3 vObj;
        varying vec3 vObjN;
        varying vec3 vW;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        vec3 an = abs(vObjN);
        vec2 pq = an.x > an.y && an.x > an.z ? vObj.zy : (an.y > an.z ? vObj.xz : vObj.xy);
        float grime = texture2D(uNoise, pq * 0.075 + vMat * 0.13).r;
        float fine = texture2D(uNoise, pq * 0.31).b;
        float dent = texture2D(uNoise, pq * 0.9 + 0.17).b;
        float streak = texture2D(uNoise, vec2(pq.x * 0.55, pq.y * 0.025)).g;
        vec3 base;
        float rough;
        float metal;
        float plated;
        if (vMat < 0.5) { base = uHull; rough = 0.6; metal = 0.18; plated = 1.0; }
        else if (vMat < 1.5) { base = uDark; rough = 0.48; metal = 0.55; plated = 0.0; }
        else if (vMat < 2.5) { base = vec3(0.02); rough = 0.1; metal = 0.3; plated = 0.0; }
        else if (vMat < 3.5) { base = uTrim; rough = 0.66; metal = 0.18; plated = 1.0; }
        else if (vMat < 4.5) { base = uWear; rough = 0.32; metal = 0.62; plated = 0.0; }
        else { base = vec3(0.72); rough = 0.16; metal = 0.95; plated = 0.0; }
        float row = floor(pq.y / 1.9);
        float off = fract(sin(row * 12.9898 + vMat * 3.1) * 43758.5453) * 2.8;
        float wide = 2.2 + 1.6 * fract(sin(row * 78.233) * 12543.17);
        vec2 fc = abs(fract(vec2((pq.x + off) / wide, pq.y / 1.9)) - 0.5);
        float dl = min((0.5 - fc.x) * wide, (0.5 - fc.y) * 1.9);
        float line = (1.0 - smoothstep(0.014, 0.024 + fwidth(dl) * 1.5, dl)) * plated;
        float chip = smoothstep(0.76, 0.86, dent * 0.6 + grime * 0.4) * plated;
        base *= 0.84 + 0.32 * grime;
        base *= 1.0 - 0.1 * fine;
        base *= 1.0 - line * 0.3;
        base *= 1.0 - smoothstep(0.58, 0.9, streak) * 0.24 * (1.0 - an.y) * plated;
        base = mix(base, uWear * 0.85, chip * 0.55);
        float mud = smoothstep(4.5, 0.2, vW.y);
        base = mix(base, uMud, mud * 0.75 * (0.6 + 0.4 * grime));
        base *= mix(1.0, 0.68, smoothstep(-0.3, -0.95, vObjN.y));
        diffuseColor.rgb = base;
        float bump = (fine * 0.03 + dent * 0.018) * (0.35 + 0.65 * plated) - line * 0.035 - chip * 0.01;`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        "float roughnessFactor = clamp(rough + (grime - 0.5) * 0.2 + mud * 0.15 - chip * 0.18, 0.05, 1.0);",
      )
      .replace("#include <metalnessmap_fragment>", "float metalnessFactor = clamp(metal + chip * 0.35, 0.0, 1.0);")
      .replace("#include <normal_fragment_maps>", "#include <normal_fragment_maps>\nnormal = relief(normal, bump);")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\nif (vMat > 1.5 && vMat < 2.5) totalEmissiveRadiance += uEye;")
      .replace("#include <opaque_fragment>", "outgoingLight += rimLight(normal) * (1.0 - mud * 0.6);\n#include <opaque_fragment>")
      .replace("#include <fog_fragment>", "gl_FragColor.rgb = mistApply(gl_FragColor.rgb, vW, (1.0 - vFade) * 7.0);");
  };
  m.customProgramCacheKey = () => "odd-walker-2";
  return m;
}

function groundMaterial(shared: Uniforms) {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0, fog: false });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, shared);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vW;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvW = transformed;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>\n${MIST}\n${RELIEF}\nvarying vec3 vW;`)
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        vec2 gq = vW.xz;
        float big = texture2D(uNoise, gq * 0.0045).r;
        float mid = texture2D(uNoise, gq * 0.021 + 0.3).g;
        float fine = texture2D(uNoise, gq * 0.11).b;
        float grit = texture2D(uNoise, gq * 0.47 + 0.13).b;
        float frost = smoothstep(0.42, 0.7, big * 0.65 + mid * 0.35);
        float wet = smoothstep(0.64, 0.72, texture2D(uNoise, gq * 0.0085 + 0.71).g) * (1.0 - frost);
        float tuft = smoothstep(0.5, 0.78, texture2D(uNoise, gq * 0.06 + 0.52).r * 0.6 + grit * 0.4) * (1.0 - wet) * (1.0 - frost * 0.7);
        float speck = smoothstep(0.8, 0.9, texture2D(uNoise, gq * 1.3 + 0.7).b);
        vec3 earth = mix(vec3(0.018, 0.02, 0.024), vec3(0.045, 0.043, 0.04), mid);
        vec3 gc = mix(earth, vec3(0.2, 0.23, 0.28), frost * (0.5 + 0.5 * fine));
        gc = mix(gc, vec3(0.075, 0.068, 0.045) * (0.7 + 0.6 * grit), tuft * 0.8);
        gc *= 0.8 + 0.4 * fine;
        gc *= 1.0 - speck * 0.45;
        gc = mix(gc, vec3(0.012, 0.015, 0.02), wet);
        diffuseColor.rgb = gc;
        float bump = big * 0.5 + mid * 0.22 + fine * 0.07 + grit * 0.025 + tuft * 0.05 - wet * 0.06;`,
      )
      .replace("#include <roughnessmap_fragment>", "float roughnessFactor = mix(mix(0.93, 0.6, frost), 0.05, wet);")
      .replace("#include <normal_fragment_maps>", "#include <normal_fragment_maps>\nnormal = relief(normal, bump);")
      .replace("#include <fog_fragment>", "gl_FragColor.rgb = mistApply(gl_FragColor.rgb, vW, 0.0);");
  };
  m.customProgramCacheKey = () => "odd-ground-2";
  return m;
}

function rockMaterial(shared: Uniforms, own: Uniforms) {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.88, metalness: 0, fog: false, flatShading: true });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, shared, own);
    sh.vertexShader = sh.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        attribute vec3 aRock;
        uniform float uQuake;
        uniform float uTime;
        varying vec3 vW;
        varying vec3 vObj;
        varying float vUp;
        varying float vSeed;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        float hop = uQuake * 0.06 * max(0.0, sin(uTime * 37.0 + aRock.y * 41.0)) * (1.0 - smoothstep(0.25, 1.4, aRock.z));
        transformed.y += hop / max(aRock.x, 0.05);
        vObj = position;
        vSeed = aRock.y;`,
      )
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 wq = instanceMatrix * vec4(transformed, 1.0);
        vW = wq.xyz;
        vUp = normalize(mat3(instanceMatrix) * normal).y;`,
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        ${MIST}
        ${RELIEF}
        varying vec3 vW;
        varying vec3 vObj;
        varying float vUp;
        varying float vSeed;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float rn = texture2D(uNoise, vObj.xz * 0.35 + vObj.y * 0.2 + vSeed).r;
        float rf = texture2D(uNoise, vObj.xy * 1.1 + vSeed * 3.0).b;
        vec3 rc = mix(vec3(0.035, 0.034, 0.033), vec3(0.085, 0.08, 0.072), rn) * (0.8 + 0.4 * rf);
        float rime = smoothstep(0.45, 0.85, vUp) * smoothstep(0.35, 0.65, rn + rf * 0.3);
        rc = mix(rc, vec3(0.3, 0.34, 0.4), rime * 0.85);
        diffuseColor.rgb = rc;
        float bump = rf * 0.04 + rn * 0.03;`,
      )
      .replace("#include <roughnessmap_fragment>", "float roughnessFactor = mix(0.9, 0.62, rime);")
      .replace("#include <normal_fragment_maps>", "#include <normal_fragment_maps>\nnormal = relief(normal, bump);")
      .replace("#include <opaque_fragment>", "outgoingLight += rimLight(normal) * 0.5;\n#include <opaque_fragment>")
      .replace("#include <fog_fragment>", "gl_FragColor.rgb = mistApply(gl_FragColor.rgb, vW, 0.0);");
  };
  m.customProgramCacheKey = () => "odd-rock-1";
  return m;
}

const QUAD_VERT = "varying vec2 vNdc; void main() { vNdc = position.xy; gl_Position = vec4(position.xy, 1.0, 1.0); }";

const VIEW = `
  uniform float uTan;
  uniform float uAspect;
  uniform float uTilt;
  vec3 viewDir(vec2 ndc) {
    vec3 d = normalize(vec3(ndc.x * uTan * uAspect, ndc.y * uTan, -1.0));
    float c = cos(uTilt);
    float s = sin(uTilt);
    return vec3(d.x, d.y * c - d.z * s, d.y * s + d.z * c);
  }
`;

const SKY_FRAG = `
  ${MIST}
  ${VIEW}
  uniform vec3 uZenith;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uSunCol;
  uniform vec3 uRidge;
  uniform float uTime;
  uniform float uAlpha;
  varying vec2 vNdc;
  void main() {
    vec3 rd = viewDir(vNdc);
    float e = rd.y;
    vec3 col = mix(uHorizon, uMid, smoothstep(-0.02, 0.14, e));
    col = mix(col, uZenith, smoothstep(0.08, 0.42, e));
    float sd = max(dot(rd, uSunDir), 0.0);
    float side = max(dot(normalize(rd.xz + 1e-5), normalize(uSunDir.xz)), 0.0);
    col += vec3(0.7, 0.36, 0.14) * pow(side, 6.0) * exp(-max(e, 0.0) * 18.0) * 0.32;
    if (e > 0.012) {
      vec2 cp = rd.xz / e * 0.38 + vec2(uTime * 0.0032, uTime * 0.0011);
      float c1 = texture2D(uNoise, cp * 0.55).r;
      float c2 = texture2D(uNoise, cp * 1.6 + c1 * 0.3).g;
      float dens = smoothstep(0.6, 0.9, c1 * 0.68 + c2 * 0.32) * smoothstep(0.012, 0.16, e) * (1.0 - smoothstep(0.5, 0.9, e) * 0.6);
      float edge = 1.0 - smoothstep(0.0, 0.55, dens);
      vec3 cloud = mix(vec3(0.1, 0.15, 0.25), vec3(0.95, 0.78, 0.6), pow(sd, 26.0));
      cloud += uSunCol * pow(sd, 60.0) * edge * 1.2;
      col = mix(col, cloud * (0.82 + 0.36 * c2), dens * 0.7);
    }
    col += uSunCol * (pow(sd, 2400.0) * 30.0 + pow(sd, 300.0) * 0.9 + pow(sd, 40.0) * 0.22 + pow(sd, 10.0) * 0.05);
    float L = e > 0.0 ? min(1500.0, (uFog.w * 4.0 - uCam.y) / max(e, 0.004)) : 1500.0;
    float az = atan(rd.x, -rd.z);
    float far = 0.0;
    for (int k = 2; k >= 0; k--) {
      float fk = float(k);
      float n = texture2D(uNoise, vec2(az * (0.7 + fk * 0.45) + fk * 0.31, 0.17 + fk * 0.23)).r;
      float n2 = texture2D(uNoise, vec2(az * (2.6 + fk) + fk * 0.53, 0.61 + fk * 0.11)).g;
      float h = 0.012 + fk * 0.014 + (n * 0.75 + n2 * 0.25) * (0.02 + fk * 0.012);
      if (e < h) {
        col = mix(uRidge, uHorizon, fk * 0.12);
        L = 800.0 * pow(2.0, fk);
        far = 1.0;
      }
    }
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    vec3 c = gl_FragColor.rgb;
    c = mix(mistColor(rd), c, exp(-mistDepth(uCam, rd, L) * mix(mix(1.0, 0.12, smoothstep(0.03, 0.26, e)), 1.0, far)));
    c = mix(c, uVeil.rgb, 1.0 - exp(-uVeil.a * 700.0));
    gl_FragColor = vec4(c, uAlpha);
  }
`;

const RAYS_FRAG = `
  ${VIEW}
  uniform sampler2D uMask;
  uniform vec2 uSun;
  uniform vec3 uSunDir;
  varying vec2 vNdc;
  void main() {
    vec2 uv = vNdc * 0.5 + 0.5;
    vec2 delta = (uSun - uv) * (0.94 / 36.0);
    float sum = 0.0;
    float decay = 1.0;
    for (int i = 0; i < 36; i++) {
      uv += delta;
      vec2 c = clamp(uv, vec2(0.001), vec2(0.999));
      float m = texture2D(uMask, c).r;
      float s = max(dot(viewDir(uv * 2.0 - 1.0), uSunDir), 0.0);
      sum += m * (pow(s, 60.0) + pow(s, 14.0) * 0.1) * decay;
      decay *= 0.965;
    }
    gl_FragColor = vec4(vec3(sum / 36.0), 1.0);
  }
`;

const COMPOSITE_FRAG = `
  uniform sampler2D uRays;
  uniform vec3 uRayCol;
  varying vec2 vNdc;
  void main() {
    vec3 r = texture2D(uRays, vNdc * 0.5 + 0.5).rgb;
    gl_FragColor = vec4(r * uRayCol, 1.0);
  }
`;

const PUFF_VERT = `
  ${MIST}
  attribute vec4 aPuff;
  varying vec2 vP;
  varying float vA;
  varying float vSeed;
  varying vec3 vCol;
  varying float vT;
  varying float vV;
  void main() {
    vec4 wc = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vec4 mv = modelViewMatrix * wc;
    float c = cos(aPuff.w);
    float s = sin(aPuff.w);
    mv.xy += vec2(position.x * c - position.y * s, position.x * s + position.y * c) * aPuff.x;
    vP = position.xy * 2.0;
    vA = aPuff.y;
    vSeed = aPuff.z;
    vec3 d = wc.xyz - uCam;
    float L = length(d);
    vec3 rd = d / max(L, 0.001);
    vT = exp(-mistDepth(uCam, rd, L));
    vCol = mistColor(rd);
    vV = exp(-uVeil.a * L);
    gl_Position = projectionMatrix * mv;
  }
`;
const PUFF_FRAG = `
  uniform sampler2D uNoise;
  varying vec2 vP;
  varying float vA;
  varying float vSeed;
  varying vec3 vCol;
  varying float vT;
  varying float vV;
  void main() {
    float r = length(vP);
    if (r > 1.0) discard;
    float n = texture2D(uNoise, vP * 0.24 + vSeed).r;
    float a = smoothstep(1.0, 0.25, r) * smoothstep(0.3, 0.8, n + 0.4 * (1.0 - r));
    a *= smoothstep(-1.0, -0.3, vP.y);
    vec3 dust = vCol * vec3(0.74, 0.71, 0.67);
    gl_FragColor = vec4(mix(vCol, dust, vT * (0.6 + 0.4 * n)), a * vA * (0.4 + 0.6 * vT) * vV);
  }
`;

const PRINT_VERT = `
  ${MIST}
  attribute vec4 aPrint;
  varying vec2 vP;
  varying vec4 vInfo;
  varying float vT;
  void main() {
    vec4 wc = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vP = position.xz * PRINT_SIZE;
    vInfo = aPrint;
    vec3 d = wc.xyz - uCam;
    float L = length(d);
    vT = exp(-mistDepth(uCam, d / max(L, 0.001), L)) * exp(-uVeil.a * L);
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;
const PRINT_FRAG = `
  uniform sampler2D uNoise;
  varying vec2 vP;
  varying vec4 vInfo;
  varying float vT;
  void main() {
    float age = vInfo.x;
    float life = vInfo.y;
    float R = length(vP);
    if (R > 3.4 && age > 1.6) discard;
    float r = R / FOOT;
    float n = texture2D(uNoise, vP * 0.21 + vInfo.z).b;
    float press = smoothstep(0.0, 0.18, age);
    float fade = 1.0 - smoothstep(life * 0.55, life, age);
    float dep = (1.0 - smoothstep(0.8, 0.98, r)) * press;
    float rim = smoothstep(0.92, 1.04, r) * (1.0 - smoothstep(1.04, 1.5 + n * 0.25, r)) * press;
    float ang = atan(vP.y, vP.x);
    float toe = smoothstep(0.6, 1.0, cos(ang * 4.0 + vInfo.z * 6.0)) * smoothstep(0.86, 1.1, r) * (1.0 - smoothstep(1.1, 1.36, r)) * press;
    float f = 1.0 - dep * (0.36 + 0.14 * n) + rim * 0.26 - toe * 0.18;
    f = mix(1.0, f, fade * vT);
    if (age < 1.6) {
      float ring = abs(R - (2.4 + age * 5.0));
      f += (1.0 - smoothstep(0.0, 0.9 + age * 0.6, ring)) * (1.0 - age / 1.6) * 0.42 * vT * (0.7 + 0.6 * n);
    }
    gl_FragColor = vec4(vec3(f * 0.5), f * 0.5);
  }
`;

const MAX_WALKERS = 4;
const RING_COUNT = 6;
const MAX_PUFFS = 160;
const MAX_PRINTS = 220;
const PRINT_SIZE = 20;
const HEADING = new THREE.Vector2(0.7506, 0.6606).normalize();
const HERO: [number, number][] = [
  [-8, -100],
  [-60, -175],
  [-112, -248],
  [-30, -330],
];
const LANES = [0, -22, 22, -44, 11];
const SUN_EL = THREE.MathUtils.degToRad(6);
const SUN_AZ = THREE.MathUtils.degToRad(1.5);
const SUN_DIR = new THREE.Vector3(Math.sin(SUN_AZ) * Math.cos(SUN_EL), Math.sin(SUN_EL), -Math.cos(SUN_AZ) * Math.cos(SUN_EL));
const TAN = Math.tan(THREE.MathUtils.degToRad(15));
const CAM_Z = 10;

type PartName = "body" | "head" | "ring" | "thigh" | "shin" | "foot" | "rod" | "sleeve";
const PER: Record<PartName, number> = { body: 1, head: 1, ring: RING_COUNT, thigh: 4, shin: 4, foot: 4, rod: 4, sleeve: 4 };
const BUILD: Record<PartName, () => THREE.BufferGeometry> = {
  body: bodyGeometry,
  head: headGeometry,
  ring: ringGeometry,
  thigh: thighGeometry,
  shin: shinGeometry,
  foot: footGeometry,
  rod: rodGeometry,
  sleeve: sleeveGeometry,
};

function scatter(count: number, seed: number) {
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const rx = -HEADING.y;
  const rz = HEADING.x;
  const lines = [...LANES.map((l) => [HERO[0][0] + rx * l, HERO[0][1] + rz * l]), ...HERO];
  const near = (x: number, z: number) =>
    lines.some(([px, pz]) => Math.abs((x - px) * rx + (z - pz) * rz) < 8);
  const out: { x: number; z: number; sx: number; sy: number; sz: number; yaw: number; seed: number }[] = [];
  for (let i = 0; i < count; i++) {
    const zone = rnd();
    let z: number;
    let x: number;
    if (zone < 0.7) {
      z = -28 - Math.pow(rnd(), 1.5) * 190;
      x = (rnd() - 0.5) * 2 * (-z * 0.47 + 6);
    } else if (zone < 0.85) {
      z = 34 - rnd() * 70;
      x = (rnd() - 0.5) * 2 * ((60 - z) * 0.16 + 5);
    } else {
      z = -60 - rnd() * 280;
      x = (rnd() - 0.5) * 2 * (-z * 0.6 + 20);
    }
    let size = rnd() < 0.9 ? 0.14 + Math.pow(rnd(), 2.2) * 0.55 : 0.7 + rnd() * 0.9;
    if (z < -50 && rnd() < 0.025) size = 2.2 + rnd() * 2.6;
    if (size > 0.4 && near(x, z)) size = 0.14 + rnd() * 0.15;
    out.push({ x, z, sx: size * (0.8 + rnd() * 0.5), sy: size * (0.45 + rnd() * 0.5), sz: size * (0.8 + rnd() * 0.5), yaw: rnd() * Math.PI * 2, seed: rnd() });
  }
  return out;
}

interface Walker {
  ox: number;
  oz: number;
  s0: number;
  clock: number;
  born: number;
  seed: number;
  feet: Foot[];
  contact: boolean[];
}

interface Puff {
  on: boolean;
  p: THREE.Vector3;
  v: THREE.Vector3;
  age: number;
  life: number;
  size: number;
  grow: number;
  alpha: number;
  seed: number;
  spin: number;
}

interface Print {
  on: boolean;
  age: number;
  life: number;
  seed: number;
  m: THREE.Matrix4;
}

export interface WalkersState {
  amount: number;
  progress: number;
  aspect: number;
  reduced: boolean;
  veil: number[];
}

export class Walkers {
  group = new THREE.Group();
  active = false;
  private world = new THREE.Group();
  private parts = {} as Record<PartName, THREE.InstancedMesh>;
  private fades = {} as Record<PartName, THREE.InstancedBufferAttribute>;
  private ground: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  private rockMat: THREE.MeshStandardMaterial;
  private rocks: THREE.InstancedMesh;
  private rockU: Uniforms;
  private sky: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private composite: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private puffs: THREE.InstancedMesh;
  private puffAttr: THREE.InstancedBufferAttribute;
  private puffList: Puff[] = [];
  private prints: THREE.InstancedMesh;
  private printAttr: THREE.InstancedBufferAttribute;
  private printList: Print[] = [];
  private sun = new THREE.DirectionalLight(0xffe2c4, 0);
  private fill = new THREE.DirectionalLight(0xb4c6dc, 0);
  private hemi = new THREE.HemisphereLight(0xa9c6ea, 0x1b1c1f, 0);
  private maskScene = new THREE.Scene();
  private maskRoot = new THREE.Group();
  private raysScene = new THREE.Scene();
  private rays: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private rtMask: THREE.WebGLRenderTarget;
  private rtRays: THREE.WebGLRenderTarget;
  private walkers: Walker[] = [];
  private shared: Uniforms;
  private materials: THREE.Material[] = [];
  private disposables: { dispose(): void }[] = [];
  private started = false;
  private t0 = 0;
  private lane = 0;
  private rnd = 1;
  private raysOn = false;
  private quake = 0;
  private cam = new THREE.Vector3();
  private tilt = 0;
  private m = new THREE.Matrix4();
  private m2 = new THREE.Matrix4();
  private rb = new THREE.Matrix4();
  private rh = new THREE.Matrix4();
  private e = new THREE.Euler();
  private q = new THREE.Quaternion();
  private q2 = new THREE.Quaternion();
  private B = new THREE.Vector3();
  private H = new THREE.Vector3();
  private K = new THREE.Vector3();
  private A = new THREE.Vector3();
  private F = new THREE.Vector3();
  private P1 = new THREE.Vector3();
  private P2 = new THREE.Vector3();
  private x = new THREE.Vector3();
  private y = new THREE.Vector3();
  private z = new THREE.Vector3();
  private t = new THREE.Vector3();
  private u = new THREE.Vector3();
  private n = new THREE.Vector3();
  private fwd = new THREE.Vector3();
  private up = new THREE.Vector3();
  private right = new THREE.Vector3();
  private hfwd = new THREE.Vector3();
  private hup = new THREE.Vector3();
  private N0 = new THREE.Vector3();
  private N1 = new THREE.Vector3();
  private N2 = new THREE.Vector3();
  private N3 = new THREE.Vector3();
  private worldUp = new THREE.Vector3(0, 1, 0);
  private scale = new THREE.Vector3();
  private sway: Sway = newSway();
  private knee: Knee = newKnee();
  private gaze: Gaze = { yaw: 0, pitch: 0 };
  private size = new THREE.Vector2();
  private clear = new THREE.Color();

  constructor({ quality = 1 } = {}) {
    const noise = noiseTexture();
    this.disposables.push(noise);
    this.shared = {
      uNoise: { value: noise },
      uCam: { value: new THREE.Vector3() },
      uFog: { value: new THREE.Vector4(0.021, 6, 0.0004, 80) },
      uFog2: { value: new THREE.Vector4(0.12, 1.9, 0, 0) },
      uSunDir: { value: SUN_DIR.clone() },
      uHaze: { value: srgb("#9db1c6") },
      uGlow: { value: srgb("#f4e3c9") },
      uVeil: { value: new THREE.Vector4(0, 0, 0, 0) },
      uSunView: { value: new THREE.Vector3() },
      uRim: { value: new THREE.Vector3() },
    };

    this.world.matrixAutoUpdate = false;
    this.maskRoot.matrixAutoUpdate = false;
    this.group.add(this.world);
    this.maskScene.add(this.maskRoot);

    const mat = walkerMaterial(this.shared);
    const black = new THREE.MeshBasicMaterial({ color: 0x000000, fog: false });
    this.materials.push(mat, black);
    (Object.keys(PER) as PartName[]).forEach((name) => {
      const geo = BUILD[name]();
      const n = PER[name] * MAX_WALKERS;
      const fade = new THREE.InstancedBufferAttribute(new Float32Array(n).fill(1), 1);
      geo.setAttribute("aFade", fade);
      const mesh = new THREE.InstancedMesh(geo, mat, n);
      mesh.frustumCulled = false;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.world.add(mesh);
      this.parts[name] = mesh;
      this.fades[name] = fade;
      const ghost = new THREE.InstancedMesh(geo, black, n);
      ghost.instanceMatrix = mesh.instanceMatrix;
      ghost.frustumCulled = false;
      this.maskRoot.add(ghost);
      this.disposables.push(geo);
    });

    const plane = new THREE.PlaneGeometry(760, 520, 190, 130);
    plane.rotateX(-Math.PI / 2);
    plane.translate(0, 0, -230);
    const pos = plane.getAttribute("position");
    for (let i = 0; i < pos.count; i++) pos.setY(i, groundY(pos.getX(i), pos.getZ(i)));
    plane.computeVertexNormals();
    const gm = groundMaterial(this.shared);
    this.materials.push(gm);
    this.ground = new THREE.Mesh(plane, gm);
    this.ground.receiveShadow = true;
    this.ground.frustumCulled = false;
    this.world.add(this.ground);
    const groundMask = new THREE.Mesh(plane, black);
    groundMask.frustumCulled = false;
    this.maskRoot.add(groundMask);
    this.disposables.push(plane);

    const stones = scatter(quality >= 1 ? 1900 : 900, 29);
    const rockGeo = rockGeometry();
    const rockAttr = new THREE.InstancedBufferAttribute(new Float32Array(stones.length * 3), 3);
    rockGeo.setAttribute("aRock", rockAttr);
    this.rockU = { uQuake: { value: 0 }, uTime: { value: 0 } };
    const rm = rockMaterial(this.shared, this.rockU);
    this.rockMat = rm;
    this.materials.push(rm);
    this.rocks = new THREE.InstancedMesh(rockGeo, rm, stones.length);
    stones.forEach((r, i) => {
      this.m.compose(
        this.t.set(r.x, groundY(r.x, r.z) - r.sy * 0.18, r.z),
        this.q.setFromAxisAngle(this.worldUp, r.yaw),
        this.scale.set(r.sx, r.sy, r.sz),
      );
      this.rocks.setMatrixAt(i, this.m);
      rockAttr.setXYZ(i, r.sy, r.seed, Math.max(r.sx, r.sz));
    });
    this.rocks.frustumCulled = false;
    this.rocks.castShadow = true;
    this.rocks.receiveShadow = true;
    this.world.add(this.rocks);
    this.disposables.push(rockGeo);

    const quad = new THREE.PlaneGeometry(2, 2);
    this.disposables.push(quad);
    const view = { uTan: { value: TAN }, uAspect: { value: 1 }, uTilt: { value: 0 } };
    const skyMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: SKY_FRAG,
      uniforms: {
        ...this.shared,
        ...view,
        uZenith: { value: lin("#2a5d9e") },
        uMid: { value: lin("#5d8fc6") },
        uHorizon: { value: lin("#c9dae8") },
        uSunCol: { value: lin("#ffe7c9") },
        uRidge: { value: lin("#2d3a4c") },
        uTime: { value: 0 },
        uAlpha: { value: 1 },
      },
      depthTest: false,
      depthWrite: false,
      transparent: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    this.sky = new THREE.Mesh(quad, skyMat);
    this.sky.frustumCulled = false;
    this.sky.renderOrder = -999;
    this.group.add(this.sky);

    const rtOpts = { depthBuffer: true, stencilBuffer: false, type: THREE.UnsignedByteType };
    this.rtMask = new THREE.WebGLRenderTarget(4, 4, rtOpts);
    this.rtRays = new THREE.WebGLRenderTarget(4, 4, { depthBuffer: false, stencilBuffer: false });
    this.disposables.push(this.rtMask, this.rtRays);
    const raysMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: RAYS_FRAG,
      uniforms: { ...view, uMask: { value: this.rtMask.texture }, uSun: { value: new THREE.Vector2() }, uSunDir: this.shared.uSunDir },
      depthTest: false,
      depthWrite: false,
    });
    this.rays = new THREE.Mesh(quad, raysMat);
    this.rays.frustumCulled = false;
    this.raysScene.add(this.rays);
    const compMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: COMPOSITE_FRAG,
      uniforms: { uRays: { value: this.rtRays.texture }, uRayCol: { value: new THREE.Vector3() } },
      depthTest: false,
      depthWrite: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    this.composite = new THREE.Mesh(quad, compMat);
    this.composite.frustumCulled = false;
    this.composite.renderOrder = 1000;
    this.group.add(this.composite);

    const printGeo = new THREE.PlaneGeometry(1, 1);
    printGeo.rotateX(-Math.PI / 2);
    this.printAttr = new THREE.InstancedBufferAttribute(new Float32Array(MAX_PRINTS * 4), 4);
    printGeo.setAttribute("aPrint", this.printAttr);
    const printMat = new THREE.ShaderMaterial({
      vertexShader: PRINT_VERT,
      fragmentShader: PRINT_FRAG,
      uniforms: this.shared,
      defines: { PRINT_SIZE: PRINT_SIZE.toFixed(1), FOOT: LEG.foot.toFixed(2) },
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.DstColorFactor,
      blendDst: THREE.SrcAlphaFactor,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -4,
    });
    this.prints = new THREE.InstancedMesh(printGeo, printMat, MAX_PRINTS);
    this.prints.frustumCulled = false;
    this.prints.count = 0;
    this.prints.renderOrder = 5;
    this.world.add(this.prints);
    this.disposables.push(printGeo);
    for (let i = 0; i < MAX_PRINTS; i++) this.printList.push({ on: false, age: 0, life: 1, seed: 0, m: new THREE.Matrix4() });

    const puffGeo = new THREE.PlaneGeometry(1, 1);
    this.puffAttr = new THREE.InstancedBufferAttribute(new Float32Array(MAX_PUFFS * 4), 4);
    puffGeo.setAttribute("aPuff", this.puffAttr);
    const puffMat = new THREE.ShaderMaterial({
      vertexShader: PUFF_VERT,
      fragmentShader: PUFF_FRAG,
      uniforms: this.shared,
      transparent: true,
      depthWrite: false,
    });
    this.puffs = new THREE.InstancedMesh(puffGeo, puffMat, MAX_PUFFS);
    this.puffs.frustumCulled = false;
    this.puffs.count = 0;
    this.puffs.renderOrder = 10;
    this.world.add(this.puffs);
    this.disposables.push(puffGeo);
    for (let i = 0; i < MAX_PUFFS; i++) {
      this.puffList.push({ on: false, p: new THREE.Vector3(), v: new THREE.Vector3(), age: 0, life: 1, size: 1, grow: 1, alpha: 0, seed: 0, spin: 0 });
    }
    this.materials.push(skyMat, raysMat, compMat, puffMat, printMat);

    const s = this.sun.shadow;
    s.mapSize.set(quality >= 1 ? 2048 : 1024, quality >= 1 ? 1024 : 512);
    const sc = s.camera;
    sc.left = -170;
    sc.right = 170;
    sc.top = 36;
    sc.bottom = -36;
    sc.near = 100;
    sc.far = 850;
    sc.updateProjectionMatrix();
    s.bias = -0.0004;
    s.normalBias = 0.12;
    s.radius = 2.5;
    s.autoUpdate = false;
    this.sun.castShadow = true;
    this.group.add(this.sun, this.sun.target, this.fill, this.fill.target, this.hemi);

    for (let i = 0; i < MAX_WALKERS; i++) {
      this.walkers.push({ ox: 0, oz: 0, s0: 0, clock: 0, born: 0, seed: i * 1.93 + 0.4, feet: LEGS.map(() => newFoot()), contact: LEGS.map(() => true) });
    }
    this.sky.visible = false;
    this.composite.visible = false;
    this.world.visible = false;
  }

  setEnvironment(tex: THREE.Texture) {
    for (const m of this.materials) {
      if (m instanceof THREE.MeshStandardMaterial) {
        m.envMap = tex;
        m.envMapIntensity = 0.5;
        m.needsUpdate = true;
      }
    }
    this.ground.material.envMapIntensity = 0.22;
    this.rockMat.envMapIntensity = 0.3;
    this.disposables.push(tex);
  }

  showAll(on: boolean) {
    this.world.visible = on;
    this.sky.visible = on;
    this.composite.visible = on;
    this.prints.count = on ? 1 : 0;
    this.puffs.count = on ? 1 : 0;
    if (on) {
      this.reset(0);
      this.pose(0, 0);
    }
  }

  compile(r: THREE.WebGLRenderer, camera: THREE.Camera) {
    return Promise.all([r.compileAsync(this.maskScene, camera), r.compileAsync(this.raysScene, this.ortho)]);
  }

  private random() {
    this.rnd = (this.rnd * 16807) % 2147483647;
    return this.rnd / 2147483647;
  }

  private reset(wt: number) {
    this.lane = 0;
    this.rnd = 7;
    this.quake = 0;
    this.walkers.forEach((w, i) => {
      const s = 100 + i * 2.7;
      w.s0 = s;
      w.clock = wt;
      w.born = wt - 100;
      w.ox = HERO[i][0] - HEADING.x * s;
      w.oz = HERO[i][1] - HEADING.y * s;
      w.contact.fill(true);
    });
    this.puffList.forEach((p) => (p.on = false));
    this.printList.forEach((p) => (p.on = false));
  }

  private crowded(w: Walker, px: number, pz: number, wt: number) {
    return this.walkers.some((o) => {
      if (o === w) return false;
      const s = o.s0 + STEP.speed * (wt - o.clock);
      return Math.hypot(o.ox + HEADING.x * s - px, o.oz + HEADING.y * s - pz) < 70;
    });
  }

  private respawn(w: Walker, wt: number) {
    const rx = -HEADING.y;
    const rz = HEADING.x;
    const lane = LANES[this.lane++ % LANES.length];
    let px = HERO[0][0] + rx * lane - HEADING.x * 270;
    let pz = HERO[0][1] + rz * lane - HEADING.y * 270;
    for (let tries = 0; tries < 6 && this.crowded(w, px, pz, wt); tries++) {
      px -= HEADING.x * 60;
      pz -= HEADING.y * 60;
    }
    const s0 = this.random() * STRIDE;
    w.s0 = s0;
    w.clock = wt;
    w.born = wt;
    w.ox = px - HEADING.x * s0;
    w.oz = pz - HEADING.y * s0;
    w.contact.fill(true);
  }

  update(dt: number, time: number, st: WalkersState) {
    const a = st.amount;
    const on = a > 0.004;
    const shown = a > 0.1;
    this.sun.intensity = 2.6 * a;
    this.fill.intensity = 0.55 * a;
    this.hemi.intensity = 0.6 * a;
    this.sun.shadow.autoUpdate = shown;
    this.active = on;
    this.sky.visible = on;
    this.world.visible = shown;
    this.raysOn = shown;
    this.composite.visible = shown;
    if (!on) {
      this.started = false;
      return;
    }
    if (!this.started) {
      this.started = true;
      this.t0 = time;
      this.reset(0);
    }
    const wt = st.reduced ? 0 : time - this.t0;
    const veil = ((1 - a) * (1 - a) * 0.12) / Math.max(a, 0.04);
    this.shared.uVeil.value.set(st.veil[0], st.veil[1], st.veil[2], veil);
    this.shared.uFog2.value.z = st.reduced ? 0 : time * 0.0016;
    this.shared.uFog2.value.w = st.reduced ? 0 : time * 0.0006;
    const sky = this.sky.material.uniforms;
    sky.uAlpha.value = smoothstep(0.004, 0.1, a);
    sky.uTime.value = st.reduced ? 0 : time;

    this.quake *= Math.exp(-5.5 * dt);
    const q = st.reduced ? 0 : this.quake;
    this.rockU.uQuake.value = q;
    this.rockU.uTime.value = time;
    const k = smoothstep(0.62, 1.15, st.aspect);
    const p = st.progress;
    const jx = q * 0.045 * Math.sin(time * 71 + 0.4);
    const jy = q * (0.08 * Math.sin(time * 53) + 0.05 * Math.sin(time * 87 + 1.1));
    this.cam.set(jx, 3.5 + 0.8 * p + jy, THREE.MathUtils.lerp(60, 0, k) - 14 * p);
    this.tilt = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(11, 8.5, k)) + q * 0.0028 * Math.sin(time * 61 + 2.0);
    this.world.matrix.makeTranslation(0, 0, CAM_Z).multiply(this.m.makeRotationX(-this.tilt)).multiply(this.m2.makeTranslation(-this.cam.x, -this.cam.y, -this.cam.z));
    this.world.matrixWorldNeedsUpdate = true;
    this.maskRoot.matrix.copy(this.world.matrix);
    this.maskRoot.matrixWorldNeedsUpdate = true;
    this.shared.uCam.value.copy(this.cam);
    this.shared.uSunView.value.copy(SUN_DIR).applyMatrix4(this.m.makeRotationX(-this.tilt));
    this.shared.uRim.value.set(1.0, 0.78, 0.55).multiplyScalar(0.9 * a);
    for (const u of [sky, this.rays.material.uniforms]) {
      u.uAspect.value = st.aspect;
      u.uTilt.value = this.tilt;
    }

    this.place(wt, st);
    this.pose(wt, st.reduced ? 0 : dt);
    this.light(a * Math.exp(-veil * 120));
  }

  private place(wt: number, st: WalkersState) {
    if (st.reduced) return;
    const half = Math.atan(TAN * st.aspect);
    for (const w of this.walkers) {
      const s = w.s0 + STEP.speed * (wt - w.clock);
      const cx = w.ox + HEADING.x * s - this.cam.x;
      const cz = w.oz + HEADING.y * s - this.cam.z;
      const dist = Math.hypot(cx, cz);
      const ang = Math.atan2(cx, -cz);
      if (-cz < 30 || ang > half + Math.atan(18 / Math.max(dist, 1)) + 0.04) this.respawn(w, wt);
    }
  }

  private pose(wt: number, dt: number) {
    const P = this.parts;
    const at = (name: PartName, w: number, j: number) => w * PER[name] + j;
    const yaw = Math.atan2(-HEADING.y, HEADING.x);
    this.walkers.forEach((w, wi) => {
      const s = w.s0 + STEP.speed * (wt - w.clock);
      const fade = smoothstep(0, 9, wt - w.born);
      LEGS.forEach((leg, i) => footAt(leg, s, w.feet[i]));
      const sw = swayAt(w.feet, s, this.sway);
      const along = s + sw.surge;
      const hx = HEADING.x;
      const hz = HEADING.y;
      const rx = -hz;
      const rz = hx;
      const gs = LEGS.map((leg) => {
        const a = along + leg.fore * LEG.hipX;
        const l = leg.side * LEG.z;
        return groundY(w.ox + hx * a + rx * l, w.oz + hz * a + rz * l);
      });
      const mean = (gs[0] + gs[1] + gs[2] + gs[3]) / 4;
      const pitch = Math.atan2((gs[1] + gs[3] - gs[0] - gs[2]) / 2, 2 * LEG.hipX) + sw.pitch;
      const roll = -Math.atan2((gs[2] + gs[3] - gs[0] - gs[1]) / 2, 2 * LEG.z) + sw.roll;
      this.B.set(w.ox + hx * along, LEG.hipY + mean + sw.bob, w.oz + hz * along);
      this.rb.makeRotationFromEuler(this.e.set(roll, yaw, pitch, "YZX"));
      this.rb.extractBasis(this.fwd, this.up, this.right);
      this.m.copy(this.rb).setPosition(this.B);
      P.body.setMatrixAt(at("body", wi, 0), this.m);

      gazeAt(wt, w.seed, this.gaze);
      this.rh.makeRotationFromEuler(this.e.set(roll * 0.4, yaw + this.gaze.yaw, pitch * 0.4 + this.gaze.pitch + sw.bob * 0.08, "YZX"));
      this.rh.extractBasis(this.hfwd, this.hup, this.z);
      this.N0.set(NECK[0], NECK[1], NECK[2]).applyMatrix4(this.rb).add(this.B);
      this.N3.set(HEAD_OFFSET[0], HEAD_OFFSET[1], HEAD_OFFSET[2]).applyMatrix4(this.rh).add(this.N0);
      this.m.copy(this.rh).setPosition(this.N3);
      P.head.setMatrixAt(at("head", wi, 0), this.m);
      this.N1.copy(this.N0).addScaledVector(this.fwd, 0.9);
      this.N2.copy(this.N3).addScaledVector(this.hfwd, -0.9);
      for (let j = 0; j < RING_COUNT; j++) {
        const t = (j + 0.5) / RING_COUNT;
        const it = 1 - t;
        this.t.copy(this.N0).multiplyScalar(it * it * it).addScaledVector(this.N1, 3 * it * it * t).addScaledVector(this.N2, 3 * it * t * t).addScaledVector(this.N3, t * t * t);
        this.x.copy(this.N1).sub(this.N0).multiplyScalar(3 * it * it).addScaledVector(this.u.copy(this.N2).sub(this.N1), 6 * it * t).addScaledVector(this.y.copy(this.N3).sub(this.N2), 3 * t * t).normalize();
        this.y.copy(this.up).lerp(this.hup, t);
        this.y.addScaledVector(this.x, -this.y.dot(this.x)).normalize();
        this.z.crossVectors(this.x, this.y);
        this.m.makeBasis(this.x, this.y, this.z).setPosition(this.t);
        P.ring.setMatrixAt(at("ring", wi, j), this.m);
      }

      LEGS.forEach((leg, i) => {
        const f = w.feet[i];
        const lat = leg.side * LEG.z;
        const fx = w.ox + hx * f.along + rx * lat;
        const fz = w.oz + hz * f.along + rz * lat;
        const gy = groundY(fx, fz);
        this.F.set(fx, gy + f.lift, fz);
        this.A.set(fx, gy + f.lift + LEG.ankle, fz);
        this.u.copy(this.A).sub(this.B).applyMatrix4(this.m2.copy(this.rb).transpose());
        const hipX = leg.fore * LEG.hipX;
        ik(hipX, 0, this.u.x, this.u.y, this.knee);
        this.H.set(hipX, 0, lat).applyMatrix4(this.rb).add(this.B);
        this.K.set(this.knee.kx, this.knee.ky, lat).applyMatrix4(this.rb).add(this.B);
        this.A.set(this.knee.ax, this.knee.ay, lat).applyMatrix4(this.rb).add(this.B);

        this.y.copy(this.H).sub(this.K).normalize();
        this.x.crossVectors(this.y, this.right).normalize();
        this.m.makeBasis(this.x, this.y, this.right).setPosition(this.H);
        P.thigh.setMatrixAt(at("thigh", wi, i), this.m);
        this.P1.set(THIGH_PIN[0], THIGH_PIN[1], THIGH_PIN[2]).applyMatrix4(this.m);

        this.y.copy(this.K).sub(this.A).normalize();
        this.x.crossVectors(this.y, this.right).normalize();
        this.m.makeBasis(this.x, this.y, this.right).setPosition(this.K);
        P.shin.setMatrixAt(at("shin", wi, i), this.m);
        this.P2.set(SHIN_PIN[0], SHIN_PIN[1], SHIN_PIN[2]).applyMatrix4(this.m);

        this.m.makeRotationFromEuler(this.e.set(0, yaw, f.pitch, "YZX")).setPosition(this.A);
        P.foot.setMatrixAt(at("foot", wi, i), this.m);

        this.y.copy(this.P2).sub(this.P1).normalize();
        this.x.crossVectors(this.y, this.right).normalize();
        this.m.makeBasis(this.x, this.y, this.right).setPosition(this.P1);
        P.rod.setMatrixAt(at("rod", wi, i), this.m);
        this.y.negate();
        this.x.negate();
        this.m.makeBasis(this.x, this.y, this.right).setPosition(this.P2);
        P.sleeve.setMatrixAt(at("sleeve", wi, i), this.m);

        if (f.contact && !w.contact[i] && dt > 0 && fade > 0.3) this.footfall(this.F.set(fx, gy, fz), yaw, w.seed * 3.7 + i, fade);
        w.contact[i] = f.contact;
      });

      (Object.keys(PER) as PartName[]).forEach((name) => {
        for (let j = 0; j < PER[name]; j++) this.fades[name].setX(at(name, wi, j), fade);
      });
    });
    (Object.keys(PER) as PartName[]).forEach((name) => {
      P[name].instanceMatrix.needsUpdate = true;
      this.fades[name].needsUpdate = true;
    });
    this.puffStep(dt);
    this.printStep(dt);
  }

  private footfall(at: THREE.Vector3, yaw: number, seed: number, fade: number) {
    const dist = Math.hypot(at.x - this.cam.x, at.z - this.cam.z);
    this.quake = Math.min(1.6, this.quake + Math.min(1.1, Math.pow(80 / Math.max(dist, 20), 1.6)) * fade);
    if (dist > 300) return;
    let slot = this.printList.find((x) => !x.on);
    if (!slot) slot = this.printList.reduce((o, x) => (x.age > o.age ? x : o));
    const e = 0.5;
    const dx = (groundY(at.x + e, at.z) - groundY(at.x - e, at.z)) / (2 * e);
    const dz = (groundY(at.x, at.z + e) - groundY(at.x, at.z - e)) / (2 * e);
    this.n.set(-dx, 1, -dz).normalize();
    this.q.setFromUnitVectors(this.worldUp, this.n).multiply(this.q2.setFromAxisAngle(this.worldUp, yaw + this.random() * 0.4));
    slot.m.compose(this.t.set(at.x, at.y + 0.12, at.z), this.q, this.scale.setScalar(PRINT_SIZE));
    slot.on = true;
    slot.age = 0;
    slot.life = 80 + this.random() * 30;
    slot.seed = seed;
    const near = 1 + Math.max(0, 1 - dist / 160);
    for (let k = 0; k < 10; k++) {
      const p = this.puffList.find((x) => !x.on);
      if (!p) return;
      const ang = (k / 10) * Math.PI * 2 + this.random() * 0.6;
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      const speed = 1.6 + this.random() * 1.4;
      p.on = true;
      p.age = 0;
      p.life = 3.4 + this.random() * 1.8;
      p.p.set(at.x + c * LEG.foot * 0.95, at.y + 0.4, at.z + s * LEG.foot * 0.95);
      p.v.set(c * speed, 0.35 + this.random() * 0.4, s * speed);
      p.size = (1.8 + this.random() * 0.9) * near;
      p.grow = (5.5 + this.random() * 3.0) * near;
      p.alpha = 0.5 + this.random() * 0.18;
      p.seed = seed * 0.37 + k * 0.13;
      p.spin = this.random() * Math.PI * 2;
    }
  }

  private printStep(dt: number) {
    let n = 0;
    for (const p of this.printList) {
      if (!p.on) continue;
      p.age += dt;
      if (p.age >= p.life) {
        p.on = false;
        continue;
      }
      this.prints.setMatrixAt(n, p.m);
      this.printAttr.setXYZW(n, p.age, p.life, p.seed, 0);
      n++;
    }
    this.prints.count = n;
    this.prints.instanceMatrix.needsUpdate = true;
    this.printAttr.needsUpdate = true;
  }

  private puffStep(dt: number) {
    let n = 0;
    for (const p of this.puffList) {
      if (!p.on) continue;
      p.age += dt;
      if (p.age >= p.life) {
        p.on = false;
        continue;
      }
      p.p.addScaledVector(p.v, dt);
      p.v.multiplyScalar(Math.exp(-1.1 * dt));
      const size = p.size + p.grow * (1 - Math.exp(-p.age * 0.9));
      const alpha = p.alpha * smoothstep(0, 0.25, p.age) * (1 - smoothstep(p.life * 0.4, p.life, p.age));
      this.m.makeTranslation(p.p.x, p.p.y + size * 0.25, p.p.z);
      this.puffs.setMatrixAt(n, this.m);
      this.puffAttr.setXYZW(n, size, alpha, p.seed, p.spin + p.age * 0.12);
      n++;
    }
    this.puffs.count = n;
    this.puffs.instanceMatrix.needsUpdate = true;
    this.puffAttr.needsUpdate = true;
  }

  private light(a: number) {
    const focus = this.u.set(this.cam.x, 0, this.cam.z - 170);
    this.sun.position.copy(SUN_DIR).multiplyScalar(450).add(focus).applyMatrix4(this.world.matrix);
    this.sun.target.position.copy(focus).applyMatrix4(this.world.matrix);
    this.sun.target.updateMatrixWorld();
    this.fill.position.set(-0.5, 0.8, 0.6).multiplyScalar(100).add(this.cam).applyMatrix4(this.world.matrix);
    this.fill.target.position.copy(focus).applyMatrix4(this.world.matrix);
    this.fill.target.updateMatrixWorld();
    this.hemi.position.set(0, Math.cos(this.tilt), -Math.sin(this.tilt));
    const d = this.t.copy(SUN_DIR).applyMatrix4(this.m.makeRotationX(-this.tilt));
    const sx = d.x / -d.z / (TAN * this.sky.material.uniforms.uAspect.value);
    const sy = d.y / -d.z / TAN;
    this.rays.material.uniforms.uSun.value.set(sx * 0.5 + 0.5, sy * 0.5 + 0.5);
    this.composite.material.uniforms.uRayCol.value.set(1.0, 0.84, 0.64).multiplyScalar(0.34 * a);
  }

  prepass(r: THREE.WebGLRenderer, camera: THREE.Camera) {
    if (!this.raysOn) return;
    r.getDrawingBufferSize(this.size);
    const w = Math.max(1, Math.round(this.size.x / 4));
    const h = Math.max(1, Math.round(this.size.y / 4));
    if (this.rtMask.width !== w || this.rtMask.height !== h) {
      this.rtMask.setSize(w, h);
      this.rtRays.setSize(w, h);
    }
    const target = r.getRenderTarget();
    r.getClearColor(this.clear);
    const alpha = r.getClearAlpha();
    r.setClearColor(0xffffff, 1);
    r.setRenderTarget(this.rtMask);
    r.render(this.maskScene, camera);
    r.setRenderTarget(this.rtRays);
    r.render(this.raysScene, this.ortho);
    r.setRenderTarget(target);
    r.setClearColor(this.clear, alpha);
  }

  dispose() {
    this.materials.forEach((m) => m.dispose());
    this.disposables.forEach((d) => d.dispose());
    this.sun.shadow.dispose();
  }
}
