"use client";

import { useEffect, useState } from "react";

const projects = {
  frontend: [
    {
      name: "Shuru Kori Online",
      description: "Learning and guidance platform with live sessions and practical work.",
      tags: ["Web", "Platform"],
      url: "https://shurukori.online/",
    },
    {
      name: "DevStack",
      description: "React tech stack builder. Explore technologies and compose your own stack.",
      tags: ["React", "Vite", "CSS"],
      url: "https://sparkling-chaja-0c0966.netlify.app/",
    },
    {
      name: "batch-14-assignment-1",
      description: "Responsive layout assignment built with HTML and CSS.",
      tags: ["HTML", "CSS"],
      url: "https://github.com/adnanzeros/batch-14-assignment-1",
    },
  ],
  backend: [
    {
      name: "Contact API (this site)",
      description:
        "Serverless function that validates messages and emails them through Resend. Keys stay in .env.local.",
      tags: ["Node.js", "Vercel", "Resend"],
      url: "https://github.com/adnanzeros",
    },
  ],
  tools: [
    {
      name: "TimeMate: Screen Time Coach",
      description:
        "Chrome extension (Manifest V3) that tracks tab time, sends reminders, blocks sites and has a Focus Mode.",
      tags: ["JavaScript", "Chrome APIs"],
      url: "https://github.com/adnanzeros/screen-time-coach",
    },
  ],
};

const tabs = [
  ["frontend", "Frontend"],
  ["backend", "Backend"],
  ["tools", "Extensions"],
];

export default function Projects() {
  const [category, setCategory] = useState("frontend");
  const cards = projects[category];

  useEffect(() => {
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let frame = 0;
    const paintStack = () => {
      frame = 0;
      const elements = [...document.querySelectorAll("#projgrid .card")];
      elements.forEach((card, index) => {
        const next = elements[index + 1];
        if (!next) {
          card.style.setProperty("--dim", "0");
          card.style.transform = "";
          return;
        }
        const top = parseFloat(getComputedStyle(card).top) || 72;
        const nextTop = parseFloat(getComputedStyle(next).top) || top;
        const startY = top + card.offsetHeight;
        const progress = Math.min(
          1,
          Math.max(
            0,
            (startY - next.getBoundingClientRect().top) / (startY - nextTop || 1),
          ),
        );
        card.style.setProperty("--dim", (progress * 0.65).toFixed(3));
        card.style.transform = progress
          ? `scale(${(1 - progress * 0.06).toFixed(4)})`
          : "";
      });
    };
    const schedulePaint = () => {
      if (!frame) frame = requestAnimationFrame(paintStack);
    };

    window.addEventListener("scroll", schedulePaint, { passive: true });
    window.addEventListener("resize", schedulePaint);
    schedulePaint();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedulePaint);
      window.removeEventListener("resize", schedulePaint);
    };
  }, [category]);

  function tiltCard(event) {
    if (!matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg)`;
    card.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
    card.style.setProperty("--my", `${event.clientY - bounds.top}px`);
  }

  return (
    <section id="projects" className="wrap">
      <h2>Projects</h2>
      <div className="tabs" role="tablist" aria-label="Project categories">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={category === id}
            className={category === id ? "on" : ""}
            onClick={() => setCategory(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid3" id="projgrid" role="tabpanel">
        {cards.map((project, index) => (
          <a
            className="card"
            style={{ "--i": index }}
            key={project.name}
            href={project.url}
            target="_blank"
            rel="noopener"
            onPointerMove={tiltCard}
            onPointerLeave={event => {
              event.currentTarget.style.transform = "";
            }}
          >
            <span className="num" aria-hidden="true">
              0{index + 1}
            </span>
            <div className="cbody">
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className="chips">
                {project.tags.map(tag => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <span className="go" aria-hidden="true">
              &#8599;
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
