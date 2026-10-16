"use client";

import { useState } from "react";
import { MotionConfig, useReducedMotion } from "motion/react";
import { RadarChart } from "@/components/charts/radar-chart";
import { RadarArea } from "@/components/charts/radar-area";
import { RadarAxis } from "@/components/charts/radar-axis";
import { RadarGrid } from "@/components/charts/radar-grid";
import { RadarLabels } from "@/components/charts/radar-labels";

const metrics = [
  { key: "stars", label: "Stars", title: "Total Stars" },
  { key: "commits", label: "Commits", title: "Total Commits (last year)" },
  { key: "prs", label: "PRs", title: "Total PRs" },
  { key: "issues", label: "Issues", title: "Total Issues" },
  {
    key: "contribs",
    label: "Contributed",
    title: "Contributed to (last year)",
  },
];

const softMaximums = {
  stars: 10,
  commits: 100,
  prs: 20,
  issues: 20,
  contribs: 20,
};

function formatStat(value) {
  return value.toLocaleString("en-US");
}

export default function GitHubRadarChart({ stats }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const prefersReducedMotion = useReducedMotion();
  const animate = prefersReducedMotion === false;
  const plottedValues = Object.fromEntries(
    metrics.map(({ key }) => {
      const normalized = Math.sqrt(stats[key] / softMaximums[key]) * 100;
      return [key, Math.max(12, Math.min(100, normalized))];
    }),
  );
  const data = [
    {
      label: "ADNAN SAMI",
      color: "#5ee7ff",
      values: plottedValues,
    },
  ];

  return (
    <article className="github-chart-card github-radar-card">
      <h3>GitHub stats</h3>
      <p className="github-chart-subtitle">ADNAN SAMI&apos;s GitHub Stats</p>
      <div className="github-radar-plot">
        <MotionConfig reducedMotion="user">
          <RadarChart
            animate={animate}
            className="github-radar-chart"
            data={data}
            margin={68}
            metrics={metrics}
            hoveredIndex={hoveredIndex}
            onHoverChange={setHoveredIndex}
          >
            <RadarGrid showLabels={false} stroke="var(--line2)" />
            <RadarAxis stroke="var(--line2)" />
            <RadarArea index={0} showGlow={animate} />
            <RadarLabels fontSize={10} offset={14} />
          </RadarChart>
        </MotionConfig>
        {hoveredIndex === 0 && (
          <div className="github-radar-tooltip" role="tooltip">
            <strong>ADNAN SAMI&apos;s GitHub Stats</strong>
            <ul>
              {metrics.map(({ key, title }) => (
                <li key={key}>
                  <span>{title}</span>
                  <span>{formatStat(stats[key])}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <ul className="github-radar-values" aria-label="GitHub stats values">
        {metrics.map(({ key, title }) => (
          <li key={key}>
            <span>{title}</span>
            <strong>{formatStat(stats[key])}</strong>
          </li>
        ))}
      </ul>
    </article>
  );
}
