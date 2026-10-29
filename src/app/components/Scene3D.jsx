'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/*
  SOURCE SPACE  (black theme, developer aesthetic)

  Pure black ekta jogot-e scroll korle camera ure jay:
    1. Code glyph field: { } => ; # 0 1 ... hajar hajar monospace okkhor
       3D te bhashe, dhire niche namche, charactergulo nijeder bodlay.
    2. Commit graph: git branch-er moto potli line, node ar chola commit packet.
    3. Dot-grid floor: blueprint / terminal grid.
    4. Dure ekta boro blinking terminal caret ( ▌ ) jar dike tumi urcho.

  Rong: mostly white/grey (professional). Shudhu ektu green, aar bohu kom red
  (Bangladesh). Section id: #home #about #stack #projects #github #contact
  (kono id-r upor depend kore na, shudhu scroll progress)
*/

/* ---------- tuning knobs ---------- */
const TRAVEL = 200; // scroll shesh hole camera koto unit egobe
const START_Z = 24;
const FOG = 0.013;
const GREEN = 0x00d68f;
const RED = 0xf42a41;
const WHITE = 0xe6e9ef;
const GLYPHS = '{}[]()<>/\\;:=+-*&|!?#$%@^~_.,0123456789`"\'fnxyzabcrstiovdel'
  .padEnd(64, '=')
  .slice(0, 64);

const clamp01 = v => Math.min(1, Math.max(0, v));

/* ---------- shaders ---------- */
const GLYPH_VERT = `
  attribute vec3 aPos;
  attribute float aGlyph;
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  varying vec2 vUv;
  varying float vGlyph;
  varying float vSeed;
  varying float vDist;
  varying float vFade;
  void main() {
    float speed = 0.5 + aSeed * 1.6;
    float y = mod(aPos.y - uTime * speed + 5.0, 50.0) - 5.0;
    vFade = smoothstep(-5.0, 0.0, y) * (1.0 - smoothstep(34.0, 45.0, y));
    vec3 c = vec3(aPos.x, y, aPos.z);
    vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    vec3 wp = c + (right * position.x + up * position.y) * aSize;
    vec4 mv = viewMatrix * vec4(wp, 1.0);
    vUv = uv;
    vGlyph = aGlyph;
    vSeed = aSeed;
    vDist = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const GLYPH_FRAG = `
  uniform sampler2D uAtlas;
  uniform float uTime;
  uniform float uFogD;
  uniform vec3 uWhite;
  uniform vec3 uGreen;
  uniform vec3 uRed;
  varying vec2 vUv;
  varying float vGlyph;
  varying float vSeed;
  varying float vDist;
  varying float vFade;
  void main() {
    float idx = mod(vGlyph + floor(uTime * (0.25 + vSeed * 1.1) + vSeed * 10.0), 64.0);
    float cx = mod(idx, 8.0);
    float cy = floor(idx / 8.0);
    vec2 uv = (vec2(cx, 7.0 - cy) + vUv) / 8.0;
    float a = texture2D(uAtlas, uv).a;
    vec3 col = vSeed < 0.82 ? uWhite * 0.62 : (vSeed < 0.96 ? uGreen : uRed);
    float ff = exp(-uFogD * uFogD * vDist * vDist);
    float nearK = smoothstep(4.0, 14.0, vDist);
    float tw = 0.6 + 0.4 * sin(uTime * (0.8 + vSeed * 2.0) + vSeed * 30.0);
    gl_FragColor = vec4(col * a * ff * nearK * tw * vFade, 1.0);
  }
`;

const CARET_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const CARET_FRAG = `
  uniform float uTime;
  uniform vec3 uGreen;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float on = step(0.5, fract(uTime * 0.8));
    float level = mix(0.12, 1.0, on);
    float body = step(abs(p.x), 0.16) * step(abs(p.y), 0.7);
    float glow = exp(-length(p * vec2(1.4, 0.55)) * 3.2) * 0.55;
    vec3 rgb = (uGreen * 1.1 + vec3(0.25)) * body * level + uGreen * glow * level;
    gl_FragColor = vec4(rgb, 1.0);
  }
