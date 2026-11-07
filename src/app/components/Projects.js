'use client';

import { useState } from 'react';

const tabs = [
  ['frontend', 'Frontend'],
  ['backend', 'Backend'],
  ['tools', 'Extensions'],
];

/* projects: { frontend: [...], backend: [...], tools: [...] } (page.js DB theke dey) */
export default function Projects({ projects }) {
  const [category, setCategory] = useState('frontend');
  const cards = projects[category] || [];

  return (
    <section id="projects" className="wrap">
      <h2>Projects</h2>
      <div className="tabs" role="tablist" aria-label="Project categories">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={category === id}
            className={category === id ? 'on' : ''}
            onClick={() => setCategory(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid3" id="projgrid" role="tabpanel">
        {cards.length === 0 && <p className="lead">Coming soon.</p>}
        {cards.map((project, index) => {
          const main = project.url || project.repo;
          return (
            <article
              className="card"
              style={{ '--i': index }}
              key={project.id || project.name}
            >
              {project.image && (
                <img
                  className="cimg"
                  src={project.image}
                  alt={`${project.name} preview`}
                  loading="lazy"
                  decoding="async"
                />
              )}
              <span className="num" aria-hidden="true">
                0{index + 1}
              </span>
              <div className="cbody">
                <h3>
                  {main ? (
                    <a
                      className="stretch"
                      href={main}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {project.name}
                    </a>
                  ) : (
                    project.name
                  )}
                </h3>
                <p>{project.description}</p>
                <div className="chips">
                  {(project.tags || []).map(tag => (
                    <span key={tag}>{tag}</span>
                  ))}
                  {project.url && project.repo && (
                    <a
                      className="repo"
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub &#8599;
                    </a>
                  )}
                </div>
              </div>
              {main && (
                <span className="go" aria-hidden="true">
                  &#8599;
                </span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
