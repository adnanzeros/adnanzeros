"use client";

import { useState } from "react";

const cards = [
  ["GitHub stats for adnanzeros", "/profile/stats.svg"],
  ["Top languages of adnanzeros", "/profile/top-langs.svg"],
];

export default function GitHubStatImages() {
  const [failed, setFailed] = useState([]);

  return cards.map(([alt, source], index) =>
    failed.includes(index) ? null : (
      <img
        key={source}
        loading="lazy"
        decoding="async"
        alt={alt}
        src={failed.includes(`${index}-retry`) ? `${source}?r=1` : source}
        onError={() => {
          if (!failed.includes(`${index}-retry`)) {
            setFailed(current => [...current, `${index}-retry`]);
          } else {
            setFailed(current => [...current, index]);
          }
        }}
      />
    ),
  );
}
