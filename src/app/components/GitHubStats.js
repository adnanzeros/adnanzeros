import GitHubRadarChart from "./GitHubRadarChart";
import LanguageRingChart from "./LanguageRingChart";

export default function GitHubStats({ stats, languages }) {
  return (
    <section id="github" className="wrap">
      <h2>GitHub </h2>
      <div className="stats">
        {stats ? (
          <GitHubRadarChart stats={stats} />
        ) : (
          <article className="github-chart-card">
            <h3>GitHub stats</h3>
            <p className="github-chart-subtitle" role="status">
              GitHub stats are temporarily unavailable.
            </p>
          </article>
        )}
        <LanguageRingChart languages={languages} />
      </div>
      <a
        className="btn"
        href="https://github.com/adnanzeros"
        target="_blank"
        rel="me noopener"
      >
        github.com/adnanzeros
      </a>
    </section>
  );
}
