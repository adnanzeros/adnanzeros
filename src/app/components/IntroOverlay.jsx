"use client";

import { gsap } from "gsap";
import { useLayoutEffect, useRef, useState } from "react";
import styles from "./IntroOverlay.module.css";

const SESSION_KEY = "adnanzeros-intro-completed-v5";
const HERO_ONLY_CLASS = "introHeroOnly";
const WORDS = [
  "I",
  "LOVE",
  "CODING",
  "I BUILD",
  "WEBSITE",
  "WELCOME",
  "TO",
  "ADNAN ZEROS",
];
const WORD_DURATION = 0.29;
const WELCOME_START = WORDS.length * WORD_DURATION;
const EXIT_START = 3.05;
const INTRO_DURATION = 3.5;

export default function IntroOverlay() {
  const rootRef = useRef(null);
  const [finished, setFinished] = useState(false);

  useLayoutEffect(() => {
    const overlay = rootRef.current;
    if (!overlay) return;

    try {
      if (
        document.documentElement.hasAttribute("data-intro-completed") ||
        window.sessionStorage.getItem(SESSION_KEY)
      ) {
        setFinished(true);
        return;
      }
    } catch (error) {
      console.warn("Intro session storage is unavailable; the intro will play.", error);
    }

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
        (element) => element.id !== "home" && element.tagName !== "SCRIPT",
      ),
    ];
    const completeIntro = () => {
      page.classList.remove(HERO_ONLY_CLASS);
      document.documentElement.setAttribute("data-intro-completed", "");
      try {
        window.sessionStorage.setItem(SESSION_KEY, "played");
      } catch (error) {
        console.warn("Intro completion could not be saved for this tab.", error);
      }
      setFinished(true);
    };

    if (reducedMotion) {
      completeIntro();
      return;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.inOut" },
        onComplete: completeIntro,
      });

      gsap.to(robot, {
        y: -6,
        duration: 0.6,
        delay: 0.45,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      gsap.to(eyes, {
        scaleY: 0.08,
        duration: 0.09,
        repeat: -1,
        repeatDelay: 1.15,
        yoyo: true,
        transformOrigin: "50% 50%",
      });
      gsap.to(glow, {
        scale: 1.08,
        opacity: 0.65,
        duration: 1,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      timeline.fromTo(
        robot,
        { autoAlpha: 0, scale: 0.9, y: 16 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.42 },
        0,
      );

      words.forEach((word, index) => {
        const start = index * WORD_DURATION;
        timeline
          .fromTo(
            word,
            { autoAlpha: 0, y: 12, filter: "blur(4px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.09 },
            start,
          )
          .to(
            word,
            { autoAlpha: 0, y: -9, filter: "blur(2px)", duration: 0.08 },
            start + 0.21,
          )
          .fromTo(
            indicators[index],
            { autoAlpha: 0.35, scale: 0.8 },
            { autoAlpha: 1, scale: 1.35, duration: 0.1 },
            start,
          )
          .to(
            indicators[index],
            { autoAlpha: 0.35, scale: 0.8, duration: 0.08 },
            start + 0.21,
          )
          .call(
            () => overlay.setAttribute("aria-label", WORDS[index]),
            [],
            start,
          );
      });

      timeline
        .fromTo(
          welcome,
          { autoAlpha: 0, y: 14, filter: "blur(4px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.18 },
          WELCOME_START,
        )
        .call(
          () => overlay.setAttribute("aria-label", "WELCOME TO MY WORLD"),
          [],
          WELCOME_START,
        )
        .call(
          () => {
            page.classList.add(HERO_ONLY_CLASS);
            overlay.style.pointerEvents = "none";
          },
          [],
          EXIT_START,
        )
        .to(
          overlay,
          { autoAlpha: 0, duration: INTRO_DURATION - EXIT_START },
          EXIT_START,
        )
        .set(revealTargets, { autoAlpha: 0 }, EXIT_START)
        .to(
          revealTargets,
          {
            autoAlpha: 1,
            duration: INTRO_DURATION - EXIT_START,
            ease: "power2.out",
            overwrite: true,
          },
          EXIT_START,
        );

      const elapsed = performance.now() / 1000;
      if (elapsed >= INTRO_DURATION) {
        completeIntro();
      } else {
        timeline.timeScale(INTRO_DURATION / (INTRO_DURATION - elapsed)).play(0);
      }
    }, overlay);

    return () => {
      page.classList.remove(HERO_ONLY_CLASS);
      overlay.style.pointerEvents = "";
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
      aria-label="I"
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
