import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { makeCanvas } from "./bake";

export type Loop = [number, number][];
export interface SealShape {
  outer: Loop;
  holes: Loop[];
}
export interface SealData {
  meta: { rings: { ringIn: number; ringOut: number; borderIn: number; borderOut: number } };
  inscription: SealShape[];
  wings: SealShape[];
  body: SealShape[];
}

export interface Metal {
  polish: string;
  frost: string;
}
export const METALS: Record<"gold" | "silver" | "bronze", Metal> = {
  gold: { polish: "#e4c58a", frost: "#e9cd95" },
  silver: { polish: "#d9dde3", frost: "#e7eaee" },
  bronze: { polish: "#cf8f5f", frost: "#d99d6c" },
};

const TAU = Math.PI * 2;
export const THICK = 0.14;
const CHAMFER = 0.014;
const RIM = 0.03;

const V = (r: number, z: number) => new THREE.Vector2(Math.max(r, 0.0005), z);

function lathe(profile: THREE.Vector2[], segments: number) {
  const geo = new THREE.LatheGeometry(profile, segments);
  geo.rotateX(Math.PI / 2);
  planarUV(geo);
  return geo;
}
function planarUV(geo: THREE.BufferGeometry) {
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) * 0.5 + 0.5;
    uv[i * 2 + 1] = pos.getY(i) * 0.5 + 0.5;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
}

function bezelProfile(rIn: number, rOut: number, top: number, base: number, steps = 28) {
  const shoulder = top * 0.55;
  const p = [V(rOut, base), V(rOut, shoulder)];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    p.push(V(rOut + (rIn - rOut) * t, shoulder + (top - shoulder) * Math.pow(Math.sin(Math.PI * t), 0.42)));
  }
  p.push(V(rIn, shoulder), V(rIn, base), V(rOut, base));
  return p;
}

