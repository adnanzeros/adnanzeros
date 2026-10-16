"use client";

import { MotionConfig, useReducedMotion } from "motion/react";
import { Ring } from "@/components/charts/ring";
import { RingCenter } from "@/components/charts/ring-center";
import { RingChart } from "@/components/charts/ring-chart";

function formatPercent(value) {
  return `${value}%`;
}

export default function LanguageRingChart({ languages }) {
  const prefersReducedMotion = useReducedMotion();
  const animate = prefersReducedMotion === false;

  return (
    <article className="github-chart-card language-card">
      <h3>Most used languages</h3>
      <div className="language-chart">
        <MotionConfig reducedMotion="user">
          <RingChart data={languages}>
            {languages.map((language, index) => (
              <Ring
                key={language.label}
                index={index}
                animate={animate}
              />
            ))}
            <RingCenter defaultLabel="Most used" />
          </RingChart>
        </MotionConfig>
      </div>
      <ul className="language-legend" aria-label="Most used languages">
        {languages.map((language) => (
          <li key={language.label}>
            <span className="language-key">
              <i
                style={{ "--language-color": language.color }}
                aria-hidden="true"
              />
              {language.label}
            </span>
            <span>{formatPercent(language.value)}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
