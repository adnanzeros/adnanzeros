import { readFile } from "node:fs/promises";
import path from "node:path";

const colors = {
  CSS: "#8b65c1",
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
  const source = path.join(process.cwd(), "profile", "top-langs.svg");
  const svg = await readFile(source, "utf8");
  const entries = [];

  for (const match of svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/gi)) {
    const label = decodeEntities(match[1].replace(/<[^>]+>/g, "").trim());
    const language = label.match(/^(.+?)\s+(\d+(?:\.\d+)?)%$/);
    if (!language) continue;
    const name = language[1].trim();
    const value = Number(language[2]);
    if (value > 0 && Number.isFinite(value)) {
      entries.push({
        name,
        value,
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
