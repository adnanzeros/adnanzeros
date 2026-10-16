const BASE_URL = "https://adnanzeros.vercel.app";
const LAST_MODIFIED = new Date("2026-10-15");

export default function sitemap() {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/cv`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
