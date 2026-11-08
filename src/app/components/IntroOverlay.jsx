'use client';

import { useEffect, useState } from 'react';
import styles from './IntroOverlay.module.css';

/*
  Minimal intro: logo + name + thin progress line, then a soft fade.
  - Plays once per tab session, only on the home page.
  - Skipped for reduced-motion users, /admin, /cv, /privacy, /terms.
  - Keep SESSION_KEY in sync with public/intro-session-bootstrap.js
    and server/src/modules/cv/cv.service.js.
*/

const SESSION_KEY = 'adnanzeros-intro-completed-v5';
const SHOW_MS = 1500;
const FADE_MS = 450;

export default function IntroOverlay() {
  const [phase, setPhase] = useState('idle'); // idle | playing | leaving | done

  useEffect(() => {
    const root = document.documentElement;

    const finish = () => {
      root.setAttribute('data-intro-completed', '');
      try {
        window.sessionStorage.setItem(SESSION_KEY, 'played');
      } catch {
        /* Storage can be disabled; the intro will simply play again. */
      }
      setPhase('done');
    };

    let skip = window.location.pathname !== '/';
    try {
      if (window.sessionStorage.getItem(SESSION_KEY)) skip = true;
    } catch {
      /* Storage unavailable: play the intro. */
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      skip = true;
    }
    if (skip || root.hasAttribute('data-intro-completed')) {
      setPhase('done');
      return undefined;
    }

    setPhase('playing');
    const leaveTimer = window.setTimeout(() => setPhase('leaving'), SHOW_MS);
    const doneTimer = window.setTimeout(finish, SHOW_MS + FADE_MS);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className={styles.intro}
      data-phase={phase}
      data-intro-overlay
      aria-hidden="true"
    >
      <div className={styles.content}>
        <img
          className={styles.logo}
          src="/favicon.svg"
          alt=""
          width="52"
          height="52"
        />
        <p className={styles.name}>adnanzeros</p>
        <p className={styles.tag}>Web Designer &amp; Frontend Developer</p>
        <span className={styles.bar} />
      </div>
    </div>
  );
}
