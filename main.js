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
// phones, data-saver and weak devices get a light static star background instead of the 3D one:
// three.js (600 KB) is never even downloaded for them, so the page loads fast and scrolls smoothly
const lite =
  innerWidth <= 991 ||
  !!(navigator.connection && navigator.connection.saveData) ||
  (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
if (lite) document.documentElement.classList.add('lite');

/* ---------- contact form (runs first so nothing else can break it) ---------- */
(() => {
  const f = $('#form'),
    st = $('#status'),
    dial = $('#dial'),
    btn = $('button[type=submit]', f);
  /* ---- country picker: closed = flag + short code (BD +880); open = search box + flag + full name ---- */
  const ccBtn = $('#ccBtn'),
    ccPop = $('#ccPop'),
    ccList = $('#ccList'),
    ccQ = $('#ccSearch');
  let cur = null,
    shown = [];
  if (window.COUNTRIES && ccBtn) {
    const ALIAS = {
      GB: 'uk england britain',
      US: 'usa america',
      AE: 'uae emirates',
      KR: 'korea',
      KP: 'korea',
      CZ: 'czech',
      CD: 'congo',
      CG: 'congo',
    };
    const C = COUNTRIES.map(([n, d, i]) => ({
      n,
      d,
      i,
      k: `${n} ${i} +${d} ${ALIAS[i] || ''}`.toLowerCase(),
    }));
    cur = C[0];
    const flag = (i, w) => `https://flagcdn.com/w${w}/${i.toLowerCase()}.png`;
    const esc = s => s.replace(/[&<>"']/g, ch => '&#' + ch.charCodeAt(0) + ';');
    const apply = c => {
      cur = c;
      dial.value = c.d;
      $('#ccFlag').src = flag(c.i, 40);
      $('#ccFlag').srcset = `${flag(c.i, 40)} 1x, ${flag(c.i, 80)} 2x`;
      $('#ccIso').textContent = c.i;
      $('#ccDial').textContent = '+' + c.d;
      ccBtn.setAttribute('aria-label', `Country code: ${c.n} +${c.d}`);
    };
    const row = c =>
      `<li role="option" id="cc-${c.i}" data-i="${c.i}" aria-selected="${c === cur}"><img class="flag" src="${flag(c.i, 40)}" srcset="${flag(c.i, 40)} 1x, ${flag(c.i, 80)} 2x" width="24" height="18" alt="" loading="lazy" decoding="async"><span class="n">${esc(c.n)}</span><span class="d">+${c.d}</span></li>`;
    let act = -1;
    const items = () => [...ccList.querySelectorAll('[role=option]')];
    const mark = i => {
      const it = items();
      if (!it.length) return;
      act = (i + it.length) % it.length;
      it.forEach((e, j) => e.classList.toggle('act', j === act));
      it[act].scrollIntoView({ block: 'nearest' });
      ccQ.setAttribute('aria-activedescendant', it[act].id);
    };
    const render = () => {
      const q = ccQ.value.trim().toLowerCase().replace(/^\+/, '');
      // best matches first: exact code/alias (uk, bd, usa), then names that start with it, then anything that contains it.
      // digits only (44, +880) match the start of the dial code, so +44 never lists +244
      const digits = /^\d+$/.test(q);
      const score = c => {
        if (!q) return 0;
        if (digits) return c.d.startsWith(q) ? 0 : 9;
        if (c.i.toLowerCase() === q || c.k.split(' ').includes(q)) return 0;
        if (c.n.toLowerCase().startsWith(q)) return 1;
        return c.k.includes(q) ? 2 : 9;
      };
      shown = C.map((c, i) => [score(c), i, c])
        .filter(x => x[0] < 9)
        .sort((a, b) => a[0] - b[0] || a[1] - b[1])
        .map(x => x[2]);
      ccList.innerHTML = shown.length
        ? shown.map(row).join('')
        : '<li class="cc-empty" role="presentation">No country found</li>';
      act = -1;
      ccQ.removeAttribute('aria-activedescendant');
    };
    const close = () => {
      ccPop.hidden = true;
      ccBtn.setAttribute('aria-expanded', 'false');
    };
    const open = () => {
      ccQ.value = '';
      render(); // the 194 rows are only built when the list is opened (keeps page load light)
      ccPop.hidden = false;
      ccBtn.setAttribute('aria-expanded', 'true');
      const s = ccList.querySelector('[aria-selected=true]');
      if (s) ccList.scrollTop = Math.max(0, s.offsetTop - 60);
      ccQ.focus({ preventScroll: true });
      ccPop.scrollIntoView({ block: 'nearest' });
    };
    const choose = c => {
      apply(c);
      close();
      $('#phone').focus({ preventScroll: true });
    };
    ccBtn.addEventListener('click', () => (ccPop.hidden ? open() : close()));
    ccQ.addEventListener('input', render);
    ccQ.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        mark(act + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        mark(act - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const c = shown[act < 0 ? 0 : act];
        if (c) choose(c);
      } else if (e.key === 'Escape') {
        close();
        ccBtn.focus();
      }
    });
    ccList.addEventListener('click', e => {
      const li = e.target.closest('[data-i]');
      if (li) choose(COUNTRIES_BY_ISO(li.dataset.i));
    });
    ccList.addEventListener(
      'error',
      e => {
        if (e.target.tagName === 'IMG') e.target.style.visibility = 'hidden';
      },
      true,
    );
    document.addEventListener('pointerdown', e => {
      if (!ccPop.hidden && !$('#cc').contains(e.target)) close();
    });
    const COUNTRIES_BY_ISO = i => C.find(c => c.i === i);
    f.__applyCountry = () => apply(cur);
  }
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
      if (f.__applyCountry) f.__applyCountry(); // reset() puts the hidden code back to 880, keep the chosen country
    } catch (err) {
      say(
        err.message === 'Failed to fetch'
          ? /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
            ? 'Cannot reach the server. Run npm run dev and open http://localhost:3000'
            : 'Could not send right now. Please check your connection and try again.'
          : err.message,
        'err',
      );
    }
    btn.disabled = false;
  });
})();

