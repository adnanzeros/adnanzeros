'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const FILE_NAME = 'Adnan-Sami-CV';

const CONTACT = [
  {
    icon: 'mail',
    href: 'mailto:asadnanzeros@gmail.com',
    text: 'asadnanzeros@gmail.com',
  },
  { icon: 'pin', text: 'Faridpur, Dhaka Division, Bangladesh' },
  {
    icon: 'chat',
    href: 'https://wa.me/8801580327310',
    text: '+880 1580 327310 (WhatsApp)',
  },
  {
    icon: 'github',
    href: 'https://github.com/adnanzeros',
    text: 'github.com/adnanzeros',
  },
  {
    icon: 'linkedin',
    href: 'https://www.linkedin.com/in/adnanzeros/',
    text: 'linkedin.com/in/adnanzeros',
  },
];

const SKILLS = [
  ['Languages', 'HTML5, CSS3, JavaScript, TypeScript, Python, PowerShell'],
  [
    'Frontend',
    'React, Next.js, React Native, React Router, Vite, Tailwind CSS, WordPress, GSAP, Three.js',
  ],
  [
    'Backend & Cloud',
    'Node.js, Vercel, Netlify, Firebase, Google Cloud, Resend',
  ],
  ['Tools & Design', 'Git, GitHub, npm, Figma, Canva, Adobe XD, Blender'],
];

const PROJECTS = [
  {
    title: 'TimeMate: Screen Time Coach',
    meta: 'JavaScript · Chrome APIs',
    points: [
      'Chrome extension that tracks the time spent on every tab',
      'Blocks distracting sites and sends reminder notifications',
      'Includes a Focus Mode for distraction-free sessions',
    ],
    href: 'https://github.com/adnanzeros/screen-time-coach',
    label: 'github.com/adnanzeros/screen-time-coach',
  },
  {
    title: 'DevStack',
    meta: 'React · Vite · CSS',
    points: [
      'Explore technologies and compose a personalized React tech stack',
      'Component-based UI built with React and Vite',
    ],
    href: 'https://github.com/adnanzeros/Assignment-5',
    label: 'github.com/adnanzeros/Assignment-5',
  },
  {
    title: 'Shuru Kori Online',
    meta: 'Web · Platform',
    points: [
      'Learning platform featuring live sessions',
      'Practical, hands-on work alongside the lessons',
    ],
    href: 'https://shurukori.online/',
    label: 'shurukori.online',
  },
  {
    title: 'Personal Portfolio (adnanzeros)',
    meta: 'Next.js · GSAP · Resend',
    points: [
      'Next.js site with GSAP scroll animations and 3D tilt cards',
      'Contact form served by a Resend API route',
      'GitHub stats charts, filterable projects, fully responsive',
    ],
    href: 'https://github.com/adnanzeros',
    label: 'github.com/adnanzeros',
  },
];

const FOCUS = [
  'Responsive websites and React / Next.js apps',
  'Clean, modern interface and web design',
  'Chrome extensions for small everyday problems',
  'Learning by shipping real projects',
];

const DETAILS = [
  ['Nationality', 'Bangladeshi'],
  ['Religion', 'Muslim'],
  ['Location', 'Faridpur, Bangladesh'],
];

function Icon({ name }) {
  return (
    <svg className="i" aria-hidden="true" focusable="false">
      <use href={`#i-${name}`} />
    </svg>
  );
}

function BtnIcon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <use href={`#i-${name}`} />
    </svg>
  );
}

