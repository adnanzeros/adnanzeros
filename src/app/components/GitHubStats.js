import GitHubStatImages from "./GitHubStatImages";
import LanguageRingChart from "./LanguageRingChart";

export default function GitHubStats({ languages }) {
  return (
    <section id="github" className="wrap">
      <h2>GitHub stats</h2>
      <div className="stats">
        <GitHubStatImages />
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
