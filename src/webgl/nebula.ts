import * as THREE from "three";

const BAKE_FRAG = `
  uniform vec2 uCenter;
  uniform int uOct;
  uniform int uMid;
  varying vec2 vUv;
  const mat2 ROT = mat2(0.8, 0.6, -0.6, 0.8);
  float h12(vec2 p) {
    vec3 a = fract(vec3(p.xyx) * 0.1031);
    a += dot(a, a.yzx + 33.33);
    return fract((a.x + a.y) * a.z);
  }
  vec2 h22(vec2 p) {
    vec3 a = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    a += dot(a, a.yzx + 33.33);
    return fract((a.xx + a.yz) * a.zy) * 2.0 - 1.0;
  }
  float gn(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    float a = dot(h22(i), f);
    float b = dot(h22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
    float c = dot(h22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
    float d = dot(h22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 1.4;
  }
  float fbm(vec2 p, int n) {
    float s = 0.0;
    float a = 0.5;
    for (int i = 0; i < n; i++) {
      s += a * gn(p);
      p = ROT * p * 2.03 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return s;
  }
  float ridged(vec2 p, int n) {
    float s = 0.0;
    float a = 0.5;
    float w = 1.0;
    for (int i = 0; i < n; i++) {
      float r = 1.0 - abs(gn(p));
      r *= r;
      s += a * r * w;
      w = clamp(r * 1.6, 0.0, 1.0);
      p = ROT * p * 2.11 + vec2(4.3, 2.9);
      a *= 0.5;
    }
    return s;
  }
  vec2 warp(vec2 P) {
    vec2 q = vec2(fbm(P, uMid), fbm(P + vec2(5.2, 1.3), uMid));
    return vec2(fbm(P + 2.0 * q + vec2(1.7, 9.2), uMid), fbm(P + 2.0 * q + vec2(8.3, 2.8), uMid));
  }
  vec3 nebula(vec2 p) {
    vec2 P = p * 1.7 + vec2(3.1, 7.4);
    vec2 w = warp(P * 0.9);
    vec2 d = p - uCenter;
    float big = fbm(p * 1.3 + vec2(11.0, 3.0), uMid);
    float f = fbm(P * 1.25 + 0.7 * w, uOct);
    float fil = ridged(P * 2.3 + 0.8 * w + 4.0, uOct);
    float fine = fbm(P * 6.5 + 0.4 * w + vec2(2.0, 8.0), uOct - 2);
    float lane = fbm(P * 1.6 + 0.9 * w + vec2(7.0, 2.0), uOct - 1);
    vec2 e = mat2(0.88, 0.47, -0.47, 0.88) * d;
    float env = smoothstep(0.95, 0.0, length(e * vec2(0.75, 1.45)) - big * 0.85);
    float rho = smoothstep(-0.08, 0.5, f + big * 0.5) * env;
    rho *= rho * (0.55 + 0.9 * smoothstep(-0.3, 0.3, fine));
    float wisp = pow(clamp(fil, 0.0, 1.0), 6.0) * smoothstep(0.05, 0.6, env + big * 0.25);
    float r = length(d * vec2(0.9, 1.15));
    float core = smoothstep(0.55, 0.0, r + f * 0.25);
    float ha = rho * (0.7 + 0.8 * core) + wisp * 0.8;
    float o3 = (rho * 1.6 + wisp * 0.5 + 0.36 + 0.6 * smoothstep(-0.25, 0.45, f + fine * 0.3)) * core * core;
    vec3 col = vec3(0.8, 0.05, 0.12) * ha;
    col += vec3(0.04, 0.48, 0.56) * o3;
    col += vec3(0.55, 0.3, 0.5) * ha * o3 * 0.8;
    col += vec3(0.035, 0.006, 0.016) * smoothstep(0.0, 0.8, env);
    col *= 1.0 - 0.92 * smoothstep(-0.02, 0.28, lane) * smoothstep(0.0, 0.3, env) * (1.0 - 0.45 * core);
    return col;
  }
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float edge = smoothstep(1.0, 0.97, max(abs(p.x), abs(p.y)));
    vec3 c = 1.0 - exp(-max(nebula(p), 0.0) * edge);
    gl_FragColor = vec4(c + (h12(gl_FragCoord.xy) - 0.5) / 255.0, 1.0);
  }
`;

const CENTER = new THREE.Vector2(0.28, 0.22);
const MARGIN = 1.06;
const PORTRAIT_SHIFT = 0.14;

export interface NebulaState {
  aspect: number;
  pointer: THREE.Vector2;
  progress: number;
  time: number;
  reduced: boolean;
}

export class Nebula {
  target: THREE.WebGLRenderTarget;
  map = new THREE.Vector4(1, 1, 0, 0);
  private size: number;
  private octaves: number;

  constructor({ quality = 1 } = {}) {
    this.size = quality >= 1 ? 2048 : 1024;
    this.octaves = quality >= 1 ? 8 : 7;
    this.target = new THREE.WebGLRenderTarget(this.size, this.size, {
      type: THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    });
  }

  get texture() {
    return this.target.texture;
  }

  async bake(renderer: THREE.WebGLRenderer, frame: () => Promise<void>, cancelled: () => boolean, strips = 32) {
    const material = new THREE.ShaderMaterial({
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: BAKE_FRAG,
      uniforms: { uCenter: { value: CENTER }, uOct: { value: this.octaves }, uMid: { value: 4 } },
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    quad.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(quad);
    const cam = new THREE.OrthographicCamera();
    const rt = this.target;
    const rows = Math.ceil(this.size / strips);
    try {
      await renderer.compileAsync(scene, cam);
      for (let y = 0; y < this.size; y += rows) {
        if (cancelled()) return false;
        rt.scissor.set(0, y, this.size, Math.min(rows, this.size - y));
        rt.scissorTest = true;
        const prev = renderer.getRenderTarget();
        renderer.setRenderTarget(rt);
        renderer.render(scene, cam);
        renderer.setRenderTarget(prev);
        await frame();
      }
      return !cancelled();
    } finally {
      rt.scissorTest = false;
      material.dispose();
      quad.geometry.dispose();
    }
  }

  update(s: NebulaState) {
    const live = s.reduced ? 0 : 1;
    const k = (1 / (Math.max(s.aspect, 1) * MARGIN)) * (1 - 0.03 * s.progress);
    const t = s.time * live;
    this.map.set(
      k,
      k,
      (s.aspect < 0.85 ? PORTRAIT_SHIFT : 0) + s.pointer.x * live * 0.006 + Math.sin(t * 0.021) * 0.003,
      s.pointer.y * live * 0.004 - (s.progress - 0.5) * 0.016 + Math.cos(t * 0.017) * 0.002,
    );
  }

  dispose() {
    this.target.dispose();
  }
}