export default function CvPageClient() {
  const fitRef = useRef(null);
  const sheetRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    const fit = fitRef.current;
    const sheet = sheetRef.current;
    if (!fit || !sheet) return undefined;

    const originalTitle = document.title;

    const fitSheet = () => {
      const scale = Math.min(1, fit.clientWidth / sheet.offsetWidth);
      sheet.style.transform = `scale(${scale})`;
      fit.style.height = `${sheet.offsetHeight * scale}px`;
    };
    const beforePrint = () => {
      document.title = FILE_NAME;
    };
    const afterPrint = () => {
      document.title = originalTitle;
    };

    fitSheet();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitSheet).catch(() => {});
    }
    window.addEventListener('resize', fitSheet);
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      window.removeEventListener('resize', fitSheet);
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  async function downloadCv() {
    setDownloading(true);
    setNote('');
    try {
      const response = await fetch('/api/cv', { cache: 'no-store' });
      const type = response.headers.get('content-type') || '';
      if (!response.ok || !type.includes('pdf')) {
        throw new Error('PDF download is unavailable.');
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${FILE_NAME}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
      setNote('Your CV is downloading.');
    } catch {
      setNote(
        'Direct download is not available right now. In the print window choose "Save as PDF".',
      );
      window.print();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <header className="top ui">
        <Link href="/" className="brand">
          <img src="/favicon.svg" alt="" width="34" height="34" />
          adnanzeros
        </Link>
        <Link href="/" className="back">
          &larr; Back<span className="long"> to portfolio</span>
        </Link>
      </header>

      <main className="stage">
        <h1 className="page-title ui">My CV</h1>
        <p className="page-sub ui">
          Preview below. You can download the one-page PDF with the button under
          the CV.
        </p>

        <div className="fit" ref={fitRef}>
          <article
            className="sheet"
            ref={sheetRef}
            aria-label="Curriculum vitae of Adnan Sami"
          >
            <header className="head">
              <div>
                <h1>Adnan Sami</h1>
                <p className="headline">
                  Junior Frontend &amp; Backend Developer &middot; Web Designer
                  &middot; Digital Creator
                </p>
                <div className="contact">
                  {CONTACT.map(({ icon, href, text }) =>
                    href ? (
                      <a key={text} href={href}>
                        <Icon name={icon} />
                        <b>{text}</b>
                      </a>
                    ) : (
                      <span key={text}>
                        <Icon name={icon} />
                        <b>{text}</b>
                      </span>
                    ),
                  )}
                </div>
              </div>
              <div className="avatar">
                <img
                  src="/assets/adnan.webp"
                  alt="Adnan Sami"
                  width="920"
                  height="920"
                />
              </div>
            </header>

            <section className="sec profile-section">
              <h2>Profile</h2>
              <p>
                Junior full-stack web developer and web designer from Faridpur,
                Bangladesh. I build responsive websites and React apps, design
                clean interfaces, and make Chrome extensions that solve small
                everyday problems. I am currently training in AI-driven
                full-stack web engineering at Programming Hero and I learn by
                shipping real projects.
              </p>
              <p className="motto">
                &ldquo;Doing something is better than doing nothing.&rdquo;
              </p>
            </section>

            <div className="cols">
              <div className="col">
                <section className="sec">
                  <h2>Projects</h2>
                  {PROJECTS.map(p => (
                    <div className="item" key={p.title}>
                      <div className="row">
                        <h3>{p.title}</h3>
                        <span className="meta">{p.meta}</span>
                      </div>
                      <ul>
                        {p.points.map(pt => (
                          <li key={pt}>{pt}</li>
                        ))}
                      </ul>
                      <a className="lnk" href={p.href}>
                        {p.label}
                      </a>
                    </div>
                  ))}
                </section>

                <section className="sec">
                  <h2>What I Do</h2>
                  <div className="item">
                    <ul>
                      {FOCUS.map(f => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>

              <div className="col">
                <section className="sec">
                  <h2>Skills</h2>
                  {SKILLS.map(([label, value]) => (
                    <div className="skill" key={label}>
                      <b>{label}</b>
                      <span>{value}</span>
                    </div>
                  ))}
                </section>

                <section className="sec">
                  <h2>Education &amp; Training</h2>
                  <div className="item edu">
                    <div className="row">
                      <h3>AI-Driven Full Stack Web Engineering</h3>
                      <span className="meta">Ongoing</span>
                    </div>
                    <p>
                      Programming Hero &middot; Batch 14
                      <br />
                      Student ID: <span className="nowrap">WEB14-0865</span>
                    </p>
                  </div>
                  <div className="item edu">
                    <div className="row">
                      <h3>Higher Secondary Certificate (HSC)</h3>
                      <span className="meta">Completed</span>
                    </div>
                    <p>Government Yasin College, Faridpur, Bangladesh</p>
                  </div>
                </section>

                <section className="sec">
                  <h2>Personal Details</h2>
                  <dl className="dl">
                    {DETAILS.map(([k, v]) => (
                      <div key={k} style={{ display: 'contents' }}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              </div>
            </div>
          </article>
        </div>

        <div className="actions ui">
          <button
            className="btn solid"
            type="button"
            disabled={downloading}
            aria-busy={downloading}
            onClick={downloadCv}
          >
            <BtnIcon name="download" />
            <span>{downloading ? 'Preparing PDF…' : 'Download CV (PDF)'}</span>
          </button>
          <button className="btn" type="button" onClick={() => window.print()}>
            <BtnIcon name="open" />
            <span>Print</span>
          </button>
        </div>
        <p className="note ui" role="status" aria-live="polite">
          {note}
        </p>
      </main>

      <svg
        width="0"
        height="0"
        style={{ position: 'absolute' }}
        aria-hidden="true"
        focusable="false"
      >
        <symbol id="i-mail" viewBox="0 0 24 24">
          <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </symbol>
        <symbol id="i-chat" viewBox="0 0 24 24">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </symbol>
        <symbol id="i-pin" viewBox="0 0 24 24">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </symbol>
        <symbol id="i-github" viewBox="0 0 24 24">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </symbol>
        <symbol id="i-linkedin" viewBox="0 0 24 24">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </symbol>
        <symbol id="i-download" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </symbol>
        <symbol id="i-open" viewBox="0 0 24 24">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </symbol>
      </svg>
    </>
  );
}
