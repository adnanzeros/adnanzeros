"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const FILE_NAME = "Adnan-Sami-CV";

export default function CvPageClient() {
  const fitRef = useRef(null);
  const sheetRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const fitSheet = () => {
      const fit = fitRef.current;
      const sheet = sheetRef.current;
      if (!fit || !sheet) return;
      const scale = Math.min(1, fit.clientWidth / sheet.offsetWidth);
      sheet.style.transform = `scale(${scale})`;
      fit.style.height = `${sheet.offsetHeight * scale}px`;
    };

    const beforePrint = () => {
      document.title = FILE_NAME;
    };
    const afterPrint = () => {
      document.title = "Adnan Sami — CV | adnanzeros";
    };

    fitSheet();
    window.addEventListener("resize", fitSheet);
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("resize", fitSheet);
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, []);

  async function downloadCv() {
    setDownloading(true);
    setNote("");
    try {
      const response = await fetch("/api/cv", { cache: "no-store" });
      if (
        !response.ok ||
        !(response.headers.get("content-type") || "").includes("pdf")
      ) {
        throw new Error("PDF download is unavailable.");
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${FILE_NAME}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
      setNote("Your CV is downloading.");
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
          <img src="/favicon.svg" alt="" width="26" height="26" />
          adnanzeros
        </Link>
        <Link href="/" className="back">
          &larr; Back<span className="long"> to portfolio</span>
        </Link>
      </header>

      <main className="stage">
        <h1 className="ui">My CV</h1>
        <p className="sub ui">
          Preview below. You can download the one-page PDF with the button under
          the CV.
        </p>

        <div className="fit" id="fit" ref={fitRef}>
          <article
            className="sheet"
            id="sheet"
            ref={sheetRef}
            aria-label="Curriculum vitae of Adnan Sami"
          >
            <header className="head">
              <div>
                <h1>Adnan Sami</h1>
                <p className="role">
                  Junior Frontend &amp; Backend Developer &middot; Web Designer
                  &middot; Digital Creator
                </p>
                <div className="contact">
                  <a href="mailto:asadnanzeros@gmail.com">
                    <svg className="i"><use href="#i-mail" /></svg>
                    <b>asadnanzeros@gmail.com</b>
                  </a>
                  <span>
                    <svg className="i"><use href="#i-pin" /></svg>
                    <b>Faridpur, Dhaka Division, Bangladesh</b>
                  </span>
                  <a href="https://wa.me/8801580327310">
                    <svg className="i"><use href="#i-chat" /></svg>
                    <b>+880 1580 327310 (WhatsApp)</b>
                  </a>
                  <a href="https://github.com/adnanzeros">
                    <svg className="i"><use href="#i-github" /></svg>
                    <b>github.com/adnanzeros</b>
                  </a>
                  <a href="https://www.linkedin.com/in/adnanzeros/">
                    <svg className="i"><use href="#i-linkedin" /></svg>
                    <b>linkedin.com/in/adnanzeros</b>
                  </a>
                </div>
              </div>
              <div className="photo">
                <img
                  src="/assets/adnan.webp"
                  alt="Adnan Sami"
                  width="920"
                  height="920"
                />
              </div>
            </header>

            <div className="cols">
              <section className="sec profile-section">
                <h2>Profile</h2>
                <p>
                  Junior full-stack web developer and web designer from
                  Faridpur, Bangladesh. I build responsive websites and React
                  apps, design clean interfaces, and make Chrome extensions
                  that solve small everyday problems. I am currently training
                  in AI-driven full-stack web engineering at Programming Hero
                  and I learn by shipping real projects.
                </p>
                <p className="motto">
                  &ldquo;Doing something is better than doing
                  nothing.&rdquo;
                </p>
              </section>

              <section className="sec skills-section">
                <h2>Skills</h2>
                <div className="skill">
                  <b>Languages</b>
                  <span>
                    HTML5, CSS3, JavaScript, TypeScript, Python, PowerShell
                  </span>
                </div>
                <div className="skill">
                  <b>Frontend</b>
                  <span>
                    React, Next.js, React Native, React Router, Vite, Tailwind
                    CSS, WordPress, GSAP, Three.js
                  </span>
                </div>
                <div className="skill">
                  <b>Backend &amp; Cloud</b>
                  <span>
                    Node.js, Vercel, Netlify, Firebase, Google Cloud, Resend
                  </span>
                </div>
                <div className="skill">
                  <b>Tools &amp; Design</b>
                  <span>Git, GitHub, npm, Figma, Canva, Adobe XD, Blender</span>
                </div>
              </section>

              <section className="sec projects-section">
                <h2>Projects</h2>
                <div className="item">
                  <div className="row">
                    <h3>TimeMate: Screen Time Coach</h3>
                    <span className="meta">JavaScript &middot; Chrome APIs</span>
                  </div>
                  <p>
                    Tracks tab time, blocks sites, sends reminders; includes
                    Focus Mode.
                  </p>
                  <a
                    className="lnk"
                    href="https://github.com/adnanzeros/screen-time-coach"
                  >
                    github.com/adnanzeros/screen-time-coach
                  </a>
                </div>
                <div className="item">
                  <div className="row">
                    <h3>DevStack</h3>
                    <span className="meta">React &middot; Vite &middot; CSS</span>
                  </div>
                  <p>
                    Explore technologies and compose a personalized React tech
                    stack.
                  </p>
                  <a
                    className="lnk"
                    href="https://github.com/adnanzeros/Assignment-5"
                  >
                    github.com/adnanzeros/Assignment-5
                  </a>
                </div>
                <div className="item">
                  <div className="row">
                    <h3>Shuru Kori Online</h3>
                    <span className="meta">Web &middot; Platform</span>
                  </div>
                  <p>
                    Learning platform featuring live sessions and practical
                    work.
                  </p>
                  <a className="lnk" href="https://shurukori.online/">
                    shurukori.online
                  </a>
                </div>
                <div className="item">
                  <div className="row">
                    <h3>Personal Portfolio (adnanzeros)</h3>
                    <span className="meta">
                      Next.js &middot; GSAP &middot; Resend
                    </span>
                  </div>
                  <p>
                    Next.js portfolio with GSAP scroll animations; Resend
                    contact API.
                  </p>
                  <a className="lnk" href="https://github.com/adnanzeros">
                    github.com/adnanzeros
                  </a>
                </div>
              </section>

              <section className="sec education-section">
                <h2>Education &amp; Training</h2>
                <div className="item edu">
                  <div>
                    <div className="row">
                      <h3>AI-Driven Full Stack Web Engineering</h3>
                      <span className="meta">Ongoing</span>
                    </div>
                    <p>
                      Programming Hero &middot; Batch 14
                      <br />
                      Student ID:{" "}
                      <span style={{ whiteSpace: "nowrap" }}>WEB14-0865</span>
                    </p>
                  </div>
                </div>
                <div className="item edu">
                  <div>
                    <div className="row">
                      <h3>Higher Secondary Certificate (HSC)</h3>
                      <span className="meta">Completed</span>
                    </div>
                    <p>Government Yasin College, Faridpur, Bangladesh</p>
                  </div>
                </div>
              </section>

              <section className="sec personal-section">
                <h2>Personal Details</h2>
                <dl className="dl">
                  <dt>Nationality</dt>
                  <dd>Bangladeshi</dd>
                  <dt>Religion</dt>
                  <dd>Muslim</dd>
                  <dt>Location</dt>
                  <dd>Faridpur, Bangladesh</dd>
                </dl>
              </section>
            </div>
          </article>
        </div>

        <div className="actions ui">
          <button
            className="btn solid"
            type="button"
            disabled={downloading}
            onClick={downloadCv}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <use href="#i-download" />
            </svg>
            <span>{downloading ? "Preparing PDF…" : "Download CV (PDF)"}</span>
          </button>
          <button className="btn" type="button" onClick={() => window.print()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <use href="#i-open" />
            </svg>
            <span>Print</span>
          </button>
        </div>
        <p className="note ui" role="status" aria-live="polite">
          {note}
        </p>
      </main>

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <symbol id="i-mail" viewBox="0 0 24 24">
          <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </symbol>
        <symbol id="i-phone" viewBox="0 0 24 24">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
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
