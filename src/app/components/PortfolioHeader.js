'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import '../header-dropdown.css';

const aboutItems = [
  { title: 'Tech', description: 'Stack and tools I use', href: '#stack' },
  {
    title: 'Work',
    description: 'Frontend, backend, extensions',
    href: '#my-work',
  },
  {
    title: 'Dev stats',
    description: 'Activity and languages',
    href: '#github',
  },
  { title: 'Contact', description: 'Send me a message', href: '#contact' },
];

function Chevron() {
  return (
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
  );
}

export default function PortfolioHeader({ base = '' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const headerRef = useRef(null);

  useEffect(() => {
    function closeOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMenuOpen(false);
        setOpenMenu(null);
      } else if (
        !(event.target instanceof Element) ||
        !event.target.closest('.dd')
      ) {
        setOpenMenu(null);
      }
    }

    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setOpenMenu(null);
      }
    }

    function closeOnDesktop(event) {
      if (event.matches) setMenuOpen(false);
    }

    const desktop = matchMedia('(min-width: 992px)');
    document.addEventListener('keydown', closeOnEscape);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, []);

  function closeMenus() {
    setMenuOpen(false);
    setOpenMenu(null);
  }

  function toggleDropdown(name) {
    setOpenMenu(current => (current === name ? null : name));
  }

  function renderAboutItems() {
    return (
      <div className="dd-links">
        {aboutItems.map(item => (
          <a
            className="dd-item"
            href={`${base}${item.href}`}
            key={item.href}
            onClick={closeMenus}
          >
            <span className="dd-item-copy">
              <span className="dd-item-title">{item.title}</span>
              {item.title === 'Dev stats' ? (
                <span className="dd-item-subtitle">
                  <h3>Activity</h3>
                  <span> and languages</span>
                </span>
              ) : (
                <span className="dd-item-subtitle">{item.description}</span>
              )}
            </span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <header
      className={`nav${openMenu ? ' dropdown-open' : ''}`}
      ref={headerRef}
      onMouseLeave={event => {
        if (
          window.matchMedia('(min-width: 992px)').matches &&
          !(
            event.relatedTarget instanceof Node &&
            event.currentTarget.contains(event.relatedTarget)
          )
        ) {
          setOpenMenu(null);
        }
      }}
    >
      <a href={`${base}#home`} className="brand">
        <img src="/favicon.svg" alt="" width="28" height="28" />
        adnanzeros
      </a>

      <button
        className="burger"
        type="button"
        aria-label={menuOpen ? 'Close menu' : 'Menu'}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen(value => !value)}
      >
        <span />
        <span />
      </button>

      <nav
        className={`menu${menuOpen ? ' open' : ''}`}
        id="primary-navigation"
        aria-label="Main navigation"
        onClick={event => {
          if (event.target === event.currentTarget) closeMenus();
        }}
      >
        {['about', 'growth'].map(name => (
          <div
            className={`dd ${name}${openMenu === name ? ' open' : ''}`}
            key={name}
            onMouseOver={() => {
              if (window.matchMedia('(min-width: 992px)').matches)
                setOpenMenu(name);
            }}
          >
            <button
              className="dd-btn"
              type="button"
              aria-haspopup="true"
              aria-expanded={openMenu === name}
              aria-controls={`${name}-navigation-panel`}
              onClick={() => toggleDropdown(name)}
            >
              {name === 'about' ? 'About' : 'Growth'}
              <Chevron />
            </button>
            <div className="dd-panel" id={`${name}-navigation-panel`}>
              {name === 'about' ? (
                renderAboutItems()
              ) : (
                <div className="dd-links">
                  <Link className="dd-item" href="/blog" onClick={closeMenus}>
                    <span className="dd-item-copy">
                      <span className="dd-item-title">Blog</span>
                      <span className="dd-item-subtitle">
                        Notes on design and code
                      </span>
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </nav>
    </header>
  );
}
