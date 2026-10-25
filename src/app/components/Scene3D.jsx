'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/*
  Tech / world scene. One fixed canvas behind the whole page.
  Scroll flies the camera through six rooms. Each room's objects only
  "materialize" when the camera is near, so nothing sits on top of text
  from another section.

  Palette (keep in sync with --c-* tokens in globals.css):
    ocean #060b16 | sky #4cc9f0 | indigo #6c7bff
    bangladesh green #00a878 | bangladesh red #f42a41 | sand #ffd27a
*/

const C = {
  ocean: 0x060b16,
  deep: 0x0a1a33,
  sky: 0x4cc9f0,
  indigo: 0x6c7bff,
  green: 0x00a878,
  red: 0xf42a41,
  sand: 0xffd27a,
};

const ROOMS = {
  hero: ['#home', 0],
  about: ['#about', -30],
  stack: ['#stack', -60],
  projects: ['#projects', -90],
  github: ['#github', -120],
  /* footer er alada id thakle '#footer' dao */
  contact: ['#contact', -150],
};

const CITIES = [
  [51.5, -0.1],
  [40.7, -74],
  [35.7, 139.7],
  [25.2, 55.3],
  [-33.9, 151.2],
  [-23.5, -46.6],
  [1.35, 103.8],
  [52.5, 13.4],
];
const DHAKA = [23.81, 90.41];

/* ---------- Bangladesh map config ---------- */
const BD_BOUNDS = { lonMin: 87.5, lonMax: 93.2, latMin: 20.0, latMax: 27.0 };
const BD_CENTER = [
  (BD_BOUNDS.latMin + BD_BOUNDS.latMax) / 2,
  (BD_BOUNDS.lonMin + BD_BOUNDS.lonMax) / 2,
];
/* Map globe e koto gun boro dekhabe (1 = real size). Boro korle map aro boro. */
const EXAG = 2.0;
const DHAKA_VIEW = [
  BD_CENTER[0] + (DHAKA[0] - BD_CENTER[0]) * EXAG,
  BD_CENTER[1] + (DHAKA[1] - BD_CENTER[1]) * EXAG,
];

/* green body, Dhaka te red glow, border e green -> red */
const MAP_STYLE = {
  fillA: '#00c48c',
  fillB: '#006b4d',
  redGlow: '244,42,65',
  strokeA: '#8dffdc',
  strokeB: '#ff6b7d',
};

const BD_BOUNDARY_URL =
  'https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/MapofBANGLADESH/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson';

/* Built-in simplified outline [lon, lat]. Real GeoJSON load na hole eta dekhabe. */
const BD_FALLBACK = [
  [88.08, 26.3],
  [88.36, 26.48],
  [88.51, 26.61],
  [88.68, 26.44],
  [88.86, 26.3],
  [89.05, 26.35],
  [89.35, 26.25],
  [89.62, 26.2],
  [89.82, 25.8],
  [89.85, 25.3],
  [90.15, 25.2],
  [90.6, 25.17],
  [91.0, 25.15],
  [91.5, 25.18],
  [92.0, 25.12],
  [92.25, 24.9],
  [92.1, 24.5],
  [92.35, 24.2],
  [91.95, 24.1],
  [91.65, 23.65],
  [91.2, 23.3],
  [91.15, 23.0],
  [91.7, 23.1],
  [92.1, 23.35],
  [92.35, 23.0],
  [92.4, 22.5],
  [92.55, 22.0],
  [92.6, 21.3],
  [92.35, 20.7],
  [92.2, 20.95],
  [92.0, 21.4],
  [91.9, 21.85],
  [91.8, 22.25],
  [91.45, 22.6],
  [91.1, 22.55],
  [91.0, 22.4],
  [90.7, 22.1],
  [90.4, 21.9],
  [90.3, 21.8],
  [89.95, 21.85],
  [89.55, 21.8],
  [89.3, 21.75],
  [89.1, 21.85],
  [89.02, 22.15],
  [88.95, 22.4],
  [88.9, 22.9],
  [88.8, 23.25],
  [88.65, 23.5],
  [88.55, 23.9],
  [88.3, 24.2],
  [88.1, 24.5],
  [88.05, 24.75],
  [88.25, 25.2],
  [88.45, 25.55],
  [88.2, 25.85],
];