`;

/* ---------- helpers ---------- */
function glyphAtlas() {
  const S = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = S * 8;
  const g = canvas.getContext('2d');
  g.font = `600 42px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#fff';
  [...GLYPHS].forEach((ch, i) =>
    g.fillText(ch, (i % 8) * S + S / 2, Math.floor(i / 8) * S + S / 2 + 2),
  );
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.9)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export default function Scene3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = matchMedia('(max-width: 760px)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !small,
        powerPreference: 'high-performance',
      });
    } catch (error) {
      document.documentElement.classList.add('no-webgl');
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
    renderer.setClearColor(0x000000, 1); /* pure black */
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, FOG);
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 600);
    camera.position.set(0, 3, START_Z);

    const disposables = [];
    const track = item => (disposables.push(item), item);
    const loops = [];
    const uTime = { value: 0 };
    const dotTex = track(dotTexture());

    /* ---------- 1. code glyph field (1 draw call) ---------- */
    const gCount = small ? 1500 : 4200;
    const zFar = START_Z - TRAVEL - 170;
    const gPos = new Float32Array(gCount * 3);
    const gGlyph = new Float32Array(gCount);
    const gSeed = new Float32Array(gCount);
    const gSize = new Float32Array(gCount);
    for (let i = 0; i < gCount; i++) {
      gPos.set(
        [
          (Math.random() - 0.5) * 90,
          Math.random() * 50 - 5,
          START_Z + 12 - Math.random() * (START_Z + 12 - zFar),
        ],
        i * 3,
      );
      gGlyph[i] = Math.floor(Math.random() * 64);
      gSeed[i] = Math.random();
      gSize[i] = 0.55 + Math.random() * 1.1;
    }
    const quad = track(new THREE.PlaneGeometry(1, 1));
    const gGeo = track(new THREE.InstancedBufferGeometry());
    gGeo.index = quad.index;
    ['position', 'normal', 'uv'].forEach(k =>
      gGeo.setAttribute(k, quad.attributes[k]),
    );
    gGeo.setAttribute('aPos', new THREE.InstancedBufferAttribute(gPos, 3));
    gGeo.setAttribute('aGlyph', new THREE.InstancedBufferAttribute(gGlyph, 1));
    gGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(gSeed, 1));
    gGeo.setAttribute('aSize', new THREE.InstancedBufferAttribute(gSize, 1));
    gGeo.instanceCount = gCount;
    const atlas = track(glyphAtlas());
    const glyphs = new THREE.Mesh(
      gGeo,
      track(
        new THREE.ShaderMaterial({
          vertexShader: GLYPH_VERT,
          fragmentShader: GLYPH_FRAG,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uAtlas: { value: atlas },
            uTime,
            uFogD: { value: FOG },
            uWhite: { value: new THREE.Color(WHITE) },
            uGreen: { value: new THREE.Color(GREEN) },
            uRed: { value: new THREE.Color(RED) },
          },
        }),
      ),
    );
    glyphs.frustumCulled = false;
    scene.add(glyphs);

    /* ---------- 2. dot-grid floor ---------- */
    const step = small ? 4.5 : 3;
    const fp = [];
    for (let z = START_Z + 12; z > zFar; z -= step) {
      for (let x = -48; x <= 48; x += step) fp.push(x, -6, z);
    }
    const floorGeo = track(new THREE.BufferGeometry());
    floorGeo.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3));
    const floor = new THREE.Points(
      floorGeo,
      track(
        new THREE.PointsMaterial({
          size: 0.28,
          map: dotTex,
          color: 0x7b8394,
          transparent: true,
          opacity: 0.55,
          alphaTest: 0.05,
          depthWrite: false,
        }),
      ),
    );
    floor.frustumCulled = false;
    scene.add(floor);

    /* ---------- 3. commit graph (git branches) ---------- */
    const branchDefs = [
      { color: GREEN, op: 0.7, ox: 0, oy: 3 },
      { color: WHITE, op: 0.28, ox: -9, oy: 6 },
      { color: WHITE, op: 0.28, ox: 9, oy: 0 },
      { color: RED, op: 0.6, ox: 5, oy: 8 },
      { color: 0x8a90a0, op: 0.3, ox: -14, oy: 2 },
    ];
    const branches = branchDefs.map((d, b) => {
      const ctrl = [];
      const n = Math.round((TRAVEL + 200) / 28);
      for (let i = 0; i < n; i++) {
        ctrl.push(
          new THREE.Vector3(
            d.ox + Math.sin(i * 0.75 + b * 1.9) * 6,
            d.oy + Math.cos(i * 0.55 + b * 2.3) * 3.5,
            START_Z + 10 - i * 28,
          ),
        );
      }
      const curve = new THREE.CatmullRomCurve3(ctrl);
      const line = new THREE.Line(
        track(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(n * 14)),
        ),
        track(
          new THREE.LineBasicMaterial({
            color: d.color,
            transparent: true,
            opacity: d.op,
            depthWrite: false,
          }),
        ),
      );
      line.frustumCulled = false;
      const nodes = new THREE.Points(
        track(new THREE.BufferGeometry().setFromPoints(ctrl)),
        track(
          new THREE.PointsMaterial({
            size: 0.55,
            map: dotTex,
            color: d.color,
            transparent: true,
            opacity: Math.min(1, d.op + 0.3),
            alphaTest: 0.05,
            depthWrite: false,
          }),
        ),
      );
      nodes.frustumCulled = false;
      const packet = new THREE.Mesh(
        track(new THREE.SphereGeometry(0.22, 12, 12)),
        track(new THREE.MeshBasicMaterial({ color: d.color })),
      );
      packet.frustumCulled = false;
      scene.add(line, nodes, packet);
      return { curve, packet, speed: 0.025 + b * 0.007, off: b * 0.21 };
    });
    loops.push(t =>
      branches.forEach(br => {
        const p = (t * br.speed + br.off) % 1;
        br.packet.position.copy(br.curve.getPointAt(p));
      }),
    );

    /* ---------- 4. terminal caret in the distance ---------- */
    const caret = new THREE.Mesh(
      track(new THREE.PlaneGeometry(14, 28)),
      track(
        new THREE.ShaderMaterial({
          vertexShader: CARET_VERT,
          fragmentShader: CARET_FRAG,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: { uTime, uGreen: { value: new THREE.Color(GREEN) } },
        }),
      ),
    );
    caret.frustumCulled = false;
    scene.add(caret);

    /* ---------- pointer / resize ---------- */
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    const onPointer = e => {
      pointer.x = (e.clientX / innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / innerHeight - 0.5) * 2;
    };
    if (!reduce) addEventListener('pointermove', onPointer, { passive: true });

    function resize() {
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    }
    resize();
    addEventListener('resize', resize);

    /* ---------- loop ---------- */
    const clock = new THREE.Clock();
    let camZ = START_Z;
    let vel = 0;
    let fov = 58;
    let raf = 0;
    let running = true;

    function frame() {
      raf = requestAnimationFrame(frame);
      if (!running) return;
      const t = reduce ? 0 : clock.getElapsedTime();
      uTime.value = t;
      pointer.sx += (pointer.x - pointer.sx) * 0.05;
      pointer.sy += (pointer.y - pointer.sy) * 0.05;

      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - innerHeight,
      );
      const prog = clamp01(scrollY / maxScroll);
      const prev = camZ;
      camZ += (START_Z - prog * TRAVEL - camZ) * (reduce ? 1 : 0.06);
      vel += (prev - camZ - vel) * 0.12;

      const sway = Math.sin(prog * 8);
      const cx = sway * 2 + pointer.sx * 1.5;
      const cy =
        3 +
        Math.sin(prog * Math.PI) * 3 -
        pointer.sy * 0.7 +
        Math.sin(t * 0.4) * 0.1;
      camera.position.set(cx, cy, camZ);
      camera.lookAt(
        cx * 0.3 + pointer.sx * 2.5,
        cy * 0.8 + 1.5 - pointer.sy,
        camZ - 40,
      );
      camera.rotateZ(-pointer.sx * 0.03 - sway * 0.03);

      const targetFov = 58 + Math.min(Math.abs(vel) * 35, 18);
      fov += (targetFov - fov) * 0.1;
      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }

      caret.position.set(0, 10, camZ - 230);
      loops.forEach(fn => fn(t));
      renderer.render(scene, camera);
    }
    frame();

    const onVisibility = () => (running = !document.hidden);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onPointer);
      removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      disposables.forEach(d => d.dispose?.());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="scene3d" aria-hidden="true" />;
}
