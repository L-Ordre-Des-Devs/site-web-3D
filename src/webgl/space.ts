import * as THREE from "three";

const NOISE = `
  float hash13(vec3 p3) {
    p3 = fract(p3 * 0.1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
  }
  float vnoise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), u.x), mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), u.x), u.y),
      mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), u.x), mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), u.x), u.y),
      u.z);
  }
  float fbm3(vec3 p) {
    float a = 0.5;
    float s = 0.0;
    for (int i = 0; i < 6; i++) {
      s += a * vnoise3(p);
      p = p * 2.03 + 17.1;
      a *= 0.5;
    }
    return s;
  }
`;

function makeStars(count: number) {
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const seed = new Float32Array(count);
  const temp = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const z = -18 - Math.pow(Math.random(), 0.6) * 46;
    const spread = (10 - z) * 0.3;
    pos[i * 3] = (Math.random() * 2 - 1) * spread * 2.1;
    pos[i * 3 + 1] = (Math.random() * 2 - 1) * spread * 1.6;
    pos[i * 3 + 2] = z;
    const b = Math.pow(Math.random(), 7);
    size[i] = 1.0 + b * 3.6;
    seed[i] = Math.random();
    temp[i] = Math.random();
  }
  for (let i = 0; i < Math.min(28, count); i++) {
    size[i] = 5.5 + Math.random() * 5;
    pos[i * 3 + 2] = -30 - Math.random() * 20;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geo.setAttribute("aTemp", new THREE.BufferAttribute(temp, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: { uTime: { value: 0 }, uDpr: { value: 1 }, uAmount: { value: 1 }, uShift: { value: new THREE.Vector2() } },
    vertexShader: `
      attribute float aSize; attribute float aSeed; attribute float aTemp;
      uniform float uTime; uniform float uDpr; uniform float uAmount; uniform vec2 uShift;
      varying float vA; varying vec3 vC; varying float vBig;
      void main() {
        vec3 p = position;
        float depth = clamp((-p.z - 18.0) / 46.0, 0.0, 1.0);
        p.xy += uShift * mix(1.0, 0.25, depth);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        float tw = 0.7 + 0.3 * sin(uTime * (0.6 + aSeed * 2.4) + aSeed * 60.0);
        vBig = step(5.0, aSize);
        vA = uAmount * tw * mix(0.7, 1.25, smoothstep(1.0, 3.5, aSize));
        vec3 warm = vec3(1.0, 0.86, 0.68);
        vec3 cool = vec3(0.78, 0.86, 1.0);
        vC = aTemp < 0.12 ? vec3(1.0, 0.62, 0.38) : mix(cool, warm, aTemp);
        gl_PointSize = aSize * uDpr;
      }
    `,
    fragmentShader: `
      varying float vA; varying vec3 vC; varying float vBig;
      void main() {
        vec2 q = gl_PointCoord - 0.5;
        float d = length(q);
        float core = exp(-d * d * 60.0);
        float halo = exp(-d * 9.0) * 0.35;
        float spikes = vBig * (exp(-abs(q.x) * 70.0) * exp(-abs(q.y) * 5.5) + exp(-abs(q.y) * 70.0) * exp(-abs(q.x) * 5.5)) * 0.7;
        float a = (core + halo + spikes) * vA;
        gl_FragColor = vec4(vC * a, a);
      }
    `,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = -900;
  return pts;
}

function makePlanet(radius: number) {
  const geo = new THREE.SphereGeometry(radius, 192, 144);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uSun: { value: new THREE.Vector3(0.6, 0.35, -0.72).normalize() },
      uFade: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec3 vN; varying vec3 vW; varying vec3 vObj;
      void main() {
        vObj = normalize(position);
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: `
      uniform vec3 uSun; uniform float uFade; uniform float uTime;
      varying vec3 vN; varying vec3 vW; varying vec3 vObj;
      ${NOISE}
      float fbmN(vec3 p, int n) {
        float a = 0.5;
        float s = 0.0;
        for (int i = 0; i < 6; i++) {
          if (i >= n) break;
          s += a * vnoise3(p);
          p = p * 2.03 + 17.1;
          a *= 0.5;
        }
        return s;
      }
      float ridged(vec3 p) {
        float a = 0.5;
        float s = 0.0;
        for (int i = 0; i < 4; i++) {
          float n = 1.0 - abs(vnoise3(p) * 2.0 - 1.0);
          s += a * n * n;
          p = p * 2.07 + 11.3;
          a *= 0.5;
        }
        return s;
      }
      float craters(vec3 p) {
        vec3 i = floor(p - 0.5);
        float h = 0.0;
        for (int z = 0; z <= 1; z++)
          for (int y = 0; y <= 1; y++)
            for (int x = 0; x <= 1; x++) {
              vec3 c = i + vec3(float(x), float(y), float(z));
              if (hash13(c + 9.9) <= 0.55) continue;
              vec3 o = vec3(hash13(c), hash13(c + 7.1), hash13(c + 13.7));
              float size = 0.16 + 0.22 * hash13(c + 3.3);
              float d = length(c + o - p) / size;
              if (d < 1.3) h += -0.6 * (1.0 - smoothstep(0.0, 0.85, d)) + 0.45 * smoothstep(0.7, 0.95, d) * (1.0 - smoothstep(0.95, 1.3, d));
            }
        return h;
      }
      float heightAt(vec3 p, out float continents) {
        continents = fbmN(p * 1.7, 5);
        float hills = smoothstep(0.45, 0.68, continents);
        float mountains = hills > 0.0 ? ridged(p * 5.0) * hills : 0.0;
        float lowland = 1.0 - smoothstep(0.42, 0.62, continents);
        float dunes = lowland > 0.0 ? sin(dot(p, vec3(46.0, 15.0, 9.0)) + fbmN(p * 7.0, 3) * 6.5) * 0.5 + 0.5 : 0.0;
        return continents * 0.7 + mountains * 0.42 + dunes * 0.035 * lowland + craters(p * 9.0) * 0.06;
      }
      void main() {
        vec3 n = normalize(vN);
        vec3 v = normalize(cameraPosition - vW);
        vec3 p = vObj * 2.4;
        float continents;
        float h = heightAt(p, continents);
        vec3 dpx = dFdx(p) * 100.0;
        vec3 dpy = dFdy(p) * 100.0;
        vec3 r1 = cross(dpy, n);
        vec3 r2 = cross(n, dpx);
        float det = dot(dpx, r1);
        vec3 grad = 100.0 * sign(det) * (dFdx(h) * r1 + dFdy(h) * r2) / max(abs(det), 1e-8);
        vec3 nb = normalize(n - grad * 0.018);
        vec3 L = normalize(uSun * 0.75 + vec3(0.05, 0.42, 0.3));
        float ndl = dot(nb, L);
        float ndlBase = dot(n, L);
        vec3 basin = vec3(0.28, 0.12, 0.06);
        vec3 plain = vec3(0.7, 0.42, 0.22);
        vec3 high = vec3(0.9, 0.7, 0.46);
        vec3 col = mix(basin, plain, smoothstep(0.3, 0.5, continents));
        col = mix(col, high, smoothstep(0.55, 0.75, h));
        col = mix(col, vec3(0.32, 0.18, 0.1), smoothstep(0.75, 0.95, h) * 0.6);
        col *= 0.85 + 0.3 * fbmN(p * 22.0, 3);
        float lit = smoothstep(-0.05, 0.6, ndl) * smoothstep(-0.25, 0.15, ndlBase);
        float terminator = exp(-pow((ndlBase + 0.03) * 7.0, 2.0));
        vec3 shade = col * lit * 0.92 + vec3(0.55, 0.2, 0.06) * terminator * 0.2;
        float rim = pow(1.0 - max(dot(n, v), 0.0), 2.5);
        float sunSide = smoothstep(-0.4, 0.6, ndlBase);
        shade = mix(shade, mix(vec3(0.2, 0.32, 0.6), vec3(1.0, 0.64, 0.36), sunSide), rim * (0.25 + 0.5 * sunSide));
        shade += vec3(0.01, 0.012, 0.022) * (1.0 - lit);
        gl_FragColor = vec4(shade, 1.0 - uFade);
      }
    `,
  });
  return new THREE.Mesh(geo, mat);
}

function makeAtmosphere(radius: number) {
  const geo = new THREE.SphereGeometry(radius * 1.045, 160, 120);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: { uSun: { value: new THREE.Vector3(0.6, 0.35, -0.72).normalize() }, uFade: { value: 0 }, uRatio: { value: 1.045 } },
    vertexShader: `
      varying vec3 vN; varying vec3 vW;
      void main() {
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: `
      uniform vec3 uSun; uniform float uFade; uniform float uRatio;
      varying vec3 vN; varying vec3 vW;
      void main() {
        vec3 n = normalize(vN);
        vec3 v = normalize(cameraPosition - vW);
        float edge = pow(max(dot(-n, v), 0.0), 1.0);
        float glow = smoothstep(0.0, 0.45, edge) * (1.0 - smoothstep(0.45, 1.0, edge));
        glow = pow(glow, 1.6);
        float sunSide = smoothstep(-0.5, 0.9, dot(n, uSun));
        vec3 warm = vec3(1.0, 0.6, 0.28);
        vec3 cool = vec3(0.35, 0.58, 1.0);
        vec3 col = mix(cool * 0.55, warm * 1.6, sunSide);
        float a = glow * (0.35 + sunSide * 1.2) * (1.0 - uFade);
        gl_FragColor = vec4(col * a, a);
      }
    `,
  });
  const m = new THREE.Mesh(geo, mat);
  m.renderOrder = 2;
  return m;
}

function makeSun(size: number, tint: THREE.Color) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: { uTint: { value: tint }, uAmount: { value: 1 } },
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `
      uniform vec3 uTint; uniform float uAmount; varying vec2 vUv;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float disc = smoothstep(0.075, 0.06, d);
        float corona = exp(-d * 14.0) * 1.4;
        float halo = exp(-d * 3.6) * 0.5 + exp(-d * 1.4) * 0.12;
        vec3 col = vec3(1.0, 0.97, 0.9) * disc * 3.0 + uTint * (corona + halo);
        float a = (disc + corona + halo) * uAmount;
        gl_FragColor = vec4(col * uAmount, a);
      }
    `,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  m.renderOrder = 1;
  return m;
}

function makeFlare() {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: { uSun: { value: new THREE.Vector2(0.6, -0.3) }, uAmount: { value: 0 }, uAspect: { value: 1 } },
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `
      uniform vec2 uSun; uniform float uAmount; uniform float uAspect; varying vec2 vUv;
      float ghost(vec2 p, vec2 c, float r, float soft) {
        float d = length((p - c) * vec2(uAspect, 1.0));
        return smoothstep(r, r - soft, d) * 0.5 + exp(-d * d / (r * r) * 3.0) * 0.12;
      }
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        vec2 s = uSun;
        float dy = abs(p.y - s.y);
        float dx = abs(p.x - s.x) * uAspect;
        float streak = exp(-dy * 90.0) * exp(-dx * 1.1) * 0.9 + exp(-dy * 22.0) * exp(-dx * 2.6) * 0.25;
        vec3 col = vec3(1.0, 0.62, 0.32) * streak;
        vec2 axis = -s;
        col += vec3(1.0, 0.6, 0.3) * ghost(p, s + axis * 0.55, 0.05, 0.02) * 0.22;
        col += vec3(1.0, 0.55, 0.25) * ghost(p, s + axis * 1.3, 0.11, 0.05) * 0.14;
        col += vec3(1.0, 0.72, 0.45) * ghost(p, s + axis * 2.1, 0.18, 0.12) * 0.08;
        gl_FragColor = vec4(col * uAmount, 1.0);
      }
    `,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  m.frustumCulled = false;
  m.renderOrder = 20;
  return m;
}

function makeDust(count: number) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() * 2 - 1) * 4.5;
    pos[i * 3 + 1] = (Math.random() * 2 - 1) * 2.8;
    pos[i * 3 + 2] = 1 + Math.random() * 6.5;
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: { uTime: { value: 0 }, uDpr: { value: 1 }, uAmount: { value: 1 } },
    vertexShader: `
      attribute float aSeed;
      uniform float uTime; uniform float uDpr; uniform float uAmount;
      varying float vA;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.07 + aSeed * 40.0) * 0.35;
        p.y = mod(position.y + 2.8 + uTime * (0.02 + aSeed * 0.03), 5.6) - 2.8;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float near = clamp((p.z - 1.0) / 6.5, 0.0, 1.0);
        gl_PointSize = mix(3.0, 26.0, near) * uDpr * (0.6 + aSeed * 0.8);
        float lit = smoothstep(-0.2, 1.0, (gl_Position.x / gl_Position.w) * 0.6 - (gl_Position.y / gl_Position.w) * 0.4);
        float shimmer = 0.7 + 0.3 * sin(uTime * 0.5 + aSeed * 30.0);
        vA = uAmount * (0.05 + 0.2 * lit) * shimmer;
      }
    `,
    fragmentShader: `
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = smoothstep(1.0, 0.2, d) * vA;
        gl_FragColor = vec4(vec3(1.0, 0.8, 0.6) * a, a);
      }
    `,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = 15;
  return pts;
}

function makeWarp(count: number) {
  const pos = new Float32Array(count * 2 * 3);
  const tail = new Float32Array(count * 2);
  const seed = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.6 + Math.pow(Math.random(), 0.7) * 9;
    const z = -Math.random() * 60;
    const s = Math.random();
    for (let k = 0; k < 2; k++) {
      const j = i * 2 + k;
      pos.set([Math.cos(a) * r, Math.sin(a) * r * 0.62, z], j * 3);
      tail[j] = k;
      seed[j] = s;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aTail", new THREE.BufferAttribute(tail, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: { uTime: { value: 0 }, uWarp: { value: 0 } },
    vertexShader: `
      attribute float aTail; attribute float aSeed;
      uniform float uTime; uniform float uWarp;
      varying float vA;
      void main() {
        vec3 p = position;
        float speed = 6.0 + aSeed * 10.0;
        float z = mod(p.z + uTime * speed, 60.0) - 58.0;
        float len = (0.2 + aSeed * 0.8) * uWarp * 9.0;
        p.z = z - aTail * len;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        vA = uWarp * (1.0 - aTail) * smoothstep(-58.0, -40.0, z) * (0.4 + aSeed * 0.6);
      }
    `,
    fragmentShader: `
      varying float vA;
      void main() { gl_FragColor = vec4(vec3(0.86, 0.92, 1.0) * vA, vA); }
    `,
  });
  const lines = new THREE.LineSegments(geo, mat);
  lines.frustumCulled = false;
  lines.renderOrder = -800;
  return lines;
}

export interface SpaceState {
  scroll: number;
  worldPerPx: number;
  stars: number;
  planet: number;
  warp: number;
  dpr: number;
  pointer: THREE.Vector2;
  aspect: number;
  focus: THREE.Vector2;
}

export class Space {
  group = new THREE.Group();
  stars: THREE.Points;
  dust: THREE.Points;
  warp: THREE.LineSegments;
  flare: THREE.Mesh;
  private planet: THREE.Mesh;
  private atmosphere: THREE.Mesh;
  private suns: THREE.Mesh[];
  private sunAnchor = new THREE.Vector3();
  private tmp = new THREE.Vector3();
  private base = new THREE.Vector3();
  private back = new THREE.Vector3(0, 0, -1);
  private radius = 13;

  constructor({ quality = 1 } = {}) {
    this.stars = makeStars(quality >= 1 ? 3400 : 1600);
    this.dust = makeDust(quality >= 1 ? 160 : 70);
    this.warp = makeWarp(quality >= 1 ? 700 : 360);
    this.flare = makeFlare();
    this.planet = makePlanet(this.radius);
    this.atmosphere = makeAtmosphere(this.radius);
    this.suns = [makeSun(9, new THREE.Color(1.0, 0.56, 0.24)), makeSun(5, new THREE.Color(1.0, 0.72, 0.42))];
    this.group.add(this.planet, this.atmosphere, ...this.suns);
  }

  layout(frame: (z: number) => { w: number; h: number }) {
    const pz = -14;
    const f = frame(pz);
    const portrait = f.w / f.h < 0.9;
    this.base.set(f.w * (portrait ? 0.1 : 0.22), -f.h * 0.5 - this.radius * 0.8, pz);
    this.planet.position.copy(this.base);
    this.atmosphere.position.copy(this.base);
    const sz = -60;
    const fs = frame(sz);
    this.sunAnchor.set(fs.w * (portrait ? 0.22 : 0.32), -fs.h * (portrait ? 0.1 : 0.16), sz);
    this.suns[0].position.copy(this.sunAnchor);
    this.suns[1].position.copy(this.sunAnchor).add(new THREE.Vector3(fs.w * 0.08, fs.h * 0.035, 0));
    const sun = this.tmp.copy(this.sunAnchor).sub(this.base).normalize();
    (this.planet.material as THREE.ShaderMaterial).uniforms.uSun.value.copy(sun);
    (this.atmosphere.material as THREE.ShaderMaterial).uniforms.uSun.value.copy(sun);
  }

  update(dt: number, time: number, s: SpaceState, camera: THREE.PerspectiveCamera) {
    this.group.position.y = -s.scroll * s.worldPerPx * 0.32;
    const fade = 1 - s.planet;
    this.group.visible = s.planet > 0.005;
    (this.planet.material as THREE.ShaderMaterial).uniforms.uFade.value = fade;
    (this.atmosphere.material as THREE.ShaderMaterial).uniforms.uFade.value = fade;
    this.suns.forEach((m) => ((m.material as THREE.ShaderMaterial).uniforms.uAmount.value = s.planet));

    const st = this.stars.material as THREE.ShaderMaterial;
    st.uniforms.uTime.value = time;
    st.uniforms.uDpr.value = s.dpr;
    st.uniforms.uAmount.value = s.stars;
    st.uniforms.uShift.value.set(-s.pointer.x * 0.25, -s.pointer.y * 0.15 + s.scroll * s.worldPerPx * 0.06);
    this.stars.visible = s.stars > 0.005;

    const du = this.dust.material as THREE.ShaderMaterial;
    du.uniforms.uTime.value = time;
    du.uniforms.uDpr.value = s.dpr;
    du.uniforms.uAmount.value = s.planet;
    this.dust.visible = s.planet > 0.01;

    const wm = this.warp.material as THREE.ShaderMaterial;
    wm.uniforms.uTime.value = time;
    wm.uniforms.uWarp.value = s.warp;
    this.warp.visible = s.warp > 0.005;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    this.tmp.set(s.focus.x * t * camera.aspect, s.focus.y * t, -1).normalize();
    this.warp.quaternion.setFromUnitVectors(this.back, this.tmp);

    const p = this.tmp.copy(this.sunAnchor);
    p.y += this.group.position.y;
    p.project(camera);
    const fm = this.flare.material as THREE.ShaderMaterial;
    fm.uniforms.uSun.value.set(p.x, p.y);
    fm.uniforms.uAspect.value = s.aspect;
    fm.uniforms.uAmount.value = s.planet * (p.y > -1.2 && p.y < 1.2 ? 1 : 0) * 0.85;
    this.flare.visible = fm.uniforms.uAmount.value > 0.01;
  }

  dispose() {
    [this.stars, this.dust, this.warp, this.flare, this.planet, this.atmosphere, ...this.suns].forEach((o) => {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    });
  }
}
