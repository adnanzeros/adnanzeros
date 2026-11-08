'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  DATE_FILTERS,
  categoriesFromPosts,
  formatDateTime,
  matchesDateFilter,
} from '../../lib/blog-utils';
import styles from './blog.module.css';

/* Ek page e koyta post thakbe */
const PER_PAGE = 8;

/* [1, '…', 4, 5, 6, '…', 12] moto page number list */
function pageList(total, current) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current, current - 1, current + 1]);
  const nums = [...set].filter(n => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
}

export default function BlogList({ posts }) {
  const [range, setRange] = useState('all');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const listRef = useRef(null);
  const categories = categoriesFromPosts(posts);

  const visible = posts.filter(
    p =>
      matchesDateFilter(p.publishedAt, range) &&
      (category === 'all' || (p.category || 'General') === category) &&
      `${p.title} ${p.preview || p.excerpt}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const filtered = range !== 'all' || category !== 'all' || query !== '';

  const totalPages = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const shown = visible.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  /* filter badlale abar prothom page e jabe */
  const change = setter => e => {
    setter(e.target.value);
    setPage(1);
  };

  function reset() {
    setRange('all');
    setCategory('all');
    setQuery('');
    setPage(1);
  }

  function goTo(n) {
    setPage(n);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <>
      <div className={styles.tools}>
        <input
          className={styles.search}
          type="search"
          placeholder="Search posts…"
          value={query}
          onChange={change(setQuery)}
          aria-label="Search posts"
        />
        <select
          className={styles.select}
          value={category}
          onChange={change(setCategory)}
          aria-label="Category"
        >
          <option value="all">All categories</option>
          {categories.map(({ name, count }) => (
            <option key={name} value={name}>
              {name} ({count})
            </option>
          ))}
        </select>
        <select
          className={styles.select}
          value={range}
          onChange={change(setRange)}
          aria-label="Sort by date"
        >
          {DATE_FILTERS.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        {filtered && (
          <button type="button" className={styles.reset} onClick={reset}>
            Clear
          </button>
        )}
      </div>

      <div ref={listRef} className={styles.listTop} />

      {shown.length ? (
        <div className={styles.list}>
          {shown.map(post => (
            <Link
              href={`/blog/${post.slug}`}
              className={styles.row}
              key={post.id}
            >
              <div className={styles.thumb}>
                {post.coverImage ? (
                  <img src={post.coverImage} alt="" loading="lazy" />
                ) : (
                  <span className={styles.noCover}>
                    {post.title.slice(0, 1)}
                  </span>
                )}
                <span className={styles.badge}>
                  {post.category || 'General'}
                </span>
              </div>
              <div className={styles.info}>
                <h2>{post.title}</h2>
                {(post.preview || post.excerpt) && (
                  <p className={styles.preview}>
                    {post.preview || post.excerpt}
                  </p>
                )}
                <time className={styles.when} dateTime={post.publishedAt || ''}>
                  {formatDateTime(post.publishedAt)}
                </time>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>
          {posts.length
            ? 'No posts match your filters.'
            : 'No posts yet. Check back soon.'}
        </p>
      )}

      {totalPages > 1 && (
        <nav className={styles.pager} aria-label="Blog pages">
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => goTo(current - 1)}
            disabled={current === 1}
          >
            ← Prev
          </button>
          {pageList(totalPages, current).map((n, i) =>
            n === '…' ? (
              <span key={`gap-${i}`} className={styles.gap} aria-hidden="true">
                …
              </span>
            ) : (
              <button
                type="button"
                key={n}
                className={`${styles.pageBtn} ${
                  n === current ? styles.pageActive : ''
                }`}
                onClick={() => goTo(n)}
                aria-current={n === current ? 'page' : undefined}
              >
                {n}
              </button>
            ),
          )}
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => goTo(current + 1)}
            disabled={current === totalPages}
          >
            Next →
          </button>
        </nav>
      )}
    </>
  );
}