/* ---------- content ---------- */
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
/* the tech grid is plain HTML + inline SVG in index.html (on screen instantly, no JS and no image downloads) */

/* project cards: ONE card on top of another on every screen size.
   CSS (position:sticky) does the stacking; gsap only adds depth: a card rises in, and sinks back + dims when the next one covers it. */
let curTab = 'frontend',
  stackFx = [];
const stackMQ = matchMedia('(max-width:480px)'); // phone gets slightly different offsets (see style.css), so rebuild when crossing it
const clearStack = () => {
  stackFx.forEach(t => {
    t.scrollTrigger && t.scrollTrigger.kill();
    t.kill();
  });
  stackFx = [];
};
const buildStack = () => {
  const cards = $$('#projgrid .card'),
    n = cards.length,
    topOf = c => parseFloat(getComputedStyle(c).top) || 72; // the real sticky offset from CSS
  cards.forEach((c, i) => {
    // 1) rises into view as you scroll (opacity + translate only = cheap)
    stackFx.push(
      gsap.fromTo(
        c,
        { y: 70, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: c,
            start: 'top 98%',
            end: 'top 74%',
            scrub: 0.2,
          },
        },
      ),
    );
    // 2) the next card slides over this one: it sinks back and dims
    if (i < n - 1)
      stackFx.push(
        gsap.fromTo(
          c,
          { scale: 1, '--dim': 0 },
          {
            scale: 0.94,
            '--dim': 0.6,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: cards[i + 1],
              start: 'top 90%',
              end: 'top ' + (topOf(cards[i + 1]) + 8) + 'px',
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
  $('#projgrid').innerHTML = PROJ[t]
    .map(
      (p, i) =>
        `<a class="card" style="--i:${i}" href="${p.u}" target="_blank" rel="noopener"><span class="num" aria-hidden="true">0${i + 1}</span><div class="cbody"><h3>${p.n}</h3><p>${p.d}</p><div class="chips">${p.t.map(x => `<span>${x}</span>`).join('')}</div></div><span class="go" aria-hidden="true">&#8599;</span></a>`,
    )
    .join('');
  if (!reduce) buildStack();
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
addEventListener('keydown', e => {
  if (e.key === 'Escape' && menu.classList.contains('open')) {
    setMenu(false);
    burger.focus();
  }
});
matchMedia('(min-width:992px)').addEventListener(
  'change',
  e => e.matches && setMenu(false),
);

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
if (canHover) {
  let spotRaf = 0,
    spotEv = null;
  const spot = () => {
    spotRaf = 0;
    const t = spotEv.target.closest && spotEv.target.closest('.tile,.card');
    if (!t) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', spotEv.clientX - r.left + 'px');
    t.style.setProperty('--my', spotEv.clientY - r.top + 'px');
  };
  addEventListener(
    'pointermove',
    e => {
      spotEv = e;
      if (!spotRaf) spotRaf = requestAnimationFrame(spot);
    },
    { passive: true },
  );
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
      if (!cv.offsetWidth) return; // canvas hidden (window shrunk to phone size): do not draw
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
if (!lite) {
  if (document.readyState === 'complete') whenIdle(loadThree);
  else addEventListener('load', () => whenIdle(loadThree));
}

/* ---------- scroll animations (all play ONCE, nothing is scrubbed back and forth) ---------- */
if (!reduce && typeof ScrollTrigger !== 'undefined') {
  /* every section (except About + Tech: those stay static) fades up once when it comes into view */
  $$('.wrap:not(#about):not(#stack)').forEach(s =>
    gsap.from(s, {
      opacity: 0,
      y: s.id === 'projects' ? 0 : 36, // no shift here: it holds the sticky card stack
      duration: 0.8,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: s, start: 'top 92%', once: true },
    }),
  );
  gsap.utils.toArray('.wrap:not(#about):not(#stack) h2').forEach(h =>
    gsap.from(h, {
      scrollTrigger: { trigger: h, start: 'top 88%', once: true },
      x: -30,
      opacity: 0,
      duration: 0.8,
      clearProps: 'transform,opacity',
    }),
  );
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
  /* hero text drifts up a little slower than the page: gives the hero some depth when you scroll */
  if (canHover)
    gsap.to('.hero-text', {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      y: -28,
      ease: 'none',
    });
}
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined')
  gsap.to('#bar', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: true },
  });

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
