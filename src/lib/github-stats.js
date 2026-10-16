import { readFile } from "node:fs/promises";
import path from "node:path";

const colors = {
  CSS: "#663399",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  Python: "#3572a5",
  Java: "#b07219",
  Shell: "#89e051",
  Vue: "#41b883",
};
const palette = ["#5ee7ff", "#8ea2ff", "#88ce02", "#ff9d6e", "#d987ff"];

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16)),
    );
}

export async function getGithubLanguages() {
  const source = path.join(
    process.cwd(),
    "public",
    "profile",
    "top-langs.svg",
  );
  const svg = await readFile(source, "utf8");
  const entries = [];

  for (const match of svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/gi)) {
    const label = decodeEntities(match[1].replace(/<[^>]+>/g, "").trim());
    const language = label.match(/^(.+?)\s+(\d+(?:\.\d+)?)%$/);
    if (!language) continue;
    const name = language[1].trim();
    const value = Number(language[2]);
    if (value >= 0 && Number.isFinite(value)) {
      entries.push({
        label: name,
        value,
        maxValue: 100,
        color: colors[name] || palette[entries.length % palette.length],
      });
    }
  }

  if (!entries.length) {
    throw new Error(
      `No language percentages were found in ${path.relative(process.cwd(), source)}.`,
    );
  }

  return entries;
}

const statsFields = {
  stars: /Total\s+Stars\s+Earned\s*:\s*([\d,]+(?:\.\d+)?)/i,
  commits: /Total\s+Commits\s*\(last year\)\s*:\s*([\d,]+(?:\.\d+)?)/i,
  prs: /Total\s+PRs\s*:\s*([\d,]+(?:\.\d+)?)/i,
  issues: /Total\s+Issues\s*:\s*([\d,]+(?:\.\d+)?)/i,
  contribs: /Contributed\s+to\s*\(last year\)\s*:\s*([\d,]+(?:\.\d+)?)/i,
};

function parseStatValue(value) {
  if (!value) return null;
  const number = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function getDataTestIdValue(svg, testId) {
  const escapedId = testId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = svg.match(
    new RegExp(
      `<text\\b(?=[^>]*\\bdata-testid=["']${escapedId}["'])[^>]*>([\\s\\S]*?)<\\/text>`,
      "i",
    ),
  );
  if (!match) return null;

  const text = decodeEntities(match[1].replace(/<[^>]+>/g, "").trim());
  return parseStatValue(text);
}

export function parseGithubStats(svg, source = "public/profile/stats.svg") {
  const description = svg.match(/<desc\b[^>]*>([\s\S]*?)<\/desc>/i)?.[1] ?? "";
  const descText = decodeEntities(description.replace(/<[^>]+>/g, "").trim());
  const stats = {};

  for (const [key, fallbackPattern] of Object.entries(statsFields)) {
    const dataTestIdValue = getDataTestIdValue(svg, key);
    const fallbackMatch = descText.match(fallbackPattern);
    const fallbackValue = parseStatValue(fallbackMatch?.[1]);
    const value = dataTestIdValue ?? fallbackValue;

    if (value !== null) stats[key] = value;
  }

  const missingFields = Object.keys(statsFields).filter(
    (key) => stats[key] === undefined,
  );
  if (missingFields.length) {
    throw new Error(`Could not read GitHub stats (${missingFields.join(", ")}) from ${source}.`);
  }

  return stats;
}

export async function getGithubStats() {
  const source = path.join(process.cwd(), "public", "profile", "stats.svg");
  const svg = await readFile(source, "utf8");
  return parseGithubStats(
    svg,
    path.relative(process.cwd(), source),
  );
}
