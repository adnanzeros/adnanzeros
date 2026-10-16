import GitHubRadarChart from "./GitHubRadarChart";
import LanguageRingChart from "./LanguageRingChart";

export default function GitHubStats({ stats, languages }) {
  return (
    <section id="github" className="wrap">
      <h2>GitHub stats</h2>
      <div className="stats">
        <GitHubRadarChart stats={stats} />
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
