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
      const r = await fetch('/api/next/contact', {
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

/* ---------- project cards: stacked, scroll-driven (works for ANY number of projects, both scroll directions) ----------
   CSS (position:sticky) does the stacking: each new card slides over the previous one.
   paintStack() below reads the scroll position and, for every card, measures how far the NEXT card has covered it:
     0 = next card not touching yet  -> this card is full colour, full size
     1 = next card is in its place   -> this card is dimmed + a bit smaller
   Because it is calculated from the scroll position (not a one-way animation), scrolling back up simply plays it in reverse:
   card 1 slowly comes back to full colour when card 2 slides away. The LAST card is always full colour. */
let curTab = 'frontend';
const MAX_DIM = 0.65; // how dark a covered card gets (0 = no dim, 1 = black)
const MIN_SCALE = 0.94; // how small a covered card gets (1 = no scale)

const paintStack = () => {
  const cards = $$('#projgrid .card');
  cards.forEach((c, i) => {
    const next = cards[i + 1];
    if (!next) {
      // last card: always full colour
      c.style.setProperty('--dim', 0);
      c.style.transform = '';
      return;
    }
    const topC = parseFloat(getComputedStyle(c).top) || 72; // sticky offset of this card
    const topN = parseFloat(getComputedStyle(next).top) || topC; // sticky offset of the next card
    const startY = topC + c.offsetHeight; // next card touches the bottom of this card: dimming starts
    const endY = topN; // next card reached its resting place: dimming finished
    const nowY = next.getBoundingClientRect().top;
    const p = Math.min(1, Math.max(0, (startY - nowY) / (startY - endY || 1)));
    c.style.setProperty('--dim', (p * MAX_DIM).toFixed(3));
    c.style.transform = p
      ? `scale(${(1 - p * (1 - MIN_SCALE)).toFixed(4)})`
      : '';
  });
};

if (!reduce) {
  let stackRaf = 0;
  const onStack = () => {
    if (!stackRaf)
      stackRaf = requestAnimationFrame(() => {
        stackRaf = 0;
        paintStack();
      });
  };
  addEventListener('scroll', onStack, { passive: true });
  addEventListener('resize', onStack);
}

const drawProj = t => {
  curTab = t;
  $('#projgrid').innerHTML = PROJ[t]
    .map(
      (p, i) =>
        `<a class="card" style="--i:${i}" href="${p.u}" target="_blank" rel="noopener"><span class="num" aria-hidden="true">0${i + 1}</span><div class="cbody"><h3>${p.n}</h3><p>${p.d}</p><div class="chips">${p.t.map(x => `<span>${x}</span>`).join('')}</div></div><span class="go" aria-hidden="true">&#8599;</span></a>`,
    )
    .join('');
  if (!reduce) paintStack();
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
};
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
    rt = setTimeout(() => {
      ScrollTrigger.refresh();
      if (!reduce) paintStack();
    }, 150);
  };
  addEventListener('load', refresh);
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(refresh);
  $$('#github .stats img').forEach(i => i.addEventListener('load', refresh));
}
