const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce =
  matchMedia('(prefers-reduced-motion: reduce)').matches ||
  typeof gsap === 'undefined';
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined')
  gsap.registerPlugin(ScrollTrigger);
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
/* project cards: grid on tablet/desktop, 3D sticky stack on phones (<=480px) */
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
            scrub: 0.4,
          },
        },
      ),
    );
    // 2) when the next card slides over it, this one sinks back and dims
    if (i < n - 1)
      stackFx.push(
        gsap.fromTo(
          c,
          { scale: 1, rotateX: 0, filter: 'brightness(1)' },
          {
            scale: 0.93,
            rotateX: 5,
            filter: 'brightness(.5)',
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: cards[i + 1],
              start: 'top 88%',
              end: 'top ' + (stackTop(i + 1) + 10) + 'px',
              scrub: 0.4,
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
      gsap.from('#projgrid .card', {
        y: 40,
        rotateX: -40,
        transformPerspective: 900,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
      });
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

/* ---------- 3D tilt (cards + photo) ---------- */
function bindTilt() {
  if (reduce) return;
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
img.classList.add('tilt');
drawProj('frontend');
bindTilt();

/* ---------- hero intro (one orchestrated moment) ---------- */
const logo = $('.logo');
logo.innerHTML = [...logo.textContent].map(c => `<span>${c}</span>`).join('');
if (typeof gsap !== 'undefined') gsap.registerPlugin(ScrollTrigger);
if (!reduce) {
  gsap
    .timeline({ defaults: { ease: 'power4.out' } })
    .from('.logo span', {
      yPercent: 110,
      rotateX: -90,
      opacity: 0,
      stagger: 0.05,
      duration: 1.1,
    })
    .from(
      '.hi,.role,.cta',
      { y: 20, opacity: 0, stagger: 0.12, duration: 0.7 },
      '-=.6',
    )
    .from(
      '#photo img',
      { rotateY: -60, opacity: 0, scale: 0.9, duration: 1.3 },
      '-=1.2',
    );
  gsap.utils
    .toArray('.wrap h2')
    .forEach(h =>
      gsap.from(h, {
        scrollTrigger: { trigger: h, start: 'top 85%' },
        x: -30,
        opacity: 0,
        duration: 0.8,
      }),
    );
}

/* ---------- three.js background ---------- */
try {
  (() => {
    const cv = $('#bg'),
      R = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
    R.setPixelRatio(Math.min(devicePixelRatio, innerWidth <= 991 ? 1.5 : 2));
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
    const n = 700,
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
    const size = () => {
      R.setSize(innerWidth, innerHeight);
      C.aspect = innerWidth / innerHeight;
      C.updateProjectionMatrix();
      g.position.x = innerWidth > 991 ? 2.6 : 0;
    };
    size();
    addEventListener('resize', size);
    let mx = 0,
      my = 0;
    addEventListener('pointermove', e => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    });
    let sc = 0;
    addEventListener('scroll', () => (sc = scrollY / innerHeight), {
      passive: true,
    });
    (function loop() {
      const t = performance.now() * 0.0003;
      if (!reduce) {
        core.rotation.y = t + sc * 0.8;
        core.rotation.x = t * 0.6 + my * 0.6;
        ring.rotation.z = t * 2;
        pts.rotation.y = t * 0.3 + mx * 0.3;
        g.position.y = -sc * 0.6;
        C.position.x += (mx * 1.2 - C.position.x) * 0.04;
      }
      R.render(S, C);
      requestAnimationFrame(loop);
    })();
  })();
} catch (err) {
  console.warn('3D background disabled:', err.message);
}

/* ---------- scroll animations ---------- */
if (!reduce) {
  $$('.tgroup').forEach(g => {
    gsap.from($$('.tile', g), {
      scrollTrigger: { trigger: g, start: 'top 82%' },
      y: 70,
      z: -200,
      rotateX: -80,
      transformPerspective: 900,
      opacity: 0,
      stagger: 0.05,
      duration: 0.9,
      ease: 'back.out(1.4)',
    });
    gsap.from($('h3', g), {
      scrollTrigger: { trigger: g, start: 'top 88%' },
      x: -30,
      opacity: 0,
      duration: 0.6,
    });
  });
  gsap.from('#about .lead', {
    scrollTrigger: { trigger: '#about', start: 'top 75%' },
    y: 40,
    opacity: 0,
    duration: 1,
  });
  gsap.from('#github .stats img', {
    scrollTrigger: { trigger: '#github', start: 'top 75%' },
    y: 60,
    rotateX: -30,
    transformPerspective: 900,
    opacity: 0,
    stagger: 0.15,
    duration: 0.9,
  });
  gsap.from('.foot > *', {
    scrollTrigger: { trigger: '.foot', start: 'top 95%' },
    y: 20,
    opacity: 0,
    stagger: 0.08,
    duration: 0.6,
  });
  gsap.to('.photo', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
    y: -80,
    rotateZ: 3,
  });
  gsap.to('.hero-text', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
    y: -60,
    opacity: 0.2,
  });
}
if (typeof gsap !== 'undefined')
  gsap.to('#bar', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });

/* =====================================================================
   v2 additions: smooth scroll, 3D section transitions, quote reveal
   ===================================================================== */

