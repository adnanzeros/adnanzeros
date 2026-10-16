const circumference = 2 * Math.PI * 43;

export default function LanguageRingChart({ languages }) {
  let offset = 0;
  const segments = languages.map(language => {
    const length = (language.value / 100) * circumference;
    const segment = { ...language, length, offset };
    offset += length;
    return segment;
  });

  return (
    <div className="language-card" aria-label="GitHub language breakdown">
      <h3>Top languages</h3>
      <div className="language-chart">
        <svg
          viewBox="0 0 120 120"
          role="img"
          aria-labelledby="language-chart-title language-chart-description"
        >
          <title id="language-chart-title">GitHub language breakdown</title>
          <desc id="language-chart-description">
            {languages
              .map(language => `${language.name}: ${language.value}%`)
              .join(", ")}
          </desc>
          <circle
            className="language-ring-track"
            cx="60"
            cy="60"
            r="43"
            fill="none"
            strokeWidth="13"
          />
          {segments.map(segment => (
            <circle
              key={segment.name}
              cx="60"
              cy="60"
              r="43"
              fill="none"
              stroke={segment.color}
              strokeWidth="13"
              strokeDasharray={`${segment.length} ${circumference - segment.length}`}
              strokeDashoffset={-segment.offset}
              transform="rotate(-90 60 60)"
            />
          ))}
          <text className="language-ring-label" x="60" y="57" textAnchor="middle">
            Languages
          </text>
          <text className="language-ring-value" x="60" y="72" textAnchor="middle">
            {languages.length} tracked
          </text>
        </svg>
      </div>
      <ul className="language-legend">
        {languages.map(language => (
          <li key={language.name}>
            <span className="language-key">
              <i style={{ "--language-color": language.color }} aria-hidden="true" />
              {language.name}
            </span>
            <span>{language.value}%</span>
          </li>
        ))}
      </ul>
      <p className="language-source">
        Updated from the GitHub language stats generated in this repository.
      </p>
    </div>
  );
}
