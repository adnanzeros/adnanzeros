"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";

const name = "adnanzeros";

export default function Hero() {
  const logoRef = useRef(null);
  const [photoReady, setPhotoReady] = useState(false);
  const [photoSource, setPhotoSource] = useState("/adnan2-640.webp");

  useLayoutEffect(() => {
    const heading = logoRef.current;
    if (!heading) return;

    let frame = 0;
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const letters = [...heading.children];
        if (!letters.length) return;
        const first = letters[0].offsetLeft;
        const last = letters.at(-1);
        const width = last.offsetLeft + last.offsetWidth - first;
        if (!width) return;
        heading.style.setProperty("--w", `${width}px`);
        letters.forEach(letter =>
          letter.style.setProperty("--x", `${letter.offsetLeft - first}px`),
        );
        heading.classList.add("gx");
      });
    };

    fit();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(fit);
    observer?.observe(heading);
    [...heading.children].forEach(letter => observer?.observe(letter));
    window.addEventListener("resize", fit);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  useEffect(() => {
    const image = document.getElementById("hero-img");
    if (image?.complete && image.naturalWidth) revealPhoto({ currentTarget: image });
    const timer = window.setTimeout(() => setPhotoReady(true), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  async function revealPhoto(event) {
    const image = event.currentTarget;
    try {
      if (image.decode) await image.decode();
    } catch (error) {
      if (image.naturalWidth) console.error("Could not decode the profile photo.", error);
    }
    setPhotoReady(true);
  }

  return (
    <section id="home" className="hero">
      <div className="hero-text">
        <p className="eyebrow">
          <i className="dot" aria-hidden="true" />
          Hi, I&apos;m
        </p>
        <h1 className="logo" ref={logoRef} data-t={name} aria-label={name}>
          {[...name].map((letter, index) => (
            <span key={`${letter}-${index}`} aria-hidden="true" style={{ "--i": index }}>
              {letter}
            </span>
          ))}
        </h1>
        <p className="alias">
          Official name: <strong>Adnan Sami</strong> &middot; Bangladesh
        </p>
        <p className="role">
          Web designer and frontend developer from Dhaka, Bangladesh. I build
          clean, practical websites and tools.
        </p>
        <div className="cta">
          <a className="btn solid" href="#projects">
            See my work <span className="arr" aria-hidden="true">&rarr;</span>
          </a>
          <a className="btn" href="#contact">
            Send a message
          </a>
          <Link className="btn" href="/cv">
            View CV
          </Link>
        </div>
      </div>
      <div className="photo tilt" id="photo">
        <div className={`photo-in${photoReady ? " ready" : ""}`}>
          <img
            id="hero-img"
            src={photoSource}
            srcSet={
              photoSource === "/adnan2-640.webp"
                ? "/adnan2-480.webp 480w, /adnan2-640.webp 640w, /adnan2.webp 920w"
                : undefined
            }
            sizes="(max-width:991px) 66vw, 460px"
            alt="Adnan Sami (adnanzeros), web designer from Bangladesh"
            width="920"
            height="920"
            fetchPriority="high"
            decoding="async"
            onLoad={revealPhoto}
            onError={() => {
              if (photoSource !== "/assets/adnan.webp")
                setPhotoSource("/assets/adnan.webp");
              setPhotoReady(true);
            }}
          />
        </div>
      </div>
      <a className="scroll-cue" href="#about" aria-label="Scroll down">
        <i />
      </a>
    </section>
  );
}
