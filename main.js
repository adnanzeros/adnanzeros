const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce =
  matchMedia('(prefers-reduced-motion: reduce)').matches ||
  typeof gsap === 'undefined';
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  // phones: the address bar showing/hiding while you scroll must NOT trigger a full re-layout (main cause of scroll jank)
  ScrollTrigger.config({ ignoreMobileResize: true });
}
// real mouse / trackpad only. touch screens skip tilt + parallax = lighter and smoother
const canHover = matchMedia('(hover:hover) and (pointer:fine)').matches;
$('#yr').textContent = new Date().getFullYear();

/* ---------- contact form (runs first so nothing else can break it) ---------- */
(() => {
  const f = $('#form'),
    st = $('#status'),
    dial = $('#dial'),
    btn = $('button[type=submit]', f);
  if (window.COUNTRIES && dial)
    dial.innerHTML = COUNTRIES.map(
      ([n, c], i) =>
        `<option value="${c}"${i === 0 ? ' selected' : ''}>${n} (+${c})</option>`,
    ).join('');
  const say = (t, k = '') => {
    st.textContent = t;
    st.className = k;
  };
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const b = Object.fromEntries(new FormData(f));
    const digits = String(b.phone || '')
      .replace(/\D/g, '')
      .replace(/^0+/, '');
    if (!b.name.trim()) return say('Please enter your name.', 'err');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))
      return say('Please enter a valid email.', 'err');
    if (digits.length < 6 || b.dialCode.length + digits.length > 15)
      return say('Please enter a valid WhatsApp number.', 'err');
    if (b.message.trim().length < 5)
      return say('Please write a short message.', 'err');
    btn.disabled = true;
    say('Sending…');
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(b),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Could not send. Try again later.');
      say('Message sent. I will reply soon.', 'ok');
      f.reset();
    } catch (err) {
      say(
        err.message === 'Failed to fetch'
          ? 'Cannot reach the server. Run npm run dev and open http://localhost:3000'
          : err.message,
        'err',
      );
    }
    btn.disabled = false;
  });
})();

/* ---------- content ---------- */
const TECH = {
  Languages: [
    ['HTML5', 'html5'],
    ['CSS3', 'css3'],
    ['JavaScript', 'javascript'],
    ['TypeScript', 'typescript'],
    ['Python', 'python'],
    ['PowerShell', 'powershell'],
  ],
  Frontend: [
    ['React', 'react'],
    ['Next.js', 'nextjs'],
    ['React Native', 'react-native'],
    ['React Router', 'react-router'],
    ['Vite', 'vite'],
    ['Tailwind CSS', 'tailwind'],
    ['WordPress', 'wordpress'],
    ['GSAP', 'gsap'],
    ['Three.js', 'threejs'],
  ],
  'Backend & Cloud': [
    ['Node.js', 'nodejs'],
    ['Vercel', 'vercel'],
    ['Netlify', 'netlify'],
    ['Firebase', 'firebase'],
    ['Google Cloud', 'google-cloud'],
    ['Resend', 'resend'],
  ],
  'Tools & Design': [
    ['Git', 'git'],
    ['GitHub', 'github'],
    ['npm', 'npm'],
    ['Figma', 'figma'],
    ['Canva', 'canva'],
    ['Adobe XD', 'adobe-xd'],
    ['Blender', 'blender'],
  ],
};
const PROJ = {
  frontend: [
    {
      n: 'Shuru Kori Online',
      d: 'Learning and guidance platform with live sessions and practical work.',
      t: ['Web', 'Platform'],
      u: 'https://shurukori.online/',
    },
    {
      n: 'DevStack',
      d: 'React tech stack builder. Explore technologies and compose your own stack.',
      t: ['React', 'Vite', 'CSS'],
      u: 'https://sparkling-chaja-0c0966.netlify.app/',
      g: 'https://github.com/adnanzeros/Assignment-5',
    },
    {
      n: 'batch-14-assignment-1',
      d: 'Responsive layout assignment built with HTML and CSS.',
      t: ['HTML', 'CSS'],
      u: 'https://github.com/adnanzeros/batch-14-assignment-1',
    },
  ],
  backend: [
    {
      n: 'Contact API (this site)',
      d: 'Serverless function that validates messages and emails them through Resend. Keys stay in .env.local.',
      t: ['Node.js', 'Vercel', 'Resend'],
      u: 'https://github.com/adnanzeros',
    },
  ],
  tools: [
    {
      n: 'TimeMate: Screen Time Coach',
      d: 'Chrome extension (Manifest V3) that tracks tab time, sends reminders, blocks sites and has a Focus Mode.',
      t: ['JavaScript', 'Chrome APIs'],
      u: 'https://github.com/adnanzeros/screen-time-coach',
    },
  ],
};
$('#techgrid').innerHTML = Object.entries(TECH)
  .map(
    ([k, v]) =>
      `<div class="tgroup"><h3>${k}</h3><div class="tiles">${v.map(([n, f]) => `<div class="tile tilt"><img src="assets/tech/${f}.svg" alt="${n}" width="84" height="84" loading="lazy"><span>${n}</span></div>`).join('')}</div></div>`,
  )
  .join('');

