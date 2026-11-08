'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/*
  PASTEL DREAM SPACE  (light theme, 3 color palette)

  Scroll korle camera ekta pastel jogot-er bhetor diye egiye jay:
    1. HERO MODEL: hero-r dane ekta boro peach orb + blue ring + lavender crystal
       (photo-r pichone floating kore, mouse e halka nore)
    2. Floating shapes: low-poly crystal, torus, orb, knot: sob 3 palette color e
    3. Flowing ribbons: 3 ta nodir moto ribbon, jeta puro page jure bey jay
    4. Soft dust: choto choto glowing dot
    5. Dure ekta boro sunset-peach sun

  Color ratio (logo er moto): blue ~70% | lavender ~28% | peach ~2%.
  Color change korte chaile shudhu niche PALETTE bodlao.
  Section id (#home #about #stack ...) er upor kono depend kore na, shudhu scroll progress.
*/

/* ---------- tuning knobs ---------- */
const PALETTE = {
  blue: 0x81adea, // Powder Blue
  lavender: 0xe0dcf3, // Soft Lavender White
  peach: 0xeeaa93, // Warm Sunset Peach
  paper: 0x81adea, // background / fog (= blue)
};
const TRAVEL = 200; // scroll shesh hole camera koto unit egobe
const START_Z = 24;
const FOG = 0.011;
const SHAPE_COUNT = 46; // mobile e auto kome jay

const clamp01 = v => Math.min(1, Math.max(0, v));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

/* ---------- helpers ---------- */
function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function softMaterial(color, opts = {}) {
  const col = new THREE.Color(color);
  return new THREE.MeshStandardMaterial({
    color: col,
    emissive: col,
    emissiveIntensity: 0.28, // pastel ke ujjol rakhe, kalo hote dey na
    roughness: 0.38,
    metalness: 0.05,
    ...opts,
  });
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
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (error) {
      document.documentElement.classList.add('no-webgl');
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
    renderer.setClearColor(
      0x000000,
      0,
    ); /* transparent: CSS mesh bg niche dekha jay */
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(PALETTE.paper, FOG);
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 600);
    camera.position.set(0, 3, START_Z);
    scene.add(camera);

    /* lights camera r sathe thake, tai sob shape sobsomoy ujjol */
    camera.add(new THREE.HemisphereLight(0xffffff, PALETTE.lavender, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-6, 10, 8);
    camera.add(key);
    const rim = new THREE.PointLight(PALETTE.peach, 260, 80, 2);
    rim.position.set(10, 2, -6);
    camera.add(rim);

    const disposables = [];
    const track = item => (disposables.push(item), item);
    const loops = [];
    const glowTex = track(glowTexture());
    const zFar = START_Z - TRAVEL - 170;
    /* logo ratio: lavender beshi, blue majhari, peach shudhu ekdom kom */
    const colors = [
      ...Array(13).fill(PALETTE.lavender),
      ...Array(6).fill(PALETTE.blue),
      PALETTE.peach,
    ];

    /* ---------- 1. HERO MODEL (right side, photo-r pichone) ---------- */
    const hero = new THREE.Group();
    hero.position.set(small ? 0 : 8.5, small ? 6 : 3.2, START_Z - 24);
    const orb = new THREE.Mesh(
      track(new THREE.SphereGeometry(4.2, 48, 48)),
      track(softMaterial(PALETTE.lavender, { roughness: 0.22 })),
    );
    const ring = new THREE.Mesh(
      track(new THREE.TorusGeometry(6.6, 0.22, 24, 120)),
      track(softMaterial(PALETTE.peach, { roughness: 0.25 })),
    );
    ring.rotation.x = Math.PI / 2.6;
    const ring2 = new THREE.Mesh(
      track(new THREE.TorusGeometry(8.4, 0.16, 16, 120)),
      track(softMaterial(PALETTE.lavender)),
    );
    ring2.rotation.set(Math.PI / 2.1, 0.5, 0);
    const crystal = new THREE.Mesh(
      track(new THREE.IcosahedronGeometry(1.5, 0)),
      track(softMaterial(PALETTE.lavender, { flatShading: true })),
    );
    const moon = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.9, 32, 32)),
      track(softMaterial(PALETTE.peach)),
    );
    hero.add(orb, ring, ring2, crystal, moon);
    scene.add(hero);
    loops.push((t, px, py) => {
      hero.rotation.y = t * 0.12 + px * 0.25;
      hero.rotation.x = py * 0.12;
      hero.position.y = (small ? 6 : 3.2) + Math.sin(t * 0.6) * 0.45;
      ring.rotation.z = t * 0.25;
      ring2.rotation.z = -t * 0.18;
      crystal.position.set(
        Math.cos(t * 0.5) * 7.6,
        Math.sin(t * 0.7) * 2.2,
        Math.sin(t * 0.5) * 7.6,
      );
      crystal.rotation.set(t * 0.6, t * 0.4, 0);
      moon.position.set(
        Math.cos(t * 0.35 + 2) * 9.4,
        Math.sin(t * 0.35) * 3.2,
        Math.sin(t * 0.35 + 2) * 9.4,
      );
    });

    /* ---------- 2. floating pastel shapes ---------- */
    const geos = [
      track(new THREE.IcosahedronGeometry(1, 0)),
      track(new THREE.OctahedronGeometry(1, 0)),
      track(new THREE.SphereGeometry(1, 32, 32)),
      track(new THREE.TorusGeometry(1, 0.34, 20, 60)),
      track(new THREE.TorusKnotGeometry(0.8, 0.26, 90, 14)),
      track(new THREE.DodecahedronGeometry(1, 0)),
    ];
    const count = small ? Math.round(SHAPE_COUNT * 0.5) : SHAPE_COUNT;
    const shapes = [];
    for (let i = 0; i < count; i++) {
      const geo = pick(geos);
      const mat = track(
        softMaterial(pick(colors), {
          flatShading: geo.type !== 'SphereGeometry' && Math.random() < 0.6,
        }),
      );
      const mesh = new THREE.Mesh(geo, mat);
      const side = Math.random() < 0.5 ? -1 : 1;
      const base = new THREE.Vector3(
        side * rand(small ? 4 : 8, small ? 14 : 32),
        rand(-3, 15),
        START_Z - 30 - Math.random() * (START_Z - 30 - zFar),
      );
      mesh.position.copy(base);
      mesh.scale.setScalar(rand(0.8, 2.8));
      mesh.rotation.set(rand(0, 6), rand(0, 6), rand(0, 6));
      mesh.frustumCulled = false;
      scene.add(mesh);
      shapes.push({
        mesh,
        base,
        spin: new THREE.Vector3(
          rand(-0.4, 0.4),
          rand(-0.4, 0.4),
          rand(-0.2, 0.2),
        ),
        bob: rand(0.3, 1),
        ph: rand(0, 6.28),
      });
    }
    loops.push(t =>
      shapes.forEach(s => {
        s.mesh.rotation.x += s.spin.x * 0.01;
        s.mesh.rotation.y += s.spin.y * 0.01;
        s.mesh.rotation.z += s.spin.z * 0.01;
        s.mesh.position.y = s.base.y + Math.sin(t * s.bob + s.ph) * 0.9;
      }),
    );

    /* ---------- 3. flowing ribbons ---------- */
    const ribbonDefs = [
      { color: PALETTE.lavender, ox: 0, oy: 3, r: 0.16 },
      { color: PALETTE.lavender, ox: 7, oy: 8, r: 0.1 },
      { color: PALETTE.peach, ox: -9, oy: 1, r: 0.06 },
    ];
    ribbonDefs.forEach((d, b) => {
      const ctrl = [];
      const n = Math.round((TRAVEL + 200) / 28);
      for (let i = 0; i < n; i++) {
        ctrl.push(
          new THREE.Vector3(
            d.ox + Math.sin(i * 0.75 + b * 1.9) * 7,
            d.oy + Math.cos(i * 0.55 + b * 2.3) * 3.5,
            START_Z + 10 - i * 28,
          ),
        );
      }
      const curve = new THREE.CatmullRomCurve3(ctrl);
      const tube = new THREE.Mesh(
        track(new THREE.TubeGeometry(curve, n * 10, d.r, 8, false)),
        track(softMaterial(d.color, { transparent: true, opacity: 0.85 })),
      );
      tube.frustumCulled = false;
      scene.add(tube);
    });

    /* ---------- 4. soft dust ---------- */
    const dustN = small ? 220 : 600;
    const dp = [];
    for (let i = 0; i < dustN; i++)
      dp.push(
        rand(-45, 45),
        rand(-6, 28),
        START_Z + 10 - Math.random() * (START_Z + 10 - zFar),
      );
    const dustGeo = track(new THREE.BufferGeometry());
    dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3));
    const dust = new THREE.Points(
      dustGeo,
      track(
        new THREE.PointsMaterial({
          size: 0.7,
          map: glowTex,
          color: PALETTE.lavender,
          transparent: true,
          opacity: 0.7,
          depthWrite: false,
          blending: THREE.NormalBlending,
        }),
      ),
    );
    dust.frustumCulled = false;
    scene.add(dust);
    loops.push(t => {
      dust.rotation.y = t * 0.01;
      dust.position.y = Math.sin(t * 0.2) * 0.6;
    });

    /* ---------- 5. sunset sun in the distance ---------- */
    const sun = new THREE.Group();
    sun.add(
      new THREE.Mesh(
        track(new THREE.SphereGeometry(7, 48, 48)),
        track(
          new THREE.MeshBasicMaterial({ color: PALETTE.peach, fog: false }),
        ),
      ),
    );
    const halo = new THREE.Sprite(
      track(
        new THREE.SpriteMaterial({
          map: glowTex,
          color: PALETTE.peach,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
          fog: false,
        }),
      ),
    );
    halo.scale.set(46, 46, 1);
    sun.add(halo);
    scene.add(sun);

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
    const timer = new THREE.Timer();
    timer.connect(document);
    let camZ = START_Z;
    let vel = 0;
    let fov = 58;
    let raf = 0;
    let running = true;

    function frame() {
      raf = requestAnimationFrame(frame);
      if (!running) return;
      timer.update();
      const t = reduce ? 0 : timer.getElapsed();
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

      sun.position.set(0, 12, camZ - 230);
      loops.forEach(fn => fn(t, pointer.sx, pointer.sy));
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
      timer.dispose();
      disposables.forEach(d => d.dispose?.());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="scene3d" aria-hidden="true" />;
}
