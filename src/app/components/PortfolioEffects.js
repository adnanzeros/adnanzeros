"use client";

import { useEffect } from "react";

function loadScript(source) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-portfolio="${source}"]`);
    if (existing?.dataset.loaded === "true") return resolve();
    const script = existing || document.createElement("script");
    if (!existing) {
      script.src = source;
      script.async = true;
      script.dataset.portfolio = source;
      document.body.appendChild(script);
    }
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => reject(new Error(`Could not load animation library ${source}.`)),
      { once: true },
    );
    if (existing && window.gsap && source.includes("gsap.min.js")) resolve();
    if (existing && window.ScrollTrigger && source.includes("ScrollTrigger.min.js"))
      resolve();
  });
}

export default function PortfolioEffects() {
  useEffect(() => {
    let cancelled = false;
    let cleanup;

    async function initialize() {
      try {
        await loadScript("/vendor/gsap.min.js");
        await loadScript("/vendor/ScrollTrigger.min.js");
      } catch (error) {
        console.error("Portfolio animations could not be initialized.", error);
        return;
      }
      if (cancelled) return;

      const { gsap, ScrollTrigger } = window;
      if (!gsap || !ScrollTrigger) {
        console.error("Portfolio animation libraries did not expose their expected APIs.");
        return;
      }

      const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const canHover = matchMedia("(hover:hover) and (pointer:fine)").matches;
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });

      if (!reduceMotion) {
        document
          .querySelectorAll(".wrap:not(#about):not(#stack)")
          .forEach(section =>
            gsap.from(section, {
              opacity: 0,
              y: section.id === "projects" ? 0 : 36,
              duration: 0.8,
              ease: "power3.out",
              clearProps: "transform,opacity",
              scrollTrigger: { trigger: section, start: "top 92%", once: true },
            }),
          );
        gsap.utils.toArray(".wrap:not(#about):not(#stack) h2").forEach(heading =>
          gsap.from(heading, {
            scrollTrigger: { trigger: heading, start: "top 88%", once: true },
            x: -30,
            opacity: 0,
            duration: 0.8,
            clearProps: "transform,opacity",
          }),
        );
        gsap.from("#github .stats img", {
          scrollTrigger: { trigger: "#github", start: "top 78%", once: true },
          y: 50,
          opacity: 0,
          stagger: 0.15,
          duration: 0.9,
          clearProps: "transform,opacity",
        });
        gsap.from(".foot > *", {
          scrollTrigger: { trigger: ".foot", start: "top 97%", once: true },
          y: 20,
          opacity: 0,
          stagger: 0.08,
          duration: 0.6,
          clearProps: "transform,opacity",
        });
        if (canHover) {
          gsap.to(".photo", {
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
            y: -50,
            ease: "none",
          });
          gsap.to(".hero-text", {
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
            y: -28,
            ease: "none",
          });
        }
      }
      gsap.to("#bar", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: true },
      });

      let refreshTimer;
      const refresh = () => {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
      };
      window.addEventListener("load", refresh);
      document.fonts?.ready.then(refresh);
      document.querySelectorAll("#github .stats img").forEach(image => {
        image.addEventListener("load", refresh);
      });
      cleanup = () => {
        clearTimeout(refreshTimer);
        window.removeEventListener("load", refresh);
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    }

    initialize();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