/* project cards: grid on tablet/desktop, sticky stack on phones (<=480px) */
let curTab = 'frontend',
  stackFx = [];
const stackMQ = matchMedia('(max-width:480px)');
const clearStack = () => {
  stackFx.forEach(t => {
    t.scrollTrigger && t.scrollTrigger.kill();
    t.kill();
  });
  stackFx = [];
};
const stackTop = i => 72 + i * 12; // keep in sync with  top:calc(72px + var(--i)*12px)  in style.css
const buildStack = () => {
  const cards = $$('#projgrid .card'),
    n = cards.length;
  cards.forEach((c, i) => {
    // 1) the card rises into view, tilted back like a card being dealt onto the pile
    stackFx.push(
      gsap.fromTo(
        c,
        {
          y: 80,
          rotateX: -30,
          opacity: 0,
          transformPerspective: 900,
          transformOrigin: '50% 0%',
        },
        {
          y: 0,
          rotateX: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: c,
            start: 'top 100%',
            end: 'top 72%',
            scrub: 0.2,
          },
        },
      ),
    );
    // 2) when the next card slides over it, this one sinks back and dims
    //    (dimming = overlay opacity via --dim, much cheaper than a CSS filter)
    if (i < n - 1)
      stackFx.push(
        gsap.fromTo(
          c,
          { scale: 1, rotateX: 0, '--dim': 0 },
          {
            scale: 0.93,
            rotateX: 5,
            '--dim': 0.55,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: cards[i + 1],
              start: 'top 88%',
              end: 'top ' + (stackTop(i + 1) + 10) + 'px',
              scrub: 0.2,
            },
          },
        ),
      );
  });
};
const drawProj = t => {
  curTab = t;
  clearStack();
  const stack = stackMQ.matches,
    g = $('#projgrid');
  g.classList.toggle('stack', stack);
  g.innerHTML = PROJ[t]
    .map(
      (p, i) =>
        `<a class="card${stack ? '' : ' tilt'}" style="--i:${i}" href="${p.u}" target="_blank" rel="noopener"><h3>${p.n}</h3><p>${p.d}</p><div class="chips">${p.t.map(x => `<span>${x}</span>`).join('')}</div></a>`,
    )
    .join('');
  if (stack) {
    if (!reduce) buildStack();
  } else {
    bindTilt();
    if (!reduce)
      stackFx.push(
        gsap.from('#projgrid .card', {
          y: 40,
          rotateX: -40,
          transformPerspective: 900,
          opacity: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          // plays when the grid scrolls into view (not at page load, where nobody can see it)
          scrollTrigger: { trigger: '#projgrid', start: 'top 92%', once: true },
        }),
      );
  }
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
};
stackMQ.addEventListener('change', () => drawProj(curTab));
$$('.tabs button').forEach(
  b =>
    (b.onclick = () => {
      $$('.tabs button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      drawProj(b.dataset.t);
    }),
);

/* ---------- menu ---------- */
const burger = $('.burger'),
  menu = $('.menu');
const setMenu = o => {
  menu.classList.toggle('open', o);
  burger.setAttribute('aria-expanded', o);
  document.body.style.overflow = o ? 'hidden' : '';
};
burger.onclick = () => setMenu(!menu.classList.contains('open'));
$$('.menu a').forEach(a => (a.onclick = () => setMenu(false)));

/* ---------- 3D tilt (cards + photo): mouse only ---------- */
function bindTilt() {
  if (reduce || !canHover) return;
  $$('.tilt').forEach(el => {
    if (el._t) return;
    el._t = 1;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect(),
        x = (e.clientX - r.left) / r.width - 0.5,
        y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, {
        transformPerspective: 900,
        rotateY: x * 16,
        rotateX: -y * 16,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
    el.addEventListener('mouseleave', () =>
      gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.6 }),
    );
  });
}
const img = $('#photo img');
if (img) img.classList.add('tilt');
drawProj('frontend');
bindTilt();