function toShape(s: SealShape) {
  const shape = new THREE.Shape(s.outer.map(([x, y]) => new THREE.Vector2(x, y)));
  shape.holes = s.holes.map((h) => new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
  return shape;
}
function extrude(list: SealShape[], o: { depth: number; bevel: number; size: number; segments: number; grow?: number }) {
  const geo = new THREE.ExtrudeGeometry(list.map(toShape), {
    depth: o.depth,
    bevelEnabled: true,
    bevelThickness: o.bevel,
    bevelSize: o.size,
    bevelOffset: -o.size + (o.grow ?? 0),
    bevelSegments: o.segments,
    curveSegments: 1,
    steps: 1,
  });
  const out = toCreasedNormals(geo, THREE.MathUtils.degToRad(34));
  planarUV(out);
  return out;
}

function backRelief(data: SealData, N: number) {
  const [c, g] = makeCanvas(N, N);
  g.fillStyle = "rgb(128,128,128)";
  g.fillRect(0, 0, N, N);
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * TAU;
    const r = 0.885 * (N / 2);
    const grad = g.createRadialGradient(N / 2 + Math.cos(a) * r, N / 2 + Math.sin(a) * r, 0, N / 2 + Math.cos(a) * r, N / 2 + Math.sin(a) * r, N * 0.009);
    grad.addColorStop(0, "rgb(235,235,235)");
    grad.addColorStop(1, "rgb(128,128,128)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(N / 2 + Math.cos(a) * r, N / 2 + Math.sin(a) * r, N * 0.009, 0, TAU);
    g.fill();
  }
  g.strokeStyle = "rgb(70,70,70)";
  g.lineWidth = N * 0.003;
  [0.93, 0.84].forEach((r) => {
    g.beginPath();
    g.arc(N / 2, N / 2, (r * N) / 2, 0, TAU);
    g.stroke();
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

const COMMON = `
  varying vec3 vLocal;
  varying float vNz;
  float h3(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float vnoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(h3(i), h3(i + vec3(1, 0, 0)), f.x), mix(h3(i + vec3(0, 1, 0)), h3(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(h3(i + vec3(0, 0, 1)), h3(i + vec3(1, 0, 1)), f.x), mix(h3(i + vec3(0, 1, 1)), h3(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  vec3 perturb(vec3 n, vec2 p, vec2 d) {
    vec3 q0 = dFdx(-vViewPosition); vec3 q1 = dFdy(-vViewPosition);
    vec2 st0 = dFdx(p); vec2 st1 = dFdy(p);
    vec3 q1perp = cross(q1, n); vec3 q0perp = cross(n, q0);
    vec3 T = q1perp * st0.x + q0perp * st1.x;
    vec3 B = q1perp * st0.y + q0perp * st1.y;
    float det = max(dot(T, T), dot(B, B));
    float k = det == 0.0 ? 0.0 : inversesqrt(det);
    return normalize(T * (d.x * k) + B * (d.y * k) + n);
  }
  float visible(float cyclesPerPixel) { return 1.0 - smoothstep(0.3, 0.65, cyclesPerPixel); }
`;

function withLocal(sh: THREE.WebGLProgramParametersWithUniforms, cacheKey: string) {
  sh.vertexShader = sh.vertexShader
    .replace("#include <common>", "#include <common>\nvarying vec3 vLocal;\nvarying float vNz;")
    .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLocal = position;\nvNz = objectNormal.z;");
  sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\n" + COMMON);
  return cacheKey;
}

function metal(color: string, kind: "frost" | "brush" | "mirror" | "reeded", roughness: number) {
  const m = new THREE.MeshStandardMaterial({ color, metalness: 1, roughness, envMapIntensity: 1.15 });
  m.onBeforeCompile = (sh) => {
    withLocal(sh, kind);
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        {
          float wear = vnoise(vec3(vLocal.xy * 3.6, 4.0));
          float cap = smoothstep(0.9, 0.985, vNz);
          ${kind === "frost" ? "roughnessFactor = mix(roughnessFactor, 0.44, cap);" : ""}
          roughnessFactor += (wear - 0.5) * 0.07;
        }`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          float patina = vnoise(vec3(vLocal.xy * 1.3, 9.0)) * 0.7 + vnoise(vec3(vLocal.xy * 4.0, 2.0)) * 0.3;
          diffuseColor.rgb *= mix(0.94, 1.03, patina);
          diffuseColor.rgb *= mix(0.62, 1.0, smoothstep(0.05, 0.75, abs(vNz)));
        }`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
        {
          vec2 p = vLocal.xy;
          vec2 d = vec2(0.0);
          ${
            kind === "frost"
              ? `float px = length(fwidth(p));
          float cap = smoothstep(0.9, 0.985, vNz);
          float f = 60.0;
          for (int o = 0; o < 6; o++) {
            float w = smoothstep(0.16, 0.28, px * f) * (1.0 - smoothstep(0.42, 0.68, px * f));
            if (w > 0.001) {
              vec3 q = vec3(p * f + float(o) * 17.3, 1.7);
              float n0 = vnoise(q);
              d += vec2(vnoise(q + vec3(0.25, 0.0, 0.0)) - n0, vnoise(q + vec3(0.0, 0.25, 0.0)) - n0) * 0.17 * w;
            }
            f *= 2.2;
          }
          {
            float hf = 38.0;
            vec2 g = p * hf;
            vec2 cellId = floor(g);
            vec2 best = vec2(0.0);
            float bd = 9.0;
            for (int j = -1; j <= 1; j++)
              for (int i = -1; i <= 1; i++) {
                vec2 c = cellId + vec2(float(i), float(j));
                vec2 o = vec2(fract(sin(dot(c, vec2(127.1, 311.7))) * 43758.5453), fract(sin(dot(c, vec2(269.5, 183.3))) * 43758.5453));
                vec2 r = c + o - g;
                float dd = dot(r, r);
                if (dd < bd) { bd = dd; best = r; }
              }
            d += -best * 0.04 * visible(px * hf * 0.5);
          }
          d *= cap;
          normal = perturb(normal, p, d);`
              : ""
          }
          ${
            kind === "brush" || kind === "mirror"
              ? `float r = length(p);
          float th = atan(p.y, p.x);
          float px = length(fwidth(p));
          float f = ${kind === "brush" ? "380.0" : "900.0"};
          float nr = 0.0;
          for (int o = 0; o < 4; o++) {
            float w = visible(px * f);
            nr += sin(r * f + vnoise(vec3(th * 40.0, r * 7.0, float(o))) * 3.0) * ${kind === "brush" ? "0.05" : "0.012"} * w;
            f *= 1.9;
          }
          d = vec2(nr * cos(th), nr * sin(th));
          normal = perturb(normal, p, d);`
              : ""
          }
          ${
            kind === "reeded"
              ? `
          float a = atan(vLocal.y, vLocal.x);
          vec2 u = vec2(a, vLocal.z);
          float cyc = fwidth(a) * 180.0 / 6.2831853;
          float w = visible(cyc);
          float edge = 1.0 - smoothstep(0.3, 0.6, abs(vNz));
          d = vec2(cos(a * 180.0) * 0.55 * w * edge, 0.0);
          normal = perturb(normal, u, d);`
              : ""
          }
        }`,
      );
  };
  m.customProgramCacheKey = () => `odd-metal-${kind}`;
  return m;
}

function lacquer(accent: THREE.IUniform<THREE.Color>) {
  const m = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.25,
    roughness: 0.38,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1,
  });
  m.onBeforeCompile = (sh) => {
    withLocal(sh, "lacquer");
    sh.uniforms.uAccent = accent;
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uAccent;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          vec3 base = mix(vec3(0.009, 0.007, 0.006), uAccent, 0.06);
          float r = length(vLocal.xy);
          base *= mix(0.9, 1.15, smoothstep(0.83, 0.97, r));
          vec2 cell = floor(vLocal.xy * 300.0);
          float s = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
          float spark = step(0.988, s) * (1.0 - smoothstep(0.0, 0.35, length(fract(vLocal.xy * 300.0) - 0.5)));
          base += spark * vec3(0.5, 0.42, 0.3) * visible(length(fwidth(vLocal.xy)) * 300.0);
          diffuseColor.rgb = base;
        }`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
        {
          vec2 p = vLocal.xy;
          float r = length(p);
          float th = atan(p.y, p.x);
          float px = length(fwidth(p));
          float G = 160.0;
          float phase = r * G * 6.2831853 + sin(th * 24.0) * 2.2;
          float nr = 0.2 * sin(phase) * visible(px * G * 1.4);
          normal = perturb(normal, p, vec2(nr * cos(th), nr * sin(th)));
        }`,
      );
  };
  m.customProgramCacheKey = () => "odd-lacquer";
  return m;
}

function backMetal(color: string, relief: THREE.Texture) {
  const m = new THREE.MeshStandardMaterial({ color, metalness: 1, roughness: 0.22, envMapIntensity: 1.15, bumpMap: relief, bumpScale: 2.2 });
  m.onBeforeCompile = (sh) => {
    withLocal(sh, "back");
    sh.uniforms.uRelief = { value: relief };
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform sampler2D uRelief;")
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        {
          float h = texture2D(uRelief, vec2(-vLocal.x, vLocal.y) * 0.5 + 0.5).r;
          roughnessFactor = mix(roughnessFactor, 0.5, smoothstep(0.45, 0.3, h));
        }`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          float h = texture2D(uRelief, vec2(-vLocal.x, vLocal.y) * 0.5 + 0.5).r;
          diffuseColor.rgb *= mix(0.6, 1.0, smoothstep(0.2, 0.5, h));
        }`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
        {
          vec2 p = vLocal.xy;
          float r = length(p);
          float th = atan(p.y, p.x);
          float px = length(fwidth(p));
          float G = 120.0;
          float nr = 0.18 * sin(r * G * 6.2831853 + sin(th * 12.0) * 1.2) * visible(px * G) * smoothstep(0.82, 0.8, r);
          normal = perturb(normal, p, vec2(nr * cos(th), nr * sin(th)));
        }`,
      );
  };
  m.customProgramCacheKey = () => "odd-back";
  return m;
}

export interface TokenInstance {
  group: THREE.Group;
  layers: THREE.Group[];
  accent: THREE.IUniform<THREE.Color>;
  setExplode(e: number): void;
  lerpMetal(m: Metal, k: number): void;
  dispose(): void;
}

export class TokenKit {
  private disposables: { dispose(): void }[] = [];
  private geo: Record<"side" | "rim" | "band" | "ring" | "inner" | "back" | "inscription" | "wings" | "body", THREE.BufferGeometry>;
  private relief: THREE.Texture;

  constructor(data: SealData, { quality = 1 } = {}) {
    const { ringIn, ringOut } = data.meta.rings;
    const SEG = quality >= 1 ? 256 : 160;
    this.relief = backRelief(data, quality >= 1 ? 1024 : 512);
    this.disposables.push(this.relief);

    const c = CHAMFER * 0.6;
    this.geo = {
      side: lathe([V(1 - CHAMFER, -THICK), V(1, -THICK + CHAMFER), V(1, RIM - CHAMFER), V(1 - CHAMFER * 0.7, RIM)], SEG),
      rim: lathe([V(1 - CHAMFER * 0.7, RIM), V(0.983, RIM), V(0.977, 0.004), V(0.974, 0)], SEG),
      band: lathe([V(0.974, 0), V(ringOut - 0.004, 0)], SEG),
      ring: lathe(bezelProfile(ringIn, ringOut, 0.05, -0.004), SEG),
      inner: lathe([V(ringIn, -0.004), V(ringIn, -THICK + c), V(ringIn + c, -THICK)], SEG),
      back: lathe([V(ringIn + c, -THICK), V(1 - CHAMFER, -THICK)], SEG),
      inscription: extrude(data.inscription, { depth: 0.011, bevel: 0.004, size: 0.0024, segments: 2, grow: 0.0013 }),
      wings: extrude(data.wings, { depth: 0.145, bevel: 0.012, size: 0.008, segments: 3 }),
      body: extrude(data.body, { depth: 0.15, bevel: 0.014, size: 0.01, segments: 4 }),
    };
    const buv = this.geo.back.attributes.uv;
    for (let i = 0; i < buv.count; i++) buv.setX(i, 1 - buv.getX(i));
    Object.values(this.geo).forEach((g) => this.disposables.push(g));
  }

  build(metalName: keyof typeof METALS = "gold", accentColor = "#dc5000"): TokenInstance {
    const tone = METALS[metalName];
    const accent = { value: new THREE.Color(accentColor) };
    const mats = {
      side: metal(tone.polish, "reeded", 0.26),
      rim: metal(tone.polish, "mirror", 0.12),
      ring: metal(tone.polish, "brush", 0.24),
      inner: metal(tone.polish, "mirror", 0.2),
      frost: metal(tone.frost, "frost", 0.18),
      band: lacquer(accent),
      back: backMetal(tone.polish, this.relief),
    };
    const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, z = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.z = z;
      return m;
    };
    const group = new THREE.Group();
    const layer = (...meshes: THREE.Mesh[]) => {
      const g = new THREE.Group();
      meshes.forEach((m) => g.add(m));
      group.add(g);
      return g;
    };
    const layers = [
      layer(
        mesh(this.geo.side, mats.side),
        mesh(this.geo.rim, mats.rim),
        mesh(this.geo.band, mats.band),
        mesh(this.geo.inner, mats.inner),
        mesh(this.geo.back, mats.back),
      ),
      layer(mesh(this.geo.inscription, mats.frost, 0.004)),
      layer(mesh(this.geo.ring, mats.ring)),
      layer(mesh(this.geo.wings, mats.frost, -THICK + 0.006 + 0.012)),
      layer(mesh(this.geo.body, mats.frost, -THICK + 0.006 + 0.014)),
    ];
    const list = Object.values(mats);
    const polished = [mats.side, mats.rim, mats.ring, mats.inner, mats.back];
    const tone1 = new THREE.Color();
    const tone2 = new THREE.Color();
    return {
      group,
      layers,
      accent,
      lerpMetal(m: Metal, k: number) {
        tone1.set(m.polish);
        tone2.set(m.frost);
        polished.forEach((p) => p.color.lerp(tone1, k));
        mats.frost.color.lerp(tone2, k);
      },
      setExplode(e: number) {
        layers.forEach((l, i) => {
          l.position.z = i * 0.22 * e;
          l.rotation.z = i * 0.045 * e;
        });
      },
      dispose() {
        list.forEach((m) => m.dispose());
      },
    };
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}
