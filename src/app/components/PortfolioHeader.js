'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import '../header-dropdown.css';

const links = [
  ['About', '#about'],
  ['Tech', '#stack'],
  ['Projects', '#projects'],
  ['GitHub', '#github'],
  ['Contact', '#contact'],
];

/* base="" home page e (#about), base="/" onno page theke ("/#about") */
export default function PortfolioHeader({ base = '' }) {
  const [open, setOpen] = useState(false);
  const [growth, setGrowth] = useState(false);
  const growthRef = useRef(null);

  useEffect(() => {
    function closeOutside(event) {
      if (growthRef.current && !growthRef.current.contains(event.target)) {
        setGrowth(false);
      }
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        setGrowth(false);
      }
    }
    function closeOnDesktop(event) {
      if (event.matches) setOpen(false);
    }

    const desktop = matchMedia('(min-width:992px)');
    document.addEventListener('keydown', closeOnEscape);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, []);

  return (
    <header className="nav">
      <a href={`${base}#home`} className="brand">
        <img src="/favicon.svg" alt="" width="28" height="28" />
        adnanzeros
      </a>
      <button
        className="burger"
        type="button"
        aria-label={open ? 'Close menu' : 'Menu'}
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <span />
        <span />
      </button>
      <nav
        className={`menu${open ? ' open' : ''}`}
        aria-label="Main navigation"
      >
        {links.map(([name, href]) => (
          <a key={href} href={`${base}${href}`} onClick={() => setOpen(false)}>
            {name}
          </a>
        ))}
        <div className={`dd${growth ? ' open' : ''}`} ref={growthRef}>
          <button
            className="dd-btn"
            type="button"
            aria-haspopup="true"
            aria-expanded={growth}
            onClick={() => setGrowth(value => !value)}
          >
            Growth
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="m2 4 4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="dd-panel">
            <Link
              href="/blog"
              onClick={() => {
                setOpen(false);
                setGrowth(false);
              }}
            >
              Blog
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