/* hero intro is pure CSS now (see style.css) - it starts on the first paint, no JS needed */

/* ---------- three.js background (loaded AFTER the page, so first load stays fast) ---------- */
const initBg = () => {
  try {
    const mobile = innerWidth <= 991,
      cv = $('#bg'),
      R = new THREE.WebGLRenderer({
        canvas: cv,
        alpha: true,
        antialias: !mobile,
        powerPreference: 'low-power',
      });
    R.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1 : 1.5));
    const S = new THREE.Scene(),
      C = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    C.position.z = 7;
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 1), mat);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.6, 0.012, 8, 120),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.25,
      }),
    );
    ring.rotation.x = 1.2;
    const n = mobile ? 350 : 700,
      pos = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i++) pos[i] = (Math.random() - 0.5) * 26;
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(
      pg,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.035,
        transparent: true,
        opacity: 0.6,
      }),
    );
    const g = new THREE.Group();
    g.add(core, ring);
    S.add(g, pts);

    let W = 0,
      H = 0;
    const size = force => {
      const w = innerWidth,
        h = innerHeight;
      // ignore the small height changes of the phone address bar (resizing the canvas while scrolling = lag)
      if (!force && w === W && Math.abs(h - H) < 150) return;
      W = w;
      H = h;
      R.setSize(W, H, false); // false: CSS keeps the canvas at 100% x 100%
      C.aspect = W / H;
      C.updateProjectionMatrix();
      g.position.x = W > 991 ? 2.6 : 0;
      if (reduce) R.render(S, C);
    };
    size(true);
    addEventListener('resize', () => size(false));
    cv.classList.add('on'); // fade in

    if (reduce) {
      R.render(S, C);
      return;
    }
    let mx = 0,
      my = 0,
      sc = 0,
      last = 0;
    if (canHover)
      addEventListener('pointermove', e => {
        mx = e.clientX / innerWidth - 0.5;
        my = e.clientY / innerHeight - 0.5;
      });
    addEventListener('scroll', () => (sc = scrollY / innerHeight), {
      passive: true,
    });
    let gap = mobile ? 1000 / 30 : 0; // phones: 30fps is plenty for a background

    /* AUTO QUALITY: if the page starts to hitch (frames longer than 40ms), the background steps itself down so
       scrolling never stutters (also if drawing a frame takes >14ms). level 1 = fewer pixels, level 2 = no star dots + 24fps,
       level 3 = background switched off (the page itself stays smooth). Good devices never leave level 0. */
    let level = 0,
      slow = 0,
      warm = 20,
      alive = true,
      prev = performance.now();
    cv.dataset.q = 0; // current background quality level (0 = best); handy for debugging
    const degrade = () => {
      level++;
      cv.dataset.q = level;
      slow = 0;
      warm = 20;
      if (level === 1) {
        R.setPixelRatio(1);
        size(true);
      } else if (level === 2) {
        pts.visible = false;
        gap = 1000 / 24;
      } else {
        alive = false;
        cv.classList.remove('on');
      }
    };
    const loop = now => {
      if (!alive) return;
      requestAnimationFrame(loop);
      const raw = now - prev; // time since the previous animation frame = how busy the page is
      prev = now;
      if (document.hidden || raw > 250) return; // tab was in the background: do not count it
      if (warm > 0)
        warm--; // ignore the first frames (shader compile, page still loading)
      else {
        slow = raw > 40 ? slow + 1 : Math.max(0, slow - 0.1);
        if (slow > 20) return degrade();
      }
      if (gap && now - last < gap) return;
      last = now;
      const t = now * 0.0003;
      core.rotation.y = t + sc * 0.8;
      core.rotation.x = t * 0.6 + my * 0.6;
      ring.rotation.z = t * 2;
      pts.rotation.y = t * 0.3 + mx * 0.3;
      g.position.y = -sc * 0.6;
      C.position.x += (mx * 1.2 - C.position.x) * 0.04;
      const t0 = performance.now();
      R.render(S, C);
      // drawing one frame should take a few ms; if it blocks the page for >14ms the device is too weak
      if (!warm && performance.now() - t0 > 14) slow += 1;
    };
    requestAnimationFrame(loop);
  } catch (err) {
    console.warn('3D background disabled:', err.message);
  }
};
const loadThree = () => {
  const s = document.createElement('script');
  s.src = 'vendor/three.min.js';
  s.onload = initBg;
  s.onerror = () => console.warn('3D background disabled: three.js not found');
  document.head.appendChild(s);
};
const whenIdle = cb =>
  window.requestIdleCallback
    ? requestIdleCallback(cb, { timeout: 2000 })
    : setTimeout(cb, 300);