const rad = THREE.MathUtils.degToRad;
const clamp01 = v => Math.min(1, Math.max(0, v));

function latLon([lat, lon], r = 1) {
  const phi = rad(lat);
  const lam = rad(lon);
  return new THREE.Vector3(
    r * Math.cos(phi) * Math.sin(lam),
    r * Math.sin(phi),
    r * Math.cos(phi) * Math.cos(lam),
  );
}

function ringsOf(geom) {
  if (!geom) return [];
  if (geom.type === 'Polygon') return geom.coordinates;
  if (geom.type === 'MultiPolygon') return geom.coordinates.flat();
  return [];
}

/* Canvas texture e Bangladesh map aanka hoy. Prothome fallback, tarpor real GeoJSON. */
function bangladeshPatch() {
  const { lonMin, lonMax, latMin, latMax } = BD_BOUNDS;
  const W = 1536;
  const H = Math.round((W * (latMax - latMin)) / (lonMax - lonMin));
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const px = lon => ((lon - lonMin) / (lonMax - lonMin)) * W;
  const py = lat => ((latMax - lat) / (latMax - latMin)) * H;

  function render(rings) {
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(160,255,225,.10)';
    ctx.lineWidth = 1;
    for (let lon = 88; lon <= 93; lon++) {
      ctx.beginPath();
      ctx.moveTo(px(lon), 0);
      ctx.lineTo(px(lon), H);
      ctx.stroke();
    }
    for (let lat = 21; lat <= 26; lat++) {
      ctx.beginPath();
      ctx.moveTo(0, py(lat));
      ctx.lineTo(W, py(lat));
      ctx.stroke();
    }

    const p = new Path2D();
    rings.forEach(ring => {
      ring.forEach(([lon, lat], i) =>
        i ? p.lineTo(px(lon), py(lat)) : p.moveTo(px(lon), py(lat)),
      );
      p.closePath();
    });

    /* 1) green body */
    ctx.save();
    const body = ctx.createLinearGradient(0, 0, W * 0.4, H);
    body.addColorStop(0, MAP_STYLE.fillA);
    body.addColorStop(1, MAP_STYLE.fillB);
    ctx.fillStyle = body;
    ctx.fill(p, 'evenodd');
    ctx.restore();

    /* 2) red glow around Dhaka, shape er bhitore */
    ctx.save();
    ctx.clip(p, 'evenodd');
    const dx = px(DHAKA[1]);
    const dy = py(DHAKA[0]);
    const glow = ctx.createRadialGradient(dx, dy, 0, dx, dy, W * 0.2);
    glow.addColorStop(0, `rgba(${MAP_STYLE.redGlow},1)`);
    glow.addColorStop(0.35, `rgba(${MAP_STYLE.redGlow},.75)`);
    glow.addColorStop(1, `rgba(${MAP_STYLE.redGlow},0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    /* 3) neon border green -> red */
    ctx.save();
    const edge = ctx.createLinearGradient(0, H, W, 0);
    edge.addColorStop(0, MAP_STYLE.strokeA);
    edge.addColorStop(1, MAP_STYLE.strokeB);
    ctx.strokeStyle = edge;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#00a878';
    ctx.shadowBlur = 18;
    ctx.stroke(p);
    ctx.restore();

    texture.needsUpdate = true;
  }

  render([BD_FALLBACK]);

  const ctl = new AbortController();
  fetch(BD_BOUNDARY_URL, { signal: ctl.signal })
    .then(res => {
      if (!res.ok) throw new Error('boundary request failed');
      return res.json();
    })
    .then(data => {
      const all = data.features || [];
      const match = all.filter(f =>
        /bangladesh/i.test(JSON.stringify(f.properties || {})),
      );
      const feats = match.length ? match : all;
      const rings = feats.flatMap(f => ringsOf(f.geometry));
      if (!rings.length) throw new Error('no rings');
      const pts = rings.flat();
      const lons = pts.map(c => c[0]);
      const lats = pts.map(c => c[1]);
      const ok =
        Math.min(...lons) > 86 &&
        Math.max(...lons) < 94.5 &&
        Math.min(...lats) > 19 &&
        Math.max(...lats) < 28;
      if (!ok) throw new Error('unexpected geometry');
      render(rings);
    })
    .catch(err => {
      if (err?.name !== 'AbortError')
        console.warn('Using built-in Bangladesh outline:', err.message);
    });

  return { texture, abort: () => ctl.abort() };
}

function glowTexture(inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function codeWindowTexture(seed) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 340;
  const g = c.getContext('2d');
  g.fillStyle = '#0b1530';
  g.fillRect(0, 0, 512, 340);
  g.fillStyle = '#14224a';
  g.fillRect(0, 0, 512, 40);
  ['#f42a41', '#ffd27a', '#00a878'].forEach((col, i) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc(26 + i * 24, 20, 7, 0, Math.PI * 2);
    g.fill();
  });
  const cols = ['#4cc9f0', '#6c7bff', '#00a878', '#93a6c4', '#ffd27a'];
  let s = seed * 9301 + 49297;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let row = 0; row < 11; row++) {
    let x = 30 + Math.floor(rnd() * 3) * 28;
    const y = 66 + row * 24;
    for (let seg = 0; seg < 1 + Math.floor(rnd() * 3); seg++) {
      const w = 40 + rnd() * 120;
      g.fillStyle = cols[Math.floor(rnd() * cols.length)];
      g.globalAlpha = 0.85;
      g.fillRect(x, y, w, 10);
      x += w + 12;
    }
  }
  g.globalAlpha = 1;
  return new THREE.CanvasTexture(c);
}

/* Fresnel atmosphere: globe er charidike soft glow */
const ATMOS_VERT = `
  varying vec3 vN;
  void main() {
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const ATMOS_FRAG = `
  varying vec3 vN;
  uniform vec3 uColor;
  void main() {
    float i = pow(max(0.0, 0.72 - dot(vN, vec3(0.0, 0.0, 1.0))), 3.0);
    gl_FragColor = vec4(uColor, 1.0) * i * 1.6;
  }
`;

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
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(C.ocean, 0.016);
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
    camera.position.set(0, 0, 14);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const lightA = new THREE.PointLight(C.sky, 80, 80);
    const lightB = new THREE.PointLight(C.indigo, 60, 80);
    scene.add(lightA, lightB);

    const disposables = [];
    const track = item => (disposables.push(item), item);
    const std = (color, extra = {}) =>
      track(
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.4,
          metalness: 0.5,
          ...extra,
        }),
      );
    const basic = (color, extra = {}) =>
      track(new THREE.MeshBasicMaterial({ color, ...extra }));
    const lineMat = (color, opacity) =>
      track(
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity,
          depthWrite: false,
        }),
      );
    const loops = [];
    const rooms = [];
    /* mob = { x, y, s } -> narrow screen e alada position/scale */
    const room = (key, baseX, baseY, build, mob) => {
      const group = new THREE.Group();
      scene.add(group);
      const z = ROOMS[key][1];
      const entry = { group, z, baseX, baseY, mob };
      rooms.push(entry);
      build(group);
      return entry;
    };

    /* Bangladesh texture ekbar-i banano hobe, hero ar footer share korbe */
    let bd = null;
    const getBd = () => {
      if (!bd) {
        bd = bangladeshPatch();
        disposables.push(bd.texture);
      }
      return bd;
    };

    /* globe ke camera r dike Dhaka face koriye dey (map always visible) */
    const _dir = new THREE.Vector3();
    const _q = new THREE.Quaternion();
    const _qs = new THREE.Quaternion();
    const _e = new THREE.Euler();
    const _wp = new THREE.Vector3();
    function faceCamera(globe, normal, ex, ey) {
      globe.getWorldPosition(_wp);
      _dir.copy(camera.position).sub(_wp).normalize();
      _q.setFromUnitVectors(normal, _dir);
      _e.set(ex, ey, 0);
      _qs.setFromEuler(_e);
      globe.quaternion.copy(_qs).multiply(_q);
    }

    /* ---------- stars ---------- */
    const starCount = small ? 800 : 2000;
    const sp = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      sp[i * 3] = (Math.random() - 0.5) * 120;
      sp[i * 3 + 1] = (Math.random() - 0.5) * 80;
      sp[i * 3 + 2] = 30 - Math.random() * 220;
    }
    const starGeo = track(new THREE.BufferGeometry());
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const stars = new THREE.Points(
      starGeo,
      track(
        new THREE.PointsMaterial({
          size: 0.1,
          color: 0xbfd9ff,
          transparent: true,
          opacity: 0.7,
          depthWrite: false,
        }),
      ),
    );
    scene.add(stars);

    /* ---------- nebula glow (soft color depth behind everything) ---------- */
    const glowTex = track(
      glowTexture('rgba(255,255,255,0.55)', 'rgba(255,255,255,0)'),
    );
    [
      [-14, 6, -10, C.indigo, 46],
      [16, -6, -42, C.green, 52],
      [-16, 4, -75, C.sky, 56],
      [15, -3, -108, C.indigo, 52],
      [-13, 5, -138, C.green, 50],
      [14, 0, -165, C.sky, 56],
    ].forEach(([x, y, z, color, size]) => {
      const s = new THREE.Sprite(
        track(
          new THREE.SpriteMaterial({
            map: glowTex,
            color,
            transparent: true,
            opacity: 0.16,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            fog: false,
          }),
        ),
      );
      s.position.set(x, y, z);
      s.scale.setScalar(size);
      scene.add(s);
    });

    /* ---------- tech tunnel ---------- */
    const floor = new THREE.GridHelper(400, 100, C.sky, C.indigo);
    floor.position.set(0, -8, -80);
    floor.material.transparent = true;
    floor.material.opacity = 0.16;
    floor.material.depthWrite = false;
    scene.add(floor);
    track(floor.geometry);
    track(floor.material);
    const gates = [-15, -45, -75, -105, -135].map((z, i) => {
      const gate = new THREE.Mesh(
        track(new THREE.TorusGeometry(6.5, 0.025, 4, 6)),
        basic(i % 2 ? C.indigo : C.sky, { transparent: true, opacity: 0.55 }),
      );
      gate.position.z = z;
      scene.add(gate);
      return gate;
    });
    loops.push(t =>
      gates.forEach((g, i) => (g.rotation.z = t * 0.08 * (i % 2 ? -1 : 1))),
    );

    /* ---------- globe factory ---------- */
    function makeGlobe({ dotSize, dots, arcs, map }) {
      const home = map ? DHAKA_VIEW : DHAKA;
      const globe = new THREE.Group();

      /* core */
      globe.add(
        new THREE.Mesh(
          track(new THREE.SphereGeometry(0.985, 48, 48)),
          basic(C.deep, { transparent: true, opacity: 0.88 }),
        ),
      );

      /* atmosphere glow */
      const atmos = new THREE.Mesh(
        track(new THREE.SphereGeometry(1.16, 48, 48)),
        track(
          new THREE.ShaderMaterial({
            vertexShader: ATMOS_VERT,
            fragmentShader: ATMOS_FRAG,
            uniforms: { uColor: { value: new THREE.Color(C.sky) } },
            side: THREE.BackSide,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        ),
      );
      globe.add(atmos);

      /* dot surface */
      const pts = new Float32Array(dots * 3);
      for (let i = 0; i < dots; i++) {
        const y = 1 - (i / (dots - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const th = Math.PI * (3 - Math.sqrt(5)) * i;
        pts.set([Math.cos(th) * r, y, Math.sin(th) * r], i * 3);
      }
      const dg = track(new THREE.BufferGeometry());
      dg.setAttribute('position', new THREE.BufferAttribute(pts, 3));
      globe.add(
        new THREE.Points(
          dg,
          track(
            new THREE.PointsMaterial({
              size: dotSize,
              color: C.sky,
              transparent: true,
              opacity: 0.85,
              depthWrite: false,
            }),
          ),
        ),
      );

      /* wireframe grid */
      globe.add(
        new THREE.Mesh(
          track(new THREE.SphereGeometry(1.0, 24, 16)),
          track(
            new THREE.MeshBasicMaterial({
              color: C.sky,
              wireframe: true,
              transparent: true,
              opacity: 0.08,
              depthWrite: false,
            }),
          ),
        ),
      );

      /* Bangladesh map patch (label nai) */
      if (map) {
        const { lonMin, lonMax, latMin, latMax } = BD_BOUNDS;
        const [cLat, cLon] = BD_CENTER;
        const lon0 = cLon - (cLon - lonMin) * EXAG;
        const lonSpan = (lonMax - lonMin) * EXAG;
        const latTop = cLat + (latMax - cLat) * EXAG;
        const latSpan = (latMax - latMin) * EXAG;
        const geo = track(
          new THREE.SphereGeometry(
            1.006,
            64,
            64,
            rad(lon0) + Math.PI / 2,
            rad(lonSpan),
            rad(90 - latTop),
            rad(latSpan),
          ),
        );
        const mesh = new THREE.Mesh(
          geo,
          track(
            new THREE.MeshBasicMaterial({
              map: getBd().texture,
              transparent: true,
              depthWrite: false,
              polygonOffset: true,
              polygonOffsetFactor: -2,
              fog: false,
            }),
          ),
        );
        mesh.renderOrder = 2;
        globe.add(mesh);
      }

      /* Dhaka marker: choto dot + pulse ring */
      const marker = new THREE.Group();
      marker.position.copy(latLon(home, 1.01));
      marker.lookAt(marker.position.clone().multiplyScalar(2));
      const dot = new THREE.Mesh(
        track(new THREE.CircleGeometry(map ? 0.018 : 0.03, 24)),
        basic(map ? 0xffffff : C.red, { fog: false }),
      );
      const pulse = new THREE.Mesh(
        track(new THREE.RingGeometry(0.035, 0.046, 40)),
        basic(C.red, { transparent: true, side: THREE.DoubleSide }),
      );
      dot.renderOrder = 4;
      pulse.renderOrder = 4;
      marker.add(dot, pulse);
      globe.add(marker);

      /* data arcs */
      const flows = [];
      if (arcs) {
        const from = latLon(home);
        CITIES.forEach(([lat, lon], i) => {
          const to = latLon([lat, lon]);
          const mid = from
            .clone()
            .add(to)
            .multiplyScalar(0.5)
            .normalize()
            .multiplyScalar(1 + from.distanceTo(to) * 0.42);
          const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
          const geo = track(
            new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)),
          );
          const line = new THREE.Line(
            geo,
            lineMat(i % 2 ? C.sky : C.green, 0.8),
          );
          const packet = new THREE.Mesh(
            track(new THREE.SphereGeometry(0.017, 8, 8)),
            basic(C.sand),
          );
          globe.add(line, packet);
          flows.push({ curve, line, packet, offset: i * 0.37 });
        });
      }
      return { globe, pulse, flows, normal: latLon(home).normalize() };
    }

    /* ---------- room: hero ---------- */
    const hero = new THREE.Group();
    scene.add(hero);
    const main = makeGlobe({
      dotSize: 0.06,
      dots: small ? 900 : 1700,
      arcs: true,
      map: true,
    });
    hero.add(main.globe);
    const equator = new THREE.Mesh(
      track(new THREE.TorusGeometry(1.32, 0.004, 8, 160)),
      basic(C.indigo, { transparent: true, opacity: 0.45 }),
    );
    equator.rotation.x = 1.25;
    hero.add(equator);
    const sats = [];
    for (let i = 0; i < 5; i++) {
      const sat = new THREE.Mesh(
        track(new THREE.OctahedronGeometry(0.035)),
        basic(i % 2 ? C.sand : C.sky),
      );
      sat.userData = { a: (i / 5) * Math.PI * 2, s: 0.35 + i * 0.08 };
      equator.add(sat);
      sats.push(sat);
    }

    /*
      Desktop: globe photo er pashe (bam dike).
      Mobile: globe screen er majhkhane photo er thik niche, pura visible.
    */
    const heroPlace = { x: -3, y: 0, R: 4 };
    function placeHero() {
      const el = document.getElementById('photo');
      if (!el) return;
      const r = el.getBoundingClientRect();
      const h = 2 * 14 * Math.tan(rad(camera.fov / 2));
      const w = h * camera.aspect;
      const W = (r.width / innerWidth) * w;
      const cx = ((r.left + r.width / 2) / innerWidth) * w - w / 2;
      const docTop = r.top + scrollY;
      const cy = (0.5 - (docTop + r.height / 2) / innerHeight) * h;
      const mobile = camera.aspect < 0.9;
      if (mobile) {
        const bottom = (0.5 - (docTop + r.height) / innerHeight) * h;
        heroPlace.R = Math.min(W * 0.62, w * 0.4);
        heroPlace.x = 0;
        heroPlace.y = bottom - heroPlace.R * 1.02;
      } else {
        heroPlace.R = W * 0.8;
        heroPlace.x = cx - W * 0.72;
        heroPlace.y = cy + W * 0.06;
      }
    }

    /* ---------- room: about (data network) ---------- */
    room(
      'about',
      8,
      0,
      g => {
        const ico = track(new THREE.IcosahedronGeometry(3, 2));
        g.add(
          new THREE.LineSegments(
            track(new THREE.WireframeGeometry(ico)),
            lineMat(C.sky, 0.35),
          ),
          new THREE.Points(
            ico,
            track(
              new THREE.PointsMaterial({
                size: 0.12,
                color: C.sand,
                transparent: true,
                opacity: 0.9,
                depthWrite: false,
              }),
            ),
          ),
          new THREE.Mesh(
            track(new THREE.SphereGeometry(1.2, 24, 24)),
            std(C.indigo, { emissive: C.indigo, emissiveIntensity: 0.4 }),
          ),
        );
        loops.push(t => {
          g.rotation.y = t * 0.2;
          g.rotation.x = Math.sin(t * 0.25) * 0.2;
        });
      },
      { x: 0, y: 4.6, s: 0.55 },
    );

    /* ---------- room: projects (floating code windows) ---------- */
    room('projects', 0, 0, g => {
      const geo = track(new THREE.PlaneGeometry(3.2, 2.12));
      const edge = track(new THREE.EdgesGeometry(geo));
      for (let i = 0; i < 6; i++) {
        const win = new THREE.Group();
        win.add(
          new THREE.Mesh(
            geo,
            track(
              new THREE.MeshBasicMaterial({
                map: track(codeWindowTexture(i + 3)),
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide,
              }),
            ),
          ),
          new THREE.LineSegments(edge, lineMat(i % 2 ? C.sky : C.indigo, 0.9)),
        );
        const side = i % 2 ? 1 : -1;
        win.position.set(side * (7 + (i % 3) * 1.6), (i - 2.5) * 1.5, -i * 1.6);
        win.userData = { base: win.position.y, o: i * 0.9, side };
        g.add(win);
      }
      loops.push(t =>
        g.children.forEach(w => {
          w.position.y =
            w.userData.base + Math.sin(t * 0.6 + w.userData.o) * 0.4;
          w.rotation.y =
            -w.userData.side * (0.45 + Math.sin(t * 0.4 + w.userData.o) * 0.12);
        }),
      );
    });

    /* ---------- room: github (contribution heat-grid) ---------- */
    room('github', 0, -1.5, g => {
      const levels = [0x12274a, 0x17548f, 0x1f86c0, C.sky, 0xc4f1ff].map(c =>
        std(c, { metalness: 0.2, roughness: 0.5 }),
      );
      const box = track(new THREE.BoxGeometry(0.42, 1, 0.42));
      const cells = [];
      for (let w = 0; w < 30; w++) {
        for (let d = 0; d < 7; d++) {
          const v = Math.abs(
            Math.sin(w * 1.9 + d * 2.7) * Math.cos(w * 0.6 + d),
          );
          const lvl = Math.min(4, Math.floor(v * 5));
          const cell = new THREE.Mesh(box, levels[lvl]);
          cell.position.set((w - 15) * 0.52, 0, (d - 3) * 0.52);
          cell.userData = { lvl, w, d };
          g.add(cell);
          cells.push(cell);
        }
      }
      g.rotation.x = 0.55;
      loops.push(t =>
        cells.forEach(c => {
          const h =
            0.15 +
            c.userData.lvl * 0.55 +
            Math.sin(t * 0.9 + c.userData.w * 0.4 + c.userData.d) * 0.12;
          c.scale.y = h;
          c.position.y = h / 2;
        }),
      );
    });

    /* ---------- room: contact / footer (Bangladesh map globe + signal waves) ---------- */
    room(
      'contact',
      7,
      0,
      g => {
        const mini = makeGlobe({
          dotSize: 0.04,
          dots: 900,
          arcs: false,
          map: true,
        });
        mini.globe.scale.setScalar(2.1);
        g.add(mini.globe);
        const waves = [0, 1, 2, 3].map(i => {
          const ring = new THREE.Mesh(
            track(new THREE.RingGeometry(0.98, 1, 96)),
            basic(i % 2 ? C.green : C.sky, {
              transparent: true,
              side: THREE.DoubleSide,
              depthWrite: false,
            }),
          );
          g.add(ring);
          return ring;
        });
        loops.push(t => {
          faceCamera(
            mini.globe,
            mini.normal,
            pointer.sy * 0.06,
            Math.sin(t * 0.3) * 0.12 + pointer.sx * 0.1,
          );
          mini.pulse.scale.setScalar(1 + ((t * 0.8) % 1) * 1.6);
          mini.pulse.material.opacity = 1 - ((t * 0.8) % 1);
          waves.forEach((w, i) => {
            const p = (t * 0.25 + i / 4) % 1;
            w.scale.setScalar(2.6 + p * 3.4);
            w.material.opacity = (1 - p) * 0.5;
          });
        });
      },
      { x: 0, y: 3.4, s: 0.7 },
    );

    /* ---------- scroll -> camera mapping ---------- */
    let anchors = [];
    function measure() {
      const vh = innerHeight;
      anchors = Object.values(ROOMS).map(([selector, z]) => {
        const el = document.querySelector(selector);
        const y = el
          ? el.getBoundingClientRect().top +
            scrollY +
            el.offsetHeight / 2 -
            vh / 2
          : 0;
        return { y: Math.max(0, y), z };
      });
      anchors[0].y = 0;
      for (let i = 1; i < anchors.length; i++)
        anchors[i].y = Math.max(anchors[i].y, anchors[i - 1].y + 1);
    }
    function roomAt(y) {
      if (y <= anchors[0].y) return anchors[0].z;
      for (let i = 1; i < anchors.length; i++) {
        if (y <= anchors[i].y) {
          const a = anchors[i - 1];
          const b = anchors[i];
          return (
            a.z +
            (b.z - a.z) *
              THREE.MathUtils.smootherstep((y - a.y) / (b.y - a.y), 0, 1)
          );
        }
      }
      return anchors.at(-1).z;
    }

    function resize() {
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      measure();
      placeHero();
    }
    resize();

    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    const onPointer = e => {
      pointer.x = (e.clientX / innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / innerHeight - 0.5) * 2;
    };
    if (!reduce) addEventListener('pointermove', onPointer, { passive: true });
    addEventListener('resize', resize);
    const timers = [setTimeout(resize, 600), setTimeout(resize, 2200)];
    document.fonts?.ready.then(resize);
    const ro =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => (measure(), placeHero()));
    ro?.observe(document.body);

    /* ---------- loop ---------- */
    const clock = new THREE.Clock();
    let camZ = 14;
    let raf = 0;
    let running = true;
    function frame() {
      raf = requestAnimationFrame(frame);
      if (!running) return;
      const t = reduce ? 0 : clock.getElapsedTime();
      pointer.sx += (pointer.x - pointer.sx) * 0.05;
      pointer.sy += (pointer.y - pointer.sy) * 0.05;

      camZ += (roomAt(scrollY) + 14 - camZ) * (reduce ? 1 : 0.07);
      const weave = Math.sin(-camZ * 0.045);
      camera.position.set(
        weave * 1.2 + pointer.sx * 0.8,
        -weave * 0.5 - pointer.sy * 0.4,
        camZ,
      );
      camera.lookAt(
        weave * 0.4 + pointer.sx * 0.3,
        -pointer.sy * 0.2,
        camZ - 14,
      );
      camera.updateMatrixWorld();
      lightA.position.set(-8, 5, camZ - 6);
      lightB.position.set(9, -4, camZ - 8);
      stars.rotation.z = t * 0.01;

      /* rooms materialize only when the camera is close */
      const xk = THREE.MathUtils.clamp(camera.aspect / 1.7, 0.4, 1);
      const mobile = camera.aspect < 0.9;
      rooms.forEach(r => {
        const d = Math.abs(camZ - 14 - r.z);
        const k = 1 - clamp01((d - 6) / 12);
        const m = mobile && r.mob;
        r.group.visible = k > 0.02;
        r.group.scale.setScalar(Math.max(k, 0.0001) * (m ? r.mob.s : 1));
        r.group.position.set(
          m ? r.mob.x : r.baseX * xk,
          m ? r.mob.y : r.baseY,
          r.z,
        );
        r.group.updateMatrixWorld();
      });

      /* hero: Dhaka (map) always faces the camera */
      const heroK = 1 - clamp01((Math.abs(camZ - 14) - 6) / 12);
      hero.visible = heroK > 0.02;
      hero.position.set(heroPlace.x, heroPlace.y, 0);
      hero.scale.setScalar(Math.max(heroK, 0.0001));
      hero.updateMatrixWorld();
      const R = heroPlace.R;
      main.globe.scale.setScalar(R);
      faceCamera(
        main.globe,
        main.normal,
        pointer.sy * 0.08,
        Math.sin(t * 0.3) * 0.1 + pointer.sx * 0.12,
      );
      const wave = (t * 0.8) % 1;
      main.pulse.scale.setScalar(1 + wave * 2);
      main.pulse.material.opacity = 1 - wave;
      main.flows.forEach(f => {
        const p = (t * 0.22 + f.offset) % 1.4;
        f.line.geometry.setDrawRange(0, Math.floor(61 * clamp01(p / 0.7)));
        f.packet.visible = p < 1;
        if (p < 1) f.packet.position.copy(f.curve.getPoint(p));
      });
      equator.scale.setScalar(R);
      equator.rotation.z = t * 0.2;
      sats.forEach(sat => {
        const a = sat.userData.a + t * sat.userData.s;
        sat.position.set(Math.cos(a) * 1.32, Math.sin(a) * 1.32, 0);
      });

      loops.forEach(fn => fn(t, camera));
      renderer.render(scene, camera);
    }
    frame();

    const onVisibility = () => (running = !document.hidden);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      bd?.abort();
      ro?.disconnect();
      removeEventListener('pointermove', onPointer);
      removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      scene.traverse(o => o.geometry?.dispose?.());
      disposables.forEach(d => d.dispose?.());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="scene3d" aria-hidden="true" />;
}