/* ---------- about quote: word-by-word 3D reveal + soft tilt ---------- */
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
    scrollTrigger: { trigger: q, start: 'top 80%' },
    y: 46,
    rotateX: -80,
    z: -120,
    transformPerspective: 800,
    opacity: 0,
    stagger: 0.07,
    duration: 0.9,
    ease: 'back.out(1.5)',
  });
  gsap.from('.quote .qmark', {
    scrollTrigger: { trigger: q, start: 'top 85%' },
    scale: 0.4,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
  });
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

/* ---------- 3D section transitions (scrubbed by scroll) ---------- */
if (!reduce) {
  $$('.wrap').forEach(s => {
    gsap.fromTo(
      s,
      {
        opacity: 0,
        y: innerWidth <= 480 ? 50 : 90,
        rotateX: innerWidth <= 480 ? 10 : 16,
        transformPerspective: 1400,
        transformOrigin: '50% 0%',
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: s,
          start: 'top 96%',
          end: 'top 60%',
          scrub: 0.6,
        },
      },
    );
  });
  /* three.js scene follows the scroll a little more */
  gsap.to('#bg', {
    scrollTrigger: { start: 0, end: 'max', scrub: 1 },
    rotateZ: 6,
    scale: 1.08,
    ease: 'none',
  });
}

/* ---------- smooth (inertia) scrolling for mouse / trackpad ---------- */
const smooth = (() => {
  if (reduce || !matchMedia('(hover:hover) and (pointer:fine)').matches)
    return null; // touch devices keep native scrolling
  const root = document.documentElement;
  root.classList.add('smooth');
  const max = () => Math.max(0, root.scrollHeight - innerHeight),
    clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  let cur = scrollY,
    target = scrollY,
    running = false,
    tween = null;
  const apply = () => scrollTo({ top: cur, left: 0, behavior: 'instant' });
  const tick = () => {
    const d = target - cur;
    if (Math.abs(d) < 0.4) {
      cur = target;
      apply();
      running = false;
      gsap.ticker.remove(tick);
      return;
    }
    cur += d * 0.09;
    apply();
  };
  const start = () => {
    if (!running) {
      running = true;
      gsap.ticker.add(tick);
    }
  };
  const stopTween = () => {
    if (tween) {
      tween.kill();
      tween = null;
    }
  };
  const nudge = d => {
    stopTween();
    target = clamp((tween ? cur : target) + d, 0, max());
    start();
  };
  // layout position that ignores transforms (the 3D entrance animations move sections)
  const layoutTop = el => {
    let y = 0;
    while (el) {
      y += el.offsetTop;
      el = el.offsetParent;
    }
    return y;
  };
  const goTo = y => {
    y = clamp(y, 0, max());
    stopTween();
    running && ((running = false), gsap.ticker.remove(tick));
    const o = { v: cur };
    tween = gsap.to(o, {
      v: y,
      duration: clamp(0.8 + Math.abs(y - cur) / 3200, 0.8, 1.8),
      ease: 'power3.inOut',
      onUpdate: () => {
        cur = target = o.v;
        apply();
      },
      onComplete: () => {
        tween = null;
        cur = target = y;
      },
    });
  };
  // mouse wheel / trackpad
  addEventListener(
    'wheel',
    e => {
      if (e.ctrlKey || e.defaultPrevented || menu.classList.contains('open'))
        return;
      for (
        let el = e.target;
        el && el !== document.body && el !== root;
        el = el.parentElement
      ) {
        // let textareas etc. scroll themselves
        const oy = getComputedStyle(el).overflowY;
        if (
          (oy === 'auto' || oy === 'scroll') &&
          el.scrollHeight > el.clientHeight
        )
          return;
      }
      e.preventDefault();
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 32;
      else if (e.deltaMode === 2) dy *= innerHeight;
      nudge(dy);
    },
    { passive: false },
  );
  // keyboard
  addEventListener('keydown', e => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target,
      tag = t.tagName;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || t.isContentEditable) return;
    if (e.key === ' ' && /^(BUTTON|A)$/.test(tag)) return;
    let d = 0;
    switch (e.key) {
      case 'ArrowDown':
        d = 70;
        break;
      case 'ArrowUp':
        d = -70;
        break;
      case 'PageDown':
        d = innerHeight * 0.9;
        break;
      case 'PageUp':
        d = -innerHeight * 0.9;
        break;
      case ' ':
        d = (e.shiftKey ? -1 : 1) * innerHeight * 0.9;
        break;
      case 'Home':
        e.preventDefault();
        return goTo(0);
      case 'End':
        e.preventDefault();
        return goTo(max());
      default:
        return;
    }
    e.preventDefault();
    nudge(d);
  });
  // keep in sync when the page is scrolled by something else (scrollbar drag, find-in-page ...)
  addEventListener(
    'scroll',
    () => {
      if (!running && !tween) {
        cur = target = scrollY;
      }
    },
    { passive: true },
  );
  // menu / in-page links
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    const id = a.getAttribute('href');
    if (id.length < 2 && id !== '#') return;
    const el = id === '#' ? null : document.querySelector(id);
    if (id !== '#' && !el) return;
    e.preventDefault();
    const off = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    goTo(el ? layoutTop(el) - off : 0);
    if (el && location.hash !== id) history.pushState(null, '', id);
  });
  return { goTo };
})();

addEventListener('load', () => {
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
});
