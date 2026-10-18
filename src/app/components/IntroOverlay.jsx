"use client";

import { gsap } from "gsap";
import { useLayoutEffect, useRef, useState } from "react";
import styles from "./IntroOverlay.module.css";

const HERO_ONLY_CLASS = "introHeroOnly";
const WORDS = ["I", "LOVE", "CODING", "I BUILD","WEBSITE","WELCOME", "TO", "ADNAN ZEROS"];

export default function IntroOverlay() {
  const rootRef = useRef(null);
  const [finished, setFinished] = useState(false);

  useLayoutEffect(() => {
    const overlay = rootRef.current;
    if (!overlay) return;

    const words = gsap.utils.toArray("[data-intro-word]", overlay);
    const indicators = gsap.utils.toArray("[data-intro-indicator]", overlay);
    const robot = overlay.querySelector("[data-intro-robot]");
    const eyes = overlay.querySelector("[data-intro-eyes]");
    const glow = overlay.querySelector("[data-intro-glow]");
    const welcome = overlay.querySelector("[data-intro-welcome]");
    const page = document.body;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const revealTargets = [
      ...Array.from(page.children).filter(
        (element) =>
          element !== overlay &&
          element.tagName !== "MAIN" &&
          element.tagName !== "SCRIPT",
      ),
      ...Array.from(document.querySelector("main")?.children ?? []).filter(
        (element) => element.id !== "home",
      ),
    ];

    const context = gsap.context(() => {
      const float = gsap.to(robot, {
        y: -7,
        duration: 2.6,
        delay: 0.9,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to(eyes, {
        scaleY: reducedMotion ? 1 : 0.08,
        duration: reducedMotion ? 0 : 0.09,
        repeat: reducedMotion ? 0 : -1,
        repeatDelay: 3.4,
        yoyo: !reducedMotion,
        transformOrigin: "50% 50%",
      });
      gsap.to(glow, {
        scale: reducedMotion ? 1 : 1.08,
        opacity: reducedMotion ? 0.45 : 0.65,
        duration: reducedMotion ? 0 : 2.4,
        ease: "sine.inOut",
        repeat: reducedMotion ? 0 : -1,
        yoyo: !reducedMotion,
      });

      const fadeTime = reducedMotion ? 0.12 : 0.42;
      const timeline = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          page.classList.remove(HERO_ONLY_CLASS);
          setFinished(true);
        },
      });

      timeline
        .fromTo(
          robot,
          { autoAlpha: 0, scale: 0.9, y: 18 },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: reducedMotion ? 0.18 : 0.8,
          },
        )
        .fromTo(
          words[0],
          { autoAlpha: 0, y: 16, filter: "blur(5px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: fadeTime },
          "-=0.28",
        )
        .fromTo(
          indicators[0],
          { autoAlpha: 0.35, scale: 0.8 },
          { autoAlpha: 1, scale: 1.35, duration: 0.2 },
          "<",
        )
        .call(() => overlay.setAttribute("aria-label", WORDS[0]));

      for (let index = 1; index < words.length; index += 1) {
        timeline
          .to(
            words[index - 1],
            {
              autoAlpha: 0,
              y: -13,
              filter: "blur(3px)",
              duration: fadeTime,
            },
            `+=${reducedMotion ? 0.04 : 0.38}`,
          )
          .to(
            indicators[index - 1],
            { autoAlpha: 0.35, scale: 0.8, duration: 0.16 },
            "<",
          )
          .fromTo(
            words[index],
            { autoAlpha: 0, y: 15, filter: "blur(4px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: fadeTime },
          )
          .fromTo(
            indicators[index],
            { autoAlpha: 0.35, scale: 0.8 },
            { autoAlpha: 1, scale: 1.35, duration: 0.2 },
            "<",
          )
          .call(() => overlay.setAttribute("aria-label", WORDS[index]));
      }

      timeline
        .to(
          words[words.length - 1],
          {
            autoAlpha: 0,
            y: -12,
            filter: "blur(3px)",
            duration: fadeTime,
          },
          `+=${reducedMotion ? 0.08 : 0.52}`,
        )
        .fromTo(
          welcome,
          { autoAlpha: 0, y: 16, filter: "blur(5px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: fadeTime },
        )
        .call(() =>
          overlay.setAttribute("aria-label", "WELCOME TO MY WORLD"),
        )
        .to({}, { duration: reducedMotion ? 0.25 : 1.3 })
        .call(() => page.classList.add(HERO_ONLY_CLASS))
        .to(overlay, {
          autoAlpha: 0,
          duration: reducedMotion ? 0.18 : 0.72,
          ease: "power2.inOut",
        })
        .to({}, { duration: reducedMotion ? 0.12 : 0.65 })
        .call(() => {
          gsap.set(revealTargets, { autoAlpha: 0 });
          page.classList.remove(HERO_ONLY_CLASS);
        })
        .to(revealTargets, {
          autoAlpha: 1,
          duration: reducedMotion ? 0.18 : 0.7,
          ease: "power2.out",
          stagger: reducedMotion ? 0 : 0.06,
          overwrite: true,
        });

      if (reducedMotion) float.kill();
    }, overlay);

    return () => {
      page.classList.remove(HERO_ONLY_CLASS);
      context.revert();
    };
  }, []);

  if (finished) return null;

  return (
    <div
      ref={rootRef}
      className={styles.intro}
      data-intro-overlay
      role="status"
      aria-live="polite"
      aria-label="Welcome to Adnan Zeros"
    >
      <div className={styles.content}>
        <div className={styles.robot} data-intro-robot aria-hidden="true">
          <span className={styles.robotOrbit} />
          <svg
            className={styles.robotSvg}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M60 13V25"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="60" cy="9" r="3.5" fill="currentColor" />
            <rect
              x="24"
              y="27"
              width="72"
              height="64"
              rx="23"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <path
              d="M32 45Q32 35 42 35H78Q88 35 88 45V73Q88 83 78 83H42Q32 83 32 73V45Z"
              fill="currentColor"
              fillOpacity="0.045"
            />
            <g data-intro-eyes>
              <rect x="40" y="48" width="10" height="16" rx="5" fill="currentColor" />
              <rect x="70" y="48" width="10" height="16" rx="5" fill="currentColor" />
            </g>
            <path
              d="M51 73H69"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.72"
            />
            <path
              d="M24 49H17V68H24M96 49H103V68H96"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M44 97V103M76 97V103M38 106H82"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <span className={styles.robotGlow} data-intro-glow />
        </div>

        <p className={styles.kicker}>ADNAN ZEROS · DIGITAL PORTFOLIO</p>
        <div className={styles.wordStage} aria-live="off">
          <h1 className={styles.word} aria-hidden="true">
            {WORDS.map((word, index) => (
              <span
                key={word}
                className={`${styles.wordItem} ${
                  index === WORDS.length - 1 ? styles.brandWord : ""
                }`}
                data-intro-word
              >
                {word}
              </span>
            ))}
            <span
              className={`${styles.wordItem} ${styles.welcomeWord}`}
              data-intro-welcome
            >
              WELCOME TO MY WORLD
            </span>
          </h1>
        </div>

        <div className={styles.indicator} aria-hidden="true">
          {WORDS.map((word) => (
            <span
              key={word}
              className={styles.dot}
              data-intro-indicator
            />
          ))}
        </div>
        <span className={styles.caption}>A CREATIVE DEVELOPER EXPERIENCE</span>
      </div>
    </div>
  );
}