if (document.readyState === 'complete') whenIdle(loadThree);
else addEventListener('load', () => whenIdle(loadThree));

/* ---------- scroll animations (all play ONCE, nothing is scrubbed back and forth) ---------- */
if (!reduce) {
  /* every section fades up once when it comes into view */
  $$('.wrap').forEach(s =>
    gsap.from(s, {
      opacity: 0,
      y: s.id === 'projects' ? 0 : 36, // no shift here: it holds the sticky card stack
      duration: 0.8,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: s, start: 'top 92%', once: true },
    }),
  );
  gsap.utils.toArray('.wrap h2').forEach(h =>
    gsap.from(h, {
      scrollTrigger: { trigger: h, start: 'top 88%', once: true },
      x: -30,
      opacity: 0,
      duration: 0.8,
      clearProps: 'transform,opacity',
    }),
  );
  $$('.tgroup').forEach(g => {
    gsap.from($$('.tile', g), {
      scrollTrigger: { trigger: g, start: 'top 86%', once: true },
      y: 60,
      z: -160,
      rotateX: -70,
      transformPerspective: 900,
      opacity: 0,
      stagger: 0.04,
      duration: 0.8,
      ease: 'back.out(1.4)',
      clearProps: 'transform,opacity',
    });
    gsap.from($('h3', g), {
      scrollTrigger: { trigger: g, start: 'top 90%', once: true },
      x: -30,
      opacity: 0,
      duration: 0.6,
      clearProps: 'transform,opacity',
    });
  });
  gsap.from('#about .lead', {
    scrollTrigger: { trigger: '#about', start: 'top 75%', once: true },
    y: 40,
    opacity: 0,
    duration: 1,
    clearProps: 'transform,opacity',
  });
  gsap.from('#github .stats img', {
    scrollTrigger: { trigger: '#github', start: 'top 78%', once: true },
    y: 50,
    opacity: 0,
    stagger: 0.15,
    duration: 0.9,
    clearProps: 'transform,opacity',
  });
  gsap.from('.foot > *', {
    scrollTrigger: { trigger: '.foot', start: 'top 97%', once: true },
    y: 20,
    opacity: 0,
    stagger: 0.08,
    duration: 0.6,
    clearProps: 'transform,opacity',
  });
  /* small hero parallax: mouse devices only, translate only (no fade, so the hero always looks complete when you scroll back up) */
  if (canHover)
    gsap.to('.photo', {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      y: -50,
      ease: 'none',
    });
}
if (typeof gsap !== 'undefined')
  gsap.to('#bar', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: true },
  });

/* ---------- about quote: word-by-word 3D reveal (+ soft tilt on mouse devices) ---------- */
(() => {
  const q = $('.quote'),
    p = $('.quote p');
  if (!q || !p) return;
  p.innerHTML = p.textContent
    .trim()
    .split(/\s+/)
    .map(w => `<span class="w">${w}</span>`)
    .join(' ');
  if (reduce) return;
  gsap.from('.quote .w', {
    scrollTrigger: { trigger: q, start: 'top 82%', once: true },
    y: 40,
    rotateX: -80,
    z: -100,
    transformPerspective: 800,
    opacity: 0,
    stagger: 0.06,
    duration: 0.8,
    ease: 'back.out(1.5)',
    clearProps: 'transform,opacity',
  });
  gsap.from('.quote .qmark', {
    scrollTrigger: { trigger: q, start: 'top 85%', once: true },
    scale: 0.4,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    clearProps: 'transform,opacity',
  });
  if (!canHover) return;
  q.addEventListener('mousemove', e => {
    const r = q.getBoundingClientRect(),
      x = (e.clientX - r.left) / r.width - 0.5,
      y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(q, {
      transformPerspective: 1000,
      rotateY: x * 5,
      rotateX: -y * 5,
      duration: 0.5,
      ease: 'power2.out',
    });
  });
  q.addEventListener('mouseleave', () =>
    gsap.to(q, { rotateX: 0, rotateY: 0, duration: 0.7 }),
  );
})();

/* ---------- keep trigger positions correct when things load late (fonts, stat images) ---------- */
if (typeof ScrollTrigger !== 'undefined') {
  let rt;
  const refresh = () => {
    clearTimeout(rt);
    rt = setTimeout(() => ScrollTrigger.refresh(), 150);
  };
  addEventListener('load', refresh);
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(refresh);
  $$('#github .stats img').forEach(i => i.addEventListener('load', refresh));
}
