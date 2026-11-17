'use client';

import { useEffect, useMemo, useState } from 'react';
import '../work-focus.css';

/* "all" prothome, tarpor 3 ta category */
const tabs = [
  ['all', 'All'],
  ['frontend', 'Frontend'],
  ['backend', 'Backend'],
  ['tools', 'Extensions'],
];
const labels = Object.fromEntries(tabs);

/* projects: { frontend: [...], backend: [...], tools: [...] } (page.js DB theke dey) */
export default function Projects({ projects }) {
  const [category, setCategory] = useState('all');
  const [focusId, setFocusId] = useState('');

  /* All tab: sob work, admin e jei order e ache sei order e */
  const everything = useMemo(
    () =>
      [
        ...(projects.frontend || []),
        ...(projects.backend || []),
        ...(projects.tools || []),
      ].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)),
    [projects],
  );
  const cards = category === 'all' ? everything : projects[category] || [];

  /* Admin panel er link: /?category=backend&work=<id>#my-work
     ekhane ese oi category tab khule oi work ta highlight kore dey. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wantedCategory = params.get('category');
    const workId = params.get('work');
    if (!wantedCategory && !workId) return;

    const found = workId
      ? everything.find(project => String(project.id) === workId)
      : null;
    const next = tabs.some(([id]) => id === wantedCategory)
      ? wantedCategory
      : found?.category;
    if (next) setCategory(next);
    if (found) setFocusId(String(found.id));
    // shudhu page khulle ekbar cholbe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!focusId) return undefined;
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const scrollTimer = setTimeout(() => {
      const card = document.querySelector(
        `[data-work-id="${CSS.escape(focusId)}"]`,
      );
      if (card) {
        card.scrollIntoView({
          behavior: reduce ? 'auto' : 'smooth',
          block: 'center',
        });
      }
    }, 450);
    const clearTimer = setTimeout(() => setFocusId(''), 3600);
    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [focusId]);

  return (
    <section id="my-work" className="wrap">
      <h2>My Work</h2>
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
          const id = String(project.id || project.name);
          return (
            <article
              className={`card${focusId === id ? ' hl' : ''}`}
              style={{ '--i': index }}
              key={id}
              data-work-id={id}
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
                {String(index + 1).padStart(2, '0')}
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
                  {category === 'all' && labels[project.category] && (
                    <span className="cat">{labels[project.category]}</span>
                  )}
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
