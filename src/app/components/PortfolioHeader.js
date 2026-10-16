"use client";

import { useEffect, useState } from "react";

const links = [
  ["About", "#about"],
  ["Tech", "#stack"],
  ["Projects", "#projects"],
  ["GitHub", "#github"],
  ["Contact", "#contact"],
];

export default function PortfolioHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }
    function closeOnDesktop(event) {
      if (event.matches) setOpen(false);
    }

    const desktop = matchMedia("(min-width:992px)");
    document.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, []);

  return (
    <header className="nav">
      <a href="#home" className="brand">
        <img src="/favicon.svg" alt="" width="28" height="28" />
        adnanzeros
      </a>
      <button
        className="burger"
        type="button"
        aria-label={open ? "Close menu" : "Menu"}
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <span />
        <span />
      </button>
      <nav className={`menu${open ? " open" : ""}`} aria-label="Main navigation">
        {links.map(([name, href]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {name}
          </a>
        ))}
      </nav>
    </header>
  );
}
