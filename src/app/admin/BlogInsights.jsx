// FILE: adnanzeros/adnanzeros/src/app/admin/BlogInsights.jsx  (NOTUN file)
'use client';

/* Dashboard e blog analytics: total post, views, 7-din er chart, "sob cheye beshi pora" list */
import { useState } from 'react';

export const fmtTime = seconds => {
  const s = Math.round(Number(seconds) || 0);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

const lastSevenDays = () => {
  const t = new Date();
  const start = Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start - (6 - i) * 86400000);
    return {
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, {
        weekday: 'short',
        timeZone: 'UTC',
      }),
    };
  });
};

export default function BlogInsights({ blog, Icon }) {
  const [sortBy, setSortBy] = useState('views');
  const days = lastSevenDays();
  const maxDay = Math.max(1, ...days.map(d => blog.viewsPerDay?.[d.key] || 0));
  const weekViews = days.reduce(
    (n, d) => n + (blog.viewsPerDay?.[d.key] || 0),
    0,
  );
  const list = sortBy === 'views' ? blog.topByViews : blog.topByTime;
  const top = Math.max(
    1,
    ...list.map(p => (sortBy === 'views' ? p.views : p.totalSeconds)),
  );

  return (
    <div className="adm-dashboard-grid adm-blog-insights">
      <section className="adm-panel">
        <div className="adm-section-heading">
          <div>
            <p className="adm-eyebrow">BLOG TRAFFIC</p>
            <h2>Views this week</h2>
          </div>
          <span className="adm-chart-total">{weekViews} views</span>
        </div>
        <div className="adm-chart" role="img" aria-label="Blog views per day">
          {days.map(day => {
            const value = blog.viewsPerDay?.[day.key] || 0;
            return (
              <div className="adm-chart-column" key={day.key}>
                <span className="adm-chart-value">{value || ''}</span>
                <div className="adm-chart-track">
                  <span
                    style={{
                      height: `${Math.max(7, (value / maxDay) * 100)}%`,
                    }}
                  />
                </div>
                <span className="adm-chart-label">{day.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="adm-panel">
        <div className="adm-section-heading">
          <div>
            <p className="adm-eyebrow">MOST READ</p>
            <h2>Top blog posts</h2>
          </div>
          <div className="adm-seg" role="group" aria-label="Sort posts">
            {[
              ['views', 'Views'],
              ['time', 'Read time'],
            ].map(([v, l]) => (
              <button
                key={v}
                type="button"
                className={sortBy === v ? 'adm-seg-on' : ''}
                onClick={() => setSortBy(v)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        {list.length ? (
          <ol className="adm-top-list">
            {list.map((p, i) => {
              const main = sortBy === 'views' ? p.views : p.totalSeconds;
              return (
                <li key={p.id}>
                  <span className="adm-top-rank">{i + 1}</span>
                  <div className="adm-top-body">
                    <div className="adm-top-line">
                      <a
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {p.title}
                      </a>
                      <strong>
                        {sortBy === 'views'
                          ? `${p.views} views`
                          : fmtTime(p.totalSeconds)}
                      </strong>
                    </div>
                    <span className="adm-meter-track">
                      <span style={{ width: `${(main / top) * 100}%` }} />
                    </span>
                    <small>
                      {sortBy === 'views'
                        ? `avg read ${fmtTime(p.avgSeconds)}`
                        : `${p.views} views · avg ${fmtTime(p.avgSeconds)}`}
                      {' · '}
                      {p.category}
                    </small>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="adm-empty-inline">
            <Icon name="blog" size={16} /> No reads yet. Numbers appear after
            visitors open a post.
          </p>
        )}
      </section>
    </div>
  );
}
